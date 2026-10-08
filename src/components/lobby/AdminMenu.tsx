"use client";

import { useMemo, useReducer, useState, type Dispatch } from "react";
import { useGameSession } from "@/hooks/useGameSession";
import { adminReducer, canBuzz, initialAdmin, type AdminAction } from "@/lib/admin-state";
import { cn } from "@/lib/cn";
import { teamColor, teamColourStyle } from "@/lib/team-colors";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { TEAM_COLOURS } from "@/types";
import type { GameSession, GameTeam, TeamColour } from "@/types";

const STEPS = [-500, -100, 100, 500] as const;

interface AdminMenuProps {
  quizId: string;
  quizName: string;
  /** The game session created for this lobby. Everything shown here is read from it. */
  sessionId: string;
}

const STATE_LABELS: Record<GameSession["state"], string> = {
  LOBBY: "Waiting for the lobby host to start",
  BOARD_SELECTION: "Game running · picking a clue",
  CLUE_READING: "Game running · reading a clue",
  BUZZER_OPEN: "Game running · buzzers open",
  ANSWER_EVALUATION: "Game running · evaluating an answer",
  GAME_OVER: "Game over",
};

const asColour = (value: string | null): TeamColour | undefined => TEAM_COLOURS.find((c) => c === value?.toUpperCase());

/** Turns the backend's flat teams/players lists into the teams the admin screen renders. */
function toGameTeams(session: GameSession): GameTeam[] {
  return session.teams.map((team) => ({
    id: team.id,
    name: team.name,
    players: session.players.filter((p) => p.teamId === team.id).map((p) => ({ id: p.id, name: p.name })),
  }));
}

/**
 * The host's control panel, meant for a second screen while the board runs on the shared one.
 * Lobby code, mode, teams and players come from the game session (polled). Score and buzzer controls
 * are still local state: each becomes a command to the game service later.
 */
export function AdminMenu({ quizId, quizName, sessionId }: AdminMenuProps) {
  const sessionState = useGameSession(sessionId);

  if (sessionState.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (sessionState.status === "error") {
    return (
      <div className="space-y-4">
        <Alert title={sessionState.error.title}>{sessionState.error.message}</Alert>
        <LinkButton href={`/quizzes/${quizId}/host`} variant="ghost">Back to lobby settings</LinkButton>
      </div>
    );
  }
  const { session } = sessionState;

  return <AdminPanel key={session.teams.map((t) => t.id).join(",")} quizId={quizId} quizName={quizName} session={session} />;
}

function AdminPanel({ quizId, quizName, session }: { quizId: string; quizName: string; session: GameSession }) {
  const teams = useMemo(() => toGameTeams(session), [session]);
  // Seeded from the server's scores. The panel remounts (see key above) when the set of teams changes, e.g. after the lobby starts.
  const [admin, dispatch] = useReducer(adminReducer, teams, (t) => ({ ...initialAdmin(t), scores: Object.fromEntries(session.teams.map((team) => [team.id, team.score])) }));
  const solo = session.mode === "SOLO";
  const started = session.state !== "LOBBY";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-extrabold">{quizName}</h1>
          <p className="text-white/50">Host controls</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <LinkButton href={`/quizzes/${quizId}/host`} variant="ghost">
            New lobby
          </LinkButton>
          <LinkButton href={`/quizzes/${quizId}/play`} target="_blank" rel="noopener noreferrer">
            Open game board &#8599;
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-sm text-white/50">Lobby code</p>
          <p className="font-mono text-3xl font-extrabold tracking-widest text-jeopardy-gold">{session.lobbyCode}</p>
          <p className="text-sm text-white/50">{STATE_LABELS[session.state]}</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-sm text-white/50">Mode</p>
          <p className="text-xl font-bold">{solo ? "Solo" : session.teams.length > 0 ? `Teams · ${session.teams.length}` : "Teams"}</p>
          <p className="text-sm text-white/50">
            {started ? `${session.players.length} player${session.players.length === 1 ? "" : "s"} joined` : "Waiting for players"} · {session.clues.length} clues on the board
          </p>
        </Card>
        <Card className={cn("space-y-3", admin.allBuzzersBlocked && "border-red-400/60 bg-red-500/10")}>
          <p className="text-sm text-white/50">Buzzers</p>
          <p className="text-xl font-bold">{admin.allBuzzersBlocked ? "All blocked" : "Open"}</p>
          <Button variant={admin.allBuzzersBlocked ? "primary" : "danger"} onClick={() => dispatch({ type: "toggleAll" })}>
            {admin.allBuzzersBlocked ? "Unblock all buzzers" : "Block all buzzers"}
          </Button>
        </Card>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{solo ? "Players" : "Teams"}</h2>
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "resetScores" })}>
            Reset all scores
          </Button>
        </div>
        {teams.length === 0 ? (
          <Card>
            <p className="text-white/70">
              Nobody is here yet. Players join with code <span className="font-mono font-bold text-jeopardy-gold">{session.lobbyCode}</span>; the first one to join is the lobby host and starts the game. Teams and players show up here once it starts.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {teams.map((team, index) => (
              <TeamRow key={team.id} team={team} index={index} colour={asColour(session.teams[index]?.colour ?? null)} solo={solo} score={admin.scores[team.id] ?? 0} buzzable={canBuzz(admin, team.id)} globallyBlocked={admin.allBuzzersBlocked} dispatch={dispatch} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function TeamRow({
  team,
  index,
  colour,
  solo,
  score,
  buzzable,
  globallyBlocked,
  dispatch,
}: {
  team: GameTeam;
  index: number;
  colour: TeamColour | undefined;
  solo: boolean;
  score: number;
  buzzable: boolean;
  globallyBlocked: boolean;
  dispatch: Dispatch<AdminAction>;
}) {
  const [draft, setDraft] = useState("");
  const bar = colour ? teamColourStyle(colour).bar : teamColor(index).bar;

  function applyDraft() {
    const value = Number(draft);
    if (draft.trim() === "" || !Number.isInteger(value)) return;
    dispatch({ type: "setScore", teamId: team.id, score: value });
    setDraft("");
  }

  return (
    <li>
      <Card className="space-y-3 overflow-hidden p-0">
        <div className={cn("h-1.5", bar)} />
        <div className="space-y-3 px-4 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-semibold">{team.name}</p>
              {!solo && <p className="truncate text-xs text-white/50">{team.players.map((p) => p.name).join(" · ") || "No players yet"}</p>}
            </div>
            <p className={cn("text-3xl font-extrabold tabular-nums", score < 0 && "text-red-400")}>{score}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STEPS.map((step) => (
              <Button key={step} size="sm" variant="secondary" onClick={() => dispatch({ type: "adjust", teamId: team.id, delta: step })}>
                {step > 0 ? `+${step}` : step}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              aria-label={`Set ${team.name} score`}
              placeholder="Set exact score"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyDraft()}
              className="w-40 rounded-md border border-white/15 bg-black/20 px-3 py-1.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-jeopardy-gold"
            />
            <Button size="sm" variant="secondary" onClick={applyDraft}>
              Set
            </Button>
            <Button
              size="sm"
              variant={buzzable ? "ghost" : "danger"}
              disabled={globallyBlocked}
              className="ml-auto"
              onClick={() => dispatch({ type: "toggleTeam", teamId: team.id })}
            >
              {buzzable ? "Block buzzer" : globallyBlocked ? "Blocked (all)" : "Unblock buzzer"}
            </Button>
          </div>
        </div>
      </Card>
    </li>
  );
}
