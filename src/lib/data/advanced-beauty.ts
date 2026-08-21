import 'server-only';

import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/db';
import { beautyRoutines } from '@/db/schema/beauty-routines';
import { beautyProducts } from '@/db/schema/completion-v1';
import {
  beautyMaintenanceItems,
  beautyObservations,
  beautyRitualRuns,
  beautyStepLogs,
  beautyTreatmentLogs,
} from '@/db/schema/advanced-beauty';

export type BeautyMode = 'full' | 'standard' | 'quick' | 'minimum';

export async function getBeautyIntelligenceState(userId: string) {
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);
  const [activeRuns, recentRuns, stepLogs, treatmentLogs, maintenance, observations] = await Promise.all([
    db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.userId, userId), eq(beautyRitualRuns.status, 'active'))).orderBy(desc(beautyRitualRuns.lastActivityAt)),
    db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.userId, userId), gte(beautyRitualRuns.startedAt, monthAgo))).orderBy(desc(beautyRitualRuns.startedAt)).limit(80),
    db.select().from(beautyStepLogs).where(and(eq(beautyStepLogs.userId, userId), gte(beautyStepLogs.completedAt, weekAgo))).orderBy(desc(beautyStepLogs.completedAt)).limit(250),
    db.select().from(beautyTreatmentLogs).where(and(eq(beautyTreatmentLogs.userId, userId), gte(beautyTreatmentLogs.occurredAt, monthAgo))).orderBy(desc(beautyTreatmentLogs.occurredAt)).limit(120),
    db.select().from(beautyMaintenanceItems).where(and(eq(beautyMaintenanceItems.userId, userId), eq(beautyMaintenanceItems.archived, false))).orderBy(beautyMaintenanceItems.nextDueAt),
    db.select().from(beautyObservations).where(and(eq(beautyObservations.userId, userId), eq(beautyObservations.status, 'active'))).orderBy(desc(beautyObservations.updatedAt)).limit(30),
  ]);
  return { activeRuns, recentRuns, stepLogs, treatmentLogs, maintenance, observations };
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
  const [routine] = await db.select().from(beautyRoutines).where(and(eq(beautyRoutines.id, input.routineId), eq(beautyRoutines.userId, userId))).limit(1);
  if (!routine) return null;
  const seconds = Math.max(0, Math.min(7200, Math.round(input.actualSeconds)));
  const [existing] = await db.select().from(beautyStepLogs).where(and(eq(beautyStepLogs.runId, run.id), eq(beautyStepLogs.routineId, input.routineId))).limit(1);
  if (!existing) {
    await db.insert(beautyStepLogs).values({ userId, runId: run.id, routineId: routine.id, stepName: routine.name, status: input.status, actualSeconds: seconds, notes: input.notes?.trim() || null });
  }
  const completedRoutineIds = input.status === 'completed' ? Array.from(new Set([...run.completedRoutineIds, routine.id])) : run.completedRoutineIds;
  const skippedRoutineIds = input.status === 'skipped' ? Array.from(new Set([...run.skippedRoutineIds, routine.id])) : run.skippedRoutineIds;
  const handled = new Set([...completedRoutineIds, ...skippedRoutineIds]);
  const nextIndex = Math.min(run.queueRoutineIds.length, run.queueRoutineIds.findIndex((id) => !handled.has(id)) < 0 ? run.queueRoutineIds.length : run.queueRoutineIds.findIndex((id) => !handled.has(id)));
  const [updated] = await db.update(beautyRitualRuns).set({ completedRoutineIds, skippedRoutineIds, currentIndex: nextIndex, actualSeconds: run.actualSeconds + (existing ? 0 : seconds), lastActivityAt: new Date() }).where(and(eq(beautyRitualRuns.id, run.id), eq(beautyRitualRuns.userId, userId))).returning();
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

export async function createMaintenanceItem(userId: string, input: { title: string; category: string; cadenceDays?: number | null; nextDueAt?: Date | null; notes?: string; source?: string }) {
  const cadenceDays = input.cadenceDays == null ? null : Math.max(1, Math.min(3650, Math.round(input.cadenceDays)));
  const [row] = await db.insert(beautyMaintenanceItems).values({ userId, title: input.title.trim(), category: input.category.trim() || 'general', cadenceDays, nextDueAt: input.nextDueAt ?? null, notes: input.notes?.trim() || null, source: input.source ?? 'manual' }).returning();
  return row ?? null;
}

export async function completeMaintenanceItem(userId: string, id: string) {
  const [item] = await db.select().from(beautyMaintenanceItems).where(and(eq(beautyMaintenanceItems.id, id), eq(beautyMaintenanceItems.userId, userId), eq(beautyMaintenanceItems.archived, false))).limit(1);
  if (!item) return null;
  const now = new Date();
  const nextDueAt = item.cadenceDays ? new Date(now.getTime() + item.cadenceDays * 86400000) : item.nextDueAt;
  const [updated] = await db.update(beautyMaintenanceItems).set({ lastCompletedAt: now, nextDueAt, updatedAt: now }).where(and(eq(beautyMaintenanceItems.id, id), eq(beautyMaintenanceItems.userId, userId))).returning();
  return updated ?? null;
}

export async function saveBeautyObservation(userId: string, input: { kind: string; subject: string; confidence?: string; body: string; evidence?: Record<string, unknown> }) {
  const [row] = await db.insert(beautyObservations).values({ userId, kind: input.kind.trim(), subject: input.subject.trim(), confidence: input.confidence ?? 'user_note', body: input.body.trim(), evidence: input.evidence ?? {} }).returning();
  return row ?? null;
}

export async function dismissBeautyObservation(userId: string, id: string) {
  const [row] = await db.update(beautyObservations).set({ status: 'dismissed', updatedAt: new Date() }).where(and(eq(beautyObservations.id, id), eq(beautyObservations.userId, userId))).returning();
  return row ?? null;
}
