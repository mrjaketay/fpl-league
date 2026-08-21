import { query } from '../db/pool.js';
import {
  fetchBootstrap,
  fetchLeagueStandings,
  fetchEntryPicks,
  fetchEventLive,
  positionOf,
} from './fplApi.js';

const CHIP_MAP = {
  '3xc': 'triple_captain',
  bboost: 'bench_boost',
  freehit: 'free_hit',
  wildcard: 'wildcard',
};

async function upsertManagers(standingsResults) {
  for (const r of standingsResults) {
    await query(
      `INSERT INTO managers (entry_id, manager_name, team_name)
       VALUES ($1, $2, $3)
       ON CONFLICT (entry_id) DO UPDATE SET manager_name = $2, team_name = $3`,
      [r.entry, r.player_name, r.entry_name]
    );
  }
}

async function storeLeagueName(leagueInfo) {
  if (!leagueInfo?.name) return;
  await query(
    `INSERT INTO league_settings (key, value) VALUES ('league_name', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1`,
    [JSON.stringify(leagueInfo.name)]
  );
}

// Sums each starting-XI player's contribution (points * multiplier) into
// GK+DEF / MID / FWD buckets, using the live gameweek data for actual points.
function computePositionSums(picks, liveElements, bootstrap) {
  const sums = { gk_def: 0, mid: 0, fwd: 0 };
  const liveById = new Map(liveElements.map((e) => [e.id, e.stats.total_points]));

  for (const pick of picks) {
    if (pick.multiplier <= 0) continue; // benched, didn't play
    const pos = positionOf(pick.element, bootstrap); // 1 GK, 2 DEF, 3 MID, 4 FWD
    const pts = (liveById.get(pick.element) || 0) * pick.multiplier;
    if (pos === 1 || pos === 2) sums.gk_def += pts;
    else if (pos === 3) sums.mid += pts;
    else if (pos === 4) sums.fwd += pts;
  }
  return sums;
}

// Pulls picks + live data for every manager for one gameweek and stores
// a row per manager in gameweek_stats. Safe to re-run — upserts on conflict.
export async function syncGameweek(leagueId, gameweek) {
  const bootstrap = await fetchBootstrap();
  const { league, results } = await fetchLeagueStandings(leagueId);
  await upsertManagers(results);
  await storeLeagueName(league);

  const live = await fetchEventLive(gameweek);

  let synced = 0;
  for (const manager of results) {
    try {
      const picksData = await fetchEntryPicks(manager.entry, gameweek);
      const hist = picksData.entry_history;
      if (!hist) continue; // gameweek not played yet for this entry

      const captainPick = picksData.picks.find((p) => p.is_captain);
      const viceCaptainPick = picksData.picks.find((p) => p.is_vice_captain);
      const liveById = new Map(live.elements.map((e) => [e.id, e.stats.total_points]));
      const captainPoints = captainPick ? liveById.get(captainPick.element) ?? null : null;

      const posSums = computePositionSums(picksData.picks, live.elements, bootstrap);

      const netPoints = hist.points;
      const rawPoints = hist.points + hist.event_transfers_cost;

      await query(
        `INSERT INTO gameweek_stats (
           entry_id, gameweek, gw_points_net, gw_points_raw, transfers_cost,
           bench_points, captain_element_id, captain_points, vice_captain_element_id,
           chip_played, overall_rank, total_points_after, gk_def_points, mid_points, fwd_points
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (entry_id, gameweek) DO UPDATE SET
           gw_points_net = $3, gw_points_raw = $4, transfers_cost = $5,
           bench_points = $6, captain_element_id = $7, captain_points = $8,
           vice_captain_element_id = $9, chip_played = $10, overall_rank = $11,
           total_points_after = $12, gk_def_points = $13, mid_points = $14,
           fwd_points = $15, fetched_at = now()`,
        [
          manager.entry,
          gameweek,
          netPoints,
          rawPoints,
          hist.event_transfers_cost,
          hist.points_on_bench,
          captainPick?.element ?? null,
          captainPoints,
          viceCaptainPick?.element ?? null,
          CHIP_MAP[picksData.active_chip] ?? null,
          hist.overall_rank,
          hist.total_points,
          posSums.gk_def,
          posSums.mid,
          posSums.fwd,
        ]
      );
      synced += 1;
    } catch (err) {
      console.error(`Failed syncing entry ${manager.entry} GW${gameweek}:`, err.message);
    }
  }
  return { gameweek, managersSynced: synced };
}
