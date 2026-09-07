import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PlanRoutinesRoom, type PlanRoutineItem } from '@/components/plan/plan-reference-rooms';
import { getRoutinesByUser, getStepsByRoutine } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const routines = await getRoutinesByUser(userId);
  const stepsByRoutine = await Promise.all(routines.map((routine) => getStepsByRoutine(routine.id, userId)));
  const items: PlanRoutineItem[] = routines.map((routine, index) => ({
    id: routine.id,
    name: routine.name,
    description: routine.description,
    timeOfDay: routine.timeOfDay,
    steps: stepsByRoutine[index].map((step) => ({
      id: step.id,
      title: step.title,
      notes: step.notes,
      durationMinutes: step.durationMinutes,
      order: step.order,
    })),
  }));
  return <PlanRoutinesRoom routines={items} />;
}
