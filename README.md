# The League Table — FPL Mini League Manager

A full app for running your FPL mini-league: live standings, weekly awards
(Manager of the Week, Donkey of the Week, Hall of Fame, Captain's Curse,
Bench Bandit, Transfer Villain, The Wall/Sieve), quarterly Best Defense /
Midfield / Attack challenges, and a generated head-to-head bracket — all
pulled automatically from the official FPL API.

Your league: `https://fantasy.premierleague.com/en/leagues/1154202/standings/c`
(league ID `1154202` is already set as the default in the DB schema).

## How it's structured

```
fpl-league/
├── backend/    Node/Express API + Postgres + FPL data sync + award logic
├── frontend/   React + TypeScript + Vite admin/standings site
└── render.yaml Render Blueprint — deploys everything in one click
```

## Local setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

You need a Postgres database. Easiest for local dev: install Postgres
locally, or spin up a free one on Render/Supabase/Neon and paste its
connection string into `DATABASE_URL` in `.env`.

Then generate a real `JWT_SECRET` and `ADMIN_SETUP_KEY` (any long random
string works — e.g. `openssl rand -hex 32`), apply the schema, and start
the server:

```bash
npm run db:migrate
npm run dev
```

Create your first admin account (do this once, then feel free to guard
or remove the `/setup` route later):

```bash
curl -X POST http://localhost:4000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"jake@example.com","password":"choose-a-real-password","name":"Jake","setupKey":"YOUR_ADMIN_SETUP_KEY"}'
```

Repeat with a different email for each additional admin.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # point VITE_API_BASE at your backend if not localhost
npm run dev
```

Visit `http://localhost:5173`. Log in at `/login` with the admin account
you just created, then go to `/admin`.

### 3. First-time data load

From the Admin page (or via `curl`), once a gameweek has kicked off:

1. **Sync Current GW** — pulls standings + picks + live points for everyone
   in the league and stores them.
2. **Generate H2H Fixtures** — run once at the start of the season (e.g.
   from GW1 to GW38) to build the round-robin schedule.
3. Awards recompute automatically every time you sync a gameweek.
4. **Quarterly recompute** — run for a quarter (1–4) once its gameweek
   range has finished, to lock in Best Defense/Midfield/Attack winners.

## Deploying (Render for the app, Supabase for the database, GitHub Actions for scheduling)

Two things to route around on the free tiers: Render's own free Postgres
now auto-deletes after 30 days, and Render removed free Cron Jobs
(minimum $1/month now). So: Supabase hosts the database, Render hosts
just the backend web service, and a free GitHub Actions scheduled
workflow pings it every 30 minutes — which also conveniently keeps the
free web service from spinning down idle.

1. Create a free project at supabase.com. Click **Connect** on the
   project dashboard, choose the **Direct** tab, then select
   **Transaction pooler** as the connection method. Copy that string
   and swap in your real database password.
2. Push this whole `fpl-league/` folder to a GitHub repo.
3. In Render: **New → Blueprint**, point it at the repo. Render reads
   `render.yaml` and creates the backend web service. It'll prompt you
   for `DATABASE_URL` — paste in the Supabase connection string from
   step 1. `JWT_SECRET`, `ADMIN_SETUP_KEY`, and `CRON_SECRET` are
   auto-generated for you.
4. Once deployed, copy your backend's URL from the Render dashboard
   (e.g. `https://fpl-league-backend.onrender.com`), and copy the
   `CRON_SECRET` value from the web service's Environment tab.
5. In your GitHub repo: **Settings → Secrets and variables → Actions →
   New repository secret**. Add two secrets:
   - `BACKEND_URL` — your Render backend URL from step 4 (no trailing
     slash)
   - `CRON_SECRET` — the same value from step 4

   The workflow in `.github/workflows/refresh.yml` will now run
   automatically every 30 minutes, hitting your backend to sync data.
   You can also trigger it manually any time from your repo's
   **Actions** tab, useful right after a gameweek deadline passes.
6. Run the migration once, from your machine, pointed at the Supabase
   connection string:
   ```bash
   DATABASE_URL="<supabase-connection-string>" npm run db:migrate
   ```
7. Hit the `/api/auth/setup` route (same as local, above) against your
   live backend URL to create your admin accounts.
8. Deploy the `frontend/` folder separately as a **Static Site** on
   Render (or Vercel/Netlify — it's a plain Vite build). Set
   `VITE_API_BASE` to your backend's Render URL in the static site's
   environment variables.

## What's genuinely automatic vs. what needs a click

- **Standings, gameweek stats, all weekly awards, H2H results:** fully
  automatic once the cron job is running — no admin action needed
  week to week.
- **Quarterly challenge winners:** need one click per quarter, since
  "the quarter is over" isn't something FPL's data tells us directly —
  you decide when to lock it in.
- **H2H fixtures:** generated once, at the start of the season.

## Extending it

The award logic lives entirely in `backend/src/services/calculations.js`
— every award is a short, self-contained block reading from
`gameweek_stats`. Adding a new one (from the ideas list, or your own) is
just adding another block there and another row in the `awards` table
schema's `award_type` comment. The frontend `LABELS` map in
`frontend/src/pages/Awards.tsx` is the only other place you need to
touch to display it.
