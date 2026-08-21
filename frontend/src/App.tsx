import { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Standings from './pages/Standings';
import Awards from './pages/Awards';
import H2H from './pages/H2H';
import LeagueStats from './pages/LeagueStats';
import Login from './pages/Login';
import Admin from './pages/Admin';
import { api } from './api/client';

const navStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--green)' : 'var(--white)',
  opacity: isActive ? 1 : 0.75,
  textDecoration: 'none',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '0.9rem',
});

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

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: '1.5rem 1.25rem 3rem' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green), var(--cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--purple-deep)', fontSize: '1rem',
          }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', lineHeight: 1.1 }}>{leagueName || 'Loading league…'}</h1>
            <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--grey)' }}>FPL MINI-LEAGUE HQ</span>
          </div>
        </div>
        <nav style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <NavLink to="/" style={navStyle} end>Standings</NavLink>
          <NavLink to="/awards" style={navStyle}>Awards</NavLink>
          <NavLink to="/h2h" style={navStyle}>H2H</NavLink>
          <NavLink to="/stats" style={navStyle}>League Stats</NavLink>
          <NavLink to="/admin" style={navStyle}>Admin</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Standings />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/h2h" element={<H2H />} />
        <Route path="/stats" element={<LeagueStats />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}
