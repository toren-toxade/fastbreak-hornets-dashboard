import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { getHornetsSeasonStats } from '@/lib/repo/players';
import { mockHornetsData } from '@/lib/mockData';
import { PlayerStats } from '@/types/player';

function topN(players: PlayerStats[], key: keyof PlayerStats, n: number) {
  return [...players]
    .sort((a, b) => Number(b[key] as number) - Number(a[key] as number))
    .slice(0, n)
    .map((p) => ({
      playerId: p.playerId,
      name: `${p.player.first_name} ${p.player.last_name}`,
      position: p.player.position,
      value: p[key as keyof PlayerStats],
    }));
}

export async function GET() {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    let data = await getHornetsSeasonStats();
    if (!data.players?.length) {
      data = { players: mockHornetsData, lastUpdated: new Date().toISOString() };
    }

    const players = data.players;
    const result = {
      points: topN(players, 'pointsPerGame', 5),
      rebounds: topN(players, 'rebounds', 5),
      assists: topN(players, 'assists', 5),
      fieldGoalPercentage: topN(players, 'fieldGoalPercentage', 5),
      threePointPercentage: topN(players, 'threePointPercentage', 5),
      minutes: topN(players, 'minutesPlayed', 5),
    };

    return NextResponse.json({
      ok: true,
      top: result,
      lastUpdated: data.lastUpdated,
    }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[players/leaderboard] error', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
