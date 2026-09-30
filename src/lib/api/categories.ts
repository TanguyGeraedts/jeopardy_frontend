import { apiFetch, request } from "./client";
import { CreatorPaths } from "./paths";
import type { Category, CategoryRequest } from "@/types";

export const addCategory = (quizId: string, body: CategoryRequest) =>
  apiFetch<Category>(CreatorPaths.categories(quizId), { method: "POST", body });

export const renameCategory = (quizId: string, categoryId: string, body: CategoryRequest) =>
  apiFetch<Category>(CreatorPaths.categoryById(quizId, categoryId), { method: "PUT", body });

/** 204 No Content. Also removes the category's questions. */
export const removeCategory = (quizId: string, categoryId: string) =>
  request<void>(CreatorPaths.categoryById(quizId, categoryId), { method: "DELETE" });
