// A bold, sprayed-on street-art style trophy for the League Leader
// spotlight — deliberately uneven strokes and a paint-drip line instead
// of a clean corporate icon, to match the "graffiti" look requested.
export default function GraffitiTrophy({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gt-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd23f" />
          <stop offset="55%" stopColor="#ff8a00" />
          <stop offset="100%" stopColor="#ff2882" />
        </linearGradient>
      </defs>
      <g transform="rotate(-4 32 32)">
        {/* Cup bowl — deliberately asymmetric strokes for a hand-sprayed feel */}
        <path
          d="M18 14 C16 26 18 36 32 38 C46 36 48 26 46 14 Z"
          fill="url(#gt-fill)"
          stroke="#1c0021"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Handles */}
        <path d="M18 17 C10 17 9 29 19 30" fill="none" stroke="#1c0021" strokeWidth="3" strokeLinecap="round" />
        <path d="M46 17 C54 17 55 29 45 30" fill="none" stroke="#1c0021" strokeWidth="3" strokeLinecap="round" />
        {/* Stem */}
        <path d="M28 38 L26 47 H38 L36 38 Z" fill="url(#gt-fill)" stroke="#1c0021" strokeWidth="3" strokeLinejoin="round" />
        {/* Base */}
        <rect x="20" y="47" width="24" height="6" rx="2" fill="url(#gt-fill)" stroke="#1c0021" strokeWidth="3" />
        {/* Paint drip */}
        <path d="M40 20 C42 26 41 30 38 32" fill="none" stroke="#1c0021" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        {/* Star accent, slightly off-kilter */}
        <path d="M32 18 L33.5 22 L38 22.5 L34.5 25.3 L35.6 29.5 L32 27 L28.4 29.5 L29.5 25.3 L26 22.5 L30.5 22 Z" fill="#1c0021" opacity="0.55" />
      </g>
    </svg>
  );
}
