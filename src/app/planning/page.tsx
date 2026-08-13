import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema/adaptive-os';
import { AppShell } from '@/components/app-shell';
import { PlanningTabs } from '@/components/planning/planning-tabs';
import { BuildMyDay } from '@/components/planning/build-my-day';
import { Card } from '@/components/ui/card';
import { archivePlanningPeriodAction, createPlanningPeriodAction, updatePlanningPeriodAction } from '@/app/actions/completion-v1';
import { getPlanningPeriods } from '@/lib/data/completion-v1';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getNotesByUser } from '@/lib/data/notes';
import { getRoutinesByUser, getStepsByUser } from '@/lib/data/routines';
import { CalendarRange, PenLine } from 'lucide-react';

export const dynamic = 'force-dynamic';
const fieldClass = 'w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#C9727E] focus:outline-none';

export default async function PlanningPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const [periods, tasks, events, projects, notes, routines, routineSteps, dependencies] = await Promise.all([
    getPlanningPeriods(userId),
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getProjectsByUser(userId),
    getNotesByUser(userId),
    getRoutinesByUser(userId),
    getStepsByUser(userId),
    db.select().from(taskDependencies).where(eq(taskDependencies.userId, userId)).catch(() => []),
  ]);

  const openTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const taskNames = new Map(tasks.map((task) => [task.id, task.title]));
  const isOpenTask = (id: string) => openTasks.some((task) => task.id === id);
  const activeDependencies = dependencies.filter((dep) => isOpenTask(dep.successorId) && isOpenTask(dep.predecessorId));
  const blockedTasks = openTasks
    .map((task) => ({ task, blockedBy: activeDependencies.filter((dep) => dep.successorId === task.id).map((dep) => taskNames.get(dep.predecessorId) ?? 'a prerequisite') }))
    .filter((entry) => entry.blockedBy.length > 0);

  const sundayResetRoutine = routines.find((routine) => /sunday.*reset|reset.*sunday/i.test(routine.name));
  const sundayResetSteps = sundayResetRoutine ? routineSteps.filter((step) => step.routineId === sundayResetRoutine.id).sort((a, b) => a.order - b.order) : [];

  let insight: string | null = null;
  try {
    const { buildPersonalContext } = await import('@/lib/intelligence/context');
    const context = await buildPersonalContext(userId);
    insight = context.recommendations[0]?.reason ?? null;
  } catch {
    insight = null;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <h1 className="glow-display text-[42px] leading-none text-[#2B2420] sm:text-[52px]">Plan</h1>
          <p className="mt-2 text-[14px] text-[#C9727E]">Intention. Clarity. Flow.</p>
        </header>

        <PlanningTabs
          tasks={tasks}
          events={events}
          projects={projects}
          notes={notes}
          blockedTasks={blockedTasks}
          sundayResetSteps={sundayResetSteps}
          insight={insight}
          userName={session.user.name?.split(' ')[0] ?? 'there'}
        />

        <BuildMyDay />

        <div className="grid gap-4 lg:grid-cols-[.78fr_1.22fr]">
          <Card>
            <form action={createPlanningPeriodAction} className="space-y-3">
              <div className="flex items-center gap-2"><PenLine size={14} className="text-[#C9727E]" /><div><p className="glow-eyebrow">Persistent planning</p><h2 className="glow-display mt-1 text-[20px] text-[#2B2420]">Create a planning layer</h2></div></div>
              <select name="level" defaultValue="week" className={fieldClass}><option value="today">Today</option><option value="week">Week</option><option value="quarter">Quarter</option><option value="year">Year</option><option value="book">Book</option><option value="bucket">Bucket list</option></select>
              <input name="title" required placeholder="Title, e.g. Strong August week" className={fieldClass} />
              <textarea name="focus" rows={4} placeholder="Focus, priorities, identity goal, reading note, or bucket-list detail" className={fieldClass} />
              <div className="grid gap-3 sm:grid-cols-2"><input name="startsAt" type="date" className={fieldClass} /><input name="endsAt" type="date" className={fieldClass} /></div>
              <button type="submit" className="rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] font-medium text-white">Save planning layer</button>
            </form>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-5 py-4"><CalendarRange size={14} className="text-[#C9727E]" /><div><p className="glow-eyebrow">Planning archive</p><h2 className="glow-display mt-1 text-[19px] text-[#2B2420]">Saved planning layers</h2></div></div>
            {periods.length === 0 ? (
              <p className="p-8 text-center text-[12px] text-[#8A8078]">Nothing saved yet. Add Today, Week, Quarter, Year, a book, or a bucket-list item.</p>
            ) : (
              <div className="divide-y divide-[#F1E7E3]">
                {periods.map((period, index) => (
                  <form key={period.id} action={updatePlanningPeriodAction.bind(null, period.id)} className={`p-4 ${index === 0 ? 'bg-[#FDF8F6]' : ''}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="glow-display text-[15px] text-[#2B2420]">{period.title}</p><p className="mt-0.5 text-[10px] uppercase tracking-[.1em] text-[#B5ACA5]">{period.level}</p></div>
                      <span className="rounded-full bg-[#FDF3F2] px-2.5 py-1 text-[10.5px] text-[#B15A68]">{period.progress}%</span>
                    </div>
                    <div className="mt-3 grid gap-3">
                      <textarea name="focus" defaultValue={period.focus ?? ''} rows={2} placeholder="Focus" className={fieldClass} />
                      <textarea name="reflection" defaultValue={period.reflection ?? ''} rows={2} placeholder="Reflection or notes" className={fieldClass} />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <input name="progress" type="number" min="0" max="100" defaultValue={period.progress} className={fieldClass} />
                        <input name="startsAt" type="date" defaultValue={period.startsAt ? period.startsAt.toISOString().slice(0, 10) : ''} className={fieldClass} />
                        <input name="endsAt" type="date" defaultValue={period.endsAt ? period.endsAt.toISOString().slice(0, 10) : ''} className={fieldClass} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="submit" className="rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] font-medium text-white">Save changes</button>
                        <button formAction={archivePlanningPeriodAction.bind(null, period.id)} className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#4A4440] hover:bg-[#FDF8F6]">Archive</button>
                      </div>
                    </div>
                  </form>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
