"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useLiveSession } from "@/hooks/useLiveSession";
import { ApiError, errorMessage, toApiError } from "@/lib/api/client";
import { buzz, handoffGameSession } from "@/lib/api/sessions";
import { decodeSessionUser } from "@/lib/auth/jwt";
import { cn } from "@/lib/cn";
import { sessionTeamStyle } from "@/lib/team-colors";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import type { GameSession } from "@/types";

type Handoff = "none" | "sending" | "done" | "error";

const tokenKey = (gameSessionId: string) => `jeopardy:player-token:${gameSessionId}`;

interface LaunchTokens {
  handoff: string | null;
  player: string | null;
}

/** Read once per page load: the fragment is gone after the first read. */
const launchTokens = new Map<string, LaunchTokens>();

/**
 * The tokens the lobby puts in the URL fragment (#handoff=...&player=...), read once and then removed from the
 * address bar. The player token is kept in sessionStorage so a refresh still has it.
 */
function readLaunchTokens(gameSessionId: string): LaunchTokens {
  const cached = launchTokens.get(gameSessionId);
  if (cached) return cached;

  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const handoff = fragment.get("handoff");
  let player = fragment.get("player");
  try {
    if (player) sessionStorage.setItem(tokenKey(gameSessionId), player);
    else player = sessionStorage.getItem(tokenKey(gameSessionId));
  } catch {
    // Storage blocked (private mode): the token still works until a refresh.
  }
  if (window.location.hash) window.history.replaceState(null, "", window.location.pathname + window.location.search);

  const tokens = { handoff, player };
  launchTokens.set(gameSessionId, tokens);
  return tokens;
}

const noSubscribe = () => () => {};

/** Null while rendering on the server. */
function useLaunchTokens(gameSessionId: string): LaunchTokens | null {
  return useSyncExternalStore(noSubscribe, () => readLaunchTokens(gameSessionId), () => null);
}

/**
 * What a player sees after the lobby host starts the game (the lobby redirects here: gameLaunchUrl = /play/{gameSessionId}).
 * The lobby host's browser also brings #handoff=<token>: given to our backend, which imports the players and starts the game.
 * Every player brings #player=<token>, their lobby-signed identity, which the buzz is sent with.
 */
export function PlayerGame({ gameSessionId }: { gameSessionId: string }) {
  const params = useSearchParams();
  const tokens = useLaunchTokens(gameSessionId);
  const [handoff, setHandoff] = useState<Handoff>("none");
  const [handoffError, setHandoffError] = useState<string | null>(null);
  const handled = useRef(false); // effects run twice in dev; a handoff token may only be used once
  const live = useLiveSession(gameSessionId);

  useEffect(() => {
    if (!tokens?.handoff || handled.current) return;
    handled.current = true;
    setHandoff("sending");
    handoffGameSession(gameSessionId, tokens.handoff)
      .then(() => setHandoff("done"))
      .catch((e) => {
        // 409 = the game was already started (e.g. a refresh): nothing to do.
        if (toApiError(e) instanceof ApiError && toApiError(e).status === 409) return setHandoff("done");
        setHandoffError(errorMessage(e));
        setHandoff("error");
      });
  }, [gameSessionId, tokens]);

  // The token is checked by the backend; here it only tells us who "me" is. ?player= is the fallback.
  const playerId = (tokens?.player && decodeSessionUser(tokens.player)?.sub) || params.get("player");
  const session = live.status === "connecting" ? null : live.session;

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col gap-5 py-6 text-center">
      {handoff === "sending" && <p className="text-sm text-white/60">Starting the game&hellip;</p>}
      {handoff === "error" && <p role="alert" className="text-sm text-red-300">Could not start the game: {handoffError}</p>}

      {!session ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white/60">
          <Spinner />
          <p>Connecting to the game&hellip;</p>
        </div>
      ) : (
        <PlayerScreen session={session} gameSessionId={gameSessionId} playerId={playerId} playerToken={tokens?.player ?? null} reconnecting={live.status === "reconnecting"} />
      )}
    </div>
  );
}

function PlayerScreen({
  session,
  gameSessionId,
  playerId,
  playerToken,
  reconnecting,
}: {
  session: GameSession;
  gameSessionId: string;
  playerId: string | null;
  playerToken: string | null;
  reconnecting: boolean;
}) {
  const me = session.players.find((p) => p.id === playerId);
  const teamIndex = session.teams.findIndex((t) => t.id === me?.teamId);
  const team = teamIndex >= 0 ? session.teams[teamIndex] : undefined;
  const solo = session.mode === "SOLO";

  const [sending, setSending] = useState(false);
  const [buzzError, setBuzzError] = useState<string | null>(null);

  const buzzing = session.state === "BUZZER_OPEN" || session.state === "ANSWER_EVALUATION";
  const canBuzz = buzzing && !!team?.canBuzz && !!playerToken && !reconnecting;
  const answering = session.answeringPlayerId === playerId;
  const place = session.buzzes.findIndex((b) => b.playerId === playerId);

  const press = useCallback(async () => {
    if (!canBuzz || sending || !playerToken) return;
    setSending(true);
    setBuzzError(null);
    try {
      const { accepted } = await buzz(gameSessionId, playerToken);
      if (accepted) navigator.vibrate?.(80);
    } catch (e) {
      setBuzzError(errorMessage(e));
    } finally {
      setSending(false);
    }
  }, [canBuzz, sending, playerToken, gameSessionId]);

  // Space bar buzzes too (laptops).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        press();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  if (!playerToken || !me) {
    return (
      <Card className="space-y-2">
        <p className="text-lg font-bold">You can watch, but not buzz</p>
        <p className="text-sm text-white/60">
          {session.state === "LOBBY"
            ? "Waiting for the game to start…"
            : "This browser didn't come from the lobby with a player pass. Rejoin through the lobby to get your buzzer."}
        </p>
      </Card>
    );
  }

  const style = sessionTeamStyle(team?.colour, Math.max(teamIndex, 0));

  return (
    <>
      <Card className="overflow-hidden p-0">
        <div className={cn("h-2", style.bar)} />
        <div className="flex items-center justify-between gap-3 px-4 py-3 text-left">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{me.name}</p>
            {!solo && team && <p className="truncate text-sm text-white/60">{team.name}</p>}
          </div>
          <p className={cn("text-4xl font-extrabold tabular-nums", (team?.score ?? 0) < 0 && "text-red-400")}>{team?.score ?? 0}</p>
        </div>
      </Card>

      <p aria-live="polite" className={cn("min-h-14 text-xl font-bold", answering ? "text-jeopardy-gold" : "text-white/80")}>
        {statusText(session, playerId, team, place, answering)}
      </p>

      <button
        type="button"
        disabled={!canBuzz || sending}
        // pointerdown, not click: fires on touch start, which is what counts in a race.
        onPointerDown={(e) => {
          e.preventDefault();
          press();
        }}
        className={cn(
          "mx-auto grid aspect-square w-full max-w-xs select-none place-items-center rounded-full text-5xl font-black tracking-wider shadow-2xl transition",
          canBuzz ? "bg-red-600 text-white active:scale-95 active:bg-red-500" : "bg-white/10 text-white/30",
          answering && "bg-jeopardy-gold text-jeopardy-navy ring-8 ring-jeopardy-gold/40",
        )}
        style={{ touchAction: "manipulation" }}
      >
        {answering ? "YOU'RE UP" : "BUZZ"}
      </button>

      {buzzError && <p role="alert" className="text-sm text-red-300">{buzzError}</p>}
      {reconnecting && <p className="text-sm text-white/50">Reconnecting&hellip;</p>}
    </>
  );
}

function statusText(
  session: GameSession,
  playerId: string | null,
  team: GameSession["teams"][number] | undefined,
  place: number,
  answering: boolean,
): string {
  switch (session.state) {
    case "LOBBY":
      return "Waiting for the game to start…";
    case "BOARD_SELECTION":
      return session.activeTeamId && session.activeTeamId === team?.id ? "Your pick! Tell the host a clue." : "The host is picking a clue…";
    case "CLUE_READING":
      return "Listen… buzzers open soon.";
    case "GAME_OVER":
      return "Game over!";
    case "BUZZER_OPEN":
    case "ANSWER_EVALUATION": {
      if (answering) return "You're up! Answer out loud.";
      const answeringPlayer = session.players.find((p) => p.id === session.answeringPlayerId);
      if (answeringPlayer && answeringPlayer.teamId === team?.id) return `${answeringPlayer.name} is answering for your team.`;
      if (place > 0) return `You're #${place + 1} in line.`;
      if (team?.lockedOut) return "Wrong answer: you're out for this clue.";
      if (team && session.buzzes.some((b) => b.teamId === team.id && b.playerId !== playerId)) return "A teammate already buzzed.";
      return session.state === "BUZZER_OPEN" ? "Buzz now!" : "Buzz to get in line!";
    }
  }
}
