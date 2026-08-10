'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/db';
import {
  aiProposals,
  auditEvents,
  beautyProducts,
  briefingSnapshots,
  closetItems,
  financeGoals,
  fitnessSessions,
  hairLogs,
  intelligentObservations,
  lifeTimelineEvents,
  planningPeriods,
} from '@/db/schema/completion-v1';
import { buildPersonalContext } from '@/lib/intelligence/context';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function optionalDate(raw: string) {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

const shortText = z.string().trim().min(1).max(300);
const planningLevel = z.enum(['today', 'week', 'quarter', 'year', 'book', 'bucket']);

export async function createPlanningPeriodAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const parsed = z.object({ level: planningLevel, title: shortText, focus: z.string().max(2000).optional() }).safeParse({ level: value(formData, 'level'), title: value(formData, 'title'), focus: value(formData, 'focus') || undefined });
  if (!parsed.success) return;
  await db.insert(planningPeriods).values({
    userId,
    ...parsed.data,
    startsAt: optionalDate(value(formData, 'startsAt')),
    endsAt: optionalDate(value(formData, 'endsAt')),
  });
  revalidatePath('/planning');
}

export async function updatePlanningPeriodAction(id: string, formData: FormData): Promise<void> {
  const userId = await requireUser();
  const rawProgress = Number(value(formData, 'progress'));
  const progress = Number.isFinite(rawProgress) ? Math.max(0, Math.min(100, Math.round(rawProgress))) : 0;
  await db.update(planningPeriods).set({
    focus: value(formData, 'focus').slice(0, 2000) || null,
    reflection: value(formData, 'reflection').slice(0, 3000) || null,
    progress,
    startsAt: optionalDate(value(formData, 'startsAt')),
    endsAt: optionalDate(value(formData, 'endsAt')),
    updatedAt: new Date(),
  }).where(and(eq(planningPeriods.id, id), eq(planningPeriods.userId, userId)));
  revalidatePath('/planning');
}

export async function archivePlanningPeriodAction(id: string): Promise<void> {
  const userId = await requireUser();
  await db.update(planningPeriods).set({ archived: true, updatedAt: new Date() }).where(and(eq(planningPeriods.id, id), eq(planningPeriods.userId, userId)));
  revalidatePath('/planning');
}

export async function createAiProposalAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const parsed = z.object({ intent: shortText, summary: z.string().trim().min(1).max(1000), reason: z.string().trim().min(1).max(2000) }).safeParse({ intent: value(formData, 'intent'), summary: value(formData, 'summary'), reason: value(formData, 'reason') });
  if (!parsed.success) return;
  await db.insert(aiProposals).values({ userId, ...parsed.data, confidence: 0.75, reversible: true, payload: {} });
  revalidatePath('/concierge');
}

export async function decideAiProposalAction(id: string, decision: 'approved' | 'rejected') {
  const userId = await requireUser();
  const [proposal] = await db.select().from(aiProposals).where(and(eq(aiProposals.id, id), eq(aiProposals.userId, userId))).limit(1);
  if (!proposal || proposal.status !== 'pending') return;
  const now = new Date();
  await db.update(aiProposals).set({ status: decision, decidedAt: now }).where(and(eq(aiProposals.id, id), eq(aiProposals.userId, userId)));
  await db.insert(auditEvents).values({ userId, action: `ai_proposal_${decision}`, entityType: 'ai_proposal', entityId: id, details: { intent: proposal.intent, summary: proposal.summary } });
  revalidatePath('/concierge');
}

export async function createObservationAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const parsed = z.object({ category: shortText, title: shortText, evidence: z.string().trim().min(1).max(3000), timeWindow: z.string().trim().min(1).max(200) }).safeParse({ category: value(formData, 'category'), title: value(formData, 'title'), evidence: value(formData, 'evidence'), timeWindow: value(formData, 'timeWindow') });
  if (!parsed.success) return;
  await db.insert(intelligentObservations).values({ userId, ...parsed.data, confidence: 0.7 });
  revalidatePath('/observations');
}

export async function setObservationStatusAction(id: string, status: 'dismissed' | 'active') {
  const userId = await requireUser();
  await db.update(intelligentObservations).set({ status }).where(and(eq(intelligentObservations.id, id), eq(intelligentObservations.userId, userId)));
  revalidatePath('/observations');
}

export async function createBeautyProductAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const parsed = z.object({ name: shortText, category: shortText }).safeParse({ name: value(formData, 'name'), category: value(formData, 'category') });
  if (!parsed.success) return;
  const cost = Number(value(formData, 'cost'));
  await db.insert(beautyProducts).values({ userId, ...parsed.data, ingredients: value(formData, 'ingredients') || null, routinePosition: value(formData, 'routinePosition') || null, reaction: value(formData, 'reaction') || null, repurchase: value(formData, 'repurchase') || null, usageFrequency: value(formData, 'usageFrequency') || null, openedAt: optionalDate(value(formData, 'openedAt')), expiresAt: optionalDate(value(formData, 'expiresAt')), costCents: Number.isFinite(cost) && cost >= 0 ? Math.round(cost * 100) : null });
  revalidatePath('/beauty/lab');
}

export async function createHairLogAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const eventType = value(formData, 'eventType');
  if (!shortText.safeParse(eventType).success) return;
  await db.insert(hairLogs).values({ userId, eventType, occurredAt: optionalDate(value(formData, 'occurredAt')) ?? new Date(), style: value(formData, 'style') || null, products: value(formData, 'products') || null, heatUsed: value(formData, 'heatUsed') === 'on', notes: value(formData, 'notes') || null, nextAction: value(formData, 'nextAction') || null });
  revalidatePath('/hair');
}

export async function createFitnessSessionAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const workoutType = value(formData, 'workoutType');
  if (!shortText.safeParse(workoutType).success) return;
  const duration = Number(value(formData, 'durationMinutes'));
  const energy = Number(value(formData, 'energy'));
  const soreness = Number(value(formData, 'soreness'));
  await db.insert(fitnessSessions).values({ userId, workoutType, occurredAt: optionalDate(value(formData, 'occurredAt')) ?? new Date(), durationMinutes: Number.isFinite(duration) ? Math.max(0, Math.round(duration)) : null, energy: Number.isFinite(energy) ? Math.max(1, Math.min(10, Math.round(energy))) : null, soreness: Number.isFinite(soreness) ? Math.max(1, Math.min(10, Math.round(soreness))) : null, equipment: value(formData, 'equipment') || null, notes: value(formData, 'notes') || null });
  revalidatePath('/fitness');
}

export async function createClosetItemAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const parsed = z.object({ name: shortText, category: shortText }).safeParse({ name: value(formData, 'name'), category: value(formData, 'category') });
  if (!parsed.success) return;
  const price = Number(value(formData, 'purchasePrice'));
  await db.insert(closetItems).values({ userId, ...parsed.data, season: value(formData, 'season') || null, weatherTags: value(formData, 'weatherTags') || null, purchaseDate: optionalDate(value(formData, 'purchaseDate')), purchasePriceCents: Number.isFinite(price) && price >= 0 ? Math.round(price * 100) : null, laundryState: value(formData, 'laundryState') || 'clean', favorite: value(formData, 'favorite') === 'on' });
  revalidatePath('/closet');
}

export async function createFinanceGoalAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const name = value(formData, 'name');
  const goalType = value(formData, 'goalType');
  const target = Number(value(formData, 'target'));
  const current = Number(value(formData, 'current'));
  if (!shortText.safeParse(name).success || !shortText.safeParse(goalType).success || !Number.isFinite(target) || target <= 0) return;
  await db.insert(financeGoals).values({ userId, name, goalType, targetCents: Math.round(target * 100), currentCents: Number.isFinite(current) && current >= 0 ? Math.round(current * 100) : 0, targetDate: optionalDate(value(formData, 'targetDate')), notes: value(formData, 'notes') || null });
  revalidatePath('/finance/brain');
}

export async function createTimelineEventAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const parsed = z.object({ category: shortText, title: shortText }).safeParse({ category: value(formData, 'category'), title: value(formData, 'title') });
  const occurredAt = optionalDate(value(formData, 'occurredAt'));
  if (!parsed.success || !occurredAt) return;
  await db.insert(lifeTimelineEvents).values({ userId, ...parsed.data, occurredAt, summary: value(formData, 'summary') || null, relatedEntityType: value(formData, 'relatedEntityType') || null, relatedEntityId: value(formData, 'relatedEntityId') || null });
  revalidatePath('/timeline');
}

export async function generateBriefingAction(kind: 'morning' | 'evening' | 'weekly') {
  const userId = await requireUser();
  try {
    const context = await buildPersonalContext(userId);
    const periodKey = kind === 'weekly' ? `${context.generatedAt.getFullYear()}-W${Math.ceil(context.generatedAt.getDate() / 7)}` : context.generatedAt.toISOString().slice(0, 10);
    await db.insert(briefingSnapshots).values({ userId, kind, periodKey, content: { dailyBrief: context.dailyBrief, focusScore: context.focusScore, unfinishedTasks: context.unfinishedTasks.length, overdueTasks: context.overdueTasks.length, todaysEvents: context.todaysEvents.length, recommendations: context.recommendations.slice(0, 5) } });
  } catch (error) {
    console.error('[Glow OS] briefing generation unavailable', error);
  }
  revalidatePath('/briefings');
}
