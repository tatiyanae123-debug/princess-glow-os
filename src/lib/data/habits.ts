import { db } from '@/db';
import { habits, habitLogs } from '@/db/schema/habits';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateHabitInput, UpdateHabitInput, CreateHabitLogInput } from '@/lib/validations/habits';

export async function getHabitsByUser(userId: string) {
  return db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.archived, false)))
    .orderBy(desc(habits.createdAt));
}

export async function getHabitById(id: string, userId: string) {
  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, userId)));
  return habit ?? null;
}

export async function createHabit(userId: string, data: CreateHabitInput) {
  const [habit] = await db
    .insert(habits)
    .values({ ...data, userId })
    .returning();
  return habit;
}

export async function updateHabit(id: string, userId: string, data: UpdateHabitInput) {
  const [habit] = await db
    .update(habits)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .returning();
  return habit ?? null;
}

export async function deleteHabit(id: string, userId: string) {
  const [habit] = await db
    .update(habits)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(habits.id, id), eq(habits.userId, userId)))
    .returning();
  return habit ?? null;
}

export async function getHabitLogsByHabit(habitId: string, userId: string) {
  return db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.userId, userId)))
    .orderBy(desc(habitLogs.loggedDate));
}

export async function createHabitLog(userId: string, data: CreateHabitLogInput) {
  const [log] = await db
    .insert(habitLogs)
    .values({ ...data, userId })
    .returning();
  return log;
}

// Used by the Living Dashboard to show today's completion state across all
// habits in a single query, instead of one getHabitLogsByHabit call per habit.
export async function getHabitLogsForUserByDate(userId: string, date: string) {
  return db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.userId, userId), eq(habitLogs.loggedDate, date)));
}

export async function deleteHabitLog(id: string, userId: string) {
  const [log] = await db
    .delete(habitLogs)
    .where(and(eq(habitLogs.id, id), eq(habitLogs.userId, userId)))
    .returning();
  return log ?? null;
}
