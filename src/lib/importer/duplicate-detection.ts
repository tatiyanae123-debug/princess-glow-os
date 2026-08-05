import 'server-only';

import { db } from '@/db';
import { routines } from '@/db/schema/routines';
import { habits } from '@/db/schema/habits';
import { tasks } from '@/db/schema/tasks';
import { beautyRoutines } from '@/db/schema/beauty-routines';
import { calendarEvents } from '@/db/schema/calendar-events';
import { eq, and } from 'drizzle-orm';
import type { ImportTemplate } from '@/lib/glow-content/library';

export function normalizeTitle(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Checks whether a template would duplicate something the user already
 * has. Compares: user (implicit — all queries are user-scoped), normalized
 * title, category, and — for calendar templates — recurrence (days of
 * week) and start time. Read-only, called before any confirmed write.
 */
export async function isDuplicate(userId: string, template: ImportTemplate): Promise<boolean> {
  switch (template.category) {
    case 'routines': {
      const existing = await db.select({ name: routines.name }).from(routines).where(and(eq(routines.userId, userId), eq(routines.archived, false)));
      return existing.some((r) => normalizeTitle(r.name) === normalizeTitle(template.name));
    }
    case 'habits': {
      const existing = await db.select({ name: habits.name }).from(habits).where(and(eq(habits.userId, userId), eq(habits.archived, false)));
      return existing.some((h) => normalizeTitle(h.name) === normalizeTitle(template.name));
    }
    case 'tasks': {
      const existing = await db.select({ title: tasks.title }).from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.archived, false)));
      return existing.some((t) => normalizeTitle(t.title) === normalizeTitle(template.title));
    }
    case 'beauty_routines': {
      const existing = await db
        .select({ name: beautyRoutines.name })
        .from(beautyRoutines)
        .where(and(eq(beautyRoutines.userId, userId), eq(beautyRoutines.archived, false)));
      return existing.some((b) => normalizeTitle(b.name) === normalizeTitle(template.name));
    }
    case 'calendar_templates': {
      const existing = await db
        .select({ title: calendarEvents.title, startAt: calendarEvents.startAt, recurrenceDaysOfWeek: calendarEvents.recurrenceDaysOfWeek })
        .from(calendarEvents)
        .where(and(eq(calendarEvents.userId, userId), eq(calendarEvents.archived, false)));
      return existing.some((e) => {
        if (normalizeTitle(e.title) !== normalizeTitle(template.title)) return false;
        const existingTime = e.startAt.toTimeString().slice(0, 5);
        if (existingTime !== template.startTime) return false;
        const existingDays = new Set(e.recurrenceDaysOfWeek ?? []);
        const templateDays = new Set(template.daysOfWeek);
        if (existingDays.size !== templateDays.size) return false;
        return [...templateDays].every((d) => existingDays.has(d));
      });
    }
    default:
      return false;
  }
}
