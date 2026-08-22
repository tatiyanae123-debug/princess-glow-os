import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { habits } from '@/db/schema/habits';
import { routines, routineSteps } from '@/db/schema/routines';
import { PERSONAL_OS_SOURCE_VERSION, personalHabits, personalRoutines } from './source-of-truth';
import { STUDY_HOTTER_SOURCE_VERSION, studyHotterHabits, studyHotterRoutines } from './study-yourself-hotter-source';

const SOURCE = 'Glow OS personal source of truth';
const STUDY_SOURCE = 'Glow OS Study Yourself Hotter source pack';

type RoutineDefinition = (typeof personalRoutines)[number] | (typeof studyHotterRoutines)[number];
type HabitDefinition = (typeof personalHabits)[number] | (typeof studyHotterHabits)[number];

async function installRoutines(userId: string, definitions: readonly RoutineDefinition[], sourceVersion: string, source: string) {
  for (const definition of definitions) {
    const [existing] = await db
      .select({ id: routines.id })
      .from(routines)
      .where(and(eq(routines.userId, userId), eq(routines.sourceVersion, sourceVersion), eq(routines.name, definition.name)))
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
          source,
          sourceVersion,
          importBatchId: sourceVersion,
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
}

async function installHabits(userId: string, definitions: readonly HabitDefinition[], sourceVersion: string, source: string) {
  for (const definition of definitions) {
    const [existing] = await db
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.sourceVersion, sourceVersion), eq(habits.name, definition.name)))
      .limit(1);
    if (existing) continue;

    await db.insert(habits).values({
      userId,
      name: definition.name,
      description: definition.description,
      frequency: 'daily',
      color: '#B86F7D',
      icon: definition.icon,
      source,
      sourceVersion,
      importBatchId: sourceVersion,
      editable: true,
    });
  }
}

export async function ensurePersonalOsInstalled(userId: string) {
  await installRoutines(userId, personalRoutines, PERSONAL_OS_SOURCE_VERSION, SOURCE);
  await installHabits(userId, personalHabits, PERSONAL_OS_SOURCE_VERSION, SOURCE);
  await installRoutines(userId, studyHotterRoutines, STUDY_HOTTER_SOURCE_VERSION, STUDY_SOURCE);
  await installHabits(userId, studyHotterHabits, STUDY_HOTTER_SOURCE_VERSION, STUDY_SOURCE);

  return {
    sourceVersion: PERSONAL_OS_SOURCE_VERSION,
    studySourceVersion: STUDY_HOTTER_SOURCE_VERSION,
    routines: personalRoutines.length + studyHotterRoutines.length,
    habits: personalHabits.length + studyHotterHabits.length,
  };
}
