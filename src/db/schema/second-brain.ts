import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const brainCaptures = pgTable('brain_captures', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rawText: text('raw_text').notNull(),
  source: text('source').notNull().default('second-brain'),
  status: text('status').notNull().default('inbox'),
  detected: jsonb('detected').$type<Array<{kind:string;text:string;confidence:number}>>().notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  processedAt: timestamp('processed_at', { mode: 'date' }),
}, (t) => ({ userStatusIdx: index('brain_captures_user_status_idx').on(t.userId, t.status), createdIdx: index('brain_captures_created_idx').on(t.userId, t.createdAt) }));

export const brainThreads = pgTable('brain_threads', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  summary: text('summary'),
  currentState: text('current_state'),
  nextAction: text('next_action'),
  status: text('status').notNull().default('active'),
  mentionCount: integer('mention_count').notNull().default(1),
  firstSeenAt: timestamp('first_seen_at', { mode: 'date' }).notNull().defaultNow(),
  lastSeenAt: timestamp('last_seen_at', { mode: 'date' }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userSlugUnique: uniqueIndex('brain_threads_user_slug_uidx').on(t.userId, t.slug), statusIdx: index('brain_threads_status_idx').on(t.userId, t.status) }));

export const brainThoughts = pgTable('brain_thoughts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  threadId: text('thread_id').references(() => brainThreads.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  body: text('body'),
  kind: text('kind').notNull().default('thought'),
  lifecycle: text('lifecycle').notNull().default('captured'),
  maturity: text('maturity').notNull().default('seed'),
  energy: text('energy').notNull().default('normal'),
  archived: boolean('archived').notNull().default(false),
  sourceCaptureId: text('source_capture_id').references(() => brainCaptures.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userKindIdx: index('brain_thoughts_user_kind_idx').on(t.userId, t.kind), threadIdx: index('brain_thoughts_thread_idx').on(t.threadId) }));

export const brainDecisions = pgTable('brain_decisions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  threadId: text('thread_id').references(() => brainThreads.id, { onDelete: 'set null' }),
  question: text('question').notNull(),
  outcome: text('outcome'),
  rationale: text('rationale'),
  evidenceFor: text('evidence_for').array().notNull().default([]),
  evidenceAgainst: text('evidence_against').array().notNull().default([]),
  decisionType: text('decision_type').notNull().default('permanent'),
  status: text('status').notNull().default('waiting'),
  reviewAt: timestamp('review_at', { mode: 'date' }),
  decidedAt: timestamp('decided_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userStatusIdx: index('brain_decisions_user_status_idx').on(t.userId, t.status) }));

export const brainOpenLoops = pgTable('brain_open_loops', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  threadId: text('thread_id').references(() => brainThreads.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  loopType: text('loop_type').notNull().default('action'),
  status: text('status').notNull().default('open'),
  waitingOn: text('waiting_on'),
  followUpAt: timestamp('follow_up_at', { mode: 'date' }),
  sourceType: text('source_type'),
  sourceId: text('source_id'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { mode: 'date' }),
}, (t) => ({ userStatusIdx: index('brain_open_loops_user_status_idx').on(t.userId, t.status), followupIdx: index('brain_open_loops_followup_idx').on(t.userId, t.followUpAt) }));

export const brainPeople = pgTable('brain_people', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  context: text('context'),
  lastInteraction: text('last_interaction'),
  lastInteractionAt: timestamp('last_interaction_at', { mode: 'date' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userNameUnique: uniqueIndex('brain_people_user_name_uidx').on(t.userId, t.normalizedName) }));

export const brainMemories = pgTable('brain_memories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  memoryType: text('memory_type').notNull().default('important_fact'),
  sourceType: text('source_type'),
  sourceId: text('source_id'),
  reason: text('reason'),
  status: text('status').notNull().default('active'),
  lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userStatusIdx: index('brain_memories_user_status_idx').on(t.userId, t.status) }));

export const brainRelationships = pgTable('brain_relationships', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fromType: text('from_type').notNull(),
  fromId: text('from_id').notNull(),
  toType: text('to_type').notNull(),
  toId: text('to_id').notNull(),
  relation: text('relation').notNull().default('related_to'),
  reason: text('reason'),
  sourceType: text('source_type'),
  sourceId: text('source_id'),
  confidence: real('confidence').notNull().default(1),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ relationUnique: uniqueIndex('brain_relationships_uidx').on(t.userId, t.fromType, t.fromId, t.toType, t.toId, t.relation), userIdx: index('brain_relationships_user_idx').on(t.userId) }));

export const brainWorkspaces = pgTable('brain_workspaces', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  question: text('question').notNull(),
  criteria: text('criteria').array().notNull().default([]),
  evidence: jsonb('evidence').$type<Array<{label:string;detail:string;sourceType?:string;sourceId?:string}>>().notNull().default([]),
  unknowns: text('unknowns').array().notNull().default([]),
  outcome: text('outcome'),
  status: text('status').notNull().default('thinking'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userStatusIdx: index('brain_workspaces_user_status_idx').on(t.userId, t.status) }));
