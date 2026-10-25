/** creator/domain/model/AnswerType.java */
export const ANSWER_TYPES = ["TEXT", "IMAGE", "VIDEO", "AUDIO"] as const;
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

/** creator/domain/model/QuizTopic.java. Labels in lib/topics.ts. */
export const QUIZ_TOPICS = [
  "GENERAL_KNOWLEDGE", "MOVIES_TV", "MUSIC", "SPORTS", "SCIENCE_NATURE", "HISTORY", "GEOGRAPHY",
  "GAMES", "FOOD_DRINK", "ART_LITERATURE", "TECHNOLOGY", "POP_CULTURE", "LANGUAGE_WORDS", "KIDS_FAMILY",
] as const;
export type QuizTopic = (typeof QUIZ_TOPICS)[number];
export const MAX_QUIZ_TOPICS = 3;

/** The owner's view (answers included). */
export interface Quiz {
  id: string;
  name: string;
  categories: Category[];
  /** Findable in Discover and hostable by anyone signed in. */
  published: boolean;
  publishedAt: string | null;
  authorName: string | null;
  topics: QuizTopic[];
  /** Games hosted with it, by anyone. */
  timesPlayed: number;
  updatedAt: string;
}

/** creator/adapter/in/web/dto/DiscoverQuizResponse.java: what anyone may see before hosting. No questions. */
export interface DiscoverQuiz {
  id: string;
  name: string;
  authorName: string | null;
  topics: QuizTopic[];
  timesPlayed: number;
  publishedAt: string | null;
  published: boolean;
  /** You made it: you can edit it (and it may be private). */
  mine: boolean;
  questionCount: number;
  categories: { name: string; questionCount: number }[];
}

export type DiscoverSort = "POPULAR" | "NEWEST";

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
