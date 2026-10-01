"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuiz } from "@/hooks/useQuiz";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import type { LobbyForm, LobbyRequest } from "@/types";
import { AdminMenu } from "./AdminMenu";
import { LobbySetup } from "./LobbySetup";

type Phase = { status: "setup" } | { status: "live"; request: LobbyRequest; code: string };

// Mock lobby code until the lobby service hands out real ones.
const mockCode = () => Array.from({ length: 5 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

/**
 * Everything the host sees before and during a game.
 * Setup first (pick the mode and lobby settings), then the admin menu, which stays open on a second screen.
 */
export function HostScreen({ quizId }: { quizId: string }) {
  const { state } = useQuiz(quizId);
  const [phase, setPhase] = useState<Phase>({ status: "setup" });
  // Kept so "Edit lobby settings" reopens the form as it was.
  const [form, setForm] = useState<LobbyForm | undefined>();

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;
  const { quiz } = state;

  if (phase.status === "live") {
    return <AdminMenu quizId={quiz.id} quizName={quiz.name} lobby={phase.request} lobbyCode={phase.code} onEditSettings={() => setPhase({ status: "setup" })} />;
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
      <LobbySetup
        initial={form}
        onCreate={(request, submitted) => {
          // TODO(lobby): POST `request` to the lobby service and use the code it returns.
          setForm(submitted);
          setPhase({ status: "live", request, code: mockCode() });
        }}
      />
    </div>
  );
}
