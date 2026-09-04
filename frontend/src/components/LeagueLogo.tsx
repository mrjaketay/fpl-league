// A generated crest for the league — used in the header. Pure SVG, no
// external image, so it scales cleanly and needs no asset hosting.
export default function LeagueLogo({ initials, size = 44 }: { initials: string; size?: number }) {
  const id = 'lg' + initials.replace(/\s/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff85" />
          <stop offset="100%" stopColor="#04f5ff" />
        </linearGradient>
        <linearGradient id={`${id}-shield`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5c0066" />
          <stop offset="55%" stopColor="#37003c" />
          <stop offset="100%" stopColor="#1c0021" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter={`url(#${id}-shadow)`}>
        {/* Shield outline — rounded top, pointed base */}
        <path
          d="M50 4 C64 10 78 13 90 14 V44 C90 72 74 92 50 104 C26 92 10 72 10 44 V14 C22 13 36 10 50 4 Z"
          fill={`url(#${id}-shield)`}
          stroke={`url(#${id}-grad)`}
          strokeWidth="3"
        />
        <path
          d="M50 4 C64 10 78 13 90 14 V44 C90 72 74 92 50 104 C26 92 10 72 10 44 V14 C22 13 36 10 50 4 Z"
          fill={`url(#${id}-glow)`}
        />

        {/* Star */}
        <path
          d="M50 20 L54.5 31 L66 32.5 L57.5 41 L60 53 L50 46.5 L40 53 L42.5 41 L34 32.5 L45.5 31 Z"
          fill={`url(#${id}-grad)`}
        />

        {/* Initials */}
        <text
          x="50" y="88"
          textAnchor="middle"
          fontFamily="Poppins, sans-serif"
          fontWeight="800"
          fontSize="26"
          fill="#f6f6fa"
        >
          {initials}
        </text>

        {/* Stitch accent */}
        <path d="M20 62 Q50 76 80 62" stroke={`url(#${id}-grad)`} strokeWidth="1.5" fill="none" opacity="0.45" />
      </g>
    </svg>
  );
}
