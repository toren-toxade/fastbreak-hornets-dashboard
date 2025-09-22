"use client";

import useSWR from 'swr';
import { RecentGamesResponse } from '@/types/game';
import { Calendar } from 'lucide-react';

function fmtDate(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}

export default function LastGameCard() {
  const { data, error, isLoading } = useSWR<RecentGamesResponse>('/api/team/recent-games');

  type HttpError = Error & { status?: number };
  const unauthorized = Boolean((error as HttpError | undefined)?.status === 401);
  if (unauthorized) {
    return (
<div className="card shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="text-[var(--brand-600)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Most Recent Game</h3>
        </div>
        <p className="text-gray-600 text-sm">Please sign in to view recent games.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-[var(--brand-600)]" size={20} />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Most Recent Game</h3>
        </div>
        <div className="animate-pulse h-24 bg-[var(--surface-2)] rounded"></div>
      </div>
    );
  }

  const g = data?.games?.[0];
  if (!g) {
    return (
      <div className="card shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="text-[var(--brand-600)]" size={20} />
          <h3 className="text-lg font-semibold text-[var(--foreground)]">Most Recent Game</h3>
        </div>
        <p className="text-muted text-sm">No recent games found.</p>
      </div>
    );
  }

  return (
    <div className="card shadow-card">
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="text-[var(--brand-600)]" size={20} />
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Most Recent Game</h3>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">{fmtDate(g.date)}</div>
          <div className="text-[var(--foreground)] font-medium mt-1">
            {g.isHome ? 'CHA' : `@${g.opponent}`} {g.isHome ? `vs ${g.opponent}` : ''}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {g.us} - {g.them}
          </div>
          <div className={`text-sm font-medium ${g.result === 'W' ? 'text-green-600' : 'text-red-600'}`}>
            {g.result} ({g.diff >= 0 ? '+' : ''}{g.diff})
          </div>
        </div>
      </div>
    </div>
  );
}
