import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Set DATABASE_URL in .env.local — never commit credentials
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
