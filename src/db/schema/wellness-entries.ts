import { pgTable, text, timestamp, index, integer, date, pgEnum, real } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const moodEnum = pgEnum('mood', ['great', 'good', 'okay', 'low', 'rough']);
export const energyEnum = pgEnum('energy_level', ['high', 'medium', 'low', 'exhausted']);

export const wellnessEntries = pgTable(
  'wellness_entries',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    entryDate: date('entry_date').notNull(),
    mood: moodEnum('mood'),
    energy: energyEnum('energy'),
    sleepHours: real('sleep_hours'),
    waterGlasses: integer('water_glasses'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (w) => ({
    userIdIdx: index('wellness_entries_user_id_idx').on(w.userId),
    entryDateIdx: index('wellness_entries_entry_date_idx').on(w.entryDate),
  }),
);
