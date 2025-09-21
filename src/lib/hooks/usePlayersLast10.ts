import useSWR from 'swr';
import type { DashboardData } from '@/types/player';

export function usePlayersLast10() {
  const { data, error, isLoading } = useSWR<DashboardData>('/api/players/last10');
  type HttpError = Error & { status?: number };
  const isUnauthorized = Boolean((error as HttpError | undefined)?.status === 401);
  return { players: data?.players ?? [], error, isLoading, isUnauthorized } as const;
}
