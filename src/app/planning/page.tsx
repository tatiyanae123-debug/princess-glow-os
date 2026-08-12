import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { PlanningHub } from '@/components/planning/planning-hub';
import { BuildMyDay } from '@/components/planning/build-my-day';
import { TopThreeCard } from '@/components/planning/top-three-card';
import { ThisWeekCard } from '@/components/planning/this-week-card';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { archivePlanningPeriodAction, createPlanningPeriodAction, updatePlanningPeriodAction } from '@/app/actions/completion-v1';
import { getPlanningPeriods } from '@/lib/data/completion-v1';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { CalendarRange, Layers3, PenLine } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass='w-full border px-4 py-3 text-[10px]';

export default async function PlanningPage(){
  const session=await auth(); if(!session?.user?.id)redirect('/sign-in');
  const [periods, tasks, events]=await Promise.all([
    getPlanningPeriods(session.user.id),
    getTasksByUser(session.user.id),
    getCalendarEventsByUser(session.user.id),
  ]);
  const active=periods.filter((p)=>!p.archived);
  const avg=active.length?Math.round(active.reduce((sum,p)=>sum+p.progress,0)/active.length):0;

  return <AppShell><SectionPage eyebrow="Planning" title="Today, week, quarter, and year in one place" description="Build the day around real commitments, then connect daily action to your bigger direction.">
    <div className="space-y-5">
      <section className="grid gap-3 md:grid-cols-[1.25fr_.75fr]">
        <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f7eceb,#efe3dc)] p-5"><Layers3 size={54} strokeWidth={.8} className="absolute right-5 top-3 text-[#a66f76]/18"/><p className="glow-eyebrow">Life architecture</p><p className="glow-display mt-2 text-[24px] text-[#4b3c38]">Plan in layers, live in moments.</p><p className="mt-2 max-w-xl text-[9px] leading-4 text-[#7a6760]">Today should connect to the week, the week to the quarter, and the quarter to the person you are becoming.</p></Card>
        <Card className="p-5"><p className="glow-display text-[17px] text-[#493c38]">Planning pulse</p><div className="mt-4 flex items-end justify-between"><div><p className="text-[8px] uppercase tracking-[.12em] text-[#907b73]">Active layers</p><p className="glow-display mt-1 text-[26px] text-[#4d3f3a]">{active.length}</p></div><div className="text-right"><p className="text-[8px] uppercase tracking-[.12em] text-[#907b73]">Avg. progress</p><p className="glow-display mt-1 text-[26px] text-[#4d3f3a]">{avg}%</p></div></div></Card>
      </section>

      <div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]">
        <TopThreeCard initialTasks={tasks} />
        <ThisWeekCard tasks={tasks} events={events} />
      </div>

      <BuildMyDay />

      <div className="grid gap-5 lg:grid-cols-[.78fr_1.22fr]">
        <Card className="paper-card"><form action={createPlanningPeriodAction} className="space-y-3"><div className="flex items-center gap-2"><PenLine size={14} className="text-[#a46d76]"/><div><p className="glow-eyebrow">Persistent planning</p><h2 className="glow-display mt-1 text-[20px] text-[#463833]">Create a planning layer</h2></div></div><select name="level" defaultValue="week" className={fieldClass}><option value="today">Today</option><option value="week">Week</option><option value="quarter">Quarter</option><option value="year">Year</option><option value="book">Book</option><option value="bucket">Bucket list</option></select><input name="title" required placeholder="Title, e.g. Strong August week" className={fieldClass}/><textarea name="focus" rows={4} placeholder="Focus, priorities, identity goal, reading note, or bucket-list detail" className={fieldClass}/><div className="grid gap-3 sm:grid-cols-2"><input name="startsAt" type="date" className={fieldClass}/><input name="endsAt" type="date" className={fieldClass}/></div><button type="submit" className="rounded-[6px] bg-[#3d302c] px-4 py-2 text-[9px] font-medium text-white">Save planning layer</button></form></Card>

        <Card className="p-0 overflow-hidden"><div className="flex items-center gap-2 border-b border-[#e7dbd4] px-5 py-4"><CalendarRange size={14} className="text-[#9c7477]"/><div><p className="glow-eyebrow">Planning archive</p><h2 className="glow-display mt-1 text-[19px] text-[#473a35]">Saved planning layers</h2></div></div>{periods.length===0?<p className="p-8 text-center text-[9px] text-[#8e7b74]">Nothing saved yet. Add Today, Week, Quarter, Year, a book, or a bucket-list item.</p>:<div className="divide-y divide-[#eee3dc]">{periods.map((period,index)=><form key={period.id} action={updatePlanningPeriodAction.bind(null,period.id)} className={`p-4 ${index===0?'bg-[#f7eceb]/60':''}`}><div className="flex items-start justify-between gap-3"><div><p className="glow-display text-[15px] text-[#4a3d38]">{period.title}</p><p className="mt-0.5 text-[7px] uppercase tracking-[.15em] text-[#9a847c]">{period.level}</p></div><span className="rounded-full bg-[#efe4de] px-2 py-1 text-[7px] text-[#806d65]">{period.progress}%</span></div><div className="mt-3 grid gap-3"><textarea name="focus" defaultValue={period.focus??''} rows={2} placeholder="Focus" className={fieldClass}/><textarea name="reflection" defaultValue={period.reflection??''} rows={2} placeholder="Reflection or notes" className={fieldClass}/><div className="grid gap-3 sm:grid-cols-3"><input name="progress" type="number" min="0" max="100" defaultValue={period.progress} className={fieldClass}/><input name="startsAt" type="date" defaultValue={period.startsAt?period.startsAt.toISOString().slice(0,10):''} className={fieldClass}/><input name="endsAt" type="date" defaultValue={period.endsAt?period.endsAt.toISOString().slice(0,10):''} className={fieldClass}/></div><div className="flex flex-wrap gap-2"><button type="submit" className="rounded-[6px] bg-[#3d302c] px-3 py-2 text-[8px] text-white">Save changes</button><button formAction={archivePlanningPeriodAction.bind(null,period.id)} className="rounded-[6px] border border-[#e0d2ca] px-3 py-2 text-[8px] text-[#6d5a53]">Archive</button></div></div></form>)}</div>}</Card>
      </div>

      <PlanningHub />
    </div>
  </SectionPage></AppShell>;
}
