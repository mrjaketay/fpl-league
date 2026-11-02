import { query } from '../db/pool.js';
import { fetchBootstrap, currentEventId, isEventFinished } from '../services/fplApi.js';
import { syncGameweek } from '../services/syncService.js';
import { recomputeGameweekAwards, recomputeMonthlyAward, recomputeQuarterlyAwards } from '../services/calculations.js';
import { settleH2H } from '../services/h2hService.js';

// A gameweek counts as over once FPL has marked it finished AND the
// bonus points are confirmed (data_checked).
function isGwOver(bootstrap, gw) {
  const ev = bootstrap.events.find((e) => e.id === gw);
  return !!ev?.finished && !!ev?.data_checked;
}

// Locks in Manager of the Month and the quarterly winners once the last
// gameweek of that month/quarter is over. Only does it for ones that
// aren't locked yet, so anything I've locked by hand stays as it is.
async function lockFinishedAwards(bootstrap, leagueId) {
  const getSetting = async (key) => (await query('SELECT value FROM league_settings WHERE key = $1', [key])).rows[0]?.value;
  const locked = [];

  const months = (await getSetting('month_mapping')) || [];
  for (let i = 0; i < months.length; i++) {
    const [, , to] = months[i];
    if (!isGwOver(bootstrap, to)) continue;
    const { rows } = await query("SELECT 1 FROM awards WHERE award_type = 'manager_of_month' AND month = $1 LIMIT 1", [i + 1]);
    if (rows.length) continue;
    await syncGameweek(leagueId, to); // pick up the final numbers for the last week
    const r = await recomputeMonthlyAward(i + 1);
    if (r.computed > 0) locked.push(`month ${i + 1}`);
  }

  const quarters = (await getSetting('quarter_boundaries')) || [];
  for (let i = 0; i < quarters.length; i++) {
    const to = quarters[i][1];
    if (!isGwOver(bootstrap, to)) continue;
    const { rows } = await query("SELECT 1 FROM awards WHERE award_type LIKE 'quarterly_%' AND quarter = $1 LIMIT 1", [i + 1]);
    if (rows.length) continue;
    await syncGameweek(leagueId, to);
    const r = await recomputeQuarterlyAwards(i + 1);
    if (r.computed > 0) locked.push(`quarter ${i + 1}`);
  }

  return locked;
}

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

  // a failure here shouldn't break the normal refresh
  let lockedAwards = [];
  try {
    lockedAwards = await lockFinishedAwards(bootstrap, leagueId);
  } catch (err) {
    console.error('[refresh] auto lock-in failed:', err);
  }

  return {
    gameweek: gw,
    lockedAwards,
    status: isEventFinished(bootstrap, gw) ? 'finished' : 'live',
    syncResult,
    awardsResult,
    h2hResult,
  };
}
