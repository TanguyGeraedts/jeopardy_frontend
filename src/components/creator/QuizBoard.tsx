"use client";

import { Plus } from "@phosphor-icons/react";
import { Fragment, useRef, useState } from "react";
import { useBoard } from "@/hooks/useBoard";
import { count } from "@/lib/format";
import type { Question, Quiz } from "@/types";
import { Button } from "@/components/ui/Button";
import { AddCategory } from "./AddCategory";
import { CategoryHeader } from "./CategoryHeader";
import { QuestionCell } from "./QuestionCell";
import { QuestionPanel, type QuestionPanelHandle } from "./QuestionPanel";
import { RowHeader } from "./RowHeader";

/** The slot open in the side panel. Ids, not objects, so the panel always sees fresh data. */
interface Target {
  categoryId: string;
  points: number;
  questionId?: string;
  /** New per opened slot: the panel's key. A new question getting its id (or moving points) keeps it. */
  openId: number;
}

type Slot = Omit<Target, "openId">;

/** Jeopardy grid, categories across and point values down, with the question being edited in a panel beside it. */
export function QuizBoard({ quiz }: { quiz: Quiz }) {
  const board = useBoard(quiz);
  const [target, setTarget] = useState<Target | null>(null);
  const panel = useRef<QuestionPanelHandle>(null);
  const opened = useRef(0);

  const slotAt = (categoryId: string, points: number): Slot => ({
    categoryId,
    points,
    questionId: quiz.categories.find((c) => c.id === categoryId)?.questions.find((q) => q.points === points)?.id,
  });
  // Previous/next walk down a category, then on to the next one: the way you fill a board.
  const slots = quiz.categories.flatMap((c) => board.rows.map((points) => slotAt(c.id, points)));
  const index = target ? slots.findIndex((s) => s.categoryId === target.categoryId && s.points === target.points) : -1;

  /** Every way out of the open slot goes through here, so an unsaved question is never lost by accident. */
  async function go(slot: Slot | null) {
    if (target && slot && slot.categoryId === target.categoryId && slot.points === target.points) return;
    if (panel.current && !(await panel.current.requestLeave())) return;
    setTarget(slot && { ...slot, openId: ++opened.current });
  }

  function remove(categoryId: string, question: Question) {
    setTarget(null);
    void board.removeQuestion(categoryId, question);
  }

  const panelCategory = target && quiz.categories.find((c) => c.id === target.categoryId);
  const panelQuestion = panelCategory?.questions.find((q) => q.id === target?.questionId);

  const total = quiz.categories.length * board.rows.length;
  const filled = quiz.categories.reduce((sum, c) => sum + c.questions.length, 0);
  const dailyDoubles = quiz.categories.reduce((sum, c) => sum + c.questions.filter((q) => q.dailyDouble).length, 0);

  const columns = ["6.5rem", ...(quiz.categories.length ? [`repeat(${quiz.categories.length}, minmax(9.5rem, 1fr))`] : []), "9.5rem"].join(" ");

  return (
    <div className="flex items-start gap-5">
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-sm text-chalk/60">
          {total === 0
            ? "Add a category to start the board."
            : `${filled} of ${total} tiles filled. ${count(dailyDoubles, "daily double", "daily doubles")}.`}
          <span className="text-chalk/40"> Click a tile to write its clue; names and values edit in place.</span>
        </p>

        <div className="overflow-x-auto rounded-md bg-studio-night pb-1">
          <div className="grid min-w-max gap-1.5 p-1.5" style={{ gridTemplateColumns: columns }}>
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
                    selected={target?.categoryId === category.id && target.points === points}
                    onOpen={() => go(slotAt(category.id, points))}
                  />
                ))}
                <span />
              </Fragment>
            ))}
          </div>
        </div>

        <Button variant="secondary" size="sm" onClick={board.addRow}>
          <Plus weight="bold" aria-hidden />
          Add a row
        </Button>
      </div>

      {target && panelCategory && (
        // Beside the board on wide screens (sticky while the board scrolls); a full-screen sheet on phones.
        <aside className="fixed inset-0 z-50 overflow-hidden lg:sticky lg:inset-auto lg:top-4 lg:z-auto lg:h-[calc(100dvh-2rem)] lg:w-[28rem] lg:shrink-0 lg:rounded-lg lg:shadow-2xl lg:shadow-black/40">
          <QuestionPanel
            ref={panel}
            key={target.openId}
            category={panelCategory}
            question={panelQuestion}
            points={target.points}
            rows={board.rows}
            onSaved={(q) => setTarget((t) => t && { ...t, questionId: q.id, points: q.points })}
            onDelete={remove}
            onClose={() => go(null)}
            onPrevious={index > 0 ? () => go(slots[index - 1]) : null}
            onNext={index >= 0 && index < slots.length - 1 ? () => go(slots[index + 1]) : null}
          />
        </aside>
      )}
    </div>
  );
}
