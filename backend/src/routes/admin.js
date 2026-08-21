import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db/pool.js';
import { syncGameweek } from '../services/syncService.js';
import { recomputeGameweekAwards, recomputeQuarterlyAwards } from '../services/calculations.js';
import { generateSeasonFixtures, settleH2H } from '../services/h2hService.js';
import { fetchBootstrap, currentEventId } from '../services/fplApi.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

// Manually trigger a full sync + award recompute for a gameweek.
// Also runs automatically via the GitHub Actions scheduled workflow
// (see .github/workflows/refresh.yml).
adminRouter.post('/sync/:gw', asyncHandler(async (req, res) => {
  const gw = Number(req.params.gw);
  const settings = await query('SELECT value FROM league_settings WHERE key = $1', ['fpl_league_id']);
  const leagueId = settings.rows[0].value;

  const syncResult = await syncGameweek(leagueId, gw);
  const awardsResult = await recomputeGameweekAwards(gw);
  const h2hResult = await settleH2H(gw);

  res.json({ syncResult, awardsResult, h2hResult });
}));

// Convenience: sync whatever the current live/most-recent gameweek is.
adminRouter.post('/sync/current', asyncHandler(async (_req, res) => {
  const bootstrap = await fetchBootstrap({ forceRefresh: true });
  const gw = currentEventId(bootstrap);
  if (!gw) return res.status(400).json({ error: 'Could not determine current gameweek — the season may not have a live gameweek yet' });

  const settings = await query('SELECT value FROM league_settings WHERE key = $1', ['fpl_league_id']);
  const leagueId = settings.rows[0].value;

  const syncResult = await syncGameweek(leagueId, gw);
  const awardsResult = await recomputeGameweekAwards(gw);
  const h2hResult = await settleH2H(gw);

  res.json({ gameweek: gw, syncResult, awardsResult, h2hResult });
}));

adminRouter.post('/awards/quarterly/:quarter', asyncHandler(async (req, res) => {
  const result = await recomputeQuarterlyAwards(Number(req.params.quarter));
  res.json(result);
}));

adminRouter.post('/h2h/generate', asyncHandler(async (req, res) => {
  const { startGameweek, totalGameweeks } = req.body;
  const result = await generateSeasonFixtures(Number(startGameweek), Number(totalGameweeks));
  res.json(result);
}));

// Update a league setting (e.g. hall_of_fame_threshold, quarter_boundaries).
adminRouter.put('/settings/:key', asyncHandler(async (req, res) => {
  await query(
    `INSERT INTO league_settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [req.params.key, JSON.stringify(req.body.value)]
  );
  res.json({ ok: true });
}));

adminRouter.get('/settings', asyncHandler(async (_req, res) => {
  const { rows } = await query('SELECT * FROM league_settings');
  res.json(rows);
}));
