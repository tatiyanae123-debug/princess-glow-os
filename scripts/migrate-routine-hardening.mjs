import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing required environment variable: DATABASE_URL');
const sql = neon(databaseUrl);

console.log('Applying Glow OS routine hardening...');

await sql`WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY user_id, routine_id ORDER BY last_activity_at DESC, started_at DESC, id DESC) AS rn
  FROM routine_runs
  WHERE status='active'
) UPDATE routine_runs SET status='abandoned', last_activity_at=now() WHERE id IN (SELECT id FROM ranked WHERE rn>1)`;

await sql`CREATE UNIQUE INDEX IF NOT EXISTS routine_runs_one_active_per_routine_uidx ON routine_runs(user_id, routine_id) WHERE status='active'`;

console.log('Glow OS routine hardening complete.');
