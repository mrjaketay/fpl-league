import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api, isLoggedIn, clearToken } from '../api/client';
import GameweekSelect from '../components/GameweekSelect';

type QuarterRange = [number, number];
type MonthRange = [string, number, number];

const FLYER_TYPES: { type: string; label: string }[] = [
  { type: 'manager_of_week', label: 'Manager of the Week' },
  { type: 'donkey_of_week', label: 'Donkey of the Week' },
  { type: 'the_wall', label: 'Best Defense' },
  { type: 'midfield_king', label: 'Best Midfield' },
  { type: 'attack_king', label: 'Best Attack' },
];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Admin() {
  const [log, setLog] = useState<string[]>([]);
  const [quickStats, setQuickStats] = useState<any>(null);
  const [gw, setGw] = useState(1);
  const [startGw, setStartGw] = useState(1);
  const [totalGw, setTotalGw] = useState(38);
  const [hofThreshold, setHofThreshold] = useState('100');
  const [quarters, setQuarters] = useState<QuarterRange[]>([[1, 9], [10, 19], [20, 29], [30, 38]]);
  const [months, setMonths] = useState<MonthRange[]>([]);
  const [section, setSection] = useState<'sync' | 'fixtures' | 'awards' | 'settings' | 'flyers' | 'backup'>('sync');
  const [flyerGw, setFlyerGw] = useState(1);
  const [flyerPreviews, setFlyerPreviews] = useState<Record<string, string>>({});
  const [flyerBusy, setFlyerBusy] = useState<string | null>(null);

  useEffect(() => {
    api.flyers(flyerGw).then(setFlyerPreviews).catch(() => setFlyerPreviews({}));
  }, [flyerGw]);

  useEffect(() => {
    if (!isLoggedIn()) return;
    api.quickStats().then(setQuickStats).catch(() => {});
  }, []);

  async function handleFlyerUpload(awardType: string, file: File) {
    setFlyerBusy(awardType);
    try {
      const base64 = await fileToBase64(file);
      await api.uploadFlyer(flyerGw, awardType, base64);
      setFlyerPreviews((prev) => ({ ...prev, [awardType]: base64 }));
      appendLog(`✓ Uploaded flyer for ${awardType} — GW${flyerGw}`);
    } catch (err: any) {
      appendLog(`✗ Flyer upload failed: ${err.message}`);
    } finally {
      setFlyerBusy(null);
    }
  }

  async function handleFlyerDelete(awardType: string) {
    setFlyerBusy(awardType);
    try {
      await api.deleteFlyer(flyerGw, awardType);
      setFlyerPreviews((prev) => {
        const next = { ...prev };
        delete next[awardType];
        return next;
      });
      appendLog(`✓ Removed flyer for ${awardType} — GW${flyerGw}`);
    } catch (err: any) {
      appendLog(`✗ Flyer removal failed: ${err.message}`);
    } finally {
      setFlyerBusy(null);
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) return;
    api.getSettings().then((rows: any[]) => {
      const hof = rows.find((r) => r.key === 'hall_of_fame_threshold');
      const qb = rows.find((r) => r.key === 'quarter_boundaries');
      const mm = rows.find((r) => r.key === 'month_mapping');
      if (hof) setHofThreshold(String(hof.value));
      if (qb) setQuarters(qb.value);
      if (mm) setMonths(mm.value);
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

  const SECTIONS: { key: typeof section; label: string; icon: string }[] = [
    { key: 'sync', label: 'Sync Data', icon: '🔄' },
    { key: 'fixtures', label: 'H2H Fixtures', icon: '⚔️' },
    { key: 'awards', label: 'Awards', icon: '🏆' },
    { key: 'settings', label: 'League Settings', icon: '⚙️' },
    { key: 'flyers', label: 'Award Flyers', icon: '🖼️' },
    { key: 'backup', label: 'Backup / Export', icon: '💾' },
  ];

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <h1 style={{ fontSize: '1.3rem' }}>Admin Dashboard</h1>

      {quickStats && (
        <div className="card fade-in" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '1.1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span className="mono" style={{ color: 'var(--green)', fontWeight: 700 }}>{quickStats.active_managers}</span>
            <span style={{ color: 'var(--grey)', fontSize: '0.82rem' }}>Active Managers</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span className="live-dot tip" data-tip="Updates automatically every ~10 minutes" />
            <span className="mono" style={{ color: 'var(--cyan)', fontWeight: 700 }}>GW {quickStats.current_gameweek ?? '—'}</span>
          </div>
          {quickStats.season_leader && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{ color: 'var(--grey)', fontSize: '0.82rem' }}>👑 Leader:</span>
              <span style={{ fontWeight: 600 }}>{quickStats.season_leader.team_name}</span>
            </div>
          )}
        </div>
      )}

      <div className="admin-layout">
        <div className="admin-sidebar card">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={`admin-sidebar-item ${section === s.key ? 'admin-sidebar-item--active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              <span>{s.icon}</span> {s.label}
            </button>
          ))}
          <div className="admin-sidebar-divider" />
          <button className="admin-sidebar-item" onClick={() => { clearToken(); window.location.href = '/'; }}>
            <span>🚪</span> Log out
          </button>
        </div>

        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {section === 'sync' && (
            <div className="card fade-in">
              <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Sync Data</h2>
              <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Pulls the latest picks and points from FPL for a gameweek and recomputes every award. This already
                happens automatically every ~10 minutes — use these buttons to force it right now.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn--primary" onClick={() => run('Sync current gameweek', api.syncCurrent)}>Sync Current GW</button>
                <span style={{ color: 'var(--grey)' }}>or</span>
                <GameweekSelect value={gw} onChange={setGw} />
                <button className="btn btn--ghost" onClick={() => run(`Sync GW${gw}`, () => api.syncGameweek(gw))}>Sync This GW</button>
              </div>
            </div>
          )}

          {section === 'fixtures' && (
            <div className="card fade-in">
              <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Generate H2H Fixtures</h2>
              <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Builds the head-to-head schedule for the season — a round-robin repeating as many times as the
                gameweek range allows. <strong>Run this once</strong> — running it again later would create
                duplicate fixtures for weeks you've already generated.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="field-label">From</span>
                <GameweekSelect value={startGw} onChange={setStartGw} />
                <span className="field-label">To</span>
                <GameweekSelect value={totalGw} onChange={setTotalGw} />
                <button className="btn btn--primary" onClick={() => run('Generate H2H fixtures', () => api.generateH2H(startGw, totalGw))}>Generate</button>
              </div>
            </div>
          )}

          {section === 'awards' && (
            <>
              <div className="card fade-in">
                <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Manager of the Month</h2>
                <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Sums everyone's net points across a calendar month's gameweeks and crowns the highest. Click once
                  a month's last gameweek has been synced. Month ranges are edited in League Settings.
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {months.map(([name, from, to], i) => (
                    <button key={name} className="btn btn--ghost" onClick={() => run(`Lock in ${name} (GW${from}–${to})`, () => api.recomputeMonthly(i + 1))}>
                      {name} <span style={{ color: 'var(--grey)', fontWeight: 400 }}>(GW{from}–{to})</span>
                    </button>
                  ))}
                  {months.length === 0 && <span style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>No months configured yet.</span>}
                </div>
              </div>

              <div className="card fade-in fade-in-1">
                <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Quarterly Challenges</h2>
                <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Best Defense, Midfield, and Attack — one winner in each, per quarter. Click once a quarter's
                  last gameweek has been synced. Ranges are edited in League Settings.
                </p>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {quarters.map((q, i) => (
                    <button key={i} className="btn btn--ghost" onClick={() => run(`Lock in Q${i + 1} (GW${q[0]}–${q[1]})`, () => api.recomputeQuarterly(i + 1))}>
                      Lock in Q{i + 1} <span style={{ color: 'var(--grey)', fontWeight: 400 }}>(GW{q[0]}–{q[1]})</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {section === 'settings' && (
            <div className="card fade-in">
              <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>League Settings</h2>
              <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                These control the rules behind the awards.
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
                  Which gameweeks belong to each quarter, for the Quarterly Challenges.
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

              <div style={{ marginTop: '1.5rem' }}>
                <span className="field-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Month Mapping (Season Calendar)</span>
                <p style={{ color: 'var(--grey)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                  Which gameweeks fall in each calendar month, for Manager of the Month. Month names aren't
                  editable here, just their gameweek ranges.
                </p>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {months.map(([name, from, to], i) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ width: 90, color: 'var(--grey)', fontSize: '0.85rem' }}>{name}</span>
                      <span className="field-label">From</span>
                      <GameweekSelect value={from} onChange={(v) => setMonths((ms) => ms.map((m, idx) => idx === i ? [m[0], v, m[2]] : m))} />
                      <span className="field-label">To</span>
                      <GameweekSelect value={to} onChange={(v) => setMonths((ms) => ms.map((m, idx) => idx === i ? [m[0], m[1], v] : m))} />
                    </div>
                  ))}
                </div>
                <button className="btn btn--ghost" style={{ marginTop: '0.75rem' }} onClick={() => run('Update month mapping', () => api.updateSetting('month_mapping', months))}>
                  Save Month Mapping
                </button>
              </div>
            </div>
          )}

          {section === 'flyers' && (
            <div className="card fade-in">
              <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Weekly Award Flyers</h2>
              <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Upload a custom graphic for any of the five weekly awards below — it replaces the plain
                generated poster on the homepage for that gameweek. Stored permanently per gameweek.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span className="field-label">Gameweek</span>
                <GameweekSelect value={flyerGw} onChange={setFlyerGw} />
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {FLYER_TYPES.map(({ type, label }) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {flyerPreviews[type] ? (
                      <img src={flyerPreviews[type]} alt={label} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)' }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: 8, border: '1px dashed var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey)', fontSize: '0.7rem' }}>
                        none
                      </div>
                    )}
                    <span style={{ flex: 1, minWidth: 140 }}>{label}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={flyerBusy === type}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFlyerUpload(type, file);
                        e.target.value = '';
                      }}
                      style={{ fontSize: '0.8rem' }}
                    />
                    {flyerPreviews[type] && (
                      <button className="btn btn--ghost" disabled={flyerBusy === type} onClick={() => handleFlyerDelete(type)}>Remove</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'backup' && (
            <div className="card fade-in">
              <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Backup / Export Data</h2>
              <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                Downloads every manager, gameweek score, award, and H2H fixture as a JSON file to your computer —
                an independent backup of your league's numbers, separate from the database itself.
              </p>
              <button
                className="btn btn--primary"
                onClick={async () => {
                  appendLog('Exporting data…');
                  try {
                    const data = await api.exportData();
                    downloadJson(data, `fpl-league-export-gw${gw}.json`);
                    appendLog('✓ Export downloaded');
                  } catch (err: any) {
                    appendLog(`✗ Export failed: ${err.message}`);
                  }
                }}
              >
                Download Export (JSON)
              </button>
            </div>
          )}

          <div className="card fade-in">
            <h2 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Activity Log</h2>
            <div className="mono" style={{ fontSize: '0.78rem', display: 'grid', gap: '0.3rem', maxHeight: 220, overflowY: 'auto', color: 'var(--grey)' }}>
              {log.length === 0 && <span>Nothing run yet this session.</span>}
              {log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
