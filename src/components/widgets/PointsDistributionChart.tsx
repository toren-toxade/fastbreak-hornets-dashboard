'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { usePlayers } from '@/lib/hooks/usePlayers';

export default function PointsDistributionChart() {
  const { players, isLoading, isUnauthorized } = usePlayers();

  if (isUnauthorized) {
    return (
<div className="card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-[var(--primary)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Points Distribution</h3>
        </div>
        <p className="text-gray-600 text-sm">Please sign in to view this chart.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-[var(--primary)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Points Distribution</h3>
        </div>
<div className="animate-pulse h-64 bg-[var(--surface-2)] rounded"></div>
      </div>
    );
  }

  // Build short names: use last name, or first initial + last name if duplicates
  const lastCounts = players.reduce<Record<string, number>>((acc, p) => {
    const ln = p.player.last_name || '';
    acc[ln] = (acc[ln] || 0) + 1;
    return acc;
  }, {});

  const chartData = players
    .map(player => {
      const firstInitial = (player.player.first_name || '').slice(0, 1);
      const last = player.player.last_name || '';
      const shortName = (lastCounts[last] ?? 0) > 1 && firstInitial
        ? `${firstInitial}. ${last}`
        : last;
      return {
        name: `${player.player.first_name} ${player.player.last_name}`,
        shortName,
        points: player.pointsPerGame,
        position: player.player.position,
        gamesPlayed: player.gamesPlayed
      };
    })
    .sort((a, b) => b.points - a.points);

  type TooltipProps = { active?: boolean; payload?: Array<{ payload: typeof chartData[number] }>; label?: string };
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600 mb-1">{data.position}</p>
          <p className="text-sm text-orange-600">
            <span className="font-semibold">{data.points.toFixed(1)}</span> PPG
          </p>
          <p className="text-sm text-gray-500">
            {data.gamesPlayed} games played
          </p>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (points: number) => {
    if (points >= 20) return 'var(--primary)';
    if (points >= 15) return 'var(--primary-hover)';
    if (points >= 10) return '#93c5fd';
    return '#dbeafe';
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-[var(--primary)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Points Distribution</h3>
      </div>
      
      <div className="h-64" role="img" aria-label="Bar chart showing points per game distribution across players">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="shortName" 
              angle={-45}
              textAnchor="end"
              height={80}
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `${value}`}
              fontSize={12}
              label={{ value: 'Points Per Game', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="points" 
              radius={[2, 2, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.points)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <p>Points per game distribution across the Charlotte Hornets roster</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--primary)]"></div>
            <span>20+ PPG</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--primary-hover)]"></div>
            <span>15-19 PPG</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[#93c5fd]"></div>
            <span>10-14 PPG</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--brand-100)]"></div>
            <span>&lt;10 PPG</span>
          </div>
        </div>
      </div>
    </div>
  );
}
