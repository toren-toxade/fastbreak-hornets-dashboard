'use client';

import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { PlayerStats } from '@/types/player';
import { Activity } from 'lucide-react';

export default function PerformanceRadarChart() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/players');
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.players);
          if (data.players.length > 0) {
            setSelectedPlayer(data.players[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-purple-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Performance Radar Chart</h3>
        </div>
        <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!selectedPlayer) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="text-purple-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Performance Radar Chart</h3>
        </div>
        <p className="text-gray-500">No player data available</p>
      </div>
    );
  }

  // Normalize stats to 0-100 scale for better visualization
  const normalizeValue = (value: number, max: number) => {
    return Math.min(Math.round((value / max) * 100), 100);
  };

  const radarData = [
    {
      subject: 'Points',
      value: normalizeValue(selectedPlayer.pointsPerGame, 30),
      fullMark: 100,
    },
    {
      subject: 'Rebounds',
      value: normalizeValue(selectedPlayer.rebounds, 15),
      fullMark: 100,
    },
    {
      subject: 'Assists',
      value: normalizeValue(selectedPlayer.assists, 12),
      fullMark: 100,
    },
    {
      subject: 'FG%',
      value: Math.round(selectedPlayer.fieldGoalPercentage * 100),
      fullMark: 100,
    },
    {
      subject: 'Minutes',
      value: normalizeValue(selectedPlayer.minutesPlayed, 40),
      fullMark: 100,
    },
    {
      subject: 'Steals',
      value: normalizeValue(selectedPlayer.steals, 3),
      fullMark: 100,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
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
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {players.map((player) => (
            <option key={player.playerId} value={player.playerId}>
              {player.player.first_name} {player.player.last_name} ({player.player.position})
            </option>
          ))}
        </select>
      </div>

      <div className="h-64">
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
            <Radar
              name={`${selectedPlayer.player.first_name} ${selectedPlayer.player.last_name}`}
              dataKey="value"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-sm text-gray-600 space-y-1">
        <p className="font-medium">
          {selectedPlayer.player.first_name} {selectedPlayer.player.last_name} - {selectedPlayer.player.position}
        </p>
        <p>Multi-dimensional performance analysis normalized to 100% scale</p>
      </div>
    </div>
  );
}