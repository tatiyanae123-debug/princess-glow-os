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
    // Master Importer provenance (nullable — only set on imported rows)
    source: text('source'),
    sourceVersion: text('source_version'),
    importBatchId: text('import_batch_id'),
    editable: boolean('editable').notNull().default(true),
    // Recurrence for imported calendar templates (e.g. weekly rituals).
    // Native one-off Glow OS events leave this null.
    recurrenceDaysOfWeek: text('recurrence_days_of_week').array(),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (e) => ({
    userIdIdx: index('calendar_events_user_id_idx').on(e.userId),
    startAtIdx: index('calendar_events_start_at_idx').on(e.startAt),
  }),
);
