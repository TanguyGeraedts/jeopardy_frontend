"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useState } from "react";
import { useDiscover } from "@/hooks/useDiscover";
import { cn } from "@/lib/cn";
import { count } from "@/lib/format";
import { TOPIC_LABELS } from "@/lib/topics";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { QUIZ_TOPICS, type DiscoverSort, type QuizTopic } from "@/types";
import { DiscoverCard } from "./DiscoverCard";

const SORTS: { value: DiscoverSort; label: string }[] = [
  { value: "POPULAR", label: "Most played" },
  { value: "NEWEST", label: "Newest" },
];

/** Everyone's published quizzes: search by name or author, filter by topic, host one. */
export function Discover() {
  const [q, setQ] = useState("");
  const [topic, setTopic] = useState<QuizTopic | null>(null);
  const [sort, setSort] = useState<DiscoverSort>("POPULAR");
  const state = useDiscover({ q, topic, sort });

  const quizzes = state.status === "success" ? state.quizzes : state.status === "loading" ? state.previous : null;
  const filtered = q.trim() !== "" || topic !== null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-6xl tracking-wide">Discover</h1>
        <p className="mt-1 text-chalk/60">Boards other people built. Pick one and host it for your group.</p>
      </div>

      <div className="space-y-4">
        <label className="relative block">
          <span className="sr-only">Search quizzes</span>
          <MagnifyingGlass weight="bold" aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-chalk/45" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by quiz name or author"
            className="w-full rounded-lg border border-white/12 bg-desk py-3.5 pl-12 pr-4 text-lg text-chalk placeholder:text-chalk/35 focus:border-chalk/50 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Scrolls sideways on a phone instead of wrapping into a wall of chips. */}
          <div role="group" aria-label="Topic" className="-mx-1 flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
            <TopicButton active={topic === null} onClick={() => setTopic(null)}>
              All topics
            </TopicButton>
            {QUIZ_TOPICS.map((t) => (
              <TopicButton key={t} active={topic === t} onClick={() => setTopic(topic === t ? null : t)}>
                {TOPIC_LABELS[t]}
              </TopicButton>
            ))}
          </div>
          <div role="group" aria-label="Sort" className="flex shrink-0 rounded-lg bg-desk p-1">
            {SORTS.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={sort === s.value}
                onClick={() => setSort(s.value)}
                className={cn("rounded-md px-3 py-1.5 text-sm transition", sort === s.value ? "bg-white/[0.12] font-semibold text-chalk" : "text-chalk/60 hover:text-chalk")}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {state.status === "error" ? (
        <Alert title={state.error.title}>{state.error.message}</Alert>
      ) : quizzes === null ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : quizzes.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/15 px-6 py-14 text-center text-chalk/55">
          {filtered
            ? "No quizzes match. Try another topic or fewer words."
            : "Nobody has published a quiz yet. Publish one of yours from My quizzes and it shows up here."}
        </p>
      ) : (
        <section aria-busy={state.status === "loading"} className={cn("space-y-3 transition-opacity", state.status === "loading" && "opacity-60")}>
          <p className="text-sm text-chalk/50">{count(quizzes.length, "quiz", "quizzes")}</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <DiscoverCard key={quiz.id} quiz={quiz} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function TopicButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition",
        active ? "bg-gold font-semibold text-studio-night" : "bg-white/[0.07] text-chalk/75 hover:bg-white/[0.14] hover:text-chalk",
      )}
    >
      {children}
    </button>
  );
}
