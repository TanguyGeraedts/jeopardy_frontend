import type { Buzz, GameTeam, Question } from "@/types";

/** How long teams get per clue. */
export const CLUE_SECONDS = 30;

/** Stand-ins until the lobby service supplies real teams: sizes 2, 1, 4. */
export const DEMO_TEAMS: GameTeam[] = [
  { id: "t-red", name: "Red Rockets", players: [{ id: "p-ana", name: "Ana" }, { id: "p-ben", name: "Ben" }] },
  { id: "t-chloe", name: "Chloe", players: [{ id: "p-chloe", name: "Chloe" }] },
  {
    id: "t-green",
    name: "Green Machine",
    players: [{ id: "p-dev", name: "Dev" }, { id: "p-eli", name: "Eli" }, { id: "p-fay", name: "Fay" }, { id: "p-gus", name: "Gus" }],
  },
];

export interface ActiveClue {
  categoryId: string;
  question: Question;
  revealed: boolean;
  /** Who buzzed, earliest first. One buzz per team (the first player of a team to buzz counts). */
  buzzes: Buzz[];
  /** Teams that already answered this clue wrongly: they can't buzz or be marked again. */
  lockedTeamIds: string[];
}

export interface GameState {
  teams: GameTeam[];
  scores: Record<string, number>;
  /** Questions already played: their tiles are blank on the board. */
  usedQuestionIds: string[];
  /** The clue on screen, or null while the board is showing. */
  active: ActiveClue | null;
}

export type GameAction =
  | { type: "open"; categoryId: string; question: Question }
  | { type: "reveal" }
  | { type: "buzz"; playerId: string; at: number }
  | { type: "correct"; teamId: string } // +points, clue is done
  | { type: "wrong"; teamId: string } // -points, team locked out, next buzzer is up
  | { type: "close" }; // nobody got it

export const initialGame = (teams: GameTeam[]): GameState => ({
  teams,
  scores: Object.fromEntries(teams.map((t) => [t.id, 0])),
  usedQuestionIds: [],
  active: null,
});

/** The buzz whose team is answering right now: the earliest one that isn't locked out. */
export const currentBuzz = (clue: ActiveClue): Buzz | undefined => clue.buzzes.find((b) => !clue.lockedTeamIds.includes(b.teamId));

const teamIdOf = (teams: GameTeam[], playerId: string) => teams.find((t) => t.players.some((p) => p.id === playerId))?.id;

const addScore = (scores: GameState["scores"], teamId: string, delta: number) => ({ ...scores, [teamId]: (scores[teamId] ?? 0) + delta });

export function gameReducer(state: GameState, action: GameAction): GameState {
  const { active } = state;
  if (action.type === "open") {
    if (active) return state;
    return { ...state, active: { categoryId: action.categoryId, question: action.question, revealed: false, buzzes: [], lockedTeamIds: [] } };
  }
  if (!active) return state;

  switch (action.type) {
    case "reveal":
      return { ...state, active: { ...active, revealed: true } };
    case "buzz": {
      const teamId = teamIdOf(state.teams, action.playerId);
      if (!teamId || active.revealed || active.lockedTeamIds.includes(teamId) || active.buzzes.some((b) => b.teamId === teamId)) return state;
      // Sorted by timestamp, so a buzz that arrives late over the network still lands in the right place.
      const buzzes = [...active.buzzes, { playerId: action.playerId, teamId, at: action.at }].sort((a, b) => a.at - b.at);
      return { ...state, active: { ...active, buzzes } };
    }
    case "wrong":
      if (active.lockedTeamIds.includes(action.teamId)) return state;
      return {
        ...state,
        scores: addScore(state.scores, action.teamId, -active.question.points),
        active: { ...active, lockedTeamIds: [...active.lockedTeamIds, action.teamId] },
      };
    case "correct":
      if (active.lockedTeamIds.includes(action.teamId)) return state;
      return { ...state, scores: addScore(state.scores, action.teamId, active.question.points), usedQuestionIds: [...state.usedQuestionIds, active.question.id], active: null };
    case "close":
      return { ...state, usedQuestionIds: [...state.usedQuestionIds, active.question.id], active: null };
  }
}
