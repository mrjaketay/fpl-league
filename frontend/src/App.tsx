import { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Standings from './pages/Standings';
import Awards from './pages/Awards';
import H2H from './pages/H2H';
import LeagueStats from './pages/LeagueStats';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { api } from './api/client';
import LeagueLogo from './components/LeagueLogo';

const navStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--green)' : 'var(--white)',
  opacity: isActive ? 1 : 0.75,
  textDecoration: 'none',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '0.9rem',
});

const SUBHEADS = [
  'Glory, banter, and bragging rights.',
  'Where legends rise and donkeys are crowned.',
  'Every gameweek, someone becomes a story.',
];

export default function App() {
  const [leagueName, setLeagueName] = useState<string | null>(null);

  useEffect(() => {
    api.info().then((d) => setLeagueName(d.name)).catch(() => {});
  }, []);

  const initials = (leagueName || 'FPL')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const subhead = SUBHEADS[new Date().getDate() % SUBHEADS.length];

  return (
    // Widened from 1080 -> 1400 and padding scales with the viewport
    // (clamp) so the page fills more of a desktop screen instead of
    // leaving large empty margins either side, closer to how the
    // official FPL site uses its width.
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '1.5rem clamp(1.25rem, 4vw, 3rem) 3rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
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
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/h2h" element={<H2H />} />
        <Route path="/stats" element={<LeagueStats />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}
