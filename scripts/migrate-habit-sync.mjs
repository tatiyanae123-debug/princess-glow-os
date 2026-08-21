import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Missing required environment variable: DATABASE_URL');
const sql = neon(databaseUrl);

console.log('Applying Glow OS habit cross-system sync...');

await sql`CREATE OR REPLACE FUNCTION glow_sync_habit_log_detail() RETURNS trigger AS $$
BEGIN
  INSERT INTO habit_completion_details (id, user_id, habit_id, date_key, version, quantity, intentional_skip, source_type, completed_at)
  VALUES (gen_random_uuid()::text, NEW.user_id, NEW.habit_id, NEW.logged_date::text, 'full', GREATEST(1, NEW.count), false, 'habit_log', now())
  ON CONFLICT (user_id, habit_id, date_key) DO UPDATE SET
    quantity = EXCLUDED.quantity,
    intentional_skip = false,
    completed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql`;
await sql`DROP TRIGGER IF EXISTS glow_habit_log_detail_sync ON habit_logs`;
await sql`CREATE TRIGGER glow_habit_log_detail_sync AFTER INSERT OR UPDATE OF count ON habit_logs FOR EACH ROW EXECUTE FUNCTION glow_sync_habit_log_detail()`;

await sql`CREATE OR REPLACE FUNCTION glow_sync_task_to_habit() RETURNS trigger AS $$
DECLARE
  local_day date := (now() AT TIME ZONE 'America/New_York')::date;
  link_record record;
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    FOR link_record IN SELECT * FROM habit_source_links WHERE user_id = NEW.user_id AND source_type = 'task' AND source_id = NEW.id AND enabled = true LOOP
      IF NOT EXISTS (SELECT 1 FROM habit_logs WHERE user_id = NEW.user_id AND habit_id = link_record.habit_id AND logged_date = local_day) THEN
        INSERT INTO habit_logs (id, habit_id, user_id, logged_date, count, created_at)
        VALUES (gen_random_uuid()::text, link_record.habit_id, NEW.user_id, local_day, 1, now());
      END IF;
      INSERT INTO habit_completion_details (id, user_id, habit_id, date_key, version, quantity, intentional_skip, source_type, source_id, completed_at)
      VALUES (gen_random_uuid()::text, NEW.user_id, link_record.habit_id, local_day::text, 'full', 1, false, 'task', NEW.id, now())
      ON CONFLICT (user_id, habit_id, date_key) DO UPDATE SET intentional_skip=false, source_type='task', source_id=NEW.id, completed_at=now();
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql`;
await sql`DROP TRIGGER IF EXISTS glow_task_habit_sync ON tasks`;
await sql`CREATE TRIGGER glow_task_habit_sync AFTER UPDATE OF status ON tasks FOR EACH ROW EXECUTE FUNCTION glow_sync_task_to_habit()`;

await sql`CREATE OR REPLACE FUNCTION glow_sync_fitness_to_habit() RETURNS trigger AS $$
DECLARE
  local_day date := (NEW.occurred_at AT TIME ZONE 'America/New_York')::date;
  link_record record;
BEGIN
  FOR link_record IN
    SELECT * FROM habit_source_links
    WHERE user_id = NEW.user_id AND source_type = 'fitness' AND enabled = true
      AND (lower(NEW.workout_type) LIKE '%' || lower(source_id) || '%' OR lower(source_id) LIKE '%' || lower(NEW.workout_type) || '%')
  LOOP
    IF NOT EXISTS (SELECT 1 FROM habit_logs WHERE user_id = NEW.user_id AND habit_id = link_record.habit_id AND logged_date = local_day) THEN
      INSERT INTO habit_logs (id, habit_id, user_id, logged_date, count, created_at)
      VALUES (gen_random_uuid()::text, link_record.habit_id, NEW.user_id, local_day, 1, now());
    END IF;
    INSERT INTO habit_completion_details (id, user_id, habit_id, date_key, version, actual_seconds, quantity, intentional_skip, source_type, source_id, completed_at)
    VALUES (gen_random_uuid()::text, NEW.user_id, link_record.habit_id, local_day::text, 'full', CASE WHEN NEW.duration_minutes IS NULL THEN NULL ELSE NEW.duration_minutes*60 END, 1, false, 'fitness', NEW.workout_type, now())
    ON CONFLICT (user_id, habit_id, date_key) DO UPDATE SET intentional_skip=false, actual_seconds=EXCLUDED.actual_seconds, source_type='fitness', source_id=NEW.workout_type, completed_at=now();
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql`;
await sql`DROP TRIGGER IF EXISTS glow_fitness_habit_sync ON fitness_sessions`;
await sql`CREATE TRIGGER glow_fitness_habit_sync AFTER INSERT ON fitness_sessions FOR EACH ROW EXECUTE FUNCTION glow_sync_fitness_to_habit()`;

console.log('Glow OS habit cross-system sync complete.');
