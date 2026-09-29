import type { Category } from "@/types";
import { QuestionTile } from "./QuestionTile";

export function CategoryColumn({ category }: { category: Category }) {
  const questions = [...category.questions].sort((a, b) => a.points - b.points);

  return (
    <section className="space-y-2">
      <h3 className="rounded-lg bg-jeopardy-board px-3 py-3 text-center text-sm font-bold uppercase tracking-wide">
        {category.name}
      </h3>
      {questions.length === 0 ? (
        <p className="text-center text-xs text-white/40">No questions yet</p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <QuestionTile key={q.id} question={q} />
          ))}
        </ul>
      )}
    </section>
  );
}
