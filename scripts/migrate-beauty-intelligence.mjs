import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing required environment variable: DATABASE_URL');
const sql = neon(databaseUrl);

console.log('Applying Glow OS Beauty Intelligence schema...');

await sql`CREATE TABLE IF NOT EXISTS beauty_ritual_runs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, ritual_key text NOT NULL, title text NOT NULL, mode text NOT NULL DEFAULT 'standard', status text NOT NULL DEFAULT 'active', queue_routine_ids text[] NOT NULL DEFAULT '{}'::text[], completed_routine_ids text[] NOT NULL DEFAULT '{}'::text[], skipped_routine_ids text[] NOT NULL DEFAULT '{}'::text[], current_index integer NOT NULL DEFAULT 0, actual_seconds integer NOT NULL DEFAULT 0, context jsonb NOT NULL DEFAULT '{}'::jsonb, started_at timestamp NOT NULL DEFAULT now(), last_activity_at timestamp NOT NULL DEFAULT now(), completed_at timestamp)`;
await sql`CREATE INDEX IF NOT EXISTS beauty_ritual_runs_user_status_idx ON beauty_ritual_runs(user_id,status)`;
await sql`CREATE INDEX IF NOT EXISTS beauty_ritual_runs_user_started_idx ON beauty_ritual_runs(user_id,started_at)`;
await sql`WITH ranked AS (SELECT id,row_number() OVER(PARTITION BY user_id,ritual_key ORDER BY last_activity_at DESC,id DESC) rn FROM beauty_ritual_runs WHERE status='active') UPDATE beauty_ritual_runs SET status='abandoned' WHERE id IN (SELECT id FROM ranked WHERE rn>1)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS beauty_ritual_runs_one_active_uidx ON beauty_ritual_runs(user_id,ritual_key) WHERE status='active'`;

await sql`CREATE TABLE IF NOT EXISTS beauty_step_logs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, run_id text NOT NULL REFERENCES beauty_ritual_runs(id) ON DELETE CASCADE, routine_id text REFERENCES beauty_routines(id) ON DELETE SET NULL, step_name text NOT NULL, status text NOT NULL DEFAULT 'completed', actual_seconds integer NOT NULL DEFAULT 0, notes text, completed_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS beauty_step_logs_run_idx ON beauty_step_logs(run_id)`;
await sql`CREATE INDEX IF NOT EXISTS beauty_step_logs_user_date_idx ON beauty_step_logs(user_id,completed_at)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS beauty_step_logs_run_routine_uidx ON beauty_step_logs(run_id,routine_id) WHERE routine_id IS NOT NULL`;

await sql`CREATE TABLE IF NOT EXISTS beauty_treatment_logs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, treatment_key text NOT NULL, treatment_name text NOT NULL, area text NOT NULL DEFAULT 'face', product_id text REFERENCES beauty_products(id) ON DELETE SET NULL, response text, notes text, occurred_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS beauty_treatment_logs_user_occurred_idx ON beauty_treatment_logs(user_id,occurred_at)`;
await sql`CREATE INDEX IF NOT EXISTS beauty_treatment_logs_user_treatment_idx ON beauty_treatment_logs(user_id,treatment_key)`;

await sql`CREATE TABLE IF NOT EXISTS beauty_treatment_schedules (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, treatment_key text NOT NULL, treatment_name text NOT NULL, area text NOT NULL DEFAULT 'face', weekdays integer[] NOT NULL DEFAULT '{}'::integer[], cadence_days integer, next_due_at timestamp, strong_treatment boolean NOT NULL DEFAULT false, enabled boolean NOT NULL DEFAULT true, notes text, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS beauty_treatment_schedules_user_enabled_idx ON beauty_treatment_schedules(user_id,enabled)`;
await sql`CREATE INDEX IF NOT EXISTS beauty_treatment_schedules_user_due_idx ON beauty_treatment_schedules(user_id,next_due_at)`;

await sql`CREATE TABLE IF NOT EXISTS beauty_maintenance_items (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, title text NOT NULL, category text NOT NULL DEFAULT 'general', cadence_days integer, next_due_at timestamp, last_completed_at timestamp, notes text, source text NOT NULL DEFAULT 'manual', archived boolean NOT NULL DEFAULT false, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS beauty_maintenance_items_user_due_idx ON beauty_maintenance_items(user_id,next_due_at)`;

await sql`CREATE TABLE IF NOT EXISTS beauty_looks (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, name text NOT NULL, occasion text NOT NULL DEFAULT 'Everyday', mood text NOT NULL DEFAULT 'Natural', planned_minutes integer NOT NULL DEFAULT 20, steps jsonb NOT NULL DEFAULT '[]'::jsonb, product_ids text[] NOT NULL DEFAULT '{}'::text[], notes text, photo_url text, use_count integer NOT NULL DEFAULT 0, last_used_at timestamp, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS beauty_looks_user_created_idx ON beauty_looks(user_id,created_at)`;

await sql`CREATE TABLE IF NOT EXISTS beauty_fragrances (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id text REFERENCES beauty_products(id) ON DELETE SET NULL, name text NOT NULL, family text, dayparts text[] NOT NULL DEFAULT '{}'::text[], seasons text[] NOT NULL DEFAULT '{}'::text[], moods text[] NOT NULL DEFAULT '{}'::text[], occasions text[] NOT NULL DEFAULT '{}'::text[], favorite boolean NOT NULL DEFAULT false, notes text, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS beauty_fragrances_user_idx ON beauty_fragrances(user_id)`;

await sql`CREATE TABLE IF NOT EXISTS beauty_readiness_logs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, context text NOT NULL DEFAULT 'leaving', checks jsonb NOT NULL DEFAULT '{}'::jsonb, completed_count integer NOT NULL DEFAULT 0, total_count integer NOT NULL DEFAULT 0, occurred_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS beauty_readiness_logs_user_occurred_idx ON beauty_readiness_logs(user_id,occurred_at)`;

await sql`CREATE TABLE IF NOT EXISTS beauty_observations (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, kind text NOT NULL, subject text NOT NULL, confidence text NOT NULL DEFAULT 'user_note', body text NOT NULL, evidence jsonb NOT NULL DEFAULT '{}'::jsonb, status text NOT NULL DEFAULT 'active', created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS beauty_observations_user_status_idx ON beauty_observations(user_id,status)`;

console.log('Glow OS Beauty Intelligence schema complete.');
