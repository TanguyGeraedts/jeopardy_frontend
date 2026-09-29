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
