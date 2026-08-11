import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const glowEntities = pgTable('glow_entities', {
  id:text('id').primaryKey().$defaultFn(()=>crypto.randomUUID()), userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}), entityType:text('entity_type').notNull(), sourceTable:text('source_table'), sourceId:text('source_id'), title:text('title').notNull(), summary:text('summary'), searchableText:text('searchable_text'), status:text('status').notNull().default('active'), importance:real('importance').notNull().default(.5), metadata:jsonb('metadata').$type<Record<string,unknown>>().notNull().default({}), createdAt:timestamp('created_at',{mode:'date'}).notNull().defaultNow(), updatedAt:timestamp('updated_at',{mode:'date'}).notNull().defaultNow(),
}, t=>({userTypeIdx:index('glow_entities_user_type_idx').on(t.userId,t.entityType),sourceUnique:uniqueIndex('glow_entities_source_uidx').on(t.userId,t.sourceTable,t.sourceId)}));

export const universalIntakeArtifacts = pgTable('universal_intake_artifacts', {
  id:text('id').primaryKey().$defaultFn(()=>crypto.randomUUID()), userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}), inboxItemId:text('inbox_item_id'), kind:text('kind').notNull(), originalName:text('original_name'), mimeType:text('mime_type'), sizeBytes:integer('size_bytes'), sourceText:text('source_text'), contentDataUrl:text('content_data_url'), detectedType:text('detected_type'), detectedTitle:text('detected_title'), extracted:jsonb('extracted').$type<Record<string,unknown>>().notNull().default({}), proposedDestinations:jsonb('proposed_destinations').$type<string[]>().notNull().default([]), analysisStatus:text('analysis_status').notNull().default('analyzed'), confidence:real('confidence').notNull().default(.5), createdAt:timestamp('created_at',{mode:'date'}).notNull().defaultNow(),
}, t=>({userCreatedIdx:index('universal_intake_user_created_idx').on(t.userId,t.createdAt)}));

export const resourceLibraryItems = pgTable('resource_library_items', {
  id:text('id').primaryKey().$defaultFn(()=>crypto.randomUUID()), userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}), title:text('title').notNull(), category:text('category').notNull(), durationMinutes:integer('duration_minutes'), content:text('content'), tags:jsonb('tags').$type<string[]>().notNull().default([]), conditions:jsonb('conditions').$type<Record<string,unknown>>().notNull().default({}), archived:boolean('archived').notNull().default(false), createdAt:timestamp('created_at',{mode:'date'}).notNull().defaultNow(), updatedAt:timestamp('updated_at',{mode:'date'}).notNull().defaultNow(),
}, t=>({userCategoryIdx:index('resource_library_user_category_idx').on(t.userId,t.category)}));

export const systemPreferences = pgTable('system_preferences', {
  id:text('id').primaryKey().$defaultFn(()=>crypto.randomUUID()), userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}), systemKey:text('system_key').notNull(), pinned:boolean('pinned').notNull().default(false), hidden:boolean('hidden').notNull().default(false), label:text('label'), imageUrl:text('image_url'), cardSize:text('card_size'), preferences:jsonb('preferences').$type<Record<string,unknown>>().notNull().default({}), updatedAt:timestamp('updated_at',{mode:'date'}).notNull().defaultNow(),
}, t=>({userSystemUnique:uniqueIndex('system_preferences_user_system_uidx').on(t.userId,t.systemKey)}));

export const glowNotices = pgTable('glow_notices', {
  id:text('id').primaryKey().$defaultFn(()=>crypto.randomUUID()), userId:text('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}), domain:text('domain').notNull(), title:text('title').notNull(), evidence:text('evidence').notNull(), recommendation:text('recommendation'), confidence:real('confidence').notNull().default(.5), status:text('status').notNull().default('active'), actionType:text('action_type'), actionPayload:jsonb('action_payload').$type<Record<string,unknown>>().notNull().default({}), snoozedUntil:timestamp('snoozed_until',{mode:'date'}), createdAt:timestamp('created_at',{mode:'date'}).notNull().defaultNow(),
}, t=>({userStatusIdx:index('glow_notices_user_status_idx').on(t.userId,t.status)}));
