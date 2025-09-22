#!/usr/bin/env node
// Ingest NBA Stats season averages directly to Supabase (bypasses Next.js route)
// Usage: node scripts/ingest-nba-stats.mjs [season] [teamAbbr]

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

// 1) Load env
const envPath = resolve(process.cwd(), '.env.local');
try {
  const dotenv = await import('dotenv').catch(() => null);
  if (dotenv && typeof dotenv.config === 'function') {
    dotenv.config({ path: envPath, override: false });
  }
} catch {}

if (existsSync(envPath)) {
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let [, k, v] = m;
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith('\'') && v.endsWith('\''))) v = v.slice(1, -1);
    if (process.env[k] == null) process.env[k] = v;
  }
}

const season = Number(process.argv[2] || '2024');
const TEAM_ABBR = (process.argv[3] || 'CHA').toUpperCase();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
  console.error('Missing Supabase configuration (SUPABASE_URL and SUPABASE_SERVICE_ROLE[_KEY])');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, { auth: { persistSession: false } });

// 2) NBA Stats helpers
const NBA_STATS_BASE = 'https://stats.nba.com/stats';
const TEAM_ABBR_TO_ID = {
  CHA: 1610612766,
};

function seasonParamFromYear(startYear) {
  const endYY = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endYY}`;
}

function buildHeaders() {
  const UA = process.env.NBA_STATS_USER_AGENT ||
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';
  const REFERER = process.env.NBA_STATS_REFERER || 'https://www.nba.com/stats';
  const ORIGIN = process.env.NBA_STATS_ORIGIN || 'https://www.nba.com';
  return {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Origin': ORIGIN,
    'Referer': REFERER,
    'User-Agent': UA,
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Dest': 'empty',
    'sec-ch-ua': '"Chromium";v="127", "Not A(Brand";v="24", "Google Chrome";v="127"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true',
  };
}

function qs(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.append(k, String(v));
  }
  return sp.toString();
}

async function statsFetch(endpoint, params, attempts = 3) {
  const url = `${NBA_STATS_BASE}/${endpoint}?${qs(params)}`;
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: buildHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr || new Error('fetch failed');
}

function resultSetToObjects(json, preferredName) {
  const rs = (Array.isArray(json?.resultSets)
    ? (preferredName ? json.resultSets.find(r => r?.name === preferredName) : json.resultSets[0])
    : json?.resultSet);
  if (!rs) return [];
  const headers = rs.headers || rs?.rowSet?.headers || [];
  const rows = rs.rowSet || rs?.rows || [];
  return rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

async function fetchTeamSeasonAverages(teamAbbr, seasonStartYear) {
  const teamId = TEAM_ABBR_TO_ID[teamAbbr];
  if (!teamId) throw new Error(`Unknown team abbr: ${teamAbbr}`);
  const Season = seasonParamFromYear(seasonStartYear);
  const json = await statsFetch('leaguedashplayerstats', {
    College: '',
    Conference: '',
    Country: '',
    DateFrom: '',
    DateTo: '',
    Division: '',
    DraftPick: '',
    DraftYear: '',
    GameScope: '',
    GameSegment: '',
    Height: '',
    LastNGames: 0,
    LeagueID: '00',
    Location: '',
    MeasureType: 'Base',
    Month: 0,
    OpponentTeamID: 0,
    Outcome: '',
    PaceAdjust: 'N',
    PerMode: 'PerGame',
    Period: 0,
    PlayerExperience: '',
    PlayerPosition: '',
    PlusMinus: 'N',
    PORound: 0,
    Rank: 'N',
    Season,
    SeasonSegment: '',
    SeasonType: 'Regular Season',
    ShotClockRange: '',
    StarterBench: '',
    TeamID: teamId,
    TwoWay: 0,
    VsConference: '',
    VsDivision: '',
    Weight: ''
  });
  const rows = resultSetToObjects(json, 'LeagueDashPlayerStats');
  return rows.map(r => ({
    playerId: Number(r.PLAYER_ID),
    first_name: String(r.PLAYER_NAME || '').split(' ')[0] || '',
    last_name: String(r.PLAYER_NAME || '').split(' ').slice(1).join(' ') || '',
    gamesPlayed: Number(r.GP ?? 0),
    pointsPerGame: Number(r.PTS ?? 0),
    rebounds: Number(r.REB ?? 0),
    assists: Number(r.AST ?? 0),
    fg_pct: Number(r.FG_PCT ?? 0),
    three_pt_pct: Number(r.FG3_PCT ?? 0),
    ft_pct: Number(r.FT_PCT ?? 0),
    minutes_per_game: Number(r.MIN ?? 0),
    steals: Number(r.STL ?? 0),
    blocks: Number(r.BLK ?? 0),
    turnovers: Number(r.TOV ?? 0),
  }));
}

async function fetchTeamRecentGames(teamAbbr, seasonStartYear) {
  const teamId = TEAM_ABBR_TO_ID[teamAbbr];
  if (!teamId) throw new Error(`Unknown team abbr: ${teamAbbr}`);
  const Season = seasonParamFromYear(seasonStartYear);
  const json = await statsFetch('teamgamelogs', {
    TeamID: teamId,
    Season,
    SeasonType: 'Regular Season',
  });
  const rows = resultSetToObjects(json, 'TeamGameLogs');
  const games = rows.map(r => {
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
      game_date: String(r.GAME_DATE),
      opponent,
      is_home: isHome,
      us,
      them,
      result,
      diff,
    };
  });
  // Sort desc and take last 10
  games.sort((a, b) => new Date(b.game_date).getTime() - new Date(a.game_date).getTime());
  return games.slice(0, 10);
}

async function fetchTeamLast10Players(teamAbbr, seasonStartYear) {
  const teamId = TEAM_ABBR_TO_ID[teamAbbr];
  if (!teamId) throw new Error(`Unknown team abbr: ${teamAbbr}`);
  const Season = seasonParamFromYear(seasonStartYear);
  const json = await statsFetch('leaguedashplayerstats', {
    College: '', Conference: '', Country: '', DateFrom: '', DateTo: '', Division: '', DraftPick: '', DraftYear: '',
    GameScope: '', GameSegment: '', Height: '', LastNGames: 10, LeagueID: '00', Location: '', MeasureType: 'Base',
    Month: 0, OpponentTeamID: 0, Outcome: '', PaceAdjust: 'N', PerMode: 'PerGame', Period: 0, PlayerExperience: '',
    PlayerPosition: '', PlusMinus: 'N', PORound: 0, Rank: 'N', Season, SeasonSegment: '', SeasonType: 'Regular Season',
    ShotClockRange: '', StarterBench: '', TeamID: teamId, TwoWay: 0, VsConference: '', VsDivision: '', Weight: ''
  });
  const rows = resultSetToObjects(json, 'LeagueDashPlayerStats');
  return rows.map(r => ({
    playerId: Number(r.PLAYER_ID),
    first_name: String(r.PLAYER_NAME || '').split(' ')[0] || '',
    last_name: String(r.PLAYER_NAME || '').split(' ').slice(1).join(' ') || '',
    games: Number(r.GP ?? 10) || 10,
    pointsPerGame: Number(r.PTS ?? 0),
    rebounds: Number(r.REB ?? 0),
    assists: Number(r.AST ?? 0),
    fg_pct: Number(r.FG_PCT ?? 0),
    three_pt_pct: Number(r.FG3_PCT ?? 0),
    ft_pct: Number(r.FT_PCT ?? 0),
    minutes_per_game: Number(r.MIN ?? 0),
    steals: Number(r.STL ?? 0),
    blocks: Number(r.BLK ?? 0),
    turnovers: Number(r.TOV ?? 0),
  }));
}

async function fetchGameBoxscoreForTeam(teamAbbr, gameId) {
  const url = `${NBA_STATS_BASE}/boxscoretraditionalv2?${qs({ GameID: String(gameId).padStart(10,'0') })}`;
  const json = await (async () => {
    let lastErr;
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetch(url, { headers: buildHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
      } catch (e) {
        lastErr = e;
        await new Promise(r => setTimeout(r, 400 * (i + 1)));
      }
    }
    throw lastErr || new Error('fetch failed');
  })();
  const rows = resultSetToObjects(json, 'PlayerStats');
  return rows
    .filter(r => String(r.TEAM_ABBREVIATION || '') === teamAbbr)
    .map(r => ({
      playerId: Number(r.PLAYER_ID),
      minutes: String(r.MIN || '0:00'),
      pts: Number(r.PTS ?? 0), reb: Number(r.REB ?? 0), ast: Number(r.AST ?? 0), stl: Number(r.STL ?? 0), blk: Number(r.BLK ?? 0), tov: Number((r.TO ?? r.TOV) ?? 0),
      fgm: Number(r.FGM ?? 0), fga: Number(r.FGA ?? 0), fg3m: Number(r.FG3M ?? 0), fg3a: Number(r.FG3A ?? 0), ftm: Number(r.FTM ?? 0), fta: Number(r.FTA ?? 0),
    }));
}

// 3) Ingest
const main = async () => {
  const { data: runRow, error: runErr } = await supabase
    .from('ingestion_runs')
    .insert({ source: 'nba-stats-cli', season, status: 'running' })
    .select()
    .single();
  if (runErr) throw runErr;
  const runId = runRow.id;

  try {
    // A) Season averages
    const players = await fetchTeamSeasonAverages(TEAM_ABBR, season);

    const upsertPlayers = players.map(p => ({
      id: p.playerId,
      first_name: p.first_name,
      last_name: p.last_name,
      position: null,
      team_abbr: TEAM_ABBR,
      height: null,
      weight: null,
      jersey_number: null,
    }));

    const { error: upPlayersErr } = await supabase.from('players').upsert(upsertPlayers);
    if (upPlayersErr) throw upPlayersErr;

    const statsRows = players.map(p => ({
      player_id: p.playerId,
      season,
      games_played: p.gamesPlayed,
      points_per_game: p.pointsPerGame,
      rebounds: p.rebounds,
      assists: p.assists,
      fg_pct: p.fg_pct,
      three_pt_pct: p.three_pt_pct,
      ft_pct: p.ft_pct,
      minutes_per_game: p.minutes_per_game,
      steals: p.steals,
      blocks: p.blocks,
      turnovers: p.turnovers,
    }));

    const { error: upStatsErr } = await supabase
      .from('player_season_stats')
      .upsert(statsRows, { onConflict: 'player_id,season' });
    if (upStatsErr) throw upStatsErr;

    // B) Recent games (last 10)
    const recentGames = await fetchTeamRecentGames(TEAM_ABBR, season);
    const recentRows = recentGames.map(g => ({
      id: g.id,
      team_abbr: TEAM_ABBR,
      season,
      game_date: g.game_date,
      opponent: g.opponent,
      is_home: g.is_home,
      us: g.us,
      them: g.them,
      result: g.result,
      diff: g.diff,
    }));
    if (recentRows.length) {
      const { error: upRecErr } = await supabase
        .from('team_recent_games')
        .upsert(recentRows);
      if (upRecErr) throw upRecErr;
    }

    // C) Last-10 per-player
    const last10 = await fetchTeamLast10Players(TEAM_ABBR, season);
    const last10Rows = last10.map(p => ({
      player_id: p.playerId,
      season,
      games: p.games,
      points_per_game: p.pointsPerGame,
      rebounds: p.rebounds,
      assists: p.assists,
      fg_pct: p.fg_pct,
      three_pt_pct: p.three_pt_pct,
      ft_pct: p.ft_pct,
      minutes_per_game: p.minutes_per_game,
      steals: p.steals,
      blocks: p.blocks,
      turnovers: p.turnovers,
    }));
    if (last10Rows.length) {
      const { error: upL10Err } = await supabase
        .from('player_last10_stats')
        .upsert(last10Rows, { onConflict: 'player_id,season' });
      if (upL10Err) throw upL10Err;
    }

    // D) Per-game player stats for the same recent games
    for (const g of recentGames) {
      const box = await fetchGameBoxscoreForTeam(TEAM_ABBR, g.id);
      const rows = box.map(b => ({
        game_id: g.id,
        player_id: b.playerId,
        season,
        minutes: (function() { const [m,s] = String(b.minutes||'0:00').split(':'); return Number((parseInt(m||'0',10) + (parseInt(s||'0',10)/60)).toFixed(1)); })(),
        points: b.pts,
        rebounds: b.reb,
        assists: b.ast,
        steals: b.stl,
        blocks: b.blk,
        turnovers: b.tov,
        fgm: b.fgm,
        fga: b.fga,
        fg3m: b.fg3m,
        fg3a: b.fg3a,
        ftm: b.ftm,
        fta: b.fta,
      }));
      if (rows.length) {
        const { error: upGPErr } = await supabase
          .from('game_player_stats')
          .upsert(rows, { onConflict: 'game_id,player_id' });
        if (upGPErr) throw upGPErr;
      }
    }

    await supabase
      .from('ingestion_runs')
      .update({ status: 'success', finished_at: new Date().toISOString() })
      .eq('id', runId);

    console.log(JSON.stringify({ ok: true, source: 'nba-stats-cli', season,
      players: players.length, statsInserted: statsRows.length,
      recentGames: recentRows.length, last10Players: last10Rows.length }));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase
      .from('ingestion_runs')
      .update({ status: 'error', error: msg, finished_at: new Date().toISOString() })
      .eq('id', runRow.id);
    console.error(JSON.stringify({ ok: false, error: msg }));
    process.exit(1);
  }
};

await main();
