import type { GameSession, SessionPlayer, SessionTeam } from "@/types";

export interface RankedTeam {
  team: SessionTeam;
  /** 1-based. Equal scores share a place and the next place is skipped (1, 1, 3), like sports rankings. */
  place: number;
  /** Position in session.teams: keeps the team's automatic colour. */
  index: number;
  members: SessionPlayer[];
}

/** Teams by score, highest first. Ties keep the session's team order. */
export function rankTeams(session: GameSession): RankedTeam[] {
  const sorted = session.teams
    .map((team, index) => ({ team, index, members: session.players.filter((p) => p.teamId === team.id) }))
    .sort((a, b) => b.team.score - a.team.score || a.index - b.index);

  return sorted.map((entry) => ({ ...entry, place: 1 + sorted.filter((other) => other.team.score > entry.team.score).length }));
}

/** Ranked teams grouped by place: [[1st…], [2nd…], …]. A tie puts several teams in one group. */
export function groupByPlace(ranked: readonly RankedTeam[]): RankedTeam[][] {
  const groups: RankedTeam[][] = [];
  for (const entry of ranked) {
    const last = groups.at(-1);
    if (last && last[0].place === entry.place) last.push(entry);
    else groups.push([entry]);
  }
  return groups;
}

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}
