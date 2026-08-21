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

await sql`CREATE TABLE IF NOT EXISTS habit_profiles (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, habit_id text NOT NULL REFERENCES habits(id) ON DELETE CASCADE, area text NOT NULL DEFAULT 'Life', time_band text NOT NULL DEFAULT 'anytime', importance_tier text NOT NULL DEFAULT 'growth', full_label text, full_minutes integer NOT NULL DEFAULT 10, quick_label text, quick_minutes integer NOT NULL DEFAULT 5, minimum_label text, minimum_minutes integer NOT NULL DEFAULT 2, difficulty integer NOT NULL DEFAULT 3, context_mode text NOT NULL DEFAULT 'anywhere', identity_statement text, why_it_matters text, preferred_anchor text, weekly_target integer, rolling_goal_type text NOT NULL DEFAULT 'days', rolling_target integer, focus boolean NOT NULL DEFAULT false, paused_until timestamp, paused_indefinitely boolean NOT NULL DEFAULT false, seasonal_start_month integer, seasonal_end_month integer, progressive_level integer NOT NULL DEFAULT 1, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS habit_profiles_user_habit_uidx ON habit_profiles(user_id, habit_id)`;
await sql`CREATE INDEX IF NOT EXISTS habit_profiles_user_focus_idx ON habit_profiles(user_id, focus)`;
await sql`CREATE TABLE IF NOT EXISTS habit_completion_details (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, habit_id text NOT NULL REFERENCES habits(id) ON DELETE CASCADE, date_key text NOT NULL, version text NOT NULL DEFAULT 'full', actual_seconds integer, quantity integer NOT NULL DEFAULT 1, intentional_skip boolean NOT NULL DEFAULT false, skip_reason text, helped_by text, friction text, source_type text NOT NULL DEFAULT 'habits', source_id text, completed_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS habit_completion_details_user_habit_date_uidx ON habit_completion_details(user_id, habit_id, date_key)`;
await sql`CREATE INDEX IF NOT EXISTS habit_completion_details_user_date_idx ON habit_completion_details(user_id, date_key)`;
await sql`CREATE TABLE IF NOT EXISTS habit_timing_stats (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, habit_id text NOT NULL REFERENCES habits(id) ON DELETE CASCADE, sample_count integer NOT NULL DEFAULT 0, average_seconds integer NOT NULL DEFAULT 0, morning_count integer NOT NULL DEFAULT 0, afternoon_count integer NOT NULL DEFAULT 0, evening_count integer NOT NULL DEFAULT 0, night_count integer NOT NULL DEFAULT 0, updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS habit_timing_stats_user_habit_uidx ON habit_timing_stats(user_id, habit_id)`;
await sql`CREATE TABLE IF NOT EXISTS habit_triggers (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, habit_id text NOT NULL REFERENCES habits(id) ON DELETE CASCADE, trigger_type text NOT NULL, trigger_value text NOT NULL, enabled boolean NOT NULL DEFAULT true, created_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS habit_triggers_user_habit_idx ON habit_triggers(user_id, habit_id)`;
await sql`CREATE TABLE IF NOT EXISTS habit_stacks (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, name text NOT NULL, anchor_type text NOT NULL DEFAULT 'manual', anchor_value text, habit_ids jsonb NOT NULL DEFAULT '[]'::jsonb, enabled boolean NOT NULL DEFAULT true, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS habit_stacks_user_idx ON habit_stacks(user_id)`;
await sql`CREATE TABLE IF NOT EXISTS habit_experiments (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, habit_id text NOT NULL REFERENCES habits(id) ON DELETE CASCADE, hypothesis text NOT NULL, change text NOT NULL, starts_at timestamp NOT NULL DEFAULT now(), ends_at timestamp, baseline_rate real, result_rate real, status text NOT NULL DEFAULT 'active', result_summary text, created_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS habit_experiments_user_status_idx ON habit_experiments(user_id, status)`;
await sql`CREATE TABLE IF NOT EXISTS habit_source_links (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, habit_id text NOT NULL REFERENCES habits(id) ON DELETE CASCADE, source_type text NOT NULL, source_id text NOT NULL, enabled boolean NOT NULL DEFAULT true, created_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS habit_source_links_user_habit_idx ON habit_source_links(user_id, habit_id)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS habit_source_links_uidx ON habit_source_links(user_id, habit_id, source_type, source_id)`;

console.log('Glow OS runtime schema sync complete.');
