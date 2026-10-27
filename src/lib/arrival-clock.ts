/**
 * When each session update arrived in this browser. The server sends its countdowns ("buzzers open in 1200 ms")
 * relative to when it sent them, so screens count from arrival: a wrong clock on a phone doesn't matter.
 * Stamp sessions where they're received (stream events, fetches); read them anywhere.
 */
const arrivals = new WeakMap<object, number>();

export function stampArrival<T extends object>(session: T): T {
  arrivals.set(session, Date.now());
  return session;
}

/** Undefined for a session that was never stamped. */
export const arrivalOf = (session: object): number | undefined => arrivals.get(session);

// ---- A shared clock that only ticks while a screen counts something down ----

const TICK_MS = 100;
let now = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

/** For useSyncExternalStore: ticks every 100 ms while anyone is subscribed. */
export function subscribeClock(onChange: () => void): () => void {
  listeners.add(onChange);
  now = Date.now();
  timer ??= setInterval(() => {
    now = Date.now();
    listeners.forEach((listener) => listener());
  }, TICK_MS);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

export const clockNow = () => now;
