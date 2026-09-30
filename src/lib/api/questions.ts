import { apiFetch, request } from "./client";
import { CreatorPaths } from "./paths";
import type { Question, QuestionRequest } from "@/types";

export const addQuestion = (quizId: string, categoryId: string, body: QuestionRequest) =>
  apiFetch<Question>(CreatorPaths.questions(quizId, categoryId), { method: "POST", body });

/** PUT replaces the whole question, so always send every field. */
export const updateQuestion = (quizId: string, categoryId: string, questionId: string, body: QuestionRequest) =>
  apiFetch<Question>(CreatorPaths.questionById(quizId, categoryId, questionId), { method: "PUT", body });

/** 204 No Content. */
export const removeQuestion = (quizId: string, categoryId: string, questionId: string) =>
  request<void>(CreatorPaths.questionById(quizId, categoryId, questionId), { method: "DELETE" });
