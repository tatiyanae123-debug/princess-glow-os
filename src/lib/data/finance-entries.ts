import { db } from '@/db';
import { financeEntries } from '@/db/schema/finance-entries';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateFinanceEntryInput, UpdateFinanceEntryInput } from '@/lib/validations/finance-entries';

export async function getFinanceEntriesByUser(userId: string) {
  try {
    return await db.select().from(financeEntries).where(and(eq(financeEntries.userId, userId), eq(financeEntries.archived, false))).orderBy(desc(financeEntries.entryDate));
  } catch (error) {
    console.error('[Glow OS] finance entries unavailable', error);
    return [];
  }
}

export async function getFinanceEntryById(id: string, userId: string) {
  try {
    const [entry] = await db.select().from(financeEntries).where(and(eq(financeEntries.id, id), eq(financeEntries.userId, userId)));
    return entry ?? null;
  } catch (error) {
    console.error('[Glow OS] finance entry unavailable', error);
    return null;
  }
}

export async function createFinanceEntry(userId: string, data: CreateFinanceEntryInput) {
  const [entry] = await db.insert(financeEntries).values({ ...data, userId }).returning();
  return entry;
}

export async function updateFinanceEntry(id: string, userId: string, data: UpdateFinanceEntryInput) {
  const [entry] = await db.update(financeEntries).set({ ...data, updatedAt: new Date() }).where(and(eq(financeEntries.id, id), eq(financeEntries.userId, userId))).returning();
  return entry ?? null;
}

export async function deleteFinanceEntry(id: string, userId: string) {
  const [entry] = await db.update(financeEntries).set({ archived: true, updatedAt: new Date() }).where(and(eq(financeEntries.id, id), eq(financeEntries.userId, userId))).returning();
  return entry ?? null;
}
