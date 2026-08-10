import 'server-only';

import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { glowInboxItems } from '@/db/schema/adaptive-os';
import { tasks } from '@/db/schema/tasks';
import { notes } from '@/db/schema/notes';
import { goals } from '@/db/schema/goals';

export async function routeInboxItem(userId: string, itemId: string) {
  const rows = await db.select().from(glowInboxItems).where(and(eq(glowInboxItems.id, itemId), eq(glowInboxItems.userId, userId))).limit(1);
  const item = rows[0];
  if (!item || item.status !== 'unprocessed') return null;

  const suggestedType = item.suggestedType ?? 'note';
  const title = (item.suggestedTitle || item.rawText).slice(0, 300);
  let routedEntityType = 'note';
  let routedEntityId: string | undefined;

  if (suggestedType === 'task' || suggestedType === 'shopping' || suggestedType === 'calendar') {
    const [created] = await db.insert(tasks).values({
      userId,
      title: suggestedType === 'calendar' ? `Schedule: ${title}` : title,
      description: item.rawText,
      priority: suggestedType === 'calendar' ? 'high' : 'medium',
      source: 'glow_inbox',
    }).returning();
    routedEntityType = 'task';
    routedEntityId = created.id;
  } else if (suggestedType === 'goal') {
    const [created] = await db.insert(goals).values({
      userId,
      title,
      description: item.rawText,
      category: 'personal',
      status: 'not_started',
    }).returning();
    routedEntityType = 'goal';
    routedEntityId = created.id;
  } else {
    const [created] = await db.insert(notes).values({
      userId,
      title,
      content: item.rawText,
      tags: ['glow-inbox', suggestedType],
    }).returning();
    routedEntityType = 'note';
    routedEntityId = created.id;
  }

  const [processed] = await db.update(glowInboxItems).set({
    status: 'processed',
    routedEntityType,
    routedEntityId,
    processedAt: new Date(),
  }).where(and(eq(glowInboxItems.id, itemId), eq(glowInboxItems.userId, userId))).returning();

  return processed;
}
