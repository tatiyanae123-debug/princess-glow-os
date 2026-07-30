import { pgTable, text, timestamp, boolean, pgEnum, index, integer, date } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const habitFrequencyEnum = pgEnum('habit_frequency', ['daily', 'weekdays', 'weekends', 'weekly', 'custom']);

export const habits = pgTable(
  'habits',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    frequency: habitFrequencyEnum('frequency').notNull().default('daily'),
    color: text('color').default('#f43f5e'),
    icon: text('icon'),
    targetCount: integer('target_count').notNull().default(1),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (h) => ({
    userIdIdx: index('habits_user_id_idx').on(h.userId),
  }),
);

export const habitLogs = pgTable(
  'habit_logs',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    habitId: text('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    loggedDate: date('logged_date').notNull(),
    count: integer('count').notNull().default(1),
    notes: text('notes'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (l) => ({
    habitIdIdx: index('habit_logs_habit_id_idx').on(l.habitId),
    userIdIdx: index('habit_logs_user_id_idx').on(l.userId),
    loggedDateIdx: index('habit_logs_logged_date_idx').on(l.loggedDate),
  }),
);
