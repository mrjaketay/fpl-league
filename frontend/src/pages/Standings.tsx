import { useEffect, useState } from 'react';
import { api } from '../api/client';

type Row = {
  entry_id: number;
  manager_name: string;
  team_name: string;
  total_points_after: number;
  overall_rank: number;
  last_gameweek: number;
};

function RankBadge({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'rank-badge--gold' : rank === 2 ? 'rank-badge--silver' : rank === 3 ? 'rank-badge--bronze' : 'rank-badge--plain';
  return <span className={`rank-badge ${cls}`}>{rank}</span>;
}

export default function Standings() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.standings().then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mono" style={{ color: 'var(--grey)' }}>Loading standings…</p>;
  if (error) return <p className="pill pill--pink">{error}</p>;

  if (rows.length === 0) {
    return (
      <div className="card card--hero" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No gameweeks synced yet</h2>
        <p style={{ color: 'var(--grey)', maxWidth: 420, margin: '0 auto' }}>
          Once the current gameweek kicks off, standings, awards, and every
          league stat will populate here automatically.
        </p>
      </div>
    );
  }

  const leader = rows[0];

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card card--hero" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="pill pill--green">League Leader</span>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>{leader.manager_name}</h2>
          <span style={{ color: 'var(--grey)' }}>{leader.team_name}</span>
        </div>
        <div className="stat-tile">
          <span className="label">Total Points</span>
          <span className="value">{leader.total_points_after}</span>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Manager</th>
              <th>Team</th>
              <th>Pts</th>
              <th>Global Rank</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.entry_id}>
                <td><RankBadge rank={i + 1} /></td>
                <td style={{ fontWeight: 600 }}>{r.manager_name}</td>
                <td style={{ color: 'var(--grey)' }}>{r.team_name}</td>
                <td className="num" style={{ color: 'var(--green)', fontWeight: 700 }}>{r.total_points_after}</td>
                <td className="num" style={{ color: 'var(--grey)' }}>{r.overall_rank?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
