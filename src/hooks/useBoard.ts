"use client";

import { useEffect, useState } from "react";
import { errorMessage } from "@/lib/api/client";
import { boardRows, nextRowPoints, questionsAtPoints, toQuestionRequest } from "@/lib/quiz-state";
import { loadRows, saveRows } from "@/lib/rows-store";
import { isValidPoints, validateCategoryName } from "@/lib/validation/quiz";
import { useQuizEditor } from "@/providers/QuizEditorProvider";
import { useToast } from "@/providers/ToastProvider";
import type { Category, Question, Quiz } from "@/types";

/**
 * Everything the board grid does that needs feedback: rows, inline renames, and deletes with undo.
 * These never throw. Failures become an error toast, and the boolean results tell the caller
 * whether to keep or revert what the person typed.
 *
 * Rows only exist in the browser (the backend just stores each question's points), so the row list
 * is remembered per quiz in localStorage (lib/rows-store). Clearing site data resets it to 200-1000.
 * Undo re-creates deleted items, so they get new ids and a category returns at the end of the board.
 */
export function useBoard(quiz: Quiz) {
  const editor = useQuizEditor();
  const { show } = useToast();
  // Lazy init is safe: the board only mounts after the quiz loaded in the browser (never server-rendered).
  const [trackedRows, setTrackedRows] = useState<number[]>(() => loadRows(quiz.id));
  useEffect(() => saveRows(quiz.id, trackedRows), [quiz.id, trackedRows]);
  const rows = boardRows(quiz, trackedRows);

  const fail = (e: unknown) => show(errorMessage(e), { tone: "error" });
  const invalid = (message: string) => show(message, { tone: "error" });

  async function renameCategory(categoryId: string, name: string): Promise<boolean> {
    const problem = validateCategoryName(name);
    if (problem) {
      invalid(problem);
      return false;
    }
    try {
      await editor.renameCategory(categoryId, name.trim());
      show("Category renamed");
      return true;
    } catch (e) {
      fail(e); // e.g. 409 duplicate category name
      return false;
    }
  }

  async function removeCategory(category: Category) {
    try {
      await editor.removeCategory(category.id);
    } catch (e) {
      return fail(e);
    }
    show(`Deleted "${category.name}" and ${category.questions.length} question(s)`, {
      undo: async () => {
        const restored = await editor.addCategory(category.name);
        await Promise.all(category.questions.map((q) => editor.addQuestion(restored.id, toQuestionRequest(q))));
      },
    });
  }

  async function removeQuestion(categoryId: string, question: Question) {
    try {
      await editor.removeQuestion(categoryId, question.id);
    } catch (e) {
      return fail(e);
    }
    show("Question deleted", { undo: () => editor.addQuestion(categoryId, toQuestionRequest(question)) });
  }

  function addRow() {
    const points = nextRowPoints(rows);
    setTrackedRows((r) => [...r, points]);
    show(`Row ${points} added`);
  }

  /** Re-values a whole row: every question on it moves to the new points. */
  async function changeRowPoints(from: number, to: number): Promise<boolean> {
    if (to === from) return true;
    if (!isValidPoints(to)) {
      invalid("Point values must be whole numbers above 0");
      return false;
    }
    if (rows.includes(to)) {
      invalid(`There is already a ${to} point row`);
      return false;
    }

    const results = await Promise.allSettled(
      questionsAtPoints(quiz, from).map(({ categoryId, question }) =>
        editor.updateQuestion(categoryId, question.id, { ...toQuestionRequest(question), points: to }),
      ),
    );
    const failure = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failure) {
      fail(failure.reason);
      return false;
    }
    setTrackedRows((r) => r.map((p) => (p === from ? to : p)));
    show(`Row changed to ${to}`);
    return true;
  }

  /** Removes a row together with the questions on it. */
  async function removeRow(points: number) {
    const affected = questionsAtPoints(quiz, points);
    const results = await Promise.allSettled(affected.map(({ categoryId, question }) => editor.removeQuestion(categoryId, question.id)));
    const failure = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failure) return fail(failure.reason);

    setTrackedRows((r) => r.filter((p) => p !== points));
    show(`Removed row ${points}${affected.length ? ` and ${affected.length} question(s)` : ""}`, {
      undo: async () => {
        setTrackedRows((r) => (r.includes(points) ? r : [...r, points]));
        await Promise.all(affected.map(({ categoryId, question }) => editor.addQuestion(categoryId, toQuestionRequest(question))));
      },
    });
  }

  return { rows, addRow, changeRowPoints, removeRow, renameCategory, removeCategory, removeQuestion };
}
