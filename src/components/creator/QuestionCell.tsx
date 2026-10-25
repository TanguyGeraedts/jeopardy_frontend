import { Plus } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import type { Category, Question } from "@/types";

interface QuestionCellProps {
  category: Category;
  points: number;
  /** Undefined = empty slot. */
  question?: Question;
  /** Open in the side panel right now. */
  selected: boolean;
  onOpen: () => void;
}

const MEDIA_LABEL = { IMAGE: "Image", VIDEO: "Video", AUDIO: "Sound" } as const;

/** One tile of the board, like the show: the value in gold on blue. Empty slots are a dimmer blue with a +. */
export function QuestionCell({ category, points, question, selected, onOpen }: QuestionCellProps) {
  const ring = selected && "ring-4 ring-gold ring-inset";

  if (!question) {
    return (
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Add a ${points} point question to ${category.name}`}
        aria-pressed={selected}
        className={cn(
          "flex min-h-28 items-center justify-center gap-1 rounded-sm bg-board-blue/20 font-display text-3xl text-chalk/35 transition hover:bg-board-blue/45 hover:text-chalk/80",
          ring,
        )}
      >
        <Plus weight="bold" aria-hidden className="text-xl" />
        {points}
      </button>
    );
  }

  const tags = [question.dailyDouble && "Daily double", question.answerType !== "TEXT" && MEDIA_LABEL[question.answerType]].filter(Boolean);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Edit the ${points} point question in ${category.name}`}
      aria-pressed={selected}
      className={cn("flex min-h-28 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-sm bg-board-blue px-3 py-2 text-center transition hover:brightness-125", ring)}
    >
      <span className="font-display text-5xl leading-none text-gold">{points}</span>
      <span className="line-clamp-2 text-xs leading-snug text-chalk/75">{question.questionText}</span>
      {tags.length > 0 && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[0.7rem] font-semibold text-gold">{tags.join(", ")}</span>}
    </button>
  );
}
