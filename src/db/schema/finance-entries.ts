import { pgTable, text, timestamp, boolean, pgEnum, index, date } from 'drizzle-orm/pg-core';
import { numeric } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const financeTypeEnum = pgEnum('finance_type', ['income', 'expense', 'saving', 'investment']);
export const financeCategoryEnum = pgEnum('finance_category', [
  'salary',
  'food',
  'transport',
  'beauty',
  'health',
  'entertainment',
  'utilities',
  'subscriptions',
  'shopping',
  'savings',
  'investments',
  'other',
]);

export const financeEntries = pgTable(
  'finance_entries',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    type: financeTypeEnum('type').notNull(),
    category: financeCategoryEnum('category').notNull().default('other'),
    entryDate: date('entry_date').notNull(),
    notes: text('notes'),
    archived: boolean('archived').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (f) => ({
    userIdIdx: index('finance_entries_user_id_idx').on(f.userId),
    typeIdx: index('finance_entries_type_idx').on(f.type),
    entryDateIdx: index('finance_entries_entry_date_idx').on(f.entryDate),
  }),
);
