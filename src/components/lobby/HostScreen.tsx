"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { errorMessage } from "@/lib/api/client";
import { createGameSession } from "@/lib/api/sessions";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import type { CreateGameSessionRequest, LobbyForm, LobbyRequest } from "@/types";
import { AdminMenu } from "./AdminMenu";
import { LobbySetup } from "./LobbySetup";

type Phase = { status: "setup" } | { status: "live"; request: LobbyRequest; sessionId: string };

/** Maps the setup form onto what the backend accepts. The backend decides the rest (lobby TTL, colours, late join, ...). */
function toCreateRequest(quizId: string, request: LobbyRequest): CreateGameSessionRequest {
  return request.teamCount === null
    ? { quizId, mode: "SOLO", maxPlayers: request.maxPlayers }
    : { quizId, mode: "TEAM", maxPlayers: request.maxPlayers, teamCount: request.teamCount };
}

/**
 * Everything the host sees before and during a game.
 * Setup first (pick the mode and lobby settings), then the admin menu, which stays open on a second screen.
 * Creating the lobby = creating a game session: the backend creates the lobby and hands us the session.
 */
export function HostScreen({ quizId }: { quizId: string }) {
  const { state } = useQuiz(quizId);
  const [phase, setPhase] = useState<Phase>({ status: "setup" });
  // Kept so "Edit lobby settings" reopens the form as it was.
  const [form, setForm] = useState<LobbyForm | undefined>();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;
  const { quiz } = state;

  if (phase.status === "live") {
    return <AdminMenu quizId={quiz.id} quizName={quiz.name} sessionId={phase.sessionId} lobby={phase.request} onEditSettings={() => setPhase({ status: "setup" })} />;
  }

  async function create(request: LobbyRequest, submitted: LobbyForm) {
    setForm(submitted);
    setCreating(true);
    setCreateError(null);
    try {
      const { gameSessionId } = await createGameSession(toCreateRequest(quiz.id, request));
      setPhase({ status: "live", request, sessionId: gameSessionId });
    } catch (error) {
      setCreateError(errorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href={`/quizzes/${quiz.id}`} className="text-sm text-white/50 hover:text-white">
        &lsaquo; Back to quiz
      </Link>
      <div>
        <h1 className="text-3xl font-extrabold">{quiz.name}</h1>
        <p className="mt-1 text-white/50">Set up the lobby before you play.</p>
      </div>
      {createError && <Alert title="Could not create the lobby">{createError}</Alert>}
      <LobbySetup initial={form} busy={creating} onCreate={create} />
    </div>
  );
}
