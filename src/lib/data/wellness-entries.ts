import { db } from '@/db';
import { wellnessEntries } from '@/db/schema/wellness-entries';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateWellnessEntryInput, UpdateWellnessEntryInput } from '@/lib/validations/wellness-entries';

// Note: wellness uses hard delete (deleteWellnessEntry calls DELETE, not soft-archive)
// because the wellness_entries table has no `archived` column.

export async function getWellnessEntriesByUser(userId: string) {
  return db
    .select()
    .from(wellnessEntries)
    .where(eq(wellnessEntries.userId, userId))
    .orderBy(desc(wellnessEntries.entryDate));
}

export async function getWellnessEntryById(id: string, userId: string) {
  const [entry] = await db
    .select()
    .from(wellnessEntries)
    .where(and(eq(wellnessEntries.id, id), eq(wellnessEntries.userId, userId)));
  return entry ?? null;
}

export async function createWellnessEntry(userId: string, data: CreateWellnessEntryInput) {
  const [entry] = await db
    .insert(wellnessEntries)
    .values({ ...data, userId })
    .returning();
  return entry;
}

export async function updateWellnessEntry(id: string, userId: string, data: UpdateWellnessEntryInput) {
  const [entry] = await db
    .update(wellnessEntries)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(wellnessEntries.id, id), eq(wellnessEntries.userId, userId)))
    .returning();
  return entry ?? null;
}

export async function deleteWellnessEntry(id: string, userId: string) {
  const [entry] = await db
    .delete(wellnessEntries)
    .where(and(eq(wellnessEntries.id, id), eq(wellnessEntries.userId, userId)))
    .returning();
  return entry ?? null;
}
