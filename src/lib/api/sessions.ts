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
