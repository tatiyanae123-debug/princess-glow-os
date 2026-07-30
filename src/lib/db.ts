import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// DATABASE_URL should be set in .env.local (never commit credentials)
const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
