"use client";

import Link from "next/link";
import { useQuiz } from "@/hooks/useQuiz";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { AdminMenu } from "./AdminMenu";

/** The admin page of one game session. Everything comes from the URL, so a refresh (or a bookmark) lands back here. */
export function HostSession({ quizId, sessionId }: { quizId: string; sessionId: string }) {
  const { state } = useQuiz(quizId);

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;
  const { quiz } = state;

  return (
    <div className="space-y-6">
      <Link href={`/quizzes/${quiz.id}`} className="text-sm text-white/50 hover:text-white">
        &lsaquo; Back to quiz
      </Link>
      <AdminMenu quizId={quiz.id} quizName={quiz.name} sessionId={sessionId} />
    </div>
  );
}
