import { apiFetch } from "./client";
import { GameplayPaths } from "./paths";
import type { CreateGameSessionRequest, CreateGameSessionResponse, GameSession } from "@/types";

/** Creates the game session. The backend creates the lobby too; read the code from getGameSession. */
export const createGameSession = (body: CreateGameSessionRequest, signal?: AbortSignal) =>
    apiFetch<CreateGameSessionResponse>(GameplayPaths.sessions, { method: "POST", body, signal });

export const getGameSession = (id: string, signal?: AbortSignal) =>
    apiFetch<GameSession>(GameplayPaths.sessionById(id), { signal });

/** Gives Jeopardy the lobby's handoff token: it imports the players/teams and starts the game. Needs no login. */
export const handoffGameSession = (id: string, token: string) =>
    apiFetch<GameSession>(GameplayPaths.handoff(id), { method: "POST", body: { token }, auth: false });

/** A player buzzes. playerToken is the lobby-signed game token. accepted = false when the buzz didn't count. */
export const buzz = (id: string, playerToken: string) =>
    apiFetch<{ accepted: boolean }>(GameplayPaths.buzz(id), { method: "POST", auth: false, headers: { "X-Player-Token": playerToken } });

/** Host controls. Each returns the full session (with answers); every screen also gets the change live. */
export const hostControls = {
    selectClue: (id: string, clueId: string) => apiFetch<GameSession>(GameplayPaths.selectClue(id, clueId), { method: "POST" }),
    openBuzzers: (id: string) => apiFetch<GameSession>(GameplayPaths.openBuzzers(id), { method: "POST" }),
    judge: (id: string, correct: boolean) => apiFetch<GameSession>(GameplayPaths.judge(id), { method: "POST", body: { correct } }),
    closeClue: (id: string) => apiFetch<GameSession>(GameplayPaths.closeClue(id), { method: "POST" }),
    adjustScore: (id: string, teamId: string, delta: number) =>
        apiFetch<GameSession>(GameplayPaths.teamScore(id, teamId), { method: "POST", body: { delta } }),
    setScore: (id: string, teamId: string, score: number) =>
        apiFetch<GameSession>(GameplayPaths.teamScore(id, teamId), { method: "POST", body: { score } }),
};
