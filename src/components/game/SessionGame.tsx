"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CornersIn, CornersOut, SignOut, SpeakerHigh, SpeakerNone, SpeakerX } from "@phosphor-icons/react";
import { useBuzzerSounds } from "@/hooks/useBuzzerSounds";
import { useGameSession } from "@/hooks/useGameSession";
import { errorMessage } from "@/lib/api/client";
import { hostControls } from "@/lib/api/sessions";
import { audioUnlocked, subscribeAudioState, unlockAudio } from "@/lib/buzzer-sounds";
import { cn } from "@/lib/cn";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import type { GameSession, GameTeam, SessionClue } from "@/types";
import { FinalScoreboard } from "./FinalScoreboard";
import { Scoreboard } from "./Scoreboard";
import { SessionClueView } from "./SessionClueView";

/** The backend's teams/players as the scoreboard's teams. */
export function toGameTeams(session: GameSession): GameTeam[] {
  return session.teams.map((team) => ({
    id: team.id,
    name: team.name,
    players: session.players.filter((p) => p.teamId === team.id).map((p) => ({ id: p.id, name: p.name })),
  }));
}

/**
 * The shared screen for a game session: board (or the open clue) on top, teams and scores along the bottom.
 * Everything comes from the backend and updates live; the host drives it from here (pick, open buzzers, judge).
 */
export function SessionGame({ quizId, sessionId }: { quizId: string; sessionId: string }) {
  const { state, apply } = useGameSession(sessionId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  useBuzzerSounds(state.status === "success" ? state.session : null, muted);

  /** Runs a host action and shows its result right away. */
  const run = async (action: () => Promise<GameSession>) => {
    setBusy(true);
    setError(null);
    try {
      apply(await action());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;
  const { session } = state;

  return (
    // Full screen on purpose: it covers the site header so the shared view is just the game.
    <div className="fixed inset-0 z-40 flex flex-col gap-3 bg-studio-night p-[1.2vw]">
      {/* One small, quiet strip: on the stream all attention belongs to the board below. */}
      <div className="flex items-center justify-between gap-4 text-sm text-chalk/60">
        <p>
          Lobby <span className="font-semibold tracking-wider text-chalk">{session.lobbyCode}</span>
        </p>
        {error && <p role="alert" className="truncate text-buzzer-red">{error}</p>}
        <div className="flex items-center gap-5">
          <FullscreenToggle />
          <SoundToggle muted={muted} onToggle={() => setMuted((m) => !m)} />
          <Link href={`/quizzes/${quizId}/host/${sessionId}`} className={STRIP_ITEM}>
            <SignOut weight="bold" aria-hidden />
            Exit board
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <MainArea session={session} sessionId={sessionId} busy={busy} run={run} />
      </div>

      {/* At the end the final scoreboard has every score; a second one along the bottom would only repeat it. */}
      {session.state !== "GAME_OVER" && (
        <SessionScoreboard session={session} busy={busy} onJudge={(correct) => run(() => hostControls.judge(sessionId, correct))} />
      )}
    </div>
  );
}

function MainArea({ session, sessionId, busy, run }: { session: GameSession; sessionId: string; busy: boolean; run: (action: () => Promise<GameSession>) => void }) {
  const activeClue = session.clues.find((c) => c.id === session.activeClueId);

  if (activeClue) {
    return (
      <SessionClueView
        key={activeClue.id}
        session={session}
        clue={activeClue}
        busy={busy}
        onOpenBuzzers={() => run(() => hostControls.openBuzzers(sessionId))}
        onClose={() => run(() => hostControls.closeClue(sessionId))}
      />
    );
  }
  if (session.state === "LOBBY") {
    return (
      <Centered>
        <p className="text-[clamp(1.25rem,2.2vw,2rem)] text-chalk/80">Join the lobby with code</p>
        <p className="font-display text-[clamp(6rem,20vw,18rem)] leading-none tracking-[0.1em] text-gold">{session.lobbyCode}</p>
        <p className="text-[clamp(1rem,1.6vw,1.5rem)] text-chalk/70">The first player to join starts the game.</p>
      </Centered>
    );
  }
  if (session.state === "GAME_OVER") return <FinalScoreboard session={session} />;

  return <SessionBoard session={session} disabled={busy || session.state !== "BOARD_SELECTION"} onPick={(clue) => run(() => hostControls.selectClue(sessionId, clue.id))} />;
}

/** Categories across, point values down, in the order the backend keeps the clues. Played tiles go blank. */
function SessionBoard({ session, disabled, onPick }: { session: GameSession; disabled: boolean; onPick: (clue: SessionClue) => void }) {
  const { categories, rows } = useMemo(() => {
    const byCategory = new Map<string, SessionClue[]>();
    session.clues.forEach((clue) => byCategory.set(clue.category, [...(byCategory.get(clue.category) ?? []), clue]));
    const values = [...new Set(session.clues.map((c) => c.value))].sort((a, b) => a - b);
    return { categories: [...byCategory.entries()], rows: values };
  }, [session.clues]);

  // The show's board: blue tiles separated only by the dark of the studio, no borders (they'd blur on a stream).
  return (
    <div
      className="grid h-full gap-[0.45vw]"
      style={{
        gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
        gridTemplateRows: `auto repeat(${rows.length}, minmax(0, 1fr))`,
      }}
    >
      {categories.map(([name]) => (
        <div
          key={name}
          className="flex min-h-[7vw] items-center justify-center rounded-sm bg-board-blue px-[0.8vw] py-[0.8vw] text-center font-display text-[clamp(1.25rem,2.6vw,3rem)] uppercase leading-[1.05] tracking-wide"
        >
          <span className="line-clamp-2">{name}</span>
        </div>
      ))}

      {rows.flatMap((value) =>
        categories.map(([name, clues]) => {
          const clue = clues.find((c) => c.value === value);
          // A played tile stays a dimmer blue block, like the show: the grid keeps its shape.
          if (!clue || clue.revealed) return <div key={`${value}:${name}`} aria-hidden className="rounded-sm bg-board-blue/30" />;
          return (
            <button
              key={clue.id}
              type="button"
              disabled={disabled}
              onClick={() => onPick(clue)}
              aria-label={`${name} for ${value}`}
              className="rounded-sm bg-board-blue font-display text-[clamp(2.5rem,6.5vw,7rem)] leading-none text-gold transition-[filter] enabled:hover:brightness-125 disabled:cursor-wait"
            >
              {value}
            </button>
          );
        }),
      )}
    </div>
  );
}

function SessionScoreboard({ session, busy, onJudge }: { session: GameSession; busy: boolean; onJudge: (correct: boolean) => void }) {
  const teams = useMemo(() => toGameTeams(session), [session]);
  const scores = Object.fromEntries(session.teams.map((t) => [t.id, t.score]));
  const answeringTeamId = session.players.find((p) => p.id === session.answeringPlayerId)?.teamId ?? undefined;

  return (
    <Scoreboard
      teams={teams}
      scores={scores}
      colours={session.teams.map((t) => t.colour)}
      // On the open clue the head start belongs to clueTurnTeamId; between clues, to whoever is up next.
      turnTeamId={session.activeClueId ? session.clueTurnTeamId : session.turnTeamId}
      clue={
        session.activeClueId
          ? {
              answeringTeamId,
              lockedTeamIds: session.teams.filter((t) => t.lockedOut).map((t) => t.id),
              // The backend judges whoever is answering, so only that team gets ✓ / ✗.
              hasBuzzes: true,
              onCorrect: () => !busy && onJudge(true),
              onWrong: () => !busy && onJudge(false),
            }
          : undefined
      }
    />
  );
}

/**
 * Buzzer sound on/off. Browsers block sound until the page is clicked once, so until then it says so;
 * any click on the board (e.g. picking the first clue) unlocks it. The label follows the browser's real audio state.
 */
function SoundToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  const unlocked = useSyncExternalStore(subscribeAudioState, audioUnlocked, () => false);
  // Set on pointerdown, before the window listener unlocks audio: a click that only unlocks must not also mute.
  const clickWasUnlock = useRef(false);

  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio);
    return () => window.removeEventListener("pointerdown", unlockAudio);
  }, []);

  const [Icon, label] = muted
    ? [SpeakerX, "Buzzer sound off"]
    : unlocked
      ? [SpeakerHigh, "Buzzer sound on"]
      : [SpeakerNone, "Click anywhere to enable sound"];
  return (
    <button
      type="button"
      onPointerDown={() => (clickWasUnlock.current = !audioUnlocked())}
      onClick={() => {
        if (clickWasUnlock.current && !muted) return; // this click enabled sound; don't turn it off again
        onToggle();
      }}
      className={cn(STRIP_ITEM, !muted && !unlocked && "font-semibold text-chalk")}
    >
      <Icon weight="fill" aria-hidden />
      {label}
    </button>
  );
}

/** Fullscreen for the shared tab: hides the browser's address bar and tabs from the Discord stream. */
function FullscreenToggle() {
  const fullscreen = useSyncExternalStore(
    (onChange) => {
      document.addEventListener("fullscreenchange", onChange);
      return () => document.removeEventListener("fullscreenchange", onChange);
    },
    () => document.fullscreenElement !== null,
    () => false,
  );

  return (
    <button
      type="button"
      onClick={() => (fullscreen ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {})}
      className={STRIP_ITEM}
    >
      {fullscreen ? <CornersIn weight="bold" aria-hidden /> : <CornersOut weight="bold" aria-hidden />}
      {fullscreen ? "Exit fullscreen" : "Fullscreen"}
    </button>
  );
}

/** One item in the board's top strip: a small icon before quiet text. */
const STRIP_ITEM = "inline-flex items-center gap-1.5 whitespace-nowrap hover:text-chalk";

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center gap-[1vw] rounded-sm bg-board-blue p-[2vw] text-center">{children}</div>;
}
