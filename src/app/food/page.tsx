import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { FoodIntelligenceLive } from '@/components/food/food-intelligence-live';
import { getFoodIntelligenceState } from '@/lib/data/food-intelligence';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic='force-dynamic';

export default async function FoodPage(){
 const session=await auth();if(!session?.user?.id)redirect('/sign-in');const userId=session.user.id;
 const [state,finance,events]=await Promise.all([getFoodIntelligenceState(userId),getFinanceEntriesByUser(userId),getCalendarEventsByUser(userId)]);
 const now=new Date();const monthEntries=finance.filter(entry=>{const date=new Date(`${entry.entryDate}T12:00:00`);return entry.category==='food'&&entry.type==='expense'&&date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth()});
 const foodSpendCents=Math.round(monthEntries.reduce((sum,entry)=>sum+Number(entry.amount),0)*100);
 const nextEvent=events.filter(e=>e.startAt.getTime()>now.getTime()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime())[0]??null;
 const serialized=JSON.parse(JSON.stringify(state));
 return <AppShell><FoodIntelligenceLive initial={serialized} nextEvent={nextEvent?{id:nextEvent.id,title:nextEvent.title,startAt:nextEvent.startAt.toISOString()}:null} foodSpendCents={foodSpendCents} foodPurchaseCount={monthEntries.length}/></AppShell>
}
