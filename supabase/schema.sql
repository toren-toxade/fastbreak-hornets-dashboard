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

-- 3) Indexes
create index if not exists idx_player_season on player_season_stats (season, points_per_game desc);

-- 4) Enable RLS (Row-Level Security)
alter table players enable row level security;
alter table player_season_stats enable row level security;
alter table ingestion_runs enable row level security;

-- 5) Policies
-- Deny-by-default; service role will bypass RLS automatically.
-- If you later want to allow public (anon) read on select tables, add explicit policies like:
-- create policy "Public read players" on players
--   for select using (true);
-- create policy "Public read player_season_stats" on player_season_stats
--   for select using (true);

-- For now, no public read policies are created to keep data private unless accessed via service role.
