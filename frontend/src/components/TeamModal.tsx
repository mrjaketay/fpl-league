import { useEffect, useState } from 'react';
import { api } from '../api/client';
import GameweekSelect from './GameweekSelect';

const CHIP_LABELS: Record<string, string> = {
  wildcard: 'Wildcard', free_hit: 'Free Hit', bench_boost: 'Bench Boost', triple_captain: 'Triple Captain',
};

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase();
}

function PitchPlayer({ p }: { p: any }) {
  return (
    <div className="pitch-player">
      <div className="avatar">
        {initials(p.web_name)}
        {p.is_captain && <span className="armband">C</span>}
        {p.is_vice_captain && <span className="armband" style={{ background: 'var(--cyan)' }}>V</span>}
      </div>
      <span className="pname">{p.web_name}</span>
    </div>
  );
}

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
  const gk = starting.filter((p: any) => p.position === 'GKP');
  const def = starting.filter((p: any) => p.position === 'DEF');
  const mid = starting.filter((p: any) => p.position === 'MID');
  const fwd = starting.filter((p: any) => p.position === 'FWD');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card modal-card--wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '2rem' }}>
          <div>
            <span className="field-label">Squad</span>
            <h2 style={{ fontSize: '1.2rem', marginTop: '0.2rem' }}>{managerName}</h2>
          </div>
          <GameweekSelect value={gw} onChange={setGw} />
        </div>

        {loading && <p className="mono" style={{ color: 'var(--grey)', marginTop: '1rem' }}>Loading squad…</p>}
        {error && <p className="pill pill--pink" style={{ marginTop: '1rem' }}>{error}</p>}

        {data?.notAvailable && !loading && (
          <div style={{ marginTop: '1.5rem', textAlign: 'center', padding: '2rem 1rem', color: 'var(--grey)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
            <p>No squad locked in for Gameweek {gw} yet — it either hasn't reached its deadline, or hasn't been played.</p>
          </div>
        )}

        {data && !data.notAvailable && !loading && (
          <div style={{ marginTop: '1rem' }}>
            {data.active_chip && (
              <span className="pill pill--cyan" style={{ marginBottom: '0.75rem' }}>
                {CHIP_LABELS[data.active_chip] ?? data.active_chip} played
              </span>
            )}

            <div className="pitch">
              <div className="pitch-row">{fwd.map((p: any, i: number) => <PitchPlayer key={i} p={p} />)}</div>
              <div className="pitch-row">{mid.map((p: any, i: number) => <PitchPlayer key={i} p={p} />)}</div>
              <div className="pitch-row">{def.map((p: any, i: number) => <PitchPlayer key={i} p={p} />)}</div>
              <div className="pitch-row">{gk.map((p: any, i: number) => <PitchPlayer key={i} p={p} />)}</div>
            </div>

            {bench.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <span className="field-label" style={{ fontSize: '0.65rem' }}>BENCH</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  {bench.map((p: any, i: number) => (
                    <span key={i} className="pill pill--outline">{p.web_name}</span>
                  ))}
                </div>
              </div>
            )}

            {data.entry_history && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--line)' }}>
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
      </div>
    </div>
  );
}
