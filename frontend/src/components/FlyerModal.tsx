import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import LeagueLogo from './LeagueLogo';
import { IconDownload } from './AwardIcon';

// Flyer is drawn at a fixed 540x675 (4:5) and scaled down to fit the
// modal, so it looks the same on every screen and the download comes
// out the same size every time. Everything on it is plain HTML/SVG —
// the fixture text is real text, not something an image model drew.
const W = 540;
const H = 675;

type Fixture = {
  team_1_name: string;
  team_2_name: string;
  manager_1_name?: string;
  manager_2_name?: string;
  winner_name?: string | null;
  team_1_points?: number | null;
  team_2_points?: number | null;
};

const SPARKS = [
  [60, 40, 1.6], [180, 24, 1.2], [330, 56, 1.8], [470, 30, 1.3], [505, 110, 1.5],
  [30, 150, 1.3], [250, 120, 1.1], [420, 150, 1.4],
];

function initialsOf(name: string) {
  return (name || 'FPL').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function FlyerModal({
  gw,
  fixtures,
  onClose,
}: {
  gw: number;
  fixtures: Fixture[];
  onClose: () => void;
}) {
  const [leagueName, setLeagueName] = useState('');
  const [scale, setScale] = useState(0.85);
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.info().then((d) => setLeagueName(d.name)).catch(() => {});
  }, []);

  // fit the 540px flyer to whatever width the modal gives us
  useLayoutEffect(() => {
    function fit() {
      if (wrapRef.current) setScale(wrapRef.current.clientWidth / W);
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const rows = fixtures.slice(0, 8);
  const isPlayed = (f: Fixture) => f.team_1_points != null && f.team_2_points != null;
  const playedCount = rows.filter(isPlayed).length;
  const heading = playedCount === 0 ? 'FIXTURES' : playedCount === rows.length ? 'RESULTS' : 'FIXTURES & RESULTS';

  // rows shrink a little when there are a lot of them so it always fits
  const gap = 8;
  const listHeight = 372;
  const rowH = Math.max(34, Math.min(58, Math.floor((listHeight - (rows.length - 1) * gap) / Math.max(rows.length, 1))));
  const nameSize = rowH < 44 ? 13 : 15;

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
        // the on-screen copy is scaled with a CSS transform to fit the
        // modal — undo that in the clone so the capture is full size
        onclone: (doc) => {
          const wrap = doc.getElementById('flyer-wrap');
          const flyer = doc.getElementById('flyer-canvas');
          if (wrap) { wrap.style.height = `${H}px`; wrap.style.overflow = 'visible'; }
          if (flyer) flyer.style.transform = 'none';
        },
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `h2h-gw${gw}-${heading === 'RESULTS' ? 'results' : 'fixtures'}.png`;
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
        <h2 style={{ fontSize: '1.1rem', marginTop: '0.2rem', marginBottom: '1rem' }}>Gameweek {gw} {heading.toLowerCase()}</h2>

        <div id="flyer-wrap" ref={wrapRef} style={{ position: 'relative', width: '100%', height: H * scale, overflow: 'hidden', borderRadius: 10 }}>
          <div
            id="flyer-canvas"
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
                <linearGradient id="fl-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2c0033" />
                  <stop offset="1" stopColor="#14001a" />
                </linearGradient>
                <radialGradient id="fl-g1" cx="0.1" cy="0" r="0.8">
                  <stop offset="0" stopColor="#00ff85" stopOpacity="0.38" />
                  <stop offset="1" stopColor="#00ff85" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="fl-g2" cx="1" cy="1" r="0.8">
                  <stop offset="0" stopColor="#04f5ff" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#04f5ff" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="fl-g3" cx="0.9" cy="0.05" r="0.6">
                  <stop offset="0" stopColor="#ff2882" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#ff2882" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={W} height={H} fill="url(#fl-bg)" />
              <rect width={W} height={H} fill="url(#fl-g1)" />
              <rect width={W} height={H} fill="url(#fl-g3)" />
              <rect width={W} height={H} fill="url(#fl-g2)" />
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
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: '#04f5ff' }}>HEAD-TO-HEAD</div>
            </div>

            <div style={{ position: 'absolute', left: 36, right: 36, top: 92 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
                <div style={{ width: 5, height: 92, background: '#00ff85', borderRadius: 3, marginBottom: 6 }} />
                <div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.28em', color: '#00ff85', marginBottom: 2 }}>GAMEWEEK</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 84, lineHeight: 0.95, letterSpacing: '-0.04em' }}>{gw}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'right', paddingBottom: 10 }}>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: heading.length > 8 ? 22 : 30, letterSpacing: '-0.02em', color: '#00ff85' }}>{heading}</div>
                </div>
              </div>
            </div>

            {/* fixture rows */}
            <div style={{ position: 'absolute', left: 36, right: 36, top: 218, display: 'grid', gap }}>
              {rows.map((f, i) => {
                const played = isPlayed(f);
                const w1 = !!f.winner_name && f.winner_name === f.manager_1_name;
                const w2 = !!f.winner_name && f.winner_name === f.manager_2_name;
                // long names wrap onto a second line (a bit smaller) rather than getting chopped
                const side = (win: boolean, align: 'left' | 'right', name: string): React.CSSProperties => ({
                  flex: 1, minWidth: 0, textAlign: align, overflow: 'hidden', lineHeight: 1.15,
                  maxHeight: rowH - 8, overflowWrap: 'anywhere',
                  fontWeight: win ? 700 : 500, color: win ? '#00ff85' : '#f6f6fa',
                  fontSize: name.length > 17 ? nameSize - 2 : nameSize,
                });
                return (
                  <div key={i} style={{
                    height: rowH, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
                    background: 'rgba(0,0,0,0.36)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                  }}>
                    <span style={side(w1, 'left', f.team_1_name)}>{f.team_1_name}</span>
                    {played ? (
                      <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: nameSize + 1, width: 92, textAlign: 'center', flexShrink: 0 }}>
                        <span style={{ color: w1 ? '#00ff85' : '#f6f6fa' }}>{f.team_1_points}</span>
                        <span style={{ color: '#8f8aa0', margin: '0 7px' }}>–</span>
                        <span style={{ color: w2 ? '#00ff85' : '#f6f6fa' }}>{f.team_2_points}</span>
                      </span>
                    ) : (
                      <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', color: '#04f5ff', width: 92, textAlign: 'center', flexShrink: 0 }}>VS</span>
                    )}
                    <span style={side(w2, 'right', f.team_2_name)}>{f.team_2_name}</span>
                  </div>
                );
              })}
            </div>

            {/* footer */}
            <div style={{ position: 'absolute', left: 36, right: 36, bottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: '#8f8aa0' }}>{host}</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: '#8f8aa0' }}>GW{gw}</span>
            </div>
          </div>
        </div>

        {failed && (
          <p style={{ color: 'var(--red)', fontSize: '0.85rem', marginTop: '0.75rem' }}>Couldn't create the image — try again.</p>
        )}

        <button className="btn btn--primary" style={{ width: '100%', marginTop: '1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }} disabled={downloading} onClick={download}>
          {downloading ? 'Preparing…' : <><IconDownload size={14} /> Download Flyer</>}
        </button>
      </div>
    </div>
  );
}
