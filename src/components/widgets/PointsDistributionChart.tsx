'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PlayerStats } from '@/types/player';
import { BarChart3 } from 'lucide-react';

export default function PointsDistributionChart() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/players');
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.players);
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
          <BarChart3 className="text-orange-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Points Distribution</h3>
        </div>
        <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const chartData = players
    .map(player => ({
      name: `${player.player.first_name} ${player.player.last_name}`,
      shortName: player.player.last_name,
      points: player.pointsPerGame,
      position: player.player.position,
      gamesPlayed: player.gamesPlayed
    }))
    .sort((a, b) => b.points - a.points);

  const CustomTooltip = ({ active, payload, label }: any) => {
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
    if (points >= 20) return '#ea580c'; // High scorer - orange-600
    if (points >= 15) return '#fb923c'; // Good scorer - orange-400
    if (points >= 10) return '#fed7aa'; // Average scorer - orange-200
    return '#fef3c7'; // Low scorer - yellow-100
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="text-orange-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">Points Distribution</h3>
      </div>
      
      <div className="h-64">
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
              fill={(entry: any) => getBarColor(entry.points)}
            >
              {chartData.map((entry, index) => (
                <Bar key={`cell-${index}`} fill={getBarColor(entry.points)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 space-y-2">
        <p>Points per game distribution across the Charlotte Hornets roster</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-600"></div>
            <span>20+ PPG</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-400"></div>
            <span>15-19 PPG</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-200"></div>
            <span>10-14 PPG</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-100"></div>
            <span>&lt;10 PPG</span>
          </div>
        </div>
      </div>
    </div>
  );
}