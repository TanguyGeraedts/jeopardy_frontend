import { apiFetch } from "./client";
import { CreatorPaths } from "./paths";
import type { CreateQuizRequest, Quiz } from "@/types";

export const createQuiz = (body: CreateQuizRequest, signal?: AbortSignal) =>
  apiFetch<Quiz>(CreatorPaths.quizzes, { method: "POST", body, signal });

export const getQuiz = (id: string, signal?: AbortSignal) =>
  apiFetch<Quiz>(CreatorPaths.quizById(id), { signal });

// Add new creator endpoints here as the backend grows
// (list quizzes, add category, add question, toggle daily double, ...).
