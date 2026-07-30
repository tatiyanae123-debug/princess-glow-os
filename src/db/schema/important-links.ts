import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const importantLinks = pgTable(
  'important_links',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    url: text('url').notNull(),
    category: text('category'),
    notes: text('notes'),
    pinned: boolean('pinned').notNull().default(false),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (l) => ({
    userIdIdx: index('important_links_user_id_idx').on(l.userId),
    pinnedIdx: index('important_links_pinned_idx').on(l.pinned),
  }),
);
