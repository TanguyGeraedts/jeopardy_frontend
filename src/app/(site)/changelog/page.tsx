import type { Metadata } from "next";
import { formatReleaseDate, readChangelog } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "What's new",
  description: "New features and fixes in Jeopardy, release by release.",
};

// Built once from CHANGELOG.md: a new release needs a new build (which every deploy is).
export const dynamic = "force-static";

/** CHANGELOG.md as a page: newest release first, each version in the board's gold numerals. */
export default function ChangelogPage() {
  const releases = readChangelog();
  const current = process.env.NEXT_PUBLIC_APP_VERSION;

  return (
    <article className="mx-auto flex w-full max-w-[68ch] flex-col">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-6xl leading-none tracking-wide text-chalk sm:text-7xl">What&apos;s new</h1>
        <p className="text-lg leading-relaxed text-chalk/85">New features and fixes, newest first. You&apos;re on version {current}.</p>
      </header>

      <ol className="mt-12 flex flex-col gap-14">
        {releases.map((release) => (
          <li key={release.version} id={`v${release.version}`} className="flex scroll-mt-6 flex-col gap-5">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="font-display text-5xl leading-none tracking-wide text-gold tabular-nums">
                <a href={`#v${release.version}`} className="rounded-sm hover:underline hover:underline-offset-4">
                  {release.version}
                </a>
              </h2>
              <p className="text-sm text-chalk/60">
                {release.date ? formatReleaseDate(release.date) : "Coming soon"}
                {release.version === current && " (this version)"}
              </p>
            </div>
            {release.sections.map((section) => (
              <section key={section.title} className="flex flex-col gap-3">
                <h3 className="text-base font-semibold text-chalk">{section.title}</h3>
                <ul className="flex list-disc flex-col gap-2 pl-5 text-base leading-[1.65] text-chalk/85 marker:text-chalk/40">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </li>
        ))}
      </ol>
    </article>
  );
}
