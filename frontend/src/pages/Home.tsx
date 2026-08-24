import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ManagerModal from '../components/ManagerModal';

export default function Home() {
  const [latestGw, setLatestGw] = useState<number | null>(null);
  const [motw, setMotw] = useState<any>(null);
  const [dotw, setDotw] = useState<any>(null);
  const [hof, setHof] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [longevity, setLongevity] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    api.latestGameweek().then((d) => setLatestGw(d.latest)).catch(() => {});
    api.hallOfFame().then(setHof).catch(() => {});
    api.standings().then(setStandings).catch(() => {});
    api.longevity().then(setLongevity).catch(() => {});
  }, []);

  useEffect(() => {
    if (!latestGw) return;
    api.gameweekAwards(latestGw).then((awards: any[]) => {
      setMotw(awards.find((a) => a.award_type === 'manager_of_week') ?? null);
      setDotw(awards.find((a) => a.award_type === 'donkey_of_week') ?? null);
    }).catch(() => {});
  }, [latestGw]);

  function openManager(entryId: number) {
    const standingsRow = standings.find((s) => s.entry_id === entryId);
    const longevityRow = longevity.find((l) => l.entry_id === entryId);
    setSelected({ ...standingsRow, ...longevityRow });
  }

  const noDataYet = standings.length === 0;

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      {noDataYet && (
        <div className="card card--hero fade-in" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Kickoff hasn't happened yet</h2>
          <p style={{ color: 'var(--grey)', maxWidth: 420, margin: '0 auto' }}>
            Once the first gameweek is synced, this page fills up with your
            league's storylines automatically — Manager of the Week, Donkey
            of the Week, Hall of Fame, and the live standings.
          </p>
        </div>
      )}

      {!noDataYet && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {motw && (
                <div className="poster poster--green fade-in fade-in-1">
                  <div className="poster-emoji">🏆</div>
                  <div className="poster-title">Manager of the Week</div>
                  <div className="poster-name">{motw.manager_name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{motw.team_name}</div>
                  <div className="poster-value">{motw.value} pts</div>
                </div>
              )}
              {dotw && (
                <div className="poster poster--pink fade-in fade-in-2">
                  <div className="poster-emoji">🐴</div>
                  <div className="poster-title">Donkey of the Week</div>
                  <div className="poster-name">{dotw.manager_name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>{dotw.team_name}</div>
                  <div className="poster-value">{dotw.value} pts</div>
                </div>
              )}
            </div>

            <div className="card fade-in fade-in-3">
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--grey)' }}>⭐ HALL OF FAME</h3>
              {hof.length === 0 ? (
                <p style={{ color: 'var(--grey)' }}>No one's hit 100+ points without a chip yet — it'll show up here the moment they do.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {hof.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>
                      <span>
                        <button onClick={() => openManager(h.entry_id)} style={linkBtn}>{h.manager_name}</button>
                        <span style={{ color: 'var(--grey)' }}> — GW{h.gameweek}</span>
                      </span>
                      <span className="mono" style={{ color: 'var(--green)' }}>{h.value} pts</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card fade-in fade-in-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--grey)' }}>STANDINGS</h3>
              <Link to="/standings" style={{ fontSize: '0.8rem' }}>Full table →</Link>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {standings.slice(0, 8).map((s, i) => (
                <button key={s.entry_id} onClick={() => openManager(s.entry_id)} style={{ ...rowBtn, background: i === 0 ? 'rgba(0,255,133,0.08)' : 'transparent' }}>
                  <span className="mono" style={{ color: 'var(--grey)', width: 20 }}>{i + 1}</span>
                  <span style={{ flex: 1, textAlign: 'left', fontWeight: 600 }}>{s.manager_name}</span>
                  <span className="mono" style={{ color: 'var(--green)' }}>{s.total_points_after}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selected && <ManagerModal manager={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  background: 'none', border: 'none', padding: 0, color: 'var(--white)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'var(--line)',
};
const rowBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', textAlign: 'left',
  background: 'transparent', border: 'none', borderRadius: 6, padding: '0.4rem 0.5rem', cursor: 'pointer', color: 'var(--white)',
};
