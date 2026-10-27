"use client";

import { ArrowsClockwise, SkipForward } from "@phosphor-icons/react";
import { hostControls } from "@/lib/api/sessions";
import { cn } from "@/lib/cn";
import { HEAD_START_MAX, HEAD_START_MIN } from "@/lib/lobby-config";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ToggleField } from "@/components/ui/ToggleField";
import type { GameSession } from "@/types";

type Run = (action: () => Promise<GameSession>) => void;

const HEAD_STARTS = Array.from({ length: HEAD_START_MAX - HEAD_START_MIN + 1 }, (_, i) => HEAD_START_MIN + i);

/**
 * Taking turns: who's up, skip to the next team, and the rules. Giving the turn to a specific team is on its row.
 * Moving the turn while a clue is read counts for that clue; once the buzzers are open, for the next one.
 */
export function TurnPanel({ session, sessionId, busy, run }: { session: GameSession; sessionId: string; busy: boolean; run: Run }) {
  const solo = session.mode === "SOLO";
  const who = solo ? "player" : "team";
  const nameOf = (teamId: string | null) => session.teams.find((t) => t.id === teamId)?.name ?? "nobody";
  const started = session.state !== "LOBBY";
  const buzzersOpen = session.state === "BUZZER_OPEN" || session.state === "ANSWER_EVALUATION";
  const setRules = (enabled: boolean, headStartSeconds: number) => run(() => hostControls.setTurnRules(sessionId, enabled, headStartSeconds));

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-chalk/60">Turns</p>
          {session.turnsEnabled && started ? (
            <>
              <p className="font-display text-4xl leading-tight tracking-wide">
                <ArrowsClockwise weight="bold" aria-hidden className="mr-2 inline size-7 align-[-0.1em] text-gold" />
                {nameOf(session.turnTeamId)}
              </p>
              <p className="text-sm text-chalk/60">
                {session.clueTurnTeamId && session.clueTurnTeamId !== session.turnTeamId
                  ? `${nameOf(session.clueTurnTeamId)} keeps this clue; ${nameOf(session.turnTeamId)} is up next.`
                  : buzzersOpen
                    ? `Has the head start on this clue. Changing the turn now counts from the next clue.`
                    : `Gets a ${session.headStartSeconds} second head start on the next clue.`}
              </p>
            </>
          ) : (
            <p className="text-chalk/70">{session.turnsEnabled ? `Starts with the first ${who} once the game begins.` : "Off: everyone buzzes at once."}</p>
          )}
        </div>
        {session.turnsEnabled && started && (
          <Button variant="secondary" disabled={busy} onClick={() => run(() => hostControls.skipTurn(sessionId))}>
            <SkipForward weight="fill" aria-hidden />
            Skip turn
          </Button>
        )}
      </div>

      <div className="space-y-3 border-t border-white/10 pt-4">
        <ToggleField
          label="Take turns"
          description={`Each clue one ${who} in turn gets a head start, then anyone can steal. Off: buzzers open after a short random delay.`}
          checked={session.turnsEnabled}
          disabled={busy}
          onChange={(enabled) => setRules(enabled, session.headStartSeconds)}
        />
        {session.turnsEnabled && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-chalk/70">Head start</span>
            <div role="radiogroup" aria-label="Head start in seconds" className="flex rounded-lg bg-studio-night p-1">
              {HEAD_STARTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={session.headStartSeconds === s}
                  disabled={busy}
                  onClick={() => setRules(true, s)}
                  className={cn(
                    "min-w-9 rounded-md px-2 py-1 text-sm tabular-nums transition",
                    session.headStartSeconds === s ? "bg-white/[0.12] font-semibold text-chalk" : "text-chalk/55 hover:text-chalk",
                  )}
                >
                  {s}s
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
