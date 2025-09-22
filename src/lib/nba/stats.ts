/*
  NBA Stats fetch helpers for Next.js server routes.
  - Uses headers that stats.nba.com expects
  - Provides convenience functions to fetch team player stats and recent games
*/
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { PlayerStats } from '@/types/player';
import type { RecentGame } from '@/types/game';

const NBA_STATS_BASE = 'https://stats.nba.com/stats';

// Minimal map for our use case; expand as needed
const TEAM_ABBR_TO_ID: Record<string, number> = {
  CHA: 1610612766, // Charlotte Hornets
};

function seasonParamFromYear(startYear: number): string {
  const endYY = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endYY}`;
}

function buildHeaders(): Record<string, string> {
  // These headers are commonly sufficient for NBA Stats. You can override via env if needed.
  const UA = process.env.NBA_STATS_USER_AGENT ||
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';
  const REFERER = process.env.NBA_STATS_REFERER || 'https://www.nba.com/';
  const ORIGIN = process.env.NBA_STATS_ORIGIN || 'https://www.nba.com';
  return {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': ORIGIN,
    'Referer': REFERER,
    'User-Agent': UA,
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true',
  };
}

function qs(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.append(k, String(v));
  }
  return sp.toString();
}

async function statsFetch(endpoint: string, params: Record<string, string | number | undefined>) {
  const url = `${NBA_STATS_BASE}/${endpoint}?${qs(params)}`;
  const res = await fetch(url, { headers: buildHeaders(), cache: 'no-store' });
  if (!res.ok) {
    const msg = `NBA Stats error ${res.status} for ${endpoint}`;
    throw new Error(msg);
  }
  return res.json();
}

function resultSetToObjects(json: any, preferredName?: string): any[] {
  const rs = (Array.isArray(json?.resultSets)
    ? (preferredName ? json.resultSets.find((r: any) => r?.name === preferredName) : json.resultSets[0])
    : json?.resultSet) as any;
  if (!rs) return [];
  const headers: string[] = rs.headers ?? rs?.rowSet?.headers ?? [];
  const rows: any[][] = rs.rowSet ?? rs?.rows ?? [];
  if (!Array.isArray(headers) || !Array.isArray(rows)) return [];
  return rows.map((row) => {
    const obj: Record<string, any> = {};
    headers.forEach((h: string, i: number) => { obj[h] = row[i]; });
    return obj;
  });
}

function splitName(full: string) {
  const parts = String(full || '').split(' ');
  const first = parts.shift() || '';
  const last = parts.join(' ') || '';
  return { first, last };
}

export async function fetchTeamSeasonAverages(teamAbbr: string, seasonStartYear: number): Promise<PlayerStats[]> {
  const teamId = TEAM_ABBR_TO_ID[teamAbbr as keyof typeof TEAM_ABBR_TO_ID];
  if (!teamId) throw new Error(`Unknown team abbr: ${teamAbbr}`);
  const Season = seasonParamFromYear(seasonStartYear);

  const json = await statsFetch('leaguedashplayerstats', {
    Season,
    TeamID: teamId,
    SeasonType: 'Regular Season',
    MeasureType: 'Base',
    PerMode: 'PerGame',
  });
  const rows = resultSetToObjects(json, 'LeagueDashPlayerStats');

  const players: PlayerStats[] = rows.map((r: any) => {
    const { first, last } = splitName(r.PLAYER_NAME);
    const gp = Number(r.GP ?? 0);
    return {
      playerId: Number(r.PLAYER_ID),
      player: {
        id: Number(r.PLAYER_ID),
        first_name: first,
        last_name: last,
        position: '',
        jersey_number: undefined,
        height: undefined,
        weight: undefined,
        college: undefined,
      },
      season: seasonStartYear,
      gamesPlayed: gp,
      pointsPerGame: Number(r.PTS ?? 0),
      rebounds: Number(r.REB ?? 0),
      assists: Number(r.AST ?? 0),
      fieldGoalPercentage: Number(r.FG_PCT ?? 0),
      threePointPercentage: Number(r.FG3_PCT ?? 0),
      freeThrowPercentage: Number(r.FT_PCT ?? 0),
      minutesPlayed: Number(r.MIN ?? 0),
      steals: Number(r.STL ?? 0),
      blocks: Number(r.BLK ?? 0),
      turnovers: Number(r.TOV ?? 0),
    } as PlayerStats;
  });

  return players;
}

export async function fetchTeamLast10Averages(teamAbbr: string, seasonStartYear: number): Promise<PlayerStats[]> {
  const teamId = TEAM_ABBR_TO_ID[teamAbbr as keyof typeof TEAM_ABBR_TO_ID];
  if (!teamId) throw new Error(`Unknown team abbr: ${teamAbbr}`);
  const Season = seasonParamFromYear(seasonStartYear);

  const json = await statsFetch('leaguedashplayerstats', {
    Season,
    TeamID: teamId,
    SeasonType: 'Regular Season',
    MeasureType: 'Base',
    PerMode: 'PerGame',
    LastNGames: 10,
  });
  const rows = resultSetToObjects(json, 'LeagueDashPlayerStats');

  const players: PlayerStats[] = rows.map((r: any) => {
    const { first, last } = splitName(r.PLAYER_NAME);
    const gp = Number(r.GP ?? 0) || 10; // Last 10 window; fallback if missing
    return {
      playerId: Number(r.PLAYER_ID),
      player: {
        id: Number(r.PLAYER_ID),
        first_name: first,
        last_name: last,
        position: '',
        jersey_number: undefined,
        height: undefined,
        weight: undefined,
        college: undefined,
      },
      season: seasonStartYear,
      gamesPlayed: gp,
      pointsPerGame: Number(r.PTS ?? 0),
      rebounds: Number(r.REB ?? 0),
      assists: Number(r.AST ?? 0),
      fieldGoalPercentage: Number(r.FG_PCT ?? 0),
      threePointPercentage: Number(r.FG3_PCT ?? 0),
      freeThrowPercentage: Number(r.FT_PCT ?? 0),
      minutesPlayed: Number(r.MIN ?? 0),
      steals: Number(r.STL ?? 0),
      blocks: Number(r.BLK ?? 0),
      turnovers: Number(r.TOV ?? 0),
    } as PlayerStats;
  });

  return players;
}

export async function fetchTeamRecentGames(teamAbbr: string, seasonStartYear: number): Promise<RecentGame[]> {
  const teamId = TEAM_ABBR_TO_ID[teamAbbr as keyof typeof TEAM_ABBR_TO_ID];
  if (!teamId) throw new Error(`Unknown team abbr: ${teamAbbr}`);
  const Season = seasonParamFromYear(seasonStartYear);

  // teamgamelogs returns PLUS_MINUS; compute opponent points from PTS - PLUS_MINUS
  const json = await statsFetch('teamgamelogs', {
    TeamID: teamId,
    Season,
    SeasonType: 'Regular Season',
  });
  const rows = resultSetToObjects(json, 'TeamGameLogs');

  const games = rows.map((r: any) => {
    const matchup = String(r.MATCHUP || '');
    const isHome = matchup.includes(' vs ');
    const opponent = (matchup.split(' vs ')[1] || matchup.split(' @ ')[1] || '').trim();
    const us = Number(r.PTS ?? 0);
    const plusMinus = Number(r.PLUS_MINUS ?? 0);
    const them = us - plusMinus;
    const diff = us - them;
    const result = diff >= 0 ? 'W' : 'L';
    return {
      id: Number(r.GAME_ID),
      date: String(r.GAME_DATE),
      opponent,
      isHome,
      us,
      them,
      result,
      diff,
    } as RecentGame;
  });

  games.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return games.slice(0, 10);
}

function parseMinutesToNumber(min: string | number | null | undefined): number {
  if (typeof min === 'number') return min;
  if (!min) return 0;
  const parts = String(min).split(':');
  const m = parseInt(parts[0] || '0', 10);
  const s = parseInt(parts[1] || '0', 10);
  return Number((m + s / 60).toFixed(1));
}

function formatGameId(gameId: string | number): string {
  const s = String(gameId).trim();
  // Ensure 10-digit GameID (e.g., 0022400001)
  return s.padStart(10, '0');
}

export async function fetchGamePlayerStatsForTeam(gameId: string | number, teamAbbr: string): Promise<PlayerStats[]> {
  const json = await statsFetch('boxscoretraditionalv2', {
    GameID: formatGameId(gameId),
  });
  const rows = resultSetToObjects(json, 'PlayerStats');
  const filtered = rows.filter((r: any) => String(r.TEAM_ABBREVIATION || '') === teamAbbr);

  const players: PlayerStats[] = filtered.map((r: any) => {
    const name = String(r.PLAYER_NAME || '');
    const [first, ...rest] = name.split(' ');
    const last = rest.join(' ');
    const fga = Number(r.FGA ?? 0), fgm = Number(r.FGM ?? 0), fg3a = Number(r.FG3A ?? 0), fg3m = Number(r.FG3M ?? 0), fta = Number(r.FTA ?? 0), ftm = Number(r.FTM ?? 0);
    const fg_pct = fga > 0 ? fgm / fga : 0;
    const fg3_pct = fg3a > 0 ? fg3m / fg3a : 0;
    const ft_pct = fta > 0 ? ftm / fta : 0;
    return {
      playerId: Number(r.PLAYER_ID),
      player: {
        id: Number(r.PLAYER_ID),
        first_name: first,
        last_name: last,
        position: '',
        jersey_number: undefined,
        height: undefined,
        weight: undefined,
        college: undefined,
      },
      season: 0,
      gamesPlayed: 1,
      pointsPerGame: Number(r.PTS ?? 0),
      rebounds: Number(r.REB ?? 0),
      assists: Number(r.AST ?? 0),
      fieldGoalPercentage: fg_pct,
      threePointPercentage: fg3_pct,
      freeThrowPercentage: ft_pct,
      minutesPlayed: parseMinutesToNumber(r.MIN),
      steals: Number(r.STL ?? 0),
      blocks: Number(r.BLK ?? 0),
      turnovers: Number((r.TO ?? r.TOV) ?? 0),
    } as PlayerStats;
  });

  return players;
}
