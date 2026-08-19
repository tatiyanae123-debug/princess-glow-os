import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { generateExpandedBriefingAction, type BriefingKind } from '@/app/actions/briefings';
import { getBriefings } from '@/lib/data/completion-v1';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { CalendarDays, CheckCircle2, Clock3, MoonStar, Sparkles, Sun, Utensils } from 'lucide-react';

export const dynamic='force-dynamic';

const options:[string,BriefingKind|'evening'][]=[
  ['Morning Brief','morning'],
  ['Evening Debrief','evening'],
  ['Weekly Debrief','weekly'],
  ['Monthly Debrief','monthly'],
  ['Quarter Review','quarterly'],
  ['Year Review','year'],
];

const heroImage='https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85';

export default async function BriefingsPage(){
  const s=await auth();
  if(!s?.user?.id)redirect('/sign-in');
  const id=s.user.id;
  const [all,tasks,events,wellnessEntries]=await Promise.all([
    getBriefings(id),
    getTasksByUser(id),
    getCalendarEventsByUser(id),
    getWellnessEntriesByUser(id),
  ]);
  const latest=all[0];
  const now=new Date();
  const todayKey=now.toISOString().slice(0,10);
  const todayEvents=events.filter((event)=>event.startAt.toISOString().slice(0,10)===todayKey).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  const openTasks=tasks.filter((task)=>task.status!=='done').slice(0,3);
  const priority=openTasks[0]??null;
  const nextEvent=todayEvents.find((event)=>event.startAt.getTime()>=now.getTime())??todayEvents[0]??null;
  const wellness=wellnessEntries[0]??null;
  const firstName=s.user.name?.split(' ')[0]??'Tatiyana';
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  return <AppShell><div className="batch1-morning-reference space-y-4">
    <section className="batch1-brief-hero relative min-h-[210px] overflow-hidden rounded-[22px] border border-[#eee7e3] bg-[#f8f2ef]">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`linear-gradient(90deg,rgba(255,255,255,.96) 0%,rgba(255,255,255,.80) 38%,rgba(255,255,255,.10) 70%),url(${heroImage})`}}/>
      <div className="relative z-10 max-w-[530px] p-7 sm:p-9">
        <p className="text-[9px] font-semibold uppercase tracking-[.14em] text-[#bc6d79]">2. Morning Brief</p>
        <h1 className="glow-display mt-2 text-[42px] leading-none tracking-[-.03em] text-[#241f1c] sm:text-[50px]">Morning Brief</h1>
        <p className="mt-3 text-[11px] font-medium text-[#b65f70]">{dateLabel}</p>
        <p className="mt-2 text-[12px] text-[#625b56]">Start your day with clarity and intention.</p>
      </div>
      <div className="absolute right-5 top-5 z-10 flex gap-2">
        <Link href="#history" className="rounded-full border border-white/80 bg-white/85 px-3 py-2 text-[10px] text-[#6f6660] shadow-sm">Share view</Link>
        <form action={generateExpandedBriefingAction.bind(null,'morning')}><button className="rounded-[7px] bg-[#a94761] px-4 py-2 text-[10px] font-medium text-white shadow-sm">Refresh Brief</button></form>
      </div>
    </section>

    <Card className="batch1-your-day overflow-hidden p-0">
      <div className="px-5 pt-5"><h2 className="glow-display text-[19px]">Your Day</h2><p className="mt-1 text-[10px] text-[#918782]">You have {todayEvents.length} event{todayEvents.length===1?'':'s'} and {openTasks.length} priority task{openTasks.length===1?'':'s'}.</p></div>
      <div className="relative mx-5 my-4 h-[38px] border-y border-[#efe5e2] bg-[linear-gradient(90deg,#fff_0%,#fff_10%,#f9e4e7_10%,#f9e4e7_34%,#f3dde3_34%,#f3dde3_60%,#edd8dc_60%,#edd8dc_82%,#fff_82%)]">
        <span className="absolute left-[10%] top-[-15px] text-[8px] text-[#81766f]">9 AM</span><span className="absolute left-[34%] top-[-15px] text-[8px] text-[#81766f]">12 PM</span><span className="absolute left-[60%] top-[-15px] text-[8px] text-[#81766f]">3 PM</span><span className="absolute left-[82%] top-[-15px] text-[8px] text-[#81766f]">6 PM</span>
      </div>
    </Card>

    <div className="grid gap-3 lg:grid-cols-3">
      <Card className="p-4"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#8f837c]">Top Priority</p><h3 className="glow-display mt-3 text-[19px] leading-tight">{priority?.title??'Choose your top priority'}</h3><Link href={priority?`/tasks?taskId=${encodeURIComponent(priority.id)}&view=all`:'/tasks'} className="mt-5 inline-flex items-center gap-1 rounded-[6px] border border-[#f0d8dc] px-3 py-2 text-[9px] text-[#b45d70]">Go to Task →</Link></Card>
      <Card className="p-4"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#8f837c]">Where You Need to Be</p><h3 className="glow-display mt-3 text-[19px] leading-tight">{nextEvent?.title??'No fixed appointment'}</h3><p className="mt-1 text-[10px] text-[#8f837c]">{nextEvent?nextEvent.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'Your calendar is open'}</p><Link href={nextEvent?`/calendar?eventId=${encodeURIComponent(nextEvent.id)}&view=day`:'/calendar?view=day'} className="mt-5 inline-flex items-center gap-1 rounded-[6px] border border-[#f0d8dc] px-3 py-2 text-[9px] text-[#b45d70]">Plan Around It →</Link></Card>
      <Card className="p-4"><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#8f837c]">Body + Energy</p><h3 className="glow-display mt-3 text-[19px] leading-tight">{wellness?.energy!=null?`Energy is ${wellness.energy}/10 today.`:'Log your energy to personalize today.'}</h3><Link href="/wellness" className="mt-5 inline-flex items-center gap-1 rounded-[6px] border border-[#f0d8dc] px-3 py-2 text-[9px] text-[#b45d70]">View Wellness →</Link></Card>
    </div>

    <Card className="p-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Utensils size={14} className="text-[#b56a75]"/><h2 className="glow-display text-[18px]">Meals</h2></div><Link href="/food" className="text-[9px] text-[#b45d70]">Open Food & Nutrition →</Link></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{['Breakfast','Lunch','Dinner'].map((meal)=><div key={meal} className="rounded-[12px] bg-[#fdf8f6] p-3"><p className="text-[8px] uppercase tracking-[.12em] text-[#a0958e]">{meal}</p><p className="mt-2 text-[11px] text-[#4a433f]">Open your real meal plan</p></div>)}</div></Card>

    <div className="grid gap-3 lg:grid-cols-[1.15fr_.85fr]">
      <Card className="p-4"><div className="flex items-center justify-between"><h2 className="glow-display text-[18px]">What Needs Attention</h2><Link href="/tasks" className="text-[9px] text-[#b45d70]">View all →</Link></div><div className="mt-4 space-y-2">{openTasks.length?openTasks.map(task=><Link key={task.id} href={`/tasks?taskId=${encodeURIComponent(task.id)}&view=all`} className="flex items-center gap-2 rounded-[8px] px-2 py-2 text-[10px] hover:bg-[#fdf4f3]"><CheckCircle2 size={13} className="text-[#c66c7b]"/><span>{task.title}</span></Link>):<p className="text-[10px] text-[#958a83]">Nothing urgent is waiting.</p>}</div></Card>
      <Card className="relative overflow-hidden bg-[linear-gradient(135deg,#fff_0%,#f9e7e7_100%)] p-5"><Sparkles size={15} className="text-[#bd6976]"/><h2 className="glow-display mt-3 text-[19px]">Glow&apos;s Advice</h2><p className="glow-display mt-4 text-[18px] italic leading-7 text-[#514844]">{latest?'Use the clarity already captured in your latest brief.':'Protect the part of the morning that matters most.'}</p><p className="mt-5 text-[10px] text-[#877b74]">Good morning, {firstName}.</p></Card>
    </div>

    <section id="history" className="grid gap-3 md:grid-cols-3">{all.slice(0,3).map(b=><Link href={b.kind==='evening'?'/briefings/evening':'/briefings'} key={b.id} className="rounded-[14px] border border-[#eee6e2] bg-white p-4 transition hover:-translate-y-px hover:shadow-sm"><div className="flex items-center gap-2">{b.kind==='evening'?<MoonStar size={13}/>:<Sun size={13}/>}<p className="text-[10px] capitalize">{b.kind.replaceAll('_',' ')}</p></div><p className="mt-2 text-[9px] text-[#968b84]">{b.generatedAt.toLocaleDateString()}</p></Link>)}</section>
  </div></AppShell>;
}
