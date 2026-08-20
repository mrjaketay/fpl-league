import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function H2H() {
  const [gw, setGw] = useState(1);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [table, setTable] = useState<any[]>([]);

  useEffect(() => {
    api.h2hGameweek(gw).then(setFixtures).catch(() => setFixtures([]));
  }, [gw]);

  useEffect(() => {
    api.h2hTable().then(setTable).catch(() => {});
  }, []);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Fixtures — GW</h2>
          <input
            type="number" min={1} max={38} value={gw}
            onChange={(e) => setGw(Number(e.target.value))}
            className="mono"
            style={{ width: 60, background: 'transparent', color: 'var(--chalk)', border: '1px solid var(--line)', borderRadius: 4, padding: '0.3rem 0.5rem' }}
          />
        </div>
        {fixtures.length === 0 && <p style={{ color: 'var(--chalk-dim)' }}>No fixtures generated yet — do that from Admin.</p>}
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {fixtures.map((f) => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '0.4rem' }}>
              <span style={{ fontWeight: f.winner_name === f.manager_1_name ? 700 : 400, color: f.winner_name === f.manager_1_name ? 'var(--amber)' : 'inherit' }}>{f.manager_1_name}</span>
              <span className="mono" style={{ color: 'var(--chalk-dim)' }}>vs</span>
              <span style={{ fontWeight: f.winner_name === f.manager_2_name ? 700 : 400, color: f.winner_name === f.manager_2_name ? 'var(--amber)' : 'inherit' }}>{f.manager_2_name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Season H2H Table</h2>
        <table>
          <thead><tr><th>Manager</th><th>Wins</th><th>Losses</th></tr></thead>
          <tbody>
            {table.map((t) => (
              <tr key={t.entry_id}>
                <td>{t.manager_name}</td>
                <td className="num">{t.wins}</td>
                <td className="num">{t.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
