import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const sql = neon(databaseUrl);

console.log('Applying safe Glow OS runtime schema sync...');

await sql`CREATE TABLE IF NOT EXISTS supplements (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, name text NOT NULL, dosage text, frequency text, time_of_day text, instructions text, started_at timestamp, ended_at timestamp, active boolean NOT NULL DEFAULT true, notes text, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS supplements_user_idx ON supplements(user_id)`;
await sql`ALTER TABLE wellness_entries ADD COLUMN IF NOT EXISTS stress_level integer`;
await sql`ALTER TABLE life_memories ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false NOT NULL`;
await sql`ALTER TABLE beauty_routines ADD COLUMN IF NOT EXISTS source text`;
await sql`ALTER TABLE beauty_routines ADD COLUMN IF NOT EXISTS source_version text`;
await sql`ALTER TABLE beauty_routines ADD COLUMN IF NOT EXISTS import_batch_id text`;
await sql`ALTER TABLE beauty_routines ADD COLUMN IF NOT EXISTS editable boolean DEFAULT true NOT NULL`;
await sql`CREATE TABLE IF NOT EXISTS brain_mind_map_links (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, label text NOT NULL, href text NOT NULL, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS brain_mind_map_links_user_idx ON brain_mind_map_links(user_id)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS brain_mind_map_links_user_target_uidx ON brain_mind_map_links(user_id, href, label)`;

await sql`CREATE TABLE IF NOT EXISTS routine_runs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, routine_id text NOT NULL REFERENCES routines(id) ON DELETE CASCADE, mode text NOT NULL DEFAULT 'normal', status text NOT NULL DEFAULT 'active', queue_step_ids text[] NOT NULL DEFAULT '{}'::text[], completed_step_ids text[] NOT NULL DEFAULT '{}'::text[], skipped_step_ids text[] NOT NULL DEFAULT '{}'::text[], current_index integer NOT NULL DEFAULT 0, started_at timestamp NOT NULL DEFAULT now(), last_activity_at timestamp NOT NULL DEFAULT now(), completed_at timestamp, actual_seconds integer NOT NULL DEFAULT 0, context jsonb NOT NULL DEFAULT '{}'::jsonb)`;
await sql`CREATE INDEX IF NOT EXISTS routine_runs_user_status_idx ON routine_runs(user_id, status)`;
await sql`CREATE INDEX IF NOT EXISTS routine_runs_routine_started_idx ON routine_runs(routine_id, started_at)`;
await sql`CREATE TABLE IF NOT EXISTS routine_step_runs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, run_id text NOT NULL REFERENCES routine_runs(id) ON DELETE CASCADE, step_id text NOT NULL REFERENCES routine_steps(id) ON DELETE CASCADE, status text NOT NULL DEFAULT 'pending', started_at timestamp, completed_at timestamp, actual_seconds integer NOT NULL DEFAULT 0, created_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS routine_step_runs_run_step_uidx ON routine_step_runs(run_id, step_id)`;
await sql`CREATE INDEX IF NOT EXISTS routine_step_runs_user_step_idx ON routine_step_runs(user_id, step_id)`;
await sql`CREATE TABLE IF NOT EXISTS routine_step_stats (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, step_id text NOT NULL REFERENCES routine_steps(id) ON DELETE CASCADE, sample_count integer NOT NULL DEFAULT 0, total_seconds integer NOT NULL DEFAULT 0, average_seconds integer NOT NULL DEFAULT 0, last_seconds integer NOT NULL DEFAULT 0, updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS routine_step_stats_user_step_uidx ON routine_step_stats(user_id, step_id)`;
await sql`CREATE TABLE IF NOT EXISTS routine_step_links (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, step_id text NOT NULL REFERENCES routine_steps(id) ON DELETE CASCADE, target_type text NOT NULL, target_id text NOT NULL, completion_policy text NOT NULL DEFAULT 'complete_with_step', metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS routine_step_links_user_step_idx ON routine_step_links(user_id, step_id)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS routine_step_links_step_target_uidx ON routine_step_links(step_id, target_type, target_id)`;
await sql`CREATE TABLE IF NOT EXISTS routine_triggers (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, routine_id text NOT NULL REFERENCES routines(id) ON DELETE CASCADE, trigger_type text NOT NULL, config jsonb NOT NULL DEFAULT '{}'::jsonb, enabled boolean NOT NULL DEFAULT true, last_matched_at timestamp, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS routine_triggers_user_enabled_idx ON routine_triggers(user_id, enabled)`;
await sql`CREATE TABLE IF NOT EXISTS routine_step_rules (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, step_id text NOT NULL REFERENCES routine_steps(id) ON DELETE CASCADE, rule_type text NOT NULL, config jsonb NOT NULL DEFAULT '{}'::jsonb, enabled boolean NOT NULL DEFAULT true, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS routine_step_rules_user_step_idx ON routine_step_rules(user_id, step_id)`;
await sql`CREATE TABLE IF NOT EXISTS routine_chains (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, source_routine_id text NOT NULL REFERENCES routines(id) ON DELETE CASCADE, next_routine_id text NOT NULL REFERENCES routines(id) ON DELETE CASCADE, enabled boolean NOT NULL DEFAULT true, created_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS routine_chains_source_uidx ON routine_chains(user_id, source_routine_id)`;

console.log('Glow OS runtime schema sync complete.');
