CREATE TABLE IF NOT EXISTS medications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  frequency text,
  time_of_day text,
  instructions text,
  prescriber text,
  started_at timestamp,
  ended_at timestamp,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS medications_user_idx ON medications(user_id);

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
