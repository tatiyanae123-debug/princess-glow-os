import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { habits } from './habits';

export const habitProfiles = pgTable('habit_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  area: text('area').notNull().default('Life'),
  timeBand: text('time_band').notNull().default('anytime'),
  importanceTier: text('importance_tier').notNull().default('growth'),
  fullLabel: text('full_label'),
  fullMinutes: integer('full_minutes').notNull().default(10),
  quickLabel: text('quick_label'),
  quickMinutes: integer('quick_minutes').notNull().default(5),
  minimumLabel: text('minimum_label'),
  minimumMinutes: integer('minimum_minutes').notNull().default(2),
  difficulty: integer('difficulty').notNull().default(3),
  contextMode: text('context_mode').notNull().default('anywhere'),
  identityStatement: text('identity_statement'),
  whyItMatters: text('why_it_matters'),
  preferredAnchor: text('preferred_anchor'),
  weeklyTarget: integer('weekly_target'),
  rollingGoalType: text('rolling_goal_type').notNull().default('days'),
  rollingTarget: integer('rolling_target'),
  focus: boolean('focus').notNull().default(false),
  pausedUntil: timestamp('paused_until', { mode: 'date' }),
  pausedIndefinitely: boolean('paused_indefinitely').notNull().default(false),
  seasonalStartMonth: integer('seasonal_start_month'),
  seasonalEndMonth: integer('seasonal_end_month'),
  progressiveLevel: integer('progressive_level').notNull().default(1),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userHabitUnique: uniqueIndex('habit_profiles_user_habit_uidx').on(t.userId, t.habitId),
  userFocusIdx: index('habit_profiles_user_focus_idx').on(t.userId, t.focus),
}));

export const habitCompletionDetails = pgTable('habit_completion_details', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  dateKey: text('date_key').notNull(),
  version: text('version').notNull().default('full'),
  actualSeconds: integer('actual_seconds'),
  quantity: integer('quantity').notNull().default(1),
  intentionalSkip: boolean('intentional_skip').notNull().default(false),
  skipReason: text('skip_reason'),
  helpedBy: text('helped_by'),
  friction: text('friction'),
  sourceType: text('source_type').notNull().default('habits'),
  sourceId: text('source_id'),
  completedAt: timestamp('completed_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userHabitDateUnique: uniqueIndex('habit_completion_details_user_habit_date_uidx').on(t.userId, t.habitId, t.dateKey),
  userDateIdx: index('habit_completion_details_user_date_idx').on(t.userId, t.dateKey),
}));

export const habitTimingStats = pgTable('habit_timing_stats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  sampleCount: integer('sample_count').notNull().default(0),
  averageSeconds: integer('average_seconds').notNull().default(0),
  morningCount: integer('morning_count').notNull().default(0),
  afternoonCount: integer('afternoon_count').notNull().default(0),
  eveningCount: integer('evening_count').notNull().default(0),
  nightCount: integer('night_count').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userHabitUnique: uniqueIndex('habit_timing_stats_user_habit_uidx').on(t.userId, t.habitId) }));

export const habitTriggers = pgTable('habit_triggers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  triggerType: text('trigger_type').notNull(),
  triggerValue: text('trigger_value').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userHabitIdx: index('habit_triggers_user_habit_idx').on(t.userId, t.habitId) }));

export const habitStacks = pgTable('habit_stacks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  anchorType: text('anchor_type').notNull().default('manual'),
  anchorValue: text('anchor_value'),
  habitIds: jsonb('habit_ids').$type<string[]>().notNull().default([]),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userIdx: index('habit_stacks_user_idx').on(t.userId) }));

export const habitExperiments = pgTable('habit_experiments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  hypothesis: text('hypothesis').notNull(),
  change: text('change').notNull(),
  startsAt: timestamp('starts_at', { mode: 'date' }).notNull().defaultNow(),
  endsAt: timestamp('ends_at', { mode: 'date' }),
  baselineRate: real('baseline_rate'),
  resultRate: real('result_rate'),
  status: text('status').notNull().default('active'),
  resultSummary: text('result_summary'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userStatusIdx: index('habit_experiments_user_status_idx').on(t.userId, t.status) }));

export const habitSourceLinks = pgTable('habit_source_links', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  habitId: text('habit_id').notNull().references(() => habits.id, { onDelete: 'cascade' }),
  sourceType: text('source_type').notNull(),
  sourceId: text('source_id').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userHabitIdx: index('habit_source_links_user_habit_idx').on(t.userId, t.habitId),
  uniqueLink: uniqueIndex('habit_source_links_uidx').on(t.userId, t.habitId, t.sourceType, t.sourceId),
}));
