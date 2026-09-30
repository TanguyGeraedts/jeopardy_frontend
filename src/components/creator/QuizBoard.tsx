"use client";

import { Fragment, useState } from "react";
import { useBoard } from "@/hooks/useBoard";
import type { Quiz } from "@/types";
import { Button } from "@/components/ui/Button";
import { AddCategory } from "./AddCategory";
import { CategoryHeader } from "./CategoryHeader";
import { QuestionCell } from "./QuestionCell";
import { QuestionDialog } from "./QuestionDialog";
import { RowHeader } from "./RowHeader";

/** Which slot the open dialog is for. Ids, not objects, so the dialog always sees fresh data. */
interface DialogTarget {
  categoryId: string;
  points: number;
  questionId?: string;
}

/** Jeopardy grid: categories across, point values down. */
export function QuizBoard({ quiz }: { quiz: Quiz }) {
  const board = useBoard(quiz);
  const [target, setTarget] = useState<DialogTarget | null>(null);

  const dialogCategory = target && quiz.categories.find((c) => c.id === target.categoryId);
  const dialogQuestion = dialogCategory?.questions.find((q) => q.id === target?.questionId);

  const columns = [
    "7.5rem", // row headers
    ...(quiz.categories.length ? [`repeat(${quiz.categories.length}, minmax(10.5rem, 1fr))`] : []),
    "12rem", // "+ Add category"
  ].join(" ");

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50">
        Edit a category name or point value in place. Click a tile to edit it, or a + to add a question. ✕ beside a point value removes that row.
      </p>
      {quiz.categories.length === 0 && (
        <p className="rounded-lg border border-dashed border-white/15 p-6 text-center text-white/50">
          Add your first category to start building the board.
        </p>
      )}

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-max gap-1.5" style={{ gridTemplateColumns: columns }}>
          <span />
          {quiz.categories.map((category) => (
            <CategoryHeader key={category.id} category={category} onRename={board.renameCategory} onRemove={board.removeCategory} />
          ))}
          <AddCategory />

          {board.rows.map((points) => (
            <Fragment key={points}>
              <RowHeader points={points} onChange={(to) => board.changeRowPoints(points, to)} onRemove={() => board.removeRow(points)} />
              {quiz.categories.map((category) => (
                <QuestionCell
                  key={category.id}
                  category={category}
                  points={points}
                  question={category.questions.find((q) => q.points === points)}
                  onOpen={() =>
                    setTarget({ categoryId: category.id, points, questionId: category.questions.find((q) => q.points === points)?.id })
                  }
                />
              ))}
              <span />
            </Fragment>
          ))}
        </div>
      </div>

      <Button variant="secondary" onClick={board.addRow}>
        + Add row
      </Button>

      {target && dialogCategory && (
        <QuestionDialog
          key={`${target.categoryId}:${target.questionId ?? `new-${target.points}`}`}
          category={dialogCategory}
          question={dialogQuestion}
          points={target.points}
          onDelete={board.removeQuestion}
          onClose={() => setTarget(null)}
        />
      )}
    </div>
  );
}
