CREATE TABLE IF NOT EXISTS glow_entities (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entity_type text NOT NULL,
  source_table text,
  source_id text,
  title text NOT NULL,
  summary text,
  searchable_text text,
  status text NOT NULL DEFAULT 'active',
  importance real NOT NULL DEFAULT 0.5,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS glow_entities_user_type_idx ON glow_entities(user_id, entity_type);
CREATE UNIQUE INDEX IF NOT EXISTS glow_entities_source_uidx ON glow_entities(user_id, source_table, source_id);

CREATE TABLE IF NOT EXISTS universal_intake_artifacts (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  inbox_item_id text,
  kind text NOT NULL,
  original_name text,
  mime_type text,
  size_bytes integer,
  source_text text,
  content_data_url text,
  detected_type text,
  detected_title text,
  extracted jsonb NOT NULL DEFAULT '{}'::jsonb,
  proposed_destinations jsonb NOT NULL DEFAULT '[]'::jsonb,
  analysis_status text NOT NULL DEFAULT 'analyzed',
  confidence real NOT NULL DEFAULT 0.5,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS universal_intake_user_created_idx ON universal_intake_artifacts(user_id, created_at);

CREATE TABLE IF NOT EXISTS resource_library_items (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  duration_minutes integer,
  content text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS resource_library_user_category_idx ON resource_library_items(user_id, category);

CREATE TABLE IF NOT EXISTS system_preferences (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  system_key text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  hidden boolean NOT NULL DEFAULT false,
  label text,
  image_url text,
  card_size text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS system_preferences_user_system_uidx ON system_preferences(user_id, system_key);

CREATE TABLE IF NOT EXISTS glow_notices (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  title text NOT NULL,
  evidence text NOT NULL,
  recommendation text,
  confidence real NOT NULL DEFAULT 0.5,
  status text NOT NULL DEFAULT 'active',
  action_type text,
  action_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  snoozed_until timestamp,
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS glow_notices_user_status_idx ON glow_notices(user_id, status);
