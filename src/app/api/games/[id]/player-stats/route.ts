import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth-guard';
import { supabaseAdmin } from '@/lib/supabase/server';
import { fetchGamePlayerStatsForTeam } from '@/lib/nba/stats';

const TEAM_ABBR = 'CHA';

type GamePlayerRow = {
  game_id: number;
  season: number;
  minutes: number;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fgm: number;
  fga: number;
  fg3m: number;
  fg3a: number;
  ftm: number;
  fta: number;
  players: {
    id: number;
    first_name: string;
    last_name: string;
    position: string | null;
    jersey_number: string | null;
  } | null;
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const gate = await requireSession();
    if (gate instanceof NextResponse) return gate;

    const { id } = await ctx.params;
    const gameId = Number(id);
    if (!Number.isFinite(gameId)) {
      return NextResponse.json({ error: 'Invalid game id' }, { status: 400 });
    }

    // Prefer Supabase if available
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('game_player_stats')
        .select(`
          game_id,
          season,
          minutes,
          points,
          rebounds,
          assists,
          steals,
          blocks,
          turnovers,
          fgm,
          fga,
          fg3m,
          fg3a,
          ftm,
          fta,
          players:player_id ( id, first_name, last_name, position, jersey_number )
        `)
        .eq('game_id', gameId);

      if (!error && Array.isArray(data) && data.length) {
        const rows = (data as unknown as GamePlayerRow[]);
        const players = rows.map((row) => {
          const p = row.players!;
          const fga = row.fga || 0, fgm = row.fgm || 0, fg3a = row.fg3a || 0, fg3m = row.fg3m || 0, fta = row.fta || 0, ftm = row.ftm || 0;
          const fg_pct = fga > 0 ? fgm / fga : 0;
          const fg3_pct = fg3a > 0 ? fg3m / fg3a : 0;
          const ft_pct = fta > 0 ? ftm / fta : 0;
          return {
            playerId: p.id,
            player: {
              id: p.id,
              first_name: p.first_name,
              last_name: p.last_name,
              position: p.position ?? '',
              jersey_number: p.jersey_number ?? undefined,
            },
            season: row.season,
            gamesPlayed: 1,
            pointsPerGame: row.points,
            rebounds: row.rebounds,
            assists: row.assists,
            fieldGoalPercentage: fg_pct,
            threePointPercentage: fg3_pct,
            freeThrowPercentage: ft_pct,
            minutesPlayed: Number(row.minutes),
            steals: row.steals,
            blocks: row.blocks,
            turnovers: row.turnovers,
          };
        });
        return NextResponse.json({ players, lastUpdated: new Date().toISOString() }, { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } });
      }
    }

    // Fallback: attempt live fetch (with short timeouts in stats.ts), else return empty
    try {
      const players = await fetchGamePlayerStatsForTeam(gameId, TEAM_ABBR);
      return NextResponse.json({ players, lastUpdated: new Date().toISOString() }, { headers: { 'Cache-Control': 's-maxage=120, stale-while-revalidate=300' } });
    } catch {
      console.warn('[game player-stats] live fetch failed, returning empty');
      return NextResponse.json({ players: [], lastUpdated: new Date().toISOString() }, { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=60' } });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[game player-stats] error', msg);
    return NextResponse.json({ players: [], lastUpdated: new Date().toISOString() }, { status: 200 });
  }
}
