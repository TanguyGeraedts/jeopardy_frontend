import type { Category, Question, QuestionRequest, Quiz } from "@/types";

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

/** Point values every new board starts with. Rows only exist client-side (the backend just stores points). */
export const POINT_LADDER = [200, 400, 600, 800, 1000] as const;

/** Board rows: the rows we track locally plus every point value a question already uses, ascending. */
export const boardRows = (quiz: Quiz, trackedRows: readonly number[]): number[] =>
  [...new Set([...trackedRows, ...quiz.categories.flatMap((c) => c.questions.map((q) => q.points))])].sort((a, b) => a - b);

/** Value for "+ Add row": continues the step between the last two rows (200 by default). */
export const nextRowPoints = (rows: readonly number[]): number => {
  const last = rows[rows.length - 1] ?? 0;
  const step = rows.length > 1 ? last - rows[rows.length - 2] : 200;
  return last + step;
};

/** Every question sitting on one row, with the category it belongs to. */
export const questionsAtPoints = (quiz: Quiz, points: number): Array<{ categoryId: string; question: Question }> =>
  quiz.categories.flatMap((c) => c.questions.filter((q) => q.points === points).map((question) => ({ categoryId: c.id, question })));

/** Body for POST/PUT from an existing question (used by undo and by moving a row). */
export const toQuestionRequest = (q: Question): QuestionRequest => ({
  points: q.points,
  questionText: q.questionText,
  answerText: q.answerText,
  answerType: q.answerType,
  mediaUrl: q.mediaUrl,
  dailyDouble: q.dailyDouble,
});
