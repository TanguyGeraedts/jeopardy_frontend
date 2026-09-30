import type { Category, Question, Quiz } from "@/types";

/**
 * Pure helpers that apply the result of an API call to the quiz we already hold,
 * so the board updates instantly without refetching.
 */
const mapCategory = (quiz: Quiz, categoryId: string, fn: (c: Category) => Category): Quiz => ({
  ...quiz,
  categories: quiz.categories.map((c) => (c.id === categoryId ? fn(c) : c)),
});

export const withCategoryAdded = (quiz: Quiz, category: Category): Quiz => ({
  ...quiz,
  categories: [...quiz.categories, category],
});

export const withCategoryReplaced = (quiz: Quiz, category: Category): Quiz =>
  mapCategory(quiz, category.id, () => category);

export const withCategoryRemoved = (quiz: Quiz, categoryId: string): Quiz => ({
  ...quiz,
  categories: quiz.categories.filter((c) => c.id !== categoryId),
});

export const withQuestionAdded = (quiz: Quiz, categoryId: string, question: Question): Quiz =>
  mapCategory(quiz, categoryId, (c) => ({ ...c, questions: [...c.questions, question] }));

export const withQuestionReplaced = (quiz: Quiz, categoryId: string, question: Question): Quiz =>
  mapCategory(quiz, categoryId, (c) => ({
    ...c,
    questions: c.questions.map((q) => (q.id === question.id ? question : q)),
  }));

export const withQuestionRemoved = (quiz: Quiz, categoryId: string, questionId: string): Quiz =>
  mapCategory(quiz, categoryId, (c) => ({ ...c, questions: c.questions.filter((q) => q.id !== questionId) }));

/** Suggested points for a new question: 200 more than the highest one (200 when empty). */
export const nextPoints = (category: Category): number =>
  category.questions.reduce((max, q) => Math.max(max, q.points), 0) + 200;
