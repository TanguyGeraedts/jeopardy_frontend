import Link from "next/link";
import { countQuestions } from "@/lib/quiz-state";
import type { Quiz } from "@/types";

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function QuizCard({ quiz }: { quiz: Quiz }) {
    const questionCount = countQuestions(quiz);

    return (
        <li>
            <Link
                href={`/quizzes/${quiz.id}`}
                className="block rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-jeopardy-gold/60 hover:bg-white/10"
            >
                <h3 className="truncate text-lg font-bold">{quiz.name}</h3>
                <p className="mt-1 text-sm text-white/50">
                    {count(quiz.categories.length, "category", "categories")} · {count(questionCount, "question", "questions")}
                </p>
            </Link>
        </li>
    );
}