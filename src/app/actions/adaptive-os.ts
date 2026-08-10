'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { lifeMemories } from '@/db/schema/intelligence-expansion';
import { lifeTimelineEvents } from '@/db/schema/completion-v1';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  addInboxItem,
  finishFocusSession,
  getTodayReview,
  markInboxProcessed,
  setActiveLifeMode,
  startFocusSession,
  upsertDayReview,
} from '@/lib/intelligence/adaptive-os';
import { routeInboxItem } from '@/lib/intelligence/inbox-routing';

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

export async function setLifeModeAction(modeId: string) {
  const userId = await requireUserId();
  await setActiveLifeMode(userId, modeId);
  revalidatePath('/today');
  revalidatePath('/dashboard');
  return { ok: true };
}

export async function addInboxItemAction(rawText: string) {
  const userId = await requireUserId();
  const trimmed = rawText.trim();
  if (!trimmed) return { error: 'Add something before sending it to Glow Inbox.' };
  const item = await addInboxItem(userId, trimmed);
  revalidatePath('/inbox');
  revalidatePath('/today');
  return { data: item };
}

export async function addInboxItemFormAction(formData: FormData) {
  const rawText = String(formData.get('rawText') ?? '');
  return addInboxItemAction(rawText);
}

export async function routeInboxItemAction(itemId: string) {
  const userId = await requireUserId();
  const item = await routeInboxItem(userId, itemId);
  revalidatePath('/inbox');
  revalidatePath('/today');
  revalidatePath('/tasks');
  revalidatePath('/notes');
  revalidatePath('/goals');
  return { data: item };
}

export async function markInboxProcessedAction(itemId: string) {
  const userId = await requireUserId();
  const item = await markInboxProcessed(userId, itemId);
  revalidatePath('/inbox');
  revalidatePath('/today');
  return { data: item };
}

export async function startFocusSessionAction(entityType: string, entityId: string, title: string, plannedMinutes = 25) {
  const userId = await requireUserId();
  const session = await startFocusSession(userId, entityType, entityId, title, plannedMinutes);
  revalidatePath('/today');
  return { data: session };
}

export async function finishFocusSessionAction(sessionId: string, outcome?: string, notes?: string) {
  const userId = await requireUserId();
  const session = await finishFocusSession(userId, sessionId, outcome, notes);
  revalidatePath('/today');
  return { data: session };
}

export async function finishFocusSessionFormAction(sessionId: string, formData: FormData) {
  const outcome = String(formData.get('outcome') ?? 'completed');
  const notes = String(formData.get('notes') ?? '');
  return finishFocusSessionAction(sessionId, outcome, notes || undefined);
}

export async function finishDayAction(input: { energy?: number; mood?: string; completedSummary?: string; movedSummary?: string; memoryNote?: string; tomorrowTopThree?: string[] }) {
  const userId = await requireUserId();
  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const before = await getTodayReview(userId, dateKey);
  const review = await upsertDayReview(userId, dateKey, input);

  if (input.memoryNote && input.memoryNote !== before?.memoryNote) {
    const title = `Daily memory · ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    const [memory] = await db.insert(lifeMemories).values({
      userId,
      category: 'daily-life',
      source: 'day_review',
      title,
      summary: input.memoryNote,
      sourceDate: now,
      relatedArea: 'Today',
      confidence: 1,
      privacyLevel: 'private',
    }).returning();
    await db.insert(lifeTimelineEvents).values({
      userId,
      category: 'memory',
      title,
      occurredAt: now,
      summary: input.memoryNote,
      relatedEntityType: 'life_memory',
      relatedEntityId: memory.id,
    });
  }

  revalidatePath('/today');
  revalidatePath('/memory');
  revalidatePath('/timeline');
  return { data: review };
}

export async function finishDayFormAction(formData: FormData) {
  const energyRaw = Number(formData.get('energy') ?? 0);
  const topThree = [1, 2, 3].map((index) => String(formData.get(`tomorrow${index}`) ?? '').trim()).filter(Boolean);
  return finishDayAction({
    energy: Number.isFinite(energyRaw) && energyRaw > 0 ? Math.min(10, Math.max(1, energyRaw)) : undefined,
    mood: String(formData.get('mood') ?? '').trim() || undefined,
    completedSummary: String(formData.get('completedSummary') ?? '').trim() || undefined,
    movedSummary: String(formData.get('movedSummary') ?? '').trim() || undefined,
    memoryNote: String(formData.get('memoryNote') ?? '').trim() || undefined,
    tomorrowTopThree: topThree,
  });
}
