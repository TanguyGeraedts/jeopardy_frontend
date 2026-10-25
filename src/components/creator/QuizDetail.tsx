"use client";

import Link from "next/link";
import { useIsOwner } from "@/hooks/useIsOwner";
import { useQuiz } from "@/hooks/useQuiz";
import { QuizEditorProvider } from "@/providers/QuizEditorProvider";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { BackLink } from "@/components/ui/BackLink";
import { DeleteQuizButton } from "./DeleteQuizButton";
import { EditorToolbar } from "./EditorToolbar";
import { QuizBoard } from "./QuizBoard";
import { QuizHeader } from "./QuizHeader";

/** The quiz editor. data-wide lets the site layout give the board (and its side panel) the full window width. */
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
      <div data-wide className="space-y-6">
        <BackLink href="/creator">My quizzes</BackLink>
        <div className="space-y-3">
          <QuizHeader quiz={quiz} onUpdated={setQuiz} />
          <EditorToolbar quiz={quiz} onUpdated={setQuiz} />
        </div>
        <QuizBoard quiz={quiz} />
        <div className="flex justify-end border-t border-white/10 pt-6">
          <DeleteQuizButton quizId={quiz.id} quizName={quiz.name} />
        </div>
      </div>
    </QuizEditorProvider>
  );
}
