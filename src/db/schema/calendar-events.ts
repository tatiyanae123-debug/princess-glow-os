import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const calendarEvents = pgTable(
  'calendar_events',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    startAt: timestamp('start_at', { mode: 'date' }).notNull(),
    endAt: timestamp('end_at', { mode: 'date' }),
    location: text('location'),
    allDay: boolean('all_day').notNull().default(false),
    color: text('color').default('#f43f5e'),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (e) => ({
    userIdIdx: index('calendar_events_user_id_idx').on(e.userId),
    startAtIdx: index('calendar_events_start_at_idx').on(e.startAt),
  }),
);
