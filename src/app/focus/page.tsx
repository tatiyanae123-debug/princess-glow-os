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
    return <AppShell><div className="mx-auto max-w-3xl rounded-[22px] border border-amber-200 bg-amber-50 p-6"><p className="text-sm font-semibold">Focus Sessions need intelligence activation.</p><a href="/settings/intelligence" className="mt-3 inline-block text-xs text-amber-900">Activate intelligence →</a></div></AppShell>;
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

  return <AppShell><div className="mx-auto max-w-5xl space-y-5">
    <header><div className="flex items-center gap-2 text-violet-700"><Focus size={17}/><p className="text-[9px] font-bold uppercase tracking-[.2em]">Focus Sessions</p></div><h1 className="glow-display mt-2 text-[42px] leading-none text-[#392e2a]">One thing at a time.</h1><p className="mt-2 max-w-2xl text-[10px] leading-5 text-[#7e6b64]">Start a focused work block from any open task. Glow persists every session, duration, outcome, and note so execution history can inform planning instead of disappearing when the timer ends.</p></header>

    {requestedTask && !active ? <section className="rounded-[22px] border border-[#d8c7c0] bg-[linear-gradient(135deg,#f7efeb,#fffaf7)] p-5"><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#9b5f68]">Ready to focus</p><h2 className="glow-display mt-2 text-[22px] text-[#433631]">{requestedTask.title}</h2><p className="mt-1 text-[9px] uppercase tracking-[.1em] text-[#9b857d]">{requestedTask.priority}{requestedTask.dueDate ? ` · due ${requestedTask.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</p><form action={startFocusSessionAction.bind(null, 'task', requestedTask.id, requestedTask.title, 25)} className="mt-4"><button type="submit" className="flex items-center gap-2 rounded-xl bg-[#40352f] px-4 py-2.5 text-[9px] text-white"><Play size={12}/>Start focus on this task</button></form></section> : null}

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <article className="rounded-[18px] border border-[#e4d7cf] bg-white/72 p-4"><History size={14} className="text-violet-700"/><p className="glow-display mt-2 text-[24px] text-[#433631]">{finished.length}</p><p className="mt-1 text-[7px] uppercase tracking-[.14em] text-[#917b73]">Recorded sessions</p></article>
      <article className="rounded-[18px] border border-[#e4d7cf] bg-white/72 p-4"><CheckCircle2 size={14} className="text-emerald-700"/><p className="glow-display mt-2 text-[24px] text-[#433631]">{completed.length}</p><p className="mt-1 text-[7px] uppercase tracking-[.14em] text-[#917b73]">Completed focus blocks</p></article>
      <article className="rounded-[18px] border border-[#e4d7cf] bg-white/72 p-4"><TimerReset size={14} className="text-[#9b6c72]"/><p className="glow-display mt-2 text-[24px] text-[#433631]">{formatMinutes(weeklyMinutes)}</p><p className="mt-1 text-[7px] uppercase tracking-[.14em] text-[#917b73]">Focused this week</p></article>
      <article className="rounded-[18px] border border-[#e4d7cf] bg-white/72 p-4"><TrendingUp size={14} className="text-[#8b7567]"/><p className="glow-display mt-2 text-[24px] text-[#433631]">{averageMinutes ? `${averageMinutes}m` : '—'}</p><p className="mt-1 text-[7px] uppercase tracking-[.14em] text-[#917b73]">Average session</p></article>
    </section>

    {active ? <section className="rounded-[24px] border border-violet-200 bg-[linear-gradient(135deg,#f4effb,#fffaf7)] p-6"><p className="text-[8px] font-bold uppercase tracking-[.18em] text-violet-700">Active now</p><h2 className="glow-display mt-2 text-[28px] text-[#433631]">{active.title}</h2><div className="mt-3 flex items-center gap-2 text-[9px] text-[#7b6962]"><Clock3 size={12}/>{active.plannedMinutes ?? 25} min planned · started {active.startedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div><form action={finishFocusSessionFormAction.bind(null, active.id)} className="mt-5 space-y-3"><textarea name="notes" rows={3} placeholder="What did you accomplish?" className="w-full rounded-xl border border-violet-100 bg-white/70 p-3 text-[10px]"/><div className="flex flex-wrap gap-2"><button name="outcome" value="completed" className="flex items-center gap-2 rounded-xl bg-violet-950 px-4 py-2.5 text-[9px] text-white"><CheckCircle2 size={12}/>Complete Focus</button><button name="outcome" value="stopped" className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[9px] text-stone-600">Stop session</button></div></form></section> : <section className="rounded-[20px] border border-emerald-100 bg-emerald-50/50 p-4 text-[9px] text-emerald-800">No focus session is active. Pick the task that deserves uninterrupted attention.</section>}

    <section className="space-y-3"><div><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#826d65]">Start from open work</p><p className="mt-1 text-[9px] text-[#8a766e]">Starting a new session is persisted and safely supersedes any unfinished session through the existing Focus action.</p></div><div className="grid gap-3 md:grid-cols-2">{tasks.length ? tasks.map((task) => <article key={task.id} className="rounded-[18px] border border-[#e4d7cf] bg-white/72 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-medium text-[#493b35]">{task.title}</p><p className="mt-1 text-[8px] uppercase tracking-[.12em] text-[#9b857d]">{task.priority}{task.dueDate ? ` · due ${task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</p></div><form action={startFocusSessionAction.bind(null, 'task', task.id, task.title, 25)}><button type="submit" disabled={!!active} className="flex items-center gap-1 rounded-lg bg-[#40352f] px-3 py-2 text-[8px] text-white disabled:opacity-30"><Play size={10}/>Focus</button></form></div></article>) : <div className="rounded-[18px] border border-dashed border-[#ded1c8] bg-white/50 p-6 text-center"><CheckCircle2 className="mx-auto text-emerald-700" size={18}/><p className="mt-2 text-[9px] text-stone-600">No open tasks. Use the space intentionally or create the next meaningful action in Tasks.</p><a href="/tasks" className="mt-3 inline-block text-[8px] font-medium text-[#9b5f68]">Open Tasks →</a></div>}</div></section>

    <section className="rounded-[22px] border border-[#e4d7cf] bg-white/72 p-5"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><History size={14} className="text-violet-700"/><p className="text-[8px] font-bold uppercase tracking-[.16em] text-[#77645d]">Recent focus history</p></div><p className="mt-1 text-[9px] text-[#8a766e]">Persistent execution evidence from your latest completed or stopped sessions.</p></div><span className="text-[8px] text-[#9a857c]">{formatMinutes(totalMinutes)} recorded</span></div><div className="mt-4 divide-y divide-[#eee4dd]">{recentHistory.length ? recentHistory.map((item) => <article key={item.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><p className="text-[10px] font-medium text-[#493b35]">{item.title}</p><span className={`rounded-full px-2 py-1 text-[7px] uppercase tracking-[.1em] ${item.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>{item.outcome ?? (item.completed ? 'completed' : 'stopped')}</span></div><p className="mt-1 text-[8px] text-[#8a766e]">{item.startedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {item.startedAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}{item.entityType ? ` · ${item.entityType}` : ''}</p>{item.notes ? <p className="mt-2 text-[8px] leading-4 text-[#78655e]">{item.notes}</p> : null}</div><div className="text-left sm:text-right"><p className="glow-display text-[17px] text-[#433631]">{formatMinutes(item.actualMinutes ?? 0)}</p><p className="text-[7px] uppercase tracking-[.1em] text-[#9b857d]">actual{item.plannedMinutes ? ` · ${item.plannedMinutes}m planned` : ''}</p></div></article>) : <div className="py-8 text-center"><Clock3 className="mx-auto text-[#aa978d]" size={18}/><p className="mt-2 text-[9px] text-[#7f6d66]">Your first completed focus block will appear here with its duration, outcome, and notes.</p></div>}</div></section>
  </div></AppShell>;
}
