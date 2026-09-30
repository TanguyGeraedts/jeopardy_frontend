"use client";

import { useEffect, useId, useRef } from "react";
import { useQuizEditor } from "@/providers/QuizEditorProvider";
import type { Category, Question } from "@/types";
import { Button } from "@/components/ui/Button";
import { QuestionForm } from "./QuestionForm";

interface QuestionDialogProps {
  category: Category;
  /** Present = edit, absent = create. */
  question?: Question;
  /** Suggested points when creating (the row that was clicked). */
  points: number;
  onDelete: (categoryId: string, question: Question) => void;
  /** Fires however the dialog closes (save, cancel, Esc). */
  onClose: () => void;
}

/** Modal for adding or editing one question. Mount it to open it; it unmounts through onClose. */
export function QuestionDialog({ category, question, points, onDelete, onClose }: QuestionDialogProps) {
  const editor = useQuizEditor();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = () => ref.current?.close();
  const takenPoints = category.questions.filter((q) => q.id !== question?.id).map((q) => q.points);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className="m-auto max-h-[90vh] w-[min(30rem,94vw)] overflow-y-auto rounded-2xl border border-white/15 bg-jeopardy-navy p-5 text-white backdrop:bg-black/60"
    >
      <h2 id={titleId} className="mb-4 text-lg font-bold">
        {question ? "Edit question" : "New question"} <span className="text-sm font-normal text-white/50">in {category.name}</span>
      </h2>
      <QuestionForm
        initial={question ?? { points }}
        submitLabel={question ? "Save changes" : "Add question"}
        takenPoints={takenPoints}
        onCancel={close}
        onSubmit={async (body) => {
          if (question) await editor.updateQuestion(category.id, question.id, body);
          else await editor.addQuestion(category.id, body);
          close();
        }}
        extraActions={
          question && (
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => {
                close();
                onDelete(category.id, question);
              }}
            >
              Delete
            </Button>
          )
        }
      />
    </dialog>
  );
}
