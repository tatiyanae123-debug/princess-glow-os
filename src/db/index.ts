import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as relations from './relations';

const sql = neon(process.env.DATABASE_URL ?? 'postgresql://user:pass@placeholder.neon.tech/db');
const baseDb = drizzle(sql, { schema: { ...schema, ...relations } });

// The Neon HTTP driver does not expose an interactive transaction callback.
// Glow OS occasionally needs a small grouped write sequence, so expose the same
// callback shape while executing the writes sequentially through the HTTP driver.
// Critical user-facing AI changes still go through the existing proposal/audit flow.
export const db = Object.assign(baseDb, {
  transaction: async <T>(callback: (tx: typeof baseDb) => Promise<T>): Promise<T> => callback(baseDb),
});

export type DB = typeof db;
