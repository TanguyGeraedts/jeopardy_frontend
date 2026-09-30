import { cn } from "@/lib/cn";
import { teamColor } from "@/lib/team-colors";
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
  /** Pass while a clue is open to show who is answering and the ✓ / ✗ buttons. */
  clue?: ClueStatus;
}

/** Team cards along the bottom: name, members, score. Leader is outlined in gold. */
export function Scoreboard({ teams, scores, clue }: ScoreboardProps) {
  if (teams.length === 0) return <p className="py-3 text-center text-white/50">Waiting for teams to join&hellip;</p>;
  const top = Math.max(...teams.map((t) => scores[t.id] ?? 0));

  return (
    <ul className="flex gap-3">
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
              "min-w-0 flex-1 overflow-hidden rounded-xl border bg-jeopardy-board text-center",
              answering ? "border-jeopardy-gold ring-2 ring-jeopardy-gold" : top > 0 && score === top ? "border-jeopardy-gold" : "border-white/10",
              locked && "opacity-50",
            )}
          >
            <div className={cn("h-1.5", teamColor(index).bar)} />
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-white/90">{team.name}</p>
              {!solo && <p className="truncate text-xs text-white/50">{team.players.map((p) => p.name).join(" · ")}</p>}
              <p className={cn("text-3xl font-extrabold tabular-nums", score < 0 ? "text-red-400" : "text-white")}>{score}</p>
              {answering && <p className="text-xs font-bold uppercase text-jeopardy-gold">Answering</p>}
              {locked && <p className="text-xs font-bold uppercase text-red-300">Locked out</p>}
              {canJudge && clue && (
                <div className="mt-1 flex justify-center gap-2">
                  <button type="button" aria-label={`${team.name} answered correctly`} onClick={() => clue.onCorrect(team.id)} className="min-h-9 flex-1 rounded-md bg-emerald-500/90 font-bold text-white hover:bg-emerald-400">
                    ✓
                  </button>
                  <button type="button" aria-label={`${team.name} answered wrongly`} onClick={() => clue.onWrong(team.id)} className="min-h-9 flex-1 rounded-md bg-red-500/90 font-bold text-white hover:bg-red-400">
                    ✗
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
