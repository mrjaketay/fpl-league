import { ReactNode, useState } from 'react';

// Card with a title that folds/unfolds. Open/closed is remembered per viewer.
function readSaved(id: string, fallback: boolean) {
  try {
    const v = localStorage.getItem(`fold:${id}`);
    return v === null ? fallback : v === '1';
  } catch {
    return fallback;
  }
}

export default function Foldable({
  id, title, actions, children, className = 'card fade-in', defaultOpen = true,
}: {
  id: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(() => readSaved(id, defaultOpen));

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try { localStorage.setItem(`fold:${id}`, next ? '1' : '0'); } catch { /* ignore */ }
  };

  return (
    <div className={className}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: open ? '1rem' : 0 }}>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 0, padding: 0, color: 'inherit', cursor: 'pointer', font: 'inherit' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }} aria-hidden="true">
            <polyline points="9 6 15 12 9 18" />
          </svg>
          <span className="section-heading" style={{ marginBottom: 0 }}>{title}</span>
        </button>
        {actions}
      </div>
      {open && children}
    </div>
  );
}
