import { db } from '@/db';
import { importantLinks } from '@/db/schema/important-links';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateImportantLinkInput, UpdateImportantLinkInput } from '@/lib/validations/important-links';

export async function getImportantLinksByUser(userId: string) {
  return db
    .select()
    .from(importantLinks)
    .where(and(eq(importantLinks.userId, userId), eq(importantLinks.archived, false)))
    .orderBy(desc(importantLinks.pinned), desc(importantLinks.createdAt));
}

export async function getImportantLinkById(id: string, userId: string) {
  const [link] = await db
    .select()
    .from(importantLinks)
    .where(and(eq(importantLinks.id, id), eq(importantLinks.userId, userId)));
  return link ?? null;
}

export async function createImportantLink(userId: string, data: CreateImportantLinkInput) {
  const [link] = await db
    .insert(importantLinks)
    .values({ ...data, userId })
    .returning();
  return link;
}

export async function updateImportantLink(id: string, userId: string, data: UpdateImportantLinkInput) {
  const [link] = await db
    .update(importantLinks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(importantLinks.id, id), eq(importantLinks.userId, userId)))
    .returning();
  return link ?? null;
}

export async function deleteImportantLink(id: string, userId: string) {
  const [link] = await db
    .update(importantLinks)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(importantLinks.id, id), eq(importantLinks.userId, userId)))
    .returning();
  return link ?? null;
}
