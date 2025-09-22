'use client';

import { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PlayerStats } from '@/types/player';
import { Activity } from 'lucide-react';
import { usePlayers } from '@/lib/hooks/usePlayers';
import { RADAR_MAX } from '@/lib/constants';
import { fmt1 } from '@/lib/format';

export default function PerformanceRadarChart() {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);

  const { players, isLoading, isUnauthorized } = usePlayers();

  // Initialize selected player once we have data
  useEffect(() => {
    if (!selectedPlayer && players.length > 0) {
      setSelectedPlayer(players[0]);
    }
  }, [players, selectedPlayer]);

  if (isUnauthorized) {
    return (
<div className="card shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-[var(--primary)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Performance Radar Chart</h3>
        </div>
        <p className="text-gray-600 text-sm">Please sign in to view this chart.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-[var(--primary)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Performance Radar Chart</h3>
        </div>
<div className="animate-pulse h-64 bg-[var(--surface-2)] rounded"></div>
      </div>
    );
  }

  if (!selectedPlayer) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-[var(--primary)]" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Performance Radar Chart</h3>
        </div>
        <p className="text-gray-500">No player data available</p>
      </div>
    );
  }

  // Normalize stats to 0-100 scale for better visualization
  const normalizeValue = (value: number, max: number) => {
    return Math.min(Math.round((value / max) * 100), 100);
  };

  type RadarDatum = { subject: string; value: number; raw: number; fullMark: number };

  const radarData: RadarDatum[] = [
    {
      subject: 'Points',
      value: normalizeValue(selectedPlayer.pointsPerGame, RADAR_MAX.points),
      raw: selectedPlayer.pointsPerGame,
      fullMark: 100,
    },
    {
      subject: 'Rebounds',
      value: normalizeValue(selectedPlayer.rebounds, RADAR_MAX.rebounds),
      raw: selectedPlayer.rebounds,
      fullMark: 100,
    },
    {
      subject: 'Assists',
      value: normalizeValue(selectedPlayer.assists, RADAR_MAX.assists),
      raw: selectedPlayer.assists,
      fullMark: 100,
    },
    {
      subject: 'FG%',
      value: Math.round(selectedPlayer.fieldGoalPercentage * 100),
      raw: selectedPlayer.fieldGoalPercentage * 100,
      fullMark: 100,
    },
    {
      subject: 'Minutes',
      value: normalizeValue(selectedPlayer.minutesPlayed, RADAR_MAX.minutes),
      raw: selectedPlayer.minutesPlayed,
      fullMark: 100,
    },
    {
      subject: 'Steals',
      value: normalizeValue(selectedPlayer.steals, RADAR_MAX.steals),
      raw: selectedPlayer.steals,
      fullMark: 100,
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="text-purple-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">Performance Radar Chart</h3>
      </div>

      <div className="mb-4">
        <select
          value={selectedPlayer.playerId}
          onChange={(e) => {
            const playerId = parseInt(e.target.value);
            const player = players.find(p => p.playerId === playerId);
            if (player) setSelectedPlayer(player);
          }}
className="w-full p-2.5 rounded-md border border-[var(--brand-300)] bg-[var(--brand-50)] text-[var(--brand-800)] shadow-sm focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)]"
        >
          {players.map((player) => (
            <option key={player.playerId} value={player.playerId}>
              {player.player.first_name} {player.player.last_name}
            </option>
          ))}
        </select>
      </div>

      <div className="h-64" role="img" aria-label="Radar chart of player performance across points, rebounds, assists, field goal percentage, minutes, and steals">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const p = payload[0] as { payload: RadarDatum };
                  const d = p.payload;
                  const rawStr = d.subject === 'FG%'
                    ? `${fmt1(d.raw)}%`
                    : `${fmt1(d.raw)}`;
                  return (
                    <div className="bg-white p-2 border border-gray-200 rounded shadow-sm text-sm">
                      <div className="font-medium text-gray-900">{d.subject}</div>
                      <div className="text-gray-700">{rawStr}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Radar
              name={`${selectedPlayer.player.first_name} ${selectedPlayer.player.last_name}`}
              dataKey="value"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 text-sm border-t border-subtle pt-4">
        <p className="text-muted">Multi-dimensional performance analysis normalized to 100% scale</p>
      </div>
    </div>
  );
}