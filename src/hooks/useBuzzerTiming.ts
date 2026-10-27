"use client";

import { useSyncExternalStore } from "react";
import { arrivalOf, clockNow, subscribeClock } from "@/lib/arrival-clock";
import type { GameSession } from "@/types";

/**
 * Where the open clue's buzzers are, right now:
 * - reading: the host is reading, buzzers closed
 * - opening: the host opened them; without turns they open after a short random delay
 * - headStart: only the turn team (clueTurnTeamId) may buzz; everyone else can steal after stealInMs
 * - open: anyone (who isn't locked out or already in line) may buzz
 * - none: no clue open
 */
export type BuzzerPhase = "none" | "reading" | "opening" | "headStart" | "open";

export interface BuzzerTiming {
  phase: BuzzerPhase;
  /** Ms until the buzzers open (phase "opening"). */
  opensInMs: number;
  /** Ms until anyone may steal (phase "headStart"). */
  stealInMs: number;
}

const noSubscribe = () => () => {};

/**
 * The buzzer phase and countdowns for a live session (stamped with stampArrival where it was received).
 * Re-renders every 100 ms only while a countdown runs.
 */
export function useBuzzerTiming(session: GameSession | null): BuzzerTiming {
  const arrival = session ? arrivalOf(session) : undefined;
  const openAt = arrival != null && session?.buzzersOpenInMs != null ? arrival + session.buzzersOpenInMs : null;
  const stealAt = arrival != null && session?.stealOpensInMs != null ? arrival + session.stealOpensInMs : null;
  const hasCountdown = (session?.buzzersOpenInMs ?? 0) > 0 || (session?.stealOpensInMs ?? 0) > 0;

  // Subscribing starts the shared clock; a countdown that has run out just stays at 0.
  const now = useSyncExternalStore(hasCountdown ? subscribeClock : noSubscribe, clockNow, () => 0);

  if (!session?.activeClueId) return { phase: "none", opensInMs: 0, stealInMs: 0 };
  if (session.state === "CLUE_READING") return { phase: "reading", opensInMs: 0, stealInMs: 0 };
  if (session.state !== "BUZZER_OPEN" && session.state !== "ANSWER_EVALUATION") return { phase: "none", opensInMs: 0, stealInMs: 0 };

  // Never more than the server said: the shared clock may not have ticked yet right after an update.
  const remaining = (at: number | null, sent: number | null) => (at == null || !sent ? 0 : Math.min(sent, Math.max(0, at - now)));
  const opensInMs = remaining(openAt, session.buzzersOpenInMs);
  const stealInMs = remaining(stealAt, session.stealOpensInMs);
  if (opensInMs > 0) return { phase: "opening", opensInMs, stealInMs };
  // A daily double with turns has no steal at all (stealOpensInMs null): it stays the turn team's.
  if (session.clueTurnTeamId && (stealAt == null || stealInMs > 0)) return { phase: "headStart", opensInMs: 0, stealInMs };
  return { phase: "open", opensInMs: 0, stealInMs: 0 };
}
