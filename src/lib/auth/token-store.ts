/**
 * Where the mock JWT lives. Exposed as a tiny external store so React can subscribe
 * (useSyncExternalStore) and the API client can read/clear it outside of React.
 *
 * MOCK ONLY: localStorage is fine for a dev token. When you move to the real OIDC
 * provider, replace this with the provider's session handling (ideally httpOnly cookies).
 */
const KEY = "jeopardy.access_token";
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const tokenStore = {
  get(): string | null {
    try {
      return window.localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    window.localStorage.setItem(KEY, token);
    emit();
  },
  clear() {
    window.localStorage.removeItem(KEY);
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener("storage", listener); // other tabs
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", listener);
    };
  },
};
