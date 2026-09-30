"use client";

import { useRef, useState } from "react";
import { updateQuiz } from "@/lib/api/quizzes";
import { errorMessage } from "@/lib/api/client";
import { QUIZ_NAME_MAX, validateQuizName } from "@/lib/validation/quiz";
import { useToast } from "@/providers/ToastProvider";
import type { Quiz } from "@/types";

interface QuizHeaderProps {
    quiz: Quiz;
    onUpdated: (quiz: Quiz) => void;
}

/** Quiz title as a big input: Enter/blur saves, Esc cancels. */
export function QuizHeader({ quiz, onUpdated }: QuizHeaderProps) {
    const { show } = useToast();
    const [draft, setDraft] = useState<string | null>(null); // null = not editing
    const cancelled = useRef(false);

    async function commit() {
        if (cancelled.current) {
            cancelled.current = false;
            return;
        }
        if (draft === null) return;
        const name = draft.trim();

        if (name !== quiz.name) {
            const invalid = validateQuizName(name);
            if (invalid) {
                show(invalid, { tone: "error" });
            } else {
                try {
                    onUpdated(await updateQuiz(quiz.id, { name }));
                    show("Name saved");
                } catch (e) {
                    show(errorMessage(e), { tone: "error" });
                }
            }
        }
        setDraft(null);
    }

    return (
        <div className="min-w-0 flex-1">
            <label htmlFor="quiz-name" className="text-sm text-white/50">
                Quiz name
            </label>
            <input
                id="quiz-name"
                value={draft ?? quiz.name}
                maxLength={QUIZ_NAME_MAX}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                    if (e.key === "Escape") {
                        cancelled.current = true;
                        setDraft(null);
                        e.currentTarget.blur();
                    }
                }}
                className="block min-h-12 w-full max-w-xl rounded-md border border-transparent bg-transparent px-1 text-3xl font-extrabold hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-jeopardy-gold"
            />
            <p className="text-xs text-white/40">{quiz.id}</p>
        </div>
    );
}
