"use client";

import Link from "next/link";
import { useQuiz } from "@/hooks/useQuiz";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { QuizBoard } from "./QuizBoard";

export function QuizDetail({ quizId }: { quizId: string }) {
  const state = useQuiz(quizId);

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;

  const { quiz } = state;
  return (
    <div className="space-y-6">
      <div>
        <Link href="/creator" className="text-sm text-white/50 hover:text-white">
          &larr; Back
        </Link>
        <h1 className="mt-1 text-3xl font-extrabold">{quiz.name}</h1>
        <p className="text-xs text-white/40">{quiz.id}</p>
      </div>
      <QuizBoard quiz={quiz} />
    </div>
  );
}
