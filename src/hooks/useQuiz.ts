"use client";

import { useEffect, useState } from "react";
import { ApiError, toApiError } from "@/lib/api/client";
import { getQuiz } from "@/lib/api/quizzes";
import type { Quiz } from "@/types";

type QuizState =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; quiz: Quiz };

/** Render the consumer with `key={quizId}` so the state resets when the id changes. */
export function useQuiz(quizId: string): QuizState {
  const [state, setState] = useState<QuizState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    getQuiz(quizId, controller.signal)
      .then((quiz) => setState({ status: "success", quiz }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", error: toApiError(error) });
      });
    return () => controller.abort();
  }, [quizId]);

  return state;
}
