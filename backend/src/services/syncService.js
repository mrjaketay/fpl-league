import { query } from '../db/pool.js';
import {
  fetchBootstrap,
  fetchLeagueStandings,
  fetchEntryPicks,
  fetchEventLive,
  fetchEntryHistory,
  currentEventId,
  positionOf,
} from './fplApi.js';

const CHIP_MAP = {
  '3xc': 'triple_captain',
  bboost: 'bench_boost',
  freehit: 'free_hit',
  wildcard: 'wildcard',
};

async function upsertManagers(standingsResults) {
  const currentEntryIds = standingsResults.map((r) => r.entry);

  for (const r of standingsResults) {
    await query(
      `INSERT INTO managers (entry_id, manager_name, team_name, active)
       VALUES ($1, $2, $3, true)
       ON CONFLICT (entry_id) DO UPDATE SET manager_name = $2, team_name = $3, active = true`,
      [r.entry, r.player_name, r.entry_name]
    );
  }

  // Anyone we've seen before who's no longer in the league's standings
  // (removed, left, or suspended) gets flagged inactive automatically —
  // this is what keeps my manager count and current-season standings
  // accurate without me needing to manually track who's still in.
  // Their history stays in the database untouched either way.
  if (currentEntryIds.length > 0) {
    await query(
      `UPDATE managers SET active = false
       WHERE active = true AND entry_id != ALL($1::int[])`,
      [currentEntryIds]
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
// Picks only show the XI as it was picked, so auto-subs and a vice-captain
// taking over get applied here to match what the FPL site counts.
function computePositionSums(picks, liveElements, bootstrap, autoSubs = []) {
  const sums = { gk_def: 0, mid: 0, fwd: 0 };
  const liveById = new Map(liveElements.map((e) => [e.id, e.stats]));
  const pointsOf = (id) => liveById.get(id)?.total_points || 0;
  const minutesOf = (id) => liveById.get(id)?.minutes || 0;

  const mult = new Map(picks.map((p) => [p.element, p.multiplier]));

  // auto-subs: the player who came off scores nothing, the one who came on counts once
  for (const sub of autoSubs) {
    mult.set(sub.element_out, 0);
    mult.set(sub.element_in, 1);
  }

  // captain didn't play but vice did: vice gets the captain's multiplier
  const cap = picks.find((p) => p.is_captain);
  const vice = picks.find((p) => p.is_vice_captain);
  if (cap && vice && minutesOf(cap.element) === 0 && minutesOf(vice.element) > 0 && (mult.get(cap.element) || 0) > 0) {
    mult.set(vice.element, mult.get(cap.element));
    mult.set(cap.element, 1);
  }

  for (const [element, m] of mult) {
    if (m <= 0) continue; // benched, didn't play
    const pos = positionOf(element, bootstrap); // 1 GK, 2 DEF, 3 MID, 4 FWD
    const pts = pointsOf(element) * m;
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
  const isCurrent = currentEventId(bootstrap) === gameweek;

  let synced = 0;
  const mismatches = [];
  for (const manager of results) {
    try {
      const picksData = await fetchEntryPicks(manager.entry, gameweek);
      const hist = picksData.entry_history;
      if (!hist) continue; // gameweek not played yet for this entry

      const captainPick = picksData.picks.find((p) => p.is_captain);
      const viceCaptainPick = picksData.picks.find((p) => p.is_vice_captain);
      const liveById = new Map(live.elements.map((e) => [e.id, e.stats.total_points]));
      const captainPoints = captainPick ? liveById.get(captainPick.element) ?? null : null;

      const posSums = computePositionSums(picksData.picks, live.elements, bootstrap, picksData.automatic_subs);

      // The gameweek score after any transfer hit = this week's running
      // total minus last week's. Worked out from the totals so it can't
      // depend on whether the "points" field already has the hit taken off.
      let prevTotal = null;
      try {
        const history = await fetchEntryHistory(manager.entry);
        const prev = history.current.find((e) => e.event === gameweek - 1);
        if (prev) prevTotal = prev.total_points;
      } catch {}
      if (prevTotal == null && gameweek === 1) prevTotal = 0;
      if (prevTotal == null) {
        const { rows: prevRows } = await query(
          'SELECT total_points_after FROM gameweek_stats WHERE entry_id = $1 AND gameweek = $2',
          [manager.entry, gameweek - 1]
        );
        prevTotal = prevRows[0]?.total_points_after ?? null;
      }
      const netPoints = prevTotal != null ? hist.total_points - prevTotal : hist.points - hist.event_transfers_cost;
      const rawPoints = netPoints + hist.event_transfers_cost;

      // for the current gameweek, FPL's own league table total should match ours
      if (isCurrent && manager.total != null && manager.total !== hist.total_points) {
        mismatches.push({ entry: manager.entry, ours: hist.total_points, league_table: manager.total });
      }

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
  return { gameweek, managersSynced: synced, mismatches };
}
