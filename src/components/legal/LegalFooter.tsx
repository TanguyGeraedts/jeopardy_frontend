import Link from "next/link";
import { LEGAL_PAGES } from "@/lib/legal";

/** The quiet row of legal links at the bottom of every (site) page, with the version linking to what's new. */
export function LegalFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-6 pb-6 pt-4 sm:justify-between">
      <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-5 gap-y-1">
        {LEGAL_PAGES.map((page) => (
          <Link key={page.href} href={page.href} className="rounded-sm text-[13px] text-chalk/55 hover:text-chalk">
            {page.label}
          </Link>
        ))}
      </nav>
      <Link href="/changelog" className="rounded-sm text-[13px] text-chalk/55 hover:text-chalk">
        Version {process.env.NEXT_PUBLIC_APP_VERSION}
      </Link>
    </footer>
  );
}
