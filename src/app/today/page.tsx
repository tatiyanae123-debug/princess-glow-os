import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, CalendarClock, CheckCircle2, Clock3, Droplets, MoonStar, Sparkles, Target, Zap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { getTasksByUser } from '@/lib/data/tasks';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { buildCrossSystemSnapshot } from '@/lib/intelligence/cross-system';

export const dynamic = 'force-dynamic';

const priorityWeight: Record<string,number>={urgent:100,high:80,medium:55,low:30};

export default async function TodayPage() {
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const userId=session.user.id;
  const now=new Date();
  const [tasks,wellnessEntries,beautyRoutines,events,snapshot]=await Promise.all([
    getTasksByUser(userId),getWellnessEntriesByUser(userId),getBeautyRoutinesByUser(userId),getCalendarEventsByUser(userId),buildCrossSystemSnapshot(userId,'today',now),
  ]);
  const open=tasks.filter(t=>t.status!=='done'&&t.status!=='cancelled');
  const scored=[...open].sort((a,b)=>{
    const aDue=a.dueDate?Math.max(-40,30-Math.floor((a.dueDate.getTime()-now.getTime())/86400000)*5):0;
    const bDue=b.dueDate?Math.max(-40,30-Math.floor((b.dueDate.getTime()-now.getTime())/86400000)*5):0;
    return (priorityWeight[b.priority]??0)+bDue-((priorityWeight[a.priority]??0)+aDue);
  });
  const primary=scored[0]??null;
  const next=scored[1]??null;
  const later=scored.slice(2,5);
  const nextEvent=events.filter(e=>e.startAt>=now).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime())[0]??null;
  const availableMinutes=nextEvent?Math.max(0,Math.floor((nextEvent.startAt.getTime()-now.getTime())/60000)-15):null;
  const latestWellness=wellnessEntries[0]??null;
  const beauty=beautyRoutines.filter(r=>r.timeOfDay==='evening'||r.timeOfDay==='night').slice(0,3);
  const todaysEvents=events.filter(e=>e.startAt.toDateString()===now.toDateString()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());

  return <AppShell><div className="mx-auto max-w-[1460px] space-y-4">
    <header className="rounded-[22px] border border-[#e5d8d0] bg-[linear-gradient(120deg,#f8ece8,#fffaf6_55%,#eee6d8)] p-6 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[8px] font-bold uppercase tracking-[.22em] text-[#a66a74]">TODAY · OPERATIONAL MODE</p><h1 className="glow-display mt-2 text-[36px] leading-none text-[#372c28] sm:text-[48px]">Only show me what matters now.</h1><p className="mt-3 max-w-2xl text-[11px] leading-5 text-[#78665f]">Glow combines tasks, calendar, wellness and routines so you can act without deciding where to look first.</p></div><div className="rounded-[16px] border border-white/70 bg-white/55 px-4 py-3"><p className="text-[7px] uppercase tracking-[.16em] text-[#9a837b]">Available block</p><p className="glow-display mt-1 text-[24px] text-[#3d312d]">{availableMinutes==null?'Open':`${availableMinutes} min`}</p><p className="mt-1 text-[8px] text-[#8c7770]">{nextEvent?`before ${nextEvent.title}`:'no upcoming constraint'}</p></div></div>
    </header>

    <div className="grid gap-4 xl:grid-cols-[1.5fr_.9fr]">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-[22px] border border-[#e2d3ca] bg-[#2f2522] text-white shadow-[0_20px_50px_rgba(55,41,35,.12)]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-2"><Zap size={15} className="text-[#edc3c8]"/><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/70">NOW</p></div><span className="text-[8px] text-white/45">highest-value next action</span></div>
          <div className="p-6 sm:p-8">{primary?<><p className="glow-display max-w-3xl text-[32px] leading-[1.05] sm:text-[40px]">{primary.title}</p><p className="mt-3 max-w-2xl text-[10px] leading-5 text-white/60">{primary.description||`Priority: ${primary.priority}. Glow ranked this above ${Math.max(0,open.length-1)} other open item${open.length-1===1?'':'s'} using urgency and due-date pressure.`}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[8px] uppercase tracking-[.12em]">{primary.priority}</span>{primary.dueDate?<span className="rounded-full bg-white/10 px-3 py-1.5 text-[8px]">Due {primary.dueDate.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>:null}</div><div className="mt-6 flex flex-wrap gap-2"><Link href="/tasks" className="rounded-[9px] bg-[#f3d8da] px-4 py-2.5 text-[9px] font-medium text-[#44302f]">Start / Open Task</Link><Link href="/brain" className="rounded-[9px] border border-white/20 px-4 py-2.5 text-[9px] text-white/80">Ask Glow why</Link></div></>:<div className="py-8 text-center"><CheckCircle2 className="mx-auto text-[#b6d3b8]" size={32}/><p className="glow-display mt-3 text-[23px]">Nothing urgent needs you.</p><p className="mt-2 text-[9px] text-white/55">Use the space intentionally or add something new.</p></div>}</div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="editorial-surface overflow-hidden"><div className="flex items-center gap-2 border-b border-[#eadfd6] px-4 py-3"><Target size={13} className="text-[#b36d78]"/><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">NEXT</p></div><div className="p-4">{next?<><p className="glow-display text-[20px] text-[#3f342f]">{next.title}</p><p className="mt-2 text-[9px] text-[#89756e]">Keep this visible, but do not let it compete with NOW.</p><Link href="/tasks" className="mt-4 inline-flex items-center gap-1 text-[8px] text-[#a15f69]">Open task <ArrowRight size={9}/></Link></>:<p className="text-[9px] text-[#8d7972]">No second priority needs attention.</p>}</div></section>
          <section className="editorial-surface overflow-hidden"><div className="flex items-center gap-2 border-b border-[#eadfd6] px-4 py-3"><CalendarClock size={13} className="text-[#7c93aa]"/><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">NEXT COMMITMENT</p></div><div className="p-4">{nextEvent?<><p className="glow-display text-[20px] text-[#3f342f]">{nextEvent.title}</p><p className="mt-2 text-[9px] text-[#89756e]">{nextEvent.allDay?'All day':nextEvent.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p><Link href="/calendar" className="mt-4 inline-flex items-center gap-1 text-[8px] text-[#a15f69]">Open calendar <ArrowRight size={9}/></Link></>:<p className="text-[9px] text-[#8d7972]">Your schedule is open.</p>}</div></section>
        </div>

        <section className="editorial-surface overflow-hidden"><div className="flex items-center justify-between border-b border-[#eadfd6] px-4 py-3"><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">TODAY FLOW</p><Link href="/calendar" className="text-[8px] text-[#a15f69]">Full calendar</Link></div><div className="grid gap-px bg-[#eadfd6] sm:grid-cols-2 lg:grid-cols-3">{todaysEvents.length?todaysEvents.map(event=><div key={event.id} className="bg-[#fffaf6] p-4"><p className="text-[8px] text-[#9a837b]">{event.allDay?'All day':event.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p><p className="glow-display mt-1 text-[15px] text-[#433732]">{event.title}</p><p className="mt-1 text-[8px] text-[#8e7770]">{event.location||event.source}</p></div>):<div className="bg-[#fffaf6] p-5 text-[9px] text-[#8e7770]">No fixed calendar events today.</div>}</div></section>
      </div>

      <aside className="space-y-4">
        <section className="editorial-surface overflow-hidden"><div className="flex items-center gap-2 border-b border-[#eadfd6] px-4 py-3"><Sparkles size={13} className="text-[#aa7780]"/><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">GLOW NOTICE</p></div><div className="p-4"><p className="glow-display text-[18px] leading-6 text-[#433631]">{snapshot.message}</p><p className="mt-2 text-[8px] leading-4 text-[#8e7770]">This is generated from live cross-system context, not a decorative message.</p><Link href="/observations" className="mt-4 inline-flex items-center gap-1 text-[8px] text-[#a15f69]">See what Glow noticed <ArrowRight size={9}/></Link></div></section>

        <section className="editorial-surface p-4"><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">LIFE SNAPSHOT</p><div className="mt-3 grid grid-cols-2 gap-2">{[[`${snapshot.openTasks}`,'Open tasks'],[`${snapshot.habitPercent}%`,'Habits'],[`${snapshot.eventsToday}`,'Events'],[latestWellness?.energy?String(latestWellness.energy):'–','Energy']].map(([value,label])=><div key={label} className="rounded-[10px] bg-[#f7eee9] p-3"><p className="glow-display text-[21px] text-[#3e322e]">{value}</p><p className="mt-1 text-[7px] uppercase tracking-[.12em] text-[#927d75]">{label}</p></div>)}</div></section>

        <section className="editorial-surface p-4"><div className="flex items-center gap-2"><Droplets size={13} className="text-[#7fa4b4]"/><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">WELLNESS CONTEXT</p></div><div className="mt-3 grid grid-cols-3 gap-2 text-center">{[['Mood',latestWellness?.mood?String(latestWellness.mood):'–'],['Energy',latestWellness?.energy?String(latestWellness.energy):'–'],['Sleep',latestWellness?.sleepHours!=null?`${latestWellness.sleepHours}h`:'–']].map(([label,value])=><div key={label} className="rounded-[9px] bg-[#f5f1e9] p-3"><p className="glow-display text-[16px] capitalize text-[#433631]">{value}</p><p className="mt-1 text-[7px] text-[#8e7770]">{label}</p></div>)}</div><Link href="/wellness" className="mt-3 inline-flex items-center gap-1 text-[8px] text-[#a15f69]">Update wellness <ArrowRight size={9}/></Link></section>

        <section className="editorial-surface p-4"><div className="flex items-center gap-2"><MoonStar size={13} className="text-[#8e7ba4]"/><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">TONIGHT</p></div><div className="mt-3 space-y-2">{beauty.length?beauty.map(step=><div key={step.id} className="rounded-[9px] bg-[#f9ecec] px-3 py-2"><p className="text-[9px] text-[#654f4c]">{step.name}</p></div>):<p className="text-[9px] text-[#8e7770]">Open Beauty or Planning to shape tonight.</p>}</div><div className="mt-3 flex gap-2"><Link href="/beauty" className="rounded-[8px] bg-[#f0d7d8] px-3 py-2 text-[8px] text-[#6c4e50]">Beauty</Link><Link href="/planning" className="rounded-[8px] border border-[#e1d4cc] px-3 py-2 text-[8px] text-[#6c5b55]">Prepare tomorrow</Link></div></section>

        {later.length?<section className="editorial-surface p-4"><div className="flex items-center gap-2"><Clock3 size={13} className="text-[#a58a74]"/><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#745f58]">LATER</p></div><div className="mt-3 space-y-2">{later.map(task=><div key={task.id} className="flex items-center justify-between gap-3 border-b border-[#eee3dc] pb-2 last:border-0"><p className="min-w-0 truncate text-[9px] text-[#6c5a54]">{task.title}</p><span className="text-[7px] uppercase text-[#a28c84]">{task.priority}</span></div>)}</div><p className="mt-3 text-[8px] text-[#9a837b]">These stay visible without competing with your current action.</p></section>:null}

        <Link href="/brain" className="flex items-center justify-between rounded-[18px] border border-[#e2d3ca] bg-[linear-gradient(130deg,#ead5d6,#efe5d8)] p-4"><div><p className="text-[7px] font-bold uppercase tracking-[.16em] text-[#8b6970]">GLOW BRAIN</p><p className="glow-display mt-1 text-[18px] text-[#433631]">What should I do now?</p></div><BrainCircuit size={24} className="text-[#966c75]"/></Link>
      </aside>
    </div>
  </div></AppShell>;
}
