import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CalendarRouteExperience } from '@/components/calendar/calendar-route-experience';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getTasksByUser } from '@/lib/data/tasks';
import { getLifeModes } from '@/lib/intelligence/adaptive-os';

export const dynamic = 'force-dynamic';

export default async function CalendarPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id;
  const [events,tasks,modes]=await Promise.all([getCalendarEventsByUser(userId),getTasksByUser(userId),getLifeModes(userId)]);
  const openTasks=tasks.filter(task=>task.status!=='done'&&task.status!=='cancelled');
  const activeMode=modes.find(mode=>mode.isActive);
  return <AppShell><div className="batch1-calendar-reference"><CalendarRouteExperience initialEvents={events} tasks={openTasks.map(task=>({id:task.id,title:task.title,priority:task.priority,dueDate:task.dueDate}))} modeName={activeMode?.name??'Normal'}/></div></AppShell>
}
