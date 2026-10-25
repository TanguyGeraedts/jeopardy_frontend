"use client";

import { useUser } from "@clerk/nextjs";

/** The name shown as "by …" on published quizzes: the Clerk profile's name, else the username. Never the email. */
export function useAuthorName(): string {
  const { user } = useUser();
  return user?.fullName?.trim() || user?.username || user?.firstName || "Anonymous";
}
