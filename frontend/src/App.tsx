import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Standings from './pages/Standings';
import Awards from './pages/Awards';
import H2H from './pages/H2H';
import LeagueStats from './pages/LeagueStats';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { api } from './api/client';
import LeagueLogo from './components/LeagueLogo';
import BackgroundArt from './components/BackgroundArt';
import BackToTop from './components/BackToTop';

const navStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--green)' : 'var(--white)',
  opacity: isActive ? 1 : 0.75,
  textDecoration: 'none',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '0.9rem',
  paddingBottom: '0.3rem',
  borderBottom: isActive ? '2px solid var(--green)' : '2px solid transparent',
  transition: 'color 0.15s ease, opacity 0.15s ease, border-color 0.15s ease',
});

const SUBHEADS = [
  'Glory, banter, and bragging rights.',
  'Where legends rise and donkeys are crowned.',
  'Every gameweek, someone becomes a story.',
];

export default function App() {
  const [leagueName, setLeagueName] = useState<string | null>(null);
  const location = useLocation();
  // Admin gets its own full-page dashboard layout — a real admin panel
  // doesn't sit inside the marketing-site header and centered column,
  // it takes the whole viewport, so I skip my usual header/width
  // constraints specifically for this route.
  const isAdmin = location.pathname.startsWith('/admin') || location.pathname === '/login';

  useEffect(() => {
    api.info().then((d) => setLeagueName(d.name)).catch(() => {});
  }, []);

  // Browser tab should show the actual league name, not a generic
  // placeholder — falls back to the static index.html title until
  // the league name loads.
  useEffect(() => {
    if (leagueName) document.title = `${leagueName} — Mini League HQ`;
  }, [leagueName]);

  // Nudge the page down a little on first load of each route so a
  // visitor scanning a tall page realizes there's more below the
  // fold, then settles back to the top. Skipped for anyone who's
  // asked their OS for reduced motion.
  useEffect(() => {
    if (isAdmin) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.scrollHeight <= window.innerHeight + 80) return;
    const down = setTimeout(() => {
      window.scrollTo({ top: 220, behavior: 'smooth' });
    }, 650);
    const up = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1550);
    return () => {
      clearTimeout(down);
      clearTimeout(up);
    };
  }, [location.pathname, isAdmin]);

  const initials = (leagueName || 'FPL')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const subhead = SUBHEADS[new Date().getDate() % SUBHEADS.length];

  if (isAdmin) {
    return (
      <>
        <BackgroundArt />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
        <BackToTop />
      </>
    );
  }

  return (
    <>
      <BackgroundArt />
      <header className="site-header">
        <div className="site-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <LeagueLogo initials={initials} size={48} />
            <div>
              <h1 style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>{leagueName || 'Loading league…'}</h1>
              <span style={{ fontSize: '0.78rem', color: 'var(--grey)' }}>{subhead}</span>
            </div>
          </div>
          <nav style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
            <NavLink to="/" style={navStyle} end>Home</NavLink>
            <NavLink to="/standings" style={navStyle}>Standings</NavLink>
            <NavLink to="/awards" style={navStyle}>Awards</NavLink>
            <NavLink to="/h2h" style={navStyle}>H2H</NavLink>
            <NavLink to="/stats" style={navStyle}>League Stats</NavLink>
            <NavLink to="/admin" style={navStyle}>Admin</NavLink>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem clamp(1.25rem, 4vw, 3rem) 3rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/h2h" element={<H2H />} />
          <Route path="/stats" element={<LeagueStats />} />
        </Routes>
      </div>
      <BackToTop />
    </>
  );
}
