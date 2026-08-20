import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { habits } from '@/db/schema/habits';
import { routines, routineSteps } from '@/db/schema/routines';
import { PERSONAL_OS_SOURCE_VERSION, personalHabits, personalRoutines } from './source-of-truth';

const SOURCE = 'Glow OS personal source of truth';

export async function ensurePersonalOsInstalled(userId: string) {
  const batchId = PERSONAL_OS_SOURCE_VERSION;

  for (const definition of personalRoutines) {
    const [existing] = await db
      .select({ id: routines.id })
      .from(routines)
      .where(and(eq(routines.userId, userId), eq(routines.sourceVersion, PERSONAL_OS_SOURCE_VERSION), eq(routines.name, definition.name)))
      .limit(1);

    let routineId = existing?.id;
    if (!routineId) {
      const [created] = await db
        .insert(routines)
        .values({
          userId,
          name: definition.name,
          description: definition.description,
          timeOfDay: definition.timeOfDay,
          daysOfWeek: definition.daysOfWeek,
          source: SOURCE,
          sourceVersion: PERSONAL_OS_SOURCE_VERSION,
          importBatchId: batchId,
          editable: true,
        })
        .returning({ id: routines.id });
      routineId = created?.id;
    }

    if (!routineId) continue;
    const existingSteps = await db
      .select({ title: routineSteps.title })
      .from(routineSteps)
      .where(and(eq(routineSteps.userId, userId), eq(routineSteps.routineId, routineId)));
    const titles = new Set(existingSteps.map((step) => step.title));
    const missing = definition.steps
      .map((step, order) => ({ ...step, order }))
      .filter((step) => !titles.has(step.title));
    if (missing.length) {
      await db.insert(routineSteps).values(
        missing.map((step) => ({
          userId,
          routineId: routineId!,
          title: step.title,
          notes: step.notes,
          order: step.order,
          durationMinutes: step.durationMinutes,
        })),
      );
    }
  }

  for (const definition of personalHabits) {
    const [existing] = await db
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.sourceVersion, PERSONAL_OS_SOURCE_VERSION), eq(habits.name, definition.name)))
      .limit(1);
    if (existing) continue;
    await db.insert(habits).values({
      userId,
      name: definition.name,
      description: definition.description,
      frequency: 'daily',
      color: '#B86F7D',
      icon: definition.icon,
      source: SOURCE,
      sourceVersion: PERSONAL_OS_SOURCE_VERSION,
      importBatchId: batchId,
      editable: true,
    });
  }

  return { sourceVersion: PERSONAL_OS_SOURCE_VERSION, routines: personalRoutines.length, habits: personalHabits.length };
}
