type Kind = 'motw' | 'dotw' | 'defense' | 'midfield' | 'attack' | 'hof';

// Small branded icon set for awards — replaces plain emoji with something
// that matches the site's own gradient/shield visual language.
export default function AwardIcon({ kind, size = 40 }: { kind: Kind; size?: number }) {
  // Real emoji requested for these two specifically — trophy and donkey
  // read better as actual emoji than a vector reinterpretation of them.
  if (kind === 'motw') {
    return <span style={{ fontSize: size * 1.15, lineHeight: 1, display: 'inline-block' }}>🏆</span>;
  }
  if (kind === 'dotw') {
    return <span style={{ fontSize: size * 1.15, lineHeight: 1, display: 'inline-block' }}>🫏</span>;
  }

  const id = `ai-${kind}`;
  const gradId = `${id}-g`;

  const gradients: Record<Kind, [string, string]> = {
    motw: ['#00ff85', '#04f5ff'],
    dotw: ['#ff2882', '#d1006b'],
    defense: ['#04f5ff', '#0072ff'],
    midfield: ['#00ff85', '#04f5ff'],
    attack: ['#ffb627', '#ff2882'],
    hof: ['#ffd23f', '#ff8a00'],
  };
  const [c1, c2] = gradients[kind];

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>

      {kind === 'defense' && (
        <path fill={`url(#${gradId})`} d="M24 4 L40 10 V22 C40 32 33 40 24 44 C15 40 8 32 8 22 V10 Z" />
      )}

      {kind === 'midfield' && (
        <g fill={`url(#${gradId})`}>
          <circle cx="24" cy="24" r="20" opacity="0.25" />
          <circle cx="24" cy="24" r="13" opacity="0.5" />
          <circle cx="24" cy="24" r="6" />
        </g>
      )}

      {kind === 'attack' && (
        <path fill={`url(#${gradId})`} d="M27 2 L11 26 H21 L18 46 L38 18 H26 Z" />
      )}

      {kind === 'hof' && (
        <g fill={`url(#${gradId})`}>
          <path d="M24 4 L29 16 L42 17.5 L32.5 26 L35.5 39 L24 32 L12.5 39 L15.5 26 L6 17.5 L19 16 Z" />
        </g>
      )}
    </svg>
  );
}
