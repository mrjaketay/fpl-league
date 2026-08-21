import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { leagueRouter } from './routes/league.js';
import { adminRouter } from './routes/admin.js';
import { refreshCurrentGameweek } from './jobs/refresh.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/league', leagueRouter);
app.use('/api/admin', adminRouter);

// Hit by a free GitHub Actions scheduled workflow every 30 minutes (see
// .github/workflows/refresh.yml) instead of a paid Render Cron Job — this
// keeps data fresh AND keeps the free web service from spinning down idle.
// Protected by a shared secret, not admin login, since it's called
// unattended on a timer.
app.post('/api/cron/refresh', async (req, res, next) => {
  const key = req.header('X-Cron-Secret');
  if (!key || key !== process.env.CRON_SECRET) {
    return res.status(403).json({ error: 'Invalid cron secret' });
  }
  try {
    const result = await refreshCurrentGameweek();
    res.json({ ok: true, result });
  } catch (err) {
    next(err);
  }
});

// 404 for anything that didn't match a route above.
app.use((req, res) => {
  res.status(404).json({ error: `No route: ${req.method} ${req.path}` });
});

// Global error handler — this is the fix for the 502 crashes. Every route
// above either uses asyncHandler() or its own try/catch, so any error
// ends up here instead of crashing the Node process. Always returns JSON,
// never lets an unhandled rejection take the whole server down.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[error] ${req.method} ${req.path}:`, err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Belt-and-braces: log anything that somehow still slips through as an
// unhandled rejection, instead of letting Node kill the process over it.
process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`FPL league API listening on port ${PORT}`));
