import Link from "next/link";
import { LEGAL_PAGES } from "@/lib/legal";
import { CookieSettingsButton } from "./ConsentBanner";

const linkClass = "rounded-sm text-[13px] text-chalk/70 hover:text-chalk";

/** The quiet row of legal links at the bottom of every (site) page, with the version linking to what's new. */
export function LegalFooter() {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-1 px-6 pb-6 pt-4 sm:justify-between">
      <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-5 gap-y-1">
        {LEGAL_PAGES.map((page) => (
          <Link key={page.href} href={page.href} className={linkClass}>
            {page.label}
          </Link>
        ))}
        <CookieSettingsButton className={linkClass} />
      </nav>
      <Link href="/changelog" className={linkClass}>
        Version {process.env.NEXT_PUBLIC_APP_VERSION}
      </Link>
    </footer>
  );
}
