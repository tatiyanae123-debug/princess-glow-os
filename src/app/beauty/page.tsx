import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { BeautyIntelligenceHub } from '@/components/beauty/beauty-intelligence-hub';
import { BeautySupportPanels } from '@/components/beauty/beauty-support-panels';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { getBeautyIntelligenceState } from '@/lib/data/advanced-beauty';

export const dynamic='force-dynamic';
const beautyKeywords=['beauty','facial','skin','skincare','brow','brows','lash','lashes','nail','nails','manicure','pedicure','wax','laser','derm','dermatology','esthetic','spa','makeup','hair','shower','fragrance','gua sha'];
function isBeautyEvent(title:string,description:string|null){const haystack=`${title} ${description??''}`.toLowerCase();return beautyKeywords.some(keyword=>haystack.includes(keyword))}

export default async function BeautyPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id;
  const [routines,events,products,intelligence]=await Promise.all([
    getBeautyRoutinesByUser(userId),
    getCalendarEventsByUser(userId),
    getBeautyProducts(userId),
    getBeautyIntelligenceState(userId),
  ]);
  const now=new Date();
  const upcomingAppointments=events.filter(event=>event.startAt.getTime()>=now.getTime()&&isBeautyEvent(event.title,event.description)).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,5);
  return <AppShell>
    <BeautyIntelligenceHub routines={routines} products={products} upcomingAppointments={upcomingAppointments} intelligence={intelligence}/>
    <div className="mx-auto mt-5 max-w-[1480px]">
      <Link href="/beauty/study-yourself-hotter" className="group block overflow-hidden rounded-[30px] border border-[#eadfdb] bg-[radial-gradient(circle_at_15%_20%,rgba(255,232,239,.9),transparent_34%),radial-gradient(circle_at_85%_0%,rgba(239,232,249,.85),transparent_34%),linear-gradient(135deg,#fffdfb,#f8f2f1)] p-5 shadow-[0_22px_70px_rgba(68,42,35,.07)] transition hover:-translate-y-0.5 sm:p-6">
        <p className="text-[9px] uppercase tracking-[.22em] text-[#a66e7b]">New Beauty Intelligence Room</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4"><div><h2 className="font-serif text-3xl text-[#2f2929]">Study Yourself Hotter</h2><p className="mt-2 max-w-2xl text-[11px] leading-5 text-[#7d716d]">Observe, compare, test and build a personal playbook from what actually works for you.</p></div><span className="rounded-full bg-[#332c2c] px-4 py-2 text-[10px] text-white transition group-hover:px-5">Open study →</span></div>
      </Link>
    </div>
    <BeautySupportPanels stepLogs={intelligence.stepLogs} readiness={intelligence.readiness}/>
  </AppShell>;
}
