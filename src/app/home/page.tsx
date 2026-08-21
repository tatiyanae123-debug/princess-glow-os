import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { HomeIntelligenceStudio } from '@/components/home/home-intelligence-studio';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getClosetItems } from '@/lib/data/completion-v1';
import { getRoutinesByUser, getStepsByUser } from '@/lib/data/routines';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic='force-dynamic';

export default async function HomePage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 const userId=session.user.id;
 const [allTasks,allEvents,closet,routines,steps,projects]=await Promise.all([
  getTasksByUser(userId),
  getCalendarEventsByUser(userId),
  getClosetItems(userId),
  getRoutinesByUser(userId),
  getStepsByUser(userId),
  getProjectsByUser(userId),
 ]);
 const now=new Date();
 const tasks=allTasks.filter(task=>task.status!=='done'&&task.status!=='cancelled');
 const events=allEvents.filter(event=>event.startAt.getTime()>=now.getTime()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,16);
 return <AppShell><HomeIntelligenceStudio tasks={tasks} events={events} closet={closet} routines={routines} steps={steps} projects={projects} nowIso={now.toISOString()}/></AppShell>;
}
