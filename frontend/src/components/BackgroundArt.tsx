// Original artwork, not a photo — I can't use real Premier League photos
// or player likenesses (copyright), so this is my own abstract take on
// match-day atmosphere: floodlight beams, a football's pentagon seams,
// pitch arcs and markings, and a scatter of crowd-flashbulb sparkle,
// sitting behind everything on the site. Uses soft solid glows rather
// than just thin outlines, since my cards use backdrop-blur — thin
// faint lines were getting blurred into total invisibility once
// content loaded, glows survive that much better. A few pieces carry a
// very slow, subtle breathing animation (long durations, small ranges)
// so the page feels alive without ever drawing the eye away from
// content — skipped entirely for anyone with reduced-motion set.
const SPARKLES = [
  { cx: 220, cy: 90, r: 2.2, delay: 0 }, { cx: 420, cy: 40, r: 1.6, delay: 1.4 },
  { cx: 640, cy: 130, r: 2.6, delay: 2.8 }, { cx: 860, cy: 55, r: 1.8, delay: 0.6 },
  { cx: 1020, cy: 150, r: 2.2, delay: 3.6 }, { cx: 1220, cy: 70, r: 1.6, delay: 2.1 },
  { cx: 150, cy: 220, r: 1.8, delay: 1.9 }, { cx: 760, cy: 200, r: 1.4, delay: 4.2 },
  { cx: 1440, cy: 140, r: 2, delay: 0.9 }, { cx: 980, cy: 260, r: 1.6, delay: 3.1 },
  { cx: 340, cy: 260, r: 1.4, delay: 2.5 }, { cx: 1300, cy: 260, r: 1.8, delay: 1.1 },
];

export default function BackgroundArt() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          <radialGradient id="floodlight" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#00ff85" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#00ff85" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="floodlight2" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#04f5ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#04f5ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="floodlight3" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#ff2882" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ff2882" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Faint full-width pitch marking through the middle — anchors
            the whole page as "a pitch", not just the corners */}
        <g stroke="#ffffff" strokeOpacity="0.045" strokeWidth="2.5" fill="none">
          <line x1="140" y1="500" x2="1460" y2="500" />
          <circle cx="800" cy="500" r="95" />
          <circle cx="800" cy="500" r="3" fill="#ffffff" fillOpacity="0.06" stroke="none" />
        </g>

        {/* A broadcast-graphic diagonal sweep for a bit of compositional
            energy, echoing the sport's own on-screen graphics language */}
        <polygon
          points="900,-40 1180,-40 760,520 480,520"
          fill="var(--purple-light)"
          opacity="0.14"
        />

        {/* Floodlight glows, top corners — solid gradient fills, not thin
            strokes, so they still read through a blurred card on top */}
        <polygon className="bg-pulse-a" points="60,0 260,0 520,440 -200,440" fill="url(#floodlight)" />
        <polygon className="bg-pulse-b" points="1540,0 1340,0 1080,440 1800,440" fill="url(#floodlight2)" />
        <circle className="bg-pulse-c" cx="800" cy="150" r="260" fill="url(#floodlight3)" />

        {/* Crowd flashbulb sparkle, scattered across the upper band */}
        <g fill="#ffffff">
          {SPARKLES.map((s, i) => (
            <circle
              key={i}
              className="bg-sparkle"
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fillOpacity="0.5"
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}
        </g>

        {/* Football, bottom-right — soft glow behind bolder line art */}
        <circle cx="1350" cy="780" r="260" fill="url(#ballGlow)" />
        <g className="bg-pulse-d" transform="translate(1350,780)" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="4" fill="none">
          <circle r="220" />
          <path d="M0,-220 L64,-176 L40,-108 L-40,-108 L-64,-176 Z" />
          <path d="M0,-220 L-64,-176 L-140,-220" />
          <path d="M64,-176 L140,-220" />
          <path d="M40,-108 L120,-70 L100,10" />
          <path d="M-40,-108 L-120,-70 L-100,10" />
          <circle cx="0" cy="-220" r="7" fill="#ffffff" fillOpacity="0.3" />
        </g>

        {/* Pitch arcs, bottom-left */}
        <circle cx="120" cy="960" r="220" fill="url(#ballGlow)" />
        <g stroke="#ffffff" strokeOpacity="0.2" strokeWidth="3.5" fill="none">
          <path d="M -100 1000 A 400 400 0 0 1 300 600" />
          <path d="M -60 1000 A 340 340 0 0 1 260 680" />
        </g>
      </svg>
    </div>
  );
}
