import { query } from '../db/pool.js';

// The underlying FPL league is a classic (points) league, so H2H fixtures
// don't exist natively — we generate a round robin ourselves and settle
// each fixture using that gameweek's net points, once synced.

// Standard circle method for round-robin scheduling.
function roundRobinRounds(entryIds) {
  const ids = [...entryIds];
  if (ids.length % 2 !== 0) ids.push(null); // bye if odd number of managers
  const n = ids.length;
  const rounds = [];
  const fixed = ids[0];
  let rest = ids.slice(1);

  for (let r = 0; r < n - 1; r++) {
    const round = [];
    const rotated = [fixed, ...rest];
    for (let i = 0; i < n / 2; i++) {
      const a = rotated[i];
      const b = rotated[n - 1 - i];
      if (a !== null && b !== null) round.push([a, b]);
    }
    rounds.push(round);
    rest.push(rest.shift());
  }
  return rounds;
}

// Generates fixtures starting at `startGameweek`, one round per gameweek,
// repeating the rotation if there are more gameweeks left than rounds.
export async function generateSeasonFixtures(startGameweek, totalGameweeks) {
  const { rows: managers } = await query('SELECT entry_id FROM managers WHERE active = true');
  const ids = managers.map((m) => m.entry_id);
  if (ids.length < 2) throw new Error('Need at least 2 managers to generate H2H fixtures');

  const rounds = roundRobinRounds(ids);
  let roundIndex = 0;

  for (let gw = startGameweek; gw <= totalGameweeks; gw++) {
    const round = rounds[roundIndex % rounds.length];
    for (const [a, b] of round) {
      await query(
        `INSERT INTO h2h_fixtures (gameweek, entry_id_1, entry_id_2)
         VALUES ($1,$2,$3)
         ON CONFLICT (gameweek, entry_id_1, entry_id_2) DO NOTHING`,
        [gw, a, b]
      );
    }
    roundIndex += 1;
  }
  return { fixturesGenerated: (totalGameweeks - startGameweek + 1) * rounds[0].length };
}

// Settles every fixture for a gameweek once gameweek_stats is populated.
export async function settleH2H(gameweek) {
  const { rows: fixtures } = await query('SELECT * FROM h2h_fixtures WHERE gameweek = $1', [gameweek]);
  let settled = 0;
  for (const f of fixtures) {
    const { rows } = await query(
      'SELECT entry_id, gw_points_net FROM gameweek_stats WHERE gameweek = $1 AND entry_id IN ($2,$3)',
      [gameweek, f.entry_id_1, f.entry_id_2]
    );
    if (rows.length < 2) continue; // one or both not synced yet
    const [p1, p2] = rows;
    const winner = p1.gw_points_net === p2.gw_points_net ? null : p1.gw_points_net > p2.gw_points_net ? p1.entry_id : p2.entry_id;
    await query('UPDATE h2h_fixtures SET winner_entry_id = $1 WHERE id = $2', [winner, f.id]);
    settled += 1;
  }
  return { gameweek, settled };
}
