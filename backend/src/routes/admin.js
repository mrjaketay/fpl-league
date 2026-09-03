import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { query } from '../db/pool.js';
import { syncGameweek } from '../services/syncService.js';
import { recomputeGameweekAwards, recomputeQuarterlyAwards, recomputeMonthlyAward } from '../services/calculations.js';
import { generateSeasonFixtures, settleH2H } from '../services/h2hService.js';
import { fetchBootstrap, currentEventId } from '../services/fplApi.js';

export const adminRouter = Router();
adminRouter.use(requireAdmin);

// IMPORTANT: '/sync/current' must be registered BEFORE '/sync/:gw'.
// Express matches routes in registration order, so if the wildcard
// ':gw' route came first, a request to /sync/current would match IT
// instead, treating the literal word "current" as the gameweek number
// (Number("current") = NaN), which is exactly the bug that caused the
// "event/NaN/live" 404 you hit.

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

// Manually trigger a full sync + award recompute for a specific gameweek.
// Also runs automatically via the GitHub Actions scheduled workflow
// (see .github/workflows/refresh.yml).
adminRouter.post('/sync/:gw', asyncHandler(async (req, res) => {
  const gw = Number(req.params.gw);
  if (!Number.isInteger(gw) || gw < 1) {
    return res.status(400).json({ error: `Invalid gameweek: ${req.params.gw}` });
  }

  const settings = await query('SELECT value FROM league_settings WHERE key = $1', ['fpl_league_id']);
  const leagueId = settings.rows[0].value;

  const syncResult = await syncGameweek(leagueId, gw);
  const awardsResult = await recomputeGameweekAwards(gw);
  const h2hResult = await settleH2H(gw);

  res.json({ syncResult, awardsResult, h2hResult });
}));

adminRouter.post('/awards/quarterly/:quarter', asyncHandler(async (req, res) => {
  const result = await recomputeQuarterlyAwards(Number(req.params.quarter));
  res.json(result);
}));

adminRouter.post('/awards/monthly/:month', asyncHandler(async (req, res) => {
  const result = await recomputeMonthlyAward(Number(req.params.month));
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

// Upload/replace a flyer image for a gameweek's award. Body: { gameweek,
// award_type, image } where image is a base64 data URL from the browser.
adminRouter.put('/flyers', asyncHandler(async (req, res) => {
  const { gameweek, award_type, image } = req.body;
  if (!gameweek || !award_type || !image) {
    return res.status(400).json({ error: 'gameweek, award_type, and image are required' });
  }
  await query(
    `INSERT INTO award_flyers (gameweek, award_type, image_data) VALUES ($1,$2,$3)
     ON CONFLICT (gameweek, award_type) DO UPDATE SET image_data = $3, uploaded_at = now()`,
    [gameweek, award_type, image]
  );
  res.json({ ok: true });
}));

adminRouter.delete('/flyers/:gw/:awardType', asyncHandler(async (req, res) => {
  await query('DELETE FROM award_flyers WHERE gameweek = $1 AND award_type = $2', [req.params.gw, req.params.awardType]);
  res.json({ ok: true });
}));

// Full data export/backup — everything except flyer images (those are
// excluded to keep the download small; they're not critical to restore
// the league's numbers, just the decoration). Independent of the
// database itself, so useful as a safety net regardless of hosting.
adminRouter.get('/export', asyncHandler(async (_req, res) => {
  const [managers, gameweekStats, awards, h2hFixtures, settings] = await Promise.all([
    query('SELECT * FROM managers ORDER BY entry_id'),
    query('SELECT * FROM gameweek_stats ORDER BY gameweek, entry_id'),
    query('SELECT * FROM awards ORDER BY gameweek, quarter, month, award_type'),
    query('SELECT * FROM h2h_fixtures ORDER BY gameweek'),
    query('SELECT * FROM league_settings'),
  ]);
  res.json({
    exported_at: new Date().toISOString(),
    managers: managers.rows,
    gameweek_stats: gameweekStats.rows,
    awards: awards.rows,
    h2h_fixtures: h2hFixtures.rows,
    settings: settings.rows,
  });
}));
