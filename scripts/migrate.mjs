import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const sql = neon(databaseUrl);

console.log('Applying safe Glow OS runtime schema sync...');

await sql`CREATE TABLE IF NOT EXISTS supplements (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, name text NOT NULL, dosage text, frequency text, time_of_day text, instructions text, started_at timestamp, ended_at timestamp, active boolean NOT NULL DEFAULT true, notes text, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS supplements_user_idx ON supplements(user_id)`;
await sql`ALTER TABLE wellness_entries ADD COLUMN IF NOT EXISTS stress_level integer`;
await sql`ALTER TABLE life_memories ADD COLUMN IF NOT EXISTS pinned boolean DEFAULT false NOT NULL`;
await sql`ALTER TABLE beauty_routines ADD COLUMN IF NOT EXISTS source text`;
await sql`ALTER TABLE beauty_routines ADD COLUMN IF NOT EXISTS source_version text`;
await sql`ALTER TABLE beauty_routines ADD COLUMN IF NOT EXISTS import_batch_id text`;
await sql`ALTER TABLE beauty_routines ADD COLUMN IF NOT EXISTS editable boolean DEFAULT true NOT NULL`;
await sql`CREATE TABLE IF NOT EXISTS brain_mind_map_links (id text PRIMARY KEY, user_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE, label text NOT NULL, href text NOT NULL, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`;
await sql`CREATE INDEX IF NOT EXISTS brain_mind_map_links_user_idx ON brain_mind_map_links(user_id)`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS brain_mind_map_links_user_target_uidx ON brain_mind_map_links(user_id, href, label)`;

console.log('Glow OS runtime schema sync complete.');
