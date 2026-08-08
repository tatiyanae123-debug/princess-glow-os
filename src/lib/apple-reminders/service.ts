import 'server-only';

import { createHash, randomBytes } from 'crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { appleReminderConnections, appleReminders } from '@/db/schema/intelligence-expansion';
import type { AppleReminderImport } from '@/lib/validations/apple-reminders';

function hashKey(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export async function prepareAppleReminderBridge(userId: string) {
  const key = `glow_${randomBytes(24).toString('base64url')}`;
  const tokenHash = hashKey(key);
  await db.insert(appleReminderConnections).values({ userId, tokenHash, status: 'ready' }).onConflictDoUpdate({
    target: appleReminderConnections.userId,
    set: { tokenHash, status: 'ready', lastError: null, updatedAt: new Date() },
  });
  return key;
}

export async function getAppleReminderConnection(userId: string) {
  const [row] = await db.select().from(appleReminderConnections).where(eq(appleReminderConnections.userId, userId));
  return row ?? null;
}

export async function resolveBridgeUser(bearerKey: string) {
  const [row] = await db.select({ userId: appleReminderConnections.userId }).from(appleReminderConnections).where(eq(appleReminderConnections.tokenHash, hashKey(bearerKey)));
  return row?.userId ?? null;
}

export async function importAppleReminders(userId: string, payload: AppleReminderImport) {
  const now = new Date();
  let imported = 0;
  for (const reminder of payload.reminders) {
    await db.insert(appleReminders).values({
      userId,
      externalId: reminder.externalId,
      listName: reminder.listName,
      title: reminder.title,
      notes: reminder.notes ?? null,
      dueAt: reminder.dueAt ? new Date(reminder.dueAt) : null,
      completed: reminder.completed,
      lastSyncedAt: now,
      importAudit: { importedAt: now.toISOString(), source: 'iphone_shortcuts' },
    }).onConflictDoUpdate({
      target: [appleReminders.userId, appleReminders.externalId],
      set: {
        listName: reminder.listName,
        title: reminder.title,
        notes: reminder.notes ?? null,
        dueAt: reminder.dueAt ? new Date(reminder.dueAt) : null,
        completed: reminder.completed,
        lastSyncedAt: now,
        importAudit: { importedAt: now.toISOString(), source: 'iphone_shortcuts' },
      },
    });
    imported += 1;
  }
  await db.update(appleReminderConnections).set({ status: 'connected', lastImportedAt: now, lastError: null, updatedAt: now }).where(eq(appleReminderConnections.userId, userId));
  return { imported };
}

export async function getAppleRemindersByUser(userId: string) {
  return db.select().from(appleReminders).where(eq(appleReminders.userId, userId)).orderBy(desc(appleReminders.dueAt));
}
