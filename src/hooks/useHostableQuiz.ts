"use client";

import { useEffect, useState } from "react";
import { ApiError, toApiError } from "@/lib/api/client";
import { getHostableQuiz } from "@/lib/api/quizzes";
import type { DiscoverQuiz } from "@/types";

export type HostableQuizState =
  | { status: "loading" }
  | { status: "error"; error: ApiError }
  | { status: "success"; quiz: DiscoverQuiz };

/**
 * A quiz the user may host: their own or anyone's published one. Board shape only, no questions: the host sees
 * those in the admin panel once the game runs. Render the consumer with `key={quizId}`.
 */
export function useHostableQuiz(quizId: string): HostableQuizState {
  const [state, setState] = useState<HostableQuizState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    getHostableQuiz(quizId, controller.signal)
      .then((quiz) => setState({ status: "success", quiz }))
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({ status: "error", error: toApiError(error) });
      });
    return () => controller.abort();
  }, [quizId]);

  return state;
}
