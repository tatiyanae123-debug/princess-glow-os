import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

console.log('Applying Drizzle migrations with Neon HTTP...');
await migrate(db, { migrationsFolder: './drizzle' });
console.log('Drizzle migrations complete.');
