"use client";

import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

export function Header() {
  return (
    <header className="border-b border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-extrabold tracking-wide text-jeopardy-gold">
            JEOPARDY
          </Link>
          <nav className="text-sm text-white/70">
            <Link href="/creator" className="hover:text-white">
              Creator
            </Link>
          </nav>
        </div>

        <Show when="signed-in">
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton>
            <Button variant="ghost">Sign in</Button>
          </SignInButton>
        </Show>
      </div>
    </header>
  );
}
