import { pgTable, text, timestamp, boolean, pgEnum, index, integer } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const timeOfDayEnum = pgEnum('time_of_day', ['morning', 'afternoon', 'evening', 'night', 'anytime']);

export const routines = pgTable(
  'routines',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    timeOfDay: timeOfDayEnum('time_of_day').notNull().default('morning'),
    daysOfWeek: text('days_of_week').array(),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (r) => ({
    userIdIdx: index('routines_user_id_idx').on(r.userId),
  }),
);

export const routineSteps = pgTable(
  'routine_steps',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    routineId: text('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    notes: text('notes'),
    order: integer('order').notNull().default(0),
    durationMinutes: integer('duration_minutes'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (s) => ({
    routineIdIdx: index('routine_steps_routine_id_idx').on(s.routineId),
    userIdIdx: index('routine_steps_user_id_idx').on(s.userId),
  }),
);
