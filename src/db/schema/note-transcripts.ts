import { index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { notes } from './notes';

export const noteMediaSources = pgTable('note_media_sources', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  noteId: text('note_id').references(() => notes.id, { onDelete: 'set null' }),
  sourceType: text('source_type').notNull().default('upload'),
  sourceUrl: text('source_url'),
  platform: text('platform'),
  title: text('title').notNull(),
  mimeType: text('mime_type'),
  durationSeconds: integer('duration_seconds'),
  status: text('status').notNull().default('pending'),
  error: text('error'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ userIdx: index('note_media_sources_user_idx').on(t.userId, t.createdAt), noteIdx: index('note_media_sources_note_idx').on(t.noteId) }));

export const noteTranscriptChunks = pgTable('note_transcript_chunks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sourceId: text('source_id').notNull().references(() => noteMediaSources.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  startSeconds: integer('start_seconds'),
  endSeconds: integer('end_seconds'),
  text: text('text').notNull(),
  analysis: text('analysis'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ sourceIdx: index('note_transcript_chunks_source_idx').on(t.sourceId, t.chunkIndex), userIdx: index('note_transcript_chunks_user_idx').on(t.userId) }));

export const noteTranscriptAnalyses = pgTable('note_transcript_analyses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sourceId: text('source_id').notNull().references(() => noteMediaSources.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  summary: text('summary'),
  keyPoints: jsonb('key_points').$type<string[]>().notNull().default([]),
  decisions: jsonb('decisions').$type<string[]>().notNull().default([]),
  actionItems: jsonb('action_items').$type<string[]>().notNull().default([]),
  questions: jsonb('questions').$type<string[]>().notNull().default([]),
  themes: jsonb('themes').$type<string[]>().notNull().default([]),
  status: text('status').notNull().default('pending'),
  model: text('model'),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ sourceIdx: index('note_transcript_analyses_source_idx').on(t.sourceId), userIdx: index('note_transcript_analyses_user_idx').on(t.userId) }));

export const noteTranscriptQuestions = pgTable('note_transcript_questions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sourceId: text('source_id').notNull().references(() => noteMediaSources.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  evidence: jsonb('evidence').$type<Array<{chunkIndex:number;quote:string}>>().notNull().default([]),
  model: text('model'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
}, (t) => ({ sourceIdx: index('note_transcript_questions_source_idx').on(t.sourceId, t.createdAt), userIdx: index('note_transcript_questions_user_idx').on(t.userId) }));
