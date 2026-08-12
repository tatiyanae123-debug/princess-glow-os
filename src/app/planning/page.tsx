import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { PlanningHub } from '@/components/planning/planning-hub';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getGoalsByUser } from '@/lib/data/goals';
import { getNotesByUser } from '@/lib/data/notes';
import { getRoutinesByUser } from '@/lib/data/routines';

export const dynamic = 'force-dynamic';

export default async function PlanningPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [tasks, events, goals, notes, routines] = await Promise.all([
    getTasksByUser(session.user.id), getCalendarEventsByUser(session.user.id), getGoalsByUser(session.user.id),
    getNotesByUser(session.user.id), getRoutinesByUser(session.user.id),
  ]);
  return (
    <AppShell>
      <PlanningHub tasks={tasks} events={events} goals={goals} notes={notes} routines={routines} />
    </AppShell>
  );
}
