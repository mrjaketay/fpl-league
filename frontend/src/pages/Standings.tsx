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

export default function Standings() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.standings().then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="mono">Loading standings…</p>;
  if (error) return <p className="mono pill pill--red">{error}</p>;
  if (rows.length === 0) {
    return (
      <div className="card">
        <p>No gameweeks synced yet. Head to Admin and run a sync once GW1 data is live.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Manager</th>
            <th>Team</th>
            <th>Pts</th>
            <th>Global Rank</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.entry_id}>
              <td className="num">{i + 1}</td>
              <td>{r.manager_name}</td>
              <td style={{ color: 'var(--chalk-dim)' }}>{r.team_name}</td>
              <td className="num" style={{ color: 'var(--amber)' }}>{r.total_points_after}</td>
              <td className="num">{r.overall_rank?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
