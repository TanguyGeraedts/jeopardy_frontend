import { apiFetch } from "./client";
import { GameplayPaths } from "./paths";
import type { CreateGameSessionRequest, CreateGameSessionResponse, GameSession } from "@/types";

/** Creates the game session. The backend creates the lobby too; read the code from getGameSession. */
export const createGameSession = (body: CreateGameSessionRequest, signal?: AbortSignal) =>
    apiFetch<CreateGameSessionResponse>(GameplayPaths.sessions, { method: "POST", body, signal });

export const getGameSession = (id: string, signal?: AbortSignal) =>
    apiFetch<GameSession>(GameplayPaths.sessionById(id), { signal });

/** Host only. Deletes the game with its players' names, teams and scores now, instead of after the retention period. */
export const deleteGameSession = (id: string) => apiFetch<void>(GameplayPaths.sessionById(id), { method: "DELETE" });

/** Gives Jeopardy the lobby's handoff token: it imports the players/teams and starts the game. Needs no login. */
export const handoffGameSession = (id: string, token: string) =>
    apiFetch<GameSession>(GameplayPaths.handoff(id), { method: "POST", body: { token }, auth: false });

/** A player buzzes. playerToken is the lobby-signed game token. accepted = false when the buzz didn't count. */
export const buzz = (id: string, playerToken: string) =>
    apiFetch<BuzzResult>(GameplayPaths.buzz(id), { method: "POST", auth: false, headers: { "X-Player-Token": playerToken } });

/**
 * ACCEPTED: in line. TOO_EARLY: pressed before the buzzers opened or during another team's head start; the player
 * can't buzz for lockedOutMs. IGNORED: doesn't count, no penalty.
 */
export interface BuzzResult {
    accepted: boolean;
    result: "ACCEPTED" | "TOO_EARLY" | "IGNORED";
    lockedOutMs: number;
}

/** Host controls. Each returns the full session (with answers); every screen also gets the change live. */
export const hostControls = {
    selectClue: (id: string, clueId: string) => apiFetch<GameSession>(GameplayPaths.selectClue(id, clueId), { method: "POST" }),
    openBuzzers: (id: string) => apiFetch<GameSession>(GameplayPaths.openBuzzers(id), { method: "POST" }),
    judge: (id: string, correct: boolean) => apiFetch<GameSession>(GameplayPaths.judge(id), { method: "POST", body: { correct } }),
    closeClue: (id: string) => apiFetch<GameSession>(GameplayPaths.closeClue(id), { method: "POST" }),
    /** Stop early: everyone goes to the final scoreboard with the scores as they are. */
    endGame: (id: string) => apiFetch<GameSession>(GameplayPaths.endGame(id), { method: "POST" }),
    setTurnRules: (id: string, enabled: boolean, headStartSeconds: number) =>
        apiFetch<GameSession>(GameplayPaths.turnRules(id), { method: "PUT", body: { enabled, headStartSeconds } }),
    /** The rotation continues from this team. Before the buzzers open it counts for the clue being read. */
    giveTurn: (id: string, teamId: string) => apiFetch<GameSession>(GameplayPaths.giveTurn(id, teamId), { method: "POST" }),
    skipTurn: (id: string) => apiFetch<GameSession>(GameplayPaths.skipTurn(id), { method: "POST" }),
    adjustScore: (id: string, teamId: string, delta: number) =>
        apiFetch<GameSession>(GameplayPaths.teamScore(id, teamId), { method: "POST", body: { delta } }),
    setScore: (id: string, teamId: string, score: number) =>
        apiFetch<GameSession>(GameplayPaths.teamScore(id, teamId), { method: "POST", body: { score } }),
    /** sound null = automatic. */
    setBuzzerSound: (id: string, teamId: string, sound: string | null) =>
        apiFetch<GameSession>(GameplayPaths.teamBuzzerSound(id, teamId), { method: "PUT", body: { sound } }),
};
