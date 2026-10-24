/**
 * What we read out of a JWT payload client-side (display only, never trusted): used for the lobby's player token.
 * Host logins are Clerk's business (useUser / <UserButton />).
 */
export interface SessionUser {
  sub: string;
  email?: string;
  roles: string[];
}
