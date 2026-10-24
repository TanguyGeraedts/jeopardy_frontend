import { Check, X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { sessionTeamStyle } from "@/lib/team-colors";
import type { GameTeam } from "@/types";

interface ClueStatus {
  /** Team currently answering (first unlocked buzzer), if anyone buzzed. */
  answeringTeamId?: string;
  lockedTeamIds: readonly string[];
  hasBuzzes: boolean;
  onCorrect: (teamId: string) => void;
  onWrong: (teamId: string) => void;
}

interface ScoreboardProps {
  teams: GameTeam[];
  scores: Record<string, number>;
  /** Each team's lobby colour (same order as teams). Missing = a colour by position. */
  colours?: readonly (string | null)[];
  /** Pass while a clue is open to show who is answering and the ✓ / ✗ buttons. */
  clue?: ClueStatus;
}

/**
 * Team scores along the bottom of the board. Sized for a shared screen: big League Gothic numbers, a thick team-colour
 * bar, and the answering team as a solid gold block (outlines and small labels blur in a compressed stream).
 */
export function Scoreboard({ teams, scores, colours, clue }: ScoreboardProps) {
  if (teams.length === 0) return <p className="py-3 text-center text-chalk/60">Waiting for teams to join&hellip;</p>;

  return (
    <ul className="flex gap-[0.5vw]">
      {teams.map((team, index) => {
        const score = scores[team.id] ?? 0;
        const locked = clue?.lockedTeamIds.includes(team.id) ?? false;
        const answering = clue?.answeringTeamId === team.id;
        // With buzzes, only the team that's up gets verdict buttons. With none, the host can judge any team.
        const canJudge = clue && !locked && (clue.hasBuzzes ? answering : true);
        const solo = team.players.length === 1 && team.players[0].name === team.name;

        return (
          <li
            key={team.id}
            className={cn(
              "min-w-0 flex-1 overflow-hidden rounded-sm text-center",
              answering ? "bg-gold text-studio-night" : "bg-desk",
              locked && "opacity-40",
            )}
          >
            <div className={cn("h-[max(6px,0.45vw)]", sessionTeamStyle(colours?.[index], index).bar)} />
            <div className="px-[0.8vw] py-[0.5vw]">
              <p className="truncate text-[clamp(0.9rem,1.25vw,1.35rem)] font-semibold">{team.name}</p>
              {!solo && <p className="truncate text-[clamp(0.75rem,0.95vw,1rem)] opacity-70">{team.players.map((p) => p.name).join(", ")}</p>}
              <p className={cn("font-display text-[clamp(2.25rem,4vw,4.5rem)] leading-none tabular-nums", score < 0 && !answering && "text-buzzer-red")}>
                {score}
              </p>
              {locked && <p className="text-[clamp(0.75rem,1vw,1.05rem)] font-semibold">Locked out</p>}
              {canJudge && clue && (
                <div className="mt-[0.4vw] flex justify-center gap-2">
                  <button type="button" aria-label={`${team.name} answered correctly`} onClick={() => clue.onCorrect(team.id)} className="grid min-h-9 flex-1 place-items-center rounded-sm bg-emerald-600 text-white hover:brightness-110">
                    <Check weight="bold" className="size-5" aria-hidden />
                  </button>
                  <button type="button" aria-label={`${team.name} answered wrongly`} onClick={() => clue.onWrong(team.id)} className="grid min-h-9 flex-1 place-items-center rounded-sm bg-buzzer-red text-white hover:brightness-110">
                    <X weight="bold" className="size-5" aria-hidden />
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
