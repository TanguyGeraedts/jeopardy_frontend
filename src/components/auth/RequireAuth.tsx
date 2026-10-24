"use client";

import type { ReactNode } from "react";
import { RedirectToSignIn, Show } from "@clerk/nextjs";

/**
 * Gate for pages that need a logged-in host: signed-out visitors go to /sign-in and come back afterwards.
 * This is UX only: the backend checks the Clerk token on every request.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  // <Show> renders nothing until Clerk has loaded, so this never redirects a signed-in user by accident.
  return (
    <Show when="signed-in" fallback={<RedirectToSignIn />}>
      {children}
    </Show>
  );
}
