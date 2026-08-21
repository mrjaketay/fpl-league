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
    <div className="card" style={{ maxWidth: 360, margin: '2rem auto' }}>
      <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Admin Login</h2>
      <div onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="pill pill--pink">{error}</p>}
        <button className="btn btn--primary" onClick={handleSubmit}>Log in</button>
      </div>
    </div>
  );
}
