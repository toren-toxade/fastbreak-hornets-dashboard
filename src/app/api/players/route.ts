import { NextResponse } from 'next/server';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { mockHornetsData } from '@/lib/mockData';
import { DashboardData } from '@/types/player';

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

export const GET = withApiAuthRequired(async function handler(req) {
  try {
    const data = await fetchHornetsData();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player data' },
      { status: 500 }
    );
  }
});