/** gameplay/adapter/in/web/dto/CreateGameSessionRequest.java */
export type SessionMode = "SOLO" | "TEAM";

export interface CreateGameSessionRequest {
    quizId: string;
    mode: SessionMode;
    maxPlayers?: number;
    /** Required for TEAM (2-8), must be omitted for SOLO. */
    teamCount?: number;
    /** Taking turns (default off), and the turn team's head start in seconds (5-10, default 7). */
    turns?: boolean;
    headStartSeconds?: number;
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
    /** Answered the open clue wrongly. */
    lockedOut: boolean;
    /** Picked by the host, played on the board when the team buzzes. Null = automatic (see buzzerSoundFor). */
    buzzerSound: string | null;
    /** A buzz from this team would count right now. */
    canBuzz: boolean;
}

export interface SessionBuzz {
    playerId: string;
    teamId: string | null;
    /** Ms from the host opening the buzzers to the server receiving this buzz. Compare buzzes by the difference. */
    reactionMs: number;
    /** The team answered wrongly: shown crossed out, no longer in line. */
    lockedOut: boolean;
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
    /** Null in the public (live stream) view, except for the open clue. */
    question: string | null;
    revealed: boolean;
    dailyDouble: boolean;
    answer: string | null;
    /** Shown with the question. VIDEO = a YouTube link or a video file; AUDIO = sound only (a file). Null = text only. */
    mediaType: "IMAGE" | "VIDEO" | "AUDIO" | null;
    mediaUrl: string | null;
}

export interface GameSession {
    id: string;
    lobbyCode: string;
    state: SessionState;
    mode: SessionMode;
    /** The open clue, or null while the board shows. */
    activeClueId: string | null;
    /** The team that picks the next clue. */
    activeTeamId: string | null;
    /** Who is answering right now. Only set in ANSWER_EVALUATION. */
    answeringPlayerId: string | null;
    /** Buzzes on the open clue in arrival order (one per team), including locked-out ones. */
    buzzes: SessionBuzz[];
    /** Taking turns: each clue one team gets a head start to buzz, then anyone may steal. */
    turnsEnabled: boolean;
    headStartSeconds: number;
    /** Whose turn it is (gets the head start on the next clue). Null without turns. */
    turnTeamId: string | null;
    /** The team with the head start on the open clue. Null without turns or when no clue is open. */
    clueTurnTeamId: string | null;
    /** Ms (from when this was sent) until the buzzers open: 0 = open, null = not opened yet / no clue. */
    buzzersOpenInMs: number | null;
    /** Ms until anyone may steal (end of the head start): 0 = open to all, null = no head start. */
    stealOpensInMs: number | null;
    clues: SessionClue[];
    teams: SessionTeam[];
    players: SessionPlayer[];
}
