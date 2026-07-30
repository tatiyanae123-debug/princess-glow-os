import { db } from '@/db';
import { beautyRoutines } from '@/db/schema/beauty-routines';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateBeautyRoutineInput, UpdateBeautyRoutineInput } from '@/lib/validations/beauty-routines';

export async function getBeautyRoutinesByUser(userId: string) {
  return db
    .select()
    .from(beautyRoutines)
    .where(and(eq(beautyRoutines.userId, userId), eq(beautyRoutines.archived, false)))
    .orderBy(desc(beautyRoutines.stepOrder));
}

export async function getBeautyRoutineById(id: string, userId: string) {
  const [routine] = await db
    .select()
    .from(beautyRoutines)
    .where(and(eq(beautyRoutines.id, id), eq(beautyRoutines.userId, userId)));
  return routine ?? null;
}

export async function createBeautyRoutine(userId: string, data: CreateBeautyRoutineInput) {
  const [routine] = await db
    .insert(beautyRoutines)
    .values({ ...data, userId })
    .returning();
  return routine;
}

export async function updateBeautyRoutine(id: string, userId: string, data: UpdateBeautyRoutineInput) {
  const [routine] = await db
    .update(beautyRoutines)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(beautyRoutines.id, id), eq(beautyRoutines.userId, userId)))
    .returning();
  return routine ?? null;
}

export async function deleteBeautyRoutine(id: string, userId: string) {
  const [routine] = await db
    .update(beautyRoutines)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(beautyRoutines.id, id), eq(beautyRoutines.userId, userId)))
    .returning();
  return routine ?? null;
}
