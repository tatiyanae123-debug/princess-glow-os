import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { TodayOpticalCenter } from '@/components/today-optical-center';
import { getTasksByUser } from '@/lib/data/tasks';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

function levelToNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const normalized = value.toLowerCase();
  const scale: Record<string, number> = {
    exhausted: 3,
    very_low: 3,
    low: 4,
    okay: 5,
    neutral: 5,
    medium: 6,
    good: 7,
    high: 8,
    great: 9,
    excellent: 9,
  };
  return scale[normalized] ?? null;
}

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const now = new Date();
  const [tasks, wellnessEntries, beautyRoutines, events] = await Promise.all([
    getTasksByUser(userId),
    getWellnessEntriesByUser(userId),
    getBeautyRoutinesByUser(userId),
    getCalendarEventsByUser(userId),
  ]);

  const openTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  const nearbyEvents = events
    .filter((event) => event.startAt >= start && event.startAt < end)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const latestWellness = wellnessEntries[0] ?? null;
  const routines = beautyRoutines
    .filter((routine) => ['morning', 'afternoon', 'evening', 'night'].includes(routine.timeOfDay))
    .slice(0, 12);

  return (
    <TodayOpticalCenter
      tasks={openTasks.slice(0, 20).map((task) => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        dueDateISO: task.dueDate?.toISOString() ?? null,
      }))}
      events={nearbyEvents.slice(0, 24).map((event) => ({
        id: event.id,
        title: event.title,
        location: event.location,
        startAtISO: event.startAt.toISOString(),
        allDay: event.allDay,
      }))}
      routines={routines.map((routine) => ({
        id: routine.id,
        name: routine.name,
        timeOfDay: routine.timeOfDay,
      }))}
      energy={levelToNumber(latestWellness?.energy)}
      mood={levelToNumber(latestWellness?.mood)}
      sleepHours={latestWellness?.sleepHours ?? null}
    />
  );
}
