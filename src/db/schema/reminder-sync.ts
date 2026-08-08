import { pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const reminderSyncTokens = pgTable(
  'reminder_sync_tokens',
  {
    userId: text('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    rotatedAt: timestamp('rotated_at', { mode: 'date' }),
    lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
  },
  (t) => ({ tokenHashUnique: uniqueIndex('reminder_sync_tokens_hash_unique').on(t.tokenHash) }),
);
