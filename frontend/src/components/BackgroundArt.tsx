// Original artwork, not a photo — I can't use real Premier League photos
// or player likenesses (copyright), so this is my own abstract take on
// match-day atmosphere: floodlight beams, a football's pentagon seams,
// and pitch arcs, sitting behind everything on the site. Uses soft solid
// glows rather than just thin outlines, since my cards use backdrop-blur
// — thin faint lines were getting blurred into total invisibility once
// content loaded, glows survive that much better.
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
          <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floodlight glows, top corners — solid gradient fills, not thin
            strokes, so they still read through a blurred card on top */}
        <polygon points="60,0 260,0 520,440 -200,440" fill="url(#floodlight)" />
        <polygon points="1540,0 1340,0 1080,440 1800,440" fill="url(#floodlight2)" />

        {/* Football, bottom-right — soft glow behind bolder line art */}
        <circle cx="1350" cy="780" r="260" fill="url(#ballGlow)" />
        <g transform="translate(1350,780)" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="4" fill="none">
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
