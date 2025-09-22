import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getTeamRecentGames } from '@/lib/repo/players';

const TEAM_ABBR = 'CHA';

export async function GET() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    const data = await getTeamRecentGames();
    const games = data.games;

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
        lastUpdated: data.lastUpdated,
      },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[recent-games] supabase fallback error:', msg);
    return NextResponse.json(
      {
        team: TEAM_ABBR,
        games: [],
        summary: { record: '0-0', avgFor: 0, avgAgainst: 0, avgDiff: 0 },
        lastUpdated: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=60' } }
    );
  }
}
