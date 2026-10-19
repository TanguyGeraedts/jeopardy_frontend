"use client";

import { useEffect, useState } from "react";
import { GameplayPaths } from "@/lib/api/paths";
import type { GameSession } from "@/types";

export type LiveSessionState =
    | { status: "connecting" }
    | { status: "live"; session: GameSession }
    /** Lost the stream; EventSource retries on its own. Keeps the last known session if there was one. */
    | { status: "reconnecting"; session: GameSession | null };

/**
 * The public, live view of a game session (no answers) over Server-Sent Events.
 * The backend sends the whole session on connect and after every change, so this is always the latest state.
 */
export function useLiveSession(sessionId: string) {
    const [state, setState] = useState<LiveSessionState>({ status: "connecting" });

    useEffect(() => {
        const source = new EventSource(GameplayPaths.events(sessionId));

        source.addEventListener("session", (event) => {
            setState({ status: "live", session: JSON.parse((event as MessageEvent<string>).data) as GameSession });
        });
        source.onerror = () =>
            setState((prev) => ({ status: "reconnecting", session: prev.status === "connecting" ? null : prev.session }));

        return () => source.close();
    }, [sessionId]);

    return state;
}
