import { pgTable, text, timestamp, boolean, pgEnum, index, time } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const dayOfWeekEnum = pgEnum('day_of_week', [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]);

export const workSchedules = pgTable(
  'work_schedules',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    dayOfWeek: dayOfWeekEnum('day_of_week').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    notes: text('notes'),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (w) => ({
    userIdIdx: index('work_schedules_user_id_idx').on(w.userId),
    dayOfWeekIdx: index('work_schedules_day_of_week_idx').on(w.dayOfWeek),
  }),
);
