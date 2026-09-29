import type { AnswerType } from "@/types";

/**
 * Client-side mirror of the backend rules, for instant feedback only.
 * The backend stays the source of truth: always show its errors too.
 * Each validator returns an error message, or null when valid.
 */
export const QUIZ_NAME_MAX = 255;

export function validateQuizName(name: string): string | null {
  const value = name.trim();
  if (!value) return "Quiz name is required";
  if (value.length > QUIZ_NAME_MAX) return `Quiz name must be at most ${QUIZ_NAME_MAX} characters`;
  return null;
}

// Ready for when the question endpoints exist (rules from creator/domain/model/Question.java):
export const validatePoints = (points: number) =>
  Number.isInteger(points) && points > 0 ? null : "Points must be a positive whole number";

export const validateQuestionText = (text: string) => (text.trim() ? null : "Question text is required");

export const validateAnswerText = (text: string) => (text.trim() ? null : "Answer text is required");

export const validateMediaUrl = (type: AnswerType, url: string | null | undefined) =>
  type !== "TEXT" && !url?.trim() ? `A media URL is required for ${type} answers` : null;
