import { NextResponse } from 'next/server';
import { DashboardData } from '@/types/player';
import { requireSession } from '@/lib/auth-guard';
import { getHornetsSeasonStats } from '@/lib/repo/players';
import { fetchTeamSeasonAverages } from '@/lib/nba/stats';

const TEAM_ABBR = 'CHA';
const DEFAULT_SEASON = 2024;

async function fetchHornetsDataFromStats(): Promise<DashboardData> {
  const players = await fetchTeamSeasonAverages(TEAM_ABBR, DEFAULT_SEASON);
  return { players, lastUpdated: new Date().toISOString() };
}

export const GET = async function handler() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    // Try Supabase first, fallback to NBA Stats if empty
    let data: DashboardData = await getHornetsSeasonStats();
    if (!data.players?.length) {
      data = await fetchHornetsDataFromStats();
    }

    return NextResponse.json(data, {
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
