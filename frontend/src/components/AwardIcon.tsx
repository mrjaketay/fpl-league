// Single icon system for the whole site — one consistent line style
// (24x24, currentColor stroke) instead of emoji or a second competing
// icon set. AwardIcon keeps its old kind-based API so the pages that
// already call it (Home, Standings, AwardPoster) don't need to change;
// everywhere else that used a raw emoji imports one of the named icons
// below directly.
type IconProps = { size?: number };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconTrophy({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 5H5a3 3 0 0 0 3 4" />
      <path d="M16 5h3a3 3 0 0 1-3 4" />
      <path d="M12 13v3" />
      <path d="M9 20h6" />
      <path d="M10.3 16h3.4l.5 4h-4.4z" />
    </svg>
  );
}

// Upside-down horseshoe — the "bad luck" symbol, standing in for the
// donkey without leaning on the literal animal.
export function IconHorseshoe({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M6 8a6 6 0 0 1 12 0v5" />
      <path d="M6 13v6M18 13v6" />
      <circle cx="6" cy="16.3" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="18" cy="16.3" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconShieldCheck({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 3l7 3v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconShieldAlert({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 3l7 3v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
      <path d="M12 8v4.2" />
      <circle cx="12" cy="15.2" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTarget({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBolt({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12.5 3L5 13.5h5.2L10.8 21 19 10h-5.4z" />
    </svg>
  );
}

export function IconMedal({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="12" cy="14.5" r="5.5" />
      <path d="M9.5 9.7L7 3h3l2 4.6L14 3h3l-2.5 6.7" />
    </svg>
  );
}

export function IconSkull({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 3.5c-4 0-7 2.9-7 7 0 2.6 1.3 4.4 2.7 5.6V19h2.1v-1.6h4.4V19h2.1v-2.9C17.7 14.9 19 13.1 19 10.5c0-4.1-3-7-7-7z" />
      <circle cx="9.3" cy="10.3" r="1.3" />
      <circle cx="14.7" cy="10.3" r="1.3" />
      <path d="M11.3 13h1.4l-.7 1.4z" />
    </svg>
  );
}

export function IconChair({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M6 4v9.5M18 4v16M6 13.5h12M6 13.5V20" />
    </svg>
  );
}

export function IconTrendDown({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M4 6l6.5 6.5L14 9l6 6" />
      <path d="M20 9.5V15h-5.5" />
    </svg>
  );
}

export function IconTrendUp({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M4 18l6.5-6.5L14 15l6-6" />
      <path d="M14.5 9H20v5.5" />
    </svg>
  );
}

export function IconRefresh({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v5.5h-5.5" />
    </svg>
  );
}

export function IconUsers({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <circle cx="17.5" cy="9.5" r="2.3" />
      <path d="M15.5 14.3c2.4.5 4 2.6 4 5.2" />
    </svg>
  );
}

export function IconSettings({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </svg>
  );
}

export function IconImage({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M3 16l5-5 4 4 3-3 6 6" />
    </svg>
  );
}

export function IconSave({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M8 4v5h8V4" />
      <rect x="8" y="13.5" width="8" height="6.5" />
    </svg>
  );
}

export function IconSwords({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M4 20L15 9M20 4L9 15" />
      <path d="M4 4h4M4 4v4M20 20h-4M20 20v-4" />
    </svg>
  );
}

export function IconLogOut({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M14 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h8" />
      <path d="M10 12h10M16 8l4 4-4 4" />
    </svg>
  );
}

export function IconCrown({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M4 17h16l-1.5-8-4 3-2.5-5-2.5 5-4-3z" />
      <path d="M5 19.5h14" />
    </svg>
  );
}

export function IconRocket({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 2c3 2 4 5 4 9 0 2-1 4-4 6-3-2-4-4-4-6 0-4 1-7 4-9z" />
      <circle cx="12" cy="9" r="1.4" />
      <path d="M8 15l-2 4M16 15l2 4M10 19h4" />
    </svg>
  );
}

export function IconCards({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="5.5" y="3.5" width="9" height="13" rx="1.3" transform="rotate(-10 10 10)" />
      <rect x="9.5" y="7.5" width="9" height="13" rx="1.3" />
      <circle cx="14" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconAlertTriangle({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconLock({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconSparkles({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 3l1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2z" />
      <path d="M19 15l.5 2 2 .5-2 .5-.5 2-.5-2-2-.5 2-.5z" />
    </svg>
  );
}

export function IconCalendarStar({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17" />
      <path d="M8 3v3.5M16 3v3.5" />
      <path d="M12 12l1 2.1 2.3.3-1.7 1.6.4 2.3-2-1.1-2 1.1.4-2.3-1.7-1.6 2.3-.3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconDownload({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 19h16" />
    </svg>
  );
}

// --- Award kind lookup — kept as the default export so existing call
// sites (Home.tsx, Standings.tsx, AwardPoster.tsx, Awards.tsx) can keep
// passing a plain `kind` string instead of importing components. ---
export type AwardKind =
  | 'motw' | 'dotw' | 'defense' | 'midfield' | 'attack' | 'hof'
  | 'curse' | 'bench' | 'villain' | 'sieve' | 'month';

const AWARD_KIND_MAP: Record<AwardKind, (p: IconProps) => JSX.Element> = {
  motw: IconTrophy,
  dotw: IconHorseshoe,
  defense: IconShieldCheck,
  midfield: IconTarget,
  attack: IconBolt,
  hof: IconMedal,
  curse: IconSkull,
  bench: IconChair,
  villain: IconTrendDown,
  sieve: IconShieldAlert,
  month: IconCalendarStar,
};

export default function AwardIcon({ kind, size = 18 }: { kind: AwardKind; size?: number }) {
  const Icon = AWARD_KIND_MAP[kind] ?? IconTarget;
  return <Icon size={size} />;
}
