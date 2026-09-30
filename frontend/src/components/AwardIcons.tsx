// Small hand-drawn icon set for the awards list — one consistent line
// style (24x24, currentColor stroke) instead of emoji, so every award
// row reads as the same visual language rather than whatever a random
// platform emoji font renders.
type IconProps = { size?: number };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconStar({ size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} {...base}>
      <path d="M12 3.5l2.47 5.18 5.53.7-4.05 3.98 1.02 5.64L12 16.2l-4.97 2.8 1.02-5.64-4.05-3.98 5.53-.7z" />
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
      <circle cx="12" cy="15.2" r="0.15" fill="currentColor" stroke="none" />
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
