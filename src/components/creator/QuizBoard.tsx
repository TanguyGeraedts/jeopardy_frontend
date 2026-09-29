import type { Quiz } from "@/types";
import { CategoryColumn } from "./CategoryColumn";

export function QuizBoard({ quiz }: { quiz: Quiz }) {
  if (quiz.categories.length === 0) {
    return <p className="rounded-xl border border-dashed border-white/15 py-16 text-center text-white/50">This quiz has no categories yet.</p>;
  }

  return (
    <div className="grid auto-cols-[minmax(14rem,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
      {quiz.categories.map((category) => (
        <CategoryColumn key={category.id} category={category} />
      ))}
    </div>
  );
}
