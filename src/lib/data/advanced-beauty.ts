import 'server-only';

import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/db';
import { beautyRoutines } from '@/db/schema/beauty-routines';
import { beautyProducts } from '@/db/schema/completion-v1';
import {
  beautyFragrances,
  beautyLooks,
  beautyMaintenanceItems,
  beautyObservations,
  beautyReadinessLogs,
  beautyRitualRuns,
  beautyStepLogs,
  beautyTreatmentLogs,
  beautyTreatmentSchedules,
} from '@/db/schema/advanced-beauty';

export type BeautyMode = 'full' | 'standard' | 'quick' | 'minimum';

export async function getBeautyIntelligenceState(userId: string) {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);
  const [activeRuns, recentRuns, stepLogs, treatmentLogs, schedules, maintenance, looks, fragrances, readiness, observations] = await Promise.all([
    db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.userId, userId), eq(beautyRitualRuns.status, 'active'))).orderBy(desc(beautyRitualRuns.lastActivityAt)),
    db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.userId, userId), gte(beautyRitualRuns.startedAt, monthAgo))).orderBy(desc(beautyRitualRuns.startedAt)).limit(100),
    db.select().from(beautyStepLogs).where(and(eq(beautyStepLogs.userId, userId), gte(beautyStepLogs.completedAt, monthAgo))).orderBy(desc(beautyStepLogs.completedAt)).limit(500),
    db.select().from(beautyTreatmentLogs).where(and(eq(beautyTreatmentLogs.userId, userId), gte(beautyTreatmentLogs.occurredAt, monthAgo))).orderBy(desc(beautyTreatmentLogs.occurredAt)).limit(200),
    db.select().from(beautyTreatmentSchedules).where(and(eq(beautyTreatmentSchedules.userId, userId), eq(beautyTreatmentSchedules.enabled, true))).orderBy(beautyTreatmentSchedules.nextDueAt),
    db.select().from(beautyMaintenanceItems).where(and(eq(beautyMaintenanceItems.userId, userId), eq(beautyMaintenanceItems.archived, false))).orderBy(beautyMaintenanceItems.nextDueAt),
    db.select().from(beautyLooks).where(eq(beautyLooks.userId, userId)).orderBy(desc(beautyLooks.lastUsedAt), desc(beautyLooks.createdAt)).limit(50),
    db.select().from(beautyFragrances).where(eq(beautyFragrances.userId, userId)).orderBy(desc(beautyFragrances.favorite), desc(beautyFragrances.updatedAt)).limit(100),
    db.select().from(beautyReadinessLogs).where(and(eq(beautyReadinessLogs.userId, userId), gte(beautyReadinessLogs.occurredAt, weekAgo))).orderBy(desc(beautyReadinessLogs.occurredAt)).limit(30),
    db.select().from(beautyObservations).where(and(eq(beautyObservations.userId, userId), eq(beautyObservations.status, 'active'))).orderBy(desc(beautyObservations.updatedAt)).limit(50),
  ]);
  return { activeRuns, recentRuns, stepLogs, treatmentLogs, schedules, maintenance, looks, fragrances, readiness, observations };
}

async function verifiedRoutineIds(userId: string, ids: string[]) {
  if (!ids.length) return [] as string[];
  const rows = await db.select({ id: beautyRoutines.id }).from(beautyRoutines).where(and(eq(beautyRoutines.userId, userId), eq(beautyRoutines.archived, false)));
  const allowed = new Set(rows.map((row) => row.id));
  return Array.from(new Set(ids.filter((id) => allowed.has(id))));
}

export async function startBeautyRitual(userId: string, input: { ritualKey: string; title: string; mode: BeautyMode; queueRoutineIds: string[]; context?: Record<string, unknown> }) {
  const queueRoutineIds = await verifiedRoutineIds(userId, input.queueRoutineIds);
  if (!queueRoutineIds.length) return null;
  const [existing] = await db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.userId, userId), eq(beautyRitualRuns.ritualKey, input.ritualKey), eq(beautyRitualRuns.status, 'active'))).orderBy(desc(beautyRitualRuns.lastActivityAt)).limit(1);
  if (existing) return existing;
  try {
    const [run] = await db.insert(beautyRitualRuns).values({ userId, ritualKey: input.ritualKey, title: input.title, mode: input.mode, queueRoutineIds, context: input.context ?? {} }).returning();
    return run ?? null;
  } catch {
    const [raceWinner] = await db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.userId, userId), eq(beautyRitualRuns.ritualKey, input.ritualKey), eq(beautyRitualRuns.status, 'active'))).orderBy(desc(beautyRitualRuns.lastActivityAt)).limit(1);
    return raceWinner ?? null;
  }
}

export async function recordBeautyStep(userId: string, input: { runId: string; routineId: string; status: 'completed' | 'skipped'; actualSeconds: number; notes?: string }) {
  const [run] = await db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.id, input.runId), eq(beautyRitualRuns.userId, userId), eq(beautyRitualRuns.status, 'active'))).limit(1);
  if (!run || !run.queueRoutineIds.includes(input.routineId)) return null;
  const [routine] = await db.select().from(beautyRoutines).where(and(eq(beautyRoutines.id, input.routineId), eq(beautyRoutines.userId, userId), eq(beautyRoutines.archived, false))).limit(1);
  if (!routine) return null;
  const seconds = Math.max(0, Math.min(7200, Math.round(input.actualSeconds)));
  const now = new Date();
  const [existing] = await db.select().from(beautyStepLogs).where(and(eq(beautyStepLogs.runId, run.id), eq(beautyStepLogs.routineId, input.routineId))).limit(1);
  if (existing) await db.update(beautyStepLogs).set({ status: input.status, actualSeconds: seconds, notes: input.notes?.trim() || existing.notes, completedAt: now }).where(and(eq(beautyStepLogs.id, existing.id), eq(beautyStepLogs.userId, userId)));
  else await db.insert(beautyStepLogs).values({ userId, runId: run.id, routineId: routine.id, stepName: routine.name, status: input.status, actualSeconds: seconds, notes: input.notes?.trim() || null, completedAt: now });

  const completedRoutineIds = input.status === 'completed' ? Array.from(new Set([...run.completedRoutineIds.filter((id) => id !== routine.id), routine.id])) : run.completedRoutineIds.filter((id) => id !== routine.id);
  const skippedRoutineIds = input.status === 'skipped' ? Array.from(new Set([...run.skippedRoutineIds.filter((id) => id !== routine.id), routine.id])) : run.skippedRoutineIds.filter((id) => id !== routine.id);
  const handled = new Set([...completedRoutineIds, ...skippedRoutineIds]);
  const unresolvedIndex = run.queueRoutineIds.findIndex((id) => !handled.has(id));
  const nextIndex = unresolvedIndex < 0 ? run.queueRoutineIds.length : unresolvedIndex;
  const secondsDelta = existing ? Math.max(0, seconds - existing.actualSeconds) : seconds;
  const [updated] = await db.update(beautyRitualRuns).set({ completedRoutineIds, skippedRoutineIds, currentIndex: nextIndex, actualSeconds: run.actualSeconds + secondsDelta, lastActivityAt: now }).where(and(eq(beautyRitualRuns.id, run.id), eq(beautyRitualRuns.userId, userId))).returning();
  return updated ?? null;
}

export async function completeBeautyRitual(userId: string, runId: string) {
  const [run] = await db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.id, runId), eq(beautyRitualRuns.userId, userId))).limit(1);
  if (!run) return null;
  if (run.status === 'completed') return run;
  const handled = new Set([...run.completedRoutineIds, ...run.skippedRoutineIds]);
  if (run.queueRoutineIds.some((id) => !handled.has(id))) return null;
  const now = new Date();
  const [updated] = await db.update(beautyRitualRuns).set({ status: 'completed', completedAt: now, currentIndex: run.queueRoutineIds.length, lastActivityAt: now }).where(and(eq(beautyRitualRuns.id, run.id), eq(beautyRitualRuns.userId, userId))).returning();
  return updated ?? null;
}

export async function abandonBeautyRitual(userId: string, runId: string) {
  const [updated] = await db.update(beautyRitualRuns).set({ status: 'abandoned', lastActivityAt: new Date() }).where(and(eq(beautyRitualRuns.id, runId), eq(beautyRitualRuns.userId, userId), eq(beautyRitualRuns.status, 'active'))).returning();
  return updated ?? null;
}

export async function logBeautyTreatment(userId: string, input: { treatmentKey: string; treatmentName: string; area: string; productId?: string | null; response?: 'comfortable' | 'neutral' | 'irritating' | null; notes?: string }) {
  let productId: string | null = null;
  if (input.productId) {
    const [product] = await db.select({ id: beautyProducts.id }).from(beautyProducts).where(and(eq(beautyProducts.id, input.productId), eq(beautyProducts.userId, userId))).limit(1);
    if (!product) return null;
    productId = product.id;
  }
  const [row] = await db.insert(beautyTreatmentLogs).values({ userId, treatmentKey: input.treatmentKey.trim(), treatmentName: input.treatmentName.trim(), area: input.area.trim() || 'face', productId, response: input.response ?? null, notes: input.notes?.trim() || null }).returning();
  return row ?? null;
}

export async function createTreatmentSchedule(userId: string, input: { treatmentKey: string; treatmentName: string; area: string; weekdays?: number[]; cadenceDays?: number | null; nextDueAt?: Date | null; strongTreatment?: boolean; notes?: string }) {
  const weekdays = Array.from(new Set((input.weekdays ?? []).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)));
  const cadenceDays = input.cadenceDays == null ? null : Math.max(1, Math.min(3650, Math.round(input.cadenceDays)));
  const [row] = await db.insert(beautyTreatmentSchedules).values({ userId, treatmentKey: input.treatmentKey.trim(), treatmentName: input.treatmentName.trim(), area: input.area.trim() || 'face', weekdays, cadenceDays, nextDueAt: input.nextDueAt ?? null, strongTreatment: Boolean(input.strongTreatment), notes: input.notes?.trim() || null }).returning();
  return row ?? null;
}

export async function toggleTreatmentSchedule(userId: string, id: string, enabled: boolean) {
  const [row] = await db.update(beautyTreatmentSchedules).set({ enabled, updatedAt: new Date() }).where(and(eq(beautyTreatmentSchedules.id, id), eq(beautyTreatmentSchedules.userId, userId))).returning();
  return row ?? null;
}

export async function createMaintenanceItem(userId: string, input: { title: string; category: string; cadenceDays?: number | null; nextDueAt?: Date | null; notes?: string; source?: string }) {
  const cadenceDays = input.cadenceDays == null ? null : Math.max(1, Math.min(3650, Math.round(input.cadenceDays)));
  const [row] = await db.insert(beautyMaintenanceItems).values({ userId, title: input.title.trim(), category: input.category.trim() || 'general', cadenceDays, nextDueAt: input.nextDueAt ?? null, notes: input.notes?.trim() || null, source: input.source ?? 'manual' }).returning();
  return row ?? null;
}

export async function completeMaintenanceItem(userId: string, id: string) {
  const [item] = await db.select().from(beautyMaintenanceItems).where(and(eq(beautyMaintenanceItems.id, id), eq(beautyMaintenanceItems.userId, userId), eq(beautyMaintenanceItems.archived, false))).limit(1);
  if (!item) return null;
  const now = new Date();
  const nextDueAt = item.cadenceDays ? new Date(now.getTime() + item.cadenceDays * 86400000) : null;
  const [updated] = await db.update(beautyMaintenanceItems).set({ lastCompletedAt: now, nextDueAt, updatedAt: now }).where(and(eq(beautyMaintenanceItems.id, id), eq(beautyMaintenanceItems.userId, userId))).returning();
  return updated ?? null;
}

export async function createBeautyLook(userId: string, input: { name: string; occasion: string; mood: string; plannedMinutes: number; steps: string[]; productIds?: string[]; notes?: string }) {
  const validProducts = input.productIds?.length ? await db.select({ id: beautyProducts.id }).from(beautyProducts).where(eq(beautyProducts.userId, userId)) : [];
  const allowed = new Set(validProducts.map((p) => p.id));
  const productIds = Array.from(new Set((input.productIds ?? []).filter((id) => allowed.has(id))));
  const [row] = await db.insert(beautyLooks).values({ userId, name: input.name.trim(), occasion: input.occasion.trim() || 'Everyday', mood: input.mood.trim() || 'Natural', plannedMinutes: Math.max(5, Math.min(180, Math.round(input.plannedMinutes))), steps: input.steps.slice(0, 50), productIds, notes: input.notes?.trim() || null }).returning();
  return row ?? null;
}

export async function useBeautyLook(userId: string, id: string) {
  const [look] = await db.select().from(beautyLooks).where(and(eq(beautyLooks.id, id), eq(beautyLooks.userId, userId))).limit(1);
  if (!look) return null;
  const [updated] = await db.update(beautyLooks).set({ useCount: look.useCount + 1, lastUsedAt: new Date(), updatedAt: new Date() }).where(and(eq(beautyLooks.id, id), eq(beautyLooks.userId, userId))).returning();
  return updated ?? null;
}

export async function createFragrance(userId: string, input: { name: string; family?: string; productId?: string | null; dayparts?: string[]; seasons?: string[]; moods?: string[]; occasions?: string[]; favorite?: boolean; notes?: string }) {
  let productId: string | null = null;
  if (input.productId) {
    const [product] = await db.select({ id: beautyProducts.id }).from(beautyProducts).where(and(eq(beautyProducts.id, input.productId), eq(beautyProducts.userId, userId))).limit(1);
    if (!product) return null;
    productId = product.id;
  }
  const clean = (list?: string[]) => Array.from(new Set((list ?? []).map((x) => x.trim()).filter(Boolean))).slice(0, 20);
  const [row] = await db.insert(beautyFragrances).values({ userId, productId, name: input.name.trim(), family: input.family?.trim() || null, dayparts: clean(input.dayparts), seasons: clean(input.seasons), moods: clean(input.moods), occasions: clean(input.occasions), favorite: Boolean(input.favorite), notes: input.notes?.trim() || null }).returning();
  return row ?? null;
}

export async function logBeautyReadiness(userId: string, input: { context: string; checks: Record<string, boolean> }) {
  const safeChecks = Object.fromEntries(Object.entries(input.checks).slice(0, 40).map(([key, value]) => [key.slice(0, 80), Boolean(value)]));
  const values = Object.values(safeChecks);
  const [row] = await db.insert(beautyReadinessLogs).values({ userId, context: input.context.trim() || 'leaving', checks: safeChecks, completedCount: values.filter(Boolean).length, totalCount: values.length }).returning();
  return row ?? null;
}

export async function saveBeautyObservation(userId: string, input: { kind: string; subject: string; confidence?: string; body: string; evidence?: Record<string, unknown> }) {
  const [row] = await db.insert(beautyObservations).values({ userId, kind: input.kind.trim(), subject: input.subject.trim(), confidence: input.confidence ?? 'user_note', body: input.body.trim(), evidence: input.evidence ?? {} }).returning();
  return row ?? null;
}

export async function dismissBeautyObservation(userId: string, id: string) {
  const [row] = await db.update(beautyObservations).set({ status: 'dismissed', updatedAt: new Date() }).where(and(eq(beautyObservations.id, id), eq(beautyObservations.userId, userId))).returning();
  return row ?? null;
}
