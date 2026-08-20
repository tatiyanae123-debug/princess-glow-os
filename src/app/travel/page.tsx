import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Batch7TravelView } from '@/components/batch7/home-world-reference';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic='force-dynamic';
export default async function TravelPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');
 const all=await getCalendarEventsByUser(session.user.id);const words=['trip','travel','flight','hotel','vacation','rome','italy','airport','airbnb'];
 const events=all.filter(e=>e.startAt.getTime()>=Date.now()&&words.some(w=>`${e.title} ${e.location??''} ${e.description??''}`.toLowerCase().includes(w))).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
 return <AppShell><Batch7TravelView events={events}/></AppShell>;
}
