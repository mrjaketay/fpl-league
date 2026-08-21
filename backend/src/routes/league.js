import { Router } from 'express';
import { query } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { fetchBootstrap } from '../services/fplApi.js';

export const leagueRouter = Router();

// Season standings, derived from the latest gameweek's cumulative total.
leagueRouter.get('/standings', asyncHandler(async (_req, res) => {
  const { rows } = await query(`
    SELECT DISTINCT ON (gs.entry_id)
      m.entry_id, m.manager_name, m.team_name,
      gs.total_points_after, gs.overall_rank, gs.gameweek AS last_gameweek
    FROM gameweek_stats gs
    JOIN managers m ON m.entry_id = gs.entry_id
    ORDER BY gs.entry_id, gs.gameweek DESC
  `);
  rows.sort((a, b) => b.total_points_after - a.total_points_after);
  res.json(rows);
}));

// Form table — last 4 gameweeks only.
leagueRouter.get('/form', asyncHandler(async (_req, res) => {
  const { rows } = await query(`
    SELECT entry_id, MAX(gameweek) AS through_gw
    FROM gameweek_stats GROUP BY entry_id LIMIT 1
  `);
  const latestGw = rows[0]?.through_gw ?? 0;
  const from = Math.max(1, latestGw - 3);
  const { rows: form } = await query(
    `SELECT m.entry_id, m.manager_name, m.team_name, SUM(gs.gw_points_net) AS form_points
     FROM gameweek_stats gs JOIN managers m ON m.entry_id = gs.entry_id
     WHERE gs.gameweek BETWEEN $1 AND $2
     GROUP BY m.entry_id, m.manager_name, m.team_name
     ORDER BY form_points DESC`,
    [from, latestGw]
  );
  res.json({ from, to: latestGw, table: form });
}));

// All raw gameweek stats for one gameweek (used for admin review / debugging).
leagueRouter.get('/gameweek/:gw', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT gs.*, m.manager_name, m.team_name
     FROM gameweek_stats gs JOIN managers m ON m.entry_id = gs.entry_id
     WHERE gameweek = $1 ORDER BY gw_points_net DESC`,
    [req.params.gw]
  );
  res.json(rows);
}));

// Awards for a specific gameweek (Manager of the Week, Donkey of the Week, etc.)
leagueRouter.get('/awards/gameweek/:gw', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT a.*, m.manager_name, m.team_name
     FROM awards a JOIN managers m ON m.entry_id = a.entry_id
     WHERE gameweek = $1 ORDER BY award_type`,
    [req.params.gw]
  );
  res.json(rows);
}));

// Season-long tally of how many times each manager has won each award —
// good for a "trophy cabinet" view.
leagueRouter.get('/awards/season-tally', asyncHandler(async (_req, res) => {
  const { rows } = await query(`
    SELECT m.entry_id, m.manager_name, m.team_name, a.award_type, COUNT(*) AS wins
    FROM awards a JOIN managers m ON m.entry_id = a.entry_id
    WHERE a.gameweek IS NOT NULL
    GROUP BY m.entry_id, m.manager_name, m.team_name, a.award_type
    ORDER BY wins DESC
  `);
  res.json(rows);
}));

// Quarterly challenge results.
leagueRouter.get('/awards/quarterly/:quarter', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT a.*, m.manager_name, m.team_name
     FROM awards a JOIN managers m ON m.entry_id = a.entry_id
     WHERE quarter = $1 AND award_type LIKE 'quarterly_%'`,
    [req.params.quarter]
  );
  res.json(rows);
}));

// H2H fixtures + results for a gameweek.
leagueRouter.get('/h2h/gameweek/:gw', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT f.*, m1.manager_name AS manager_1_name, m2.manager_name AS manager_2_name,
            w.manager_name AS winner_name
     FROM h2h_fixtures f
     JOIN managers m1 ON m1.entry_id = f.entry_id_1
     JOIN managers m2 ON m2.entry_id = f.entry_id_2
     LEFT JOIN managers w ON w.entry_id = f.winner_entry_id
     WHERE gameweek = $1`,
    [req.params.gw]
  );
  res.json(rows);
}));

// H2H season table — wins, draws, losses per manager. Only counts fixtures
// that have been settled (i.e. that gameweek's stats have been synced).
leagueRouter.get('/h2h/table', asyncHandler(async (_req, res) => {
  const { rows } = await query(`
    WITH involved AS (
      SELECT entry_id_1 AS entry_id, winner_entry_id, entry_id_1, entry_id_2 FROM h2h_fixtures
      WHERE winner_entry_id IS NOT NULL OR entry_id_1 IS NOT NULL
      UNION ALL
      SELECT entry_id_2 AS entry_id, winner_entry_id, entry_id_1, entry_id_2 FROM h2h_fixtures
    )
    SELECT m.entry_id, m.manager_name, m.team_name,
      COUNT(*) FILTER (WHERE i.winner_entry_id = m.entry_id) AS wins,
      COUNT(*) FILTER (WHERE i.winner_entry_id IS NOT NULL AND i.winner_entry_id != m.entry_id) AS losses
    FROM managers m
    LEFT JOIN involved i ON i.entry_id = m.entry_id
    GROUP BY m.entry_id, m.manager_name, m.team_name
    ORDER BY wins DESC
  `);
  res.json(rows);
}));

// League name + basic info, for display in the header.
leagueRouter.get('/info', asyncHandler(async (_req, res) => {
  const { rows } = await query("SELECT value FROM league_settings WHERE key = 'league_name'");
  const { rows: managerCount } = await query('SELECT COUNT(*) FROM managers WHERE active = true');
  res.json({
    name: rows[0]?.value ?? 'My Mini League',
    managerCount: Number(managerCount[0].count),
  });
}));

// Most-captained players for a given gameweek — who the league backed,
// and how it paid off for them.
leagueRouter.get('/stats/captains/:gw', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT gs.captain_element_id, gs.captain_points, m.manager_name
     FROM gameweek_stats gs JOIN managers m ON m.entry_id = gs.entry_id
     WHERE gameweek = $1 AND captain_element_id IS NOT NULL`,
    [req.params.gw]
  );
  if (rows.length === 0) return res.json([]);

  const bootstrap = await fetchBootstrap();
  const byPlayer = new Map();
  for (const r of rows) {
    const player = bootstrap.elements.find((e) => e.id === r.captain_element_id);
    const key = r.captain_element_id;
    if (!byPlayer.has(key)) {
      byPlayer.set(key, {
        element_id: key,
        player_name: player ? `${player.first_name} ${player.second_name}`.trim() : `Player #${key}`,
        web_name: player?.web_name ?? `#${key}`,
        points: r.captain_points,
        count: 0,
        managers: [],
      });
    }
    const entry = byPlayer.get(key);
    entry.count += 1;
    entry.managers.push(r.manager_name);
  }
  const result = Array.from(byPlayer.values()).sort((a, b) => b.count - a.count);
  res.json(result);
}));

// Chip usage across the league — who's played what, and when.
leagueRouter.get('/stats/chips', asyncHandler(async (_req, res) => {
  const { rows } = await query(
    `SELECT gs.gameweek, gs.chip_played, m.manager_name, m.team_name
     FROM gameweek_stats gs JOIN managers m ON m.entry_id = gs.entry_id
     WHERE chip_played IS NOT NULL
     ORDER BY gs.gameweek ASC`
  );
  res.json(rows);
}));
