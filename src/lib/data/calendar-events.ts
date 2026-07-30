import { db } from '@/db';
import { calendarEvents } from '@/db/schema/calendar-events';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateCalendarEventInput, UpdateCalendarEventInput } from '@/lib/validations/calendar-events';

export async function getCalendarEventsByUser(userId: string) {
  return db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.userId, userId), eq(calendarEvents.archived, false)))
    .orderBy(desc(calendarEvents.startAt));
}

export async function getCalendarEventById(id: string, userId: string) {
  const [event] = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)));
  return event ?? null;
}

export async function createCalendarEvent(userId: string, data: CreateCalendarEventInput) {
  const [event] = await db
    .insert(calendarEvents)
    .values({ ...data, userId })
    .returning();
  return event;
}

export async function updateCalendarEvent(id: string, userId: string, data: UpdateCalendarEventInput) {
  const [event] = await db
    .update(calendarEvents)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
    .returning();
  return event ?? null;
}

export async function deleteCalendarEvent(id: string, userId: string) {
  const [event] = await db
    .update(calendarEvents)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
    .returning();
  return event ?? null;
}
