"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toApiError, type ApiError } from "@/lib/api/client";
import { getGameSession } from "@/lib/api/sessions";
import { GameplayPaths } from "@/lib/api/paths";
import { stampArrival } from "@/lib/arrival-clock";
import type { GameSession } from "@/types";

export type GameSessionState =
    | { status: "loading" }
    | { status: "error"; error: ApiError }
    | { status: "success"; session: GameSession };

/** Safety net in case the live stream silently drops (a proxy, a sleeping laptop). */
const FALLBACK_POLL_MS = 15_000;

/**
 * The full game session for the host's screens (with answers). Re-fetched whenever the live stream
 * says something changed, so buzzes show up right away. A failed refresh keeps the last good data.
 * `apply` shows a session returned by a host action at once, without waiting for the stream.
 */
export function useGameSession(sessionId: string) {
    const [state, setState] = useState<GameSessionState>({ status: "loading" });
    // Only the newest load may win: an older, slower response must not overwrite a newer state.
    const latest = useRef(0);

    const apply = useCallback((session: GameSession) => {
        latest.current++;
        setState({ status: "success", session: stampArrival(session) });
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        const load = async () => {
            const ticket = ++latest.current;
            try {
                const session = await getGameSession(sessionId, controller.signal);
                if (ticket === latest.current) setState({ status: "success", session: stampArrival(session) });
            } catch (error) {
                if (controller.signal.aborted || ticket !== latest.current) return;
                setState((prev) => (prev.status === "success" ? prev : { status: "error", error: toApiError(error) }));
            }
        };

        load();
        const source = new EventSource(GameplayPaths.events(sessionId));
        source.addEventListener("session", load);
        const poll = setInterval(load, FALLBACK_POLL_MS);

        return () => {
            controller.abort();
            source.close();
            clearInterval(poll);
        };
    }, [sessionId]);

    return { state, apply };
}
