import { useEffect, useState } from 'react';
import { api } from '../api/client';
import GameweekSelect from './GameweekSelect';

const CHIP_LABELS: Record<string, string> = {
  wildcard: 'Wildcard', free_hit: 'Free Hit', bench_boost: 'Bench Boost', triple_captain: 'Triple Captain',
};
const POSITION_ORDER = ['GKP', 'DEF', 'MID', 'FWD'];

export default function TeamModal({
  entryId,
  managerName,
  defaultGw,
  onClose,
}: {
  entryId: number;
  managerName: string;
  defaultGw: number;
  onClose: () => void;
}) {
  const [gw, setGw] = useState(defaultGw);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.team(entryId, gw).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [entryId, gw]);

  const starting = data?.picks?.filter((p: any) => p.starting) ?? [];
  const bench = data?.picks?.filter((p: any) => !p.starting) ?? [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card modal-card--wide" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="field-label">Squad</span>
            <h2 style={{ fontSize: '1.2rem', marginTop: '0.2rem' }}>{managerName}</h2>
          </div>
          <GameweekSelect value={gw} onChange={setGw} />
        </div>

        {loading && <p className="mono" style={{ color: 'var(--grey)', marginTop: '1rem' }}>Loading squad…</p>}
        {error && <p className="pill pill--pink" style={{ marginTop: '1rem' }}>{error}</p>}

        {data && !loading && (
          <div style={{ marginTop: '1rem' }}>
            {data.active_chip && (
              <span className="pill pill--cyan" style={{ marginBottom: '0.75rem' }}>
                {CHIP_LABELS[data.active_chip] ?? data.active_chip} played
              </span>
            )}
            <div style={{ display: 'grid', gap: '0.4rem', maxHeight: 320, overflowY: 'auto' }}>
              {POSITION_ORDER.map((pos) => {
                const players = starting.filter((p: any) => p.position === pos);
                if (players.length === 0) return null;
                return (
                  <div key={pos}>
                    <span className="field-label" style={{ fontSize: '0.65rem' }}>{pos}</span>
                    {players.map((p: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0' }}>
                        <span style={{ flex: 1 }}>{p.web_name}</span>
                        {p.is_captain && <span className="pill pill--green" style={{ fontSize: '0.6rem' }}>C</span>}
                        {p.is_vice_captain && <span className="pill pill--outline" style={{ fontSize: '0.6rem' }}>VC</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
              {bench.length > 0 && (
                <div>
                  <span className="field-label" style={{ fontSize: '0.65rem' }}>BENCH</span>
                  {bench.map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', padding: '0.3rem 0', color: 'var(--grey)' }}>{p.web_name}</div>
                  ))}
                </div>
              )}
            </div>
            {data.entry_history && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--line)' }}>
                <div className="stat-tile" style={{ flex: 1 }}>
                  <span className="label">GW Points</span>
                  <span className="value" style={{ fontSize: '1.2rem' }}>{data.entry_history.points}</span>
                </div>
                <div className="stat-tile" style={{ flex: 1 }}>
                  <span className="label">Bench Pts</span>
                  <span className="value" style={{ fontSize: '1.2rem' }}>{data.entry_history.points_on_bench}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <button className="btn btn--ghost" style={{ marginTop: '1.25rem', width: '100%' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
