"use client";

import { useCallback, useEffect, useState } from "react";

/** Counts down from `seconds` as soon as it mounts. Mount it with a `key` to restart it. */
export function useCountdown(seconds: number) {
  const totalMs = seconds * 1000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const [running, setRunning] = useState(true);
  const done = remainingMs <= 0;

  useEffect(() => {
    if (!running || done) return;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      setRemainingMs((r) => Math.max(0, r - (now - last)));
      last = now;
    }, 100);
    return () => clearInterval(id);
  }, [running, done]);

  const pause = useCallback(() => setRunning(false), []);
  const resume = useCallback(() => setRunning(true), []);
  const reset = useCallback(() => {
    setRemainingMs(totalMs);
    setRunning(true);
  }, [totalMs]);

  return { remainingMs, seconds: Math.ceil(remainingMs / 1000), fraction: remainingMs / totalMs, running, done, pause, resume, reset };
}
