import { query } from '../db/pool.js';

async function getSetting(key) {
  const { rows } = await query('SELECT value FROM league_settings WHERE key = $1', [key]);
  return rows[0]?.value;
}

async function replaceAwards(awardType, gameweek, rows) {
  await query('DELETE FROM awards WHERE award_type = $1 AND gameweek = $2', [awardType, gameweek]);
  for (const r of rows) {
    await query(
      `INSERT INTO awards (award_type, gameweek, entry_id, value, details)
       VALUES ($1,$2,$3,$4,$5)`,
      [awardType, gameweek, r.entry_id, r.value, r.details ?? null]
    );
  }
}

// Recomputes every weekly award for one gameweek. Safe to re-run any time
// after syncGameweek() — e.g. after bonus points finalize a day or two later.
export async function recomputeGameweekAwards(gameweek) {
  const { rows: stats } = await query(
    `SELECT gs.*, m.manager_name, m.team_name
     FROM gameweek_stats gs JOIN managers m ON m.entry_id = gs.entry_id
     WHERE gameweek = $1`,
    [gameweek]
  );
  if (stats.length === 0) return { gameweek, computed: 0 };

  const hofThreshold = Number((await getSetting('hall_of_fame_threshold')) ?? 100);

  // Manager of the Week — highest net score
  const topScore = Math.max(...stats.map((s) => s.gw_points_net));
  await replaceAwards(
    'manager_of_week',
    gameweek,
    stats
      .filter((s) => s.gw_points_net === topScore)
      .map((s) => ({ entry_id: s.entry_id, value: topScore }))
  );

  // Donkey of the Week — lowest net score (i.e. after transfer-hit deduction)
  const lowScore = Math.min(...stats.map((s) => s.gw_points_net));
  await replaceAwards(
    'donkey_of_week',
    gameweek,
    stats
      .filter((s) => s.gw_points_net === lowScore)
      .map((s) => ({
        entry_id: s.entry_id,
        value: lowScore,
        details: { raw_points: stats.find((x) => x.entry_id === s.entry_id).gw_points_raw },
      }))
  );

  // Hall of Fame — 100+ net points with no chip played
  await replaceAwards(
    'hall_of_fame',
    gameweek,
    stats
      .filter((s) => s.gw_points_net >= hofThreshold && !s.chip_played)
      .map((s) => ({ entry_id: s.entry_id, value: s.gw_points_net }))
  );

  // Captain's Curse — worst captain pick of the week (lowest raw captain points)
  const withCaptain = stats.filter((s) => s.captain_points !== null);
  if (withCaptain.length) {
    const worstCaptain = Math.min(...withCaptain.map((s) => s.captain_points));
    await replaceAwards(
      'captains_curse',
      gameweek,
      withCaptain
        .filter((s) => s.captain_points === worstCaptain)
        .map((s) => ({ entry_id: s.entry_id, value: worstCaptain }))
    );
  }

  // Bench Bandit — most points stranded on the bench
  const maxBench = Math.max(...stats.map((s) => s.bench_points));
  await replaceAwards(
    'bench_bandit',
    gameweek,
    stats
      .filter((s) => s.bench_points === maxBench)
      .map((s) => ({ entry_id: s.entry_id, value: maxBench }))
  );

  // Transfer Villain — took a hit AND ended with the worst net score among hitters
  const hitters = stats.filter((s) => s.transfers_cost > 0);
  if (hitters.length) {
    const worstHitterScore = Math.min(...hitters.map((s) => s.gw_points_net));
    await replaceAwards(
      'transfer_villain',
      gameweek,
      hitters
        .filter((s) => s.gw_points_net === worstHitterScore)
        .map((s) => ({
          entry_id: s.entry_id,
          value: worstHitterScore,
          details: { transfers_cost: stats.find((x) => x.entry_id === s.entry_id).transfers_cost },
        }))
    );
  }

  // The Wall / The Sieve — best & worst combined GK+defence points
  const maxDef = Math.max(...stats.map((s) => s.gk_def_points));
  const minDef = Math.min(...stats.map((s) => s.gk_def_points));
  await replaceAwards(
    'the_wall',
    gameweek,
    stats.filter((s) => s.gk_def_points === maxDef).map((s) => ({ entry_id: s.entry_id, value: maxDef }))
  );
  await replaceAwards(
    'the_sieve',
    gameweek,
    stats.filter((s) => s.gk_def_points === minDef).map((s) => ({ entry_id: s.entry_id, value: minDef }))
  );

  return { gameweek, computed: stats.length };
}

// Recomputes the quarterly Best Defense / Midfield / Attack awards for one
// quarter (1-4), summing position points across that quarter's gameweek range.
export async function recomputeQuarterlyAwards(quarter) {
  const boundaries = await getSetting('quarter_boundaries'); // e.g. [[1,9],[10,19],[20,28],[29,38]]
  const [from, to] = boundaries[quarter - 1];

  const { rows } = await query(
    `SELECT entry_id,
            SUM(gk_def_points) AS defense_total,
            SUM(mid_points) AS midfield_total,
            SUM(fwd_points) AS attack_total
     FROM gameweek_stats
     WHERE gameweek BETWEEN $1 AND $2
     GROUP BY entry_id`,
    [from, to]
  );
  if (rows.length === 0) return { quarter, computed: 0 };

  const categories = [
    { type: 'quarterly_defense', key: 'defense_total' },
    { type: 'quarterly_midfield', key: 'midfield_total' },
    { type: 'quarterly_attack', key: 'attack_total' },
  ];

  for (const { type, key } of categories) {
    await query('DELETE FROM awards WHERE award_type = $1 AND quarter = $2', [type, quarter]);
    const max = Math.max(...rows.map((r) => Number(r[key])));
    const winners = rows.filter((r) => Number(r[key]) === max);
    for (const w of winners) {
      await query(
        `INSERT INTO awards (award_type, quarter, entry_id, value)
         VALUES ($1,$2,$3,$4)`,
        [type, quarter, w.entry_id, max]
      );
    }
  }

  return { quarter, from, to, computed: rows.length };
}
