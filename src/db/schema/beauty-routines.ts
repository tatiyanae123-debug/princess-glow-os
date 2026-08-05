import { pgTable, text, timestamp, boolean, index, integer } from 'drizzle-orm/pg-core';
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
    // Master Importer provenance (nullable — only set on imported rows)
    source: text('source'),
    sourceVersion: text('source_version'),
    importBatchId: text('import_batch_id'),
    editable: boolean('editable').notNull().default(true),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (b) => ({
    userIdIdx: index('beauty_routines_user_id_idx').on(b.userId),
  }),
);
