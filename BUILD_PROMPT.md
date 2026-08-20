# Build Prompt: FPL Mini League Manager

Paste this whole document into your coding agent (Cursor, Windsurf, another
Claude session, etc.) as the project brief. A working scaffold already
exists — see "Starting point" below — so treat this as the spec to
continue from, not a from-scratch request.

## What this is

A web app to run my Fantasy Premier League (FPL) mini-league: automatic
standings, a set of weekly "awards" for banter/engagement, quarterly
positional challenges, and a head-to-head bracket layered on top of a
classic points league. Multiple admins manage it; league members just
view it (no member login needed for v1).

My league: `https://fantasy.premierleague.com/en/leagues/1154202/standings/c`
League ID: `1154202`. Roughly 12+ managers.

## Starting point

A scaffold already exists with this structure:

```
fpl-league/
├── backend/
│   ├── src/
│   │   ├── db/         schema.sql, pool.js, migrate.js
│   │   ├── services/    fplApi.js, syncService.js, calculations.js, h2hService.js
│   │   ├── routes/      auth.js, league.js, admin.js
│   │   ├── middleware/  auth.js
│   │   └── jobs/        refresh.js, cron-entry.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       Standings.tsx, Awards.tsx, H2H.tsx, Login.tsx, Admin.tsx
│   │   ├── api/         client.ts
│   │   └── styles/      tokens.css
│   └── package.json
├── render.yaml
└── README.md
```

Stack: Node/Express + PostgreSQL backend, React + TypeScript + Vite
frontend, deployed on Render (web service + Postgres + a separate Cron
Job for scheduled data refresh, since Render's free web service tier
spins down when idle).

## Data source: the official FPL API

Base URL: `https://fantasy.premierleague.com/api`. No API key. **CORS is
blocked**, so every call must go through the backend, never directly
from the frontend.

Key endpoints in use:
- `GET /bootstrap-static/` — all players, teams, and gameweeks in one
  payload. `elements[].element_type`: 1 = GK, 2 = DEF, 3 = MID, 4 = FWD.
  `events[].is_current` / `is_next` / `finished` tell you where the
  season is right now.
- `GET /leagues-classic/{league_id}/standings/?page_standings=1` —
  paginated standings (`standings.has_next` tells you to fetch the next
  page). Each result has `entry` (manager ID), `player_name`,
  `entry_name` (team name), `total`, `rank`.
- `GET /entry/{entry_id}/event/{gameweek}/picks/` — one manager's picks
  for one gameweek: `picks[]` (each with `element`, `position`,
  `multiplier`, `is_captain`, `is_vice_captain`), `active_chip`
  (`null | '3xc' | 'bboost' | 'freehit' | 'wildcard'`), and
  `entry_history` with `points` (net, **already has the transfer-cost
  deducted**), `event_transfers_cost`, `points_on_bench`,
  `total_points` (season cumulative), `overall_rank`.
- `GET /event/{gameweek}/live/` — every player's actual points scored
  that gameweek: `elements[].stats.total_points`.
- `GET /entry/{entry_id}/history/` — full season + past-seasons summary,
  useful for season-end recaps.

Important derived value: **raw (pre-hit) points = `points` +
`event_transfers_cost`**, since `points` is already net.

## Data model (already in `schema.sql`)

- `admins` — email/password (bcrypt) + name, multiple rows supported.
- `league_settings` — key/value JSONB store for things like
  `fpl_league_id`, `hall_of_fame_threshold` (default 100),
  `quarter_boundaries` (default `[[1,9],[10,19],[20,28],[29,38]]`).
- `managers` — one row per FPL entry in the league (synced from
  standings): `entry_id`, `manager_name`, `team_name`.
- `gameweek_stats` — the core table, one row per manager per gameweek:
  net/raw points, transfer cost, bench points, captain + vice-captain
  element IDs and captain's raw points, chip played, overall rank,
  cumulative total, and **`gk_def_points` / `mid_points` /
  `fwd_points`** — the sum of `live` points × `multiplier` for each
  starting-XI player in that position group (GK counted with DEF).
  These three columns are what quarterly challenges are built from.
- `awards` — a log of every computed award: `award_type`, `gameweek`
  (nullable for season/quarterly awards), `quarter` (nullable), the
  winning `entry_id`, a numeric `value`, and a `details` JSONB blob for
  extra context.
- `h2h_fixtures` — generated round-robin schedule (see below), settled
  from `gameweek_stats` once synced.

## Features already implemented

**Weekly awards** (recomputed every sync, in `calculations.js`):
- Manager of the Week — highest net gameweek score.
- **Donkey of the Week** — lowest net gameweek score (i.e. *after* the
  transfer-hit deduction, so a bad hit can make you the donkey even
  with a decent raw score). Shows raw score alongside for context.
- Hall of Fame — 100+ net points in a gameweek with no chip played.
- Captain's Curse — worst captain pick of the week (lowest raw points
  scored by whoever was captained).
- Bench Bandit — most points stranded on the bench.
- Transfer Villain — among managers who took a hit, whoever ended with
  the worst net score (the hit that hurt most).
- The Wall / The Sieve — best / worst combined GK+defence points.

**Quarterly challenges** — Best Defense / Midfield / Attack, computed by
summing `gk_def_points` / `mid_points` / `fwd_points` across a
configurable gameweek range (default: four ~9-10 gameweek blocks),
triggered manually by an admin once a quarter ends.

**H2H bracket** — since the underlying league is a classic (points)
league, not a native FPL H2H league, fixtures are generated as a
round-robin (circle method) across the season and settled by comparing
`gw_points_net` between the two managers each week.

**Admin auth** — JWT-based, multiple admin accounts, seeded via a
one-time `/api/auth/setup` route guarded by an `ADMIN_SETUP_KEY` env var.

**Scheduled refresh** — a Render Cron Job (separate from the web
service) hits the sync logic every 30 minutes during the season to keep
bonus points and live scores current.

## What still needs work / good next steps

Use your judgment on priority, but roughly in order of value:

1. **Test against real GW1 data once the deadline passes** — the sync
   logic hasn't been run against live data yet. Watch for FPL API field
   drift (their field names shift slightly season to season — verify
   response shapes against a real call before trusting the calculations
   blindly).
2. **Polish the frontend** — the current pages are functional but plain.
   Push further on the "matchday scoreboard" visual direction already
   started in `frontend/src/styles/tokens.css` (deep pitch-green/black,
   amber scoreboard accent, red-card red for villain-style awards,
   Archivo Black + Space Mono typography). Add gameweek-over-gameweek
   rank movement arrows, a proper trophy-cabinet visual, and a
   "this week's storylines" summary view that surfaces the spiciest
   award of the week front and center.
3. **More engagement features** — brainstorm and implement from this
   list, or invent your own:
   - Green Arrow / Red Arrow Streaks — consecutive weeks climbing or
     falling in rank.
   - Season-long form-weighted power ranking (already have a `/form`
     endpoint using the last 4 GWs — could extend into a proper
     rolling-weighted rank).
   - Chip Timing Leaderboard — rank chip weeks by performance relative
     to the league's average score that week.
   - Nemesis Tracker — for H2H, the manager who's beaten you most.
   - Milestone badges (first 60+ week, first triple captain, survived
     a big hit and still finished top half).
4. **Notifications** — a weekly digest (email, WhatsApp, or Slack
   webhook) posting that gameweek's awards automatically after the
   Sunday sync, so admins don't have to manually announce results.
5. **Prize pot / side bets ledger** — not currently built (the league
   doesn't have money stakes yet), but if that changes, add an
   admin-editable table for entry fees and payouts — keep it manual
   since it's not derivable from FPL data.
6. **Member-facing polish** — currently only admins log in; standings/
   awards pages are public reads. Consider whether members want
   personalized views eventually (e.g. "your award history").

## House rules for whoever builds this

- Every admin action should be idempotent — re-running a sync or an
  award recompute for the same gameweek should produce the same result,
  not duplicate rows (the existing code does this via `ON CONFLICT` /
  delete-then-insert; keep that pattern for anything new).
- Keep FPL API calls server-side only.
- Don't hardcode gameweek count or quarter boundaries — they're already
  configurable via `league_settings`; keep new features reading from
  there too.
- Prefer clear, complete files over partial diffs — this project gets
  edited by more than one tool over time, so keep each file readable
  top to bottom.
