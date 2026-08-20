import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AuditedInterviewsView } from '@/components/batch6/work-audited';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic='force-dynamic';
export default async function InterviewsPage({searchParams}:{searchParams:Promise<{view?:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [tasks,events,notes,params]=await Promise.all([getTasksByUser(session.user.id),getCalendarEventsByUser(session.user.id),getNotesByUser(session.user.id),searchParams]);
  return <AppShell><AuditedInterviewsView tasks={tasks} events={events} notes={notes} view={params.view}/></AppShell>;
}
