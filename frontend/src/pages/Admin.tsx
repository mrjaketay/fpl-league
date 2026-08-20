import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, isLoggedIn, clearToken } from '../api/client';

export default function Admin() {
  const [log, setLog] = useState<string[]>([]);
  const [gw, setGw] = useState(1);
  const [startGw, setStartGw] = useState(1);
  const [totalGw, setTotalGw] = useState(38);

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
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Sync Data</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => run('Sync current gameweek', api.syncCurrent)} style={btnStyle}>Sync Current GW</button>
          <input type="number" value={gw} onChange={(e) => setGw(Number(e.target.value))} className="mono" style={inputStyle} />
          <button onClick={() => run(`Sync GW${gw}`, () => api.syncGameweek(gw))} style={btnStyle}>Sync This GW</button>
        </div>
        <p style={{ color: 'var(--chalk-dim)', fontSize: '0.85rem', marginTop: '0.75rem' }}>
          This also runs automatically every 30 minutes via the Render Cron Job — use this to force a refresh right after a gameweek finishes.
        </p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Generate H2H Fixtures (run once, at season start)</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="mono">From GW</label>
          <input type="number" value={startGw} onChange={(e) => setStartGw(Number(e.target.value))} className="mono" style={inputStyle} />
          <label className="mono">To GW</label>
          <input type="number" value={totalGw} onChange={(e) => setTotalGw(Number(e.target.value))} className="mono" style={inputStyle} />
          <button onClick={() => run('Generate H2H fixtures', () => api.generateH2H(startGw, totalGw))} style={btnStyle}>Generate</button>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Quarterly Challenge Recompute</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map((q) => (
            <button key={q} onClick={() => run(`Recompute Q${q}`, () => api.recomputeQuarterly(q))} style={btnStyle}>Q{q}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Activity Log</h2>
        <div className="mono" style={{ fontSize: '0.8rem', display: 'grid', gap: '0.3rem', maxHeight: 240, overflowY: 'auto' }}>
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>

      <button onClick={() => { clearToken(); window.location.href = '/'; }} style={{ ...btnStyle, background: 'transparent', border: '1px solid var(--line)', color: 'var(--chalk)' }}>
        Log out
      </button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'var(--amber)', border: 'none', borderRadius: 4, padding: '0.5rem 0.9rem',
  fontFamily: 'var(--font-mono)', cursor: 'pointer', fontSize: '0.85rem',
};
const inputStyle: React.CSSProperties = {
  width: 60, background: 'transparent', color: 'var(--chalk)', border: '1px solid var(--line)', borderRadius: 4, padding: '0.4rem 0.5rem',
};
