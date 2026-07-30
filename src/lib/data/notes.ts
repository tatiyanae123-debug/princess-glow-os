import { db } from '@/db';
import { notes } from '@/db/schema/notes';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateNoteInput, UpdateNoteInput } from '@/lib/validations/notes';

export async function getNotesByUser(userId: string) {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.userId, userId), eq(notes.archived, false)))
    .orderBy(desc(notes.pinned), desc(notes.updatedAt));
}

export async function getNoteById(id: string, userId: string) {
  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)));
  return note ?? null;
}

export async function createNote(userId: string, data: CreateNoteInput) {
  const [note] = await db
    .insert(notes)
    .values({ ...data, userId })
    .returning();
  return note;
}

export async function updateNote(id: string, userId: string, data: UpdateNoteInput) {
  const [note] = await db
    .update(notes)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
  return note ?? null;
}

export async function deleteNote(id: string, userId: string) {
  const [note] = await db
    .update(notes)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning();
  return note ?? null;
}
