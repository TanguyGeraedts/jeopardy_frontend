"use client";

import { useMyQuizzes } from "@/hooks/useMyQuizzes";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { QuizCard } from "./QuizCard";

export function QuizList() {
    const state = useMyQuizzes();

    if (state.status === "loading") return <div className="flex justify-center py-10"><Spinner /></div>;
    if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;

    if (state.quizzes.length === 0) {
        return <p className="rounded-xl border border-dashed border-white/15 py-10 text-center text-white/50">You haven&apos;t created any quizzes yet.</p>;
    }

    return (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.quizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
            ))}
        </ul>
    );
}