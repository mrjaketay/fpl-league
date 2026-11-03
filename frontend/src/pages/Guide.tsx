import { useEffect, useRef, useState } from 'react';

// The ranking guide lives in public/how-it-works.html. Same origin, so I
// can read its height and size the frame to fit (no scrollbar inside).
export default function Guide() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let observer: ResizeObserver | null = null;

    function fit() {
      const doc = frame?.contentDocument;
      if (!doc) return;
      setHeight(doc.body.offsetHeight);
      observer?.disconnect();
      observer = new ResizeObserver(() => setHeight(doc.body.offsetHeight));
      observer.observe(doc.body);
    }

    frame.addEventListener('load', fit);
    if (frame.contentDocument?.readyState === 'complete') fit();
    return () => { frame.removeEventListener('load', fit); observer?.disconnect(); };
  }, []);

  return (
    <div>
      <div className="section-heading" style={{ marginBottom: '0.75rem' }}>HOW THE RANKINGS WORK</div>
      <iframe
        ref={frameRef}
        src="/how-it-works.html?embed"
        title="How the rankings work"
        style={{ width: '100%', height, border: 0, display: 'block', background: 'transparent' }}
      />
    </div>
  );
}
