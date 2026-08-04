-- ============================================================
-- Life OS tables – safe, idempotent migration
-- Run once in Neon production (Neon SQL Editor or psql).
-- • Creates every missing Life OS table.
-- • Does NOT touch the existing Auth.js tables
--   (users, accounts, sessions, verification_tokens, authenticators).
-- • All statements use IF NOT EXISTS so the script is safe to re-run.
-- ============================================================

-- ------------------------------------------------------------
-- ENUM TYPES  (skip if already present)
-- ------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE goal_status AS ENUM (
    'not_started', 'in_progress', 'achieved', 'paused', 'abandoned'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE goal_category AS ENUM (
    'health', 'career', 'finance', 'personal',
    'relationships', 'learning', 'travel', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'pending', 'in_progress', 'done', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM (
    'low', 'medium', 'high', 'urgent'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE habit_frequency AS ENUM (
    'daily', 'weekdays', 'weekends', 'weekly', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE time_of_day AS ENUM (
    'morning', 'afternoon', 'evening', 'night', 'anytime'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE mood AS ENUM (
    'great', 'good', 'okay', 'low', 'rough'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE energy_level AS ENUM (
    'high', 'medium', 'low', 'exhausted'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE finance_type AS ENUM (
    'income', 'expense', 'saving', 'investment'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE finance_category AS ENUM (
    'salary', 'food', 'transport', 'beauty', 'health',
    'entertainment', 'utilities', 'subscriptions', 'shopping',
    'savings', 'investments', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE appointment_type AS ENUM (
    'medical', 'dental', 'beauty', 'wellness',
    'personal', 'work', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE day_of_week AS ENUM (
    'monday', 'tuesday', 'wednesday', 'thursday',
    'friday', 'saturday', 'sunday'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ------------------------------------------------------------
-- TABLES
-- ------------------------------------------------------------

-- goals
CREATE TABLE IF NOT EXISTS "goals" (
  "id"          text        PRIMARY KEY,
  "user_id"     text        NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"       text        NOT NULL,
  "description" text,
  "category"    goal_category NOT NULL DEFAULT 'personal',
  "status"      goal_status   NOT NULL DEFAULT 'not_started',
  "target_date" timestamp,
  "progress"    real        NOT NULL DEFAULT 0,
  "archived"    boolean     NOT NULL DEFAULT false,
  "created_at"  timestamp   NOT NULL DEFAULT now(),
  "updated_at"  timestamp   NOT NULL DEFAULT now()
);

-- tasks
CREATE TABLE IF NOT EXISTS "tasks" (
  "id"           text          PRIMARY KEY,
  "user_id"      text          NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"        text          NOT NULL,
  "description"  text,
  "status"       task_status   NOT NULL DEFAULT 'pending',
  "priority"     task_priority NOT NULL DEFAULT 'medium',
  "due_date"     timestamp,
  "completed_at" timestamp,
  "archived"     boolean       NOT NULL DEFAULT false,
  "created_at"   timestamp     NOT NULL DEFAULT now(),
  "updated_at"   timestamp     NOT NULL DEFAULT now()
);

-- habits
CREATE TABLE IF NOT EXISTS "habits" (
  "id"           text            PRIMARY KEY,
  "user_id"      text            NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "name"         text            NOT NULL,
  "description"  text,
  "frequency"    habit_frequency NOT NULL DEFAULT 'daily',
  "color"        text            DEFAULT '#f43f5e',
  "icon"         text,
  "target_count" integer         NOT NULL DEFAULT 1,
  "archived"     boolean         NOT NULL DEFAULT false,
  "created_at"   timestamp       NOT NULL DEFAULT now(),
  "updated_at"   timestamp       NOT NULL DEFAULT now()
);

-- habit_logs
CREATE TABLE IF NOT EXISTS "habit_logs" (
  "id"          text      PRIMARY KEY,
  "habit_id"    text      NOT NULL REFERENCES "habits" ("id") ON DELETE CASCADE,
  "user_id"     text      NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "logged_date" date      NOT NULL,
  "count"       integer   NOT NULL DEFAULT 1,
  "notes"       text,
  "created_at"  timestamp NOT NULL DEFAULT now()
);

-- routines
CREATE TABLE IF NOT EXISTS "routines" (
  "id"           text        PRIMARY KEY,
  "user_id"      text        NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "name"         text        NOT NULL,
  "description"  text,
  "time_of_day"  time_of_day NOT NULL DEFAULT 'morning',
  "days_of_week" text[],
  "archived"     boolean     NOT NULL DEFAULT false,
  "created_at"   timestamp   NOT NULL DEFAULT now(),
  "updated_at"   timestamp   NOT NULL DEFAULT now()
);

-- routine_steps
CREATE TABLE IF NOT EXISTS "routine_steps" (
  "id"               text      PRIMARY KEY,
  "routine_id"       text      NOT NULL REFERENCES "routines" ("id") ON DELETE CASCADE,
  "user_id"          text      NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"            text      NOT NULL,
  "notes"            text,
  "order"            integer   NOT NULL DEFAULT 0,
  "duration_minutes" integer,
  "created_at"       timestamp NOT NULL DEFAULT now(),
  "updated_at"       timestamp NOT NULL DEFAULT now()
);

-- calendar_events
CREATE TABLE IF NOT EXISTS "calendar_events" (
  "id"          text      PRIMARY KEY,
  "user_id"     text      NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"       text      NOT NULL,
  "description" text,
  "start_at"    timestamp NOT NULL,
  "end_at"      timestamp,
  "location"    text,
  "all_day"     boolean   NOT NULL DEFAULT false,
  "color"       text      DEFAULT '#f43f5e',
  "archived"    boolean   NOT NULL DEFAULT false,
  "created_at"  timestamp NOT NULL DEFAULT now(),
  "updated_at"  timestamp NOT NULL DEFAULT now()
);

-- beauty_routines
CREATE TABLE IF NOT EXISTS "beauty_routines" (
  "id"          text        PRIMARY KEY,
  "user_id"     text        NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "name"        text        NOT NULL,
  "step_order"  integer     NOT NULL DEFAULT 0,
  "products"    text[],
  "notes"       text,
  "time_of_day" time_of_day NOT NULL DEFAULT 'morning',
  "archived"    boolean     NOT NULL DEFAULT false,
  "created_at"  timestamp   NOT NULL DEFAULT now(),
  "updated_at"  timestamp   NOT NULL DEFAULT now()
);

-- wellness_entries
CREATE TABLE IF NOT EXISTS "wellness_entries" (
  "id"           text         PRIMARY KEY,
  "user_id"      text         NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "entry_date"   date         NOT NULL,
  "mood"         mood,
  "energy"       energy_level,
  "sleep_hours"  real,
  "water_glasses" integer,
  "notes"        text,
  "created_at"   timestamp    NOT NULL DEFAULT now(),
  "updated_at"   timestamp    NOT NULL DEFAULT now()
);

-- finance_entries
CREATE TABLE IF NOT EXISTS "finance_entries" (
  "id"         text             PRIMARY KEY,
  "user_id"    text             NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"      text             NOT NULL,
  "amount"     numeric(12, 2)   NOT NULL,
  "type"       finance_type     NOT NULL,
  "category"   finance_category NOT NULL DEFAULT 'other',
  "entry_date" date             NOT NULL,
  "notes"      text,
  "archived"   boolean          NOT NULL DEFAULT false,
  "created_at" timestamp        NOT NULL DEFAULT now(),
  "updated_at" timestamp        NOT NULL DEFAULT now()
);

-- notes
CREATE TABLE IF NOT EXISTS "notes" (
  "id"         text      PRIMARY KEY,
  "user_id"    text      NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"      text      NOT NULL,
  "content"    text,
  "tags"       text[],
  "pinned"     boolean   NOT NULL DEFAULT false,
  "archived"   boolean   NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- important_links
CREATE TABLE IF NOT EXISTS "important_links" (
  "id"         text      PRIMARY KEY,
  "user_id"    text      NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"      text      NOT NULL,
  "url"        text      NOT NULL,
  "category"   text,
  "notes"      text,
  "pinned"     boolean   NOT NULL DEFAULT false,
  "archived"   boolean   NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- appointments
CREATE TABLE IF NOT EXISTS "appointments" (
  "id"         text             PRIMARY KEY,
  "user_id"    text             NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"      text             NOT NULL,
  "provider"   text,
  "location"   text,
  "start_at"   timestamp        NOT NULL,
  "end_at"     timestamp,
  "type"       appointment_type NOT NULL DEFAULT 'other',
  "notes"      text,
  "archived"   boolean          NOT NULL DEFAULT false,
  "created_at" timestamp        NOT NULL DEFAULT now(),
  "updated_at" timestamp        NOT NULL DEFAULT now()
);

-- work_schedules
CREATE TABLE IF NOT EXISTS "work_schedules" (
  "id"          text        PRIMARY KEY,
  "user_id"     text        NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
  "title"       text        NOT NULL,
  "day_of_week" day_of_week NOT NULL,
  "start_time"  time        NOT NULL,
  "end_time"    time        NOT NULL,
  "notes"       text,
  "archived"    boolean     NOT NULL DEFAULT false,
  "created_at"  timestamp   NOT NULL DEFAULT now(),
  "updated_at"  timestamp   NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- INDEXES  (IF NOT EXISTS requires PG 9.5+, Neon supports it)
-- ------------------------------------------------------------

CREATE INDEX IF NOT EXISTS "goals_user_id_idx"   ON "goals"   ("user_id");
CREATE INDEX IF NOT EXISTS "goals_status_idx"    ON "goals"   ("status");

CREATE INDEX IF NOT EXISTS "tasks_user_id_idx"   ON "tasks"   ("user_id");
CREATE INDEX IF NOT EXISTS "tasks_status_idx"    ON "tasks"   ("status");
CREATE INDEX IF NOT EXISTS "tasks_due_date_idx"  ON "tasks"   ("due_date");

CREATE INDEX IF NOT EXISTS "habits_user_id_idx"  ON "habits"  ("user_id");

CREATE INDEX IF NOT EXISTS "habit_logs_habit_id_idx"    ON "habit_logs" ("habit_id");
CREATE INDEX IF NOT EXISTS "habit_logs_user_id_idx"     ON "habit_logs" ("user_id");
CREATE INDEX IF NOT EXISTS "habit_logs_logged_date_idx" ON "habit_logs" ("logged_date");

CREATE INDEX IF NOT EXISTS "routines_user_id_idx"           ON "routines"       ("user_id");
CREATE INDEX IF NOT EXISTS "routine_steps_routine_id_idx"   ON "routine_steps"  ("routine_id");
CREATE INDEX IF NOT EXISTS "routine_steps_user_id_idx"      ON "routine_steps"  ("user_id");

CREATE INDEX IF NOT EXISTS "calendar_events_user_id_idx"  ON "calendar_events" ("user_id");
CREATE INDEX IF NOT EXISTS "calendar_events_start_at_idx" ON "calendar_events" ("start_at");

CREATE INDEX IF NOT EXISTS "beauty_routines_user_id_idx"  ON "beauty_routines" ("user_id");

CREATE INDEX IF NOT EXISTS "wellness_entries_user_id_idx"   ON "wellness_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "wellness_entries_entry_date_idx" ON "wellness_entries" ("entry_date");

CREATE INDEX IF NOT EXISTS "finance_entries_user_id_idx"   ON "finance_entries" ("user_id");
CREATE INDEX IF NOT EXISTS "finance_entries_type_idx"      ON "finance_entries" ("type");
CREATE INDEX IF NOT EXISTS "finance_entries_entry_date_idx" ON "finance_entries" ("entry_date");

CREATE INDEX IF NOT EXISTS "notes_user_id_idx" ON "notes" ("user_id");
CREATE INDEX IF NOT EXISTS "notes_pinned_idx"  ON "notes" ("pinned");

CREATE INDEX IF NOT EXISTS "important_links_user_id_idx" ON "important_links" ("user_id");
CREATE INDEX IF NOT EXISTS "important_links_pinned_idx"  ON "important_links" ("pinned");

CREATE INDEX IF NOT EXISTS "appointments_user_id_idx"  ON "appointments" ("user_id");
CREATE INDEX IF NOT EXISTS "appointments_start_at_idx" ON "appointments" ("start_at");

CREATE INDEX IF NOT EXISTS "work_schedules_user_id_idx"     ON "work_schedules" ("user_id");
CREATE INDEX IF NOT EXISTS "work_schedules_day_of_week_idx" ON "work_schedules" ("day_of_week");
