import { db } from '@/db';
import { and, desc, eq } from 'drizzle-orm';
import { routineSteps } from '@/db/schema/routines';
import {
  routineChains,
  routineRuns,
  routineStepLinks,
  routineStepRules,
  routineStepRuns,
  routineStepStats,
  routineTriggers,
} from '@/db/schema/advanced-routines';
import { tasks } from '@/db/schema/tasks';
import { habitLogs } from '@/db/schema/habits';
import { fitnessSessions } from '@/db/schema/completion-v1';

export type RoutineMode = 'full' | 'normal' | 'quick' | 'minimum';

export async function getRoutineEngineState(userId: string) {
  const [activeRuns, history, stats, links, triggers, rules, chains] = await Promise.all([
    db.select().from(routineRuns).where(and(eq(routineRuns.userId, userId), eq(routineRuns.status, 'active'))).orderBy(desc(routineRuns.lastActivityAt)),
    db.select().from(routineRuns).where(and(eq(routineRuns.userId, userId), eq(routineRuns.status, 'completed'))).orderBy(desc(routineRuns.completedAt)).limit(40),
    db.select().from(routineStepStats).where(eq(routineStepStats.userId, userId)),
    db.select().from(routineStepLinks).where(eq(routineStepLinks.userId, userId)),
    db.select().from(routineTriggers).where(eq(routineTriggers.userId, userId)),
    db.select().from(routineStepRules).where(eq(routineStepRules.userId, userId)),
    db.select().from(routineChains).where(eq(routineChains.userId, userId)),
  ]);
  return { activeRuns, history, stats, links, triggers, rules, chains };
}

export async function startOrResumeRoutineRun(
  userId: string,
  input: { routineId: string; mode: RoutineMode; queueStepIds: string[]; context?: Record<string, unknown> },
) {
  const [existing] = await db
    .select()
    .from(routineRuns)
    .where(and(eq(routineRuns.userId, userId), eq(routineRuns.routineId, input.routineId), eq(routineRuns.status, 'active')))
    .orderBy(desc(routineRuns.lastActivityAt))
    .limit(1);

  if (existing) return existing;

  const [run] = await db.insert(routineRuns).values({
    userId,
    routineId: input.routineId,
    mode: input.mode,
    queueStepIds: input.queueStepIds,
    context: input.context ?? {},
  }).returning();
  return run;
}

export async function updateRoutineRunProgress(
  userId: string,
  runId: string,
  input: {
    mode?: RoutineMode;
    queueStepIds?: string[];
    completedStepIds?: string[];
    skippedStepIds?: string[];
    currentIndex?: number;
    actualSecondsDelta?: number;
    context?: Record<string, unknown>;
  },
) {
  const [run] = await db.select().from(routineRuns).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId))).limit(1);
  if (!run || run.status !== 'active') return null;

  const [updated] = await db.update(routineRuns).set({
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.queueStepIds ? { queueStepIds: input.queueStepIds } : {}),
    ...(input.completedStepIds ? { completedStepIds: input.completedStepIds } : {}),
    ...(input.skippedStepIds ? { skippedStepIds: input.skippedStepIds } : {}),
    ...(typeof input.currentIndex === 'number' ? { currentIndex: input.currentIndex } : {}),
    ...(input.context ? { context: { ...(run.context ?? {}), ...input.context } } : {}),
    actualSeconds: Math.max(0, run.actualSeconds + Math.max(0, input.actualSecondsDelta ?? 0)),
    lastActivityAt: new Date(),
  }).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId))).returning();
  return updated ?? null;
}

async function syncLinkedCompletion(
  userId: string,
  stepId: string,
  actualSeconds: number,
  dateKey: string,
) {
  const links = await db.select().from(routineStepLinks).where(and(eq(routineStepLinks.userId, userId), eq(routineStepLinks.stepId, stepId)));
  const updates: string[] = [];

  for (const link of links) {
    if (link.completionPolicy !== 'complete_with_step') continue;
    if (link.targetType === 'task') {
      const [task] = await db.update(tasks).set({ status: 'done', completedAt: new Date(), updatedAt: new Date() }).where(and(eq(tasks.id, link.targetId), eq(tasks.userId, userId))).returning();
      if (task) updates.push(`task:${task.id}`);
    } else if (link.targetType === 'habit') {
      const [existing] = await db.select().from(habitLogs).where(and(eq(habitLogs.userId, userId), eq(habitLogs.habitId, link.targetId), eq(habitLogs.loggedDate, dateKey))).limit(1);
      if (!existing) {
        const [log] = await db.insert(habitLogs).values({ userId, habitId: link.targetId, loggedDate: dateKey, count: 1, notes: 'Completed from linked Glow routine step.' }).returning();
        if (log) updates.push(`habit:${link.targetId}`);
      } else {
        updates.push(`habit:${link.targetId}`);
      }
    } else if (link.targetType === 'fitness') {
      const workoutType = String(link.metadata?.workoutType ?? link.targetId ?? 'Routine workout');
      const [session] = await db.insert(fitnessSessions).values({
        userId,
        workoutType,
        durationMinutes: Math.max(1, Math.round(actualSeconds / 60)),
        notes: `Completed from linked routine step ${stepId}.`,
      }).returning();
      if (session) updates.push(`fitness:${session.id}`);
    }
  }
  return updates;
}

export async function completeRoutineStep(
  userId: string,
  input: { runId: string; stepId: string; actualSeconds: number; dateKey: string },
) {
  const [run] = await db.select().from(routineRuns).where(and(eq(routineRuns.id, input.runId), eq(routineRuns.userId, userId))).limit(1);
  if (!run || run.status !== 'active') return { run: null, linkedUpdates: [] as string[], alreadyCompleted: false };

  const [existingStepRun] = await db.select().from(routineStepRuns).where(and(eq(routineStepRuns.runId, input.runId), eq(routineStepRuns.stepId, input.stepId))).limit(1);
  if (existingStepRun?.status === 'completed') {
    return { run, linkedUpdates: [] as string[], alreadyCompleted: true };
  }

  const now = new Date();
  const seconds = Math.max(0, Math.round(input.actualSeconds));
  if (existingStepRun) {
    await db.update(routineStepRuns).set({ status: 'completed', completedAt: now, actualSeconds: seconds }).where(eq(routineStepRuns.id, existingStepRun.id));
  } else {
    await db.insert(routineStepRuns).values({ userId, runId: input.runId, stepId: input.stepId, status: 'completed', startedAt: new Date(now.getTime() - seconds * 1000), completedAt: now, actualSeconds: seconds });
  }

  const [stat] = await db.select().from(routineStepStats).where(and(eq(routineStepStats.userId, userId), eq(routineStepStats.stepId, input.stepId))).limit(1);
  if (stat) {
    const sampleCount = stat.sampleCount + 1;
    const totalSeconds = stat.totalSeconds + seconds;
    await db.update(routineStepStats).set({ sampleCount, totalSeconds, averageSeconds: Math.round(totalSeconds / sampleCount), lastSeconds: seconds, updatedAt: now }).where(eq(routineStepStats.id, stat.id));
  } else {
    await db.insert(routineStepStats).values({ userId, stepId: input.stepId, sampleCount: 1, totalSeconds: seconds, averageSeconds: seconds, lastSeconds: seconds });
  }

  const completedStepIds = Array.from(new Set([...(run.completedStepIds ?? []), input.stepId]));
  const [updatedRun] = await db.update(routineRuns).set({
    completedStepIds,
    actualSeconds: run.actualSeconds + seconds,
    lastActivityAt: now,
  }).where(and(eq(routineRuns.id, input.runId), eq(routineRuns.userId, userId))).returning();

  const linkedUpdates = await syncLinkedCompletion(userId, input.stepId, seconds, input.dateKey);
  return { run: updatedRun ?? run, linkedUpdates, alreadyCompleted: false };
}

export async function skipRoutineStep(userId: string, input: { runId: string; stepId: string }) {
  const [run] = await db.select().from(routineRuns).where(and(eq(routineRuns.id, input.runId), eq(routineRuns.userId, userId))).limit(1);
  if (!run || run.status !== 'active') return null;
  const skippedStepIds = Array.from(new Set([...(run.skippedStepIds ?? []), input.stepId]));
  const [updated] = await db.update(routineRuns).set({ skippedStepIds, lastActivityAt: new Date() }).where(and(eq(routineRuns.id, input.runId), eq(routineRuns.userId, userId))).returning();
  return updated ?? null;
}

export async function completeRoutineRun(userId: string, runId: string) {
  const [run] = await db.select().from(routineRuns).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId))).limit(1);
  if (!run) return { run: null, nextRun: null };
  if (run.status === 'completed') return { run, nextRun: null };

  const now = new Date();
  const [completed] = await db.update(routineRuns).set({ status: 'completed', completedAt: now, lastActivityAt: now }).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId))).returning();

  const [chain] = await db.select().from(routineChains).where(and(eq(routineChains.userId, userId), eq(routineChains.sourceRoutineId, run.routineId), eq(routineChains.enabled, true))).limit(1);
  if (!chain) return { run: completed ?? run, nextRun: null };

  const nextSteps = await db.select().from(routineSteps).where(and(eq(routineSteps.userId, userId), eq(routineSteps.routineId, chain.nextRoutineId))).orderBy(routineSteps.order);
  const [nextRun] = await db.insert(routineRuns).values({
    userId,
    routineId: chain.nextRoutineId,
    mode: run.mode,
    queueStepIds: nextSteps.map((step) => step.id),
    context: { chainedFromRunId: runId, chainedFromRoutineId: run.routineId },
  }).returning();
  return { run: completed ?? run, nextRun: nextRun ?? null };
}

export async function abandonRoutineRun(userId: string, runId: string) {
  const [run] = await db.update(routineRuns).set({ status: 'abandoned', lastActivityAt: new Date() }).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId), eq(routineRuns.status, 'active'))).returning();
  return run ?? null;
}

export async function upsertRoutineStepLink(
  userId: string,
  input: { stepId: string; targetType: 'task' | 'habit' | 'fitness'; targetId: string; metadata?: Record<string, unknown> },
) {
  const [existing] = await db.select().from(routineStepLinks).where(and(eq(routineStepLinks.stepId, input.stepId), eq(routineStepLinks.targetType, input.targetType), eq(routineStepLinks.targetId, input.targetId))).limit(1);
  if (existing) return existing;
  const [link] = await db.insert(routineStepLinks).values({ userId, ...input, metadata: input.metadata ?? {} }).returning();
  return link;
}

export async function removeRoutineStepLink(userId: string, id: string) {
  const [removed] = await db.delete(routineStepLinks).where(and(eq(routineStepLinks.id, id), eq(routineStepLinks.userId, userId))).returning();
  return removed ?? null;
}

export async function createRoutineTrigger(userId: string, input: { routineId: string; triggerType: string; config: Record<string, unknown> }) {
  const [trigger] = await db.insert(routineTriggers).values({ userId, ...input }).returning();
  return trigger;
}

export async function toggleRoutineTrigger(userId: string, id: string, enabled: boolean) {
  const [trigger] = await db.update(routineTriggers).set({ enabled, updatedAt: new Date() }).where(and(eq(routineTriggers.id, id), eq(routineTriggers.userId, userId))).returning();
  return trigger ?? null;
}

export async function createRoutineStepRule(userId: string, input: { stepId: string; ruleType: string; config: Record<string, unknown> }) {
  const [rule] = await db.insert(routineStepRules).values({ userId, ...input }).returning();
  return rule;
}

export async function toggleRoutineStepRule(userId: string, id: string, enabled: boolean) {
  const [rule] = await db.update(routineStepRules).set({ enabled, updatedAt: new Date() }).where(and(eq(routineStepRules.id, id), eq(routineStepRules.userId, userId))).returning();
  return rule ?? null;
}

export async function setRoutineChain(userId: string, sourceRoutineId: string, nextRoutineId: string | null) {
  const [existing] = await db.select().from(routineChains).where(and(eq(routineChains.userId, userId), eq(routineChains.sourceRoutineId, sourceRoutineId))).limit(1);
  if (!nextRoutineId) {
    if (!existing) return null;
    const [removed] = await db.delete(routineChains).where(eq(routineChains.id, existing.id)).returning();
    return removed ?? null;
  }
  if (existing) {
    const [updated] = await db.update(routineChains).set({ nextRoutineId, enabled: true }).where(eq(routineChains.id, existing.id)).returning();
    return updated ?? null;
  }
  const [chain] = await db.insert(routineChains).values({ userId, sourceRoutineId, nextRoutineId }).returning();
  return chain;
}
