"use client";

import Link from "next/link";
import { useQuiz } from "@/hooks/useQuiz";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";
import { DeleteQuizButton } from "./DeleteQuizButton";
import { QuizBoard } from "./QuizBoard";
import { QuizHeader } from "./QuizHeader";

export function QuizDetail({ quizId }: { quizId: string }) {
    const { state, setQuiz } = useQuiz(quizId);

    if (state.status === "loading") return <div className="flex justify-center py-20"><Spinner /></div>;
    if (state.status === "error") return <Alert title={state.error.title}>{state.error.message}</Alert>;

    const { quiz } = state;
    return (
        <div className="space-y-6">
            <Link href="/creator" className="text-sm text-white/50 hover:text-white">
                &larr; Back
            </Link>
            <div className="flex items-start justify-between gap-4">
                <QuizHeader quiz={quiz} onUpdated={setQuiz} />
                <DeleteQuizButton quizId={quiz.id} quizName={quiz.name} />
            </div>
            <QuizBoard quiz={quiz} />
        </div>
    );
}