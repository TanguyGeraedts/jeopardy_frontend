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

export const GameplayPaths = {
  /** POST = create a game session (the backend also creates the lobby and returns its code via GET). */
  sessions: `${API_V1}/game-sessions`,
  /** GET = read the session (lobby code, state, teams, players, board). */
  sessionById: (sessionId: string) => `${API_V1}/game-sessions/${enc(sessionId)}`,
  /** POST = hand over the lobby's signed handoff token (public: the token is the credential). */
  handoff: (sessionId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/handoff`,
  /** GET = Server-Sent Events, a "session" event (public view, no answers) on every change. Public. */
  events: (sessionId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/events`,
  /** POST = buzz. Public: the X-Player-Token header says who. */
  buzz: (sessionId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/buzz`,

  // Host (session owner) controls
  selectClue: (sessionId: string, clueId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/clues/${enc(clueId)}/select`,
  openBuzzers: (sessionId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/buzzers/open`,
  /** POST { correct } */
  judge: (sessionId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/judge`,
  closeClue: (sessionId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/clue/close`,
  /** POST { delta } or { score } */
  teamScore: (sessionId: string, teamId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/teams/${enc(teamId)}/score`,
  /** PUT { sound } (null = automatic) */
  teamBuzzerSound: (sessionId: string, teamId: string) => `${API_V1}/game-sessions/${enc(sessionId)}/teams/${enc(teamId)}/buzzer-sound`,
} as const;
