"use client";

import { useRef, useState } from "react";
import { youtubeEmbedUrl } from "@/lib/media";
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
export function ClueMedia({ type, url, label, className }: ClueMediaProps) {
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
    if (el.paused) el.play().catch(onError);
    else el.pause();
  };

  const seek = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = audio.current;
    if (!el || !duration) return;
    const box = event.currentTarget.getBoundingClientRect();
    el.currentTime = ((event.clientX - box.left) / box.width) * duration;
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
          playing && "animate-pulse",
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
        <div onClick={seek} className="h-2 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/15" role="progressbar" aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(time)}>
          <div className="h-full rounded-full bg-jeopardy-gold" style={{ width: duration ? `${(time / duration) * 100}%` : "0%" }} />
        </div>
        <span>{clock(duration)}</span>
      </div>
    </div>
  );
}
