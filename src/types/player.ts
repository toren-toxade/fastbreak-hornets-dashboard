export interface Player {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height?: string;
  weight?: string;
  jersey_number?: string;
  college?: string;
}

export interface PlayerStats {
  playerId: number;
  player: Player;
  season: number;
  gamesPlayed: number;
  pointsPerGame: number;
  rebounds: number;
  assists: number;
  fieldGoalPercentage: number;
  threePointPercentage: number;
  freeThrowPercentage: number;
  minutesPlayed: number;
  steals: number;
  blocks: number;
  turnovers: number;
}

export interface TeamRoster {
  players: Player[];
}

export interface DashboardData {
  players: PlayerStats[];
  lastUpdated: string;
}