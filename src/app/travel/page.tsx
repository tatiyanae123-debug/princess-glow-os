import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AuditedTravelView } from '@/components/batch7/home-world-audited';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getTasksByUser } from '@/lib/data/tasks';

export const dynamic='force-dynamic';
export default async function TravelPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const [allEvents,tasks]=await Promise.all([getCalendarEventsByUser(session.user.id),getTasksByUser(session.user.id)]);
 const words=['trip','travel','flight','hotel','vacation','airport','airbnb','boarding'];
 const events=allEvents.filter(e=>e.startAt.getTime()>=Date.now()&&words.some(w=>`${e.title} ${e.location??''} ${e.description??''}`.toLowerCase().includes(w))).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
 return <AppShell><AuditedTravelView events={events} tasks={tasks}/></AppShell>;
}
