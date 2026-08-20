import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { RoutinesRouteExperience } from '@/components/routines/routines-route-experience';
import { getRoutinesByUser, getStepsByUser } from '@/lib/data/routines';
import { getRoutineEngineState } from '@/lib/data/advanced-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getTasksByUser } from '@/lib/data/tasks';
import { getHabitsByUser } from '@/lib/data/habits';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';

export const dynamic = 'force-dynamic';

export default async function RoutinesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  await ensurePersonalOsInstalled(session.user.id);
  const [routines, steps, engine, calendarEvents, tasks, habits] = await Promise.all([
    getRoutinesByUser(session.user.id),
    getStepsByUser(session.user.id),
    getRoutineEngineState(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getTasksByUser(session.user.id),
    getHabitsByUser(session.user.id),
  ]);

  return (
    <AppShell>
      <RoutinesRouteExperience
        initialRoutines={routines}
        initialSteps={steps}
        initialEngine={engine}
        calendarEvents={calendarEvents}
        tasks={tasks}
        habits={habits}
      />
    </AppShell>
  );
}
