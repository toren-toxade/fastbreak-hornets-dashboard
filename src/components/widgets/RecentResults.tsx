"use client";

import useSWR from 'swr';
import { RecentGamesResponse } from '@/types/game';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CalendarDays } from 'lucide-react';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function RecentResults() {
  const { data, error, isLoading } = useSWR<RecentGamesResponse>('/api/team/recent-games');

  type HttpError = Error & { status?: number };
  const unauthorized = Boolean((error as HttpError | undefined)?.status === 401);
  if (unauthorized) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Last 10 Games</h3>
        </div>
        <p className="text-gray-600 text-sm">Please sign in to view recent games.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Last 10 Games</h3>
        </div>
        <div className="animate-pulse h-40 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-6 w-8 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  const games = data?.games ?? [];
  const summary = data?.summary;
  const sparkData = games.slice().reverse().map((g, idx) => ({ idx, diff: g.diff, label: fmtDate(g.date) }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Last 10 Games</h3>
        </div>
        {summary && (
          <div className="text-sm text-gray-600">
            Record: <span className="font-medium text-gray-900">{summary.record}</span> · Avg Diff:{' '}
            <span className={`font-medium ${summary.avgDiff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.avgDiff.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="h-32 mb-4" role="img" aria-label="Sparkline of point differential over last 10 games">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <XAxis dataKey="label" hide />
            <YAxis hide />
            <Tooltip formatter={(v: unknown, _n: unknown, p: unknown) => {
              const label = (p as { payload?: { label?: string } })?.payload?.label;
              return [v as number, label];
            }} />
            <Line type="monotone" dataKey="diff" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {games.map((g) => (
          <div key={g.id} className={`text-center text-xs px-2 py-1 rounded font-medium ${
            g.result === 'W' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`} title={`${fmtDate(g.date)} vs ${g.isHome ? '' : '@'}${g.opponent} (${g.us}-${g.them})`}>
            {g.result}
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500">W/L over the last 10 games with point differential trend</div>
    </div>
  );
}
