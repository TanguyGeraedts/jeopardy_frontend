"use client";

import Link from "next/link";
import { useIsOwner } from "@/hooks/useIsOwner";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizEditorProvider } from "@/providers/QuizEditorProvider";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { DeleteQuizButton } from "./DeleteQuizButton";
import { QuizBoard } from "./QuizBoard";
import { QuizHeader } from "./QuizHeader";

export function QuizDetail({ quizId }: { quizId: string }) {
  const { state, setQuiz } = useQuiz(quizId);
  const owner = useIsOwner(quizId);

  if (state.status === "loading" || owner.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;
  if (!owner.isOwner) {
    // UX only: the backend refuses edits from non-owners anyway.
    return (
      <Alert tone="info" title="You can't edit this quiz">
        Only its owner can change it. <Link href={`/quizzes/${quizId}`} className="underline">Back to the quiz</Link>
      </Alert>
    );
  }

  const { quiz } = state;
  return (
    <QuizEditorProvider quizId={quiz.id} onQuizChange={setQuiz}>
      <div className="space-y-6">
        <Link href={`/quizzes/${quiz.id}`} className="text-sm text-white/50 hover:text-white">
          &lsaquo; Back to quiz
        </Link>
        <div className="flex items-start justify-between gap-4">
          <QuizHeader quiz={quiz} onUpdated={setQuiz} />
          <DeleteQuizButton quizId={quiz.id} quizName={quiz.name} />
        </div>
        <QuizBoard quiz={quiz} />
      </div>
    </QuizEditorProvider>
  );
}
