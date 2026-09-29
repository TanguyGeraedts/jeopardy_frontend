/** common/web/ApiResponse.java */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: string; // ISO-8601 Instant
}

/**
 * Spring ProblemDetail (RFC 7807), as built in GlobalExceptionHandler.
 * `errors` is only present on 400 "Validation Failed" (field -> message).
 */
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  timestamp?: string;
  errors?: Record<string, string>;
}
