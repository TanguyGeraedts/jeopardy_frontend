import type { GameTeam } from "@/types";

/** What the host can change while a game runs. Local for now: later this becomes commands sent to the game service. */
export interface AdminState {
  scores: Record<string, number>;
  /** Master switch: nobody can buzz. */
  allBuzzersBlocked: boolean;
  /** Individual teams that can't buzz. */
  blockedTeamIds: string[];
}

export type AdminAction =
  | { type: "toggleAll" }
  | { type: "toggleTeam"; teamId: string }
  | { type: "adjust"; teamId: string; delta: number }
  | { type: "setScore"; teamId: string; score: number }
  | { type: "resetScores" };

export const initialAdmin = (teams: GameTeam[]): AdminState => ({
  scores: Object.fromEntries(teams.map((t) => [t.id, 0])),
  allBuzzersBlocked: false,
  blockedTeamIds: [],
});

export const canBuzz = (state: AdminState, teamId: string) => !state.allBuzzersBlocked && !state.blockedTeamIds.includes(teamId);

export function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "toggleAll":
      return { ...state, allBuzzersBlocked: !state.allBuzzersBlocked };
    case "toggleTeam":
      return {
        ...state,
        blockedTeamIds: state.blockedTeamIds.includes(action.teamId) ? state.blockedTeamIds.filter((id) => id !== action.teamId) : [...state.blockedTeamIds, action.teamId],
      };
    case "adjust":
      return { ...state, scores: { ...state.scores, [action.teamId]: (state.scores[action.teamId] ?? 0) + action.delta } };
    case "setScore":
      return { ...state, scores: { ...state.scores, [action.teamId]: action.score } };
    case "resetScores":
      return { ...state, scores: Object.fromEntries(Object.keys(state.scores).map((id) => [id, 0])) };
  }
}
