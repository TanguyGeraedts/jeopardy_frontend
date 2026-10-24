"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useBuzzerSounds } from "@/hooks/useBuzzerSounds";
import { useGameSession } from "@/hooks/useGameSession";
import { errorMessage } from "@/lib/api/client";
import { hostControls } from "@/lib/api/sessions";
import { audioUnlocked, subscribeAudioState, unlockAudio } from "@/lib/buzzer-sounds";
import { cn } from "@/lib/cn";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import type { GameSession, GameTeam, SessionClue } from "@/types";
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
    <div className="fixed inset-0 z-40 flex flex-col gap-3 bg-background p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-sm text-white/50">
          Lobby <span className="font-bold text-jeopardy-gold">{session.lobbyCode}</span>
        </p>
        {error && <p role="alert" className="truncate text-sm text-red-300">{error}</p>}
        <div className="flex items-center gap-4">
          <SoundToggle muted={muted} onToggle={() => setMuted((m) => !m)} />
          <Link href={`/quizzes/${quizId}/host/${sessionId}`} className="text-sm text-white/50 hover:text-white">
            Exit board
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <MainArea session={session} sessionId={sessionId} busy={busy} run={run} />
      </div>

      <SessionScoreboard session={session} busy={busy} onJudge={(correct) => run(() => hostControls.judge(sessionId, correct))} />
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
        <p className="text-2xl text-white/60">Join with code</p>
        <p className="font-mono text-[clamp(3rem,12vw,9rem)] font-extrabold tracking-widest text-jeopardy-gold">{session.lobbyCode}</p>
        <p className="text-white/50">The first player to join is the lobby host and starts the game.</p>
      </Centered>
    );
  }
  if (session.state === "GAME_OVER") return <GameOver session={session} />;

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

  return (
    <div
      className="grid h-full gap-2"
      style={{
        gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
        gridTemplateRows: `auto repeat(${rows.length}, minmax(0, 1fr))`,
      }}
    >
      {categories.map(([name]) => (
        <div key={name} className="flex min-h-16 items-center justify-center rounded-lg bg-jeopardy-board px-2 py-3 text-center text-[clamp(0.8rem,1.6vw,1.4rem)] font-extrabold uppercase tracking-wide">
          <span className="line-clamp-2">{name}</span>
        </div>
      ))}

      {rows.flatMap((value) =>
        categories.map(([name, clues]) => {
          const clue = clues.find((c) => c.value === value);
          if (!clue || clue.revealed) return <div key={`${value}:${name}`} aria-hidden className="rounded-lg bg-white/5" />;
          return (
            <button
              key={clue.id}
              type="button"
              disabled={disabled}
              onClick={() => onPick(clue)}
              aria-label={`${name} for ${value}`}
              className="rounded-lg bg-jeopardy-board text-[clamp(1.5rem,4vw,3.5rem)] font-extrabold text-jeopardy-gold transition enabled:hover:scale-[1.03] enabled:hover:brightness-125 disabled:cursor-wait focus-visible:outline-2 focus-visible:outline-jeopardy-gold"
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

function GameOver({ session }: { session: GameSession }) {
  const ranked = [...session.teams].sort((a, b) => b.score - a.score);
  return (
    <Centered>
      <p className="text-2xl text-white/60">Game over</p>
      <p className="text-[clamp(2.5rem,8vw,6rem)] font-extrabold text-jeopardy-gold">{ranked[0]?.name ?? "Nobody"} wins!</p>
      <ol className="space-y-1 text-xl">
        {ranked.map((team, i) => (
          <li key={team.id} className="tabular-nums">
            {i + 1}. {team.name} &middot; {team.score}
          </li>
        ))}
      </ol>
    </Centered>
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

  const label = muted ? "🔇 Buzzer sound off" : unlocked ? "🔊 Buzzer sound on" : "🔈 Click anywhere to enable sound";
  return (
    <button
      type="button"
      onPointerDown={() => (clickWasUnlock.current = !audioUnlocked())}
      onClick={() => {
        if (clickWasUnlock.current && !muted) return; // this click enabled sound; don't turn it off again
        onToggle();
      }}
      className={cn("text-sm hover:text-white", !muted && !unlocked ? "text-jeopardy-gold" : "text-white/50")}
    >
      {label}
    </button>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl bg-jeopardy-board p-6 text-center">{children}</div>;
}
