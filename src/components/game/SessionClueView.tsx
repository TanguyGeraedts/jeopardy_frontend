"use client";

import { useEffect, useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { CLUE_SECONDS } from "@/lib/game-state";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { GameSession, SessionClue } from "@/types";

interface SessionClueViewProps {
  session: GameSession;
  clue: SessionClue;
  busy: boolean;
  /** Done reading: let players buzz. */
  onOpenBuzzers: () => void;
  /** Nobody got it (or time's up): back to the board, no points. */
  onClose: () => void;
}

/** The open clue of a live session: question, who buzzed (in order), countdown and host controls. Mount with key={clue.id}. */
export function SessionClueView({ session, clue, busy, onOpenBuzzers, onClose }: SessionClueViewProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const reading = session.state === "CLUE_READING";
  const answeringId = session.answeringPlayerId;

  const nameOf = (playerId: string) => session.players.find((p) => p.id === playerId)?.name ?? "?";
  const teamName = (teamId: string | null) => session.teams.find((t) => t.id === teamId)?.name ?? "";
  const solo = session.mode === "SOLO";

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-jeopardy-board p-6">
      <div className="flex items-center justify-between gap-3 text-white/80">
        <p className="text-lg font-bold uppercase tracking-wide">
          {clue.category} <span className="text-jeopardy-gold">· {clue.value}</span>
        </p>
        {clue.dailyDouble && (
          <span className="rounded bg-jeopardy-gold px-2 py-0.5 text-sm font-extrabold uppercase text-jeopardy-navy">Daily double</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto text-center">
        <p className="max-w-4xl text-[clamp(1.5rem,4vw,3.5rem)] font-bold leading-tight">{clue.question}</p>
        {showAnswer && <p className="text-[clamp(1.25rem,3vw,2.5rem)] font-extrabold text-jeopardy-gold">{clue.answer}</p>}
      </div>

      <div className="space-y-2 text-center" aria-live="polite">
        {answeringId && (
          <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-extrabold text-jeopardy-gold">
            &#9889; {nameOf(answeringId)}
            {!solo && <> ({teamName(session.buzzes.find((b) => b.playerId === answeringId)?.teamId ?? null)})</>} is answering!
          </p>
        )}
        {session.buzzes.length > 0 ? (
          <ol className="flex flex-wrap justify-center gap-2">
            {session.buzzes.map((buzz, i) => (
              <li
                key={buzz.playerId}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm",
                  buzz.playerId === answeringId ? "border-jeopardy-gold bg-jeopardy-gold/20 font-bold" : "border-white/15 bg-white/5",
                )}
              >
                <span className="mr-2 font-extrabold">{i + 1}</span>
                {nameOf(buzz.playerId)}
                {!solo && <span className="text-white/60"> ({teamName(buzz.teamId)})</span>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-white/50">
            {reading ? "Read the clue, then open the buzzers." : "Buzzers open: waiting for someone to buzz in…"}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {/* The clock starts when the buzzers open and stops while someone answers. */}
        {!reading && <ClueTimer paused={!!answeringId} />}

        <div className="flex flex-wrap items-center justify-center gap-2">
          {reading && (
            <Button disabled={busy} onClick={onOpenBuzzers} className="px-6 text-base">
              Open buzzers
            </Button>
          )}
          <Button variant="secondary" disabled={showAnswer} onClick={() => setShowAnswer(true)}>
            Show answer
          </Button>
          <Button variant="ghost" disabled={busy} onClick={onClose}>
            Close (no points)
          </Button>
        </div>
      </div>
    </div>
  );
}

function ClueTimer({ paused }: { paused: boolean }) {
  const timer = useCountdown(CLUE_SECONDS);
  const low = timer.seconds <= 5;

  const { pause, resume } = timer;
  useEffect(() => {
    if (paused) pause();
    else resume();
  }, [paused, pause, resume]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10" role="timer" aria-label="Time left">
          <div className={cn("h-full rounded-full", low ? "bg-red-500" : "bg-jeopardy-gold")} style={{ width: `${timer.fraction * 100}%` }} />
        </div>
        <p className={cn("w-16 text-right text-4xl font-extrabold tabular-nums", low && "text-red-400")}>{timer.seconds}</p>
        <Button size="sm" variant="ghost" onClick={timer.reset}>
          Restart
        </Button>
      </div>
      {timer.done && !paused && <p className="text-center text-xl font-extrabold text-red-400">Time&apos;s up!</p>}
    </div>
  );
}
