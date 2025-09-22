import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { fetchTeamLast10Averages } from '@/lib/nba/stats';

const TEAM_ABBR = 'CHA';
const DEFAULT_SEASON = 2024;

export async function GET() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    const players = await fetchTeamLast10Averages(TEAM_ABBR, DEFAULT_SEASON);

    return NextResponse.json(
      { players, lastUpdated: new Date().toISOString() },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[players last10] error', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
