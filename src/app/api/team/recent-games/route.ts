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
  const res = await fetch(url, { headers: buildHeaders(), cache: 'no-store' });
  if (res.status === 401) throw new UpstreamError(401, `Unauthorized for ${url}`);
  if (res.status === 429) throw new UpstreamError(429, `Rate limited for ${url}`);
  if (!res.ok) throw new UpstreamError(res.status, `Upstream error ${res.status} for ${url}`);
  return res.json();
}

type BDLTeam = { id: number; abbreviation: string; full_name?: string };
type BDLTeamsResponse = { data: BDLTeam[]; meta?: { next_page?: number; total_pages?: number } };

type BDLGame = {
  id: number;
  date: string; // ISO
  season: number;
  postseason: boolean;
  home_team: BDLTeam;
  visitor_team: BDLTeam;
  home_team_score: number;
  visitor_team_score: number;
};

type BDLGamesResponse = { data: BDLGame[]; meta?: { next_page?: number; total_pages?: number } };

type RecentGame = {
  id: number;
  date: string; // ISO
  opponent: string; // e.g., BOS
  isHome: boolean;
  us: number;
  them: number;
  result: 'W' | 'L';
  diff: number;
};

import { TEAM_IDS } from '@/lib/constants';

async function getTeamIdByAbbr(abbr: string): Promise<number | null> {
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

function transformGames(teamAbbr: string, games: BDLGame[]): RecentGame[] {
  return games.map((g) => {
    const isHome = g.home_team.abbreviation === teamAbbr;
    const us = isHome ? g.home_team_score : g.visitor_team_score;
    const them = isHome ? g.visitor_team_score : g.home_team_score;
    const opponent = isHome ? g.visitor_team.abbreviation : g.home_team.abbreviation;
    const diff = us - them;
    const result: 'W' | 'L' = diff >= 0 ? 'W' : 'L';
    return {
      id: g.id,
      date: g.date,
      opponent,
      isHome,
      us,
      them,
      result,
      diff,
    };
  });
}

export async function GET() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    // Prefer using team_id filter if available
    let recent: RecentGame[] = [];

    try {
      const teamId = await getTeamIdByAbbr(TEAM_ABBR);
      const perPage = 100;
      let page = 1;
      const collected: BDLGame[] = [];

      for (let i = 0; i < 5 && collected.length < 40; i++) {
        const urlBase = teamId
          ? `${BDL_BASE}/games?per_page=${perPage}&page=${page}&postseason=false&seasons[]=${DEFAULT_SEASON}&team_ids[]=${teamId}`
          : `${BDL_BASE}/games?per_page=${perPage}&page=${page}&postseason=false&seasons[]=${DEFAULT_SEASON}`;
        const data = (await fetchJson(urlBase)) as BDLGamesResponse;
        const arr = Array.isArray(data.data) ? data.data : [];
        const filtered = teamId
          ? arr
          : arr.filter((g) => g.home_team?.abbreviation === TEAM_ABBR || g.visitor_team?.abbreviation === TEAM_ABBR);
        collected.push(...filtered);
        const nextPage = data.meta?.next_page;
        const totalPages = data.meta?.total_pages;
        if (nextPage && nextPage !== page) { page = nextPage; continue; }
        if (totalPages && page < totalPages && collected.length < 40) { page = page + 1; continue; }
        if (arr.length < perPage) break;
        page = page + 1;
      }

      // Sort by date DESC and take last 10
      collected.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      recent = transformGames(TEAM_ABBR, collected.slice(0, 10));
    } catch (e) {
      console.warn('[recent-games] fetch failed, using fallback:', e);
      recent = [];
    }

    // Compute summary
    const wins = recent.filter((g) => g.result === 'W').length;
    const losses = recent.length - wins;
    const avgFor = recent.length ? recent.reduce((s, g) => s + g.us, 0) / recent.length : 0;
    const avgAgainst = recent.length ? recent.reduce((s, g) => s + g.them, 0) / recent.length : 0;
    const avgDiff = recent.length ? recent.reduce((s, g) => s + g.diff, 0) / recent.length : 0;

    return NextResponse.json(
      {
        team: TEAM_ABBR,
        games: recent,
        summary: {
          record: `${wins}-${losses}`,
          avgFor,
          avgAgainst,
          avgDiff,
        },
        lastUpdated: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const code = (err as { code?: number } | undefined)?.code ?? 500;
    console.error('[recent-games] error', code, msg);
    if (code === 401) return NextResponse.json({ error: 'Upstream auth required (BDL 401)' }, { status: 424 });
    if (code === 429) return NextResponse.json({ error: 'Upstream rate limited (BDL 429), please retry' }, { status: 429 });
    if (code >= 500) return NextResponse.json({ error: 'Upstream service error' }, { status: 502 });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
