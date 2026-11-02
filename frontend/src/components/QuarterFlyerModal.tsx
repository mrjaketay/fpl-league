import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import LeagueLogo from './LeagueLogo';
import AwardIcon, { IconDownload } from './AwardIcon';

// Same 540x675 canvas as the H2H flyer, scaled to fit the modal.
// Only locked-in winners go on this one.
const W = 540;
const H = 675;

const SPARKS = [
  [60, 40, 1.6], [180, 24, 1.2], [330, 56, 1.8], [470, 30, 1.3], [505, 110, 1.5],
  [30, 150, 1.3], [250, 120, 1.1], [420, 150, 1.4],
];

const CATS: { type: string; label: string; kind: 'defense' | 'midfield' | 'attack'; color: string }[] = [
  { type: 'quarterly_defense', label: 'DEFENCE', kind: 'defense', color: '#04f5ff' },
  { type: 'quarterly_midfield', label: 'MIDFIELD', kind: 'midfield', color: '#00ff85' },
  { type: 'quarterly_attack', label: 'ATTACK', kind: 'attack', color: '#ff2882' },
];

function initialsOf(name: string) {
  return (name || 'FPL').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function QuarterFlyerModal({ quarter, onClose }: { quarter: number; onClose: () => void }) {
  const [leagueName, setLeagueName] = useState('');
  const [winners, setWinners] = useState<any[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [scale, setScale] = useState(0.85);
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.info().then((d) => setLeagueName(d.name)).catch(() => {});
  }, []);

  useEffect(() => {
    setWinners(null);
    setLoadFailed(false);
    api.quarterlyAwards(quarter).then(setWinners).catch(() => setLoadFailed(true));
  }, [quarter]);

  const locked = !!winners && winners.length > 0;

  // fit the flyer to the modal width (re-run once the flyer is on screen)
  useLayoutEffect(() => {
    function fit() {
      if (wrapRef.current) setScale(wrapRef.current.clientWidth / W);
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [locked]);

  async function download() {
    if (!flyerRef.current) return;
    setDownloading(true);
    setFailed(false);
    try {
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(flyerRef.current, {
        backgroundColor: '#1c0021',
        scale: 2,
        // undo the on-screen scaling so the capture is full size
        onclone: (doc) => {
          const wrap = doc.getElementById('qflyer-wrap');
          const flyer = doc.getElementById('qflyer-canvas');
          if (wrap) { wrap.style.height = `${H}px`; wrap.style.overflow = 'visible'; }
          if (flyer) flyer.style.transform = 'none';
        },
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `quarter-${quarter}-winners.png`;
      a.click();
    } catch {
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  }

  const host = typeof window !== 'undefined' ? window.location.host : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card modal-card--wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <span className="field-label">Flyer</span>
        <h2 style={{ fontSize: '1.1rem', marginTop: '0.2rem', marginBottom: '1rem' }}>Quarter {quarter} winners</h2>

        {winners === null && !loadFailed && <div className="skeleton" style={{ height: 240, borderRadius: 10 }} />}
        {loadFailed && <p style={{ color: 'var(--red)' }}>Couldn't load the winners — try again in a moment.</p>}
        {winners && !locked && (
          <p style={{ color: 'var(--grey)' }}>
            Quarter {quarter} hasn't been locked in yet. Lock it in from Admin → Awards, then come back here.
          </p>
        )}

        {locked && (
        <div id="qflyer-wrap" ref={wrapRef} style={{ position: 'relative', width: '100%', height: H * scale, overflow: 'hidden', borderRadius: 10 }}>
          <div
            id="qflyer-canvas"
            ref={flyerRef}
            style={{
              position: 'absolute', top: 0, left: 0, width: W, height: H,
              transform: `scale(${scale})`, transformOrigin: 'top left',
              background: '#1c0021', overflow: 'hidden', fontFamily: 'Inter, sans-serif', color: '#f6f6fa',
            }}
          >
            {/* background artwork */}
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <linearGradient id="qf-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2c0033" />
                  <stop offset="1" stopColor="#14001a" />
                </linearGradient>
                <radialGradient id="qf-g1" cx="0.1" cy="0" r="0.8">
                  <stop offset="0" stopColor="#00ff85" stopOpacity="0.38" />
                  <stop offset="1" stopColor="#00ff85" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="qf-g2" cx="1" cy="1" r="0.8">
                  <stop offset="0" stopColor="#04f5ff" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#04f5ff" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="qf-g3" cx="0.9" cy="0.05" r="0.6">
                  <stop offset="0" stopColor="#ff2882" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#ff2882" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={W} height={H} fill="url(#qf-bg)" />
              <rect width={W} height={H} fill="url(#qf-g1)" />
              <rect width={W} height={H} fill="url(#qf-g3)" />
              <rect width={W} height={H} fill="url(#qf-g2)" />
              <polygon points="330,-20 470,-20 250,300 110,300" fill="#5c0066" opacity="0.18" />
              <g stroke="#ffffff" strokeOpacity="0.06" strokeWidth="2" fill="none">
                <line x1="0" y1="470" x2={W} y2="470" />
                <circle cx="270" cy="470" r="86" />
                <path d="M -60 700 A 260 260 0 0 1 200 520" />
              </g>
              <g fill="#ffffff">
                {SPARKS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fillOpacity="0.45" />)}
              </g>
            </svg>

            {/* header */}
            <div style={{ position: 'absolute', left: 36, right: 36, top: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <LeagueLogo initials={initialsOf(leagueName)} size={38} />
                <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>{leagueName || ' '}</div>
              </div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: '#04f5ff' }}>QUARTERLY AWARDS</div>
            </div>

            <div style={{ position: 'absolute', left: 36, right: 36, top: 92 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
                <div style={{ width: 5, height: 92, background: '#00ff85', borderRadius: 3, marginBottom: 6 }} />
                <div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.28em', color: '#00ff85', marginBottom: 2 }}>QUARTER</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 84, lineHeight: 0.95, letterSpacing: '-0.04em' }}>{quarter}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'right', paddingBottom: 10 }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 30, letterSpacing: '-0.02em', color: '#00ff85' }}>WINNERS</div>
                </div>
              </div>
            </div>

            {/* winner cards */}
            <div style={{ position: 'absolute', left: 36, right: 36, top: 218, display: 'grid', gap: 12 }}>
              {CATS.map((c) => {
                const list = winners!.filter((w) => w.award_type === c.type);
                const teams = list.map((w) => w.team_name).join(' & ');
                const managers = list.map((w) => w.manager_name).join(' & ');
                return (
                  <div key={c.type} style={{
                    height: 112, display: 'flex', alignItems: 'center', gap: 14, padding: '0 18px',
                    background: 'rgba(0,0,0,0.36)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: `4px solid ${c.color}`, borderRadius: 12,
                  }}>
                    <div style={{ color: c.color, flexShrink: 0, display: 'flex' }}><AwardIcon kind={c.kind} size={34} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.22em', color: c.color, marginBottom: 4 }}>
                        {list.length > 1 ? `JOINT ${c.label}` : c.label}
                      </div>
                      {list.length === 0 ? (
                        <div style={{ color: '#8f8aa0', fontSize: 14 }}>No winner</div>
                      ) : (
                        <>
                          <div style={{
                            fontFamily: 'Poppins, sans-serif', fontWeight: 700, lineHeight: 1.15, overflowWrap: 'anywhere',
                            fontSize: teams.length > 34 ? 14 : teams.length > 22 ? 17 : 21, maxHeight: 50, overflow: 'hidden',
                          }}>{teams}</div>
                          <div style={{ color: '#a9a4ba', fontSize: 12, marginTop: 3, overflow: 'hidden', maxHeight: 30, lineHeight: 1.2 }}>{managers}</div>
                        </>
                      )}
                    </div>
                    {list.length > 0 && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 28, color: c.color, lineHeight: 1 }}>{list[0].value}</div>
                        <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.16em', color: '#8f8aa0', marginTop: 4 }}>PTS</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* footer */}
            <div style={{ position: 'absolute', left: 36, right: 36, bottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: '#8f8aa0' }}>{host}</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: '#8f8aa0' }}>Q{quarter}</span>
            </div>
          </div>
        </div>
        )}

        {failed && (
          <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginTop: '0.75rem' }}>Couldn't create the image — try again.</p>
        )}

        {locked && (
          <button className="btn btn--primary" style={{ width: '100%', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} disabled={downloading} onClick={download}>
            {downloading ? 'Preparing…' : <><IconDownload size={14} /> Download Flyer</>}
          </button>
        )}
      </div>
    </div>
  );
}
