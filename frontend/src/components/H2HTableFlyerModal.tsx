import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import LeagueLogo from './LeagueLogo';
import { IconDownload } from './AwardIcon';

// Same 540x675 canvas as the other flyers, scaled to fit the modal.
const W = 540;
const H = 675;

const SPARKS = [
  [60, 40, 1.6], [180, 24, 1.2], [330, 56, 1.8], [470, 30, 1.3], [505, 110, 1.5],
  [30, 150, 1.3], [250, 120, 1.1], [420, 150, 1.4],
];

type Row = {
  team_name: string;
  played: number | string;
  won: number | string;
  drawn: number | string;
  lost: number | string;
  diff: number | string;
  league_points: number | string;
};

function initialsOf(name: string) {
  return (name || 'FPL').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function H2HTableFlyerModal({ table, onClose }: { table: Row[]; onClose: () => void }) {
  const [leagueName, setLeagueName] = useState('');
  const [scale, setScale] = useState(0.85);
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.info().then((d) => setLeagueName(d.name)).catch(() => {});
  }, []);

  useLayoutEffect(() => {
    function fit() {
      if (wrapRef.current) setScale(wrapRef.current.clientWidth / W);
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  const rows = table.slice(0, 18);
  const matches = Math.max(0, ...rows.map((r) => Number(r.played)));

  // rows get a bit tighter when there are lots of teams so they all fit
  const gap = 3;
  const listHeight = 372;
  const rowH = Math.max(18, Math.min(34, Math.floor((listHeight - (rows.length - 1) * gap) / Math.max(rows.length, 1))));
  const fontSize = rowH < 24 ? 12 : 14;

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
          const wrap = doc.getElementById('tflyer-wrap');
          const flyer = doc.getElementById('tflyer-canvas');
          if (wrap) { wrap.style.height = `${H}px`; wrap.style.overflow = 'visible'; }
          if (flyer) flyer.style.transform = 'none';
        },
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'h2h-league-table.png';
      a.click();
    } catch {
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  }

  const host = typeof window !== 'undefined' ? window.location.host : '';
  const num = (w: number, color = '#f6f6fa', bold = false): React.CSSProperties => ({
    width: w, textAlign: 'center', flexShrink: 0, fontFamily: 'Space Mono, monospace', fontSize: fontSize - 1,
    color, fontWeight: bold ? 700 : 400,
  });
  const head = (w: number): React.CSSProperties => ({
    width: w, textAlign: 'center', flexShrink: 0, fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: '0.12em', color: '#8f8aa0',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card modal-card--wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <span className="field-label">Flyer</span>
        <h2 style={{ fontSize: '1.1rem', marginTop: '0.2rem', marginBottom: '1rem' }}>H2H league table</h2>

        <div id="tflyer-wrap" ref={wrapRef} style={{ position: 'relative', width: '100%', height: H * scale, overflow: 'hidden', borderRadius: 10 }}>
          <div
            id="tflyer-canvas"
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
                <linearGradient id="tf-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#2c0033" />
                  <stop offset="1" stopColor="#14001a" />
                </linearGradient>
                <radialGradient id="tf-g1" cx="0.1" cy="0" r="0.8">
                  <stop offset="0" stopColor="#00ff85" stopOpacity="0.38" />
                  <stop offset="1" stopColor="#00ff85" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="tf-g2" cx="1" cy="1" r="0.8">
                  <stop offset="0" stopColor="#04f5ff" stopOpacity="0.3" />
                  <stop offset="1" stopColor="#04f5ff" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="tf-g3" cx="0.9" cy="0.05" r="0.6">
                  <stop offset="0" stopColor="#ff2882" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#ff2882" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={W} height={H} fill="url(#tf-bg)" />
              <rect width={W} height={H} fill="url(#tf-g1)" />
              <rect width={W} height={H} fill="url(#tf-g3)" />
              <rect width={W} height={H} fill="url(#tf-g2)" />
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
                <div style={{ width: 5, height: 64, background: '#00ff85', borderRadius: 3, marginBottom: 4 }} />
                <div>
                  <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, letterSpacing: '0.28em', color: '#00ff85', marginBottom: 2 }}>SEASON</div>
                  <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 44, lineHeight: 1, letterSpacing: '-0.03em' }}>H2H TABLE</div>
                </div>
              </div>
            </div>

            {/* table */}
            <div style={{ position: 'absolute', left: 36, right: 36, top: 178 }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px', height: 20, marginBottom: 4 }}>
                <span style={head(26)}>#</span>
                <span style={{ ...head(0), flex: 1, textAlign: 'left', paddingLeft: 6 }}>TEAM</span>
                <span style={head(26)}>P</span>
                <span style={head(26)}>W</span>
                <span style={head(26)}>D</span>
                <span style={head(26)}>L</span>
                <span style={head(42)}>DIFF</span>
                <span style={head(40)}>PTS</span>
              </div>
              <div style={{ display: 'grid', gap }}>
                {rows.map((r, i) => {
                  const lead = i === 0;
                  const diff = Number(r.diff);
                  const nameLen = r.team_name.length;
                  return (
                    <div key={i} style={{
                      height: rowH, display: 'flex', alignItems: 'center', padding: '0 10px',
                      background: lead ? 'rgba(0,255,133,0.12)' : 'rgba(0,0,0,0.36)',
                      border: `1px solid ${lead ? 'rgba(0,255,133,0.45)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8,
                    }}>
                      <span style={num(26, lead ? '#00ff85' : '#8f8aa0', true)}>{i + 1}</span>
                      <span style={{
                        flex: 1, minWidth: 0, paddingLeft: 6, overflow: 'hidden', whiteSpace: 'nowrap',
                        fontSize: nameLen > 30 ? fontSize - 3 : nameLen > 24 ? fontSize - 2 : fontSize,
                        fontWeight: lead ? 700 : 500, color: lead ? '#00ff85' : '#f6f6fa',
                      }}>{r.team_name}</span>
                      <span style={num(26)}>{r.played}</span>
                      <span style={num(26)}>{r.won}</span>
                      <span style={num(26)}>{r.drawn}</span>
                      <span style={num(26)}>{r.lost}</span>
                      <span style={num(42, diff > 0 ? '#00ff85' : diff < 0 ? '#ff2882' : '#8f8aa0')}>{diff > 0 ? '+' : ''}{r.diff}</span>
                      <span style={num(40, lead ? '#00ff85' : '#f6f6fa', true)}>{r.league_points}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* footer */}
            <div style={{ position: 'absolute', left: 36, right: 36, bottom: 26, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.1em', color: '#8f8aa0' }}>{host}</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: '0.14em', color: '#8f8aa0' }}>{matches} MATCH{matches === 1 ? '' : 'ES'} PLAYED</span>
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
