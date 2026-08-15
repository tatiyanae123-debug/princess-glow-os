'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { fitnessSessions, hairLogs, lifeTimelineEvents } from '@/db/schema/completion-v1';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}
function text(formData: FormData, key: string) { return String(formData.get(key) ?? '').trim(); }
function optionalDate(raw: string) { if (!raw) return null; const d = new Date(raw); return Number.isNaN(d.getTime()) ? null : d; }
function numberValue(raw: string, min: number, max?: number) {
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return Math.max(min, max == null ? Math.round(value) : Math.min(max, Math.round(value)));
}

export async function updateHairLogAction(id: string, formData: FormData): Promise<void> {
  const userId = await requireUser();
  const eventType = text(formData, 'eventType');
  if (!eventType) return;
  await db.update(hairLogs).set({
    eventType: eventType.slice(0, 300),
    occurredAt: optionalDate(text(formData, 'occurredAt')) ?? new Date(),
    style: text(formData, 'style').slice(0, 300) || null,
    products: text(formData, 'products').slice(0, 2000) || null,
    heatUsed: formData.get('heatUsed') === 'on',
    notes: text(formData, 'notes').slice(0, 3000) || null,
    nextAction: text(formData, 'nextAction').slice(0, 1000) || null,
  }).where(and(eq(hairLogs.id, id), eq(hairLogs.userId, userId)));
  revalidatePath('/hair');
}

export async function updateFitnessSessionAction(id: string, formData: FormData): Promise<void> {
  const userId = await requireUser();
  const workoutType = text(formData, 'workoutType');
  if (!workoutType) return;
  await db.update(fitnessSessions).set({
    workoutType: workoutType.slice(0, 300),
    occurredAt: optionalDate(text(formData, 'occurredAt')) ?? new Date(),
    durationMinutes: numberValue(text(formData, 'durationMinutes'), 0),
    energy: numberValue(text(formData, 'energy'), 1, 10),
    soreness: numberValue(text(formData, 'soreness'), 1, 10),
    equipment: text(formData, 'equipment').slice(0, 1000) || null,
    notes: text(formData, 'notes').slice(0, 3000) || null,
  }).where(and(eq(fitnessSessions.id, id), eq(fitnessSessions.userId, userId)));
  revalidatePath('/fitness');
}

export async function updateTimelineEventAction(id: string, formData: FormData): Promise<void> {
  const userId = await requireUser();
  const title = text(formData, 'title');
  const category = text(formData, 'category');
  const occurredAt = optionalDate(text(formData, 'occurredAt'));
  if (!title || !category || !occurredAt) return;
  await db.update(lifeTimelineEvents).set({
    title: title.slice(0, 300),
    category: category.slice(0, 300),
    occurredAt,
    summary: text(formData, 'summary').slice(0, 3000) || null,
    relatedEntityType: text(formData, 'relatedEntityType').slice(0, 200) || null,
    relatedEntityId: text(formData, 'relatedEntityId').slice(0, 300) || null,
  }).where(and(eq(lifeTimelineEvents.id, id), eq(lifeTimelineEvents.userId, userId)));
  revalidatePath('/timeline');
}
