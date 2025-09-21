import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

const BDL_BASE = process.env.NBA_API_BASE_URL || 'https://api.balldontlie.io/v1';
const TEAM_ABBR = 'CHA';
const DEFAULT_SEASON = 2024;

const NBA_API_KEY = (process.env.NBA_API_KEY || '').trim();
const NBA_API_TIER = (process.env.NBA_API_TIER || 'free').toLowerCase(); // 'free' | 'pro' | etc.

type BDLTeam = { abbreviation: string };
type BDLPlayer = { id: number; first_name: string; last_name: string; position: string | null; team: BDLTeam };
type BDLPlayerResponse = { data: BDLPlayer[]; meta?: { next_page?: number; total_pages?: number } };

type BDLTeamRow = { id: number; abbreviation: string };
type BDLTeamsResponse = { data: BDLTeamRow[]; meta?: { next_page?: number; total_pages?: number } };

type BDLGame = {
  id: number;
  date: string;
  season: number;
  postseason: boolean;
  home_team: BDLTeam;
  visitor_team: BDLTeam;
};

type BDLSeasonAverage = {
  player_id: number;
  games_played: number;
  season: number;
  min: string | null;
  pts: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  fg_pct: number;
  fg3_pct: number;
  ft_pct: number;
};
type BDLSeasonAveragesResponse = { data: BDLSeasonAverage[] };

function buildHeaders() {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (NBA_API_KEY) headers['Authorization'] = `Bearer ${NBA_API_KEY}`;
  return headers;
}

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

class UpstreamError extends Error {
  code: number;
  retryAfter?: string | null;
  constructor(code: number, message: string, retryAfter?: string | null) {
    super(message);
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

async function fetchJson(url: string, attempts = 3) {
  let lastErr: unknown = null;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, { headers: buildHeaders() });
    if (res.status === 429) {
      const ra = res.headers.get('retry-after');
      const wait = ra ? Number(ra) * 1000 : 1000 * (i + 1);
      await sleep(wait);
      lastErr = new UpstreamError(429, `Rate limited for ${url}`, ra);
      continue;
    }
    if (res.status === 401) {
      throw new UpstreamError(401, `Unauthorized for ${url}`);
    }
    if (!res.ok) {
      throw new UpstreamError(res.status, `Upstream error ${res.status} for ${url}`);
    }
    return res.json();
  }
  throw (lastErr instanceof Error ? lastErr : new Error(String(lastErr || 'Fetch failed')));
}

import { TEAM_IDS } from '@/lib/constants';

async function getTeamIdByAbbr(abbr: string): Promise<number | null> {
  // Known mapping (reduces one API call)
  if (TEAM_IDS[abbr as keyof typeof TEAM_IDS]) return TEAM_IDS[abbr as keyof typeof TEAM_IDS];

  let page = 1;
  const perPage = 100;
  for (let i = 0; i < 5; i++) {
    const url = `${BDL_BASE}/teams?per_page=${perPage}&page=${page}`;
    const data = (await fetchJson(url)) as BDLTeamsResponse;
    const team = (data.data || []).find((t) => t.abbreviation === abbr);
    if (team) return team.id;
    const nextPage = data.meta?.next_page;
    const totalPages = data.meta?.total_pages;
    if (nextPage && nextPage !== page) { page = nextPage; continue; }
    if (totalPages && page < totalPages) { page = page + 1; continue; }
    break;
  }
  return null;
}

async function fetchAllPlayersForTeam(teamAbbr: string) {
  const perPage = 100;
  let page = 1;
  const players: BDLPlayer[] = [];
  let safety = 0;

  // Try to narrow by team_id to minimize pages and avoid rate limits
  const teamId = await getTeamIdByAbbr(teamAbbr);

  for (;;) {
    safety++;
    if (safety > 50) break; // prevent infinite loop
    const base = teamId
      ? `${BDL_BASE}/players?per_page=${perPage}&page=${page}&team_ids[]=${teamId}`
      : `${BDL_BASE}/players?per_page=${perPage}&page=${page}`;
    const data = (await fetchJson(base)) as BDLPlayerResponse;
    const arr: BDLPlayer[] = Array.isArray(data?.data) ? data.data : [];
    const pagePlayers = teamId
      ? arr // already filtered by team on server
      : arr.filter((p: BDLPlayer) => p?.team?.abbreviation === teamAbbr);
    players.push(...pagePlayers);

    const nextPage = data?.meta?.next_page;
    const totalPages = data?.meta?.total_pages;

    if (nextPage && nextPage !== page) { page = nextPage; continue; }
    if (totalPages && page < totalPages) { page = page + 1; continue; }
    if (arr.length < perPage) break;
    page = page + 1;
  }
  return players;
}

// Fetch only a single page of players for a team (free-tier/mini mode)
async function fetchSinglePagePlayersForTeam(teamAbbr: string) {
  const perPage = 100;
  const teamId = await getTeamIdByAbbr(teamAbbr);
  const base = teamId
    ? `${BDL_BASE}/players?per_page=${perPage}&page=1&team_ids[]=${teamId}`
    : `${BDL_BASE}/players?per_page=${perPage}&page=1`;
  const data = (await fetchJson(base)) as BDLPlayerResponse;
  const arr: BDLPlayer[] = Array.isArray(data?.data) ? data.data : [];
  return teamId ? arr : arr.filter((p) => p?.team?.abbreviation === teamAbbr);
}


function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function parseMinutesToNumber(min: string | number | null | undefined): number {
  if (typeof min === 'number') return min;
  if (!min) return 0;
  const parts = String(min).split(':');
  const m = parseInt(parts[0] || '0', 10);
  const s = parseInt(parts[1] || '0', 10);
  return Number((m + s / 60).toFixed(1));
}

async function fetchSeasonAverages(playerIds: number[], season: number) {
  const result = new Map<number, BDLSeasonAverage>();
  const batches = chunk(playerIds, 25); // keep query string within safe limits
  for (const ids of batches) {
    const qs = ids.map((id) => `player_ids[]=${id}`).join('&');
    const url = `${BDL_BASE}/season_averages?season=${season}&${qs}`;
    const data = (await fetchJson(url)) as BDLSeasonAveragesResponse;
    for (const row of data.data || []) {
      result.set(row.player_id, row);
    }
  }
  return result;
}

export async function POST(req: NextRequest) {
  let runId: string | null = null; // will be set after run row is created
  try {
    // Simple shared-secret protection
    // Accept token from either x-ingest-token header or Authorization: Bearer <token>
    const hdr = (req.headers.get('x-ingest-token') || '').trim();
    const auth = (req.headers.get('authorization') || '').trim();
    const bearer = auth.toLowerCase().startsWith('bearer ')
      ? auth.slice(7).trim()
      : '';
    const token = hdr || bearer;
    const envToken = (process.env.INGEST_TOKEN || '').trim();
    if (!token || !envToken || token !== envToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season') || DEFAULT_SEASON);
    const mode = (searchParams.get('mode') || '').toLowerCase();

    // Start ingestion run
    const { data: runRows, error: runErr } = await supabaseAdmin
      .from('ingestion_runs')
      .insert({ source: 'balldontlie', season, status: 'running' })
      .select()
      .single();
    if (runErr) throw runErr;
    runId = runRows.id as string;

// 1) Fetch Hornets players (free tier uses last-10 stats to derive roster to avoid rate limits)
    let players: BDLPlayer[] = [];
    let rosterSource: 'players:first_page' | 'players:paged' | 'stats:lastN' = 'players:first_page';

    // In free-tier or mini mode, avoid /stats entirely and pull only a single page from /players
    if (NBA_API_TIER === 'free' || mode === 'mini') {
      players = await fetchSinglePagePlayersForTeam(TEAM_ABBR);
      rosterSource = 'players:first_page';
    } else {
      // Non-free: full roster via /players pagination
      players = await fetchAllPlayersForTeam(TEAM_ABBR);
      rosterSource = 'players:paged';
    }

    const playerIds = players.map((p: BDLPlayer) => p.id);

    // Upsert players
    const upsertPlayers = players.map((p: BDLPlayer) => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      position: p.position,
      team_abbr: p.team?.abbreviation || TEAM_ABBR,
      height: null,
      weight: null,
      jersey_number: null,
    }));

    const { error: upPlayersErr } = await supabaseAdmin
      .from('players')
      .upsert(upsertPlayers);
    if (upPlayersErr) throw upPlayersErr;

// 2) Season averages per player (skip in free tier to comply and avoid failures)
    let averages = new Map<number, BDLSeasonAverage>();
    let seasonAveragesAttempted = false;
    let seasonAveragesError: string | null = null;
    if (playerIds.length) {
      if (NBA_API_TIER === 'free') {
        console.warn('[ingest-bdl] Free tier: skipping season_averages');
      } else {
        seasonAveragesAttempted = true;
        try {
          averages = await fetchSeasonAverages(playerIds, season);
        } catch (e: unknown) {
          seasonAveragesError = e instanceof Error ? e.message : String(e);
          console.warn('[ingest-bdl] season_averages failed:', seasonAveragesError);
        }
      }
    }

    type StatsRow = {
      player_id: number;
      season: number;
      games_played: number;
      points_per_game: number;
      rebounds: number;
      assists: number;
      fg_pct: number;
      three_pt_pct: number;
      ft_pct: number;
      minutes_per_game: number;
      steals: number;
      blocks: number;
      turnovers: number;
    };

    const statsRows: StatsRow[] = playerIds
      .map((id) => {
        const a = averages.get(id);
        if (!a) return null;
        return {
          player_id: id,
          season,
          games_played: a.games_played ?? 0,
          points_per_game: a.pts ?? 0,
          rebounds: a.reb ?? 0,
          assists: a.ast ?? 0,
          fg_pct: a.fg_pct ?? 0,
          three_pt_pct: a.fg3_pct ?? 0,
          ft_pct: a.ft_pct ?? 0,
          minutes_per_game: parseMinutesToNumber(a.min),
          steals: a.stl ?? 0,
          blocks: a.blk ?? 0,
          turnovers: a.turnover ?? 0,
        } as StatsRow;
      })
      .filter((v): v is StatsRow => v !== null);

    if (statsRows.length) {
      const { error: upStatsErr } = await supabaseAdmin
        .from('player_season_stats')
        .upsert(statsRows, { onConflict: 'player_id,season' });
      if (upStatsErr) throw upStatsErr;
    }

    await supabaseAdmin
      .from('ingestion_runs')
      .update({ status: 'success', finished_at: new Date().toISOString() })
      .eq('id', runId);

    return NextResponse.json({ ok: true, season, players: players.length, statsInserted: statsRows.length, tier: NBA_API_TIER, rosterSource, seasonAveragesAttempted, seasonAveragesError });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: number } | undefined)?.code ?? 500;
    console.error('[ingest-bdl] error', code, msg);
    try {
      if (supabaseAdmin && runId) {
        await supabaseAdmin
          .from('ingestion_runs')
          .update({ status: 'error', error: `${code}: ${msg}`, finished_at: new Date().toISOString() })
          .eq('id', runId);
      }
    } catch {}
    // Map upstream codes to clearer statuses
    if (code === 401) return NextResponse.json({ error: 'Upstream auth required (BDL 401)' }, { status: 424 });
    if (code === 429) return NextResponse.json({ error: 'Upstream rate limited (BDL 429), please retry' }, { status: 429 });
    if (code >= 500) return NextResponse.json({ error: 'Upstream service error' }, { status: 502 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
