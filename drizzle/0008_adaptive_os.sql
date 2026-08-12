CREATE TABLE IF NOT EXISTS life_modes (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  energy_target integer,
  max_major_tasks integer NOT NULL DEFAULT 3,
  workout_policy text,
  routine_policy text,
  scheduling_policy text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS life_modes_user_active_idx ON life_modes(user_id,is_active);

CREATE TABLE IF NOT EXISTS personal_rules (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  rule_type text NOT NULL,
  condition jsonb NOT NULL DEFAULT '{}'::jsonb,
  effect jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority integer NOT NULL DEFAULT 50,
  enabled boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'user',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS personal_rules_user_enabled_idx ON personal_rules(user_id,enabled);

CREATE TABLE IF NOT EXISTS glow_inbox_items (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  raw_text text NOT NULL,
  source text NOT NULL DEFAULT 'manual',
  suggested_type text,
  suggested_title text,
  confidence real NOT NULL DEFAULT 0.5,
  status text NOT NULL DEFAULT 'unprocessed',
  routed_entity_type text,
  routed_entity_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  processed_at timestamp
);
CREATE INDEX IF NOT EXISTS glow_inbox_items_user_status_idx ON glow_inbox_items(user_id,status);

CREATE TABLE IF NOT EXISTS task_dependencies (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  predecessor_type text NOT NULL,
  predecessor_id text NOT NULL,
  successor_type text NOT NULL,
  successor_id text NOT NULL,
  dependency_type text NOT NULL DEFAULT 'blocks',
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS task_dependencies_user_successor_idx ON task_dependencies(user_id,successor_type,successor_id);

CREATE TABLE IF NOT EXISTS entity_relations (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_type text NOT NULL,
  from_id text NOT NULL,
  relation text NOT NULL,
  to_type text NOT NULL,
  to_id text NOT NULL,
  weight real NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS entity_relations_user_from_idx ON entity_relations(user_id,from_type,from_id);

CREATE TABLE IF NOT EXISTS focus_sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  title text NOT NULL,
  started_at timestamp NOT NULL DEFAULT now(),
  ended_at timestamp,
  planned_minutes integer,
  actual_minutes integer,
  outcome text,
  notes text,
  completed boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS focus_sessions_user_started_idx ON focus_sessions(user_id,started_at);

CREATE TABLE IF NOT EXISTS day_reviews (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_key text NOT NULL,
  energy integer,
  mood text,
  completed_summary text,
  moved_summary text,
  memory_note text,
  tomorrow_top_three jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS day_reviews_user_date_idx ON day_reviews(user_id,date_key);

CREATE TABLE IF NOT EXISTS maintenance_forecasts (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  title text NOT NULL,
  due_at timestamp,
  urgency text NOT NULL DEFAULT 'normal',
  source_type text,
  source_id text,
  recommendation text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS maintenance_forecasts_user_due_idx ON maintenance_forecasts(user_id,due_at);
