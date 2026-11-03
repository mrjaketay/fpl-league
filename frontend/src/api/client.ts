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
    // token expired or was rejected while logged in: log out and go to login
    if (res.status === 401 && token) {
      clearToken();
      window.location.href = '/login';
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  info: () => request('/api/league/info'),
  standings: (gw?: number) => request(gw ? `/api/league/standings?gw=${gw}` : '/api/league/standings'),
  form: () => request('/api/league/form'),
  gameweekStats: (gw: number) => request(`/api/league/gameweek/${gw}`),
  gameweekAwards: (gw: number) => request(`/api/league/awards/gameweek/${gw}`),
  seasonTally: () => request('/api/league/awards/season-tally'),
  quarterlyAwards: (quarter: number) => request(`/api/league/awards/quarterly/${quarter}`),
  h2hGameweek: (gw: number) => request(`/api/league/h2h/gameweek/${gw}`),
  h2hTable: () => request('/api/league/h2h/table'),
  captainStats: (gw: number) => request(`/api/league/stats/captains/${gw}`),
  chipStats: () => request('/api/league/stats/chips'),
  latestGameweek: () => request('/api/league/latest-gameweek'),
  hallOfFame: () => request('/api/league/awards/hall-of-fame'),
  longevity: () => request('/api/league/stats/longevity'),
  priceChanges: () => request('/api/league/price-changes'),
  homeBundle: () => request('/api/league/home-bundle'),
  team: (entryId: number, gw: number) => request(`/api/league/team/${entryId}/${gw}`),
  flyers: (gw: number) => request(`/api/league/flyers/${gw}`),
  monthlyAward: (month: number) => request(`/api/league/awards/monthly/${month}`),
  latestMonthlyAward: () => request(`/api/league/awards/monthly/latest`),
  quarterlyLeaderboard: (quarter: number) => request(`/api/league/stats/quarterly-leaderboard/${quarter}`),
  quickStats: () => request('/api/league/quick-stats'),

  login: (email: string, password: string) =>
    request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  syncGameweek: (gw: number) => request(`/api/admin/sync/${gw}`, { method: 'POST' }),
  syncCurrent: () => request('/api/admin/sync/current', { method: 'POST' }),
  resyncAll: () => request('/api/admin/resync-all', { method: 'POST' }),
  recomputeQuarterly: (quarter: number) =>
    request(`/api/admin/awards/quarterly/${quarter}`, { method: 'POST' }),
  generateH2H: (startGameweek: number, totalGameweeks: number) =>
    request('/api/admin/h2h/generate', {
      method: 'POST',
      body: JSON.stringify({ startGameweek, totalGameweeks }),
    }),
  getSettings: () => request('/api/admin/settings'),
  updateSetting: (key: string, value: unknown) =>
    request(`/api/admin/settings/${key}`, { method: 'PUT', body: JSON.stringify({ value }) }),
  uploadFlyer: (gameweek: number, award_type: string, image: string) =>
    request('/api/admin/flyers', { method: 'PUT', body: JSON.stringify({ gameweek, award_type, image }) }),
  deleteFlyer: (gameweek: number, award_type: string) =>
    request(`/api/admin/flyers/${gameweek}/${award_type}`, { method: 'DELETE' }),
  recomputeMonthly: (month: number) => request(`/api/admin/awards/monthly/${month}`, { method: 'POST' }),
  exportData: () => request('/api/admin/export'),
  getManagers: () => request('/api/admin/managers'),
  suspendManager: (entryId: number, fromGameweek: number | null) =>
    request(`/api/admin/managers/${entryId}/suspend`, { method: 'PUT', body: JSON.stringify({ fromGameweek }) }),
  getH2hFixtures: () => request('/api/admin/h2h/fixtures'),
  regenerateH2h: (startGameweek: number, totalGameweeks: number) =>
    request('/api/admin/h2h/regenerate', { method: 'POST', body: JSON.stringify({ startGameweek, totalGameweeks }) }),
};

// Admin session: the token itself expires after 2 hours (set on the
// server) and I'm also logged out after 15 minutes without any activity.
const IDLE_LIMIT_MS = 15 * 60 * 1000;

function tokenExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return !payload.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

function lastActive() {
  return Number(localStorage.getItem('admin_last_active') || 0);
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
  localStorage.setItem('admin_last_active', String(Date.now()));
}
export function clearToken() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_last_active');
}
export function isLoggedIn() {
  const token = getToken();
  if (!token) return false;
  if (tokenExpired(token) || Date.now() - lastActive() > IDLE_LIMIT_MS) {
    clearToken();
    return false;
  }
  return true;
}

// Call once at startup. Keeps the activity time fresh while I'm using the
// site and logs me out (back to login) once the limits above are hit.
let watching = false;
export function startSessionWatch() {
  if (watching) return;
  watching = true;
  let lastWrite = 0;
  const touch = () => {
    const now = Date.now();
    if (now - lastWrite < 5000 || !getToken()) return;
    lastWrite = now;
    localStorage.setItem('admin_last_active', String(now));
  };
  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((ev) => window.addEventListener(ev, touch, { passive: true }));
  setInterval(() => {
    if (getToken() && !isLoggedIn()) {
      window.location.href = window.location.pathname.startsWith('/admin') ? '/login' : window.location.pathname;
    }
  }, 30000);
}
