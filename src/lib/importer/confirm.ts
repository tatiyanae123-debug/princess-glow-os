import 'server-only';

import { db } from '@/db';
import { importBatches } from '@/db/schema/imports';
import { routines } from '@/db/schema/routines';
import { habits } from '@/db/schema/habits';
import { tasks } from '@/db/schema/tasks';
import { beautyRoutines } from '@/db/schema/beauty-routines';
import { calendarEvents } from '@/db/schema/calendar-events';
import { eq, and } from 'drizzle-orm';
import { GLOW_OS_SOURCE, GLOW_OS_SOURCE_VERSION } from '@/lib/glow-content/library';
import type { ConfirmImportInput } from '@/lib/validations/importer';

function nextOccurrence(daysOfWeek: string[], startTime: string): Date {
  const weekdayIndex: Record<string, number> = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
  const [hours, minutes] = startTime.split(':').map(Number);
  const now = new Date();
  for (let offset = 0; offset < 7; offset++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(hours, minutes, 0, 0);
    const candidateDay = Object.keys(weekdayIndex).find((d) => weekdayIndex[d] === candidate.getDay());
    if (candidateDay && daysOfWeek.includes(candidateDay) && candidate > now) {
      return candidate;
    }
  }
  // Fallback: one week from now at the requested time.
  const fallback = new Date(now);
  fallback.setDate(now.getDate() + 7);
  fallback.setHours(hours, minutes, 0, 0);
  return fallback;
}

/**
 * Creates real rows for a confirmed import batch. Nothing here runs until
 * the user has already reviewed and approved the preview — this is the
 * only function in the importer that writes to routines/habits/tasks/
 * beauty_routines/calendar_events.
 */
export async function confirmImportBatch(userId: string, input: ConfirmImportInput) {
  const [batch] = await db
    .insert(importBatches)
    .values({
      userId,
      source: GLOW_OS_SOURCE,
      sourceVersion: GLOW_OS_SOURCE_VERSION,
      category: input.batchCategory,
      status: 'confirmed',
      summary: `${input.items.length} item(s) imported`,
      confirmedAt: new Date(),
    })
    .returning();

  const provenance = { source: GLOW_OS_SOURCE, sourceVersion: GLOW_OS_SOURCE_VERSION, importBatchId: batch.id, editable: true };

  for (const item of input.items) {
    if (item.category === 'routines') {
      await db.insert(routines).values({ userId, name: item.name, description: item.description, timeOfDay: item.timeOfDay, daysOfWeek: item.daysOfWeek, ...provenance });
    } else if (item.category === 'habits') {
      await db.insert(habits).values({ userId, name: item.name, description: item.description, frequency: item.frequency, ...provenance });
    } else if (item.category === 'tasks') {
      await db.insert(tasks).values({ userId, title: item.title, description: item.description, ...provenance });
    } else if (item.category === 'beauty_routines') {
      await db.insert(beautyRoutines).values({ userId, name: item.name, timeOfDay: item.timeOfDay, products: item.products, ...provenance });
    } else if (item.category === 'calendar_templates') {
      const startAt = nextOccurrence(item.daysOfWeek, item.startTime);
      const endAt = new Date(startAt.getTime() + item.durationMinutes * 60000);
      await db.insert(calendarEvents).values({
        userId,
        title: item.title,
        description: item.description,
        startAt,
        endAt,
        allDay: false,
        recurrenceDaysOfWeek: item.daysOfWeek,
        ...provenance,
      });
    }
  }

  return batch;
}

/**
 * Reverts a confirmed batch: archives every row created by it (soft-delete,
 * same mechanism as normal deletes elsewhere in the app) and marks the
 * batch 'undone'. Never touches rows outside this batch.
 */
export async function undoImportBatch(userId: string, batchId: string) {
  const [batch] = await db
    .select()
    .from(importBatches)
    .where(and(eq(importBatches.id, batchId), eq(importBatches.userId, userId)));
  if (!batch || batch.status !== 'confirmed') return null;

  await Promise.all([
    db.update(routines).set({ archived: true }).where(and(eq(routines.userId, userId), eq(routines.importBatchId, batchId))),
    db.update(habits).set({ archived: true }).where(and(eq(habits.userId, userId), eq(habits.importBatchId, batchId))),
    db.update(tasks).set({ archived: true }).where(and(eq(tasks.userId, userId), eq(tasks.importBatchId, batchId))),
    db.update(beautyRoutines).set({ archived: true }).where(and(eq(beautyRoutines.userId, userId), eq(beautyRoutines.importBatchId, batchId))),
    db.update(calendarEvents).set({ archived: true }).where(and(eq(calendarEvents.userId, userId), eq(calendarEvents.importBatchId, batchId))),
  ]);

  const [updated] = await db
    .update(importBatches)
    .set({ status: 'undone', undoneAt: new Date() })
    .where(and(eq(importBatches.id, batchId), eq(importBatches.userId, userId)))
    .returning();

  return updated;
}

export async function getImportBatchesByUser(userId: string) {
  return db.select().from(importBatches).where(eq(importBatches.userId, userId)).orderBy(importBatches.createdAt);
}
