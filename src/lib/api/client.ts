import { tokenStore } from "@/lib/auth/token-store";
import type { ApiResponse, ProblemDetail } from "@/types";

/** Normalised error thrown for every failed call. Built from the backend's ProblemDetail. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    message: string,
    public readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError(0, "Unexpected error", error instanceof Error ? error.message : "Something went wrong.");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Send the Bearer token. Default true; the mock-auth endpoint is public. */
  auth?: boolean;
  signal?: AbortSignal;
}

/** Low-level call: returns the parsed JSON body as-is (no ApiResponse unwrapping). */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, "Network error", "Could not reach the backend. Is it running?");
  }

  if (!response.ok) {
    // Token rejected/expired: drop it so the UI falls back to the login panel.
    if (response.status === 401 && auth) tokenStore.clear();

    const problem = (await response.json().catch(() => null)) as ProblemDetail | null;
    throw new ApiError(
      response.status,
      problem?.title ?? response.statusText,
      problem?.detail ?? `Request failed with status ${response.status}.`,
      problem?.errors ?? {},
    );
  }

  return (await response.json()) as T;
}

/** Standard call for endpoints that answer with ApiResponse<T>: returns just `data`. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const envelope = await request<ApiResponse<T>>(path, options);
  return envelope.data;
}
