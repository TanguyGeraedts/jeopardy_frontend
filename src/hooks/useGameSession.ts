"use client";

import { useEffect, useState } from "react";
import { toApiError, type ApiError } from "@/lib/api/client";
import { getGameSession } from "@/lib/api/sessions";
import type { GameSession } from "@/types";

export type GameSessionState =
    | { status: "loading" }
    | { status: "error"; error: ApiError }
    | { status: "success"; session: GameSession };

/**
 * Loads a game session and keeps it fresh by polling, so the admin menu picks up players
 * and teams as soon as the lobby host starts the game. A failed refresh keeps the last good data.
 */
export function useGameSession(sessionId: string, intervalMs = 2000) {
    const [state, setState] = useState<GameSessionState>({ status: "loading" });

    useEffect(() => {
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout>;

        const load = async () => {
            try {
                const session = await getGameSession(sessionId, controller.signal);
                setState({ status: "success", session });
            } catch (error) {
                if (controller.signal.aborted) return;
                setState((prev) => (prev.status === "success" ? prev : { status: "error", error: toApiError(error) }));
            }
            if (!controller.signal.aborted) timer = setTimeout(load, intervalMs);
        };
        load();

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [sessionId, intervalMs]);

    return state;
}
