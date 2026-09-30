"use client";

import { useEffect, useMemo } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { CLUE_SECONDS, currentBuzz, type ActiveClue } from "@/lib/game-state";
import { teamColor } from "@/lib/team-colors";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { Category, GameTeam } from "@/types";

interface ClueViewProps {
  category: Category;
  clue: ActiveClue;
  teams: GameTeam[];
  /** Someone buzzed. Keyboard/host buttons call this now, lobby events will later. */
  onBuzz: (playerId: string) => void;
  onReveal: () => void;
  /** Nobody got it: back to the board, tile goes blank. */
  onClose: () => void;
}

/** One open clue: question, buzz order, countdown and host controls. Mount with key={question.id}. */
export function ClueView({ category, clue, teams, onBuzz, onReveal, onClose }: ClueViewProps) {
  const { question, revealed, buzzes, lockedTeamIds } = clue;
  const timer = useCountdown(CLUE_SECONDS);
  const low = timer.seconds <= 5;
  const answering = currentBuzz(clue);
  const isAnswering = answering !== undefined;

  // The timer stops while a team is answering and carries on if they get it wrong.
  const { pause, resume } = timer;
  useEffect(() => {
    if (isAnswering) pause();
    else resume();
  }, [isAnswering, pause, resume]);

  // Everyone who can buzz, in team order: keys 1-9 buzz for the first nine.
  const buzzers = useMemo(() => teams.flatMap((team, teamIndex) => team.players.map((player) => ({ player, team, teamIndex }))), [teams]);

  useEffect(() => {
    if (revealed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (Number.isInteger(n) && n >= 1 && n <= 9 && buzzers[n - 1]) onBuzz(buzzers[n - 1].player.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, buzzers, onBuzz]);

  function reveal() {
    timer.pause();
    onReveal();
  }

  const nameOf = (playerId: string) => buzzers.find((b) => b.player.id === playerId)?.player.name ?? "?";
  const teamName = (teamId: string) => teams.find((t) => t.id === teamId)?.name ?? "?";

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-jeopardy-board p-6">
      <div className="flex items-center justify-between gap-3 text-white/80">
        <p className="text-lg font-bold uppercase tracking-wide">
          {category.name} <span className="text-jeopardy-gold">· {question.points}</span>
        </p>
        {question.dailyDouble && (
          <span className="rounded bg-jeopardy-gold px-2 py-0.5 text-sm font-extrabold uppercase text-jeopardy-navy">Daily double</span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 overflow-y-auto text-center">
        <p className="max-w-4xl text-[clamp(1.5rem,4vw,3.5rem)] font-bold leading-tight">{question.questionText}</p>
        {revealed && (
          <div className="space-y-3">
            <p className="text-[clamp(1.25rem,3vw,2.5rem)] font-extrabold text-jeopardy-gold">{question.answerText}</p>
            {question.mediaUrl && question.answerType === "IMAGE" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={question.mediaUrl} alt={question.answerText} className="mx-auto max-h-64 rounded-lg" />
            )}
            {question.mediaUrl && question.answerType === "VIDEO" && <video src={question.mediaUrl} controls className="mx-auto max-h-64 rounded-lg" />}
          </div>
        )}
      </div>

      <div className="space-y-2 text-center" aria-live="polite">
        {answering && (
          <p className="text-[clamp(1.25rem,2.5vw,2rem)] font-extrabold text-jeopardy-gold">
            &#9889; {nameOf(answering.playerId)} ({teamName(answering.teamId)}) {answering === buzzes[0] ? "buzzed in first!" : "is up next!"}
          </p>
        )}
        {buzzes.length > 0 ? (
          <ol className="flex flex-wrap justify-center gap-2">
            {buzzes.map((buzz, i) => (
              <li
                key={buzz.playerId}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm",
                  buzz === answering ? "border-jeopardy-gold bg-jeopardy-gold/20 font-bold" : "border-white/15 bg-white/5",
                  lockedTeamIds.includes(buzz.teamId) && "line-through opacity-50",
                )}
              >
                <span className="mr-2 font-extrabold">{i + 1}</span>
                {nameOf(buzz.playerId)} <span className="text-white/60">({teamName(buzz.teamId)})</span>
                <span className="ml-2 text-xs tabular-nums text-white/60">{i === 0 ? "first" : `+${((buzz.at - buzzes[0].at) / 1000).toFixed(2)}s`}</span>
              </li>
            ))}
          </ol>
        ) : (
          !revealed && <p className="text-white/50">Waiting for someone to buzz in&hellip;</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/10" role="timer" aria-label="Time left">
            <div className={cn("h-full rounded-full", low ? "bg-red-500" : "bg-jeopardy-gold")} style={{ width: `${timer.fraction * 100}%` }} />
          </div>
          <p className={cn("w-16 text-right text-4xl font-extrabold tabular-nums", low && "text-red-400")}>{timer.seconds}</p>
        </div>
        {timer.done && !revealed && !isAnswering && <p className="text-center text-xl font-extrabold text-red-400">Time&apos;s up!</p>}

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="secondary" disabled={timer.done || revealed || isAnswering} onClick={timer.running ? timer.pause : timer.resume}>
            {timer.running ? "Pause" : "Resume"}
          </Button>
          <Button variant="secondary" disabled={revealed} onClick={timer.reset}>
            Restart timer
          </Button>
          <Button disabled={revealed} onClick={reveal}>
            Show answer
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close (no points)
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 pt-3">
          <span className="text-xs text-white/50">Buzz in for (keys 1&ndash;9):</span>
          {buzzers.map(({ player, team, teamIndex }, i) => (
            <button
              key={player.id}
              type="button"
              disabled={revealed || lockedTeamIds.includes(team.id) || buzzes.some((b) => b.teamId === team.id)}
              onClick={() => onBuzz(player.id)}
              className={cn("min-h-9 rounded-md px-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-30", teamColor(teamIndex).solid)}
            >
              {i < 9 && <kbd className="mr-1.5 text-xs opacity-70">{i + 1}</kbd>}
              {player.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
