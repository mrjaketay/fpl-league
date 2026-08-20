import { query } from '../db/pool.js';
import { fetchBootstrap, currentEventId, isEventFinished } from '../services/fplApi.js';
import { syncGameweek } from '../services/syncService.js';
import { recomputeGameweekAwards } from '../services/calculations.js';
import { settleH2H } from '../services/h2hService.js';

// Called by the /api/cron/refresh route, which is hit by a free GitHub
// Actions scheduled workflow every 30 minutes (see
// .github/workflows/refresh.yml) — this keeps the free Render web service
// from spinning down idle AND keeps data fresh, without paying for a
// Render Cron Job.
export async function refreshCurrentGameweek() {
  const bootstrap = await fetchBootstrap({ forceRefresh: true });
  const gw = currentEventId(bootstrap);
  if (!gw) return { skipped: true, reason: 'Could not determine current gameweek' };

  const settings = await query('SELECT value FROM league_settings WHERE key = $1', ['fpl_league_id']);
  const leagueId = settings.rows[0].value;

  const syncResult = await syncGameweek(leagueId, gw);
  const awardsResult = await recomputeGameweekAwards(gw);
  const h2hResult = await settleH2H(gw);

  return {
    gameweek: gw,
    status: isEventFinished(bootstrap, gw) ? 'finished' : 'live',
    syncResult,
    awardsResult,
    h2hResult,
  };
}
