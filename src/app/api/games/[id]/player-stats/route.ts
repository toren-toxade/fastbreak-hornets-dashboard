import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { fetchGamePlayerStatsForTeam } from '@/lib/nba/stats';

const TEAM_ABBR = 'CHA';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    const { id } = await ctx.params;
    if (!id || !String(id).trim()) {
      return NextResponse.json({ error: 'Invalid game id' }, { status: 400 });
    }

    const players = await fetchGamePlayerStatsForTeam(id, TEAM_ABBR);

    return NextResponse.json({ players, lastUpdated: new Date().toISOString() }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[game player-stats] error', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
