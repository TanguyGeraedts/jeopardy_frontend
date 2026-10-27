"use client";

import { MagnifyingGlass, Plus } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMyQuizzes } from "@/hooks/useMyQuizzes";
import { toApiError } from "@/lib/api/client";
import { createQuiz } from "@/lib/api/quizzes";
import { cn } from "@/lib/cn";
import { count } from "@/lib/format";
import { TOPIC_LABELS } from "@/lib/topics";
import { validateQuizName } from "@/lib/validation/quiz";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { fieldClass } from "@/components/ui/fieldStyles";
import type { Quiz } from "@/types";
import { MyQuizCard } from "./MyQuizCard";

type Visibility = "ALL" | "PUBLIC" | "PRIVATE";
type Sort = "EDITED" | "NAME" | "PLAYED";

const VISIBILITY: { value: Visibility; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
];

const SORTS: Record<Sort, { label: string; compare: (a: Quiz, b: Quiz) => number }> = {
  EDITED: { label: "Recently edited", compare: (a, b) => b.updatedAt.localeCompare(a.updatedAt) },
  NAME: { label: "Name", compare: (a, b) => a.name.localeCompare(b.name) },
  PLAYED: { label: "Most played", compare: (a, b) => b.timesPlayed - a.timesPlayed },
};

/** Your quizzes: make a new one, find one, and publish, tag, copy or host them right from the list. */
export function MyQuizzes() {
  const { state, replace, add } = useMyQuizzes();
  const [q, setQ] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("ALL");
  const [sort, setSort] = useState<Sort>("EDITED");

  const quizzes = state.status === "success" ? state.quizzes : null;
  const shown = useMemo(() => {
    if (!quizzes) return [];
    const needle = q.trim().toLowerCase();
    return quizzes
      .filter((quiz) => visibility === "ALL" || quiz.published === (visibility === "PUBLIC"))
      .filter((quiz) => !needle || quiz.name.toLowerCase().includes(needle) || quiz.topics.some((t) => TOPIC_LABELS[t].toLowerCase().includes(needle)))
      .sort(SORTS[sort].compare);
  }, [quizzes, q, visibility, sort]);

  const publicCount = quizzes?.filter((quiz) => quiz.published).length ?? 0;
  const totalPlays = quizzes?.reduce((sum, quiz) => sum + quiz.timesPlayed, 0) ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-6xl tracking-wide">My quizzes</h1>
          <p className="mt-1 text-chalk/60">
            {quizzes && quizzes.length > 0
              ? `${count(quizzes.length, "quiz", "quizzes")}, ${publicCount} public. Hosted ${count(totalPlays, "time", "times")} in total.`
              : "Build a board: categories across, point values down."}
          </p>
        </div>
        <NewQuiz />
      </div>

      {state.status === "loading" && <div className="flex justify-center py-16"><Spinner /></div>}
      {state.status === "error" && <Alert title={state.error.title}>{state.error.message}</Alert>}

      {quizzes && quizzes.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/15 px-6 py-14 text-center text-chalk/55">
          You haven&apos;t made a quiz yet. Start one with New quiz, or host someone else&apos;s from Discover.
        </p>
      )}

      {quizzes && quizzes.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-56 flex-1">
              <span className="sr-only">Search your quizzes</span>
              <MagnifyingGlass weight="bold" aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-chalk/60" />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or topic" className={fieldClass(false, "pl-9")} />
            </label>
            <div role="group" aria-label="Show" className="flex rounded-lg bg-desk p-1">
              {VISIBILITY.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  aria-pressed={visibility === v.value}
                  onClick={() => setVisibility(v.value)}
                  className={cn("rounded-md px-3 py-1 text-sm transition", visibility === v.value ? "bg-white/[0.12] font-semibold text-chalk" : "text-chalk/60 hover:text-chalk")}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-chalk/60">
              Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={fieldClass(false, "w-auto py-1.5")}>
                {(Object.keys(SORTS) as Sort[]).map((s) => (
                  <option key={s} value={s}>
                    {SORTS[s].label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {shown.length === 0 ? (
            <p className="py-10 text-center text-chalk/55">None of your quizzes match.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((quiz) => (
                <MyQuizCard key={quiz.id} quiz={quiz} onChange={replace} onDuplicate={add} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

/** "New quiz" opens a one-field form in place; creating goes straight to the editor. */
function NewQuiz() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const invalid = validateQuizName(name);
    setError(invalid);
    if (invalid) return;
    setBusy(true);
    try {
      const quiz = await createQuiz({ name: name.trim() });
      router.push(`/creator/quizzes/${quiz.id}`);
    } catch (e) {
      const apiError = toApiError(e);
      setError(apiError.fieldErrors.name ?? apiError.message);
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus weight="bold" aria-hidden />
        New quiz
      </Button>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex w-full flex-wrap items-start gap-2 sm:w-auto">
      <div className="min-w-0 flex-1 sm:w-72">
        <input
          autoFocus
          aria-label="Quiz name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Name it, e.g. Friday pub quiz"
          aria-invalid={!!error}
          className={fieldClass(!!error)}
        />
        {error && <p className="mt-1 text-xs text-buzzer-red">{error}</p>}
      </div>
      <Button type="submit" loading={busy}>
        Create
      </Button>
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </form>
  );
}
