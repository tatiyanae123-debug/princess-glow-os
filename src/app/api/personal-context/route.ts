import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getHabitsByUser } from '@/lib/data/habits';
import { getNotesByUser } from '@/lib/data/notes';
import { getGoalsByUser } from '@/lib/data/goals';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getUpcomingGoogleEvents } from '@/lib/google/calendar-client';

export const dynamic = 'force-dynamic';

const NEW_YORK_TZ = 'America/New_York';

function dateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: NEW_YORK_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function tomorrowKey() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return dateKey(tomorrow);
}

function priorityRank(priority: string) {
  if (priority === 'urgent') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ ok: false, reason: 'not_signed_in' }, { status: 401 });
    }

    const [tasks, glowEvents, routines, habits, notes, goals, wellnessEntries, googleResult] = await Promise.all([
      getTasksByUser(userId),
      getCalendarEventsByUser(userId),
      getRoutinesByUser(userId),
      getHabitsByUser(userId),
      getNotesByUser(userId),
      getGoalsByUser(userId),
      getWellnessEntriesByUser(userId),
      getUpcomingGoogleEvents(userId),
    ]);

    const activeTasks = tasks
      .filter((task) => task.status === 'pending' || task.status === 'in_progress')
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === 'in_progress' ? -1 : 1;
        const priorityDiff = priorityRank(b.priority) - priorityRank(a.priority);
        if (priorityDiff !== 0) return priorityDiff;
        const aDue = a.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
        const bDue = b.dueDate?.getTime() ?? Number.POSITIVE_INFINITY;
        return aDue - bDue;
      });

    const normalizedGlowEvents = glowEvents.map((event) => ({
      id: event.id,
      source: 'glow' as const,
      title: event.title,
      startAt: event.startAt,
      endAt: event.endAt,
      allDay: event.allDay,
      location: event.location,
      htmlLink: null as string | null,
    }));

    const normalizedGoogleEvents = googleResult.ok ? googleResult.events : [];
    const mergedEvents = [...normalizedGoogleEvents, ...normalizedGlowEvents]
      .filter((event) => event.startAt.getTime() >= Date.now() - 6 * 60 * 60 * 1000)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
      .filter((event, index, all) => {
        const key = `${event.title.trim().toLowerCase()}|${event.startAt.toISOString().slice(0, 16)}`;
        return all.findIndex((candidate) => `${candidate.title.trim().toLowerCase()}|${candidate.startAt.toISOString().slice(0, 16)}` === key) === index;
      });

    const today = dateKey(new Date());
    const tomorrow = tomorrowKey();
    const wellness = wellnessEntries.find((entry) => entry.entryDate === today) ?? wellnessEntries[0] ?? null;

    const serializeEvent = (event: (typeof mergedEvents)[number]) => ({
      id: event.id,
      source: event.source,
      title: event.title,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt ? event.endAt.toISOString() : null,
      allDay: event.allDay,
      location: event.location,
      htmlLink: event.htmlLink,
    });

    const sourceStatus = googleResult.ok ? 'connected' : googleResult.reason;

    return NextResponse.json({
      ok: true,
      user: {
        name: session.user?.name ?? null,
        email: session.user?.email ?? null,
      },
      tasks: activeTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      })),
      activeTask: activeTasks[0]
        ? {
            id: activeTasks[0].id,
            title: activeTasks[0].title,
            description: activeTasks[0].description,
            status: activeTasks[0].status,
            priority: activeTasks[0].priority,
            dueDate: activeTasks[0].dueDate ? activeTasks[0].dueDate.toISOString() : null,
          }
        : null,
      events: mergedEvents.map(serializeEvent),
      todayEvents: mergedEvents.filter((event) => dateKey(event.startAt) === today).map(serializeEvent),
      tomorrowEvents: mergedEvents.filter((event) => dateKey(event.startAt) === tomorrow).map(serializeEvent),
      routines: routines.map((routine) => ({
        id: routine.id,
        name: routine.name,
        description: routine.description,
        timeOfDay: routine.timeOfDay,
      })),
      habits: habits.map((habit) => ({
        id: habit.id,
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
      })),
      notes: notes.slice(0, 12).map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        pinned: note.pinned,
        updatedAt: note.updatedAt.toISOString(),
      })),
      goals: goals.slice(0, 12).map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status,
        progress: goal.progress,
        targetDate: goal.targetDate ? goal.targetDate.toISOString() : null,
      })),
      wellness: wellness
        ? {
            entryDate: wellness.entryDate,
            mood: wellness.mood,
            energy: wellness.energy,
            sleepHours: wellness.sleepHours,
            waterGlasses: wellness.waterGlasses,
            notes: wellness.notes,
          }
        : null,
      sourceStatus: {
        googleCalendar: sourceStatus,
      },
    });
  } catch (error) {
    console.error('personal-context failed', error);
    return NextResponse.json({ ok: false, reason: 'error' }, { status: 500 });
  }
}
