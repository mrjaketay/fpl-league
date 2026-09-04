// FPL's API doesn't expose custom team badges/crests for classic-league
// entries — there's nothing to fetch. So each team gets a generated
// badge instead: a consistent color (hashed from the team name, so the
// same team always gets the same color) plus its initials.
function hashColor(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return [`hsl(${hue}, 70%, 45%)`, `hsl(${(hue + 40) % 360}, 75%, 55%)`];
}

function initials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export default function TeamBadge({ teamName, size = 40 }: { teamName: string; size?: number }) {
  const [c1, c2] = hashColor(teamName);
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '30%',
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 800, color: '#fff',
        fontSize: size * 0.36,
        border: '2px solid rgba(255,255,255,0.25)',
        boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
        flexShrink: 0,
      }}
    >
      {initials(teamName)}
    </div>
  );
}
