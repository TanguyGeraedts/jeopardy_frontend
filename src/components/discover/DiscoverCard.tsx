import Link from "next/link";
import { Play } from "@phosphor-icons/react/ssr";
import { count, playedText } from "@/lib/format";
import { LinkButton } from "@/components/ui/LinkButton";
import { MiniBoard } from "@/components/quiz/MiniBoard";
import { TopicChips } from "@/components/quiz/TopicChips";
import type { DiscoverQuiz } from "@/types";

/** A published quiz in Discover: its board's shape first, then who made it and how often it was played. */
export function DiscoverCard({ quiz }: { quiz: DiscoverQuiz }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-lg bg-desk">
      <Link href={`/quizzes/${quiz.id}`} className="block p-3 pb-0 transition hover:brightness-125">
        <MiniBoard categories={quiz.categories} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4 pt-3">
        <Link href={`/quizzes/${quiz.id}`} className="min-w-0 hover:text-gold">
          <h3 className="truncate font-display text-3xl leading-tight tracking-wide">{quiz.name}</h3>
        </Link>
        <p className="text-sm text-chalk/60">
          {quiz.mine ? "Yours" : `by ${quiz.authorName ?? "someone"}`}. {count(quiz.categories.length, "category", "categories")},{" "}
          {count(quiz.questionCount, "question", "questions")}.
        </p>
        <TopicChips topics={quiz.topics} />
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <p className="text-sm text-chalk/50">{playedText(quiz.timesPlayed)}</p>
          <LinkButton href={`/quizzes/${quiz.id}/host`} size="sm">
            <Play weight="fill" aria-hidden />
            Host
          </LinkButton>
        </div>
      </div>
    </li>
  );
}
