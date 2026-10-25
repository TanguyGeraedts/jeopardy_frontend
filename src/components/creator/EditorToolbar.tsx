"use client";

import { Play, Tag } from "@phosphor-icons/react";
import { useState } from "react";
import { useAuthorName } from "@/hooks/useAuthorName";
import { errorMessage } from "@/lib/api/client";
import { setPublished, setTopics } from "@/lib/api/quizzes";
import { countQuestions } from "@/lib/quiz-state";
import { Button } from "@/components/ui/Button";
import { LinkButton } from "@/components/ui/LinkButton";
import { PublishSwitch } from "@/components/quiz/PublishSwitch";
import { TopicChips, TopicPicker } from "@/components/quiz/TopicChips";
import type { Quiz, QuizTopic } from "@/types";

/** Next to the quiz name: who can find it (Public), what it's about (topics), and Host. */
export function EditorToolbar({ quiz, onUpdated }: { quiz: Quiz; onUpdated: (quiz: Quiz) => void }) {
  const authorName = useAuthorName();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickingTopics, setPickingTopics] = useState(false);
  const playable = countQuestions(quiz) > 0;

  async function act(action: () => Promise<Quiz>) {
    setBusy(true);
    setError(null);
    try {
      onUpdated(await action());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <PublishSwitch
          published={quiz.published}
          busy={busy}
          disabled={!quiz.published && !playable}
          onToggle={() => act(() => setPublished(quiz.id, !quiz.published, authorName))}
        />
        <div className="flex flex-wrap items-center gap-1.5">
          <TopicChips topics={quiz.topics} />
          <button
            type="button"
            aria-expanded={pickingTopics}
            onClick={() => setPickingTopics((p) => !p)}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs text-chalk/60 hover:bg-white/[0.07] hover:text-chalk"
          >
            <Tag weight="bold" aria-hidden />
            {quiz.topics.length === 0 ? "Add topics" : "Edit topics"}
          </button>
        </div>
        <div className="ml-auto">
          {playable ? (
            <LinkButton href={`/quizzes/${quiz.id}/host`}>
              <Play weight="fill" aria-hidden />
              Host
            </LinkButton>
          ) : (
            <Button disabled title="Add a question first">
              <Play weight="fill" aria-hidden />
              Host
            </Button>
          )}
        </div>
      </div>
      {pickingTopics && (
        <div className="max-w-2xl space-y-2 rounded-lg bg-desk p-4">
          <TopicPicker value={quiz.topics} disabled={busy} onChange={(topics: QuizTopic[]) => act(() => setTopics(quiz.id, topics))} />
          <Button size="sm" variant="ghost" onClick={() => setPickingTopics(false)}>
            Done
          </Button>
        </div>
      )}
      {!quiz.published && !playable && <p className="text-xs text-chalk/45">Add a question before you can make it public.</p>}
      {error && <p role="alert" className="text-sm text-buzzer-red">{error}</p>}
    </div>
  );
}
