import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, isLoggedIn, clearToken } from '../api/client';

export default function Admin() {
  const [log, setLog] = useState<string[]>([]);
  const [gw, setGw] = useState(1);
  const [startGw, setStartGw] = useState(1);
  const [totalGw, setTotalGw] = useState(38);
  const [hofThreshold, setHofThreshold] = useState('100');
  const [quarterBoundaries, setQuarterBoundaries] = useState('[[1,9],[10,19],[20,29],[30,38]]');

  useEffect(() => {
    if (!isLoggedIn()) return;
    api.getSettings().then((rows: any[]) => {
      const hof = rows.find((r) => r.key === 'hall_of_fame_threshold');
      const qb = rows.find((r) => r.key === 'quarter_boundaries');
      if (hof) setHofThreshold(String(hof.value));
      if (qb) setQuarterBoundaries(JSON.stringify(qb.value));
    }).catch(() => {});
  }, []);

  if (!isLoggedIn()) return <Navigate to="/login" />;

  function appendLog(msg: string) {
    setLog((l) => [`${new Date().toLocaleTimeString()} — ${msg}`, ...l]);
  }

  async function run(label: string, fn: () => Promise<any>) {
    appendLog(`${label}…`);
    try {
      const result = await fn();
      appendLog(`✓ ${label}: ${JSON.stringify(result)}`);
    } catch (err: any) {
      appendLog(`✗ ${label} failed: ${err.message}`);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Sync Data</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn--primary" onClick={() => run('Sync current gameweek', api.syncCurrent)}>Sync Current GW</button>
          <input type="number" value={gw} onChange={(e) => setGw(Number(e.target.value))} style={{ width: 64 }} />
          <button className="btn btn--ghost" onClick={() => run(`Sync GW${gw}`, () => api.syncGameweek(gw))}>Sync This GW</button>
        </div>
        <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
          Also runs automatically every 30 minutes via a free GitHub Actions workflow — use this button to force a refresh right after a gameweek finishes.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Generate H2H Fixtures <span style={{ color: 'var(--grey)', fontWeight: 400, fontSize: '0.85rem' }}>(run once, at season start)</span></h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="mono" style={{ fontSize: '0.8rem', color: 'var(--grey)' }}>From GW</label>
          <input type="number" value={startGw} onChange={(e) => setStartGw(Number(e.target.value))} style={{ width: 64 }} />
          <label className="mono" style={{ fontSize: '0.8rem', color: 'var(--grey)' }}>To GW</label>
          <input type="number" value={totalGw} onChange={(e) => setTotalGw(Number(e.target.value))} style={{ width: 64 }} />
          <button className="btn btn--primary" onClick={() => run('Generate H2H fixtures', () => api.generateH2H(startGw, totalGw))}>Generate</button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.5rem' }}>Quarterly Challenges</h2>
        <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Best Defense / Midfield / Attack, one winner per quarter. Run this once each quarter ends (currently set to GW 9, 19, 29, and 38 — adjust below if needed).
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4].map((q) => (
            <button key={q} className="btn btn--ghost" onClick={() => run(`Recompute Q${q}`, () => api.recomputeQuarterly(q))}>Lock in Q{q}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>League Settings</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--grey)', display: 'block', marginBottom: '0.35rem' }}>HALL OF FAME THRESHOLD (points)</label>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input value={hofThreshold} onChange={(e) => setHofThreshold(e.target.value)} style={{ width: 100 }} />
              <button className="btn btn--ghost" onClick={() => run('Update HoF threshold', () => api.updateSetting('hall_of_fame_threshold', Number(hofThreshold)))}>Save</button>
            </div>
          </div>
          <div>
            <label className="mono" style={{ fontSize: '0.75rem', color: 'var(--grey)', display: 'block', marginBottom: '0.35rem' }}>
              QUARTER BOUNDARIES (JSON: [[fromGW,toGW], ...] × 4)
            </label>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <input value={quarterBoundaries} onChange={(e) => setQuarterBoundaries(e.target.value)} style={{ flex: 1, fontSize: '0.8rem' }} />
              <button className="btn btn--ghost" onClick={() => run('Update quarter boundaries', () => {
                let parsed;
                try { parsed = JSON.parse(quarterBoundaries); } catch { throw new Error('Invalid JSON'); }
                return api.updateSetting('quarter_boundaries', parsed);
              })}>Save</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Activity Log</h2>
        <div className="mono" style={{ fontSize: '0.78rem', display: 'grid', gap: '0.3rem', maxHeight: 260, overflowY: 'auto', color: 'var(--grey)' }}>
          {log.length === 0 && <span>Nothing run yet this session.</span>}
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      <button className="btn btn--ghost" onClick={() => { clearToken(); window.location.href = '/'; }}>Log out</button>
    </div>
  );
}
