"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useHostableQuiz } from "@/hooks/useHostableQuiz";
import { errorMessage } from "@/lib/api/client";
import { createGameSession } from "@/lib/api/sessions";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { BackLink } from "@/components/ui/BackLink";
import type { CreateGameSessionRequest, LobbyForm, LobbyRequest } from "@/types";
import { LobbySetup } from "./LobbySetup";

/** Maps the setup form onto what the backend accepts. The backend decides the rest (lobby TTL, colours, late join, ...). */
function toCreateRequest(quizId: string, request: LobbyRequest): CreateGameSessionRequest {
  return request.teamCount === null
    ? { quizId, mode: "SOLO", maxPlayers: request.maxPlayers }
    : { quizId, mode: "TEAM", maxPlayers: request.maxPlayers, teamCount: request.teamCount };
}

/**
 * The host's setup screen: pick the mode and lobby settings and create the lobby.
 * Creating the lobby = creating a game session (the backend creates the lobby too). We then go to
 * /quizzes/{id}/host/{sessionId}, the admin menu, so a refresh keeps you on the same game.
 */
export function HostScreen({ quizId }: { quizId: string }) {
  const state = useHostableQuiz(quizId);
  const router = useRouter();
  // Kept so the form isn't reset if creating the lobby fails.
  const [form, setForm] = useState<LobbyForm | undefined>();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;
  const { quiz } = state;

  async function create(request: LobbyRequest, submitted: LobbyForm) {
    setForm(submitted);
    setCreating(true);
    setCreateError(null);
    try {
      const { gameSessionId } = await createGameSession(toCreateRequest(quiz.id, request));
      router.push(`/quizzes/${quiz.id}/host/${gameSessionId}`);
      return; // keep the button disabled while navigating
    } catch (error) {
      setCreateError(errorMessage(error));
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <BackLink href={`/quizzes/${quiz.id}`}>Back to quiz</BackLink>
      <div>
        <h1 className="font-display text-6xl tracking-wide">{quiz.name}</h1>
        <p className="mt-1 text-chalk/60">Set up the lobby before you play.</p>
      </div>
      {createError && <Alert title="Could not create the lobby">{createError}</Alert>}
      <LobbySetup initial={form} busy={creating} onCreate={create} />
    </div>
  );
}
