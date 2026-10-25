"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { useLiveSession } from "@/hooks/useLiveSession";
import { ApiError, errorMessage, toApiError } from "@/lib/api/client";
import { buzz, handoffGameSession } from "@/lib/api/sessions";
import { decodeSessionUser } from "@/lib/auth/jwt";
import { buzzTime } from "@/lib/buzz-times";
import { ordinal, rankTeams } from "@/lib/ranking";
import { cn } from "@/lib/cn";
import { sessionTeamStyle } from "@/lib/team-colors";
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
    // A full-screen app on the phone: exactly the screen's height, no page scroll or pull-to-refresh mid-game.
    <div className="fixed inset-0 mx-auto flex max-w-md flex-col overscroll-none bg-studio-night pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-center">
      {handoff === "sending" && <p className="pt-2 text-sm text-chalk/60">Starting the game&hellip;</p>}
      {handoff === "error" && <p role="alert" className="px-5 pt-2 text-sm text-buzzer-red">Could not start the game: {handoffError}</p>}

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
  // Place in line skips locked-out teams; the time is measured against the very first buzz, like on the board.
  const place = session.buzzes.filter((b) => !b.lockedOut).findIndex((b) => b.playerId === playerId);
  const myBuzz = session.buzzes.findIndex((b) => b.playerId === playerId);

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
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6">
        <p className="font-display text-5xl leading-none tracking-wide">You can watch, but not buzz</p>
        <p className="text-chalk/60">
          {session.state === "LOBBY"
            ? "Waiting for the game to start…"
            : "This browser didn't come from the lobby with a player pass. Rejoin through the lobby to get your buzzer."}
        </p>
      </div>
    );
  }

  const style = sessionTeamStyle(team?.colour, Math.max(teamIndex, 0));
  const score = team?.score ?? 0;

  return (
    <>
      {/* Who you are, pinned to the top: your team's colour along the edge, your score big on the right. */}
      <header className="shrink-0">
        <div className={cn("h-1.5", style.bar)} />
        <div className="flex items-end justify-between gap-4 px-5 pt-3 text-left">
          <div className="min-w-0">
            <p className="text-xs text-chalk/50">
              Lobby <span className="font-semibold tracking-wider text-chalk/70">{session.lobbyCode}</span>
            </p>
            <p className="truncate text-xl font-semibold">{me.name}</p>
            {!solo && team && <p className="truncate text-sm text-chalk/60">{team.name}</p>}
          </div>
          <p className={cn("font-display text-7xl leading-none tabular-nums", score < 0 ? "text-buzzer-red" : "text-gold")}>{score}</p>
        </div>
      </header>

      {session.state === "GAME_OVER" ? (
        <FinalPlace session={session} teamId={team?.id} solo={solo} />
      ) : (
        <>
          <div aria-live="polite" className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-6">
            <p className={cn("text-2xl font-semibold leading-snug", answering ? "text-gold" : "text-chalk/90")}>
              {statusText(session, playerId, team, place, answering)}
            </p>
            {myBuzz >= 0 && (
              <p className="text-chalk/70">
                {myBuzz === 0 ? "First buzz, " : `${ordinal(myBuzz + 1)} buzz, `}
                <span className="font-display text-3xl leading-none tracking-wide tabular-nums text-chalk">{buzzTime(session.buzzes, myBuzz)}</span>
                {myBuzz === 0 ? " after the buzzers opened" : " behind the first"}
              </p>
            )}
            {buzzError && <p role="alert" className="text-sm text-buzzer-red">{buzzError}</p>}
            {reconnecting && <p className="text-sm text-chalk/60">Reconnecting&hellip;</p>}
          </div>

          {/* The bottom half is the buzzer, right under your thumb. */}
          <div className="flex shrink-0 justify-center px-5 pb-6">
            <button
              type="button"
              disabled={!canBuzz || sending}
              // pointerdown, not click: fires on touch start, which is what counts in a race.
              onPointerDown={(e) => {
                e.preventDefault();
                press();
              }}
              // The show's buzzer, but on your phone: one big red button. Gold when it's your turn to answer.
              className={cn(
                "grid size-[min(86vw,46dvh)] select-none place-items-center rounded-full font-display text-[min(20vw,7rem)] leading-none tracking-wide shadow-2xl shadow-black/50 transition",
                answering
                  ? "bg-gold text-studio-night"
                  : canBuzz
                    ? "bg-buzzer-red text-white active:scale-95 active:brightness-110"
                    : "bg-desk text-chalk/30",
              )}
              style={{ touchAction: "manipulation" }}
            >
              {answering ? "You're up" : "Buzz"}
            </button>
          </div>
        </>
      )}
    </>
  );
}

/** The phone at the end: your place big, then the top three (the full podium is on the shared screen). */
function FinalPlace({ session, teamId, solo }: { session: GameSession; teamId: string | undefined; solo: boolean }) {
  const ranked = rankTeams(session);
  const mine = ranked.find((r) => r.team.id === teamId);
  const top = ranked.filter((r) => r.place <= 3);

  return (
    // Scrolls if the top three don't fit (ties can put more than three teams there).
    <div className="flex min-h-0 flex-1 flex-col justify-center gap-6 overflow-y-auto px-5 py-6">
      {mine && (
        <div className="space-y-1">
          <p className="text-chalk/70">{solo ? "You finished" : `${mine.team.name} finished`}</p>
          <p className={cn("font-display text-[9rem] leading-[0.85] tracking-wide", mine.place === 1 ? "text-gold" : "text-chalk")}>{ordinal(mine.place)}</p>
        </div>
      )}
      <ol className="space-y-2 text-left">
        {top.map((r) => (
          <li
            key={r.team.id}
            className={cn("flex items-center gap-3 overflow-hidden rounded-md bg-desk px-4 py-2", r.team.id === teamId && "ring-2 ring-gold")}
          >
            <span className="w-10 font-display text-3xl leading-none text-chalk/60">{ordinal(r.place)}</span>
            <span className="min-w-0 flex-1 truncate font-semibold">{r.team.name}</span>
            <span className={cn("font-display text-3xl leading-none tabular-nums", r.team.score < 0 && "text-buzzer-red")}>{r.team.score}</span>
          </li>
        ))}
      </ol>
    </div>
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
      // Same for everyone: the host picks (the backend's activeTeamId starts on the first team, so "your pick" was misleading).
      return "The host is picking a clue…";
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
