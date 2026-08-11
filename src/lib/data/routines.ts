import { db } from '@/db';
import { routines, routineSteps } from '@/db/schema/routines';
import { eq, and, desc, asc } from 'drizzle-orm';
import type { CreateRoutineInput, UpdateRoutineInput, CreateRoutineStepInput, UpdateRoutineStepInput } from '@/lib/validations/routines';

export async function getRoutinesByUser(userId: string) {
  try {
    return await db
      .select()
      .from(routines)
      .where(and(eq(routines.userId, userId), eq(routines.archived, false)))
      .orderBy(desc(routines.createdAt));
  } catch (error) {
    console.error('[Glow OS] routines unavailable', error);
    return [];
  }
}

export async function getRoutineById(id: string, userId: string) {
  try {
    const [routine] = await db
      .select()
      .from(routines)
      .where(and(eq(routines.id, id), eq(routines.userId, userId)));
    return routine ?? null;
  } catch (error) {
    console.error('[Glow OS] routine unavailable', error);
    return null;
  }
}

export async function createRoutine(userId: string, data: CreateRoutineInput) {
  const [routine] = await db
    .insert(routines)
    .values({ ...data, userId })
    .returning();
  return routine;
}

export async function updateRoutine(id: string, userId: string, data: UpdateRoutineInput) {
  const [routine] = await db
    .update(routines)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(routines.id, id), eq(routines.userId, userId)))
    .returning();
  return routine ?? null;
}

export async function deleteRoutine(id: string, userId: string) {
  const [routine] = await db
    .update(routines)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(routines.id, id), eq(routines.userId, userId)))
    .returning();
  return routine ?? null;
}

export async function getStepsByRoutine(routineId: string, userId: string) {
  try {
    return await db
      .select()
      .from(routineSteps)
      .where(and(eq(routineSteps.routineId, routineId), eq(routineSteps.userId, userId)))
      .orderBy(asc(routineSteps.order));
  } catch (error) {
    console.error('[Glow OS] routine steps unavailable', error);
    return [];
  }
}

export async function createRoutineStep(userId: string, data: CreateRoutineStepInput) {
  const [step] = await db
    .insert(routineSteps)
    .values({ ...data, userId })
    .returning();
  return step;
}

export async function updateRoutineStep(id: string, userId: string, data: UpdateRoutineStepInput) {
  const [step] = await db
    .update(routineSteps)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(routineSteps.id, id), eq(routineSteps.userId, userId)))
    .returning();
  return step ?? null;
}

export async function deleteRoutineStep(id: string, userId: string) {
  const [step] = await db
    .delete(routineSteps)
    .where(and(eq(routineSteps.id, id), eq(routineSteps.userId, userId)))
    .returning();
  return step ?? null;
}
