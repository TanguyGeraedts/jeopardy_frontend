import { readFileSync } from "node:fs";
import { join } from "node:path";

/** One release in CHANGELOG.md ("## [1.0.0] - 2026-10-27"), with its sections ("### Added") and their bullet points. */
export interface Release {
  version: string;
  /** ISO date (YYYY-MM-DD), or null for an "Unreleased" entry. */
  date: string | null;
  sections: { title: string; items: string[] }[];
}

/**
 * Reads CHANGELOG.md (Keep a Changelog format) at build time: the /changelog page is static, so this runs once per build.
 * Understands only release headings, section headings and "- " bullets (continued on indented lines); everything
 * else (the intro) is ignored. Server only.
 */
export function readChangelog(): Release[] {
  return parseChangelog(readFileSync(join(process.cwd(), "CHANGELOG.md"), "utf8"));
}

export function parseChangelog(markdown: string): Release[] {
  const releases: Release[] = [];
  let section: Release["sections"][number] | null = null;

  for (const line of markdown.split(/\r?\n/)) {
    const release = /^##\s+\[?([^\]\s]+)\]?(?:\s+-\s+(\d{4}-\d{2}-\d{2}))?/.exec(line);
    if (release && !line.startsWith("###")) {
      releases.push({ version: release[1], date: release[2] ?? null, sections: [] });
      section = null;
      continue;
    }
    const current = releases.at(-1);
    if (!current) continue;

    const heading = /^###\s+(.+)/.exec(line);
    if (heading) {
      section = { title: heading[1].trim(), items: [] };
      current.sections.push(section);
      continue;
    }
    const bullet = /^[-*]\s+(.+)/.exec(line);
    if (bullet && section) {
      section.items.push(bullet[1].trim());
    } else if (/^\s{2,}\S/.test(line) && section?.items.length) {
      // A bullet that wraps onto the next (indented) line.
      section.items[section.items.length - 1] += ` ${line.trim()}`;
    }
  }
  return releases;
}

/** "27 October 2026". */
export const formatReleaseDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
