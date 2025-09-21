import useSWR from 'swr';
import type { RecentGamesResponse } from '@/types/game';

export function useRecentGames() {
  const { data, error, isLoading } = useSWR<RecentGamesResponse>('/api/team/recent-games');
  type HttpError = Error & { status?: number };
  const isUnauthorized = Boolean((error as HttpError | undefined)?.status === 401);
  return { data, error, isLoading, isUnauthorized } as const;
}
