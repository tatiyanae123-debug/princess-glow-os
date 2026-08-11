import { pgTable, text, timestamp, boolean, index, integer, jsonb, real, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const appleReminderConnections = pgTable('apple_reminder_connections', {
  userId: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  status: text('status').notNull().default('ready'),
  lastImportedAt: timestamp('last_imported_at', { mode: 'date' }),
  lastError: text('last_error'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const appleReminders = pgTable('apple_reminders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  source: text('source').notNull().default('apple_reminders'),
  externalId: text('external_id').notNull(),
  listName: text('list_name').notNull().default('Reminders'),
  title: text('title').notNull(),
  notes: text('notes'),
  dueAt: timestamp('due_at', { mode: 'date' }),
  completed: boolean('completed').notNull().default(false),
  lastSyncedAt: timestamp('last_synced_at', { mode: 'date' }).notNull().defaultNow(),
  importAudit: jsonb('import_audit').$type<Record<string, unknown>>().notNull(),
}, (r) => ({
  userIdx: index('apple_reminders_user_idx').on(r.userId),
  ownerExternalUnique: uniqueIndex('apple_reminders_owner_external_uidx').on(r.userId, r.externalId),
}));

export const planningBlocks = pgTable('planning_blocks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  proposalId: text('proposal_id').notNull(),
  sourceType: text('source_type').notNull(),
  sourceId: text('source_id'),
  title: text('title').notNull(),
  reason: text('reason').notNull(),
  startAt: timestamp('start_at', { mode: 'date' }).notNull(),
  endAt: timestamp('end_at', { mode: 'date' }).notNull(),
  status: text('status').notNull().default('accepted'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (p) => ({ userIdx: index('planning_blocks_user_idx').on(p.userId), proposalIdx: index('planning_blocks_proposal_idx').on(p.proposalId) }));

export const lifeMemories = pgTable('life_memories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  source: text('source').notNull(),
  title: text('title').notNull(),
  summary: text('summary'),
  sourceDate: timestamp('source_date', { mode: 'date' }),
  relatedArea: text('related_area'),
  relatedProjectId: text('related_project_id'),
  confidence: real('confidence').notNull().default(1),
  privacyLevel: text('privacy_level').notNull().default('private'),
  pinned: boolean('pinned').notNull().default(false),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (m) => ({ userIdx: index('life_memories_user_idx').on(m.userId) }));

export const projects = pgTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  area: text('area').notNull(),
  status: text('status').notNull().default('active'),
  priority: text('priority').notNull().default('medium'),
  progress: integer('progress').notNull().default(0),
  nextAction: text('next_action'),
  deadline: timestamp('deadline', { mode: 'date' }),
  notes: text('notes'),
  milestones: jsonb('milestones').$type<unknown[]>().notNull().default([]),
  relatedTaskIds: jsonb('related_task_ids').$type<string[]>().notNull().default([]),
  activity: jsonb('activity').$type<unknown[]>().notNull().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (p) => ({ userIdx: index('projects_user_idx').on(p.userId) }));
