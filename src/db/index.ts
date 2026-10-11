import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import * as relations from './relations';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Glow OS database is not configured: DATABASE_URL is missing.');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema: { ...schema, ...relations } });

export type DB = typeof db;
