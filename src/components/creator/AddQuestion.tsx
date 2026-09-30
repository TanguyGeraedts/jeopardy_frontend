"use client";

import { useState } from "react";
import { nextPoints } from "@/lib/quiz-state";
import { useQuizEditor } from "@/providers/QuizEditorProvider";
import type { Category } from "@/types";
import { QuestionForm } from "./QuestionForm";

/** "+ Add question" that expands into the question form. */
export function AddQuestion({ category }: { category: Category }) {
  const editor = useQuizEditor();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-white/25 px-3 py-2 text-xs font-semibold text-white/60 transition hover:border-jeopardy-gold hover:text-jeopardy-gold"
      >
        + Add question
      </button>
    );
  }

  return (
    <QuestionForm
      initial={{ points: nextPoints(category) }}
      submitLabel="Add question"
      onCancel={() => setOpen(false)}
      onSubmit={async (body) => {
        await editor.addQuestion(category.id, body);
        setOpen(false);
      }}
    />
  );
}
