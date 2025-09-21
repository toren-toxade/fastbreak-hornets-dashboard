import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';

const BDL_BASE = process.env.NBA_API_BASE_URL || 'https://api.balldontlie.io/v1';
const NBA_API_KEY = (process.env.NBA_API_KEY || '').trim();
const TEAM_ABBR = 'CHA';

function buildHeaders() {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (NBA_API_KEY) headers['Authorization'] = `Bearer ${NBA_API_KEY}`;
  return headers;
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.json();
}

type BDLTeam = { id: number; abbreviation: string };
type BDLPlayer = { id: number; first_name: string; last_name: string; position?: string | null };

type BDLStat = {
  id: number;
  game: { id: number; season?: number };
  team: BDLTeam;
  player: BDLPlayer;
  min: string | null;
  pts: number; reb: number; ast: number; stl: number; blk: number; turnover: number;
  fgm: number; fga: number; fg3m: number; fg3a: number; ftm: number; fta: number;
};

type BDLStatsResponse = { data: BDLStat[]; meta?: { next_page?: number; total_pages?: number } };

function parseMinutesToNumber(min: string | number | null | undefined): number {
  if (typeof min === 'number') return min;
  if (!min) return 0;
  const parts = String(min).split(':');
  const m = parseInt(parts[0] || '0', 10);
  const s = parseInt(parts[1] || '0', 10);
  return Number((m + s / 60).toFixed(1));
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    const { id } = await ctx.params;
    const gameId = Number(id);
    if (!Number.isFinite(gameId)) {
      return NextResponse.json({ error: 'Invalid game id' }, { status: 400 });
    }

    // Page through stats for this game
    const perPage = 100;
    let page = 1;
    const collected: BDLStat[] = [];
    for (let i = 0; i < 5; i++) {
      const url = `${BDL_BASE}/stats?per_page=${perPage}&page=${page}&game_ids[]=${gameId}`;
      const data = (await fetchJson(url)) as BDLStatsResponse;
      const arr = Array.isArray(data.data) ? data.data : [];
      collected.push(...arr);
      const nextPage = data.meta?.next_page;
      const totalPages = data.meta?.total_pages;
      if (nextPage && nextPage !== page) { page = nextPage; continue; }
      if (totalPages && page < totalPages) { page = page + 1; continue; }
      if (arr.length < perPage) break;
      page = page + 1;
    }

    const rows = collected.filter((s) => s.team?.abbreviation === TEAM_ABBR);

    // Transform to PlayerStats-like shape but for a single game
    const players = rows.map((s) => {
      const fga = s.fga || 0, fgm = s.fgm || 0, fg3a = s.fg3a || 0, fg3m = s.fg3m || 0, fta = s.fta || 0, ftm = s.ftm || 0;
      const fg_pct = fga > 0 ? fgm / fga : 0;
      const fg3_pct = fg3a > 0 ? fg3m / fg3a : 0;
      const ft_pct = fta > 0 ? ftm / fta : 0;
      return {
        playerId: s.player.id,
        player: {
          id: s.player.id,
          first_name: s.player.first_name,
          last_name: s.player.last_name,
          position: s.player.position ?? '',
          jersey_number: undefined,
          height: undefined,
          weight: undefined,
          college: undefined,
        },
        season: s.game?.season ?? 0,
        gamesPlayed: 1,
        pointsPerGame: s.pts ?? 0,
        rebounds: s.reb ?? 0,
        assists: s.ast ?? 0,
        fieldGoalPercentage: fg_pct,
        threePointPercentage: fg3_pct,
        freeThrowPercentage: ft_pct,
        minutesPlayed: parseMinutesToNumber(s.min),
        steals: s.stl ?? 0,
        blocks: s.blk ?? 0,
        turnovers: s.turnover ?? 0,
      };
    });

    return NextResponse.json({ players, lastUpdated: new Date().toISOString() }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[game player-stats] error', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
