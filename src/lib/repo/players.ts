import { supabaseAdmin } from '@/lib/supabase/server';
import type { DashboardData, PlayerStats } from '@/types/player';

const DEFAULT_SEASON = 2024;
const TEAM_ABBR = 'CHA';

export async function getHornetsSeasonStats(season: number = DEFAULT_SEASON): Promise<DashboardData> {
  if (!supabaseAdmin) {
    return { players: [], lastUpdated: new Date().toISOString() };
  }

  const { data, error } = await supabaseAdmin
    .from('player_season_stats')
    .select(`
      season,
      games_played,
      points_per_game,
      rebounds,
      assists,
      fg_pct,
      three_pt_pct,
      ft_pct,
      minutes_per_game,
      steals,
      blocks,
      turnovers,
      players:player_id (
        id, first_name, last_name, position, team_abbr, height, weight, jersey_number
      )
    `)
    .eq('season', season);

  if (error) {
    console.error('[supabase] query error', error);
    return { players: [], lastUpdated: new Date().toISOString() };
  }

  type Row = {
    season: number;
    games_played: number;
    points_per_game: number;
    rebounds: number;
    assists: number;
    fg_pct: number;
    three_pt_pct: number;
    ft_pct: number | null;
    minutes_per_game: number;
    steals: number;
    blocks: number;
    turnovers: number;
    players: {
      id: number;
      first_name: string;
      last_name: string;
      position: string | null;
      team_abbr: string | null;
      height: string | null;
      weight: string | null;
      jersey_number: string | null;
    } | null;
  };

  const rowsAll = ((data ?? []) as unknown) as Row[];
  const rows = rowsAll.filter((row) => row.players?.team_abbr === TEAM_ABBR);

  const players: PlayerStats[] = rows
    .filter((row) => row.players !== null)
    .map((row) => {
      const p = row.players!;
      return {
        playerId: p.id,
        player: {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          position: p.position ?? '',
          height: p.height ?? undefined,
          weight: p.weight ?? undefined,
          jersey_number: p.jersey_number ?? undefined,
          college: undefined,
        },
        season: row.season,
        gamesPlayed: row.games_played,
        pointsPerGame: Number(row.points_per_game),
        rebounds: Number(row.rebounds),
        assists: Number(row.assists),
        fieldGoalPercentage: Number(row.fg_pct),
        threePointPercentage: Number(row.three_pt_pct),
        freeThrowPercentage: row.ft_pct != null ? Number(row.ft_pct) : 0,
        minutesPlayed: Number(row.minutes_per_game),
        steals: Number(row.steals),
        blocks: Number(row.blocks),
        turnovers: Number(row.turnovers),
      };
    });

  return { players, lastUpdated: new Date().toISOString() };
}
