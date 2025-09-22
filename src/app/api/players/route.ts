import { NextRequest, NextResponse } from 'next/server';
import { DashboardData, PlayerStats } from '@/types/player';
import { requireSession } from '@/lib/auth-guard';
import { getHornetsSeasonStats } from '@/lib/repo/players';
import { fetchTeamSeasonAverages } from '@/lib/nba/stats';

const TEAM_ABBR = 'CHA';
const DEFAULT_SEASON = 2024;

async function fetchHornetsDataFromStats(): Promise<DashboardData> {
  const players = await fetchTeamSeasonAverages(TEAM_ABBR, DEFAULT_SEASON);
  return { players, lastUpdated: new Date().toISOString() };
}

function topNPlayers(players: PlayerStats[], n: number, metric: keyof PlayerStats): PlayerStats[] {
  return [...players]
    .sort((a, b) => Number(b[metric] as number) - Number(a[metric] as number))
    .slice(0, n);
}

export const GET = async function handler(req: NextRequest) {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    // Parse optional query params: ?top=10&metric=minutesPlayed|pointsPerGame|gamesPlayed
    const { searchParams } = new URL(req.url);
    const top = Math.max(1, Math.min(50, Number(searchParams.get('top') || '10')));
    const metricParam = (searchParams.get('metric') || 'minutesPlayed') as keyof PlayerStats;
    const allowed: (keyof PlayerStats)[] = ['minutesPlayed', 'pointsPerGame', 'gamesPlayed'];
    const metric = allowed.includes(metricParam) ? metricParam : 'minutesPlayed';

    // Try Supabase first, fallback to NBA Stats if empty
    let data: DashboardData = await getHornetsSeasonStats();
    if (!data.players?.length) {
      data = await fetchHornetsDataFromStats();
    }

    const sliced = topNPlayers(data.players, top, metric);

    return NextResponse.json({ players: sliced, lastUpdated: data.lastUpdated }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    );
  }
};
