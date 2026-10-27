"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Counts down from `seconds` as soon as it mounts. Mount it with a `key` to restart it.
 * `held` stops the clock from outside (e.g. while someone answers) and is separate from pause/resume, so
 * `reset` (back to full time) never starts a clock that is held: it runs again once the hold ends.
 */
export function useCountdown(seconds: number, held = false) {
  const totalMs = seconds * 1000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [running, setRunning] = useState(true);
  const done = remainingMs <= 0;
  const ticking = running && !held && !done;

  useEffect(() => {
    if (!ticking) return;
    let last = Date.now();
    const id = setInterval(() => {
      // Measure here, not inside the updater: React may run the updater later, after `last` has moved on (= 0 ms).
      const now = Date.now();
      const elapsed = now - last;
      last = now;
      setRemainingMs((r) => Math.max(0, r - elapsed));
    }, 100);
    return () => clearInterval(id);
  }, [ticking]);

  const pause = useCallback(() => setRunning(false), []);
  const resume = useCallback(() => setRunning(true), []);
  const reset = useCallback(() => {
    setRemainingMs(totalMs);
    setRunning(true);
  }, [totalMs]);

  return { remainingMs, seconds: Math.ceil(remainingMs / 1000), fraction: remainingMs / totalMs, running: ticking, done, pause, resume, reset };
}
