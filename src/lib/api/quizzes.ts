import { apiFetch, request } from "./client";
import { CreatorPaths, DiscoverPaths } from "./paths";
import type { CreateQuizRequest, DiscoverQuiz, DiscoverSort, Quiz, QuizTopic, UpdateQuizRequest } from "@/types";

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

/** authorName is required when publishing: shown as "by …" in Discover. */
export const setPublished = (id: string, published: boolean, authorName: string | null) =>
    apiFetch<Quiz>(CreatorPaths.publication(id), { method: "PUT", body: { published, authorName } });

/** Replaces the topics (at most MAX_QUIZ_TOPICS). */
export const setTopics = (id: string, topics: QuizTopic[]) =>
    apiFetch<Quiz>(CreatorPaths.topics(id), { method: "PUT", body: { topics } });

export const duplicateQuiz = (id: string) =>
    apiFetch<Quiz>(CreatorPaths.duplicate(id), { method: "POST" });

export interface DiscoverQuery {
    q?: string;
    topic?: QuizTopic | null;
    sort?: DiscoverSort;
}

/** Everyone's published quizzes, board shape only (no questions). */
export const searchQuizzes = ({ q, topic, sort }: DiscoverQuery, signal?: AbortSignal) => {
    const params = new URLSearchParams();
    if (q?.trim()) params.set("q", q.trim());
    if (topic) params.set("topic", topic);
    if (sort) params.set("sort", sort);
    const query = params.toString();
    return apiFetch<DiscoverQuiz[]>(query ? `${DiscoverPaths.search}?${query}` : DiscoverPaths.search, { signal });
};

/** A quiz you may host (yours, or published). Works for anyone's quiz, unlike getQuiz (owner only). */
export const getHostableQuiz = (id: string, signal?: AbortSignal) =>
    apiFetch<DiscoverQuiz>(DiscoverPaths.byId(id), { signal });