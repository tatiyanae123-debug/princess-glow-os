import 'server-only';

import { createHash, randomBytes } from 'crypto';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { reminderSyncTokens } from '@/db/schema/reminder-sync';
import type { AppleReminderInput } from '@/lib/validations/apple-reminders';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function rotateReminderSyncToken(userId: string) {
  const token = `glow_rem_${randomBytes(32).toString('base64url')}`;
  const tokenHash = hashToken(token);
  const now = new Date();

  await db
    .insert(reminderSyncTokens)
    .values({ userId, tokenHash, createdAt: now, rotatedAt: now })
    .onConflictDoUpdate({
      target: reminderSyncTokens.userId,
      set: { tokenHash, rotatedAt: now },
    });

  return token;
}

export async function hasReminderSyncToken(userId: string) {
  const [row] = await db
    .select({ userId: reminderSyncTokens.userId, lastUsedAt: reminderSyncTokens.lastUsedAt })
    .from(reminderSyncTokens)
    .where(eq(reminderSyncTokens.userId, userId));
  return row ?? null;
}

export async function authenticateReminderSyncToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const [row] = await db
    .select({ userId: reminderSyncTokens.userId })
    .from(reminderSyncTokens)
    .where(eq(reminderSyncTokens.tokenHash, tokenHash));
  return row?.userId ?? null;
}

export async function syncAppleReminders(userId: string, reminders: AppleReminderInput[]) {
  const syncedAt = new Date();
  let upserted = 0;
  let completed = 0;

  for (const reminder of reminders) {
    const isCompleted = reminder.completed;
    if (isCompleted) completed += 1;
    const completedAt = isCompleted
      ? reminder.completedAt
        ? new Date(reminder.completedAt)
        : syncedAt
      : null;
    const dueDate = reminder.dueDate ? new Date(reminder.dueDate) : null;

    await db
      .insert(tasks)
      .values({
        userId,
        title: reminder.title,
        description: reminder.notes ?? null,
        status: isCompleted ? 'done' : 'pending',
        dueDate,
        completedAt,
        archived: false,
        source: 'apple_reminders',
        sourceVersion: 'shortcuts_v1',
        sourceExternalId: reminder.id,
        sourceListName: reminder.list ?? null,
        lastSyncedAt: syncedAt,
        editable: false,
      })
      .onConflictDoUpdate({
        target: [tasks.userId, tasks.source, tasks.sourceExternalId],
        set: {
          title: reminder.title,
          description: reminder.notes ?? null,
          status: isCompleted ? 'done' : 'pending',
          dueDate,
          completedAt,
          sourceListName: reminder.list ?? null,
          lastSyncedAt: syncedAt,
          updatedAt: syncedAt,
        },
      });
    upserted += 1;
  }

  await db
    .update(reminderSyncTokens)
    .set({ lastUsedAt: syncedAt })
    .where(eq(reminderSyncTokens.userId, userId));

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.source, 'apple_reminders')));

  return { upserted, completed, totalAppleReminders: count, syncedAt };
}
