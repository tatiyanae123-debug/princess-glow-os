import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { HairSalon } from '@/components/hair/hair-salon';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getNotesByUser } from '@/lib/data/notes';
import { getRoutinesByUser, getStepsByRoutine } from '@/lib/data/routines';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic = 'force-dynamic';

export default async function HairPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const [beauty, events, notes, routines, tasks] = await Promise.all([
    getBeautyRoutinesByUser(userId),
    getCalendarEventsByUser(userId),
    getNotesByUser(userId),
    getRoutinesByUser(userId),
    getTasksByUser(userId),
  ]);
  const withSteps = await Promise.all(routines.map(async (routine) => ({ ...routine, steps: await getStepsByRoutine(routine.id, userId) })));

  return <AppShell><HairSalon beauty={beauty} events={events} notes={notes} routines={withSteps} tasks={tasks} /></AppShell>;
}
