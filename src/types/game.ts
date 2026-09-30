/** A person taking part. Map the lobby service's player to this (id + display name). */
export interface GamePlayer {
  id: string;
  name: string;
}

/** A team of 1 to MAX_TEAM_SIZE players. A "solo" player is just a team of one. Teams are what score. */
export interface GameTeam {
  id: string;
  name: string;
  players: GamePlayer[];
}

export const MAX_TEAM_SIZE = 4;

/** Someone hit their buzzer. `at` is a ms timestamp: pass the server's when the lobby sends one. */
export interface Buzz {
  playerId: string;
  teamId: string;
  at: number;
}
