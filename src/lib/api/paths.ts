/** Mirror of common/web/ApiPaths.java (creator part only). */
export const API_V1 = "/api/v1";

export const CreatorPaths = {
    /** POST = create, GET = list my quizzes (same path, different method). */
    quizzes: `${API_V1}/quizzes`,
    /** GET = read, PUT = update, DELETE = delete. */
    quizById: (id: string) => `${API_V1}/quizzes/${encodeURIComponent(id)}`,
} as const;

export const AuthPaths = {
    mockToken: "/api/public/mock-auth/token",
    me: "/api/demo/me",
} as const;