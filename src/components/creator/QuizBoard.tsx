import type { Quiz } from "@/types";
import { AddCategory } from "./AddCategory";
import { CategoryColumn } from "./CategoryColumn";

export function QuizBoard({ quiz }: { quiz: Quiz }) {
  return (
    <div className="space-y-3">
      {quiz.categories.length === 0 && (
        <p className="text-sm text-white/50">This quiz has no categories yet. Add your first one to start building the board.</p>
      )}
      <div className="grid auto-cols-[minmax(16rem,1fr)] grid-flow-col items-start gap-3 overflow-x-auto pb-2">
        {quiz.categories.map((category) => (
          <CategoryColumn key={category.id} category={category} />
        ))}
        <AddCategory />
      </div>
    </div>
  );
}
