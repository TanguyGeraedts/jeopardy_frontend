import { apiFetch, request } from "./client";
import { AuthPaths } from "./paths";
import type { MeResponse, MockTokenRequest, MockTokenResponse } from "@/types";

/** DEV profile only. Sends no body when called without arguments (backend then uses its defaults). */
export const requestMockToken = (body?: MockTokenRequest) =>
  request<MockTokenResponse>(AuthPaths.mockToken, { method: "POST", body: body ?? {}, auth: false });

/** Handy to check what the backend thinks you are (needs app.security.demo-endpoints=true). */
export const fetchMe = () => apiFetch<MeResponse>(AuthPaths.me);
