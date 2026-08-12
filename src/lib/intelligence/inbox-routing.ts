import 'server-only';

import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { entityRelations, glowInboxItems } from '@/db/schema/adaptive-os';
import { tasks } from '@/db/schema/tasks';
import { notes } from '@/db/schema/notes';
import { goals } from '@/db/schema/goals';
import { calendarEvents } from '@/db/schema/calendar-events';
import { financeEntries } from '@/db/schema/finance-entries';
import { projects } from '@/db/schema/intelligence-expansion';
import { glowEntities, universalIntakeArtifacts } from '@/db/schema/interconnected-os';
import { getSuggestedInboxDestination, type InboxRouteDestination } from '@/lib/intelligence/inbox-routing-options';

function parseMetadata(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function parseExtracted(metadata: Record<string, unknown>) {
  const value = metadata.extracted;
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function parseDateTime(dateText: unknown, timeText: unknown) {
  if (typeof dateText !== 'string') return null;
  const raw = `${dateText} ${typeof timeText === 'string' ? timeText : '9:00 AM'}`;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  if (!/\d{4}/.test(dateText) && date.getTime() < Date.now() - 86400000) date.setFullYear(date.getFullYear() + 1);
  return date;
}

export async function routeInboxItem(userId: string, itemId: string, requestedDestination?: InboxRouteDestination) {
  const rows = await db.select().from(glowInboxItems).where(and(eq(glowInboxItems.id, itemId), eq(glowInboxItems.userId, userId))).limit(1);
  const item = rows[0];
  if (!item || item.status !== 'unprocessed') return null;

  const suggestedType = item.suggestedType ?? 'note';
  const destination = requestedDestination ?? getSuggestedInboxDestination(suggestedType);
  const title = (item.suggestedTitle || item.rawText).slice(0, 300);
  const metadata = parseMetadata(item.metadata);
  const extracted = parseExtracted(metadata);
  let routedEntityType = 'note';
  let routedEntityId: string | undefined;
  let routedTitle = title;

  if (destination === 'task') {
    const [created] = await db.insert(tasks).values({
      userId,
      title,
      description: item.rawText,
      priority: suggestedType === 'reminder' ? 'high' : 'medium',
      source: 'glow_inbox',
    }).returning();
    routedEntityType = 'task';
    routedEntityId = created.id;
  } else if (destination === 'calendar') {
    const startAt = parseDateTime(extracted.dateText, extracted.timeText);
    if (startAt) {
      const endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
      const [created] = await db.insert(calendarEvents).values({ userId, title, description: item.rawText, startAt, endAt, source: 'glow_inbox' }).returning();
      routedEntityType = 'calendar_event';
      routedEntityId = created.id;
    } else {
      const [created] = await db.insert(tasks).values({ userId, title: `Schedule: ${title}`, description: item.rawText, priority: 'high', source: 'glow_inbox' }).returning();
      routedEntityType = 'task';
      routedEntityId = created.id;
      routedTitle = `Schedule: ${title}`;
    }
  } else if (destination === 'goal') {
    const [created] = await db.insert(goals).values({ userId, title, description: item.rawText, category: 'personal', status: 'not_started' }).returning();
    routedEntityType = 'goal';
    routedEntityId = created.id;
  } else if (destination === 'project') {
    const [created] = await db.insert(projects).values({ userId, title, area: suggestedType === 'career' ? 'Career' : 'Universal Intake', status: 'active', priority: 'medium', progress: 0, nextAction: item.rawText }).returning();
    routedEntityType = 'project';
    routedEntityId = created.id;
  } else if (destination === 'finance' && typeof extracted.amount === 'number' && Number.isFinite(extracted.amount)) {
    const date = typeof extracted.dateText === 'string' ? new Date(extracted.dateText) : new Date();
    const entryDate = Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
    const lower = item.rawText.toLowerCase();
    const category = /beauty|sephora|ulta|skincare|makeup|hair/.test(lower) ? 'beauty' : /food|restaurant|grocery/.test(lower) ? 'food' : 'shopping';
    const [created] = await db.insert(financeEntries).values({ userId, title, amount: extracted.amount.toFixed(2), type: 'expense', category, entryDate, notes: item.rawText }).returning();
    routedEntityType = 'finance_entry';
    routedEntityId = created.id;
  } else {
    const tags = ['glow-inbox', suggestedType, requestedDestination ? `reviewed-${requestedDestination}` : 'auto-routed'];
    const [created] = await db.insert(notes).values({ userId, title, content: item.rawText, tags }).returning();
    routedEntityType = 'note';
    routedEntityId = created.id;
  }

  const [processed] = await db.update(glowInboxItems).set({ status: 'processed', routedEntityType, routedEntityId, processedAt: new Date() }).where(and(eq(glowInboxItems.id, itemId), eq(glowInboxItems.userId, userId))).returning();

  if (routedEntityId) {
    const [entity] = await db.insert(glowEntities).values({
      userId,
      entityType: routedEntityType,
      sourceTable: routedEntityType,
      sourceId: routedEntityId,
      title: routedTitle,
      summary: item.rawText.slice(0, 500),
      searchableText: item.rawText,
      metadata: { createdFrom: 'glow_inbox', inboxItemId: item.id, suggestedType, requestedDestination: requestedDestination ?? null },
    }).onConflictDoNothing().returning();

    await db.insert(entityRelations).values({
      userId,
      fromType: 'glow_inbox_item',
      fromId: item.id,
      relation: 'created_from',
      toType: routedEntityType,
      toId: routedEntityId,
      metadata: { confidence: item.confidence, requestedDestination: requestedDestination ?? null },
    });

    const artifacts = await db.select({ id: universalIntakeArtifacts.id }).from(universalIntakeArtifacts).where(and(eq(universalIntakeArtifacts.userId, userId), eq(universalIntakeArtifacts.inboxItemId, item.id))).limit(1);
    if (artifacts[0]) {
      await db.insert(entityRelations).values({ userId, fromType: 'intake_artifact', fromId: artifacts[0].id, relation: 'created', toType: routedEntityType, toId: routedEntityId, metadata: { requestedDestination: requestedDestination ?? null } });
    }

    void entity;
  }

  return processed;
}
