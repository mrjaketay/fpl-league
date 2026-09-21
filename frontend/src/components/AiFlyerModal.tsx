import { useEffect, useRef, useState } from 'react';

// Pollinations.ai is genuinely free with no signup or API key — I just
// build a URL and it returns an image. I only use it for an abstract
// background vibe, never for the actual team names: AI image models
// can't reliably render legible text, so the real fixture data is a
// normal HTML overlay on top, not something the AI drew.
function buildImageUrl(gw: number) {
  const prompt = `abstract dynamic soccer stadium floodlights energetic gradient background, purple and green and cyan neon, no text, no people, no logos, digital art poster background`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1350&seed=${gw}&nologo=true`;
}

export default function AiFlyerModal({
  gw,
  fixtures,
  onClose,
}: {
  gw: number;
  fixtures: { team_1_name: string; team_2_name: string }[];
  onClose: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const flyerRef = useRef<HTMLDivElement>(null);
  const imageUrl = buildImageUrl(gw);

  useEffect(() => {
    setImageLoaded(false);
    setImageFailed(false);
  }, [gw]);

  async function download() {
    if (!flyerRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(flyerRef.current, {
        backgroundColor: '#1c0021',
        scale: 2,
        useCORS: true,
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `h2h-fixtures-gw${gw}-ai.png`;
      a.click();
    } catch {
      setImageFailed(true);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="card modal-card modal-card--wide" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <span className="field-label">AI-Generated Flyer</span>
        <h2 style={{ fontSize: '1.1rem', marginTop: '0.2rem', marginBottom: '1rem' }}>Gameweek {gw} Fixtures</h2>

        <div
          ref={flyerRef}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 5',
            borderRadius: 10,
            overflow: 'hidden',
            background: '#1c0021',
          }}
        >
          <img
            src={imageUrl}
            crossOrigin="anonymous"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(28,0,33,0.3) 0%, rgba(28,0,33,0.85) 65%, rgba(28,0,33,0.95) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.4rem', color: 'var(--white)', marginBottom: '1rem' }}>
              GAMEWEEK {gw} <span style={{ color: 'var(--green)' }}>FIXTURES</span>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {fixtures.slice(0, 8).map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--white)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <span>{f.team_1_name}</span>
                  <span style={{ color: 'var(--grey)' }}>vs</span>
                  <span style={{ textAlign: 'right' }}>{f.team_2_name}</span>
                </div>
              ))}
            </div>
          </div>
          {!imageLoaded && !imageFailed && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--grey)' }}>
              Generating background…
            </div>
          )}
        </div>

        {imageFailed && (
          <p className="pill pill--pink" style={{ marginTop: '0.75rem' }}>
            The free AI image service didn't respond — it's rate-limited and occasionally busy. Try again in a moment.
          </p>
        )}

        <button className="btn btn--primary" style={{ width: '100%', marginTop: '1rem' }} disabled={downloading || !imageLoaded} onClick={download}>
          {downloading ? 'Preparing…' : '⬇ Download Flyer'}
        </button>
      </div>
    </div>
  );
}
