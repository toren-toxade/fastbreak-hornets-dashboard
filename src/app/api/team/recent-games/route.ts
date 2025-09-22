import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { fetchTeamRecentGames } from '@/lib/nba/stats';

const TEAM_ABBR = 'CHA';
const DEFAULT_SEASON = 2024;

export async function GET() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    const games = await fetchTeamRecentGames(TEAM_ABBR, DEFAULT_SEASON);

    const wins = games.filter((g) => g.result === 'W').length;
    const losses = games.length - wins;
    const avgFor = games.length ? games.reduce((s, g) => s + g.us, 0) / games.length : 0;
    const avgAgainst = games.length ? games.reduce((s, g) => s + g.them, 0) / games.length : 0;
    const avgDiff = games.length ? games.reduce((s, g) => s + g.diff, 0) / games.length : 0;

    return NextResponse.json(
      {
        team: TEAM_ABBR,
        games,
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
    console.error('[recent-games] error', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
