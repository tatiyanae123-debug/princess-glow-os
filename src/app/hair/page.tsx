import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { HairExperience } from '@/components/hair/hair-experience';
import { getHairLogs, getTimelineEvents } from '@/lib/data/completion-v1';
import { getRoutinesByUser, getStepsByUser } from '@/lib/data/routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getGoalsByUser } from '@/lib/data/goals';

export const dynamic = 'force-dynamic';

export default async function HairPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const [logs, timeline, routines, routineSteps, events, goals] = await Promise.all([
    getHairLogs(userId),
    getTimelineEvents(userId),
    getRoutinesByUser(userId),
    getStepsByUser(userId),
    getCalendarEventsByUser(userId),
    getGoalsByUser(userId),
  ]);

  return (
    <AppShell>
      <HairExperience logs={logs} timeline={timeline} routines={routines} routineSteps={routineSteps} events={events} goals={goals} />
    </AppShell>
  );
}
