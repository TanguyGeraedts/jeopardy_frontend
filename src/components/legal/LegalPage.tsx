import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { LEGAL, LEGAL_PAGES, type LegalHref } from "@/lib/legal";

/** Reading layout shared by the privacy notice, terms and legal notice: tabs between them, a title, then sections. */
export function LegalPage({ current, title, intro, children }: { current: LegalHref; title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <article className="mx-auto flex w-full max-w-[68ch] flex-col">
      <nav aria-label="Legal pages" className="flex gap-1 border-b-2 border-desk">
        {LEGAL_PAGES.map((page) => {
          const active = page.href === current;
          return (
            <Link
              key={page.href}
              href={page.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "-mb-0.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-semibold",
                active ? "border-chalk text-chalk" : "border-transparent text-chalk/60 hover:text-chalk",
              )}
            >
              {page.label}
            </Link>
          );
        })}
      </nav>

      <header className="mt-10 flex flex-col gap-4">
        <h1 className="font-display text-6xl leading-none tracking-wide text-chalk sm:text-7xl">{title}</h1>
        <div className="text-lg leading-relaxed text-chalk">{intro}</div>
        <p className="text-sm text-chalk/60">Last updated {LEGAL.lastUpdated}</p>
      </header>

      <div className="mt-12 flex flex-col gap-12">{children}</div>
    </article>
  );
}

export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-6 flex-col gap-4">
      <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight text-chalk">
        <a href={`#${id}`} className="rounded-sm hover:underline hover:underline-offset-4">
          {title}
        </a>
      </h2>
      <div className="flex flex-col gap-4 text-base leading-[1.65] text-chalk/85 [&_strong]:font-semibold [&_strong]:text-chalk">{children}</div>
    </section>
  );
}

export function LegalList({ children }: { children: ReactNode }) {
  return <ul className="flex list-disc flex-col gap-2 pl-5 marker:text-chalk/50">{children}</ul>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  const className = "font-medium text-chalk underline decoration-chalk/40 underline-offset-[3px] hover:decoration-chalk";
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function ContactLink() {
  return <TextLink href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</TextLink>;
}
