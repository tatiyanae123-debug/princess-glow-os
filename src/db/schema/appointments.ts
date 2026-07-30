import { pgTable, text, timestamp, boolean, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const appointmentTypeEnum = pgEnum('appointment_type', [
  'medical',
  'dental',
  'beauty',
  'wellness',
  'personal',
  'work',
  'other',
]);

export const appointments = pgTable(
  'appointments',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    provider: text('provider'),
    location: text('location'),
    startAt: timestamp('start_at', { mode: 'date' }).notNull(),
    endAt: timestamp('end_at', { mode: 'date' }),
    type: appointmentTypeEnum('type').notNull().default('other'),
    notes: text('notes'),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (a) => ({
    userIdIdx: index('appointments_user_id_idx').on(a.userId),
    startAtIdx: index('appointments_start_at_idx').on(a.startAt),
  }),
);
