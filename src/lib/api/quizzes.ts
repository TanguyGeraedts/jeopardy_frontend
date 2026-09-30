import { apiFetch, request } from "./client";
import { CreatorPaths } from "./paths";
import type { CreateQuizRequest, Quiz, UpdateQuizRequest } from "@/types";

export const createQuiz = (body: CreateQuizRequest, signal?: AbortSignal) =>
    apiFetch<Quiz>(CreatorPaths.quizzes, { method: "POST", body, signal });

export const getMyQuizzes = (signal?: AbortSignal) =>
    apiFetch<Quiz[]>(CreatorPaths.quizzes, { signal });

export const getQuiz = (id: string, signal?: AbortSignal) =>
    apiFetch<Quiz>(CreatorPaths.quizById(id), { signal });

export const updateQuiz = (id: string, body: UpdateQuizRequest) =>
    apiFetch<Quiz>(CreatorPaths.quizById(id), { method: "PUT", body });

/** Backend answers 204 No Content, so there is no ApiResponse to unwrap. */
export const deleteQuiz = (id: string) =>
    request<void>(CreatorPaths.quizById(id), { method: "DELETE" });

// Add new creator endpoints here as the backend grows
// (add category, add question, toggle daily double, ...).