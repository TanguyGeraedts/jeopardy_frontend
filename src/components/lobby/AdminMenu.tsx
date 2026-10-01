"use client";

import { useMemo, useReducer, useState, type Dispatch } from "react";
import { adminReducer, canBuzz, initialAdmin, type AdminAction } from "@/lib/admin-state";
import { formatDuration, previewTeams } from "@/lib/lobby-config";
import { cn } from "@/lib/cn";
import { teamColor, teamColourStyle } from "@/lib/team-colors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import type { GameTeam, LobbyRequest } from "@/types";

const STEPS = [-500, -100, 100, 500] as const;

interface AdminMenuProps {
  quizId: string;
  quizName: string;
  lobby: LobbyRequest;
  /** Shown to players so they can join. Mocked until the lobby service exists. */
  lobbyCode: string;
  onEditSettings: () => void;
}

/**
 * The host's control panel, meant for a second screen while the board runs on the shared one.
 * Everything here is local state for now: each control becomes a command to the game service later.
 */
export function AdminMenu({ quizId, quizName, lobby, lobbyCode, onEditSettings }: AdminMenuProps) {
  // TODO(lobby): replace with the teams that actually joined.
  const teams = useMemo(() => previewTeams(lobby), [lobby]);
  const [admin, dispatch] = useReducer(adminReducer, teams, initialAdmin);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-extrabold">{quizName}</h1>
          <p className="text-white/50">Host controls</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={onEditSettings}>
            Edit lobby settings
          </Button>
          <LinkButton href={`/quizzes/${quizId}/play`} target="_blank" rel="noopener noreferrer">
            Open game board &#8599;
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-1">
          <p className="text-sm text-white/50">Lobby code</p>
          <p className="font-mono text-3xl font-extrabold tracking-widest text-jeopardy-gold">{lobbyCode}</p>
        </Card>
        <Card className="space-y-1">
          <p className="text-sm text-white/50">Mode</p>
          <p className="text-xl font-bold">{lobby.teamCount === null ? "Solo" : `Teams · ${lobby.teamCount}`}</p>
          <p className="text-sm text-white/50">
            {lobby.minPlayers}&ndash;{lobby.maxPlayers} players · {lobby.allowLateJoin ? "late join on" : "late join off"} · expires in {formatDuration(lobby.ttlSeconds)}
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
          <h2 className="text-xl font-bold">Teams</h2>
          <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "resetScores" })}>
            Reset all scores
          </Button>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {teams.map((team, index) => (
            <TeamRow key={team.id} team={team} index={index} lobby={lobby} score={admin.scores[team.id] ?? 0} buzzable={canBuzz(admin, team.id)} globallyBlocked={admin.allBuzzersBlocked} dispatch={dispatch} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function TeamRow({
  team,
  index,
  lobby,
  score,
  buzzable,
  globallyBlocked,
  dispatch,
}: {
  team: GameTeam;
  index: number;
  lobby: LobbyRequest;
  score: number;
  buzzable: boolean;
  globallyBlocked: boolean;
  dispatch: Dispatch<AdminAction>;
}) {
  const [draft, setDraft] = useState("");
  const colour = lobby.teamColours[index];
  const bar = colour ? teamColourStyle(colour).bar : teamColor(index).bar;
  const solo = team.players.length === 1 && team.players[0].name === team.name;

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
