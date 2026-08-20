import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setToken } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { token } = await api.login(email, password);
      setToken(token);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 360 }}>
      <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Admin Login</h2>
      <div onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 4, padding: '0.5rem', color: 'var(--chalk)' }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ background: 'transparent', border: '1px solid var(--line)', borderRadius: 4, padding: '0.5rem', color: 'var(--chalk)' }}
        />
        {error && <p className="mono pill pill--red">{error}</p>}
        <button
          onClick={handleSubmit}
          style={{ background: 'var(--amber)', border: 'none', borderRadius: 4, padding: '0.6rem', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
        >
          Log in
        </button>
      </div>
    </div>
  );
}
