"use client";

import { useEffect, useState } from "react";
import { useBuzzerTiming } from "@/hooks/useBuzzerTiming";
import { useCountdown } from "@/hooks/useCountdown";
import { buzzTime } from "@/lib/buzz-times";
import { CLUE_SECONDS } from "@/lib/game-state";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { GameSession, SessionClue } from "@/types";
import { ClueMedia } from "./ClueMedia";

interface SessionClueViewProps {
  session: GameSession;
  clue: SessionClue;
  busy: boolean;
  /** Done reading: let players buzz. Keyboard only (O) on the board, so nobody on the stream sees a click. */
  onOpenBuzzers: () => void;
  /** Nobody got it (or time's up): back to the board, no points. */
  onClose: () => void;
}

/** The open clue of a live session: question, who buzzed (in order), countdown and host controls. Mount with key={clue.id}. */
export function SessionClueView({ session, clue, busy, onOpenBuzzers, onClose }: SessionClueViewProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const media = clue.mediaType && clue.mediaUrl ? { type: clue.mediaType, url: clue.mediaUrl } : null;
  const reading = session.state === "CLUE_READING";
  const answeringId = session.answeringPlayerId;

  const nameOf = (playerId: string) => session.players.find((p) => p.id === playerId)?.name ?? "?";
  const teamName = (teamId: string | null) => session.teams.find((t) => t.id === teamId)?.name ?? "";
  const solo = session.mode === "SOLO";
  const timing = useBuzzerTiming(session);
  const turnTeam = teamName(session.clueTurnTeamId);

  useEffect(() => {
    if (!reading || busy) return;
    const onKey = (e: KeyboardEvent) => {
      if (!e.repeat && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "o") onOpenBuzzers();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reading, busy, onOpenBuzzers]);

  // What the room needs to know about the buzzers. Never says when they'll open: that's the point of the random delay.
  const status =
    timing.phase === "reading"
      ? session.clueTurnTeamId
        ? `${turnTeam}'s turn`
        : "Get ready…"
      : timing.phase === "opening"
        ? "Get ready…"
        : timing.phase === "headStart"
          ? clue.dailyDouble
            ? `${turnTeam}'s daily double`
            : `${turnTeam}'s turn`
          : session.clueTurnTeamId
            ? "Anyone can steal!"
            : "Buzz!";

  return (
    // Grows out of the picked tile (the one motion on the board; skipped when the viewer prefers less motion).
    <div className="flex h-full flex-col gap-[1.2vw] rounded-sm bg-board-blue p-[2vw] motion-safe:animate-clue-reveal">
      <div className="flex items-baseline justify-between gap-4 font-display text-[clamp(1.5rem,2.6vw,3rem)] leading-none tracking-wide">
        <p className="uppercase">
          {clue.category}
          <span className="ml-[1vw] text-gold">{clue.value}</span>
        </p>
        {clue.dailyDouble && <p className="text-gold">Daily double</p>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[1.2vw] text-center">
        {/* The show's clue type: a sturdy serif in capitals, short lines so it reads from the back of a room. */}
        <p
          className={cn(
            "max-w-[30ch] shrink-0 font-serif font-bold uppercase leading-[1.18]",
            media ? "text-[clamp(1.5rem,2.8vw,3rem)]" : "text-[clamp(2rem,4.6vw,5.25rem)]",
          )}
        >
          {clue.question}
        </p>
        {media && (
          // Takes whatever height is left, so a photo or video is as big as the screen allows.
          <div className="flex min-h-0 w-full flex-1 items-center justify-center">
            <ClueMedia type={media.type} url={media.url} label={clue.question ?? "Clue media"} />
          </div>
        )}
        {showAnswer && (
          <p className="max-w-[30ch] shrink-0 font-serif text-[clamp(1.75rem,3.6vw,4rem)] font-bold uppercase leading-tight text-gold">{clue.answer}</p>
        )}
      </div>

      <div className="space-y-[0.8vw] text-center" aria-live="polite">
        {/* The head start, big enough to follow on a stream: whose turn, and when the others may steal. */}
        {timing.phase === "headStart" && !answeringId && (
          <p className="font-display text-[clamp(2rem,3.6vw,4rem)] leading-none tracking-wide">
            {status}
            {!clue.dailyDouble && (
              <span className="ml-[1vw] text-gold tabular-nums">{Math.ceil(timing.stealInMs / 1000)}</span>
            )}
          </p>
        )}
        {answeringId && (
          <p className="font-display text-[clamp(2rem,3.6vw,4rem)] leading-none tracking-wide">
            {nameOf(answeringId)}
            {!solo && <span className="text-chalk/70"> ({teamName(session.buzzes.find((b) => b.playerId === answeringId)?.teamId ?? null)})</span>} is answering
          </p>
        )}
        {session.buzzes.length > 0 ? (
          // Solid blocks, no outlines: the buzz order stays readable in a compressed stream.
          // A wrong answer stays in line crossed out, so everyone can still see how close it was.
          <ol className="flex flex-wrap justify-center gap-[0.5vw]">
            {session.buzzes.map((buzz, i) => (
              <li
                key={buzz.playerId}
                className={cn(
                  "flex items-baseline gap-[0.6vw] rounded-sm px-[0.9vw] py-[0.35vw] text-[clamp(0.95rem,1.3vw,1.4rem)] font-semibold",
                  buzz.playerId === answeringId ? "bg-gold text-studio-night" : "bg-studio-night/50",
                  buzz.lockedOut && "text-chalk/60 line-through decoration-buzzer-red decoration-2",
                )}
              >
                <span>{i + 1}</span>
                <span>
                  {nameOf(buzz.playerId)}
                  {!solo && <span className="opacity-70"> ({teamName(buzz.teamId)})</span>}
                </span>
                <span className="font-display text-[1.25em] leading-none tracking-wide tabular-nums">{buzzTime(session.buzzes, i)}</span>
              </li>
            ))}
          </ol>
        ) : (
          timing.phase !== "headStart" && (
            <p className={cn("font-display text-[clamp(1.5rem,2.6vw,3rem)] leading-none tracking-wide", timing.phase === "open" ? "text-gold" : "text-chalk/75")}>
              {status}
            </p>
          )
        )}
      </div>

      <div className="space-y-3">
        {/* The clock starts when the buzzers really open (after the random delay) and stops while someone answers. */}
        {!reading && timing.phase !== "opening" && <ClueTimer paused={!!answeringId} />}

        <div className="flex flex-wrap items-center justify-center gap-2">
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
  // Held (not paused) while someone answers: Restart then only refills the clock, it starts again after the answer.
  const timer = useCountdown(CLUE_SECONDS, paused);
  const low = timer.seconds <= 5;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="h-[max(6px,0.5vw)] flex-1 overflow-hidden rounded-full bg-studio-night/50" role="timer" aria-label="Time left">
          <div className={cn("h-full rounded-full", low ? "bg-buzzer-red" : "bg-chalk")} style={{ width: `${timer.fraction * 100}%` }} />
        </div>
        <p className={cn("w-[4ch] text-right font-display text-[clamp(2rem,3vw,3.5rem)] leading-none tabular-nums", low && "text-buzzer-red")}>
          {timer.seconds}
        </p>
        <Button size="sm" variant="ghost" onClick={timer.reset}>
          Restart
        </Button>
      </div>
      {timer.done && !paused && <p className="text-center font-display text-[clamp(1.75rem,3vw,3rem)] tracking-wide text-buzzer-red">Time&apos;s up</p>}
    </div>
  );
}
