import { pgTable, text, timestamp, boolean, index, integer, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const calendarEvents = pgTable(
  'calendar_events',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    startAt: timestamp('start_at', { mode: 'date' }).notNull(),
    endAt: timestamp('end_at', { mode: 'date' }),
    location: text('location'),
    allDay: boolean('all_day').notNull().default(false),
    color: text('color').default('#f43f5e'),
    archived: boolean('archived').notNull().default(false),
    source: text('source'),
    sourceVersion: text('source_version'),
    importBatchId: text('import_batch_id'),
    editable: boolean('editable').notNull().default(true),
    recurrenceDaysOfWeek: text('recurrence_days_of_week').array(),
    googleEventId: text('google_event_id'),
    googleCalendarId: text('google_calendar_id'),
    googleRecurringEventId: text('google_recurring_event_id'),
    recurrenceRule: text('recurrence_rule'),
    eventTimezone: text('event_timezone'),
    syncStatus: text('sync_status'),
    lastSyncedAt: timestamp('last_synced_at', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (e) => ({
    userIdIdx: index('calendar_events_user_id_idx').on(e.userId),
    startAtIdx: index('calendar_events_start_at_idx').on(e.startAt),
    googleEventUnique: uniqueIndex('calendar_events_google_event_unique').on(e.userId, e.googleCalendarId, e.googleEventId),
  }),
);

export const calendarSyncHistory = pgTable(
  'calendar_sync_history',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').notNull(),
    calendarsRead: integer('calendars_read').notNull().default(0),
    eventsRead: integer('events_read').notNull().default(0),
    eventsUpserted: integer('events_upserted').notNull().default(0),
    eventsCancelled: integer('events_cancelled').notNull().default(0),
    errorCode: text('error_code'),
    startedAt: timestamp('started_at', { mode: 'date' }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { mode: 'date' }),
  },
  (s) => ({ userStartedIdx: index('calendar_sync_history_user_started_idx').on(s.userId, s.startedAt) }),
);
