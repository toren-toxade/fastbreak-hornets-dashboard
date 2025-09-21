import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';

const BDL_BASE = process.env.NBA_API_BASE_URL || 'https://api.balldontlie.io/v1';
const NBA_API_KEY = (process.env.NBA_API_KEY || '').trim();
const TEAM_ABBR = 'CHA';
const DEFAULT_SEASON = 2024;

function buildHeaders() {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (NBA_API_KEY) headers['Authorization'] = `Bearer ${NBA_API_KEY}`;
  return headers;
}

class UpstreamError extends Error { code: number; constructor(code: number, message: string){ super(message); this.code = code; } }

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: buildHeaders() });
  if (res.status === 401) throw new UpstreamError(401, `Unauthorized for ${url}`);
  if (res.status === 429) throw new UpstreamError(429, `Rate limited for ${url}`);
  if (!res.ok) throw new UpstreamError(res.status, `Upstream error ${res.status} for ${url}`);
  return res.json();
}

type BDLTeam = { id: number; abbreviation: string };

type BDLStat = {
  id: number;
  game: { id: number; season?: number };
  team: BDLTeam;
  player: { id: number; first_name: string; last_name: string; position?: string | null };
  min: string | null;
  pts: number; reb: number; ast: number; stl: number; blk: number; turnover: number;
  fgm: number; fga: number; fg3m: number; fg3a: number; ftm: number; fta: number;
};

type BDLStatsResponse = { data: BDLStat[]; meta?: { next_page?: number; total_pages?: number } };

type Aggregate = {
  playerId: number;
  first_name: string;
  last_name: string;
  position: string;
  gp: number;
  pts: number; reb: number; ast: number; stl: number; blk: number; tov: number;
  min: number; // minutes total
  fgm: number; fga: number; fg3m: number; fg3a: number; ftm: number; fta: number;
};

function parseMinutesToNumber(min: string | number | null | undefined): number {
  if (typeof min === 'number') return min;
  if (!min) return 0;
  const parts = String(min).split(':');
  const m = parseInt(parts[0] || '0', 10);
  const s = parseInt(parts[1] || '0', 10);
  return m + s / 60;
}

async function fetchStatsForGames(gameIds: number[]): Promise<BDLStat[]> {
  // stats endpoint supports multiple game_ids[]; page through results
  const perPage = 100;
  let page = 1;
  const out: BDLStat[] = [];
  const qs = gameIds.map((id) => `game_ids[]=${id}`).join('&');
  for (let i = 0; i < 10; i++) {
    const url = `${BDL_BASE}/stats?per_page=${perPage}&page=${page}&${qs}`;
    const data = (await fetchJson(url)) as BDLStatsResponse;
    const arr = Array.isArray(data.data) ? data.data : [];
    out.push(...arr);
    const nextPage = data.meta?.next_page;
    const totalPages = data.meta?.total_pages;
    if (nextPage && nextPage !== page) { page = nextPage; continue; }
    if (totalPages && page < totalPages) { page = page + 1; continue; }
    if (arr.length < perPage) break;
    page = page + 1;
  }
  return out;
}

import { TEAM_IDS } from '@/lib/constants';

async function getTeamIdByAbbr(abbr: string): Promise<number | null> {
  if (TEAM_IDS[abbr as keyof typeof TEAM_IDS]) return TEAM_IDS[abbr as keyof typeof TEAM_IDS];

  let page = 1;
  const perPage = 100;
  for (let i = 0; i < 5; i++) {
    const data = await fetchJson(`${BDL_BASE}/teams?per_page=${perPage}&page=${page}`) as { data: { id: number; abbreviation: string }[], meta?: { next_page?: number; total_pages?: number } };
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

async function getLastNGamesTeam(abbr: string, season: number, n: number): Promise<number[]> {
  const teamId = await getTeamIdByAbbr(abbr);
  const perPage = 100;
  let page = 1;
  const collected: { id: number; date: string; home_team: BDLTeam; visitor_team: BDLTeam }[] = [];
  for (let i = 0; i < 5 && collected.length < 40; i++) {
    const base = teamId
      ? `${BDL_BASE}/games?per_page=${perPage}&page=${page}&postseason=false&seasons[]=${season}&team_ids[]=${teamId}`
      : `${BDL_BASE}/games?per_page=${perPage}&page=${page}&postseason=false&seasons[]=${season}`;
    const data = await fetchJson(base) as { data: { id: number; date: string; home_team: BDLTeam; visitor_team: BDLTeam }[]; meta?: { next_page?: number; total_pages?: number } };
    const arr = Array.isArray(data.data) ? data.data : [];
    const filtered = teamId ? arr : arr.filter((g) => g.home_team?.abbreviation === abbr || g.visitor_team?.abbreviation === abbr);
    collected.push(...filtered);
    const nextPage = data.meta?.next_page;
    const totalPages = data.meta?.total_pages;
    if (nextPage && nextPage !== page) { page = nextPage; continue; }
    if (totalPages && page < totalPages && collected.length < 40) { page = page + 1; continue; }
    if (arr.length < perPage) break;
    page = page + 1;
  }
  collected.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return collected.slice(0, n).map((g) => g.id);
}

export async function GET() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    // Find last 10 games and aggregate per-player
    const gameIds = await getLastNGamesTeam(TEAM_ABBR, DEFAULT_SEASON, 10);
    if (!gameIds.length) {
      return NextResponse.json({ players: [], lastUpdated: new Date().toISOString() }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } });
    }

    const allStats = await fetchStatsForGames(gameIds);
    const rows = allStats.filter((s) => s.team?.abbreviation === TEAM_ABBR);

    const agg = new Map<number, Aggregate>();
    for (const s of rows) {
      const id = s.player.id;
      const a = agg.get(id) || {
        playerId: id,
        first_name: s.player.first_name,
        last_name: s.player.last_name,
        position: s.player.position ?? '',
        gp: 0,
        pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, tov: 0,
        min: 0,
        fgm: 0, fga: 0, fg3m: 0, fg3a: 0, ftm: 0, fta: 0,
      } as Aggregate;
      a.gp += 1;
      a.pts += s.pts || 0;
      a.reb += s.reb || 0;
      a.ast += s.ast || 0;
      a.stl += s.stl || 0;
      a.blk += s.blk || 0;
      a.tov += s.turnover || 0;
      a.min += parseMinutesToNumber(s.min);
      a.fgm += s.fgm || 0;
      a.fga += s.fga || 0;
      a.fg3m += s.fg3m || 0;
      a.fg3a += s.fg3a || 0;
      a.ftm += s.ftm || 0;
      a.fta += s.fta || 0;
      agg.set(id, a);
    }

    const players = Array.from(agg.values()).map((a) => {
      const fg_pct = a.fga > 0 ? a.fgm / a.fga : 0;
      const fg3_pct = a.fg3a > 0 ? a.fg3m / a.fg3a : 0;
      const ft_pct = a.fta > 0 ? a.ftm / a.fta : 0;
      const gp = Math.max(1, a.gp);
      return {
        playerId: a.playerId,
        player: {
          id: a.playerId,
          first_name: a.first_name,
          last_name: a.last_name,
          position: a.position,
          jersey_number: undefined,
        },
        season: DEFAULT_SEASON,
        gamesPlayed: gp,
        pointsPerGame: a.pts / gp,
        rebounds: a.reb / gp,
        assists: a.ast / gp,
        fieldGoalPercentage: fg_pct,
        threePointPercentage: fg3_pct,
        freeThrowPercentage: ft_pct,
        minutesPlayed: a.min / gp,
        steals: a.stl / gp,
        blocks: a.blk / gp,
        turnovers: a.tov / gp,
      };
    });

    return NextResponse.json({ players, lastUpdated: new Date().toISOString() }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: number } | undefined)?.code ?? 500;
    console.error('[players last10] error', code, msg);
    if (code === 401) return NextResponse.json({ error: 'Upstream auth required (BDL 401)' }, { status: 424 });
    if (code === 429) return NextResponse.json({ error: 'Upstream rate limited (BDL 429), please retry' }, { status: 429 });
    if (code >= 500) return NextResponse.json({ error: 'Upstream service error' }, { status: 502 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
