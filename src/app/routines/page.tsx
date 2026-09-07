import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PlanRoutinesV2, type PlanRoutineV2, type PlanSettingSnapshot } from '@/components/plan/plan-reference-v2';
import { getRoutinesByUser, getStepsByRoutine } from '@/lib/data/routines';
import { getPlanObjectSettingsByPrefix } from '@/lib/plan/object-settings';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const [routines, settingsMap] = await Promise.all([
    getRoutinesByUser(userId),
    getPlanObjectSettingsByPrefix(userId, 'plan:routine:'),
  ]);
  const stepsByRoutine = await Promise.all(routines.map((routine) => getStepsByRoutine(routine.id, userId)));
  const items: PlanRoutineV2[] = routines.map((routine, index) => ({
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
  const settings: PlanSettingSnapshot = Object.fromEntries(Array.from(settingsMap.entries()).map(([key, row]) => [key, row.preferences]));
  return <PlanRoutinesV2 routines={items} settings={settings} />;
}
