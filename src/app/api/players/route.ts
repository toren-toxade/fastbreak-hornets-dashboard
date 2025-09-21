import { NextResponse } from 'next/server';
import { mockHornetsData } from '@/lib/mockData';
import { DashboardData } from '@/types/player';
import { requireSession } from '@/lib/auth-guard';
import { getHornetsSeasonStats } from '@/lib/repo/players';

// NBA API integration would go here
// For now, we'll use mock data with the option to extend later
async function fetchHornetsData(): Promise<DashboardData> {
  // In a real implementation, you would:
  // 1. Fetch Charlotte Hornets roster from NBA API
  // 2. Get season averages for each player
  // 3. Transform the data to match our interface
  
  // For now, return mock data
  return {
    players: mockHornetsData,
    lastUpdated: new Date().toISOString()
  };
}

export const GET = async function handler() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    // Try Supabase first, fallback to mock data if empty
    let data: DashboardData = await getHornetsSeasonStats();
    if (!data.players?.length) {
      data = await fetchHornetsData();
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
