"use client";

import { useEffect, useState } from "react";
import { ApiError, toApiError } from "@/lib/api/client";
import { getMyQuizzes } from "@/lib/api/quizzes";
import type { Quiz } from "@/types";

type MyQuizzesState =
    | { status: "loading" }
    | { status: "error"; error: ApiError }
    | { status: "success"; quizzes: Quiz[] };

/** Loads the quizzes owned by the current user (GET /api/v1/quizzes/me). */
export function useMyQuizzes(): MyQuizzesState {
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

    return state;
}