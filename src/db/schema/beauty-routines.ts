import { pgTable, text, timestamp, boolean, pgEnum, index, integer } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { timeOfDayEnum } from './routines';

export const beautyRoutines = pgTable(
  'beauty_routines',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    stepOrder: integer('step_order').notNull().default(0),
    products: text('products').array(),
    notes: text('notes'),
    timeOfDay: timeOfDayEnum('time_of_day').notNull().default('morning'),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (b) => ({
    userIdIdx: index('beauty_routines_user_id_idx').on(b.userId),
  }),
);
