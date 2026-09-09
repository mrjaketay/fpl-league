import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ManagerModal from '../components/ManagerModal';
import AwardPoster from '../components/AwardPoster';
import AwardIcon from '../components/AwardIcon';

const WEEKLY_AWARD_META: Record<string, { title: string; icon: 'motw' | 'dotw' | 'defense' | 'midfield' | 'attack'; tone: 'green' | 'pink' | 'cyan' }> = {
  manager_of_week: { title: 'Manager of the Week', icon: 'motw', tone: 'green' },
  donkey_of_week: { title: 'Donkey of the Week', icon: 'dotw', tone: 'pink' },
  the_wall: { title: 'Best Defense', icon: 'defense', tone: 'cyan' },
  midfield_king: { title: 'Best Midfield', icon: 'midfield', tone: 'cyan' },
  attack_king: { title: 'Best Attack', icon: 'attack', tone: 'cyan' },
};

export default function Home() {
  const [latestGw, setLatestGw] = useState<number | null>(null);
  const [awards, setAwards] = useState<any[]>([]);
  const [flyers, setFlyers] = useState<Record<string, string>>({});
  const [hof, setHof] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [longevity, setLongevity] = useState<any[]>([]);
  const [prices, setPrices] = useState<{ risers: any[]; fallers: any[] }>({ risers: [], fallers: [] });
  const [quickStats, setQuickStats] = useState<any>(null);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    api.latestGameweek().then((d) => setLatestGw(d.latest)).catch(() => {});
    api.hallOfFame().then(setHof).catch(() => {});
    api.standings().then(setStandings).catch(() => {});
    api.longevity().then(setLongevity).catch(() => {});
    api.priceChanges().then(setPrices).catch(() => {});
    api.quickStats().then(setQuickStats).catch(() => {});
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
  const primaryTypes = ['manager_of_week', 'donkey_of_week'];
  const secondaryTypes = ['the_wall', 'midfield_king', 'attack_king'];

  function buildFeatured(types: string[]) {
    return types
      .map((type) => ({ type, winners: awards.filter((a) => a.award_type === type) }))
      .filter((f) => f.winners.length > 0);
  }
  const primaryFeatured = buildFeatured(primaryTypes);
  const secondaryFeatured = buildFeatured(secondaryTypes);

  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
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
              <span className="tip" data-tip="Highest total points in the league right now" style={{ color: 'var(--grey)', fontSize: '0.82rem' }}>👑 Leader:</span>
              <span style={{ fontWeight: 600 }}>{quickStats.season_leader.team_name}</span>
            </div>
          )}
          {quickStats.chief_donkey && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span className="tip" data-tip="Most Donkey of the Week wins this season" style={{ color: 'var(--grey)', fontSize: '0.82rem' }}>🐴 Chief Donkey:</span>
              <span style={{ fontWeight: 600 }}>{quickStats.chief_donkey.team_name}</span>
              <span className="mono" style={{ color: 'var(--pink)', fontSize: '0.8rem' }}>({quickStats.chief_donkey.wins})</span>
            </div>
          )}
        </div>
      )}

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
              {primaryFeatured.map(({ type, winners }, i) => {
                const meta = WEEKLY_AWARD_META[type];
                return (
                  <div key={type} className={`fade-in fade-in-${Math.min(i + 1, 3)}`}>
                    <AwardPoster
                      tone={meta.tone}
                      icon={meta.icon}
                      title={meta.title}
                      winners={winners.map((w) => ({ managerName: w.manager_name, teamName: w.team_name }))}
                      value={`${winners[0].value} pts`}
                      flyerImage={flyers[type]}
                      iconSize={56}
                    />
                  </div>
                );
              })}
            </div>

            {secondaryFeatured.length > 0 && (
              <div className="three-col">
                {secondaryFeatured.map(({ type, winners }, i) => {
                  const meta = WEEKLY_AWARD_META[type];
                  return (
                    <div key={type} className={`fade-in fade-in-${Math.min(i + 1, 3)}`}>
                      <AwardPoster
                        tone={meta.tone}
                        icon={meta.icon}
                        title={meta.title}
                        winners={winners.map((w) => ({ managerName: w.manager_name, teamName: w.team_name }))}
                        value={`${winners[0].value} pts`}
                        flyerImage={flyers[type]}
                        iconSize={38}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="card fade-in fade-in-3">
              <div className="section-heading">HALL OF FAME</div>
              {hof.length === 0 ? (
                <p style={{ color: 'var(--grey)' }}>No one's hit 100+ points without a chip yet — it'll show up here the moment they do.</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {hof.map((h, i) => (
                    <div key={i} className="row-in" style={{ animationDelay: `${i * 0.04}s`, display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.6rem' }}>
                      <AwardIcon kind="hof" size={30} />
                      <span style={{ flex: 1 }}>
                        <button onClick={() => openManager(h.entry_id)} style={linkBtn}>{h.team_name}</button>
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
                <span className="section-heading" style={{ marginBottom: 0 }}>STANDINGS</span>
                <Link to="/standings" style={{ fontSize: '0.8rem' }}>Full table →</Link>
              </div>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {standings.slice(0, 8).map((s, i) => (
                  <button key={s.entry_id} className="row-in" style={{ ...rowBtn, animationDelay: `${i * 0.04}s`, background: i === 0 ? 'rgba(0,255,133,0.08)' : 'transparent' }} onClick={() => openManager(s.entry_id)}>
                    <span className="mono" style={{ color: 'var(--grey)', width: 20 }}>{i + 1}</span>
                    <span style={{ flex: 1, textAlign: 'left', fontWeight: 600 }}>{s.team_name}</span>
                    <span className="mono" style={{ color: 'var(--green)' }}>{s.total_points_after}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card fade-in fade-in-3">
              <div className="section-heading">PRICE CHANGES (SEASON)</div>
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
