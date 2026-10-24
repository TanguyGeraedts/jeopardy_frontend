import type { Category, Question } from "@/types";

interface QuestionCellProps {
  category: Category;
  points: number;
  /** Undefined = empty slot ("+"). */
  question?: Question;
  onOpen: () => void;
}

const MEDIA_LABEL = { IMAGE: "Image", VIDEO: "Video", AUDIO: "Sound" } as const;

/** One tile of the board: a filled question (opens the editor) or an empty slot (opens "new question"). */
export function QuestionCell({ category, points, question, onOpen }: QuestionCellProps) {
  if (!question) {
    // Dashed = "nothing here yet": the outline carries meaning, so it stays.
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Add ${points} point question to ${category.name}`}
        className="flex min-h-24 flex-col items-center justify-center rounded-md border-2 border-dashed border-white/15 text-chalk/50 transition hover:border-chalk/40 hover:text-chalk"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="font-display text-xl">{points}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Edit ${points} point question in ${category.name}`}
      className="flex min-h-24 flex-col items-start gap-1 overflow-hidden rounded-md bg-board-blue p-2.5 text-left transition hover:brightness-125"
    >
      <span className="font-display text-4xl leading-none text-gold">{points}</span>
      {(question.dailyDouble || question.answerType !== "TEXT") && (
        <span className="text-xs font-semibold text-chalk/80">
          {[question.dailyDouble && "Daily double", question.answerType !== "TEXT" && MEDIA_LABEL[question.answerType]].filter(Boolean).join(", ")}
        </span>
      )}
      <span className="line-clamp-2 text-sm text-chalk/90">{question.questionText}</span>
    </button>
  );
}
