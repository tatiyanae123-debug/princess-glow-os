'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { rankRecommendations } from '@/lib/intelligence/recommendations';
import { buildScheduleProposal } from '@/lib/intelligence/scheduler';
import { setV3DayMode } from '@/lib/intelligence/day-mode-adaptive';
import type { GlowDayMode } from '@/lib/day-mode';

const MODE_PATHS=['/today','/dashboard','/planning','/calendar','/tasks','/routines','/habits','/fitness','/wellness','/food','/beauty','/hair','/maintenance','/brain','/briefings','/day-mode'] as const;

async function requireUserId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}

async function buildFor(userId:string,mode:GlowDayMode){
  const now = new Date();
  const [context, reminders, calendarEvents] = await Promise.all([
    buildPersonalContext(userId, now),
    getAppleRemindersByUser(userId).catch(() => []),
    getCalendarEventsByUser(userId),
  ]);
  const recommendations = rankRecommendations({
    tasks: context.unfinishedTasks,
    reminders: reminders.map(item => ({ id: item.id, title: item.title, dueAt: item.dueAt, completed: item.completed })),
    routines: context.routinesForToday.map(item => ({ id: item.id, name: item.name, incomplete: true })),
    habits: context.habits,
    nextEventAt: context.nextEvent?.startAt ?? null,
    now,
  });
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  const commitments = calendarEvents
    .filter(event => event.startAt >= start && event.startAt <= end)
    .map(event => ({ id: event.id, title: event.title, startAt: event.startAt, endAt: event.endAt }));
  return buildScheduleProposal({ recommendations, commitments, now, mode });
}

export async function buildMyDayV3Action(mode:GlowDayMode){return buildFor(await requireUserId(),mode);}

export async function activateDayModeV3Action(mode:GlowDayMode){
 const userId=await requireUserId();
 await setV3DayMode(userId,mode);
 const proposal=await buildFor(userId,mode);
 for(const path of MODE_PATHS)revalidatePath(path);
 return proposal;
}
