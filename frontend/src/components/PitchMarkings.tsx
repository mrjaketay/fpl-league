// Accurate top-down pitch markings, drawn to scale in a 300x400 viewBox
// (portrait, matching how a formation reads top-to-bottom: forwards near
// the top/attacking third, goalkeeper at the very bottom).
export default function PitchMarkings() {
  const stroke = 'rgba(255,255,255,0.55)';
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    >
      {/* Outer boundary */}
      <rect x="6" y="6" width="288" height="388" fill="none" stroke={stroke} strokeWidth="2" />
      {/* Halfway line */}
      <line x1="6" y1="200" x2="294" y2="200" stroke={stroke} strokeWidth="2" />
      {/* Center circle + spot */}
      <circle cx="150" cy="200" r="42" fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx="150" cy="200" r="2.5" fill={stroke} />
      {/* Top 18-yard box (attacking third, near forwards) */}
      <rect x="70" y="6" width="160" height="62" fill="none" stroke={stroke} strokeWidth="2" />
      <rect x="115" y="6" width="70" height="22" fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx="150" cy="50" r="2.5" fill={stroke} />
      <path d="M 115 68 A 42 42 0 0 0 185 68" fill="none" stroke={stroke} strokeWidth="2" />
      {/* Bottom 18-yard box (defensive third, near goalkeeper) */}
      <rect x="70" y="332" width="160" height="62" fill="none" stroke={stroke} strokeWidth="2" />
      <rect x="115" y="372" width="70" height="22" fill="none" stroke={stroke} strokeWidth="2" />
      <circle cx="150" cy="350" r="2.5" fill={stroke} />
      <path d="M 115 332 A 42 42 0 0 1 185 332" fill="none" stroke={stroke} strokeWidth="2" />
      {/* Corner arcs */}
      <path d="M 6 20 A 14 14 0 0 0 20 6" fill="none" stroke={stroke} strokeWidth="1.5" />
      <path d="M 280 6 A 14 14 0 0 0 294 20" fill="none" stroke={stroke} strokeWidth="1.5" />
      <path d="M 6 380 A 14 14 0 0 1 20 394" fill="none" stroke={stroke} strokeWidth="1.5" />
      <path d="M 294 380 A 14 14 0 0 1 280 394" fill="none" stroke={stroke} strokeWidth="1.5" />
    </svg>
  );
}
