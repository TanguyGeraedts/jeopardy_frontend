/** Every colour a team can pick. Matches the lobby service's enum. */
export const TEAM_COLOURS = ["RED", "BLUE", "GREEN", "YELLOW", "PURPLE", "ORANGE", "PINK", "TEAL"] as const;
export type TeamColour = (typeof TEAM_COLOURS)[number];

export type LobbyMode = "TEAMS" | "SOLO";

/** Tells the lobby service how to show and launch our game. Sent with every lobby request. */
export interface GameInfo {
    gameName: string;
    gameBanner: string;
    backgroundColor: string;
    backgroundImage: string;
    gameLaunchUrl: string;
    handoffMethod: "REDIRECT";
    passLobbyData: boolean;
}

/** Request body for the lobby service when playing in teams. */
export interface TeamsLobbyRequest {
    gameInfo: GameInfo;
    lobbyMode: "BANNER";
    characterConfig: null;
    maxPlayers: number;
    minPlayers: number;
    teamCount: number;
    balancedTeams: boolean;
    allowLateJoin: boolean;
    ttlSeconds: number;
    teamColours: TeamColour[];
}

/** Request body for the lobby service when everyone plays for themselves. */
export interface SoloLobbyRequest {
    gameInfo: GameInfo;
    lobbyMode: "BANNER";
    characterConfig: null;
    maxPlayers: number;
    minPlayers: number;
    teamCount: null;
    balancedTeams: false;
    allowLateJoin: boolean;
    ttlSeconds: number;
    teamColours: never[];
}

export type LobbyRequest = TeamsLobbyRequest | SoloLobbyRequest;

/** What the setup form edits. Both drafts are kept so switching mode doesn't lose what was typed. */
export interface LobbyForm {
    mode: LobbyMode;
    teams: TeamsLobbyRequest;
    solo: SoloLobbyRequest;
}

/** Field name -> message. Empty object means valid. */
export type LobbyErrors = Partial<Record<keyof TeamsLobbyRequest, string>>;