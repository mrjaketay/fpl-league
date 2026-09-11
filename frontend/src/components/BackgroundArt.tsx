// Original artwork, not a photo — I can't use real Premier League photos
// or player likenesses (copyright), so this is my own abstract take on
// match-day atmosphere: floodlight beams, a football's pentagon seams,
// and pitch arcs, sitting very faintly behind everything on the site.
export default function BackgroundArt() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, opacity: 0.1 }}
      >
        <defs>
          <radialGradient id="floodlight" cx="50%" cy="0%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floodlight beams, top corners */}
        <polygon points="60,0 260,0 500,420 -180,420" fill="url(#floodlight)" opacity="0.5" />
        <polygon points="1540,0 1340,0 1100,420 1780,420" fill="url(#floodlight)" opacity="0.5" />

        {/* Large football outline, bottom-right, cropped by viewport edge */}
        <g transform="translate(1350,780)" stroke="#ffffff" strokeWidth="2.5" fill="none">
          <circle r="220" />
          <path d="M0,-220 L64,-176 L40,-108 L-40,-108 L-64,-176 Z" />
          <path d="M0,-220 L-64,-176 L-140,-220" />
          <path d="M64,-176 L140,-220" />
          <path d="M40,-108 L120,-70 L100,10" />
          <path d="M-40,-108 L-120,-70 L-100,10" />
          <path d="M0,-220 L0,-260" />
          <circle cx="0" cy="-220" r="6" fill="#ffffff" />
        </g>

        {/* Pitch arcs, bottom-left */}
        <g stroke="#ffffff" strokeWidth="2" fill="none">
          <path d="M -100 1000 A 400 400 0 0 1 300 600" />
          <path d="M -60 1000 A 340 340 0 0 1 260 680" />
          <circle cx="120" cy="960" r="3" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
