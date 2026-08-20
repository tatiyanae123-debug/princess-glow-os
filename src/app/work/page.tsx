import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AuditedWorkView } from '@/components/batch6/work-audited';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getGoalsByUser } from '@/lib/data/goals';
import { getNotesByUser } from '@/lib/data/notes';

export const dynamic='force-dynamic';
export default async function WorkPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id;
  const [tasks,events,goals,notes]=await Promise.all([getTasksByUser(userId),getCalendarEventsByUser(userId),getGoalsByUser(userId),getNotesByUser(userId)]);
  return <AppShell><AuditedWorkView tasks={tasks} events={events} goals={goals} notes={notes}/></AppShell>;
}
