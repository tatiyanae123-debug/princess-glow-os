import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PlanRoutinesRoom, type PlanRoutineItem } from '@/components/plan/plan-reference-rooms';
import { getRoutinesByUser, getStepsByRoutine } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function PlanningRoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const routines = await getRoutinesByUser(userId);
  const visible = routines.slice(0, 12);
  const stepsByRoutine = await Promise.all(
    visible.map(async (routine) => ({
      routine,
      steps: await getStepsByRoutine(routine.id, userId),
    })),
  );

  const items: PlanRoutineItem[] = stepsByRoutine.map(({ routine, steps }) => ({
    id: routine.id,
    name: routine.name,
    description: routine.description ?? null,
    timeOfDay: routine.timeOfDay ?? 'anytime',
    steps: steps.map((step) => ({
      id: step.id,
      title: step.title,
      notes: step.notes ?? null,
      durationMinutes: step.durationMinutes ?? null,
      order: step.order,
    })),
  }));

  return <PlanRoutinesRoom routines={items} />;
}
