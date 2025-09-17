'use client';

import { useState, useEffect } from 'react';
import { PlayerStats } from '@/types/player';
import { Trophy, TrendingUp } from 'lucide-react';

interface LeaderboardCategory {
  key: keyof PlayerStats;
  label: string;
  formatter: (value: number) => string;
}

const categories: LeaderboardCategory[] = [
  { key: 'pointsPerGame', label: 'Points', formatter: (v) => v.toFixed(1) },
  { key: 'rebounds', label: 'Rebounds', formatter: (v) => v.toFixed(1) },
  { key: 'assists', label: 'Assists', formatter: (v) => v.toFixed(1) },
  { key: 'fieldGoalPercentage', label: 'FG%', formatter: (v) => (v * 100).toFixed(1) + '%' },
  { key: 'minutesPlayed', label: 'Minutes', formatter: (v) => v.toFixed(1) }
];

export default function PlayerLeaderboard() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>(categories[0]);
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

  const getTopPlayers = (category: LeaderboardCategory) => {
    return [...players]
      .sort((a, b) => (b[category.key] as number) - (a[category.key] as number))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Player Leaderboard</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const topPlayers = getTopPlayers(selectedCategory);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">Player Leaderboard</h3>
      </div>

      <div className="mb-4">
        <select
          value={selectedCategory.key}
          onChange={(e) => setSelectedCategory(categories.find(c => c.key === e.target.value) || categories[0])}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.map((category) => (
            <option key={category.key} value={category.key}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {topPlayers.map((player, index) => (
          <div key={player.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                ${index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                  index === 1 ? 'bg-gray-100 text-gray-700' : 
                  index === 2 ? 'bg-orange-100 text-orange-700' : 
                  'bg-blue-100 text-blue-700'}
              `}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {player.player.first_name} {player.player.last_name}
                </p>
                <p className="text-sm text-gray-500">{player.player.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                {selectedCategory.formatter(player[selectedCategory.key] as number)}
              </span>
              {index === 0 && <TrendingUp size={16} className="text-green-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}