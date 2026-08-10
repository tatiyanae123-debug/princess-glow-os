import { boolean, index, integer, jsonb, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const planningPeriods = pgTable('planning_periods', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  level: text('level').notNull(),
  title: text('title').notNull(),
  focus: text('focus'),
  startsAt: timestamp('starts_at', { mode: 'date' }),
  endsAt: timestamp('ends_at', { mode: 'date' }),
  progress: integer('progress').notNull().default(0),
  reflection: text('reflection'),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userLevelIdx: index('planning_periods_user_level_idx').on(t.userId, t.level) }));

export const aiProposals = pgTable('ai_proposals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  intent: text('intent').notNull(),
  summary: text('summary').notNull(),
  reason: text('reason').notNull(),
  confidence: real('confidence').notNull().default(0.5),
  reversible: boolean('reversible').notNull().default(true),
  status: text('status').notNull().default('pending'),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  decidedAt: timestamp('decided_at', { mode: 'date' }),
}, (t) => ({ userStatusIdx: index('ai_proposals_user_status_idx').on(t.userId, t.status) }));

export const auditEvents = pgTable('audit_events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id'),
  details: jsonb('details').$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userCreatedIdx: index('audit_events_user_created_idx').on(t.userId, t.createdAt) }));

export const intelligentObservations = pgTable('intelligent_observations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  title: text('title').notNull(),
  evidence: text('evidence').notNull(),
  timeWindow: text('time_window').notNull(),
  confidence: real('confidence').notNull().default(0.5),
  status: text('status').notNull().default('active'),
  snoozedUntil: timestamp('snoozed_until', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userStatusIdx: index('intelligent_observations_user_status_idx').on(t.userId, t.status) }));

export const beautyProducts = pgTable('beauty_products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  ingredients: text('ingredients'),
  openedAt: timestamp('opened_at', { mode: 'date' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  routinePosition: text('routine_position'),
  reaction: text('reaction'),
  costCents: integer('cost_cents'),
  repurchase: text('repurchase'),
  usageFrequency: text('usage_frequency'),
  photoUrl: text('photo_url'),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userIdx: index('beauty_products_user_idx').on(t.userId) }));

export const hairLogs = pgTable('hair_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull().defaultNow(),
  style: text('style'),
  products: text('products'),
  heatUsed: boolean('heat_used').notNull().default(false),
  notes: text('notes'),
  nextAction: text('next_action'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userOccurredIdx: index('hair_logs_user_occurred_idx').on(t.userId, t.occurredAt) }));

export const fitnessSessions = pgTable('fitness_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workoutType: text('workout_type').notNull(),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull().defaultNow(),
  durationMinutes: integer('duration_minutes'),
  energy: integer('energy'),
  soreness: integer('soreness'),
  equipment: text('equipment'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userOccurredIdx: index('fitness_sessions_user_occurred_idx').on(t.userId, t.occurredAt) }));

export const closetItems = pgTable('closet_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  season: text('season'),
  weatherTags: text('weather_tags'),
  purchaseDate: timestamp('purchase_date', { mode: 'date' }),
  purchasePriceCents: integer('purchase_price_cents'),
  wearCount: integer('wear_count').notNull().default(0),
  laundryState: text('laundry_state').notNull().default('clean'),
  favorite: boolean('favorite').notNull().default(false),
  status: text('status').notNull().default('active'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userIdx: index('closet_items_user_idx').on(t.userId) }));

export const financeGoals = pgTable('finance_goals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  goalType: text('goal_type').notNull(),
  targetCents: integer('target_cents').notNull(),
  currentCents: integer('current_cents').notNull().default(0),
  targetDate: timestamp('target_date', { mode: 'date' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userIdx: index('finance_goals_user_idx').on(t.userId) }));

export const lifeTimelineEvents = pgTable('life_timeline_events', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: text('category').notNull(),
  title: text('title').notNull(),
  occurredAt: timestamp('occurred_at', { mode: 'date' }).notNull(),
  summary: text('summary'),
  relatedEntityType: text('related_entity_type'),
  relatedEntityId: text('related_entity_id'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userOccurredIdx: index('life_timeline_events_user_occurred_idx').on(t.userId, t.occurredAt) }));

export const briefingSnapshots = pgTable('briefing_snapshots', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  kind: text('kind').notNull(),
  periodKey: text('period_key').notNull(),
  content: jsonb('content').$type<Record<string, unknown>>().notNull().default({}),
  generatedAt: timestamp('generated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userKindIdx: index('briefing_snapshots_user_kind_idx').on(t.userId, t.kind) }));
