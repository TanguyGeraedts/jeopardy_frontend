import { TEAM_COLOURS } from "@/types";
import type { GameInfo, GameTeam, LobbyErrors, LobbyForm, LobbyRequest, SoloLobbyRequest, TeamColour, TeamsLobbyRequest } from "@/types";

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 16;
export const TEAM_COUNT_MIN = 2;
export const TEAM_COUNT_MAX = TEAM_COLOURS.length; // 8

/** How long a lobby lives before it expires: 15 minutes. */
const DEFAULT_TTL_SECONDS = 900;

/** How the lobby presents and launches Jeopardy. TODO: swap the example.com placeholders for the real assets and launch URL. */
export const JEOPARDY_GAME_INFO: GameInfo = {
    gameName: "Jeopardy!",
    gameBanner: "https://example.com/jeopardy-banner.png",
    backgroundColor: "#060CE9",
    backgroundImage: "https://example.com/jeopardy-background.png",
    gameLaunchUrl: "https://play.mygame.com/jeopardy",
    handoffMethod: "REDIRECT",
    passLobbyData: true,
};

export const DEFAULT_TEAMS: TeamsLobbyRequest = {
    gameInfo: JEOPARDY_GAME_INFO,
    lobbyMode: "BANNER",
    characterConfig: null,
    maxPlayers: 8,
    minPlayers: 2,
    teamCount: 2,
    balancedTeams: true,
    allowLateJoin: false,
    ttlSeconds: DEFAULT_TTL_SECONDS,
    teamColours: ["RED", "BLUE"],
};

export const DEFAULT_SOLO: SoloLobbyRequest = {
    gameInfo: JEOPARDY_GAME_INFO,
    lobbyMode: "BANNER",
    characterConfig: null,
    maxPlayers: 3,
    minPlayers: 1,
    teamCount: null,
    balancedTeams: false,
    allowLateJoin: false,
    ttlSeconds: DEFAULT_TTL_SECONDS,
    teamColours: [],
};

/** Solo's minimum is fixed (the slider's minimum handle is locked). */
export const SOLO_FIXED_MIN = DEFAULT_SOLO.minPlayers;

export const defaultLobbyForm = (): LobbyForm => ({ mode: "TEAMS", teams: { ...DEFAULT_TEAMS, teamColours: [...DEFAULT_TEAMS.teamColours] }, solo: { ...DEFAULT_SOLO } });

/** The exact body to send to the lobby service for the selected mode. */
export const toLobbyRequest = (form: LobbyForm): LobbyRequest => (form.mode === "TEAMS" ? form.teams : form.solo);

/**
 * Changes the team count. Keeps the colour list the same length (drops from the end, or adds unused colours)
 * and raises the player cap if there wouldn't be one seat per team.
 */
export function withTeamCount(config: TeamsLobbyRequest, teamCount: number): TeamsLobbyRequest {
    const count = Math.max(0, Math.min(teamCount, TEAM_COUNT_MAX));
    const kept = config.teamColours.slice(0, count);
    const spare = TEAM_COLOURS.filter((c) => !kept.includes(c));
    return { ...config, teamCount: count, maxPlayers: Math.max(config.maxPlayers, count), teamColours: [...kept, ...spare].slice(0, count) };
}

/** Sets one team's colour. If another team already has it, the two swap so colours stay unique. */
export function withTeamColour(config: TeamsLobbyRequest, index: number, colour: TeamColour): TeamsLobbyRequest {
    const colours = [...config.teamColours];
    const other = colours.indexOf(colour);
    if (other !== -1) colours[other] = colours[index];
    colours[index] = colour;
    return { ...config, teamColours: colours };
}

/** Validates the draft for the selected mode. The sliders keep most of this true already; this is the safety net. */
export function validateLobby(form: LobbyForm): LobbyErrors {
    const config = form.mode === "TEAMS" ? form.teams : form.solo;
    const errors: LobbyErrors = {};
    const whole = (n: number) => Number.isInteger(n);

    if (!whole(config.minPlayers) || config.minPlayers < MIN_PLAYERS) errors.minPlayers = `At least ${MIN_PLAYERS} player`;
    else if (form.mode === "SOLO" && config.minPlayers !== SOLO_FIXED_MIN) errors.minPlayers = `Solo needs exactly ${SOLO_FIXED_MIN} as the minimum`;

    if (!whole(config.maxPlayers) || config.maxPlayers > MAX_PLAYERS) errors.maxPlayers = `At most ${MAX_PLAYERS} players`;
    else if (!errors.minPlayers && config.minPlayers > config.maxPlayers) errors.maxPlayers = "Can't be less than the minimum";

    if (form.mode === "TEAMS") {
        const { teamCount, teamColours, maxPlayers } = form.teams;
        if (!whole(teamCount) || teamCount < TEAM_COUNT_MIN || teamCount > TEAM_COUNT_MAX) {
            errors.teamCount = `Between ${TEAM_COUNT_MIN} and ${TEAM_COUNT_MAX} teams`;
        } else {
            if (new Set(teamColours).size !== teamColours.length || teamColours.length !== teamCount) errors.teamColours = "Every team needs its own colour";
            if (!errors.maxPlayers && maxPlayers < teamCount) errors.maxPlayers = "Every team needs at least one player";
        }
    }
    return errors;
}

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/**
 * Stand-in teams built from the config, so the admin screen has something to show before the lobby is wired up.
 * Teams mode: `minPlayers` fake players dealt round-robin into the coloured teams. Solo: one team per player.
 */
export function previewTeams(config: LobbyRequest): GameTeam[] {
    if (config.teamCount === null) {
        return Array.from({ length: config.minPlayers }, (_, i) => ({ id: `solo-${i + 1}`, name: `Player ${i + 1}`, players: [{ id: `solo-${i + 1}-p`, name: `Player ${i + 1}` }] }));
    }
    const teams: GameTeam[] = config.teamColours.map((colour) => ({ id: `team-${colour.toLowerCase()}`, name: `${titleCase(colour)} team`, players: [] }));
    for (let i = 0; i < config.minPlayers; i++) {
        const team = teams[i % teams.length];
        team.players.push({ id: `${team.id}-p${team.players.length + 1}`, name: `Player ${i + 1}` });
    }
    return teams;
}

export const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return "—";
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return [h && `${h} h`, m && `${m} min`].filter(Boolean).join(" ") || `${seconds} s`;
};