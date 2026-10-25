"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, toApiError } from "@/lib/api/client";
import { getMyQuizzes } from "@/lib/api/quizzes";
import type { Quiz } from "@/types";

type MyQuizzesState =
    | { status: "loading" }
    | { status: "error"; error: ApiError }
    | { status: "success"; quizzes: Quiz[] };

/**
 * Loads the quizzes owned by the current user (GET /api/v1/quizzes). `replace` swaps in a quiz the backend returned
 * after a change (publish, topics); `add` puts a new one (a copy) first. Both are referentially stable.
 */
export function useMyQuizzes() {
    const [state, setState] = useState<MyQuizzesState>({ status: "loading" });

    useEffect(() => {
        const controller = new AbortController();
        getMyQuizzes(controller.signal)
            .then((quizzes) => setState({ status: "success", quizzes }))
            .catch((error) => {
                if (controller.signal.aborted) return;
                setState({ status: "error", error: toApiError(error) });
            });
        return () => controller.abort();
    }, []);

    const replace = useCallback((quiz: Quiz) => {
        setState((prev) => (prev.status === "success" ? { ...prev, quizzes: prev.quizzes.map((q) => (q.id === quiz.id ? quiz : q)) } : prev));
    }, []);

    const add = useCallback((quiz: Quiz) => {
        setState((prev) => (prev.status === "success" ? { ...prev, quizzes: [quiz, ...prev.quizzes] } : prev));
    }, []);

    return { state, replace, add };
}
