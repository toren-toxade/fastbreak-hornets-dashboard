'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target } from 'lucide-react';
import { usePlayers } from '@/lib/hooks/usePlayers';

export default function ShootingEfficiencyChart() {
  const { players, isLoading, isUnauthorized } = usePlayers();

  if (isUnauthorized) {
    return (
<div className="card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-[var(--primary)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Shooting Efficiency</h3>
        </div>
        <p className="text-gray-600 text-sm">Please sign in to view this chart.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-[var(--primary)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Shooting Efficiency</h3>
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

  const chartData = players.map(player => {
    const firstInitial = (player.player.first_name || '').slice(0, 1);
    const last = player.player.last_name || '';
    const shortName = (lastCounts[last] ?? 0) > 1 && firstInitial
      ? `${firstInitial}. ${last}`
      : last;

    return {
      name: `${player.player.first_name} ${player.player.last_name}`,
      shortName,
      'Field Goal %': Math.round(player.fieldGoalPercentage * 100),
      'Three Point %': Math.round(player.threePointPercentage * 100),
      position: player.player.position
    };
  }).sort((a, b) => b['Field Goal %'] - a['Field Goal %']);

  type TooltipPayloadItem = { payload: (typeof chartData)[number]; color?: string; dataKey?: string; value?: number };
  type TooltipProps = { active?: boolean; payload?: TooltipPayloadItem[]; label?: string };
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600 mb-2">{data.position}</p>
          {(payload ?? []).map((entry: TooltipPayloadItem, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-green-500" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Shooting Efficiency</h3>
      </div>
      
      <div className="h-64" role="img" aria-label="Bar chart comparing field goal percentage and three-point percentage for each player">
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
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="Field Goal %" 
              fill="var(--primary)"
              name="Field Goal %"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="Three Point %" 
              fill="var(--accent)"
              name="Three Point %"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Compare field goal percentage and three-point percentage across all players</p>
      </div>
    </div>
  );
}
