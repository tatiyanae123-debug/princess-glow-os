import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch6InterviewsView } from '@/components/batch6/work-create-reference';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic='force-dynamic';
export default async function InterviewsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [tasks,events,notes]=await Promise.all([getTasksByUser(session.user.id),getCalendarEventsByUser(session.user.id),getNotesByUser(session.user.id)]);
  return <AppShell><Batch6InterviewsView tasks={tasks} events={events} notes={notes}/></AppShell>;
}
