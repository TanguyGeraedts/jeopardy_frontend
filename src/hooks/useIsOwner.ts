"use client";

import { useEffect, useState } from "react";
import { getMyQuizzes } from "@/lib/api/quizzes";

type OwnerState = { status: "loading" } | { status: "ready"; isOwner: boolean };

/**
 * Whether the current user owns a quiz. Quiz responses carry no owner, so we fetch the quizzes that
 * are "mine" (GET /quizzes/me) and look for this one. If that request fails we say "not the owner":
 * the owner-only buttons stay hidden, and the backend still enforces the real rules.
 * Render the consumer with `key={quizId}` so the state resets when the id changes.
 */
export function useIsOwner(quizId: string): OwnerState {
  const [state, setState] = useState<OwnerState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    getMyQuizzes(controller.signal)
      .then((quizzes) => setState({ status: "ready", isOwner: quizzes.some((q) => q.id === quizId) }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "ready", isOwner: false });
      });
    return () => controller.abort();
  }, [quizId]);

  return state;
}
