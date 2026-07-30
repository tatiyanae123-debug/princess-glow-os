import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const notes = pgTable(
  'notes',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content'),
    tags: text('tags').array(),
    pinned: boolean('pinned').notNull().default(false),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (n) => ({
    userIdIdx: index('notes_user_id_idx').on(n.userId),
    pinnedIdx: index('notes_pinned_idx').on(n.pinned),
  }),
);
