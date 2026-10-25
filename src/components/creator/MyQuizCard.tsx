"use client";

import { Copy, PencilSimple, Play, Tag } from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import { useAuthorName } from "@/hooks/useAuthorName";
import { errorMessage } from "@/lib/api/client";
import { duplicateQuiz, setPublished, setTopics } from "@/lib/api/quizzes";
import { count, playedText, timeAgo } from "@/lib/format";
import { countQuestions } from "@/lib/quiz-state";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { MiniBoard } from "@/components/quiz/MiniBoard";
import { PublishSwitch } from "@/components/quiz/PublishSwitch";
import { TopicChips, TopicPicker } from "@/components/quiz/TopicChips";
import type { Quiz, QuizTopic } from "@/types";

interface MyQuizCardProps {
  quiz: Quiz;
  /** The backend's quiz after a change, to show at once. */
  onChange: (quiz: Quiz) => void;
  onDuplicate: (copy: Quiz) => void;
}

/** One of your quizzes: its board, whether others can find it, its topics, and the things you do with it. */
export function MyQuizCard({ quiz, onChange, onDuplicate }: MyQuizCardProps) {
  const authorName = useAuthorName();
  const [busy, setBusy] = useState<"publish" | "topics" | "copy" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTopics, setEditingTopics] = useState(false);
  const questions = countQuestions(quiz);
  const board = quiz.categories.map((c) => ({ name: c.name, questionCount: c.questions.length }));

  async function act(kind: NonNullable<typeof busy>, action: () => Promise<void>) {
    setBusy(kind);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const togglePublished = () => act("publish", async () => onChange(await setPublished(quiz.id, !quiz.published, authorName)));
  const saveTopics = (topics: QuizTopic[]) => act("topics", async () => onChange(await setTopics(quiz.id, topics)));
  const duplicate = () => act("copy", async () => onDuplicate(await duplicateQuiz(quiz.id)));

  return (
    <li className="flex flex-col overflow-hidden rounded-lg bg-desk">
      <Link href={`/quizzes/${quiz.id}`} className="block p-3 pb-0 transition hover:brightness-125">
        <MiniBoard categories={board} />
      </Link>

      <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/quizzes/${quiz.id}`} className="min-w-0 hover:text-gold">
            <h3 className="truncate font-display text-3xl leading-tight tracking-wide">{quiz.name}</h3>
          </Link>
          <div className="pt-1.5">
            <PublishSwitch published={quiz.published} busy={busy === "publish"} disabled={!quiz.published && questions === 0} onToggle={togglePublished} />
          </div>
        </div>

        <p className="-mt-2 text-sm text-chalk/60">
          {count(quiz.categories.length, "category", "categories")}, {count(questions, "question", "questions")}. {playedText(quiz.timesPlayed)}.
          <span className="block text-chalk/45">Edited {timeAgo(quiz.updatedAt)}</span>
        </p>

        {editingTopics ? (
          <div className="space-y-2 rounded-md bg-studio-night/60 p-3">
            <TopicPicker value={quiz.topics} disabled={busy === "topics"} onChange={saveTopics} />
            <Button size="sm" variant="ghost" onClick={() => setEditingTopics(false)}>
              Done
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            <TopicChips topics={quiz.topics} />
            <button type="button" onClick={() => setEditingTopics(true)} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-chalk/55 hover:bg-white/[0.07] hover:text-chalk">
              <Tag weight="bold" aria-hidden />
              {quiz.topics.length === 0 ? "Add topics" : "Edit topics"}
            </button>
          </div>
        )}

        {!quiz.published && questions === 0 && <p className="text-xs text-chalk/45">Add a question before you can publish it.</p>}
        {error && <p role="alert" className="text-xs text-buzzer-red">{error}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {questions > 0 ? (
            <LinkButton href={`/quizzes/${quiz.id}/host`} size="sm">
              <Play weight="fill" aria-hidden />
              Host
            </LinkButton>
          ) : (
            <Button size="sm" disabled>
              <Play weight="fill" aria-hidden />
              Host
            </Button>
          )}
          <LinkButton href={`/creator/quizzes/${quiz.id}`} size="sm" variant="secondary">
            <PencilSimple weight="bold" aria-hidden />
            Edit
          </LinkButton>
          <Button size="sm" variant="ghost" loading={busy === "copy"} onClick={duplicate} className="ml-auto">
            {busy !== "copy" && <Copy weight="bold" aria-hidden />}
            Duplicate
          </Button>
        </div>
      </div>
    </li>
  );
}

