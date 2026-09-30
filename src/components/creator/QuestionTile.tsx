"use client";

import { useState } from "react";
import { useQuizEditor } from "@/providers/QuizEditorProvider";
import type { Question } from "@/types";
import { Button } from "@/components/ui/Button";
import { ConfirmDelete } from "@/components/ui/ConfirmDelete";
import { QuestionForm } from "./QuestionForm";

export function QuestionTile({ categoryId, question }: { categoryId: string; question: Question }) {
  const editor = useQuizEditor();
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li>
        <QuestionForm
          initial={question}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (body) => {
            await editor.updateQuestion(categoryId, question.id, body);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-white/10 bg-jeopardy-board p-3">
      <div className="flex items-center justify-between">
        <span className="text-2xl font-extrabold text-jeopardy-gold">{question.points}</span>
        <div className="flex gap-1.5 text-[10px] font-semibold uppercase">
          {question.dailyDouble && <span className="rounded bg-jeopardy-gold px-1.5 py-0.5 text-jeopardy-navy">Daily double</span>}
          {question.answerType !== "TEXT" && <span className="rounded bg-white/15 px-1.5 py-0.5">{question.answerType}</span>}
        </div>
      </div>
      <p className="mt-2 text-sm">{question.questionText}</p>
      <p className="mt-1 text-xs text-white/50">Answer: {question.answerText}</p>
      {question.mediaUrl && <p className="mt-1 truncate text-xs text-sky-300">{question.mediaUrl}</p>}

      <div className="mt-2 flex items-start gap-1 border-t border-white/10 pt-2">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          Edit
        </Button>
        <ConfirmDelete prompt={`Delete this ${question.points} point question?`} onConfirm={() => editor.removeQuestion(categoryId, question.id)} />
      </div>
    </li>
  );
}
