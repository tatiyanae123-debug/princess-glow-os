import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing required environment variable: DATABASE_URL');
const sql = neon(databaseUrl);

console.log('Applying Glow OS adaptive fitness schema...');

await sql`CREATE TABLE IF NOT EXISTS workout_templates (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, name text NOT NULL, category text NOT NULL DEFAULT 'strength', equipment text NOT NULL DEFAULT 'bodyweight', full_minutes integer NOT NULL DEFAULT 30, quick_minutes integer NOT NULL DEFAULT 20, minimum_minutes integer NOT NULL DEFAULT 10, difficulty integer NOT NULL DEFAULT 3, primary_muscles text[] NOT NULL DEFAULT '{}'::text[], low_impact boolean NOT NULL DEFAULT false, archived boolean NOT NULL DEFAULT false, notes text, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS workout_templates_user_idx ON workout_templates(user_id)`;
await sql`CREATE TABLE IF NOT EXISTS workout_exercises (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, template_id text NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE, name text NOT NULL, position integer NOT NULL DEFAULT 0, sets integer NOT NULL DEFAULT 3, reps integer NOT NULL DEFAULT 10, seconds integer, rest_seconds integer NOT NULL DEFAULT 75, weight_lb real, muscle_group text, equipment text, form_cue text, instructions text, substitutions text[] NOT NULL DEFAULT '{}'::text[], optional boolean NOT NULL DEFAULT false, created_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS workout_exercises_template_position_idx ON workout_exercises(template_id, position)`;
await sql`CREATE TABLE IF NOT EXISTS workout_runs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, template_id text REFERENCES workout_templates(id) ON DELETE SET NULL, name text NOT NULL, version text NOT NULL DEFAULT 'full', status text NOT NULL DEFAULT 'active', current_exercise_index integer NOT NULL DEFAULT 0, started_at timestamp NOT NULL DEFAULT now(), completed_at timestamp, active_seconds integer NOT NULL DEFAULT 0, energy_before integer, soreness_before integer, readiness text, equipment text, notes text, feeling_after text, session_id text, context jsonb NOT NULL DEFAULT '{}'::jsonb)`;
await sql`CREATE INDEX IF NOT EXISTS workout_runs_user_status_idx ON workout_runs(user_id, status)`;
await sql`CREATE INDEX IF NOT EXISTS workout_runs_started_idx ON workout_runs(user_id, started_at)`;
await sql`WITH ranked AS (SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY started_at DESC, id DESC) AS rn FROM workout_runs WHERE status='active') UPDATE workout_runs SET status='paused' WHERE id IN (SELECT id FROM ranked WHERE rn>1)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS workout_runs_one_active_user_uidx ON workout_runs(user_id) WHERE status='active'`;
await sql`CREATE TABLE IF NOT EXISTS workout_set_logs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, run_id text NOT NULL REFERENCES workout_runs(id) ON DELETE CASCADE, exercise_id text REFERENCES workout_exercises(id) ON DELETE SET NULL, exercise_name text NOT NULL, set_number integer NOT NULL, reps integer, seconds integer, weight_lb real, rpe integer, completed boolean NOT NULL DEFAULT true, skipped boolean NOT NULL DEFAULT false, notes text, completed_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS workout_set_logs_run_exercise_idx ON workout_set_logs(run_id, exercise_name)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS workout_set_logs_run_exercise_set_uidx ON workout_set_logs(run_id, exercise_name, set_number)`;
await sql`CREATE TABLE IF NOT EXISTS workout_readiness (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, date_key text NOT NULL, energy integer NOT NULL DEFAULT 3, sleep integer NOT NULL DEFAULT 3, soreness integer NOT NULL DEFAULT 3, stress integer NOT NULL DEFAULT 3, available_minutes integer NOT NULL DEFAULT 30, equipment text NOT NULL DEFAULT 'bodyweight', location_mode text NOT NULL DEFAULT 'home', muscle_soreness jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS workout_readiness_user_date_uidx ON workout_readiness(user_id, date_key)`;
await sql`CREATE TABLE IF NOT EXISTS workout_programs (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, name text NOT NULL, weeks integer NOT NULL DEFAULT 6, current_week integer NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'active', template_ids jsonb NOT NULL DEFAULT '[]'::jsonb, goal_id text, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS workout_programs_user_status_idx ON workout_programs(user_id, status)`;

console.log('Glow OS adaptive fitness schema complete.');
