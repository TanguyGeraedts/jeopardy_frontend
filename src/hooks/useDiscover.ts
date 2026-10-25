"use client";

import { useEffect, useState } from "react";
import { ApiError, toApiError } from "@/lib/api/client";
import { searchQuizzes, type DiscoverQuery } from "@/lib/api/quizzes";
import type { DiscoverQuiz } from "@/types";

export type DiscoverState =
  | { status: "loading"; previous: DiscoverQuiz[] | null }
  | { status: "error"; error: ApiError }
  | { status: "success"; quizzes: DiscoverQuiz[] };

/** Typing waits this long before searching, so each key press isn't a request. */
const DEBOUNCE_MS = 250;

/** Searches Discover as the query changes. While a new search runs, the last results stay available (no flicker). */
export function useDiscover({ q, topic, sort }: DiscoverQuery): DiscoverState {
  const [state, setState] = useState<DiscoverState>({ status: "loading", previous: null });

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setState((prev) => ({ status: "loading", previous: prev.status === "success" ? prev.quizzes : prev.status === "loading" ? prev.previous : null }));
      searchQuizzes({ q, topic, sort }, controller.signal)
        .then((quizzes) => setState({ status: "success", quizzes }))
        .catch((error) => {
          if (controller.signal.aborted) return;
          setState({ status: "error", error: toApiError(error) });
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, topic, sort]);

  return state;
}
