import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { BeautyLab } from '@/components/beauty-lab/beauty-lab';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getNotesByUser } from '@/lib/data/notes';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic = 'force-dynamic';

export default async function BeautyLabPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [routines, events, notes, tasks] = await Promise.all([
    getBeautyRoutinesByUser(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getNotesByUser(session.user.id),
    getTasksByUser(session.user.id),
  ]);
  return <AppShell><BeautyLab routines={routines} events={events} notes={notes} tasks={tasks} /></AppShell>;
}
