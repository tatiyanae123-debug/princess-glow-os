import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const wellnessCheckIns = pgTable('wellness_check_ins', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  state: text('state').notNull(),
  need: text('need').notNull(),
  activation: text('activation'),
  energy: text('energy'),
  bodySignals: text('body_signals').array().notNull().default([]),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userDateIdx: index('wellness_check_ins_user_date_idx').on(t.userId, t.createdAt),
}));

export const wellnessProtocolRuns = pgTable('wellness_protocol_runs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  protocolKey: text('protocol_key').notNull(),
  title: text('title').notNull(),
  mode: text('mode').notNull().default('standard'),
  status: text('status').notNull().default('active'),
  queue: jsonb('queue').$type<Array<{ id: string; title: string; seconds: number; detail?: string }>>().notNull().default([]),
  completedStepIds: text('completed_step_ids').array().notNull().default([]),
  skippedStepIds: text('skipped_step_ids').array().notNull().default([]),
  currentIndex: integer('current_index').notNull().default(0),
  beforeActivation: text('before_activation'),
  afterEffect: text('after_effect'),
  actualSeconds: integer('actual_seconds').notNull().default(0),
  context: jsonb('context').$type<Record<string, unknown>>().notNull().default({}),
  startedAt: timestamp('started_at', { mode: 'date' }).notNull().defaultNow(),
  lastActivityAt: timestamp('last_activity_at', { mode: 'date' }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { mode: 'date' }),
}, (t) => ({
  userStatusIdx: index('wellness_protocol_runs_user_status_idx').on(t.userId, t.status),
  userStartedIdx: index('wellness_protocol_runs_user_started_idx').on(t.userId, t.startedAt),
}));

export const wellnessHydrationLogs = pgTable('wellness_hydration_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull().default('water'),
  amountMl: integer('amount_ml'),
  source: text('source').notNull().default('wellness'),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userDateIdx: index('wellness_hydration_logs_user_date_idx').on(t.userId, t.occurredAt) }));

export const wellnessObservations = pgTable('wellness_observations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  evidence: jsonb('evidence').$type<Record<string, unknown>>().notNull().default({}),
  confidence: text('confidence').notNull().default('user_reported'),
  dismissed: boolean('dismissed').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userDateIdx: index('wellness_observations_user_date_idx').on(t.userId, t.createdAt) }));
