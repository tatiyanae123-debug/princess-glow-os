import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { HabitsRouteExperience } from '@/components/habits/habits-route-experience';
import { getHabitLogsForUser, getHabitsByUser } from '@/lib/data/habits';
import {
  getHabitCompletionDetails,
  getHabitExperiments,
  getHabitProfiles,
  getHabitSourceLinks,
  getHabitStacks,
  getHabitTimingStats,
  getHabitTriggers,
} from '@/lib/data/advanced-habits';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getGoalsByUser } from '@/lib/data/goals';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';

export const dynamic = 'force-dynamic';

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  await ensurePersonalOsInstalled(session.user.id);
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 365);
  const startKey = localDateKey(start);
  const todayKey = localDateKey(now);

  const [habits, logs, profiles, details, timingStats, triggers, stacks, experiments, sourceLinks, calendarEvents, routines, goals] = await Promise.all([
    getHabitsByUser(session.user.id),
    getHabitLogsForUser(session.user.id, startKey, todayKey),
    getHabitProfiles(session.user.id),
    getHabitCompletionDetails(session.user.id, startKey, todayKey),
    getHabitTimingStats(session.user.id),
    getHabitTriggers(session.user.id),
    getHabitStacks(session.user.id),
    getHabitExperiments(session.user.id),
    getHabitSourceLinks(session.user.id),
    getCalendarEventsByUser(session.user.id),
    getRoutinesByUser(session.user.id),
    getGoalsByUser(session.user.id),
  ]);

  return (
    <AppShell>
      <HabitsRouteExperience
        initialHabits={habits}
        initialLogs={logs}
        profiles={profiles}
        details={details}
        timingStats={timingStats}
        triggers={triggers}
        stacks={stacks}
        experiments={experiments}
        sourceLinks={sourceLinks}
        calendarEvents={calendarEvents}
        routines={routines}
        goals={goals}
      />
    </AppShell>
  );
}
