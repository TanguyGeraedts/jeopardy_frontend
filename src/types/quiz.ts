/** creator/domain/model/AnswerType.java */
export const ANSWER_TYPES = ["TEXT", "IMAGE", "VIDEO"] as const;
export type AnswerType = (typeof ANSWER_TYPES)[number];

/** creator/adapter/in/web/dto/QuizResponse.java */
export interface Question {
  id: string;
  points: number;
  questionText: string;
  answerText: string;
  answerType: AnswerType;
  mediaUrl: string | null;
  dailyDouble: boolean;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface Quiz {
  id: string;
  name: string;
  categories: Category[];
}

/** creator/adapter/in/web/dto/CreateQuizRequest.java */
export interface CreateQuizRequest {
  name: string;
}

/** creator/adapter/in/web/dto/UpdateQuizRequest.java (assumed: name only, adjust to your DTO) */
export interface UpdateQuizRequest {
  name: string;
}

/** creator/adapter/in/web/dto/CategoryRequest.java (create + rename) */
export interface CategoryRequest {
  name: string;
}

/** creator/adapter/in/web/dto/QuestionRequest.java (create + full replace) */
export interface QuestionRequest {
  points: number;
  questionText: string;
  answerText: string;
  answerType: AnswerType;
  /** Required (http/https) for IMAGE and VIDEO; ignored by the backend for TEXT. */
  mediaUrl?: string | null;
  dailyDouble?: boolean;
}
