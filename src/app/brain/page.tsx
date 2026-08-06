import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { buildPersonalContext } from '@/lib/intelligence/context';

export const dynamic = 'force-dynamic';

export default async function BrainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const context = await buildPersonalContext(session.user.id);

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-violet-600">Glow Brain</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">Your life, interpreted clearly.</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{context.dailyBrief}</p>
          <p className="mt-3 text-sm text-slate-400">Updated {context.generatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {context.todayLabel}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Focus score</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">{context.focusScore}</p>
            <p className="mt-1 text-xs text-slate-400">A rule-based snapshot, not a judgment.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Unfinished tasks</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">{context.unfinishedTasks.length}</p>
            <p className="mt-1 text-xs text-slate-400">{context.overdueTasks.length} overdue</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Today’s events</p>
            <p className="mt-2 text-4xl font-semibold text-slate-900">{context.todaysEvents.length}</p>
            <p className="mt-1 text-xs text-slate-400">Calendar-aware context</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-500">Next best actions</p>
            <div className="mt-4 space-y-3">
              {context.recommendations.length === 0 ? (
                <p className="text-sm text-slate-400">You are clear for now. Add tasks, habits, routines, or calendar events to create recommendations.</p>
              ) : context.recommendations.map((item) => (
                <Link key={item.id} href={item.href} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
                    </div>
                    <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium uppercase text-slate-500">{item.priority}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Next event</p>
            {context.nextEvent ? (
              <div className="mt-4">
                <p className="text-xl font-semibold">{context.nextEvent.title}</p>
                <p className="mt-2 text-sm text-slate-300">{context.nextEvent.allDay ? 'All day' : context.nextEvent.startAt.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                <Link href="/calendar" className="mt-4 inline-block text-sm font-medium text-white underline underline-offset-4">Open Calendar</Link>
              </div>
            ) : <p className="mt-4 text-sm text-slate-300">No upcoming event found.</p>}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Habits today</p>
            <div className="mt-4 space-y-2">
              {context.habits.slice(0, 8).map((habit) => (
                <div key={habit.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="text-slate-700">{habit.name}</span>
                  <span className={habit.completedToday ? 'text-emerald-600' : 'text-slate-400'}>{habit.completedToday ? 'Done' : 'Not logged'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">Routines for today</p>
            <div className="mt-4 space-y-2">
              {context.routinesForToday.slice(0, 8).map((routine) => (
                <div key={routine.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-medium text-slate-800">{routine.name}</p>
                  <p className="mt-1 text-xs capitalize text-slate-400">{routine.timeOfDay}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
