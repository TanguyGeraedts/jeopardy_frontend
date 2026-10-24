"use client";

import { Play } from "@phosphor-icons/react";
import { useIsOwner } from "@/hooks/useIsOwner";
import { useQuiz } from "@/hooks/useQuiz";
import { countQuestions } from "@/lib/quiz-state";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { Spinner } from "@/components/ui/Spinner";
import { BackLink } from "@/components/ui/BackLink";
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
      <BackLink href="/creator">My quizzes</BackLink>

      <div>
        <h1 className="font-display text-6xl tracking-wide">{quiz.name}</h1>
        <p className="mt-1 text-chalk/60">
          {count(quiz.categories.length, "category", "categories")}, {count(questionCount, "question", "questions")}
          {owner.isOwner && ". You made this quiz."}
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {playable ? (
          <LinkButton href={`/quizzes/${quiz.id}/host`}><Play weight="fill" aria-hidden />Play</LinkButton>
        ) : (
          <Button disabled><Play weight="fill" aria-hidden />Play</Button>
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
          <h2 className="text-lg font-semibold">On the board</h2>
          {/* The category row as players will see it. */}
          <ul className="grid gap-1.5 bg-studio-night" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(10rem, 1fr))` }}>
            {quiz.categories.map((category) => (
              <li key={category.id} className="flex min-h-24 flex-col items-center justify-center rounded-md bg-board-blue px-3 py-4 text-center">
                <p className="line-clamp-2 font-display text-2xl uppercase leading-tight tracking-wide">{category.name}</p>
                <p className="mt-1 text-xs text-chalk/70">{count(category.questions.length, "question", "questions")}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
