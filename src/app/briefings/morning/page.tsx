import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { generateExpandedBriefingAction } from '@/app/actions/briefings';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getLifeModes } from '@/lib/intelligence/adaptive-os';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';
import { routinesForDate, workoutForDate } from '@/lib/personal-os/source-of-truth';
import { CalendarDays, CheckCircle2, Dumbbell, HeartPulse, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

const MODE_COPY:Record<string,{intro:string;limit:number;advice:string}>={
  'deep-work':{intro:'Protect your strongest focus window first, then fit care and movement around it.',limit:3,advice:'Do the highest-value work before optional tasks enter the day.'},
  normal:{intro:'Here is the day Glow sees: priorities, commitments, routines, habits and your assigned workout in one place.',limit:3,advice:'Protect the top three, complete the ritual in order, and leave breathing room.'},
  'low-energy':{intro:'Keep today small. Essential care, one priority, food, hydration, medication tracking and recovery are enough.',limit:1,advice:'Reduce friction and let the plan get lighter instead of abandoning it.'},
  sick:{intro:'Today is a recovery day. Glow keeps only truly necessary commitments and care in view.',limit:0,advice:'Recovery is the plan. Everything nonessential can wait.'},
};

export default async function MorningBriefPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');const userId=session.user.id;
  await ensurePersonalOsInstalled(userId);
  const [tasks,events,wellnessEntries,modes]=await Promise.all([getTasksByUser(userId),getCalendarEventsByUser(userId),getWellnessEntriesByUser(userId),getLifeModes(userId)]);
  const now=new Date();const activeMode=modes.find(mode=>mode.isActive);const mode=MODE_COPY[activeMode?.slug??'normal']??MODE_COPY.normal;
  const todayKey=now.toISOString().slice(0,10);const todayEvents=events.filter(event=>event.startAt.toISOString().slice(0,10)===todayKey).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  const eligibleTasks=tasks.filter(task=>task.status!=='done'&&task.status!=='cancelled');const priorities=mode.limit?eligibleTasks.slice(0,mode.limit):[];const nextEvent=todayEvents.find(event=>event.startAt.getTime()>=now.getTime())??todayEvents[0]??null;
  const wellness=wellnessEntries[0]??null;const workout=workoutForDate(now);const scheduledRoutines=routinesForDate(now);const morning=scheduledRoutines.find(r=>r.key==='morning-ritual');
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});

  return <AppShell><div className="mx-auto max-w-[1240px] space-y-5">
    <section className="relative overflow-hidden rounded-[28px] border border-[#EEE8EE] bg-[radial-gradient(circle_at_80%_0%,rgba(226,238,248,.9),transparent_36%),radial-gradient(circle_at_55%_0%,rgba(247,222,239,.8),transparent_38%),linear-gradient(135deg,#fff_0%,#faf7fb_100%)] p-7 sm:p-9">
      <div className="max-w-[760px]"><p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[#987E99]">Glow Morning · {activeMode?.name??'Normal Day'}</p><h1 className="glow-display mt-2 text-[46px] leading-none text-[#1C1C1E] sm:text-[54px]">Good morning.</h1><p className="mt-3 text-[12px] font-medium text-[#B86F7D]">{dateLabel}</p><p className="mt-4 max-w-[680px] text-[14px] leading-6 text-[#5F5F64]">{mode.intro}</p></div>
      <div className="mt-6 flex flex-wrap gap-2"><Link href="/routines?routine=morning-ritual&focus=1" className="rounded-full bg-[#1C1C1E] px-4 py-2.5 text-[12px] text-white">Start morning routine</Link><Link href="/glow-cards?kind=morning" className="rounded-full border border-white bg-white/75 px-4 py-2.5 text-[12px]">Show morning card</Link><form action={generateExpandedBriefingAction.bind(null,'morning')}><button className="rounded-full border border-[#E6DCE5] bg-white/70 px-4 py-2.5 text-[12px]">Refresh brief</button></form></div>
    </section>

    <section className="grid gap-4 lg:grid-cols-4">
      <Card className="p-5 lg:col-span-2"><div className="flex items-center gap-2"><CheckCircle2 size={15} className="text-[#B86F7D]"/><h2 className="text-[15px] font-semibold">Top priorities</h2></div><div className="mt-4 space-y-2">{priorities.length?priorities.map((task,index)=><Link key={task.id} href={`/tasks?taskId=${encodeURIComponent(task.id)}&view=all`} className="flex items-start gap-3 rounded-[12px] bg-[#FAFAFA] px-4 py-3"><span className="text-[11px] text-[#A0A0A5]">0{index+1}</span><span className="text-[12px] text-[#333337]">{task.title}</span></Link>):<p className="text-[12px] text-[#77777B]">No priority tasks are demanding attention right now.</p>}</div></Card>
      <Card className="p-5"><div className="flex items-center gap-2"><CalendarDays size={15} className="text-[#B86F7D]"/><h2 className="text-[15px] font-semibold">Next commitment</h2></div><p className="glow-display mt-4 text-[21px]">{nextEvent?.title??'Open calendar'}</p><p className="mt-1 text-[11px] text-[#77777B]">{nextEvent?nextEvent.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):`${todayEvents.length} event${todayEvents.length===1?'':'s'} today`}</p><Link href="/calendar?view=day" className="mt-4 inline-flex text-[11px] text-[#B86F7D]">Open calendar →</Link></Card>
      <Card className="p-5"><div className="flex items-center gap-2"><HeartPulse size={15} className="text-[#B86F7D]"/><h2 className="text-[15px] font-semibold">Body + energy</h2></div><p className="glow-display mt-4 text-[21px]">{wellness?.energy?`Energy ${wellness.energy}/10`:'Check in'}</p><p className="mt-1 text-[11px] leading-5 text-[#77777B]">Hydration, medication tracking, supplements, food and recovery stay part of the plan.</p><Link href="/wellness" className="mt-4 inline-flex text-[11px] text-[#B86F7D]">Open wellness →</Link></Card>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="p-5"><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#9D7EA3]"/><h2 className="text-[15px] font-semibold">Your morning ritual</h2></div><p className="mt-2 text-[11px] text-[#77777B]">{morning?.steps.length??0} connected steps · Brain dump first · No scrolling until the ritual is complete.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{morning?.steps.slice(0,8).map((step,index)=><div key={step.title} className="rounded-[11px] border border-[#EEE9EF] px-3 py-2.5 text-[11px]"><span className="mr-2 text-[#B89BB8]">{index+1}.</span>{step.title}</div>)}</div><div className="mt-4 flex gap-2"><Link href="/routines?routine=morning-ritual" className="text-[11px] text-[#B86F7D]">Full routine →</Link><Link href="/habits" className="text-[11px] text-[#8A7B8C]">Today&apos;s habits →</Link></div></Card>
      <Card className="p-5"><div className="flex items-center gap-2"><Dumbbell size={15} className="text-[#8CA0A8]"/><h2 className="text-[15px] font-semibold">Today&apos;s workout</h2></div><p className="mt-2 text-[10px] uppercase tracking-[.12em] text-[#8A8A8F]">Day {workout.day}</p><h3 className="glow-display mt-2 text-[25px]">{workout.name}</h3><p className="mt-2 text-[11px] leading-5 text-[#6E6E73]">{workout.purpose}</p><div className="mt-4 space-y-1.5">{workout.exercises.slice(0,6).map(exercise=><p key={exercise} className="text-[11px] text-[#454549]">• {exercise}</p>)}</div><div className="mt-4 flex flex-wrap gap-2"><Link href="/fitness/plan" className="rounded-full bg-[#1C1C1E] px-3 py-2 text-[11px] text-white">Open workout</Link><Link href="/glow-cards?kind=workout" className="rounded-full border border-[#E6E6E6] px-3 py-2 text-[11px]">Make workout card</Link></div></Card>
    </section>

    <Card className="p-5"><h2 className="text-[15px] font-semibold">Glow&apos;s next move</h2><p className="glow-display mt-3 text-[22px] italic leading-8 text-[#4C454D]">{mode.advice}</p><p className="mt-2 text-[11px] text-[#77777B]">You can ask “What should I do next?” at any point and Glow will bring you back to the current priority instead of making you hunt through pages.</p></Card>
  </div></AppShell>;
}
