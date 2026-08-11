ALTER TABLE "wellness_entries"
ADD COLUMN IF NOT EXISTS "stress_level" integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'wellness_entries_stress_level_check'
  ) THEN
    ALTER TABLE "wellness_entries"
      ADD CONSTRAINT "wellness_entries_stress_level_check"
      CHECK ("stress_level" IS NULL OR "stress_level" BETWEEN 1 AND 5);
  END IF;
END $$;
