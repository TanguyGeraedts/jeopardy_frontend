import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";

// The game board is a host page: same login rule as (site)/quizzes.
export default function StageQuizzesLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
