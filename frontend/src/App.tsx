import { Routes, Route, NavLink } from 'react-router-dom';
import Standings from './pages/Standings';
import Awards from './pages/Awards';
import H2H from './pages/H2H';
import Login from './pages/Login';
import Admin from './pages/Admin';

const navStyle = ({ isActive }: { isActive: boolean }) => ({
  color: isActive ? 'var(--amber)' : 'var(--chalk)',
  textDecoration: 'none',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.85rem',
  letterSpacing: '0.05em',
  textTransform: 'uppercase' as const,
});

export default function App() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.6rem' }}>
          THE LEAGUE <span style={{ color: 'var(--amber)' }}>TABLE</span>
        </h1>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          <NavLink to="/" style={navStyle} end>Standings</NavLink>
          <NavLink to="/awards" style={navStyle}>Awards</NavLink>
          <NavLink to="/h2h" style={navStyle}>H2H</NavLink>
          <NavLink to="/admin" style={navStyle}>Admin</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Standings />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/h2h" element={<H2H />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
}
