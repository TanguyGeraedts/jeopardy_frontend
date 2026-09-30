"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, toApiError } from "@/lib/api/client";
import { getQuiz } from "@/lib/api/quizzes";
import type { Quiz } from "@/types";

export type QuizState =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; quiz: Quiz };

export type QuizUpdate = Quiz | ((current: Quiz) => Quiz);

/**
 * Loads one quiz. `setQuiz` replaces it locally, either with a new quiz or with an
 * updater function (used to apply category/question changes). It is referentially stable.
 * Render the consumer with `key={quizId}` so the state resets when the id changes.
 */
export function useQuiz(quizId: string) {
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

  const setQuiz = useCallback((next: QuizUpdate) => {
    setState((prev) => {
      if (typeof next !== "function") return { status: "success", quiz: next };
      return prev.status === "success" ? { status: "success", quiz: next(prev.quiz) } : prev;
    });
  }, []);

  return { state, setQuiz };
}
