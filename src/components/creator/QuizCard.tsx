import Link from "next/link";
import { countQuestions } from "@/lib/quiz-state";
import type { Quiz } from "@/types";

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function QuizCard({ quiz }: { quiz: Quiz }) {
    const questionCount = countQuestions(quiz);

    return (
        <li>
            <Link href={`/quizzes/${quiz.id}`} className="block rounded-lg bg-desk px-5 py-4 transition hover:bg-board-blue">
                <h3 className="truncate font-display text-3xl tracking-wide">{quiz.name}</h3>
                <p className="mt-1 text-sm text-chalk/60">
                    {count(quiz.categories.length, "category", "categories")}, {count(questionCount, "question", "questions")}
                </p>
            </Link>
        </li>
    );
}
