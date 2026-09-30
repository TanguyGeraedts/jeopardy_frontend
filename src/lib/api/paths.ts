/** Mirror of common/web/ApiPaths.java (creator part only). */
export const API_V1 = "/api/v1";

const enc = encodeURIComponent;

export const CreatorPaths = {
  /** POST = create, GET = list my quizzes (same path, different method). */
  quizzes: `${API_V1}/quizzes`,
  /** GET = read, PUT = update, DELETE = delete. */
  quizById: (quizId: string) => `${API_V1}/quizzes/${enc(quizId)}`,

  /** POST = add category. */
  categories: (quizId: string) => `${CreatorPaths.quizById(quizId)}/categories`,
  /** PUT = rename, DELETE = remove. */
  categoryById: (quizId: string, categoryId: string) => `${CreatorPaths.categories(quizId)}/${enc(categoryId)}`,

  /** POST = add question. */
  questions: (quizId: string, categoryId: string) => `${CreatorPaths.categoryById(quizId, categoryId)}/questions`,
  /** PUT = replace, DELETE = remove. */
  questionById: (quizId: string, categoryId: string, questionId: string) =>
    `${CreatorPaths.questions(quizId, categoryId)}/${enc(questionId)}`,
} as const;

export const AuthPaths = {
  mockToken: "/api/public/mock-auth/token",
  me: "/api/demo/me",
} as const;
