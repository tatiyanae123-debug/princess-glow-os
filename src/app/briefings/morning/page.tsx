import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { MorningIntelligenceBriefing } from '@/components/briefings/morning-intelligence-briefing';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getLifeModes } from '@/lib/intelligence/adaptive-os';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';
import { routinesForDate, workoutForDate } from '@/lib/personal-os/source-of-truth';

export const dynamic = 'force-dynamic';

export default async function MorningBriefPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  await ensurePersonalOsInstalled(userId);

  const [tasks, events, wellnessEntries, modes] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getWellnessEntriesByUser(userId),
    getLifeModes(userId),
  ]);

  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const activeMode = modes.find((mode) => mode.isActive);
  const todayEvents = events
    .filter((event) => event.startAt.toISOString().slice(0, 10) === todayKey)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const openTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const scheduledRoutines = routinesForDate(now);
  const morning = scheduledRoutines.find((routine) => routine.key === 'morning-ritual') ?? null;
  const workout = workoutForDate(now);
  const wellness = wellnessEntries[0] ?? null;

  return (
    <AppShell>
      <MorningIntelligenceBriefing
        modeName={activeMode?.name ?? 'Normal Day'}
        tasks={openTasks.map((task) => ({
          id: task.id,
          title: task.title,
          priority: task.priority,
          dueDate: task.dueDate?.toISOString() ?? null,
        }))}
        events={todayEvents.map((event) => ({
          id: event.id,
          title: event.title,
          startAt: event.startAt.toISOString(),
          allDay: event.allDay,
        }))}
        energy={wellness?.energy ?? null}
        morningRoutine={morning ? {
          key: morning.key,
          name: morning.name,
          steps: morning.steps.map((step) => ({ title: step.title })),
        } : null}
        workout={{ name: workout.name, purpose: workout.purpose }}
      />
    </AppShell>
  );
}
