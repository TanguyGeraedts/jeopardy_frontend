import Link from "next/link";
import type { ReactNode } from "react";
// The "/ssr" build works in server and client components alike (no React context needed).
import { CaretLeft } from "@phosphor-icons/react/ssr";

/** The quiet "‹ Back to …" link at the top of a page. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-chalk/60 hover:text-chalk">
      <CaretLeft weight="bold" aria-hidden />
      {children}
    </Link>
  );
}
