-- Runtime schema sync for fields currently queried by Glow OS.
-- Every statement is idempotent so preview/production builds can safely re-run migrations.

CREATE TABLE IF NOT EXISTS supplements (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  frequency text,
  time_of_day text,
  instructions text,
  started_at timestamp,
  ended_at timestamp,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS supplements_user_idx ON supplements(user_id);

ALTER TABLE wellness_entries
  ADD COLUMN IF NOT EXISTS stress_level integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'wellness_entries_stress_level_check'
  ) THEN
    ALTER TABLE wellness_entries
      ADD CONSTRAINT wellness_entries_stress_level_check
      CHECK (stress_level IS NULL OR stress_level BETWEEN 1 AND 5);
  END IF;
END $$;

ALTER TABLE life_memories
  ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false NOT NULL;

ALTER TABLE beauty_routines
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_version text,
  ADD COLUMN IF NOT EXISTS import_batch_id text,
  ADD COLUMN IF NOT EXISTS editable boolean DEFAULT true NOT NULL;
