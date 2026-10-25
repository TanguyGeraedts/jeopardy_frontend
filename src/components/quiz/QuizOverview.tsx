"use client";

import { Play } from "@phosphor-icons/react";
import { useHostableQuiz } from "@/hooks/useHostableQuiz";
import { count, playedText } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { Spinner } from "@/components/ui/Spinner";
import { BackLink } from "@/components/ui/BackLink";
import { DeleteQuizButton } from "@/components/creator/DeleteQuizButton";
import { TopicChips } from "./TopicChips";

/**
 * Landing page for one quiz: yours, or someone else's published one. Shows the board's shape, never the questions.
 * Anyone may host it; only the owner sees Edit and Delete (the backend decides who may actually change it).
 */
export function QuizOverview({ quizId }: { quizId: string }) {
  const state = useHostableQuiz(quizId);

  if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
  if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;

  const { quiz } = state;
  const playable = quiz.questionCount > 0;

  return (
    <div className="space-y-8">
      <BackLink href={quiz.mine ? "/creator" : "/discover"}>{quiz.mine ? "My quizzes" : "Discover"}</BackLink>

      <div className="space-y-3">
        <h1 className="font-display text-6xl tracking-wide">{quiz.name}</h1>
        <p className="text-chalk/60">
          {quiz.mine ? (quiz.published ? "Yours, public in Discover." : "Yours, private.") : `by ${quiz.authorName ?? "someone"}.`}{" "}
          {count(quiz.categories.length, "category", "categories")}, {count(quiz.questionCount, "question", "questions")}. {playedText(quiz.timesPlayed)}.
        </p>
        <TopicChips topics={quiz.topics} />
      </div>

      <div className="flex flex-wrap items-start gap-3">
        {playable ? (
          <LinkButton href={`/quizzes/${quiz.id}/host`}><Play weight="fill" aria-hidden />Host this quiz</LinkButton>
        ) : (
          <Button disabled><Play weight="fill" aria-hidden />Host this quiz</Button>
        )}
        {quiz.mine && (
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
          {quiz.mine ? "Add some questions with Edit before anyone can play this quiz." : "This quiz has no questions yet."}
        </p>
      )}

      {quiz.categories.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">On the board</h2>
          {/* The category row as players will see it. The questions stay hidden until the game. */}
          <ul className="grid gap-1.5 bg-studio-night" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(10rem, 1fr))` }}>
            {quiz.categories.map((category, i) => (
              <li key={i} className="flex min-h-24 flex-col items-center justify-center rounded-md bg-board-blue px-3 py-4 text-center">
                <p className="line-clamp-2 font-display text-2xl uppercase leading-tight tracking-wide">{category.name}</p>
                <p className="mt-1 text-xs text-chalk/70">{count(category.questionCount, "question", "questions")}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
