import type { SessionUser } from "@/types";

/** Decodes the JWT payload for DISPLAY purposes only. The backend is the one that validates. */
export function decodeSessionUser(token: string): SessionUser | null {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join(""),
    );
    const claims = JSON.parse(json) as { sub?: string; email?: string; roles?: unknown };
    if (!claims.sub) return null;
    return {
      sub: claims.sub,
      email: claims.email,
      roles: Array.isArray(claims.roles) ? claims.roles.map(String) : [],
    };
  } catch {
    return null;
  }
}
