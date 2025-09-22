-- Supabase schema and RLS for FastBreak Hornets Dashboard
-- Run this in the Supabase SQL editor (or via migrations)

-- 1) Extension for UUIDs (if not enabled)
create extension if not exists "pgcrypto";

-- 2) Tables
create table if not exists players (
id bigint primary key,                -- provider player id (NBA Stats)
  first_name text not null,
  last_name text not null,
  position text,
  team_abbr text,
  height text,
  weight text,
  jersey_number text
);

create table if not exists player_season_stats (
  id uuid primary key default gen_random_uuid(),
  player_id bigint not null references players(id) on delete cascade,
  season int not null,
  games_played int not null,
  points_per_game numeric not null,
  rebounds numeric not null,
  assists numeric not null,
  fg_pct numeric not null,
  three_pt_pct numeric not null,
  ft_pct numeric,
  minutes_per_game numeric not null,
  steals numeric not null,
  blocks numeric not null,
  turnovers numeric not null,
  unique (player_id, season)
);

create table if not exists ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,     -- e.g., 'nba-stats'
  season int not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null,     -- 'success' | 'error' | 'running'
  error text
);

-- New: team recent games (last N cached)
create table if not exists team_recent_games (
  id bigint primary key,         -- NBA GameID
  team_abbr text not null,
  season int not null,
  game_date text not null,       -- string from NBA Stats
  opponent text not null,
  is_home boolean not null,
  us int not null,
  them int not null,
  result text not null,          -- 'W' | 'L'
  diff int not null
);

-- New: player last-10 aggregates
create table if not exists player_last10_stats (
  id uuid primary key default gen_random_uuid(),
  player_id bigint not null references players(id) on delete cascade,
  season int not null,
  games int not null,
  points_per_game numeric not null,
  rebounds numeric not null,
  assists numeric not null,
  fg_pct numeric not null,
  three_pt_pct numeric not null,
  ft_pct numeric,
  minutes_per_game numeric not null,
  steals numeric not null,
  blocks numeric not null,
  turnovers numeric not null,
  unique (player_id, season)
);

-- New: per-game box scores for team players
create table if not exists game_player_stats (
  id uuid primary key default gen_random_uuid(),
  game_id bigint not null,
  player_id bigint not null references players(id) on delete cascade,
  season int not null,
  minutes numeric not null,
  points numeric not null,
  rebounds numeric not null,
  assists numeric not null,
  steals numeric not null,
  blocks numeric not null,
  turnovers numeric not null,
  fgm int not null,
  fga int not null,
  fg3m int not null,
  fg3a int not null,
  ftm int not null,
  fta int not null,
  unique (game_id, player_id)
);

-- 3) Indexes
create index if not exists idx_player_season on player_season_stats (season, points_per_game desc);
create index if not exists idx_recent_games_team_season on team_recent_games (team_abbr, season);
create index if not exists idx_last10_season on player_last10_stats (season);
create index if not exists idx_game_player on game_player_stats (game_id);
create index if not exists idx_game_player_season on game_player_stats (player_id, season);

-- 4) Enable RLS (Row-Level Security)
alter table players enable row level security;
alter table player_season_stats enable row level security;
alter table ingestion_runs enable row level security;
alter table team_recent_games enable row level security;
alter table player_last10_stats enable row level security;
alter table game_player_stats enable row level security;

-- 5) Policies
-- Deny-by-default; service role will bypass RLS automatically.
-- If you later want to allow public (anon) read on select tables, add explicit policies like:
-- create policy "Public read players" on players
--   for select using (true);
-- create policy "Public read player_season_stats" on player_season_stats
--   for select using (true);
-- create policy "Public read recent games" on team_recent_games
--   for select using (true);
-- create policy "Public read player last10" on player_last10_stats
--   for select using (true);

-- For now, no public read policies are created to keep data private unless accessed via service role.
