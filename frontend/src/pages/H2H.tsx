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
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span className="mono" style={{ color: 'var(--grey)', fontSize: '0.8rem' }}>GAMEWEEK</span>
          <input type="number" min={1} max={38} value={gw} onChange={(e) => setGw(Number(e.target.value))} style={{ width: 64 }} />
        </div>
        {fixtures.length === 0 && (
          <p style={{ color: 'var(--grey)' }}>No fixtures yet — generate them once from Admin.</p>
        )}
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {fixtures.map((f) => {
            const w1 = f.winner_name === f.manager_1_name;
            const w2 = f.winner_name === f.manager_2_name;
            return (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                <span style={{ fontWeight: w1 ? 700 : 400, color: w1 ? 'var(--green)' : 'var(--white)', flex: 1 }}>{f.manager_1_name}</span>
                <span className="pill pill--outline">VS</span>
                <span style={{ fontWeight: w2 ? 700 : 400, color: w2 ? 'var(--green)' : 'var(--white)', flex: 1, textAlign: 'right' }}>{f.manager_2_name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--grey)' }}>SEASON H2H TABLE</h3>
        <table>
          <thead><tr><th>Manager</th><th>Wins</th><th>Losses</th></tr></thead>
          <tbody>
            {table.map((t) => (
              <tr key={t.entry_id}>
                <td>{t.manager_name}</td>
                <td className="num" style={{ color: 'var(--green)' }}>{t.wins}</td>
                <td className="num" style={{ color: 'var(--pink)' }}>{t.losses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
