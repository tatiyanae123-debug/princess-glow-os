import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
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
}, (t) => ({ runIdx: index('beauty_step_logs_run_idx').on(t.runId), userDateIdx: index('beauty_step_logs_user_date_idx').on(t.userId, t.completedAt) }));

export const beautyTreatmentLogs = pgTable('beauty_treatment_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  treatmentKey: text('treatment_key').notNull(), treatmentName: text('treatment_name').notNull(), area: text('area').notNull().default('face'),
  productId: text('product_id').references(() => beautyProducts.id, { onDelete: 'set null' }), response: text('response'), notes: text('notes'),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userOccurredIdx: index('beauty_treatment_logs_user_occurred_idx').on(t.userId, t.occurredAt), userTreatmentIdx: index('beauty_treatment_logs_user_treatment_idx').on(t.userId, t.treatmentKey) }));

export const beautyTreatmentSchedules = pgTable('beauty_treatment_schedules', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  treatmentKey: text('treatment_key').notNull(), treatmentName: text('treatment_name').notNull(), area: text('area').notNull().default('face'),
  weekdays: integer('weekdays').array().notNull().default([]), cadenceDays: integer('cadence_days'), nextDueAt: timestamp('next_due_at', { mode: 'date' }),
  strongTreatment: boolean('strong_treatment').notNull().default(false), enabled: boolean('enabled').notNull().default(true), notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userEnabledIdx: index('beauty_treatment_schedules_user_enabled_idx').on(t.userId, t.enabled), userDueIdx: index('beauty_treatment_schedules_user_due_idx').on(t.userId, t.nextDueAt) }));

export const beautyMaintenanceItems = pgTable('beauty_maintenance_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), category: text('category').notNull().default('general'), cadenceDays: integer('cadence_days'), nextDueAt: timestamp('next_due_at', { mode: 'date' }), lastCompletedAt: timestamp('last_completed_at', { mode: 'date' }),
  notes: text('notes'), source: text('source').notNull().default('manual'), archived: boolean('archived').notNull().default(false), createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userDueIdx: index('beauty_maintenance_items_user_due_idx').on(t.userId, t.nextDueAt) }));

export const beautyLooks = pgTable('beauty_looks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), occasion: text('occasion').notNull().default('Everyday'), mood: text('mood').notNull().default('Natural'), plannedMinutes: integer('planned_minutes').notNull().default(20),
  steps: jsonb('steps').$type<string[]>().notNull().default([]), productIds: text('product_ids').array().notNull().default([]), notes: text('notes'), photoUrl: text('photo_url'), useCount: integer('use_count').notNull().default(0), lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userCreatedIdx: index('beauty_looks_user_created_idx').on(t.userId, t.createdAt) }));

export const beautyFragrances = pgTable('beauty_fragrances', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), productId: text('product_id').references(() => beautyProducts.id, { onDelete: 'set null' }),
  name: text('name').notNull(), family: text('family'), dayparts: text('dayparts').array().notNull().default([]), seasons: text('seasons').array().notNull().default([]), moods: text('moods').array().notNull().default([]), occasions: text('occasions').array().notNull().default([]), favorite: boolean('favorite').notNull().default(false), notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userIdx: index('beauty_fragrances_user_idx').on(t.userId) }));

export const beautyReadinessLogs = pgTable('beauty_readiness_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), context: text('context').notNull().default('leaving'),
  checks: jsonb('checks').$type<Record<string, boolean>>().notNull().default({}), completedCount: integer('completed_count').notNull().default(0), totalCount: integer('total_count').notNull().default(0),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userOccurredIdx: index('beauty_readiness_logs_user_occurred_idx').on(t.userId, t.occurredAt) }));

export const beautyObservations = pgTable('beauty_observations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }), kind: text('kind').notNull(), subject: text('subject').notNull(), confidence: text('confidence').notNull().default('user_note'), body: text('body').notNull(), evidence: jsonb('evidence').$type<Record<string, unknown>>().notNull().default({}), status: text('status').notNull().default('active'), createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(), updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userStatusIdx: index('beauty_observations_user_status_idx').on(t.userId, t.status) }));
