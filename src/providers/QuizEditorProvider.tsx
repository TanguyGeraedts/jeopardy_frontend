"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { addCategory, removeCategory, renameCategory } from "@/lib/api/categories";
import { addQuestion, removeQuestion, updateQuestion } from "@/lib/api/questions";
import {
  withCategoryAdded,
  withCategoryRemoved,
  withCategoryReplaced,
  withQuestionAdded,
  withQuestionRemoved,
  withQuestionReplaced,
} from "@/lib/quiz-state";
import type { QuizUpdate } from "@/hooks/useQuiz";
import type { Category, QuestionRequest } from "@/types";

/**
 * Everything the board can do to the quiz it shows. Each action calls the API, then applies the
 * result locally. Actions THROW an ApiError on failure: the calling component shows it.
 */
interface QuizEditor {
  quizId: string;
  addCategory: (name: string) => Promise<Category>;
  renameCategory: (categoryId: string, name: string) => Promise<void>;
  removeCategory: (categoryId: string) => Promise<void>;
  addQuestion: (categoryId: string, body: QuestionRequest) => Promise<void>;
  updateQuestion: (categoryId: string, questionId: string, body: QuestionRequest) => Promise<void>;
  removeQuestion: (categoryId: string, questionId: string) => Promise<void>;
}

const QuizEditorContext = createContext<QuizEditor | null>(null);

interface ProviderProps {
  quizId: string;
  onQuizChange: (update: QuizUpdate) => void;
  children: ReactNode;
}

export function QuizEditorProvider({ quizId, onQuizChange, children }: ProviderProps) {
  const editor = useMemo<QuizEditor>(
    () => ({
      quizId,
      async addCategory(name) {
        const category = await addCategory(quizId, { name });
        onQuizChange((q) => withCategoryAdded(q, category));
        return category;
      },
      async renameCategory(categoryId, name) {
        const category = await renameCategory(quizId, categoryId, { name });
        onQuizChange((q) => withCategoryReplaced(q, category));
      },
      async removeCategory(categoryId) {
        await removeCategory(quizId, categoryId);
        onQuizChange((q) => withCategoryRemoved(q, categoryId));
      },
      async addQuestion(categoryId, body) {
        const question = await addQuestion(quizId, categoryId, body);
        onQuizChange((q) => withQuestionAdded(q, categoryId, question));
      },
      async updateQuestion(categoryId, questionId, body) {
        const question = await updateQuestion(quizId, categoryId, questionId, body);
        onQuizChange((q) => withQuestionReplaced(q, categoryId, question));
      },
      async removeQuestion(categoryId, questionId) {
        await removeQuestion(quizId, categoryId, questionId);
        onQuizChange((q) => withQuestionRemoved(q, categoryId, questionId));
      },
    }),
    [quizId, onQuizChange],
  );

  return <QuizEditorContext.Provider value={editor}>{children}</QuizEditorContext.Provider>;
}

export function useQuizEditor(): QuizEditor {
  const ctx = useContext(QuizEditorContext);
  if (!ctx) throw new Error("useQuizEditor must be used inside <QuizEditorProvider>");
  return ctx;
}
