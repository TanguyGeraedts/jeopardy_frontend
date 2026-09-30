import type { AnswerType } from "@/types";

/**
 * Client-side mirror of the backend rules, for instant feedback only.
 * The backend stays the source of truth: always show its errors too.
 * Each validator returns an error message, or null when valid.
 */
export const QUIZ_NAME_MAX = 255;
export const CATEGORY_NAME_MAX = 255;
export const QUESTION_TEXT_MAX = 2000;
export const ANSWER_TEXT_MAX = 1000;
export const MEDIA_URL_MAX = 2048;

const HTTP_URL = /^https?:\/\/\S+$/;

export function validateQuizName(name: string): string | null {
  const value = name.trim();
  if (!value) return "Quiz name is required";
  if (value.length > QUIZ_NAME_MAX) return `Quiz name must be at most ${QUIZ_NAME_MAX} characters`;
  return null;
}

export function validateCategoryName(name: string): string | null {
  const value = name.trim();
  if (!value) return "Category name is required";
  if (value.length > CATEGORY_NAME_MAX) return `Category name must be at most ${CATEGORY_NAME_MAX} characters`;
  return null;
}

/** Raw form values (everything is a string while typing). */
export interface QuestionFormValues {
  points: string;
  questionText: string;
  answerText: string;
  answerType: AnswerType;
  mediaUrl: string;
}

/** Returns field -> message. Keys match the backend's validation error keys. Empty = valid. */
export function validateQuestion(values: QuestionFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  const points = Number(values.points);
  if (!values.points.trim() || !Number.isInteger(points) || points <= 0) {
    errors.points = "Points must be a whole number greater than 0";
  }

  const questionText = values.questionText.trim();
  if (!questionText) errors.questionText = "Question text is required";
  else if (questionText.length > QUESTION_TEXT_MAX) errors.questionText = `Question text must be at most ${QUESTION_TEXT_MAX} characters`;

  const answerText = values.answerText.trim();
  if (!answerText) errors.answerText = "Answer text is required";
  else if (answerText.length > ANSWER_TEXT_MAX) errors.answerText = `Answer text must be at most ${ANSWER_TEXT_MAX} characters`;

  if (values.answerType !== "TEXT") {
    const url = values.mediaUrl.trim();
    if (!url) errors.mediaUrl = `A media URL is required for ${values.answerType} answers`;
    else if (url.length > MEDIA_URL_MAX) errors.mediaUrl = `Media URL must be at most ${MEDIA_URL_MAX} characters`;
    else if (!HTTP_URL.test(url)) errors.mediaUrl = "Media URL must be a valid http(s) URL";
  }

  return errors;
}
