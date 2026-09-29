"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { requestMockToken } from "@/lib/api/auth";
import { decodeSessionUser } from "@/lib/auth/jwt";
import { tokenStore } from "@/lib/auth/token-store";
import type { MockTokenRequest, SessionUser } from "@/types";

interface AuthContextValue {
  /** false during SSR/hydration, so we don't flash the login panel before reading storage. */
  ready: boolean;
  user: SessionUser | null;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  /** Mock login: asks the dev backend for a token. Swap the body for OIDC later. */
  login: (request?: MockTokenRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const noopSubscribe = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useSyncExternalStore(tokenStore.subscribe, tokenStore.get, () => null);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const user = useMemo(() => (token ? decodeSessionUser(token) : null), [token]);

  const login = useCallback(async (request?: MockTokenRequest) => {
    const { access_token } = await requestMockToken(request);
    tokenStore.set(access_token);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      user,
      isAuthenticated: user !== null,
      // Backend authorities are ROLE_X; the token carries plain X. Accept both forms.
      hasRole: (role) => !!user?.roles.some((r) => r.replace(/^ROLE_/, "") === role.replace(/^ROLE_/, "")),
      login,
      logout: tokenStore.clear,
    }),
    [ready, user, login],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
