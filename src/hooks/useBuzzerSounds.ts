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
  const heard = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!session) return;
    const keys = session.buzzes.map((b) => `${session.activeClueId}:${b.playerId}`);

    if (heard.current === null) {
      heard.current = new Set(keys);
      return;
    }

    const fresh = session.buzzes.filter((_, i) => !heard.current!.has(keys[i]));
    keys.forEach((key) => heard.current!.add(key));
    if (muted) return;

    fresh.forEach((buzz, i) => {
      const teamIndex = session.teams.findIndex((t) => t.id === buzz.teamId);
      const sound = buzzerSoundFor(session.teams[teamIndex]?.buzzerSound, Math.max(teamIndex, 0));
      setTimeout(() => playBuzzerSound(sound), i * STAGGER_MS);
    });
  }, [session, muted]);
}
