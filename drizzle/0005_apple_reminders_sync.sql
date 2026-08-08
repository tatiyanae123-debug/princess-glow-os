-- Phase 3C Apple Reminders bridge. Safe to run repeatedly in Neon.
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "source_external_id" text;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "source_list_name" text;
ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "last_synced_at" timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS "tasks_external_source_unique"
  ON "tasks" ("user_id", "source", "source_external_id");

CREATE TABLE IF NOT EXISTS "reminder_sync_tokens" (
  "user_id" text PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "rotated_at" timestamp,
  "last_used_at" timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "reminder_sync_tokens_hash_unique"
  ON "reminder_sync_tokens" ("token_hash");
