import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { getTasksByUser } from '@/lib/data/tasks';
import { getActiveFocusSession } from '@/lib/intelligence/adaptive-os';
import { finishFocusSessionFormAction, startFocusSessionAction } from '@/app/actions/adaptive-os';
import { db } from '@/db';
import { focusSessions } from '@/db/schema/adaptive-os';
import { Clock3, Focus, Play, CheckCircle2, History, TimerReset, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export default async function FocusPage({ searchParams }: { searchParams?: Promise<{ task?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const requestedTaskId = (await searchParams)?.task ?? null;

  let active = null;
  let history: (typeof focusSessions.$inferSelect)[] = [];
  try {
    [active, history] = await Promise.all([
      getActiveFocusSession(userId),
      db.select().from(focusSessions).where(eq(focusSessions.userId, userId)).orderBy(desc(focusSessions.startedAt)).limit(24),
    ]);
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">Focus Sessions need intelligence activation.</p>
          <a href="/settings/intelligence" className="mt-3 inline-block text-[12px] font-medium text-[#C9727E]">Activate intelligence →</a>
        </div>
      </AppShell>
    );
  }

  const openTasks = (await getTasksByUser(userId)).filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const requestedTask = requestedTaskId ? openTasks.find((task) => task.id === requestedTaskId) ?? null : null;
  const tasks = openTasks.slice(0, 12);
  const finished = history.filter((item) => item.endedAt);
  const completed = finished.filter((item) => item.completed);
  const totalMinutes = finished.reduce((sum, item) => sum + (item.actualMinutes ?? 0), 0);
  const averageMinutes = finished.length ? Math.round(totalMinutes / finished.length) : 0;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyMinutes = finished.filter((item) => item.startedAt >= sevenDaysAgo).reduce((sum, item) => sum + (item.actualMinutes ?? 0), 0);
  const recentHistory = finished.slice(0, 10);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <div className="flex items-center gap-2 text-[#7C6B9C]"><Focus size={17} /><p className="text-[11px] font-semibold uppercase tracking-[.16em]">Focus Sessions</p></div>
          <h1 className="glow-display mt-2 text-[38px] leading-none text-[#2B2420] sm:text-[42px]">One thing at a time.</h1>
          <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[#8A8078]">Start a focused work block from any open task. Glow persists every session, duration, outcome, and note so execution history can inform planning instead of disappearing when the timer ends.</p>
        </header>

        {requestedTask && !active ? (
          <section className="rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(135deg,#E9E4F2,#FDF8F6)] p-5">
            <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#7C6B9C]">Ready to focus</p>
            <h2 className="glow-display mt-2 text-[22px] text-[#2B2420]">{requestedTask.title}</h2>
            <p className="mt-1 text-[11px] uppercase tracking-[.08em] text-[#8A8078]">{requestedTask.priority}{requestedTask.dueDate ? ` · due ${requestedTask.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</p>
            <form action={startFocusSessionAction.bind(null, 'task', requestedTask.id, requestedTask.title, 25)} className="mt-4">
              <button type="submit" className="flex items-center gap-2 rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] font-medium text-white"><Play size={13} />Start focus on this task</button>
            </form>
          </section>
        ) : null}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><History size={14} className="text-[#7C6B9C]" /><p className="glow-display mt-2 text-[24px] text-[#2B2420]">{finished.length}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#8A8078]">Recorded sessions</p></article>
          <article className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><CheckCircle2 size={14} className="text-[#5A6E52]" /><p className="glow-display mt-2 text-[24px] text-[#2B2420]">{completed.length}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#8A8078]">Completed focus blocks</p></article>
          <article className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><TimerReset size={14} className="text-[#C9727E]" /><p className="glow-display mt-2 text-[24px] text-[#2B2420]">{formatMinutes(weeklyMinutes)}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#8A8078]">Focused this week</p></article>
          <article className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><TrendingUp size={14} className="text-[#9A7A3D]" /><p className="glow-display mt-2 text-[24px] text-[#2B2420]">{averageMinutes ? `${averageMinutes}m` : '—'}</p><p className="mt-1 text-[10px] uppercase tracking-[.1em] text-[#8A8078]">Average session</p></article>
        </section>

        {active ? (
          <section className="rounded-[20px] border border-[#E9E4F2] bg-[linear-gradient(135deg,#E9E4F2,#FDF8F6)] p-6">
            <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#7C6B9C]">Active now</p>
            <h2 className="glow-display mt-2 text-[28px] text-[#2B2420]">{active.title}</h2>
            <div className="mt-3 flex items-center gap-2 text-[11.5px] text-[#8A8078]"><Clock3 size={13} />{active.plannedMinutes ?? 25} min planned · started {active.startedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
            <form action={finishFocusSessionFormAction.bind(null, active.id)} className="mt-5 space-y-3">
              <textarea name="notes" rows={3} placeholder="What did you accomplish?" className="w-full rounded-lg border border-[#F1E7E3] bg-white p-3 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#7C6B9C] focus:outline-none" />
              <div className="flex flex-wrap gap-2">
                <button name="outcome" value="completed" className="flex items-center gap-2 rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] font-medium text-white"><CheckCircle2 size={13} />Complete Focus</button>
                <button name="outcome" value="stopped" className="rounded-full border border-[#F1E7E3] bg-white px-4 py-2.5 text-[12px] text-[#8A8078] hover:bg-[#FDF8F6]">Stop session</button>
              </div>
            </form>
          </section>
        ) : (
          <section className="rounded-[18px] border border-[#E4EBDD] bg-[#F3F6F0] p-4 text-[12px] text-[#5A6E52]">No focus session is active. Pick the task that deserves uninterrupted attention.</section>
        )}

        <section className="space-y-3">
          <div><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Start from open work</p><p className="mt-1 text-[12px] text-[#8A8078]">Starting a new session is persisted and safely supersedes any unfinished session through the existing Focus action.</p></div>
          <div className="grid gap-3 md:grid-cols-2">
            {tasks.length ? tasks.map((task) => (
              <article key={task.id} className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[12.5px] font-medium text-[#2B2420]">{task.title}</p><p className="mt-1 text-[10.5px] uppercase tracking-[.08em] text-[#8A8078]">{task.priority}{task.dueDate ? ` · due ${task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</p></div>
                  <form action={startFocusSessionAction.bind(null, 'task', task.id, task.title, 25)}><button type="submit" disabled={!!active} className="flex items-center gap-1.5 rounded-full bg-[#2B2420] px-3.5 py-2 text-[11px] font-medium text-white disabled:opacity-30"><Play size={11} />Focus</button></form>
                </div>
              </article>
            )) : (
              <div className="rounded-[18px] border border-dashed border-[#F1E7E3] bg-white p-6 text-center">
                <CheckCircle2 className="mx-auto text-[#5A6E52]" size={18} />
                <p className="mt-2 text-[12px] text-[#4A4440]">No open tasks. Use the space intentionally or create the next meaningful action in Tasks.</p>
                <a href="/tasks" className="mt-3 inline-block text-[11px] font-medium text-[#C9727E]">Open Tasks →</a>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[20px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div><div className="flex items-center gap-2"><History size={14} className="text-[#7C6B9C]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Recent focus history</p></div><p className="mt-1 text-[12px] text-[#8A8078]">Persistent execution evidence from your latest completed or stopped sessions.</p></div>
            <span className="text-[11px] text-[#B5ACA5]">{formatMinutes(totalMinutes)} recorded</span>
          </div>
          <div className="mt-4 divide-y divide-[#F1E7E3]">
            {recentHistory.length ? recentHistory.map((item) => (
              <article key={item.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><p className="text-[12.5px] font-medium text-[#2B2420]">{item.title}</p><span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[.08em] ${item.completed ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#FDF8F6] text-[#8A8078]'}`}>{item.outcome ?? (item.completed ? 'completed' : 'stopped')}</span></div>
                  <p className="mt-1 text-[10.5px] text-[#8A8078]">{item.startedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {item.startedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}{item.entityType ? ` · ${item.entityType}` : ''}</p>
                  {item.notes ? <p className="mt-2 text-[11px] leading-4 text-[#8A8078]">{item.notes}</p> : null}
                </div>
                <div className="text-left sm:text-right"><p className="glow-display text-[17px] text-[#2B2420]">{formatMinutes(item.actualMinutes ?? 0)}</p><p className="text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">actual{item.plannedMinutes ? ` · ${item.plannedMinutes}m planned` : ''}</p></div>
              </article>
            )) : (
              <div className="py-8 text-center"><Clock3 className="mx-auto text-[#B5ACA5]" size={18} /><p className="mt-2 text-[12px] text-[#8A8078]">Your first completed focus block will appear here with its duration, outcome, and notes.</p></div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
