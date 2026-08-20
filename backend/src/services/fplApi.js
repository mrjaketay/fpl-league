// Thin wrapper around the official (unofficial-but-public) FPL API.
// Base URL: https://fantasy.premierleague.com/api
// No API key required. FPL blocks CORS, which is why every call must
// happen from this backend, never directly from the frontend.

const BASE = 'https://fantasy.premierleague.com/api';

async function getJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'fpl-league-manager/1.0' },
  });
  if (!res.ok) {
    throw new Error(`FPL API request failed: ${res.status} ${url}`);
  }
  return res.json();
}

// Full player/team/gameweek reference data. Cache this in memory —
// it only changes a handful of times per season (plus prices daily).
let bootstrapCache = { data: null, fetchedAt: 0 };
export async function fetchBootstrap({ forceRefresh = false } = {}) {
  const ONE_HOUR = 60 * 60 * 1000;
  if (!forceRefresh && bootstrapCache.data && Date.now() - bootstrapCache.fetchedAt < ONE_HOUR) {
    return bootstrapCache.data;
  }
  const data = await getJson(`${BASE}/bootstrap-static/`);
  bootstrapCache = { data, fetchedAt: Date.now() };
  return data;
}

// element_type: 1 = GK, 2 = DEF, 3 = MID, 4 = FWD
export function positionOf(elementId, bootstrap) {
  const player = bootstrap.elements.find((e) => e.id === elementId);
  return player ? player.element_type : null;
}

// Classic league standings. Paginated by FPL; we walk all pages.
export async function fetchLeagueStandings(leagueId) {
  let page = 1;
  let all = [];
  let leagueInfo = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const data = await getJson(
      `${BASE}/leagues-classic/${leagueId}/standings/?page_standings=${page}`
    );
    leagueInfo = data.league;
    all = all.concat(data.standings.results);
    if (!data.standings.has_next) break;
    page += 1;
  }
  return { league: leagueInfo, results: all };
}

// A manager's picks + points breakdown for one gameweek.
export async function fetchEntryPicks(entryId, gameweek) {
  return getJson(`${BASE}/entry/${entryId}/event/${gameweek}/picks/`);
}

// A manager's full season history + chip usage.
export async function fetchEntryHistory(entryId) {
  return getJson(`${BASE}/entry/${entryId}/history/`);
}

// Live points for every player in a given gameweek.
export async function fetchEventLive(gameweek) {
  return getJson(`${BASE}/event/${gameweek}/live/`);
}

export function currentEventId(bootstrap) {
  const current = bootstrap.events.find((e) => e.is_current);
  if (current) return current.id;
  const next = bootstrap.events.find((e) => e.is_next);
  return next ? next.id - 1 : null;
}

export function isEventFinished(bootstrap, gameweek) {
  const event = bootstrap.events.find((e) => e.id === gameweek);
  return !!event?.finished;
}
