'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlayerStats } from '@/types/player';
import { Target } from 'lucide-react';

export default function ShootingEfficiencyChart() {
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
          <Target className="text-green-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Shooting Efficiency</h3>
        </div>
        <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const chartData = players.map(player => ({
    name: `${player.player.first_name} ${player.player.last_name}`,
    shortName: player.player.last_name,
    'Field Goal %': Math.round(player.fieldGoalPercentage * 100),
    'Three Point %': Math.round(player.threePointPercentage * 100),
    position: player.player.position
  })).sort((a, b) => b['Field Goal %'] - a['Field Goal %']);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600 mb-2">{data.position}</p>
          {payload.map((entry: any, index: number) => (
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
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="text-green-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">Shooting Efficiency</h3>
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
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="Field Goal %" 
              fill="#3b82f6" 
              name="Field Goal %"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="Three Point %" 
              fill="#10b981" 
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
