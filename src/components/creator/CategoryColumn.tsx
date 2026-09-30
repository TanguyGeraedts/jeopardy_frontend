import type { Category } from "@/types";
import { AddQuestion } from "./AddQuestion";
import { CategoryHeader } from "./CategoryHeader";
import { QuestionTile } from "./QuestionTile";

export function CategoryColumn({ category }: { category: Category }) {
  const questions = [...category.questions].sort((a, b) => a.points - b.points);

  return (
    <section className="space-y-2">
      <CategoryHeader category={category} />
      {questions.length === 0 && <p className="text-center text-xs text-white/40">No questions yet</p>}
      {questions.length > 0 && (
        <ul className="space-y-2">
          {questions.map((q) => (
            <QuestionTile key={q.id} categoryId={category.id} question={q} />
          ))}
        </ul>
      )}
      <AddQuestion category={category} />
    </section>
  );
}
