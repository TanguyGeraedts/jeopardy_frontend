"use client";

import { useState } from "react";
import { useGameSession } from "@/hooks/useGameSession";
import { errorMessage } from "@/lib/api/client";
import { hostControls } from "@/lib/api/sessions";
import { BUZZER_SOUND_IDS, BUZZER_SOUND_LABELS, buzzerSoundFor, playBuzzerSound } from "@/lib/buzzer-sounds";
import { cn } from "@/lib/cn";
import { sessionTeamStyle } from "@/lib/team-colors";
import { ClueMedia } from "@/components/game/ClueMedia";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import type { GameSession, SessionTeam } from "@/types";

const STEPS = [-500, -100, 100, 500] as const;

interface AdminMenuProps {
  quizId: string;
  quizName: string;
  /** The game session created for this lobby. Everything shown here is read from it. */
  sessionId: string;
}

const STATE_LABELS: Record<GameSession["state"], string> = {
  LOBBY: "Waiting for the lobby host to start",
  BOARD_SELECTION: "Picking a clue",
  CLUE_READING: "Reading a clue",
  BUZZER_OPEN: "Buzzers are open",
  ANSWER_EVALUATION: "Someone is answering",
  GAME_OVER: "Game over",
};

/** Runs a host action and shows the session it returns at once (everyone else gets it over the live stream). */
type Run = (action: () => Promise<GameSession>) => void;

/**
 * The host's control panel, meant for a second screen while the board runs on the shared one.
 * Everything is read from the game session (live) and every button is a command to the backend.
 */
export function AdminMenu({ quizId, quizName, sessionId }: AdminMenuProps) {
  const { state, apply } = useGameSession(sessionId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run: Run = async (action) => {
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
  if (state.status === "error") {
    return (
      <div className="space-y-4">
        <Alert title={state.error.title}>{state.error.message}</Alert>
        <LinkButton href={`/quizzes/${quizId}/host`} variant="ghost">Back to lobby settings</LinkButton>
      </div>
    );
  }
  const { session } = state;
  const solo = session.mode === "SOLO";
  const started = session.state !== "LOBBY";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate font-display text-6xl tracking-wide">{quizName}</h1>
          <p className="text-chalk/60">Host controls</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <LinkButton href={`/quizzes/${quizId}/host`} variant="ghost">
            New lobby
          </LinkButton>
          <LinkButton href={`/quizzes/${quizId}/host/${sessionId}/board`} target="_blank" rel="noopener noreferrer">
            Open game board &#8599;
          </LinkButton>
        </div>
      </div>

      {error && <Alert title="That didn't work">{error}</Alert>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-1">
          <p className="text-sm text-chalk/60">Lobby code</p>
          <p className="font-display text-6xl leading-none tracking-[0.12em] text-gold">{session.lobbyCode}</p>
          <p className="text-sm text-chalk/60">{STATE_LABELS[session.state]}</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-sm text-chalk/60">Mode</p>
          <p className="font-display text-4xl tracking-wide">{solo ? "Solo" : session.teams.length > 0 ? `${session.teams.length} teams` : "Teams"}</p>
          <p className="text-sm text-chalk/60">
            {started ? `${session.players.length} player${session.players.length === 1 ? "" : "s"} joined` : "Waiting for players"}.{" "}
            {session.clues.filter((c) => !c.revealed).length} of {session.clues.length} clues left.
          </p>
        </Card>
      </div>

      {session.activeClueId && <CurrentClue session={session} sessionId={sessionId} busy={busy} run={run} />}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{solo ? "Players" : "Teams"}</h2>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy || session.teams.length === 0}
            onClick={() =>
              run(async () => {
                let latest = session;
                for (const team of session.teams) latest = await hostControls.setScore(sessionId, team.id, 0);
                return latest;
              })
            }
          >
            Reset all scores
          </Button>
        </div>
        {session.teams.length === 0 ? (
          <Card>
            <p className="text-white/70">
              Nobody is here yet. Players join with code <span className="font-bold tracking-wider text-gold">{session.lobbyCode}</span>; the first one to join is the lobby host and starts the game. Teams and players show up here once it starts.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {session.teams.map((team, index) => (
              <TeamRow key={team.id} session={session} sessionId={sessionId} team={team} index={index} solo={solo} busy={busy} run={run} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** The open clue: who is answering and who is in line, with the same controls as the board. */
function CurrentClue({ session, sessionId, busy, run }: { session: GameSession; sessionId: string; busy: boolean; run: Run }) {
  const clue = session.clues.find((c) => c.id === session.activeClueId);
  const nameOf = (playerId: string) => session.players.find((p) => p.id === playerId)?.name ?? "?";
  if (!clue) return null;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-display text-2xl uppercase tracking-wide">
          {clue.category} <span className="text-gold">{clue.value}</span>
        </p>
        <p className="text-sm text-chalk/60">Answer: <span className="font-semibold text-chalk">{clue.answer}</span></p>
      </div>
      <p className="font-serif text-lg font-bold uppercase leading-snug">{clue.question}</p>
      {clue.mediaType === "IMAGE" && clue.mediaUrl && (
        <div className="flex h-40 justify-start">
          <ClueMedia type="IMAGE" url={clue.mediaUrl} label={clue.question ?? "Clue image"} className="w-auto rounded-md" />
        </div>
      )}
      {/* Just a link: it plays on the board, a second player here would only double the sound. */}
      {(clue.mediaType === "VIDEO" || clue.mediaType === "AUDIO") && clue.mediaUrl && (
        <p className="truncate text-sm text-white/60">
          {clue.mediaType === "VIDEO" ? "Video" : "Sound"} on the board:{" "}
          <a href={clue.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">
            {clue.mediaUrl}
          </a>
        </p>
      )}

      <p className="text-sm text-white/70">
        {session.answeringPlayerId ? (
          <>
            <span className="font-bold text-chalk">{nameOf(session.answeringPlayerId)}</span> is answering.
          </>
        ) : session.state === "CLUE_READING" ? (
          "Buzzers closed while you read."
        ) : (
          "Buzzers open, nobody has buzzed."
        )}
        {session.buzzes.length > 1 && <> In line: {session.buzzes.slice(1).map((b) => nameOf(b.playerId)).join(", ")}.</>}
      </p>

      <div className="flex flex-wrap gap-2">
        {session.state === "CLUE_READING" && (
          <Button disabled={busy} onClick={() => run(() => hostControls.openBuzzers(sessionId))}>
            Open buzzers
          </Button>
        )}
        {session.state === "ANSWER_EVALUATION" && (
          <>
            <Button disabled={busy} className="bg-emerald-500 text-white hover:bg-emerald-400" onClick={() => run(() => hostControls.judge(sessionId, true))}>
              ✓ Correct
            </Button>
            <Button variant="danger" disabled={busy} onClick={() => run(() => hostControls.judge(sessionId, false))}>
              ✗ Wrong
            </Button>
          </>
        )}
        <Button variant="ghost" disabled={busy} onClick={() => run(() => hostControls.closeClue(sessionId))}>
          Close clue (no points)
        </Button>
      </div>
    </Card>
  );
}

function TeamRow({
  session,
  sessionId,
  team,
  index,
  solo,
  busy,
  run,
}: {
  session: GameSession;
  sessionId: string;
  team: SessionTeam;
  index: number;
  solo: boolean;
  busy: boolean;
  run: Run;
}) {
  const [draft, setDraft] = useState("");
  const members = session.players.filter((p) => p.teamId === team.id);

  function applyDraft() {
    const value = Number(draft);
    if (draft.trim() === "" || !Number.isInteger(value)) return;
    run(() => hostControls.setScore(sessionId, team.id, value));
    setDraft("");
  }

  return (
    <li>
      <Card className="space-y-3 overflow-hidden p-0">
        <div className={cn("h-1.5", sessionTeamStyle(team.colour, index).bar)} />
        <div className="space-y-3 px-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{team.name}</p>
              {!solo && <p className="truncate text-xs text-chalk/60">{members.map((p) => p.name).join(", ") || "No players yet"}</p>}
              {team.lockedOut && <p className="text-xs font-semibold text-buzzer-red">Locked out this clue</p>}
            </div>
            <p className={cn("font-display text-5xl leading-none tabular-nums", team.score < 0 && "text-buzzer-red")}>{team.score}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STEPS.map((step) => (
              <Button key={step} size="sm" variant="secondary" disabled={busy} onClick={() => run(() => hostControls.adjustScore(sessionId, team.id, step))}>
                {step > 0 ? `+${step}` : step}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label={`Set ${team.name} score`}
              placeholder="Set exact score"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyDraft()}
              className="w-40 rounded-md border border-white/15 bg-black/20 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-jeopardy-gold"
            />
            <Button size="sm" variant="secondary" disabled={busy} onClick={applyDraft}>
              Set
            </Button>
          </div>

          <BuzzerSoundPicker sessionId={sessionId} team={team} index={index} busy={busy} run={run} />
        </div>
      </Card>
    </li>
  );
}

/** Which sound the board plays when this team buzzes. ▶ previews it here, on the host's screen. */
function BuzzerSoundPicker({ sessionId, team, index, busy, run }: { sessionId: string; team: SessionTeam; index: number; busy: boolean; run: Run }) {
  const effective = buzzerSoundFor(team.buzzerSound, index);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={`sound-${team.id}`} className="text-xs text-white/50">
        Buzzer sound
      </label>
      <select
        id={`sound-${team.id}`}
        value={team.buzzerSound ?? ""}
        disabled={busy}
        onChange={(e) => {
          const sound = e.target.value || null;
          run(() => hostControls.setBuzzerSound(sessionId, team.id, sound));
          playBuzzerSound(buzzerSoundFor(sound, index));
        }}
        className="min-w-0 flex-1 rounded-md border border-white/15 bg-black/20 px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-jeopardy-gold"
      >
        <option value="" className="text-black">
          Automatic ({BUZZER_SOUND_LABELS[buzzerSoundFor(null, index)]})
        </option>
        {BUZZER_SOUND_IDS.map((id) => (
          <option key={id} value={id} className="text-black">
            {BUZZER_SOUND_LABELS[id]}
          </option>
        ))}
      </select>
      <Button size="sm" variant="ghost" aria-label={`Play ${team.name}'s buzzer sound`} onClick={() => playBuzzerSound(effective)}>
        ▶
      </Button>
    </div>
  );
}
