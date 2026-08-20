import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { routines, routineSteps } from './routines';

export const routineRuns = pgTable('routine_runs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  routineId: text('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  mode: text('mode').notNull().default('normal'),
  status: text('status').notNull().default('active'),
  queueStepIds: text('queue_step_ids').array().notNull().default([]),
  completedStepIds: text('completed_step_ids').array().notNull().default([]),
  skippedStepIds: text('skipped_step_ids').array().notNull().default([]),
  currentIndex: integer('current_index').notNull().default(0),
  startedAt: timestamp('started_at', { mode: 'date' }).notNull().defaultNow(),
  lastActivityAt: timestamp('last_activity_at', { mode: 'date' }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  actualSeconds: integer('actual_seconds').notNull().default(0),
  context: jsonb('context').$type<Record<string, unknown>>().notNull().default({}),
}, (t) => ({
  userStatusIdx: index('routine_runs_user_status_idx').on(t.userId, t.status),
  routineStartedIdx: index('routine_runs_routine_started_idx').on(t.routineId, t.startedAt),
}));

export const routineStepRuns = pgTable('routine_step_runs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  runId: text('run_id').notNull().references(() => routineRuns.id, { onDelete: 'cascade' }),
  stepId: text('step_id').notNull().references(() => routineSteps.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'),
  startedAt: timestamp('started_at', { mode: 'date' }),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  actualSeconds: integer('actual_seconds').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  runStepUnique: uniqueIndex('routine_step_runs_run_step_uidx').on(t.runId, t.stepId),
  userStepIdx: index('routine_step_runs_user_step_idx').on(t.userId, t.stepId),
}));

export const routineStepStats = pgTable('routine_step_stats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stepId: text('step_id').notNull().references(() => routineSteps.id, { onDelete: 'cascade' }),
  sampleCount: integer('sample_count').notNull().default(0),
  totalSeconds: integer('total_seconds').notNull().default(0),
  averageSeconds: integer('average_seconds').notNull().default(0),
  lastSeconds: integer('last_seconds').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userStepUnique: uniqueIndex('routine_step_stats_user_step_uidx').on(t.userId, t.stepId),
}));

export const routineStepLinks = pgTable('routine_step_links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stepId: text('step_id').notNull().references(() => routineSteps.id, { onDelete: 'cascade' }),
  targetType: text('target_type').notNull(),
  targetId: text('target_id').notNull(),
  completionPolicy: text('completion_policy').notNull().default('complete_with_step'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userStepIdx: index('routine_step_links_user_step_idx').on(t.userId, t.stepId),
  stepTargetUnique: uniqueIndex('routine_step_links_step_target_uidx').on(t.stepId, t.targetType, t.targetId),
}));

export const routineTriggers = pgTable('routine_triggers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  routineId: text('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  triggerType: text('trigger_type').notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  enabled: boolean('enabled').notNull().default(true),
  lastMatchedAt: timestamp('last_matched_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userEnabledIdx: index('routine_triggers_user_enabled_idx').on(t.userId, t.enabled),
}));

export const routineStepRules = pgTable('routine_step_rules', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  stepId: text('step_id').notNull().references(() => routineSteps.id, { onDelete: 'cascade' }),
  ruleType: text('rule_type').notNull(),
  config: jsonb('config').$type<Record<string, unknown>>().notNull().default({}),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userStepIdx: index('routine_step_rules_user_step_idx').on(t.userId, t.stepId),
}));

export const routineChains = pgTable('routine_chains', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sourceRoutineId: text('source_routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  nextRoutineId: text('next_routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  sourceUnique: uniqueIndex('routine_chains_source_uidx').on(t.userId, t.sourceRoutineId),
}));
