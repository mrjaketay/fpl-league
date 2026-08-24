import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, isLoggedIn, clearToken } from '../api/client';
import GameweekSelect from '../components/GameweekSelect';

type QuarterRange = [number, number];

export default function Admin() {
  const [log, setLog] = useState<string[]>([]);
  const [gw, setGw] = useState(1);
  const [startGw, setStartGw] = useState(1);
  const [totalGw, setTotalGw] = useState(38);
  const [hofThreshold, setHofThreshold] = useState('100');
  const [quarters, setQuarters] = useState<QuarterRange[]>([[1, 9], [10, 19], [20, 29], [30, 38]]);

  useEffect(() => {
    if (!isLoggedIn()) return;
    api.getSettings().then((rows: any[]) => {
      const hof = rows.find((r) => r.key === 'hall_of_fame_threshold');
      const qb = rows.find((r) => r.key === 'quarter_boundaries');
      if (hof) setHofThreshold(String(hof.value));
      if (qb) setQuarters(qb.value);
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

  function updateQuarter(index: number, side: 0 | 1, value: number) {
    setQuarters((qs) => qs.map((q, i) => (i === index ? ([side === 0 ? value : q[0], side === 1 ? value : q[1]] as QuarterRange) : q)));
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card fade-in">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Sync Data</h2>
        <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Pulls the latest picks and points from FPL for a gameweek and recomputes every award. This already
          happens automatically every 30 minutes — use these buttons to force it right now.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn--primary" onClick={() => run('Sync current gameweek', api.syncCurrent)}>Sync Current GW</button>
          <span style={{ color: 'var(--grey)' }}>or</span>
          <GameweekSelect value={gw} onChange={setGw} />
          <button className="btn btn--ghost" onClick={() => run(`Sync GW${gw}`, () => api.syncGameweek(gw))}>Sync This GW</button>
        </div>
      </div>

      <div className="card fade-in fade-in-1">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Generate H2H Fixtures</h2>
        <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Builds the head-to-head schedule for the season — every manager gets a fixture most weeks, round-robin
          style. <strong>Run this once</strong>, right now, covering the full season — running it again later
          would create duplicate fixtures for weeks you've already generated.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="field-label">From</span>
          <GameweekSelect value={startGw} onChange={setStartGw} />
          <span className="field-label">To</span>
          <GameweekSelect value={totalGw} onChange={setTotalGw} />
          <button className="btn btn--primary" onClick={() => run('Generate H2H fixtures', () => api.generateH2H(startGw, totalGw))}>Generate</button>
        </div>
      </div>

      <div className="card fade-in fade-in-2">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Quarterly Challenges</h2>
        <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Best Defense, Midfield, and Attack — one winner in each, per quarter. This can't be automatic, because
          nothing tells the system "the quarter is over" on its own — <strong>you decide that</strong> by clicking
          the button below once a quarter's last gameweek has been synced. It sums up everyone's defensive
          /midfield/attacking points across that quarter's gameweek range and locks in the winners. The current
          gameweek ranges are set in League Settings below.
        </p>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {quarters.map((q, i) => (
            <button key={i} className="btn btn--ghost" onClick={() => run(`Lock in Q${i + 1} (GW${q[0]}–${q[1]})`, () => api.recomputeQuarterly(i + 1))}>
              Lock in Q{i + 1} <span style={{ color: 'var(--grey)', fontWeight: 400 }}>(GW{q[0]}–{q[1]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card fade-in fade-in-3">
        <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>League Settings</h2>
        <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          These control the rules behind the awards above.
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Hall of Fame Threshold</span>
          <p style={{ color: 'var(--grey)', fontSize: '0.8rem', marginBottom: '0.6rem' }}>
            Minimum gameweek points (with no chip played) to earn a Hall of Fame entry.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <input value={hofThreshold} onChange={(e) => setHofThreshold(e.target.value)} style={{ width: 90 }} />
            <span style={{ color: 'var(--grey)' }}>points</span>
            <button className="btn btn--ghost" onClick={() => run('Update Hall of Fame threshold', () => api.updateSetting('hall_of_fame_threshold', Number(hofThreshold)))}>Save</button>
          </div>
        </div>

        <div>
          <span className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Quarter Boundaries</span>
          <p style={{ color: 'var(--grey)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            Which gameweeks belong to each quarter, for the Quarterly Challenges above.
          </p>
          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {quarters.map((q, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ width: 24, color: 'var(--grey)' }} className="mono">Q{i + 1}</span>
                <span className="field-label">From</span>
                <GameweekSelect value={q[0]} onChange={(v) => updateQuarter(i, 0, v)} />
                <span className="field-label">To</span>
                <GameweekSelect value={q[1]} onChange={(v) => updateQuarter(i, 1, v)} />
              </div>
            ))}
          </div>
          <button className="btn btn--ghost" style={{ marginTop: '0.75rem' }} onClick={() => run('Update quarter boundaries', () => api.updateSetting('quarter_boundaries', quarters))}>
            Save Quarter Boundaries
          </button>
        </div>
      </div>

      <div className="card fade-in">
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
