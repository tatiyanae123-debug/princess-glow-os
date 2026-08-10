'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  addInboxItem,
  finishFocusSession,
  markInboxProcessed,
  setActiveLifeMode,
  startFocusSession,
  upsertDayReview,
} from '@/lib/intelligence/adaptive-os';

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
  const dateKey = new Date().toISOString().slice(0, 10);
  const review = await upsertDayReview(userId, dateKey, input);
  revalidatePath('/today');
  revalidatePath('/timeline');
  return { data: review };
}

export async function finishDayFormAction(formData: FormData) {
  const energyRaw = Number(formData.get('energy') ?? 0);
  const topThree = [1, 2, 3]
    .map((index) => String(formData.get(`tomorrow${index}`) ?? '').trim())
    .filter(Boolean);
  return finishDayAction({
    energy: Number.isFinite(energyRaw) && energyRaw > 0 ? Math.min(10, Math.max(1, energyRaw)) : undefined,
    mood: String(formData.get('mood') ?? '').trim() || undefined,
    completedSummary: String(formData.get('completedSummary') ?? '').trim() || undefined,
    movedSummary: String(formData.get('movedSummary') ?? '').trim() || undefined,
    memoryNote: String(formData.get('memoryNote') ?? '').trim() || undefined,
    tomorrowTopThree: topThree,
  });
}
