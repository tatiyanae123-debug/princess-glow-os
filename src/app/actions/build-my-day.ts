'use server';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { rankRecommendations } from '@/lib/intelligence/recommendations';
import { buildScheduleProposal } from '@/lib/intelligence/scheduler';

async function safely<T>(label: string, work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error(`[Glow OS] Build My Day: ${label} unavailable`, error);
    return fallback;
  }
}

export async function buildMyDayAction(mode: 'standard' | 'lighter' = 'standard') {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const now = new Date();

  const context = await safely('personal context', buildPersonalContext(userId, now), null);
  const reminders = await safely('Apple Reminders', getAppleRemindersByUser(userId), []);
  const calendarEvents = await safely('calendar', getCalendarEventsByUser(userId), []);

  const recommendations = rankRecommendations({
    tasks: context?.unfinishedTasks ?? [],
    reminders: reminders.map((item) => ({ id: item.id, title: item.title, dueAt: item.dueAt, completed: item.completed })),
    routines: (context?.routinesForToday ?? []).map((item) => ({ id: item.id, name: item.name, incomplete: true })),
    habits: context?.habits ?? [],
    nextEventAt: context?.nextEvent?.startAt ?? null,
    now,
  });

  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const commitments = calendarEvents
    .filter((event) => event.startAt >= start && event.startAt <= end)
    .map((event) => ({ id: event.id, title: event.title, startAt: event.startAt, endAt: event.endAt }));

  return buildScheduleProposal({ recommendations, commitments, now, mode });
}
