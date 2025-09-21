export type RecentGame = {
  id: number;
  date: string; // ISO
  opponent: string; // e.g., BOS
  isHome: boolean;
  us: number;
  them: number;
  result: 'W' | 'L';
  diff: number;
};

export type RecentGamesResponse = {
  team: string;
  games: RecentGame[];
  summary: {
    record: string;
    avgFor: number;
    avgAgainst: number;
    avgDiff: number;
  };
  lastUpdated: string;
};
