import { useEffect, useState } from 'react';
import { api } from '../api/client';
import GameweekSelect from '../components/GameweekSelect';

const CHIP_META: Record<string, { label: string; emoji: string }> = {
  wildcard: { label: 'Wildcard', emoji: '🃏' },
  free_hit: { label: 'Free Hit', emoji: '🎯' },
  bench_boost: { label: 'Bench Boost', emoji: '🚀' },
  triple_captain: { label: 'Triple Captain', emoji: '👑' },
};

const LEADERBOARDS: { key: string; label: string; emoji: string }[] = [
  { key: 'weeks_in_1st', label: 'Most Weeks at #1', emoji: '👑' },
  { key: 'weeks_in_top3', label: 'Most Weeks in Top 3', emoji: '📈' },
  { key: 'weeks_in_last', label: 'Most Weeks in Last', emoji: '📉' },
  { key: 'weeks_in_bottom3', label: 'Most Weeks in Bottom 3', emoji: '⚠️' },
  { key: 'motw_wins', label: 'Most Manager of the Week Wins', emoji: '🏆' },
  { key: 'dotw_wins', label: 'Most Donkey of the Week Wins', emoji: '🐴' },
];

const QUARTER_CATS: { key: 'defense' | 'midfield' | 'attack'; label: string; emoji: string }[] = [
  { key: 'defense', label: 'Best Defense', emoji: '🧱' },
  { key: 'midfield', label: 'Best Midfield', emoji: '🎯' },
  { key: 'attack', label: 'Best Attack', emoji: '⚡' },
];

export default function LeagueStats() {
  const [gw, setGw] = useState(1);
  const [captains, setCaptains] = useState<any[]>([]);
  const [chips, setChips] = useState<any[]>([]);
  const [longevity, setLongevity] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quarter, setQuarter] = useState(1);
  const [quarterBoard, setQuarterBoard] = useState<any>({ defense: [], midfield: [], attack: [] });

  useEffect(() => {
    setError(null);
    api.captainStats(gw).then(setCaptains).catch((e) => setError(e.message));
  }, [gw]);

  useEffect(() => {
    api.chipStats().then(setChips).catch(() => {});
    api.longevity().then(setLongevity).catch(() => {});
  }, []);

  useEffect(() => {
    api.quarterlyLeaderboard(quarter).then(setQuarterBoard).catch(() => {});
  }, [quarter]);

  const totalCaptains = captains.reduce((sum, c) => sum + c.count, 0);
  const chipsByType = Object.keys(CHIP_META).map((type) => ({
    type,
    entries: chips.filter((c) => c.chip_played === type).sort((a, b) => a.gameweek - b.gameweek),
  }));

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span className="field-label">Gameweek</span>
        <GameweekSelect value={gw} onChange={setGw} />
      </div>

      <div className="card fade-in fade-in-1">
        <div className="section-heading">MOST CAPTAINED — GW{gw}</div>
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
        <div className="section-heading">QUARTERLY LEADERBOARD</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <span className="field-label">Quarter</span>
          <select className="gw-select" value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
            {[1, 2, 3, 4].map((q) => <option key={q} value={q}>Q{q}</option>)}
          </select>
          {quarterBoard.from && <span style={{ color: 'var(--grey)', fontSize: '0.82rem' }}>GW{quarterBoard.from}–{quarterBoard.to} · live running total, not yet locked in</span>}
        </div>
        <div className="three-col">
          {QUARTER_CATS.map(({ key, label, emoji }) => {
            const list = (quarterBoard[key] ?? []).slice(0, 5);
            return (
              <div key={key} className="stat-tile" style={{ alignItems: 'stretch' }}>
                <span className="label">{emoji} {label}</span>
                {list.length === 0 ? (
                  <span style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>No data yet</span>
                ) : (
                  <div style={{ display: 'grid', gap: '0.3rem', marginTop: '0.4rem' }}>
                    {list.map((m: any, i: number) => (
                      <div key={m.entry_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: i === 0 ? 'var(--green)' : 'var(--white)', fontWeight: i === 0 ? 700 : 400 }}>{i + 1}. {m.team_name}</span>
                        <span className="mono" style={{ color: 'var(--grey)' }}>{m.total}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card fade-in fade-in-2">
        <div className="section-heading">LEAGUE LEADERBOARDS</div>
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
        <div className="section-heading">CHIP USAGE — SEASON</div>
        {chips.length === 0 ? (
          <p style={{ color: 'var(--grey)' }}>No chips played yet this season.</p>
        ) : (
          <div className="two-col-even">
            {chipsByType.map(({ type, entries }) => {
              const meta = CHIP_META[type];
              return (
                <div key={type} className="stat-tile" style={{ alignItems: 'stretch' }}>
                  <span className="label">{meta.emoji} {meta.label}</span>
                  {entries.length === 0 ? (
                    <span style={{ color: 'var(--grey)', fontSize: '0.82rem', marginTop: '0.3rem' }}>Not played yet</span>
                  ) : (
                    <div style={{ display: 'grid', gap: '0.3rem', marginTop: '0.4rem' }}>
                      {entries.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                          <span>{c.team_name}</span>
                          <span className="mono" style={{ color: 'var(--grey)' }}>GW{c.gameweek}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
