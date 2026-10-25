"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/creator", label: "My quizzes" },
];

export function Header() {
  const pathname = usePathname();
  return (
    <header className="bg-studio-night">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-5 sm:gap-8">
          <Link href="/" className="font-display text-3xl leading-none tracking-wide text-gold">
            Jeopardy
          </Link>
          <nav className="flex gap-4 whitespace-nowrap text-sm sm:gap-6">
            {NAV.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(active ? "font-semibold text-chalk" : "text-chalk/65 hover:text-chalk")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Show when="signed-in">
          <UserButton />
        </Show>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <Button variant="ghost" className="whitespace-nowrap px-2 sm:px-4">Sign in</Button>
          </SignInButton>
        </Show>
      </div>
    </header>
  );
}
