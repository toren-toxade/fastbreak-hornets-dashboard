export const RADAR_MAX = {
  points: 30,
  rebounds: 15,
  assists: 12,
  minutes: 40,
  steals: 3,
} as const;

// Ball Don't Lie known team IDs (reduce API calls)
export const TEAM_IDS = {
  CHA: 4,
} as const;

export const PLAN_LIMIT_NOTICE = 'This feature requires access to the stats endpoint. Falling back to Season totals.';
