"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/ui/Spinner";
import { DevLoginPanel } from "./DevLoginPanel";

/**
 * Gate for pages that need a logged-in user. Optionally require a role (e.g. "ADMIN").
 * This is UX only: the backend enforces the real rules (@PreAuthorize).
 */
export function RequireAuth({ children, role }: { children: ReactNode; role?: string }) {
  const { ready, isAuthenticated, hasRole } = useAuth();

  if (!ready) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!isAuthenticated) return <DevLoginPanel />;
  if (role && !hasRole(role)) {
    return <p className="py-20 text-center text-white/60">You need the {role} role to see this page.</p>;
  }
  return <>{children}</>;
}
