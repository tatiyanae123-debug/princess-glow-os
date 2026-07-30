import { pgTable, text, timestamp, boolean, pgEnum, index, real } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const goalStatusEnum = pgEnum('goal_status', ['not_started', 'in_progress', 'achieved', 'paused', 'abandoned']);
export const goalCategoryEnum = pgEnum('goal_category', ['health', 'career', 'finance', 'personal', 'relationships', 'learning', 'travel', 'other']);

export const goals = pgTable(
  'goals',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    category: goalCategoryEnum('category').notNull().default('personal'),
    status: goalStatusEnum('status').notNull().default('not_started'),
    targetDate: timestamp('target_date', { mode: 'date' }),
    progress: real('progress').notNull().default(0),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (g) => ({
    userIdIdx: index('goals_user_id_idx').on(g.userId),
    statusIdx: index('goals_status_idx').on(g.status),
  }),
);
