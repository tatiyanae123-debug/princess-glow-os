import { db } from '@/db';
import { workSchedules } from '@/db/schema/work-schedules';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateWorkScheduleInput, UpdateWorkScheduleInput } from '@/lib/validations/work-schedules';

export async function getWorkSchedulesByUser(userId: string) {
  return db
    .select()
    .from(workSchedules)
    .where(and(eq(workSchedules.userId, userId), eq(workSchedules.archived, false)))
    .orderBy(desc(workSchedules.dayOfWeek));
}

export async function getWorkScheduleById(id: string, userId: string) {
  const [schedule] = await db
    .select()
    .from(workSchedules)
    .where(and(eq(workSchedules.id, id), eq(workSchedules.userId, userId)));
  return schedule ?? null;
}

export async function createWorkSchedule(userId: string, data: CreateWorkScheduleInput) {
  const [schedule] = await db
    .insert(workSchedules)
    .values({ ...data, userId })
    .returning();
  return schedule;
}

export async function updateWorkSchedule(id: string, userId: string, data: UpdateWorkScheduleInput) {
  const [schedule] = await db
    .update(workSchedules)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(workSchedules.id, id), eq(workSchedules.userId, userId)))
    .returning();
  return schedule ?? null;
}

export async function deleteWorkSchedule(id: string, userId: string) {
  const [schedule] = await db
    .update(workSchedules)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(workSchedules.id, id), eq(workSchedules.userId, userId)))
    .returning();
  return schedule ?? null;
}
