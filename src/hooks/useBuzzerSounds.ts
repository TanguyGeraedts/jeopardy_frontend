"use client";

import { useEffect, useRef } from "react";
import { buzzerSoundFor, playBuzzerSound } from "@/lib/buzzer-sounds";
import type { GameSession } from "@/types";

/** Gap between sounds when several buzzes arrive in one update, so each team is still heard. */
const STAGGER_MS = 250;

/**
 * Plays a team's buzzer sound for every new accepted buzz. Buzzes already there when the board opens
 * (or reconnects) stay silent: only buzzes that happen while watching make a sound.
 */
export function useBuzzerSounds(session: GameSession | null, muted: boolean) {
  // Buzzes of the open clue already handled. Only the current clue matters: a buzz never comes back once its
  // clue is closed, and within a clue the queue only grows (a locked-out team can't buzz again).
  const heard = useRef<Set<string> | null>(null);
  const pending = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (!session) return;
    const keys = session.buzzes.map((b) => `${session.activeClueId}:${b.playerId}`);
    const previous = heard.current;
    heard.current = new Set(keys);
    if (previous === null || muted) return;

    const fresh = session.buzzes.filter((_, i) => !previous.has(keys[i]));
    fresh.forEach((buzz, i) => {
      const teamIndex = session.teams.findIndex((t) => t.id === buzz.teamId);
      const sound = buzzerSoundFor(session.teams[teamIndex]?.buzzerSound, Math.max(teamIndex, 0));
      const timer = setTimeout(() => {
        pending.current.splice(pending.current.indexOf(timer), 1);
        playBuzzerSound(sound);
      }, i * STAGGER_MS);
      pending.current.push(timer);
    });
  }, [session, muted]);

  // Leaving the board: no staggered sound may still go off on the next page. (The array is mutated, never replaced.)
  useEffect(() => {
    const timers = pending.current;
    return () => timers.forEach(clearTimeout);
  }, []);
}
