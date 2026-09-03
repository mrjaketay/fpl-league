import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import ManagerModal from '../components/ManagerModal';

type Row = {
  entry_id: number;
  manager_name: string;
  team_name: string;
  total_points_after: number;
  overall_rank: number;
  last_gameweek: number;
};

const SORTS: { key: string; label: string; fn: (a: Row, b: Row) => number }[] = [
  { key: 'points', label: 'Points (High → Low)', fn: (a, b) => b.total_points_after - a.total_points_after },
  { key: 'team', label: 'Team Name (A → Z)', fn: (a, b) => a.team_name.localeCompare(b.team_name) },
  { key: 'manager', label: 'Manager Name (A → Z)', fn: (a, b) => a.manager_name.localeCompare(b.manager_name) },
  { key: 'rank', label: 'Global Rank (Best → Worst)', fn: (a, b) => (a.overall_rank ?? Infinity) - (b.overall_rank ?? Infinity) },
];

function RankBadge({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'rank-badge--gold' : rank === 2 ? 'rank-badge--silver' : rank === 3 ? 'rank-badge--bronze' : 'rank-badge--plain';
  return <span className={`rank-badge ${cls}`}>{rank}</span>;
}

export default function Standings() {
  const [rows, setRows] = useState<Row[]>([]);
  const [longevity, setLongevity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [sortKey, setSortKey] = useState('points');

  useEffect(() => {
    api.standings().then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
    api.longevity().then(setLongevity).catch(() => {});
  }, []);

  const sortedRows = useMemo(() => {
    const sort = SORTS.find((s) => s.key === sortKey) ?? SORTS[0];
    return [...rows].sort(sort.fn);
  }, [rows, sortKey]);

  function openManager(row: Row) {
    const longevityRow = longevity.find((l) => l.entry_id === row.entry_id);
    setSelected({ ...row, ...longevityRow });
  }

  if (loading) return <p className="mono" style={{ color: 'var(--grey)' }}>Loading standings…</p>;
  if (error) return <p className="pill pill--pink">{error}</p>;

  if (rows.length === 0) {
    return (
      <div className="card card--hero fade-in" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
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
      <div className="card card--hero fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="pill pill--green">League Leader</span>
          <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>{leader.team_name}</h2>
          <span style={{ color: 'var(--grey)' }}>{leader.manager_name}</span>
        </div>
        <div className="stat-tile">
          <span className="label">Total Points</span>
          <span className="value">{leader.total_points_after}</span>
        </div>
      </div>

      <div className="card fade-in fade-in-1">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span className="field-label">Sort by</span>
          <select className="gw-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Team</th>
                <th>Manager</th>
                <th>Pts</th>
                <th>Global Rank</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r, i) => (
                <tr key={r.entry_id} className="row-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td><RankBadge rank={rows.indexOf(r) + 1} /></td>
                  <td>
                    <button onClick={() => openManager(r)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--white)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--line)' }}>
                      {r.team_name}
                    </button>
                  </td>
                  <td style={{ color: 'var(--grey)' }}>{r.manager_name}</td>
                  <td className="num" style={{ color: 'var(--green)', fontWeight: 700 }}>{r.total_points_after}</td>
                  <td className="num" style={{ color: 'var(--grey)' }}>{r.overall_rank?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <ManagerModal manager={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
