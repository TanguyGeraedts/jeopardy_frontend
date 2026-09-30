import type { Category, Question } from "@/types";

interface QuestionCellProps {
  category: Category;
  points: number;
  /** Undefined = empty slot ("+"). */
  question?: Question;
  onOpen: () => void;
}

/** One tile of the board: a filled question (opens the editor) or an empty slot (opens "new question"). */
export function QuestionCell({ category, points, question, onOpen }: QuestionCellProps) {
  if (!question) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Add ${points} point question to ${category.name}`}
        className="flex min-h-24 flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 text-2xl text-white/50 transition hover:border-jeopardy-gold hover:text-white"
      >
        +<span className="text-xs">{points}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Edit ${points} point question in ${category.name}`}
      className="flex min-h-24 flex-col items-start gap-0.5 overflow-hidden rounded-lg border border-white/10 bg-jeopardy-board p-2.5 text-left transition hover:border-jeopardy-gold"
    >
      <span className="text-xl font-extrabold text-jeopardy-gold">{points}</span>
      {question.dailyDouble && (
        <span className="rounded bg-jeopardy-gold px-1.5 text-[10px] font-extrabold uppercase text-jeopardy-navy">Daily double</span>
      )}
      {question.answerType !== "TEXT" && (
        <span className="rounded bg-white/15 px-1.5 text-[10px] font-semibold uppercase">{question.answerType}</span>
      )}
      <span className="line-clamp-2 text-sm">{question.questionText}</span>
    </button>
  );
}
