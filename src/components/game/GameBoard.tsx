import { boardRows } from "@/lib/quiz-state";
import type { Question, Quiz } from "@/types";

interface GameBoardProps {
  quiz: Quiz;
  usedQuestionIds: readonly string[];
  onPick: (categoryId: string, question: Question) => void;
}

/** The board everyone looks at: categories across, point values down. Played tiles go blank. */
export function GameBoard({ quiz, usedQuestionIds, onPick }: GameBoardProps) {
  const rows = boardRows(quiz, []);

  if (quiz.categories.length === 0 || rows.length === 0) {
    return <p className="py-20 text-center text-white/50">This quiz has no questions yet.</p>;
  }

  return (
    <div
      className="grid h-full gap-2"
      style={{
        gridTemplateColumns: `repeat(${quiz.categories.length}, minmax(0, 1fr))`,
        gridTemplateRows: `auto repeat(${rows.length}, minmax(0, 1fr))`,
      }}
    >
      {quiz.categories.map((category) => (
        <div key={category.id} className="flex min-h-16 items-center justify-center rounded-lg bg-jeopardy-board px-2 py-3 text-center text-[clamp(0.8rem,1.6vw,1.4rem)] font-extrabold uppercase tracking-wide">
          <span className="line-clamp-2">{category.name}</span>
        </div>
      ))}

      {rows.flatMap((points) =>
        quiz.categories.map((category) => {
          const question = category.questions.find((q) => q.points === points);
          if (!question || usedQuestionIds.includes(question.id)) {
            return <div key={`${points}:${category.id}`} aria-hidden className="rounded-lg bg-white/5" />;
          }
          return (
            <button
              key={`${points}:${category.id}`}
              type="button"
              onClick={() => onPick(category.id, question)}
              aria-label={`${category.name} for ${points}`}
              className="rounded-lg bg-jeopardy-board text-[clamp(1.5rem,4vw,3.5rem)] font-extrabold text-jeopardy-gold transition hover:scale-[1.03] hover:brightness-125 focus-visible:outline-2 focus-visible:outline-jeopardy-gold"
            >
              {points}
            </button>
          );
        }),
      )}
    </div>
  );
}
