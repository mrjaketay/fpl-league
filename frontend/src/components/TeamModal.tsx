import { useEffect, useState } from 'react';
import { api } from '../api/client';
import GameweekSelect from './GameweekSelect';
import PitchMarkings from './PitchMarkings';

const CHIP_LABELS: Record<string, string> = {
  wildcard: 'Wildcard', free_hit: 'Free Hit', bench_boost: 'Bench Boost', triple_captain: 'Triple Captain',
};

// Consistent per-PL-team shirt color, same hashing idea as TeamBadge —
// we don't have official kit colors from the API, so this gives each
// real team a stable, distinct shirt color instead of using one flat
// color for everyone.
function shirtColor(teamShort: string): string {
  let hash = 0;
  for (let i = 0; i < teamShort.length; i++) hash = teamShort.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 55%, 38%)`;
}

function FplPlayer({ p }: { p: any }) {
  return (
    <div className="fpl-player">
      <div className="fpl-shirt" style={{ background: shirtColor(p.team_short) }}>
        {p.is_captain && <span className="fpl-armband">C</span>}
        {p.is_vice_captain && <span className="fpl-armband fpl-armband--vc">V</span>}
      </div>
      <div className="fpl-name-pill">{p.web_name}</div>
      <div className="fpl-points-pill">{p.total_points}</div>
    </div>
  );
}

export default function TeamModal({
  entryId,
  managerName,
  teamName,
  defaultGw,
  onClose,
}: {
  entryId: number;
  managerName: string;
  teamName?: string;
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '2rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span className="field-label">Squad</span>
            <h2 style={{ fontSize: '1.2rem', marginTop: '0.2rem' }}>{teamName || managerName}</h2>
            {teamName && <span style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>{managerName}</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {data?.active_chip && (
              <span className="pill pill--cyan">{CHIP_LABELS[data.active_chip] ?? data.active_chip}</span>
            )}
            <GameweekSelect value={gw} onChange={setGw} />
          </div>
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
            <div className="pitch">
              <PitchMarkings />
              <div className="pitch-row">{fwd.map((p: any, i: number) => <FplPlayer key={i} p={p} />)}</div>
              <div className="pitch-row">{mid.map((p: any, i: number) => <FplPlayer key={i} p={p} />)}</div>
              <div className="pitch-row">{def.map((p: any, i: number) => <FplPlayer key={i} p={p} />)}</div>
              <div className="pitch-row">{gk.map((p: any, i: number) => <FplPlayer key={i} p={p} />)}</div>
            </div>

            {bench.length > 0 && (
              <div className="bench-strip">
                <span className="bench-label">Substitutes</span>
                <div className="bench-row">
                  {bench.map((p: any, i: number) => (
                    <FplPlayer key={i} p={p} />
                  ))}
                </div>
              </div>
            )}

            {data.entry_history && (
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
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
