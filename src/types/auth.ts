/** POST /api/public/mock-auth/token (dev profile only). Body is optional; all fields optional. */
export interface MockTokenRequest {
  sub?: string;
  email?: string;
  roles?: string[];
}

/** Not wrapped in ApiResponse: the mock controller returns this record directly. */
export interface MockTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number; // seconds
}

/** GET /api/demo/me (needs app.security.demo-endpoints=true). Note: roles come back as ROLE_*. */
export interface MeResponse {
  subject: string;
  email: string;
  roles: string[];
  ownerId: string;
}

/** What we read out of the JWT payload client-side (display only, never trusted). */
export interface SessionUser {
  sub: string;
  email?: string;
  roles: string[];
}
