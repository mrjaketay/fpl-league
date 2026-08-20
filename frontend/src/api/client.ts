const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  standings: () => request('/api/league/standings'),
  form: () => request('/api/league/form'),
  gameweekStats: (gw: number) => request(`/api/league/gameweek/${gw}`),
  gameweekAwards: (gw: number) => request(`/api/league/awards/gameweek/${gw}`),
  seasonTally: () => request('/api/league/awards/season-tally'),
  quarterlyAwards: (quarter: number) => request(`/api/league/awards/quarterly/${quarter}`),
  h2hGameweek: (gw: number) => request(`/api/league/h2h/gameweek/${gw}`),
  h2hTable: () => request('/api/league/h2h/table'),

  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  syncGameweek: (gw: number) => request(`/api/admin/sync/${gw}`, { method: 'POST' }),
  syncCurrent: () => request('/api/admin/sync/current', { method: 'POST' }),
  recomputeQuarterly: (quarter: number) =>
    request(`/api/admin/awards/quarterly/${quarter}`, { method: 'POST' }),
  generateH2H: (startGameweek: number, totalGameweeks: number) =>
    request('/api/admin/h2h/generate', {
      method: 'POST',
      body: JSON.stringify({ startGameweek, totalGameweeks }),
    }),
};

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}
export function clearToken() {
  localStorage.removeItem('admin_token');
}
export function isLoggedIn() {
  return !!getToken();
}
