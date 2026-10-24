"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="bg-studio-night">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-baseline gap-8">
          <Link href="/" className="font-display text-3xl leading-none tracking-wide text-gold">
            Jeopardy
          </Link>
          <nav className="text-sm text-chalk/70">
            <Link href="/creator" className="hover:text-chalk">
              My quizzes
            </Link>
          </nav>
        </div>

        <Show when="signed-in">
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
        </Show>
      </div>
    </header>
  );
}
