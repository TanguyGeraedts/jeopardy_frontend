import { POINT_LADDER } from "@/lib/quiz-state";

/**
 * Rows are a client-side idea (the backend only stores each question's points), so the list of
 * rows a person has set up for a quiz, including empty ones, is remembered in this browser.
 */
const key = (quizId: string) => `jeopardy.rows.${quizId}`;

export function loadRows(quizId: string): number[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key(quizId)) ?? "null");
    if (Array.isArray(parsed) && parsed.every((n) => Number.isInteger(n) && n > 0)) return parsed;
  } catch {
    // storage unavailable or corrupt: fall back to the defaults
  }
  return [...POINT_LADDER];
}

export function saveRows(quizId: string, rows: readonly number[]) {
  try {
    window.localStorage.setItem(key(quizId), JSON.stringify(rows));
  } catch {
    // storage full/blocked: rows just won't be remembered
  }
}

export function forgetRows(quizId: string) {
  try {
    window.localStorage.removeItem(key(quizId));
  } catch {
    // ignore
  }
}
