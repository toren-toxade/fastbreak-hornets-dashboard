import useSWR from 'swr';
import type { DashboardData } from '@/types/player';

export function useGamePlayerStats(gameId?: number) {
  const key = gameId ? `/api/games/${gameId}/player-stats` : null;
  const { data, error, isLoading } = useSWR<DashboardData>(key);
  type HttpError = Error & { status?: number };
  const isUnauthorized = Boolean((error as HttpError | undefined)?.status === 401);
  return { players: data?.players ?? [], error, isLoading, isUnauthorized } as const;
}
