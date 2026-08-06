import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { getTasksByUser } from '@/lib/data/tasks';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getNotesByUser } from '@/lib/data/notes';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const [tasks, wellnessEntries, beautyRoutines, notes, calendarEvents] = await Promise.all([
    getTasksByUser(userId),
    getWellnessEntriesByUser(userId),
    getBeautyRoutinesByUser(userId),
    getNotesByUser(userId),
    getCalendarEventsByUser(userId),
  ]);

  const today = new Date();
  const todayTasks = tasks
    .filter((t) => t.status !== 'done' && t.status !== 'cancelled' && t.dueDate && t.dueDate.toDateString() === today.toDateString())
    .slice(0, 3);
  const topTasks = tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled').slice(0, 3);
  const highlights = todayTasks.length > 0 ? todayTasks : topTasks;

  const latestWellness = wellnessEntries[0] ?? null;
  const wellnessTracks = [
    { title: 'Mood', value: latestWellness?.mood ? String(latestWellness.mood) : '–' },
    { title: 'Energy', value: latestWellness?.energy ? String(latestWellness.energy) : '–' },
    { title: 'Sleep', value: latestWellness?.sleepHours != null ? `${latestWellness.sleepHours}h` : '–' },
  ];

  const beautySteps = beautyRoutines.filter((r) => r.timeOfDay === 'morning').slice(0, 4);
  const pinnedNotes = notes.filter((n) => n.pinned).slice(0, 6);
  const recentNotes = notes.slice(0, 6);
  const quickNotes = (pinnedNotes.length > 0 ? pinnedNotes : recentNotes).map((n) => n.title);

  const featuredPillars = [
    { title: 'Glow', description: 'A refined morning rhythm' },
    { title: 'Flow', description: 'Work that feels lighter' },
    { title: 'Restore', description: 'Care that holds you' },
  ];
  const todaysEvents = calendarEvents.filter((event) => event.startAt.toDateString() === today.toDateString()).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  return (
    <AppShell>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-rose-500">Daily ritual</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">A soft landing for the day ahead.</h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Curate your priorities, protect your energy, and let the day feel intentional rather than crowded.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <p className="font-semibold">Today&apos;s focus</p>
              <p className="mt-1">{highlights[0]?.title ?? 'Choose one meaningful thing to finish today.'}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200/70 bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Highlights</p>
            <div className="mt-4 space-y-3">
              {highlights.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm text-slate-300">All caught up – add tasks to see your highlights here.</p>
              ) : (
                highlights.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="font-semibold">{task.title}</p>
                    {task.description && <p className="mt-1 text-sm text-slate-300">{task.description}</p>}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-500">Pillars</p>
            <div className="mt-4 space-y-3">
              {featuredPillars.map((pillar) => (
                <div key={pillar.title} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{pillar.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Today&rsquo;s schedule</p>
          {todaysEvents.length === 0 ? <p className="mt-4 text-sm text-slate-400">No synced events today.</p> : <div className="mt-4 space-y-2">{todaysEvents.map((event) => <div key={event.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-semibold text-slate-900">{event.title}</p><p className="text-sm text-slate-500">{event.allDay ? 'All day' : event.startAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}{event.source === 'google_calendar' ? ' · Google Calendar' : ''}</p></div>)}</div>}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Wellness snapshot</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {wellnessTracks.map((track) => (
                <div key={track.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">{track.title}</p>
                  <p className="mt-2 text-lg font-semibold capitalize text-slate-900">{track.value}</p>
                </div>
              ))}
            </div>
            {!latestWellness && (
              <p className="mt-3 text-xs text-slate-400">Log a wellness entry to see your snapshot here.</p>
            )}
          </div>

          <div className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">Beauty ritual</p>
            {beautySteps.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No morning beauty steps yet. Add your ritual in the Beauty section.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {beautySteps.map((step) => (
                  <li key={step.id} className="rounded-2xl bg-rose-50 px-4 py-3">{step.name}</li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-600">Notes to keep close</p>
          {quickNotes.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Add notes to see them here.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              {quickNotes.map((note) => (
                <span key={note} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                  {note}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
