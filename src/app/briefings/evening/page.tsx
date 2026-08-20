import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { eq, desc } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions } from '@/db/schema/adaptive-os';
import { AppShell } from '@/components/app-shell';
import { NightlyIntelligenceBriefing } from '@/components/briefings/nightly-intelligence-briefing';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getHabitsByUser, getHabitLogsForUser } from '@/lib/data/habits';
import { getBriefings } from '@/lib/data/completion-v1';
import { getLifeModes } from '@/lib/intelligence/adaptive-os';

export const dynamic = 'force-dynamic';
const dateKey = (date: Date) => date.toISOString().slice(0, 10);
const sameDay = (value: Date, target: Date) => value.toDateString() === target.toDateString();

export default async function EveningDebriefPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const yearAgo = new Date(now);
  yearAgo.setDate(yearAgo.getDate() - 365);

  const [tasks, events, habits, habitLogs, briefings, focus, modes] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getHabitsByUser(userId),
    getHabitLogsForUser(userId, dateKey(yearAgo), dateKey(now)),
    getBriefings(userId),
    db.select().from(focusSessions).where(eq(focusSessions.userId, userId)).orderBy(desc(focusSessions.startedAt)).limit(20).catch(() => []),
    getLifeModes(userId),
  ]);

  const activeMode = modes.find((mode) => mode.isActive);
  const completed = tasks.filter((task) => task.status === 'done' && task.completedAt && sameDay(task.completedAt, now));
  const open = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const todayEvents = events.filter((event) => sameDay(event.startAt, now));
  const tomorrowEvents = events.filter((event) => sameDay(event.startAt, tomorrow)).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const loggedHabitIds = new Set(habitLogs.filter((log) => log.loggedDate === dateKey(now) && log.count > 0).map((log) => log.habitId));
  const habitsDone = habits.filter((habit) => loggedHabitIds.has(habit.id)).length;
  const focusMinutes = focus.filter((item) => sameDay(item.startedAt, now)).reduce((sum, item) => sum + (item.actualMinutes ?? 0), 0);
  const alreadyClosed = briefings.some((briefing) => briefing.kind === 'evening' && briefing.periodKey === dateKey(now));

  return (
    <AppShell>
      <div className="rounded-[40px] bg-[linear-gradient(180deg,#26222d_0%,#211d27_100%)] p-3 sm:p-5">
        <NightlyIntelligenceBriefing
          modeName={activeMode?.name ?? 'Normal Day'}
          completed={completed.map((task) => ({ id: task.id, title: task.title, priority: task.priority, completed: true }))}
          open={open.map((task) => ({ id: task.id, title: task.title, priority: task.priority, completed: false }))}
          todayEvents={todayEvents.length}
          habitsDone={habitsDone}
          habitsTotal={habits.length}
          focusMinutes={focusMinutes}
          tomorrowEvents={tomorrowEvents.map((event) => ({ id: event.id, title: event.title, startAt: event.startAt.toISOString(), allDay: event.allDay }))}
          alreadyClosed={alreadyClosed}
        />
      </div>
    </AppShell>
  );
}
