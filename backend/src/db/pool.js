import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

// Render's managed Postgres requires SSL in production but not for local dev.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  return pool.query(text, params);
}
