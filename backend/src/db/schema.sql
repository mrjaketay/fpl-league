-- FPL Mini League Manager — Database Schema
-- Run with: psql $DATABASE_URL -f src/db/schema.sql

-- Admins who can log in to manage the league (multiple admins supported)
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- League-wide settings, editable by admins (thresholds, quarter boundaries, etc.)
CREATE TABLE IF NOT EXISTS league_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- One row per manager in the league (synced from FPL standings)
CREATE TABLE IF NOT EXISTS managers (
  entry_id INTEGER PRIMARY KEY,        -- FPL manager/entry ID
  manager_name TEXT NOT NULL,          -- real name, e.g. "Jake Tay"
  team_name TEXT NOT NULL,             -- FPL team name, e.g. "The Final Third FC"
  joined_event INTEGER,                -- gameweek they joined the league
  active BOOLEAN NOT NULL DEFAULT true
);

-- Per-manager, per-gameweek stats — the core data table everything else derives from
CREATE TABLE IF NOT EXISTS gameweek_stats (
  id SERIAL PRIMARY KEY,
  entry_id INTEGER NOT NULL REFERENCES managers(entry_id),
  gameweek INTEGER NOT NULL,
  gw_points_net INTEGER NOT NULL,      -- points AFTER transfer-cost deduction (what decides Donkey of the Week)
  gw_points_raw INTEGER NOT NULL,      -- points BEFORE transfer-cost deduction
  transfers_cost INTEGER NOT NULL DEFAULT 0,
  bench_points INTEGER NOT NULL DEFAULT 0,
  captain_element_id INTEGER,          -- FPL player id of captain
  captain_points INTEGER,              -- points the captain scored (pre-multiplier)
  vice_captain_element_id INTEGER,
  chip_played TEXT,                    -- 'wildcard' | 'freehit' | 'bboost' | '3xc' | NULL
  overall_rank BIGINT,
  total_points_after INTEGER NOT NULL, -- cumulative season total after this gameweek
  gk_def_points INTEGER NOT NULL DEFAULT 0,   -- sum of GK + starting defenders points this GW
  mid_points INTEGER NOT NULL DEFAULT 0,      -- sum of starting midfielders points this GW
  fwd_points INTEGER NOT NULL DEFAULT 0,      -- sum of starting forwards points this GW
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entry_id, gameweek)
);

-- Computed weekly/season awards log — Hall of Fame, Donkey of the Week, Manager of the Week, etc.
CREATE TABLE IF NOT EXISTS awards (
  id SERIAL PRIMARY KEY,
  award_type TEXT NOT NULL,            -- 'hall_of_fame' | 'donkey_of_week' | 'manager_of_week' |
                                        -- 'captains_curse' | 'bench_bandit' | 'transfer_villain' |
                                        -- 'the_wall' | 'the_sieve' | 'quarterly_defense' |
                                        -- 'quarterly_midfield' | 'quarterly_attack'
  gameweek INTEGER,                    -- NULL for season/quarterly-level awards
  quarter INTEGER,                     -- 1-4, only for quarterly challenge awards
  entry_id INTEGER NOT NULL REFERENCES managers(entry_id),
  value NUMERIC,                       -- the number that earned the award (points, streak length, etc.)
  details JSONB,                       -- free-form extra context (e.g. captain name, raw vs net score)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- H2H fixtures — generated as a round robin since the underlying league is a classic league,
-- not an FPL head-to-head league. Winner is derived from gw_points_net.
CREATE TABLE IF NOT EXISTS h2h_fixtures (
  id SERIAL PRIMARY KEY,
  gameweek INTEGER NOT NULL,
  entry_id_1 INTEGER NOT NULL REFERENCES managers(entry_id),
  entry_id_2 INTEGER NOT NULL REFERENCES managers(entry_id),
  winner_entry_id INTEGER REFERENCES managers(entry_id), -- NULL = draw or not yet played
  UNIQUE (gameweek, entry_id_1, entry_id_2)
);

CREATE INDEX IF NOT EXISTS idx_gameweek_stats_gw ON gameweek_stats(gameweek);
CREATE INDEX IF NOT EXISTS idx_awards_type_gw ON awards(award_type, gameweek);
CREATE INDEX IF NOT EXISTS idx_h2h_gw ON h2h_fixtures(gameweek);

-- Sensible defaults for settings — admins can change these via the admin panel later
INSERT INTO league_settings (key, value) VALUES
  ('fpl_league_id', '1154202'),
  ('hall_of_fame_threshold', '100'),
  ('season_total_gameweeks', '38'),
  ('quarter_boundaries', '[[1,9],[10,19],[20,29],[30,38]]'),
  ('league_name', '"My Mini League"')
ON CONFLICT (key) DO NOTHING;
