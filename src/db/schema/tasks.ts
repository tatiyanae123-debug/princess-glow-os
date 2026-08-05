import { pgTable, text, timestamp, boolean, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'done', 'cancelled']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);

export const tasks = pgTable(
  'tasks',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    status: taskStatusEnum('status').notNull().default('pending'),
    priority: taskPriorityEnum('priority').notNull().default('medium'),
    dueDate: timestamp('due_date', { mode: 'date' }),
    completedAt: timestamp('completed_at', { mode: 'date' }),
    archived: boolean('archived').notNull().default(false),
    // Master Importer provenance (nullable — only set on imported rows)
    source: text('source'),
    sourceVersion: text('source_version'),
    importBatchId: text('import_batch_id'),
    editable: boolean('editable').notNull().default(true),
    // Set only when a task is created via "Create task from email" — the
    // Gmail message is never modified; this is just a read-only reference
    // back to it. Both nullable since normal tasks never set these.
    sourceMessageId: text('source_message_id'),
    sourceThreadId: text('source_thread_id'),
    createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  },
  (t) => ({
    userIdIdx: index('tasks_user_id_idx').on(t.userId),
    statusIdx: index('tasks_status_idx').on(t.status),
    dueDateIdx: index('tasks_due_date_idx').on(t.dueDate),
  }),
);
