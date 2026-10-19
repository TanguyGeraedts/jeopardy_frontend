/** YouTube video ids are 11 characters of [A-Za-z0-9_-]. */
const YOUTUBE_ID = /^[\w-]{11}$/;

/** "90", "90s", "1m30s", "1h2m3s" -> seconds. */
function parseStart(value: string | null): number | undefined {
  if (!value) return undefined;
  if (/^\d+$/.test(value)) return Number(value);
  const match = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(value);
  if (!match || !match[0]) return undefined;
  const [, h = "0", m = "0", s = "0"] = match;
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

/**
 * The embeddable player URL for a YouTube link, or null if it isn't one.
 * Accepts watch?v=, youtu.be/, shorts/, embed/ and live/ links; keeps a ?t= / ?start= start time.
 */
export function youtubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^(www|m|music)\./, "");
  let id: string | null = null;
  if (host === "youtu.be") {
    id = parsed.pathname.slice(1).split("/")[0];
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") id = parsed.searchParams.get("v");
    else {
      const [, kind, value] = parsed.pathname.split("/");
      if (kind === "shorts" || kind === "embed" || kind === "live") id = value;
    }
  }
  if (!id || !YOUTUBE_ID.test(id)) return null;

  const embed = new URL(`https://www.youtube-nocookie.com/embed/${id}`);
  const start = parseStart(parsed.searchParams.get("t") ?? parsed.searchParams.get("start"));
  if (start) embed.searchParams.set("start", String(start));
  embed.searchParams.set("rel", "0"); // no "more videos" from other channels at the end
  return embed.toString();
}
