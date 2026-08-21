import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const authRouter = Router();

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const { rows } = await query('SELECT * FROM admins WHERE email = $1', [email.toLowerCase()]);
  const admin = rows[0];
  if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, admin.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: admin.id, email: admin.email, name: admin.name },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name } });
}));

// One-time bootstrap route to create the first admin account.
// Protected by a setup key (set ADMIN_SETUP_KEY in env) — disable or remove
// after you've created your admins.
authRouter.post('/setup', asyncHandler(async (req, res) => {
  const { email, password, name, setupKey } = req.body;
  if (setupKey !== process.env.ADMIN_SETUP_KEY) {
    return res.status(403).json({ error: 'Invalid setup key' });
  }
  const hash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO admins (email, password_hash, name) VALUES ($1,$2,$3)
     ON CONFLICT (email) DO UPDATE SET password_hash = $2, name = $3`,
    [email.toLowerCase(), hash, name]
  );
  res.json({ ok: true });
}));
