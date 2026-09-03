// A generated crest for the league — used in the header and on the
// homepage. Pure SVG, no external image, so it scales cleanly and needs
// no asset hosting.
export default function LeagueLogo({ initials, size = 44 }: { initials: string; size?: number }) {
  const id = 'lg' + initials.replace(/\s/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff85" />
          <stop offset="100%" stopColor="#04f5ff" />
        </linearGradient>
        <linearGradient id={`${id}-shield`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4f0057" />
          <stop offset="100%" stopColor="#1c0021" />
        </linearGradient>
      </defs>
      {/* Shield outline */}
      <path
        d="M50 3 L92 16 V47 C92 74 74 90 50 97 C26 90 8 74 8 47 V16 Z"
        fill={`url(#${id}-shield)`}
        stroke={`url(#${id}-grad)`}
        strokeWidth="3"
      />
      {/* Star */}
      <path
        d="M50 16 L54 26 L65 27 L57 35 L59 46 L50 40 L41 46 L43 35 L35 27 L46 26 Z"
        fill={`url(#${id}-grad)`}
      />
      {/* Initials */}
      <text
        x="50" y="78"
        textAnchor="middle"
        fontFamily="Poppins, sans-serif"
        fontWeight="800"
        fontSize="26"
        fill="#f6f6fa"
      >
        {initials}
      </text>
      {/* Stitch line accent */}
      <path d="M22 55 Q50 68 78 55" stroke={`url(#${id}-grad)`} strokeWidth="1.5" fill="none" opacity="0.5" />
    </svg>
  );
}
