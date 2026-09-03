import { useEffect, useState } from 'react';
import { api } from '../api/client';
import GameweekSelect from '../components/GameweekSelect';

const CHIP_LABELS: Record<string, string> = {
  wildcard: 'Wildcard',
  free_hit: 'Free Hit',
  bench_boost: 'Bench Boost',
  triple_captain: 'Triple Captain',
};

const LEADERBOARDS: { key: string; label: string; emoji: string }[] = [
  { key: 'weeks_in_1st', label: 'Most Weeks at #1', emoji: '👑' },
  { key: 'weeks_in_top3', label: 'Most Weeks in Top 3', emoji: '📈' },
  { key: 'weeks_in_last', label: 'Most Weeks in Last', emoji: '📉' },
  { key: 'weeks_in_bottom3', label: 'Most Weeks in Bottom 3', emoji: '⚠️' },
  { key: 'motw_wins', label: 'Most Manager of the Week Wins', emoji: '🏆' },
  { key: 'dotw_wins', label: 'Most Donkey of the Week Wins', emoji: '🐴' },
];

export default function LeagueStats() {
  const [gw, setGw] = useState(1);
  const [captains, setCaptains] = useState<any[]>([]);
  const [chips, setChips] = useState<any[]>([]);
  const [longevity, setLongevity] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    api.captainStats(gw).then(setCaptains).catch((e) => setError(e.message));
  }, [gw]);

  useEffect(() => {
    api.chipStats().then(setChips).catch(() => {});
    api.longevity().then(setLongevity).catch(() => {});
  }, []);

  const totalCaptains = captains.reduce((sum, c) => sum + c.count, 0);

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="field-label">Gameweek</span>
        <GameweekSelect value={gw} onChange={setGw} />
      </div>

      <div className="card fade-in fade-in-1">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--grey)' }}>MOST CAPTAINED — GW{gw}</h3>
        {error && <p className="pill pill--pink">{error}</p>}
        {captains.length === 0 && !error && <p style={{ color: 'var(--grey)' }}>No captaincy data for this gameweek yet.</p>}
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {captains.map((c) => {
            const pct = totalCaptains ? Math.round((c.count / totalCaptains) * 100) : 0;
            return (
              <div key={c.element_id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600 }}>{c.web_name}</span>
                  <span className="mono" style={{ color: 'var(--grey)' }}>
                    {c.count} manager{c.count !== 1 ? 's' : ''} · {c.points ?? 0} pts · {pct}%
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div className="bar-fill" style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
                </div>
                <div style={{ color: 'var(--grey)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{c.managers.join(', ')}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card fade-in fade-in-2">
        <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem', color: 'var(--grey)' }}>LEAGUE LEADERBOARDS</h3>
        <p style={{ color: 'var(--grey)', fontSize: '0.8rem', marginBottom: '1rem' }}>
          "Weeks" here means total gameweeks spent in that spot across the season — not necessarily in a row.
        </p>
        <div className="two-col-even">
          {LEADERBOARDS.map(({ key, label, emoji }) => {
            const sorted = [...longevity].sort((a, b) => b[key] - a[key]);
            const top = sorted[0];
            if (!top || top[key] === 0) {
              return (
                <div key={key} className="stat-tile">
                  <span className="label">{emoji} {label}</span>
                  <span style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>Not enough data yet</span>
                </div>
              );
            }
            return (
              <div key={key} className="stat-tile">
                <span className="label">{emoji} {label}</span>
                <span className="value" style={{ fontSize: '1.1rem' }}>{top.team_name}</span>
                <span className="mono" style={{ color: 'var(--green)', fontSize: '0.85rem' }}>{top[key]} {key.includes('wins') ? 'wins' : 'weeks'}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card fade-in fade-in-3">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--grey)' }}>CHIP USAGE — SEASON</h3>
        {chips.length === 0 ? (
          <p style={{ color: 'var(--grey)' }}>No chips played yet this season.</p>
        ) : (
          <div className="table-scroll"><table>
            <thead><tr><th>GW</th><th>Manager</th><th>Chip</th></tr></thead>
            <tbody>
              {chips.map((c, i) => (
                <tr key={i}>
                  <td className="num">{c.gameweek}</td>
                  <td>{c.team_name} <span style={{ color: 'var(--grey)' }}>({c.manager_name})</span></td>
                  <td><span className="pill pill--cyan">{CHIP_LABELS[c.chip_played] ?? c.chip_played}</span></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
  );
}
