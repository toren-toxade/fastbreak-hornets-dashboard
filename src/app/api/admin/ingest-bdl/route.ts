import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { fetchTeamSeasonAverages } from '@/lib/nba/stats';

const TEAM_ABBR = 'CHA';
const DEFAULT_SEASON = 2024;

export async function POST(req: NextRequest) {
  let runId: string | null = null;
  try {
    // Shared-secret protection (x-ingest-token or Authorization: Bearer <token>)
    const hdr = (req.headers.get('x-ingest-token') || '').trim();
    const auth = (req.headers.get('authorization') || '').trim();
    const bearer = auth.toLowerCase().startsWith('bearer ')
      ? auth.slice(7).trim()
      : '';
    const token = hdr || bearer;
    const envToken = (process.env.INGEST_TOKEN || '').trim();
    if (!token || !envToken || token !== envToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const season = Number(searchParams.get('season') || DEFAULT_SEASON);

    // Start ingestion run
    const { data: runRows, error: runErr } = await supabaseAdmin
      .from('ingestion_runs')
      .insert({ source: 'nba-stats', season, status: 'running' })
      .select()
      .single();
    if (runErr) throw runErr;
    runId = runRows.id as string;

    // 1) Fetch team season averages from NBA Stats
    const players = await fetchTeamSeasonAverages(TEAM_ABBR, season);

    // 2) Upsert players
    const upsertPlayers = players.map((p) => ({
      id: p.playerId,
      first_name: p.player.first_name,
      last_name: p.player.last_name,
      position: p.player.position,
      team_abbr: TEAM_ABBR,
      height: p.player.height ?? null,
      weight: p.player.weight ?? null,
      jersey_number: p.player.jersey_number ?? null,
    }));

    const { error: upPlayersErr } = await supabaseAdmin
      .from('players')
      .upsert(upsertPlayers);
    if (upPlayersErr) throw upPlayersErr;

    // 3) Upsert season stats
    const statsRows = players.map((p) => ({
      player_id: p.playerId,
      season,
      games_played: p.gamesPlayed,
      points_per_game: p.pointsPerGame,
      rebounds: p.rebounds,
      assists: p.assists,
      fg_pct: p.fieldGoalPercentage,
      three_pt_pct: p.threePointPercentage,
      ft_pct: p.freeThrowPercentage,
      minutes_per_game: p.minutesPlayed,
      steals: p.steals,
      blocks: p.blocks,
      turnovers: p.turnovers,
    }));

    if (statsRows.length) {
      const { error: upStatsErr } = await supabaseAdmin
        .from('player_season_stats')
        .upsert(statsRows, { onConflict: 'player_id,season' });
      if (upStatsErr) throw upStatsErr;
    }

    await supabaseAdmin
      .from('ingestion_runs')
      .update({ status: 'success', finished_at: new Date().toISOString() })
      .eq('id', runId);

    return NextResponse.json({ ok: true, season, players: players.length, statsInserted: statsRows.length, source: 'nba-stats' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[ingest-stats] error', msg);
    try {
      if (supabaseAdmin && runId) {
        await supabaseAdmin
          .from('ingestion_runs')
          .update({ status: 'error', error: msg, finished_at: new Date().toISOString() })
          .eq('id', runId);
      }
    } catch {}
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
