/** gameplay/adapter/in/web/dto/CreateGameSessionRequest.java */
export type SessionMode = "SOLO" | "TEAM";

export interface CreateGameSessionRequest {
    quizId: string;
    mode: SessionMode;
    maxPlayers?: number;
    /** Required for TEAM (2-8), must be omitted for SOLO. */
    teamCount?: number;
}

/** gameplay/adapter/in/web/dto/CreateGameSessionResponse.java */
export interface CreateGameSessionResponse {
    gameSessionId: string;
}

export type SessionState = "LOBBY" | "BOARD_SELECTION" | "CLUE_READING" | "BUZZER_OPEN" | "ANSWER_EVALUATION" | "GAME_OVER";

/** gameplay/adapter/in/web/dto/GameSessionResponse.java */
export interface SessionTeam {
    id: string;
    name: string;
    externalTeamId: string | null;
    colour: string | null;
    score: number;
    memberIds: string[];
}

export interface SessionPlayer {
    id: string;
    name: string;
    teamId: string | null;
}

export interface SessionClue {
    id: string;
    category: string;
    value: number;
    question: string;
    revealed: boolean;
    dailyDouble: boolean;
    answer: string | null;
}

export interface GameSession {
    id: string;
    lobbyCode: string;
    state: SessionState;
    mode: SessionMode;
    clues: SessionClue[];
    teams: SessionTeam[];
    players: SessionPlayer[];
}
