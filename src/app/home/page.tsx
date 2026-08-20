import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch10HomeSummaryView } from '@/components/batch10/special-features-reference';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic='force-dynamic';
export default async function HomePage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const [allTasks,allEvents]=await Promise.all([getTasksByUser(session.user.id),getCalendarEventsByUser(session.user.id)]);
 const tasks=allTasks.filter(t=>t.status!=='done'&&t.status!=='cancelled').sort((a,b)=>Number(b.priority==='high')-Number(a.priority==='high')).slice(0,8);
 const now=Date.now();const events=allEvents.filter(e=>e.startAt.getTime()>=now).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,8);
 return <AppShell><Batch10HomeSummaryView tasks={tasks} events={events}/></AppShell>;
}
