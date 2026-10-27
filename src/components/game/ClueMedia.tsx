"use client";

import { useRef, useState } from "react";
import { youtubeEmbedUrl } from "@/lib/media";
import { isSameOrigin, setMediaConsent, useMediaConsent } from "@/lib/consent";
import { percent, thumbPosition } from "@/components/ui/SliderField";
import { cn } from "@/lib/cn";

export type ClueMediaType = "IMAGE" | "VIDEO" | "AUDIO";

interface ClueMediaProps {
  type: ClueMediaType;
  url: string;
  /** Describes the media for screen readers (e.g. the question). */
  label: string;
  className?: string;
}

const NOUN: Record<ClueMediaType, string> = { IMAGE: "image", VIDEO: "video", AUDIO: "sound" };

/**
 * The image, video or sound that goes with a question. YouTube links become an embedded player (the host presses
 * play); any other video URL plays as a file. AUDIO plays a file with nothing on screen but our own controls.
 * Sized by the parent: it fills the box and keeps its aspect ratio.
 */
export function ClueMedia(props: ClueMediaProps) {
  const consent = useMediaConsent();
  // "Load this once" is for this URL only, even if the component stays mounted for the next clue.
  const [loadedOnce, setLoadedOnce] = useState<string | null>(null);

  // Until the browser says what was chosen, render nothing rather than flash the placeholder.
  if (consent === "unknown") return null;
  if (consent === "allowed" || loadedOnce === props.url || isSameOrigin(props.url)) return <LoadedMedia key={props.url} {...props} />;
  return <MediaPlaceholder {...props} onLoadOnce={() => setLoadedOnce(props.url)} />;
}

const sourceName = (url: string) => {
  if (youtubeEmbedUrl(url)) return "YouTube";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "another site";
  }
};

const placeholderButton = "rounded-lg bg-white/[0.08] px-3 py-1.5 font-semibold hover:bg-white/[0.14]";

/** Stands in for third-party media until the viewer allows it, for this clue only or from now on. */
function MediaPlaceholder({ type, url, className, onLoadOnce }: ClueMediaProps & { onLoadOnce: () => void }) {
  return (
    <div className={cn("flex max-w-md flex-col items-center gap-3 rounded-lg border border-white/15 bg-studio-night/60 px-5 py-4 text-center text-sm text-chalk", className)}>
      <p>
        This clue has a {NOUN[type]} from <strong className="font-semibold">{sourceName(url)}</strong>. Loading it shares your
        IP address with that site.
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={onLoadOnce} className={placeholderButton}>
          Load this once
        </button>
        <button type="button" onClick={() => setMediaConsent("allowed")} className={placeholderButton}>
          Always allow
        </button>
      </div>
    </div>
  );
}

function LoadedMedia({ type, url, label, className }: ClueMediaProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <p className={cn("rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200", className)}>
        This {NOUN[type]} could not be loaded. Check the URL in the quiz editor.
      </p>
    );
  }

  if (type === "IMAGE") {
    return (
      // A plain img on purpose: quiz makers paste links from any site, so next/image's host allow-list doesn't fit.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={label} onError={() => setFailed(true)} className={cn("h-full w-full object-contain", className)} />
    );
  }

  if (type === "AUDIO") return <SoundOnly url={url} label={label} onError={() => setFailed(true)} className={className} />;

  const youtube = youtubeEmbedUrl(url);
  if (youtube) {
    return (
      <iframe
        src={youtube}
        title={label}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className={cn("aspect-video h-full max-w-full rounded-lg border-0", className)}
      />
    );
  }

  return <video src={url} controls onError={() => setFailed(true)} aria-label={label} className={cn("h-full w-full object-contain", className)} />;
}

const clock = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Sound only: a hidden audio element (it also plays the sound of .mp4 files) behind a big play button and a progress
 * bar. Nothing reveals the clip's title or picture.
 */
function SoundOnly({ url, label, onError, className }: { url: string; label: string; onError: () => void; className?: string }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    // Only "can't play this file" means the link is broken. AbortError (paused before it started) and
    // NotAllowedError (no click yet) are harmless; a failed load also fires the element's own onError.
    if (el.paused) el.play().catch((e: DOMException) => e.name === "NotSupportedError" && onError());
    else el.pause();
  };

  const seek = (seconds: number) => {
    const el = audio.current;
    if (!el || !duration) return;
    el.currentTime = seconds;
    setTime(seconds);
  };

  return (
    <div className={cn("flex w-full max-w-xl flex-col items-center gap-4", className)}>
      <audio
        ref={audio}
        src={url}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={onError}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={`${playing ? "Pause" : "Play"} sound: ${label}`}
        className={cn(
          "grid size-[clamp(5rem,14vh,9rem)] place-items-center rounded-full bg-jeopardy-gold text-jeopardy-navy shadow-xl transition hover:brightness-110 active:scale-95",
          playing && "motion-safe:animate-pulse",
        )}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" className="size-1/2" fill="currentColor" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-1/2 translate-x-[6%]" fill="currentColor" aria-hidden><path d="M7 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 7 5.5Z" /></svg>
        )}
      </button>
      <div className="flex w-full items-center gap-3 text-sm tabular-nums text-white/70">
        <span>{clock(time)}</span>
        {/* A real slider, so the arrow keys seek too. The track is drawn here; the input only supplies the thumb. */}
        <div className="relative h-6 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-white/15" />
          <div className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-jeopardy-gold" style={{ width: thumbPosition(percent(time, 0, duration)) }} />
          <input
            type="range"
            className="range-input range-input-single"
            min={0}
            max={duration || 0}
            step={1}
            value={Math.min(time, duration || 0)}
            disabled={!duration}
            aria-label={`Position in sound: ${label}`}
            aria-valuetext={`${clock(time)} of ${clock(duration)}`}
            onChange={(e) => seek(Number(e.target.value))}
          />
        </div>
        <span>{clock(duration)}</span>
      </div>
    </div>
  );
}
