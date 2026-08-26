import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ManagerModal from '../components/ManagerModal';
import AwardPoster from '../components/AwardPoster';

const WEEKLY_AWARD_META: Record<string, { title: string; emoji: string; tone: 'green' | 'pink' | 'cyan' }> = {
  manager_of_week: { title: 'Manager of the Week', emoji: '🏆', tone: 'green' },
  donkey_of_week: { title: 'Donkey of the Week', emoji: '🐴', tone: 'pink' },
  the_wall: { title: 'Best Defense', emoji: '🧱', tone: 'cyan' },
  midfield_king: { title: 'Best Midfield', emoji: '🎯', tone: 'cyan' },
  attack_king: { title: 'Best Attack', emoji: '⚡', tone: 'cyan' },
};

export default function Home() {
  const [latestGw, setLatestGw] = useState<number | null>(null);
  const [awards, setAwards] = useState<any[]>([]);
  const [flyers, setFlyers] = useState<Record<string, string>>({});
  const [hof, setHof] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [longevity, setLongevity] = useState<any[]>([]);
  const [prices, setPrices] = useState<{ risers: any[]; fallers: any[] }>({ risers: [], fallers: [] });
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    api.latestGameweek().then((d) => setLatestGw(d.latest)).catch(() => {});
    api.hallOfFame().then(setHof).catch(() => {});
    api.standings().then(setStandings).catch(() => {});
    api.longevity().then(setLongevity).catch(() => {});
    api.priceChanges().then(setPrices).catch(() => {});
  }, []);

  useEffect(() => {
    if (!latestGw) return;
    api.gameweekAwards(latestGw).then(setAwards).catch(() => {});
    api.flyers(latestGw).then(setFlyers).catch(() => {});
  }, [latestGw]);

  function openManager(entryId: number) {
    const standingsRow = standings.find((s) => s.entry_id === entryId);
    const longevityRow = longevity.find((l) => l.entry_id === entryId);
    setSelected({ ...standingsRow, ...longevityRow });
  }

  const noDataYet = standings.length === 0;
  const featured = Object.keys(WEEKLY_AWARD_META)
    .map((type) => ({ type, award: awards.find((a) => a.award_type === type) }))
    .filter((f) => f.award);

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
        <div className="two-col-2-1">
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="two-col-even">
              {featured.map(({ type, award }, i) => {
                const meta = WEEKLY_AWARD_META[type];
                return (
                  <div key={type} className={`fade-in fade-in-${Math.min(i + 1, 3)}`}>
                    <AwardPoster
                      tone={meta.tone}
                      emoji={meta.emoji}
                      title={meta.title}
                      managerName={award.manager_name}
                      teamName={award.team_name}
                      value={`${award.value} pts`}
                      flyerImage={flyers[type]}
                    />
                  </div>
                );
              })}
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

          <div style={{ display: 'grid', gap: '1.5rem' }}>
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

            <div className="card fade-in fade-in-3">
              <h3 style={{ fontSize: '0.95rem', color: 'var(--grey)', marginBottom: '1rem' }}>💰 PRICE CHANGES (SEASON)</h3>
              {prices.risers.length === 0 && prices.fallers.length === 0 ? (
                <p style={{ color: 'var(--grey)', fontSize: '0.85rem' }}>No price changes yet this season.</p>
              ) : (
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  {prices.risers.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700 }}>TOP 5 RISERS</span>
                      <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.5rem' }}>
                        {prices.risers.map((p: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>{p.web_name} <span style={{ color: 'var(--grey)' }}>({p.team})</span></span>
                            <span className="mono" style={{ color: 'var(--green)' }}>£{p.now_cost.toFixed(1)}m ▲</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {prices.fallers.length > 0 && (
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--pink)', fontWeight: 700 }}>TOP 5 FALLERS</span>
                      <div style={{ display: 'grid', gap: '0.4rem', marginTop: '0.5rem' }}>
                        {prices.fallers.map((p: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <span>{p.web_name} <span style={{ color: 'var(--grey)' }}>({p.team})</span></span>
                            <span className="mono" style={{ color: 'var(--pink)' }}>£{p.now_cost.toFixed(1)}m ▼</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
