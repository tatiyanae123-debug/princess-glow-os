import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { Batch10HomeSummaryView } from '@/components/batch10/special-features-reference';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getFitnessSessions } from '@/lib/data/completion-v1';
import { db } from '@/db';
import { focusSessions } from '@/db/schema/adaptive-os';

export const dynamic='force-dynamic';
export default async function HomePage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');const userId=session.user.id;
 const [allTasks,allEvents,fitness,focus]=await Promise.all([
  getTasksByUser(userId),
  getCalendarEventsByUser(userId),
  getFitnessSessions(userId),
  db.select().from(focusSessions).where(eq(focusSessions.userId,userId)).orderBy(desc(focusSessions.startedAt)).limit(64).catch(()=>[]),
 ]);
 const tasks=allTasks.filter(t=>t.status!=='done'&&t.status!=='cancelled').sort((a,b)=>Number(b.priority==='high')-Number(a.priority==='high')).slice(0,8);
 const now=new Date();const events=allEvents.filter(e=>e.startAt.getTime()>=now.getTime()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,8);
 const todayKey=now.toDateString();const focusMinutesToday=focus.filter(x=>x.endedAt&&x.startedAt.toDateString()===todayKey).reduce((sum,x)=>sum+(x.actualMinutes??0),0);
 const sevenDaysAgo=new Date(now);sevenDaysAgo.setDate(now.getDate()-7);const workouts7d=fitness.filter(x=>x.occurredAt>=sevenDaysAgo).length;
 const metrics={openTasks:allTasks.filter(t=>t.status!=='done'&&t.status!=='cancelled').length,upcomingEvents:allEvents.filter(e=>e.startAt.getTime()>=now.getTime()).length,focusMinutesToday,workouts7d};
 return <AppShell><Batch10HomeSummaryView tasks={tasks} events={events} metrics={metrics}/></AppShell>;
}
