import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { calendarEvents, calendarSyncHistory } from '@/db/schema/calendar-events';
import { getUpcomingGoogleEvents } from './calendar-client';

export type CalendarSyncOutcome = { ok: true; status: 'success' | 'partial'; count: number; cancelled: number } | { ok: false; reason: 'not_connected' | 'insufficient_scope' | 'revoked' | 'error' };

export async function syncGoogleCalendar(userId: string): Promise<CalendarSyncOutcome> {
  const historyId = crypto.randomUUID();
  await db.insert(calendarSyncHistory).values({ id: historyId, userId, status: 'running' });
  const result = await getUpcomingGoogleEvents(userId);
  if (!result.ok) {
    await db.update(calendarSyncHistory).set({ status: 'error', errorCode: result.reason, completedAt: new Date() }).where(and(eq(calendarSyncHistory.id, historyId), eq(calendarSyncHistory.userId, userId)));
    return result;
  }
  const syncedAt = new Date();
  let cancelled = 0;
  for (const event of result.events) {
    const isCancelled = event.status === 'cancelled';
    if (isCancelled) cancelled += 1;
    await db.insert(calendarEvents).values({
      userId, title: event.title, description: event.description, startAt: event.startAt, endAt: event.endAt,
      location: event.location, allDay: event.allDay, archived: isCancelled, source: 'google_calendar', editable: false,
      googleEventId: event.id, googleCalendarId: event.calendarId, googleRecurringEventId: event.recurringEventId,
      recurrenceRule: event.recurrenceRule, eventTimezone: event.timezone, syncStatus: event.status, lastSyncedAt: syncedAt,
    }).onConflictDoUpdate({
      target: [calendarEvents.userId, calendarEvents.googleCalendarId, calendarEvents.googleEventId],
      set: { title: event.title, description: event.description, startAt: event.startAt, endAt: event.endAt,
        location: event.location, allDay: event.allDay, archived: isCancelled, googleRecurringEventId: event.recurringEventId,
        recurrenceRule: event.recurrenceRule, eventTimezone: event.timezone, syncStatus: event.status,
        lastSyncedAt: syncedAt, updatedAt: syncedAt },
    });
  }
  const status = result.partial ? 'partial' : 'success';
  await db.update(calendarSyncHistory).set({ status, calendarsRead: result.calendarsRead, eventsRead: result.events.length, eventsUpserted: result.events.length, eventsCancelled: cancelled, completedAt: syncedAt }).where(and(eq(calendarSyncHistory.id, historyId), eq(calendarSyncHistory.userId, userId)));
  return { ok: true, status, count: result.events.length, cancelled };
}

export async function getLatestCalendarSync(userId: string) {
  const [row] = await db.select().from(calendarSyncHistory).where(eq(calendarSyncHistory.userId, userId)).orderBy(desc(calendarSyncHistory.startedAt)).limit(1);
  return row ?? null;
}
