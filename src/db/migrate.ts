/**
 * Run pending Drizzle migrations against the production Neon database.
 *
 * Usage (from repo root, with DATABASE_URL set):
 *   npx tsx src/db/migrate.ts
 *
 * This is required once to create all tables (auth + app) in the Neon database
 * before the application can handle sign-in requests.
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import path from 'path';

if (!process.env.DATABASE_URL) {
  console.error('[migrate] ERROR: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const migrationsFolder = path.join(process.cwd(), 'drizzle');

console.log('[migrate] Running migrations from:', migrationsFolder);

migrate(db, { migrationsFolder })
  .then(() => {
    console.log('[migrate] All migrations applied successfully.');
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error('[migrate] Migration failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
