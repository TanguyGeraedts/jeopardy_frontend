import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";

// Everything under /creator needs a logged-in user.
export default function CreatorLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
