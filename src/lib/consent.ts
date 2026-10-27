import { useSyncExternalStore } from "react";

/**
 * The visitor's choice about external media: YouTube embeds and the images, videos and sounds quiz makers link to from
 * other sites. Loading those hands the visitor's IP address to a third party, so nothing loads until they allow it.
 * The choice itself lives in local storage (strictly necessary: it is how the choice is remembered).
 */
export type MediaConsent = "allowed" | "blocked";

/** "unknown" until the browser has been read: on the server and during hydration. */
export type MediaConsentState = MediaConsent | null | "unknown";

export const CONSENT_KEY = "jeopardy.consent.external-media";
const CHANGE = "jeopardy:consent-change";
const REOPEN = "jeopardy:consent-reopen";

// Fallback for when storage throws, so a choice still sticks until the page reloads.
let memory: MediaConsent | null = null;

function read(): MediaConsent | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "allowed" || value === "blocked" ? value : null;
  } catch {
    return null; // storage blocked: ask again on every visit
  }
}

export function setMediaConsent(choice: MediaConsent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // storage blocked: the choice holds for this page only
  }
  memory = choice;
  window.dispatchEvent(new Event(CHANGE));
}

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => event.key === CONSENT_KEY && onChange();
  window.addEventListener(CHANGE, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function useMediaConsent(): MediaConsentState {
  return useSyncExternalStore(subscribe, () => read() ?? memory, () => "unknown");
}

/** Shows the consent banner again (the footer's "Cookie settings"). */
export function reopenConsentSettings() {
  window.dispatchEvent(new Event(REOPEN));
}

export function onReopenConsentSettings(listener: () => void) {
  window.addEventListener(REOPEN, listener);
  return () => window.removeEventListener(REOPEN, listener);
}

/** Media served from this site itself reaches no third party, so it never needs consent. */
export function isSameOrigin(url: string) {
  try {
    return new URL(url, window.location.href).origin === window.location.origin;
  } catch {
    return false;
  }
}
