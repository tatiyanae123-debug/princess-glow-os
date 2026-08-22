import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema/adaptive-os';
import { AppShell } from '@/components/app-shell';
import { PlanningIntelligenceStudio } from '@/components/planning/planning-intelligence-studio';
import { BuildMyDay } from '@/components/planning/build-my-day';
import { Card } from '@/components/ui/card';
import { archivePlanningPeriodAction, createPlanningPeriodAction, updatePlanningPeriodAction } from '@/app/actions/completion-v1';
import { getPlanningPeriods } from '@/lib/data/completion-v1';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getGoalsByUser } from '@/lib/data/goals';
import { getPlanningBlocksByUser, getProjectsByUser } from '@/lib/data/user-scope';
import { getNotesByUser } from '@/lib/data/notes';
import { getRoutinesByUser, getStepsByUser } from '@/lib/data/routines';
import { CalendarRange, PenLine } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#DDE7EA] bg-white px-3.5 py-2.5 text-[12px] text-[#30343A] placeholder:text-[#9DA5AA] focus:border-[#7896A2] focus:outline-none';

export default async function PlanningPage({ searchParams }: { searchParams: Promise<{ periodId?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const now = new Date();
  const [periods, tasks, allEvents, projects, goals, notes, routines, routineSteps, planningBlocks, dependencies, params] = await Promise.all([
    getPlanningPeriods(userId),
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getProjectsByUser(userId),
    getGoalsByUser(userId),
    getNotesByUser(userId),
    getRoutinesByUser(userId),
    getStepsByUser(userId),
    getPlanningBlocksByUser(userId),
    db.select().from(taskDependencies).where(eq(taskDependencies.userId, userId)).catch(() => []),
    searchParams,
  ]);
  const selectedPeriod = params.periodId ? periods.find((period) => period.id === params.periodId) ?? null : null;
  const orderedPeriods = selectedPeriod ? [selectedPeriod, ...periods.filter((period) => period.id !== selectedPeriod.id)] : periods;
  const openTasks = tasks.filter((task) => !task.archived && task.status !== 'done' && task.status !== 'cancelled');
  const taskNames = new Map(tasks.map((task) => [task.id, task.title]));
  const activeDependencies = dependencies.filter((dep) => openTasks.some((task) => task.id === dep.successorId) && openTasks.some((task) => task.id === dep.predecessorId));
  const blockedTasks = openTasks
    .map((task) => ({ task, blockedBy: activeDependencies.filter((dep) => dep.successorId === task.id).map((dep) => taskNames.get(dep.predecessorId) ?? 'a prerequisite') }))
    .filter((entry) => entry.blockedBy.length > 0);
  const events = allEvents
    .filter((event) => (event.endAt ?? event.startAt).getTime() >= now.getTime() - 24 * 60 * 60 * 1000)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 120);

  return <AppShell><div className="space-y-5">
    {params.periodId && !selectedPeriod ? <div role="status" className="rounded-[14px] border border-[#DDE7EA] bg-[#EFF5F6] px-4 py-3 text-[11px] text-[#58707A]">That planning layer is no longer available.</div> : null}
    <PlanningIntelligenceStudio tasks={tasks} events={events} projects={projects} goals={goals} routines={routines} routineSteps={routineSteps} planningBlocks={planningBlocks} periods={periods} notes={notes} blockedTasks={blockedTasks} nowIso={now.toISOString()} />
    <section id="build-my-day" className="scroll-mt-24"><BuildMyDay /></section>
    <details id="planning-layers" open={Boolean(selectedPeriod)} className="rounded-[28px] border border-white/75 bg-white/58 p-5 shadow-[0_18px_70px_rgba(72,82,96,.08)] backdrop-blur-xl">
      <summary className="cursor-pointer glow-display text-[19px] text-[#30343A]">Persistent planning layers</summary>
      <div className="mt-5 grid gap-4 lg:grid-cols-[.78fr_1.22fr]">
        <Card><form action={createPlanningPeriodAction} className="space-y-3"><div className="flex items-center gap-2"><PenLine size={14} className="text-[#7896A2]"/><div><p className="glow-eyebrow">Persistent planning</p><h2 className="glow-display mt-1 text-[20px] text-[#30343A]">Create a planning layer</h2></div></div><select name="level" defaultValue="week" className={fieldClass}><option value="today">Today</option><option value="week">Week</option><option value="quarter">Quarter</option><option value="year">Year</option><option value="book">Book</option><option value="bucket">Bucket list</option></select><input name="title" required placeholder="Title, e.g. Strong August week" className={fieldClass}/><textarea name="focus" rows={4} placeholder="Focus, priorities, identity goal, reading note, or bucket-list detail" className={fieldClass}/><div className="grid gap-3 sm:grid-cols-2"><input name="startsAt" type="date" className={fieldClass}/><input name="endsAt" type="date" className={fieldClass}/></div><button type="submit" className="rounded-full bg-[#35414A] px-4 py-2.5 text-[12px] font-medium text-white">Save planning layer</button></form></Card>
        <Card className="overflow-hidden p-0"><div className="flex items-center gap-2 border-b border-[#E4ECEE] px-5 py-4"><CalendarRange size={14} className="text-[#7896A2]"/><div><p className="glow-eyebrow">Planning archive</p><h2 className="glow-display mt-1 text-[19px] text-[#30343A]">Saved planning layers</h2></div></div>{orderedPeriods.length===0?<p className="p-8 text-center text-[12px] text-[#7D858A]">Nothing saved yet. Add Today, Week, Quarter, Year, a book, or a bucket-list item.</p>:<div className="divide-y divide-[#EEF3F4]">{orderedPeriods.map((period,index)=>{const selected=period.id===params.periodId;return <form id={`planning-${period.id}`} key={period.id} action={updatePlanningPeriodAction.bind(null,period.id)} className={`p-4 ${selected?'bg-[#EEF5F6] ring-1 ring-inset ring-[#7896A2]':index===0?'bg-[#fbfdfd]':''}`}><div className="flex items-start justify-between gap-3"><div><p className="glow-display text-[15px] text-[#30343A]">{period.title}</p><p className="mt-0.5 text-[10px] uppercase tracking-[.1em] text-[#9DA5AA]">{period.level}</p></div><span className="rounded-full bg-[#E7F0F2] px-2.5 py-1 text-[10.5px] text-[#58707A]">{period.progress}%</span></div><div className="mt-3 grid gap-3"><textarea name="focus" defaultValue={period.focus??''} rows={2} placeholder="Focus" className={fieldClass}/><textarea name="reflection" defaultValue={period.reflection??''} rows={2} placeholder="Reflection or notes" className={fieldClass}/><div className="grid gap-3 sm:grid-cols-3"><input name="progress" type="number" min="0" max="100" defaultValue={period.progress} className={fieldClass}/><input name="startsAt" type="date" defaultValue={period.startsAt?period.startsAt.toISOString().slice(0,10):''} className={fieldClass}/><input name="endsAt" type="date" defaultValue={period.endsAt?period.endsAt.toISOString().slice(0,10):''} className={fieldClass}/></div><div className="flex flex-wrap gap-2"><button type="submit" className="rounded-full bg-[#35414A] px-3.5 py-2 text-[11px] font-medium text-white">Save changes</button><button type="submit" formAction={archivePlanningPeriodAction.bind(null,period.id)} className="rounded-full border border-[#DDE7EA] bg-white px-3.5 py-2 text-[11px] text-[#4E575C]">Archive</button></div></div></form>})}</div>}</Card>
      </div>
    </details>
  </div></AppShell>;
}
