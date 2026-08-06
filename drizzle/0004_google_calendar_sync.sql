-- Phase 3A Google Calendar intelligence. Safe to run repeatedly in Neon.
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "google_event_id" text;
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "google_calendar_id" text;
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "google_recurring_event_id" text;
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "recurrence_rule" text;
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "event_timezone" text;
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "sync_status" text;
ALTER TABLE "calendar_events" ADD COLUMN IF NOT EXISTS "last_synced_at" timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS "calendar_events_google_event_unique"
  ON "calendar_events" ("user_id", "google_calendar_id", "google_event_id");

CREATE TABLE IF NOT EXISTS "calendar_sync_history" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status" text NOT NULL,
  "calendars_read" integer DEFAULT 0 NOT NULL,
  "events_read" integer DEFAULT 0 NOT NULL,
  "events_upserted" integer DEFAULT 0 NOT NULL,
  "events_cancelled" integer DEFAULT 0 NOT NULL,
  "error_code" text,
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp
);
CREATE INDEX IF NOT EXISTS "calendar_sync_history_user_started_idx"
  ON "calendar_sync_history" ("user_id", "started_at");
