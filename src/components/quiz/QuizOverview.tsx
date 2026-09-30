"use client";

import Link from "next/link";
import { useIsOwner } from "@/hooks/useIsOwner";
import { useQuiz } from "@/hooks/useQuiz";
import { countQuestions } from "@/lib/quiz-state";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";
import { Spinner } from "@/components/ui/Spinner";
import { DeleteQuizButton } from "@/components/creator/DeleteQuizButton";

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Landing page for one quiz. Everyone can play it; only the owner sees Edit and Delete.
 * (Hiding the buttons is UX. The backend decides who may actually change or delete.)
 */
export function QuizOverview({ quizId }: { quizId: string }) {
  const { state } = useQuiz(quizId);
  const owner = useIsOwner(quizId);

  if (state.status === "loading" || owner.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;

  const { quiz } = state;
  const questionCount = countQuestions(quiz);
  const playable = questionCount > 0;

  return (
    <div className="space-y-8">
      <Link href="/creator" className="text-sm text-white/50 hover:text-white">
        &lsaquo; My quizzes
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-extrabold">{quiz.name}</h1>
          {owner.isOwner && (
            <span className="rounded-full bg-jeopardy-gold/15 px-2.5 py-0.5 text-xs font-semibold text-jeopardy-gold">Your quiz</span>
          )}
        </div>
        <p className="mt-1 text-white/50">
          {count(quiz.categories.length, "category", "categories")} · {count(questionCount, "question", "questions")}
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {playable ? (
          <LinkButton href={`/quizzes/${quiz.id}/play`}>&#9654; Play</LinkButton>
        ) : (
          <Button disabled>&#9654; Play</Button>
        )}
        {owner.isOwner && (
          <>
            <LinkButton href={`/creator/quizzes/${quiz.id}`} variant="secondary">
              Edit
            </LinkButton>
            <div className="ml-auto">
              <DeleteQuizButton quizId={quiz.id} quizName={quiz.name} />
            </div>
          </>
        )}
      </div>
      {!playable && (
        <p className="text-sm text-white/50">
          {owner.isOwner ? "Add some questions with Edit before anyone can play this quiz." : "This quiz has no questions yet."}
        </p>
      )}

      {quiz.categories.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold">Categories</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quiz.categories.map((category) => (
              <li key={category.id}>
                <Card className="p-4">
                  <p className="truncate font-semibold">{category.name}</p>
                  <p className="text-sm text-white/50">{count(category.questions.length, "question", "questions")}</p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
