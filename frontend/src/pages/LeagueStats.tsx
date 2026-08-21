import { useEffect, useState } from 'react';
import { api } from '../api/client';

const CHIP_LABELS: Record<string, string> = {
  wildcard: 'Wildcard',
  free_hit: 'Free Hit',
  bench_boost: 'Bench Boost',
  triple_captain: 'Triple Captain',
};

export default function LeagueStats() {
  const [gw, setGw] = useState(1);
  const [captains, setCaptains] = useState<any[]>([]);
  const [chips, setChips] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    api.captainStats(gw).then(setCaptains).catch((e) => setError(e.message));
  }, [gw]);

  useEffect(() => {
    api.chipStats().then(setChips).catch(() => {});
  }, []);

  const totalCaptains = captains.reduce((sum, c) => sum + c.count, 0);

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="mono" style={{ color: 'var(--grey)', fontSize: '0.8rem' }}>GAMEWEEK</span>
        <input type="number" min={1} max={38} value={gw} onChange={(e) => setGw(Number(e.target.value))} style={{ width: 64 }} />
      </div>

      <div className="card">
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
                    {c.count} manager{c.count !== 1 ? 's' : ''} · {c.points ?? 0} pts {pct}%
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--green), var(--cyan))' }} />
                </div>
                <div style={{ color: 'var(--grey)', fontSize: '0.8rem', marginTop: '0.3rem' }}>{c.managers.join(', ')}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--grey)' }}>CHIP USAGE — SEASON</h3>
        {chips.length === 0 ? (
          <p style={{ color: 'var(--grey)' }}>No chips played yet this season.</p>
        ) : (
          <table>
            <thead><tr><th>GW</th><th>Manager</th><th>Chip</th></tr></thead>
            <tbody>
              {chips.map((c, i) => (
                <tr key={i}>
                  <td className="num">{c.gameweek}</td>
                  <td>{c.manager_name} <span style={{ color: 'var(--grey)' }}>({c.team_name})</span></td>
                  <td><span className="pill pill--cyan">{CHIP_LABELS[c.chip_played] ?? c.chip_played}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
