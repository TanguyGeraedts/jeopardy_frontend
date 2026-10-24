import { getToken } from "@clerk/nextjs";
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

/** Best single sentence to show for an error: the first field message if there is one, else the general one. */
export function errorMessage(error: unknown): string {
    const apiError = toApiError(error);
    return Object.values(apiError.fieldErrors)[0] ?? apiError.message;
}

interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    /** Send the host's Clerk session token. Default true; player calls (handoff, buzz) set false. */
    auth?: boolean;
    signal?: AbortSignal;
    /** Extra headers, e.g. the player token for a buzz. */
    headers?: Record<string, string>;
}

/** Low-level call: returns the parsed JSON body as-is (no ApiResponse unwrapping). */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, auth = true, signal } = options;

    const headers: Record<string, string> = { Accept: "application/json", ...options.headers };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) {
        // Clerk session tokens live ~60 s; getToken() returns a fresh one (refreshed in the background).
        const token = await getToken().catch(() => null);
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
        const problem = (await response.json().catch(() => null)) as ProblemDetail | null;
        throw new ApiError(
            response.status,
            problem?.title ?? response.statusText,
            problem?.detail ?? `Request failed with status ${response.status}.`,
            problem?.errors ?? {},
        );
    }

    // 204 No Content (e.g. DELETE): nothing to parse.
    if (response.status === 204) return undefined as T;

    return (await response.json()) as T;
}

/** Standard call for endpoints that answer with ApiResponse<T>: returns just `data`. */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const envelope = await request<ApiResponse<T>>(path, options);
    return envelope.data;
}