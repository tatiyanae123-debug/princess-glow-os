import 'server-only';

import { sql } from 'drizzle-orm';
import { db } from '@/db';

const TRACKED_TABLES = [
  'tasks', 'habits', 'habit_logs', 'routines', 'routine_steps', 'goals', 'calendar_events',
  'beauty_routines', 'wellness_entries', 'finance_entries', 'notes', 'important_links', 'appointments',
  'work_schedules', 'apple_reminders', 'planning_blocks', 'life_memories', 'projects', 'planning_periods',
  'intelligent_observations', 'beauty_products', 'hair_logs', 'fitness_sessions', 'closet_items', 'finance_goals',
  'life_timeline_events', 'medications', 'supplements', 'personal_rules', 'maintenance_forecasts',
  'glow_inbox_items', 'universal_intake_artifacts', 'resource_library_items', 'glow_notices', 'focus_sessions',
  'day_reviews', 'ai_proposals', 'audit_events', 'briefing_snapshots', 'task_dependencies',
] as const;

let triggerPromise: Promise<void> | null = null;

export async function ensureLivingKernelMutationTriggers() {
  if (!triggerPromise) {
    triggerPromise = (async () => {
      await db.execute(sql.raw(`
        CREATE OR REPLACE FUNCTION glow_mark_kernel_dirty() RETURNS trigger AS $$
        DECLARE uid text;
        BEGIN
          IF TG_OP = 'DELETE' THEN uid := OLD.user_id; ELSE uid := NEW.user_id; END IF;
          IF uid IS NOT NULL THEN
            INSERT INTO glow_kernel_states(user_id, schema_version, current_reality_id, last_full_sync_at, last_event_at, last_error, sync_revision, updated_at)
            VALUES(uid, 2, 'current-reality:' || clock_timestamp()::text, NULL, now(), NULL, 0, now())
            ON CONFLICT(user_id) DO UPDATE SET last_full_sync_at = NULL, last_event_at = now(), updated_at = now();
          END IF;
          IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
        END;
        $$ LANGUAGE plpgsql;
      `));

      for (const table of TRACKED_TABLES) {
        const triggerName = `glow_kernel_dirty_${table}`;
        await db.execute(sql.raw(`
          DO $$
          BEGIN
            IF to_regclass('public.${table}') IS NOT NULL AND NOT EXISTS (
              SELECT 1 FROM pg_trigger WHERE tgname = '${triggerName}' AND NOT tgisinternal
            ) THEN
              EXECUTE 'CREATE TRIGGER ${triggerName} AFTER INSERT OR UPDATE OR DELETE ON ${table} FOR EACH ROW EXECUTE FUNCTION glow_mark_kernel_dirty()';
            END IF;
          END $$;
        `));
      }
    })().catch((error) => {
      triggerPromise = null;
      throw error;
    });
  }
  return triggerPromise;
}
