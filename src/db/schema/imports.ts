import { pgTable, text, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const importBatchStatusEnum = pgEnum('import_batch_status', ['previewed', 'confirmed', 'undone']);

// Tracks every run of the Master Importer. A batch starts as 'previewed'
// (nothing written to real tables yet), becomes 'confirmed' once the user
// approves the preview and real rows are created, and can become 'undone'
// if the user reverts a confirmed batch.
export const importBatches = pgTable(
  'import_batches',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    source: text('source').notNull(),
    sourceVersion: text('source_version').notNull(),
    category: text('category').notNull(),
    status: importBatchStatusEnum('status').notNull().default('previewed'),
    summary: text('summary'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    confirmedAt: timestamp('confirmed_at', { mode: 'date' }),
    undoneAt: timestamp('undone_at', { mode: 'date' }),
  },
  (b) => ({
    userIdIdx: index('import_batches_user_id_idx').on(b.userId),
    statusIdx: index('import_batches_status_idx').on(b.status),
  }),
);
