import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const glowObjectVersions = pgTable('glow_object_versions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  objectId: text('object_id').notNull(),
  version: integer('version').notNull(),
  state: text('state').notNull().default('active'),
  confidence: real('confidence').notNull().default(1),
  sourceHash: text('source_hash'),
  snapshot: jsonb('snapshot').$type<Record<string, unknown>>().notNull().default({}),
  reason: text('reason'),
  actor: text('actor').notNull().default('kernel'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userObjectIdx: index('glow_object_versions_user_object_idx').on(t.userId, t.objectId),
  userObjectVersionUnique: uniqueIndex('glow_object_versions_user_object_version_uidx').on(t.userId, t.objectId, t.version),
}));

export const glowKernelEvents = pgTable('glow_kernel_events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  objectId: text('object_id'),
  relatedObjectIds: jsonb('related_object_ids').$type<string[]>().notNull().default([]),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
  source: text('source').notNull().default('kernel'),
  confidence: real('confidence').notNull().default(1),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userOccurredIdx: index('glow_kernel_events_user_occurred_idx').on(t.userId, t.occurredAt),
  userTypeIdx: index('glow_kernel_events_user_type_idx').on(t.userId, t.eventType),
}));

export const glowScenarios = pgTable('glow_scenarios', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull().default('proposed-reality'),
  title: text('title').notNull(),
  summary: text('summary'),
  basedOnRealityId: text('based_on_reality_id').notNull(),
  sourceRoute: text('source_route'),
  sourceText: text('source_text'),
  status: text('status').notNull().default('draft'),
  confidence: real('confidence').notNull().default(0.5),
  assumptions: jsonb('assumptions').$type<string[]>().notNull().default([]),
  expectedEffects: jsonb('expected_effects').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  decidedAt: timestamp('decided_at', { mode: 'date' }),
}, (t) => ({
  userStatusIdx: index('glow_scenarios_user_status_idx').on(t.userId, t.status),
  userCreatedIdx: index('glow_scenarios_user_created_idx').on(t.userId, t.createdAt),
}));

export const glowScenarioChanges = pgTable('glow_scenario_changes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scenarioId: text('scenario_id').notNull(),
  objectId: text('object_id'),
  actionType: text('action_type').notNull(),
  patch: jsonb('patch').$type<Record<string, unknown>>().notNull().default({}),
  rationale: text('rationale').notNull(),
  expectedEffects: jsonb('expected_effects').$type<string[]>().notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userScenarioIdx: index('glow_scenario_changes_user_scenario_idx').on(t.userId, t.scenarioId),
}));

export const glowActionReceipts = pgTable('glow_action_receipts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  scenarioId: text('scenario_id'),
  action: text('action').notNull(),
  reasons: jsonb('reasons').$type<string[]>().notNull().default([]),
  evidence: jsonb('evidence').$type<string[]>().notNull().default([]),
  affectedObjectIds: jsonb('affected_object_ids').$type<string[]>().notNull().default([]),
  affectedDomains: jsonb('affected_domains').$type<string[]>().notNull().default([]),
  confidence: real('confidence').notNull().default(1),
  executor: text('executor').notNull(),
  result: text('result').notNull(),
  reversible: boolean('reversible').notNull().default(false),
  undoRef: text('undo_ref'),
  details: jsonb('details').$type<Record<string, unknown>>().notNull().default({}),
  changedAt: timestamp('changed_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userChangedIdx: index('glow_action_receipts_user_changed_idx').on(t.userId, t.changedAt),
  userScenarioIdx: index('glow_action_receipts_user_scenario_idx').on(t.userId, t.scenarioId),
}));

export const glowLearnings = pgTable('glow_learnings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  learningType: text('learning_type').notNull(),
  domain: text('domain').notNull(),
  statement: text('statement').notNull(),
  evidenceObjectIds: jsonb('evidence_object_ids').$type<string[]>().notNull().default([]),
  confidence: real('confidence').notNull().default(0.5),
  status: text('status').notNull().default('proposed'),
  source: text('source').notNull().default('kernel'),
  validFrom: timestamp('valid_from', { mode: 'date' }).notNull().defaultNow(),
  validUntil: timestamp('valid_until', { mode: 'date' }),
  supersededBy: text('superseded_by'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({
  userStatusIdx: index('glow_learnings_user_status_idx').on(t.userId, t.status),
  userDomainIdx: index('glow_learnings_user_domain_idx').on(t.userId, t.domain),
}));

export const glowKernelStates = pgTable('glow_kernel_states', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  schemaVersion: integer('schema_version').notNull().default(1),
  currentRealityId: text('current_reality_id').notNull(),
  lastFullSyncAt: timestamp('last_full_sync_at', { mode: 'date' }),
  lastEventAt: timestamp('last_event_at', { mode: 'date' }),
  lastError: text('last_error'),
  syncRevision: integer('sync_revision').notNull().default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});
