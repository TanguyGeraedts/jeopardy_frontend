/** Mirror of common/web/ApiPaths.java (creator part only). */
export const API_V1 = "/api/v1";

export const CreatorPaths = {
    quizzes: `${API_V1}/quizzes`,
    myQuizzes: `${API_V1}/quizzes/me`,
    quizById: (id: string) => `${API_V1}/quizzes/${encodeURIComponent(id)}`,
} as const;

export const AuthPaths = {
    mockToken: "/api/public/mock-auth/token",
    me: "/api/demo/me",
} as const;