"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export function Header() {
  const { ready, user, logout } = useAuth();

  return (
    <header className="border-b border-white/10 bg-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-extrabold tracking-wide text-jeopardy-gold">
            JEOPARDY!
          </Link>
          <nav className="text-sm text-white/70">
            <Link href="/creator" className="hover:text-white">
              Creator
            </Link>
          </nav>
        </div>

        {ready && user && (
          <div className="flex items-center gap-3 text-sm">
            <div className="text-right leading-tight">
              <p className="text-white/90">{user.email ?? user.sub}</p>
              <p className="text-xs text-white/40">{user.roles.join(", ") || "no roles"}</p>
            </div>
            <Button variant="ghost" onClick={logout}>
              Log out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
