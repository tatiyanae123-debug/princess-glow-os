import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { BeautyRoutineManager } from '@/components/beauty/beauty-routine-manager';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic = 'force-dynamic';

export default async function BeautyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const [routines, events, tasks] = await Promise.all([
    getBeautyRoutinesByUser(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getTasksByUser(session.user.id),
  ]);

  return (
    <AppShell><BeautyRoutineManager initialRoutines={routines} events={events} tasks={tasks} /></AppShell>
  );
}
