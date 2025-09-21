import useSWR from 'swr';
import type { DashboardData, PlayerStats } from '@/types/player';

type HttpError = Error & { status?: number };

export function usePlayers() {
  const { data, error, isLoading } = useSWR<DashboardData>('/api/players');
  const unauthorized = Boolean((error as HttpError | undefined)?.status === 401);
  return {
    players: (data?.players ?? []) as PlayerStats[],
    isLoading,
    error,
    isUnauthorized: unauthorized,
  } as const;
}
