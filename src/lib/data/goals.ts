import { db } from '@/db';
import { goals } from '@/db/schema/goals';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateGoalInput, UpdateGoalInput } from '@/lib/validations/goals';

export async function getGoalsByUser(userId: string) {
  return db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.archived, false)))
    .orderBy(desc(goals.createdAt));
}

export async function getGoalById(id: string, userId: string) {
  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)));
  return goal ?? null;
}

export async function createGoal(userId: string, data: CreateGoalInput) {
  const [goal] = await db
    .insert(goals)
    .values({ ...data, userId })
    .returning();
  return goal;
}

export async function updateGoal(id: string, userId: string, data: UpdateGoalInput) {
  const [goal] = await db
    .update(goals)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .returning();
  return goal ?? null;
}

export async function deleteGoal(id: string, userId: string) {
  const [goal] = await db
    .update(goals)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .returning();
  return goal ?? null;
}
