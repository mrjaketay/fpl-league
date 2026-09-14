// Street-art take on a Hall of Fame medal — spray-can gradient fill,
// uneven laurel strokes, slight tilt, same "sprayed on a wall" energy
// as GraffitiTrophy.
export default function GraffitiHOF({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hof-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#04f5ff" />
          <stop offset="55%" stopColor="#00ff85" />
          <stop offset="100%" stopColor="#ffd23f" />
        </linearGradient>
      </defs>
      <g transform="rotate(5 32 32)">
        {/* Ribbon tails */}
        <path d="M24 34 L16 58 L26 52 L30 58 Z" fill="url(#hof-fill)" stroke="#1c0021" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M40 34 L48 58 L38 52 L34 58 Z" fill="url(#hof-fill)" stroke="#1c0021" strokeWidth="2.5" strokeLinejoin="round" />
        {/* Medal disc */}
        <circle cx="32" cy="28" r="18" fill="url(#hof-fill)" stroke="#1c0021" strokeWidth="3" />
        <circle cx="32" cy="28" r="11" fill="none" stroke="#1c0021" strokeWidth="2" opacity="0.6" strokeDasharray="3 3" />
        {/* Star */}
        <path d="M32 20 L34.2 25.6 L40 26.2 L35.5 29.9 L37 35.5 L32 32.3 L27 35.5 L28.5 29.9 L24 26.2 L29.8 25.6 Z" fill="#1c0021" />
        {/* Spray drip */}
        <path d="M46 22 C49 27 48 31 44 33" fill="none" stroke="#1c0021" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </g>
    </svg>
  );
}
