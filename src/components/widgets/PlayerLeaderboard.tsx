'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PlayerStats } from '@/types/player';
import { Trophy, TrendingUp } from 'lucide-react';
import { usePlayers } from '@/lib/hooks/usePlayers';
import { usePlayersLast10 } from '@/lib/hooks/usePlayersLast10';
import { useRecentGames } from '@/lib/hooks/useRecentGames';
import { useGamePlayerStats } from '@/lib/hooks/useGamePlayerStats';
import { fmt1, fmtPct } from '@/lib/format';

interface LeaderboardCategory {
  key: keyof PlayerStats;
  label: string;
  formatter: (value: number) => string;
}

const categories: LeaderboardCategory[] = [
  { key: 'pointsPerGame', label: 'Points', formatter: (v) => fmt1(v) },
  { key: 'rebounds', label: 'Rebounds', formatter: (v) => fmt1(v) },
  { key: 'assists', label: 'Assists', formatter: (v) => fmt1(v) },
  { key: 'fieldGoalPercentage', label: 'FG%', formatter: (v) => fmtPct(v * 100) },
  { key: 'minutesPlayed', label: 'Minutes', formatter: (v) => fmt1(v) }
];

type Mode = 'season' | 'last10' | 'game';

export default function PlayerLeaderboard() {
  const season = usePlayers();
  const last10 = usePlayersLast10();
  const recent = useRecentGames();
  const [mode, setMode] = useState<Mode>('season');
  const [selectedGameId, setSelectedGameId] = useState<number | undefined>(undefined);
  const gameStats = useGamePlayerStats(mode === 'game' ? selectedGameId : undefined);

  const [selectedCategory, setSelectedCategory] = useState<LeaderboardCategory>(categories[0]);
  const [planNotice, setPlanNotice] = useState<string | null>(null);

  useEffect(() => {
    const last10Unauthorized = Boolean((last10.error as (Error & { status?: number }) | undefined)?.status === 401 || (last10.error as (Error & { status?: number }) | undefined)?.status === 424);
    const gameUnauthorized = Boolean((gameStats.error as (Error & { status?: number }) | undefined)?.status === 401 || (gameStats.error as (Error & { status?: number }) | undefined)?.status === 424);
    if (mode === 'last10' && last10Unauthorized) {
      setPlanNotice('Live 10-game stats require the stats endpoint. Switched to Season totals.');
      setMode('season');
    }
    if (mode === 'game' && gameUnauthorized) {
      setPlanNotice('Per-game box score requires the stats endpoint. Switched to Season totals.');
      setMode('season');
    }
  }, [mode, last10.error, gameStats.error]);

  const activePlayers: PlayerStats[] = useMemo(() => {
    if (mode === 'game') return gameStats.players;
    if (mode === 'last10') return last10.players as PlayerStats[];
    return season.players as PlayerStats[];
  }, [mode, gameStats.players, last10.players, season.players]);

  const anyUnauthorized = season.isUnauthorized || last10.isUnauthorized || gameStats.isUnauthorized || recent.isUnauthorized;
  const isLoading = 
    (mode === 'season' && season.isLoading) ||
    (mode === 'last10' && last10.isLoading) ||
    (mode === 'game' && (recent.isLoading || gameStats.isLoading));

  const getTopPlayers = (category: LeaderboardCategory) => {
    return [...activePlayers]
      .sort((a, b) => (b[category.key] as number) - (a[category.key] as number))
      .slice(0, 5);
  };

if (anyUnauthorized) {
    return (
<div className="card shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="text-yellow-500" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Player Leaderboard</h3>
        </div>
        <p className="text-gray-600 text-sm">Please sign in to view the leaderboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-yellow-500" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Player Leaderboard</h3>
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
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-500" size={20} />
<h3 className="text-lg font-semibold text-[var(--foreground)]">Player Leaderboard</h3>
      </div>

      {planNotice && (
        <div className="mb-3 p-3 rounded border border-yellow-300 bg-yellow-50 text-yellow-800 text-sm">
          {planNotice}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <select
          value={mode}
          onChange={(e) => {
            const m = (e.target.value as Mode);
            setMode(m);
            if (m !== 'game') setSelectedGameId(undefined);
          }}
          className="w-full p-2.5 rounded-md border border-[var(--brand-300)] bg-[var(--brand-50)] text-[var(--brand-800)] shadow-sm focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)]"
        >
          <option value="season">Season (current)</option>
          <option value="last10">Last 10 Games (avg)</option>
          <option value="game">By Game</option>
        </select>

        <select
          value={selectedCategory.key}
          onChange={(e) => setSelectedCategory(categories.find(c => c.key === e.target.value) || categories[0])}
          className="w-full p-2.5 rounded-md border border-[var(--brand-300)] bg-[var(--brand-50)] text-[var(--brand-800)] shadow-sm focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)]"
        >
          {categories.map((category) => (
            <option key={category.key} value={category.key}>
              {category.label}
            </option>
          ))}
        </select>

        {mode === 'game' && (
          <select
            value={selectedGameId ?? ''}
            onChange={(e) => setSelectedGameId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full p-2.5 rounded-md border border-[var(--brand-300)] bg-[var(--brand-50)] text-[var(--brand-800)] shadow-sm focus:ring-2 focus:ring-[var(--brand-600)] focus:border-[var(--brand-600)]"
          >
            <option value="">Select a game</option>
            {(recent.data?.games ?? []).map((g) => (
              <option key={g.id} value={g.id}>
                {new Date(g.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                {' '}
                {g.isHome ? 'vs' : '@'} {g.opponent}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-3">
        {topPlayers.map((player, index) => (
          <div key={player.playerId} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-2)] border border-subtle">
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
                <p className="font-medium text-[var(--foreground)]">
                  {player.player.first_name} {player.player.last_name}
                </p>
                <p className="text-sm text-muted">{player.player.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-[var(--foreground)]">
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