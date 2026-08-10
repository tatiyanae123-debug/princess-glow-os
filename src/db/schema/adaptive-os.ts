import { boolean, index, integer, jsonb, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const lifeModes = pgTable('life_modes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  energyTarget: integer('energy_target'),
  maxMajorTasks: integer('max_major_tasks').notNull().default(3),
  workoutPolicy: text('workout_policy'),
  routinePolicy: text('routine_policy'),
  schedulingPolicy: text('scheduling_policy'),
  settings: jsonb('settings').$type<Record<string, unknown>>().notNull().default({}),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userActiveIdx: index('life_modes_user_active_idx').on(t.userId, t.isActive) }));

export const personalRules = pgTable('personal_rules', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  ruleType: text('rule_type').notNull(),
  condition: jsonb('condition').$type<Record<string, unknown>>().notNull().default({}),
  effect: jsonb('effect').$type<Record<string, unknown>>().notNull().default({}),
  priority: integer('priority').notNull().default(50),
  enabled: boolean('enabled').notNull().default(true),
  source: text('source').notNull().default('user'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userEnabledIdx: index('personal_rules_user_enabled_idx').on(t.userId, t.enabled) }));

export const glowInboxItems = pgTable('glow_inbox_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rawText: text('raw_text').notNull(),
  source: text('source').notNull().default('manual'),
  suggestedType: text('suggested_type'),
  suggestedTitle: text('suggested_title'),
  confidence: real('confidence').notNull().default(0.5),
  status: text('status').notNull().default('unprocessed'),
  routedEntityType: text('routed_entity_type'),
  routedEntityId: text('routed_entity_id'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { mode: 'date' }),
}, (t) => ({ userStatusIdx: index('glow_inbox_items_user_status_idx').on(t.userId, t.status) }));

export const taskDependencies = pgTable('task_dependencies', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  predecessorType: text('predecessor_type').notNull(),
  predecessorId: text('predecessor_id').notNull(),
  successorType: text('successor_type').notNull(),
  successorId: text('successor_id').notNull(),
  dependencyType: text('dependency_type').notNull().default('blocks'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userSuccessorIdx: index('task_dependencies_user_successor_idx').on(t.userId, t.successorType, t.successorId) }));

export const entityRelations = pgTable('entity_relations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fromType: text('from_type').notNull(),
  fromId: text('from_id').notNull(),
  relation: text('relation').notNull(),
  toType: text('to_type').notNull(),
  toId: text('to_id').notNull(),
  weight: real('weight').notNull().default(1),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userFromIdx: index('entity_relations_user_from_idx').on(t.userId, t.fromType, t.fromId) }));

export const focusSessions = pgTable('focus_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  title: text('title').notNull(),
  startedAt: timestamp('started_at', { mode: 'date' }).notNull().defaultNow(),
  endedAt: timestamp('ended_at', { mode: 'date' }),
  plannedMinutes: integer('planned_minutes'),
  actualMinutes: integer('actual_minutes'),
  outcome: text('outcome'),
  notes: text('notes'),
  completed: boolean('completed').notNull().default(false),
}, (t) => ({ userStartedIdx: index('focus_sessions_user_started_idx').on(t.userId, t.startedAt) }));

export const dayReviews = pgTable('day_reviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  dateKey: text('date_key').notNull(),
  energy: integer('energy'),
  mood: text('mood'),
  completedSummary: text('completed_summary'),
  movedSummary: text('moved_summary'),
  memoryNote: text('memory_note'),
  tomorrowTopThree: jsonb('tomorrow_top_three').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userDateIdx: index('day_reviews_user_date_idx').on(t.userId, t.dateKey) }));

export const maintenanceForecasts = pgTable('maintenance_forecasts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  domain: text('domain').notNull(),
  title: text('title').notNull(),
  dueAt: timestamp('due_at', { mode: 'date' }),
  urgency: text('urgency').notNull().default('normal'),
  sourceType: text('source_type'),
  sourceId: text('source_id'),
  recommendation: text('recommendation'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userDueIdx: index('maintenance_forecasts_user_due_idx').on(t.userId, t.dueAt) }));
