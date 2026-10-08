"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ApiError, errorMessage, toApiError } from "@/lib/api/client";
import { handoffGameSession } from "@/lib/api/sessions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Handoff = "none" | "sending" | "done" | "error";

/**
 * What a player sees after the lobby host starts the game (the lobby redirects here: gameLaunchUrl = /play/{gameSessionId}).
 * The lobby adds ?lobby=CODE&player=PLAYER_ID. The lobby host's browser also arrives with #handoff=<signed token>:
 * this page gives it to our backend, which imports the players and starts the game. Other players have no token.
 * Placeholder: the buzzer isn't wired up yet.
 */
export function PlayerGame({ gameSessionId }: { gameSessionId: string }) {
  const params = useSearchParams();
  const lobbyCode = params.get("lobby");
  const playerId = params.get("player");
  const [handoff, setHandoff] = useState<Handoff>("none");
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false); // effects run twice in dev; a handoff token may only be used once

  useEffect(() => {
    if (handled.current) return;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("handoff");
    if (!token) return;
    handled.current = true;

    // Take the token out of the address bar right away.
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    setHandoff("sending");
    handoffGameSession(gameSessionId, token)
      .then(() => setHandoff("done"))
      .catch((e) => {
        // 409 = the game was already started (e.g. a refresh): nothing to do.
        if (toApiError(e) instanceof ApiError && toApiError(e).status === 409) return setHandoff("done");
        setError(errorMessage(e));
        setHandoff("error");
      });
  }, [gameSessionId]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-10 text-center">
      <h1 className="text-3xl font-extrabold text-jeopardy-gold">Game in progress</h1>
      {handoff === "sending" && <p className="text-sm text-white/60">Starting the game&hellip;</p>}
      {handoff === "error" && <p role="alert" className="text-sm text-red-300">Could not start the game: {error}</p>}
      <Card className="w-full space-y-1 text-sm text-white/60">
        <p>Game session <span className="font-mono text-white/80">{gameSessionId}</span></p>
        {lobbyCode && <p>Lobby <span className="font-mono text-white/80">{lobbyCode}</span></p>}
        {playerId && <p>Player <span className="font-mono text-white/80">{playerId}</span></p>}
      </Card>
      {/* TODO: POST a buzz to the game service as `playerId`. */}
      <Button disabled className="h-32 w-full text-3xl">BUZZ</Button>
      <p className="text-sm text-white/50">The buzzer isn&apos;t wired up yet.</p>
    </div>
  );
}
