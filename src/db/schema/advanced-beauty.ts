import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { beautyRoutines } from './beauty-routines';
import { beautyProducts } from './completion-v1';

export const beautyRitualRuns = pgTable('beauty_ritual_runs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ritualKey: text('ritual_key').notNull(),
  title: text('title').notNull(),
  mode: text('mode').notNull().default('standard'),
  status: text('status').notNull().default('active'),
  queueRoutineIds: text('queue_routine_ids').array().notNull().default([]),
  completedRoutineIds: text('completed_routine_ids').array().notNull().default([]),
  skippedRoutineIds: text('skipped_routine_ids').array().notNull().default([]),
  currentIndex: integer('current_index').notNull().default(0),
  actualSeconds: integer('actual_seconds').notNull().default(0),
  context: jsonb('context').$type<Record<string, unknown>>().notNull().default({}),
  startedAt: timestamp('started_at', { mode: 'date' }).notNull().defaultNow(),
  lastActivityAt: timestamp('last_activity_at', { mode: 'date' }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
}, (t) => ({
  userStatusIdx: index('beauty_ritual_runs_user_status_idx').on(t.userId, t.status),
  userStartedIdx: index('beauty_ritual_runs_user_started_idx').on(t.userId, t.startedAt),
  activeRitualUid: uniqueIndex('beauty_ritual_runs_active_uidx').on(t.userId, t.ritualKey, t.status),
}));

export const beautyStepLogs = pgTable('beauty_step_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  runId: text('run_id').notNull().references(() => beautyRitualRuns.id, { onDelete: 'cascade' }),
  routineId: text('routine_id').references(() => beautyRoutines.id, { onDelete: 'set null' }),
  stepName: text('step_name').notNull(),
  status: text('status').notNull().default('completed'),
  actualSeconds: integer('actual_seconds').notNull().default(0),
  notes: text('notes'),
  completedAt: timestamp('completed_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  runIdx: index('beauty_step_logs_run_idx').on(t.runId),
  userDateIdx: index('beauty_step_logs_user_date_idx').on(t.userId, t.completedAt),
  runRoutineUid: uniqueIndex('beauty_step_logs_run_routine_uidx').on(t.runId, t.routineId),
}));

export const beautyTreatmentLogs = pgTable('beauty_treatment_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  treatmentKey: text('treatment_key').notNull(),
  treatmentName: text('treatment_name').notNull(),
  area: text('area').notNull().default('face'),
  productId: text('product_id').references(() => beautyProducts.id, { onDelete: 'set null' }),
  response: text('response'),
  notes: text('notes'),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userOccurredIdx: index('beauty_treatment_logs_user_occurred_idx').on(t.userId, t.occurredAt),
  userTreatmentIdx: index('beauty_treatment_logs_user_treatment_idx').on(t.userId, t.treatmentKey),
}));

export const beautyMaintenanceItems = pgTable('beauty_maintenance_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  category: text('category').notNull().default('general'),
  cadenceDays: integer('cadence_days'),
  nextDueAt: timestamp('next_due_at', { mode: 'date' }),
  lastCompletedAt: timestamp('last_completed_at', { mode: 'date' }),
  notes: text('notes'),
  source: text('source').notNull().default('manual'),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userDueIdx: index('beauty_maintenance_items_user_due_idx').on(t.userId, t.nextDueAt),
}));

export const beautyObservations = pgTable('beauty_observations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  subject: text('subject').notNull(),
  confidence: text('confidence').notNull().default('user_note'),
  body: text('body').notNull(),
  evidence: jsonb('evidence').$type<Record<string, unknown>>().notNull().default({}),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userStatusIdx: index('beauty_observations_user_status_idx').on(t.userId, t.status),
}));
