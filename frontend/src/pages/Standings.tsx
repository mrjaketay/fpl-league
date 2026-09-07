import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import ManagerModal from '../components/ManagerModal';
import AwardIcon from '../components/AwardIcon';
import GraffitiTrophy from '../components/GraffitiTrophy';
import GameweekSelect from '../components/GameweekSelect';

type Row = {
  entry_id: number;
  manager_name: string;
  team_name: string;
  total_points_after: number;
  last_gameweek: number;
  gw_points: number;
  rank_change: number | null;
};

const SORTS: { key: string; label: string; fn: (a: Row, b: Row) => number }[] = [
  { key: 'overall', label: 'Overall', fn: (a, b) => b.total_points_after - a.total_points_after },
  { key: 'gw', label: 'Current Gameweek', fn: (a, b) => b.gw_points - a.gw_points },
];

const AWARD_ICON_MAP: Record<string, { kind: 'motw' | 'dotw' | 'defense' | 'midfield' | 'attack'; title: string }> = {
  manager_of_week: { kind: 'motw', title: 'Manager of the Week' },
  donkey_of_week: { kind: 'dotw', title: 'Donkey of the Week' },
  the_wall: { kind: 'defense', title: 'Best Defense' },
  midfield_king: { kind: 'midfield', title: 'Best Midfield' },
  attack_king: { kind: 'attack', title: 'Best Attack' },
};

function RankBadge({ rank }: { rank: number }) {
  const cls = rank === 1 ? 'rank-badge--gold' : rank === 2 ? 'rank-badge--silver' : rank === 3 ? 'rank-badge--bronze' : 'rank-badge--plain';
  return <span className={`rank-badge ${cls}`}>{rank}</span>;
}

function RankArrow({ change }: { change: number | null }) {
  if (change == null || change === 0) return null;
  return change > 0
    ? <span className="rank-arrow rank-arrow--up">▲</span>
    : <span className="rank-arrow rank-arrow--down">▼</span>;
}

export default function Standings() {
  const [latestGw, setLatestGw] = useState<number | null>(null);
  const [viewGw, setViewGw] = useState<number | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [longevity, setLongevity] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [sortKey, setSortKey] = useState('overall');

  useEffect(() => {
    api.latestGameweek().then((d) => {
      setLatestGw(d.latest);
      setViewGw(d.latest);
    }).catch(() => {});
    api.longevity().then(setLongevity).catch(() => {});
  }, []);

  useEffect(() => {
    if (!viewGw) return;
    setLoading(true);
    api.standings(viewGw).then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
    api.gameweekAwards(viewGw).then(setAwards).catch(() => {});
  }, [viewGw]);

  const sortedRows = useMemo(() => {
    const sort = SORTS.find((s) => s.key === sortKey) ?? SORTS[0];
    return [...rows].sort(sort.fn);
  }, [rows, sortKey]);

  function awardsFor(entryId: number) {
    return awards.filter((a) => a.entry_id === entryId && AWARD_ICON_MAP[a.award_type]);
  }

  function openManager(row: Row) {
    const longevityRow = longevity.find((l) => l.entry_id === row.entry_id);
    setSelected({ ...row, ...longevityRow });
  }

  if (loading && rows.length === 0) return <p className="mono" style={{ color: 'var(--grey)' }}>Loading standings…</p>;
  if (error) return <p className="pill pill--pink">{error}</p>;

  if (!latestGw) {
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
  const usedAwardTypes = Array.from(new Set(awards.map((a) => a.award_type))).filter((t) => AWARD_ICON_MAP[t]);

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="field-label">Viewing standings for</span>
        <GameweekSelect value={viewGw ?? 1} onChange={setViewGw} max={latestGw} />
        {viewGw !== latestGw && <span className="pill pill--outline">Historical view</span>}
      </div>

      {leader && (
        <div className="card card--hero fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <GraffitiTrophy size={58} />
            <div>
              <span className="pill pill--green">League Leader</span>
              <h2 style={{ fontSize: '1.4rem', marginTop: '0.5rem' }}>{leader.team_name}</h2>
              <span style={{ color: 'var(--grey)' }}>{leader.manager_name}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="stat-tile">
              <span className="label">Total Points</span>
              <span className="value">{leader.total_points_after}</span>
            </div>
            <div className="stat-tile">
              <span className="label">GW{leader.last_gameweek} Points</span>
              <span className="value">{leader.gw_points}</span>
            </div>
          </div>
        </div>
      )}

      {usedAwardTypes.length > 0 && (
        <div className="card fade-in legend-strip">
          <span style={{ color: 'var(--white)', fontWeight: 700, fontSize: '0.78rem' }}>THIS WEEK'S AWARDS:</span>
          {usedAwardTypes.map((type) => (
            <span key={type} className="legend-item">
              <AwardIcon kind={AWARD_ICON_MAP[type].kind} size={18} />
              {AWARD_ICON_MAP[type].title}
            </span>
          ))}
          <span className="legend-item"><span className="rank-arrow rank-arrow--up">▲</span> Rank up</span>
          <span className="legend-item"><span className="rank-arrow rank-arrow--down">▼</span> Rank down</span>
        </div>
      )}

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
                <th>GW Pts</th>
                <th>Total Pts</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((r, i) => (
                <tr key={r.entry_id} className="row-in" style={{ animationDelay: `${i * 0.03}s` }}>
                  <td><RankBadge rank={rows.indexOf(r) + 1} /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button onClick={() => openManager(r)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--white)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--line)' }}>
                        {r.team_name}
                      </button>
                      <span className="award-badge-row">
                        {awardsFor(r.entry_id).map((a, j) => (
                          <span key={j} className="award-badge" title={AWARD_ICON_MAP[a.award_type].title}>
                            <AwardIcon kind={AWARD_ICON_MAP[a.award_type].kind} size={14} />
                          </span>
                        ))}
                      </span>
                      <RankArrow change={r.rank_change} />
                    </div>
                  </td>
                  <td style={{ color: 'var(--grey)' }}>{r.manager_name}</td>
                  <td className="num">{r.gw_points}</td>
                  <td className="num" style={{ color: 'var(--green)', fontWeight: 700 }}>{r.total_points_after}</td>
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
