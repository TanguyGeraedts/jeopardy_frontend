import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Everything under /quizzes needs a logged-in user (any user, not just the owner).
export default function QuizzesLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
