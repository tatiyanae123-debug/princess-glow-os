import { db } from '@/db';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { routines, routineSteps } from '@/db/schema/routines';
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
import { habits, habitLogs } from '@/db/schema/habits';
import { fitnessSessions } from '@/db/schema/completion-v1';

export type RoutineMode = 'full' | 'normal' | 'quick' | 'minimum';

async function ownedRoutine(userId: string, routineId: string) {
  const [routine] = await db.select().from(routines).where(and(eq(routines.id, routineId), eq(routines.userId, userId))).limit(1);
  return routine ?? null;
}

async function ownedStep(userId: string, stepId: string) {
  const [step] = await db.select().from(routineSteps).where(and(eq(routineSteps.id, stepId), eq(routineSteps.userId, userId))).limit(1);
  return step ?? null;
}

async function validatedQueue(userId: string, routineId: string, queueStepIds: string[]) {
  const uniqueIds = Array.from(new Set(queueStepIds.filter(Boolean)));
  if (!uniqueIds.length) return [] as string[];
  const rows = await db.select({ id: routineSteps.id }).from(routineSteps).where(and(
    eq(routineSteps.userId, userId),
    eq(routineSteps.routineId, routineId),
    inArray(routineSteps.id, uniqueIds),
  ));
  const allowed = new Set(rows.map((row) => row.id));
  return uniqueIds.filter((id) => allowed.has(id));
}

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
  const routine = await ownedRoutine(userId, input.routineId);
  if (!routine || routine.archived) return null;

  const [existing] = await db
    .select()
    .from(routineRuns)
    .where(and(eq(routineRuns.userId, userId), eq(routineRuns.routineId, input.routineId), eq(routineRuns.status, 'active')))
    .orderBy(desc(routineRuns.lastActivityAt))
    .limit(1);

  if (existing) return existing;

  const queueStepIds = await validatedQueue(userId, input.routineId, input.queueStepIds);
  if (!queueStepIds.length) return null;

  try {
    const [run] = await db.insert(routineRuns).values({
      userId,
      routineId: input.routineId,
      mode: input.mode,
      queueStepIds,
      context: input.context ?? {},
    }).returning();
    return run ?? null;
  } catch {
    const [raced] = await db
      .select()
      .from(routineRuns)
      .where(and(eq(routineRuns.userId, userId), eq(routineRuns.routineId, input.routineId), eq(routineRuns.status, 'active')))
      .orderBy(desc(routineRuns.lastActivityAt))
      .limit(1);
    return raced ?? null;
  }
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

  const queueStepIds = input.queueStepIds ? await validatedQueue(userId, run.routineId, input.queueStepIds) : run.queueStepIds;
  if (!queueStepIds.length) return null;
  const queueSet = new Set(queueStepIds);
  const completedStepIds = input.completedStepIds ? Array.from(new Set(input.completedStepIds.filter((id) => queueSet.has(id)))) : undefined;
  const skippedStepIds = input.skippedStepIds ? Array.from(new Set(input.skippedStepIds.filter((id) => queueSet.has(id)))) : undefined;
  const currentIndex = typeof input.currentIndex === 'number' ? Math.max(0, Math.min(Math.floor(input.currentIndex), queueStepIds.length)) : undefined;

  const [updated] = await db.update(routineRuns).set({
    ...(input.mode ? { mode: input.mode } : {}),
    ...(input.queueStepIds ? { queueStepIds } : {}),
    ...(completedStepIds ? { completedStepIds } : {}),
    ...(skippedStepIds ? { skippedStepIds } : {}),
    ...(typeof currentIndex === 'number' ? { currentIndex } : {}),
    ...(input.context ? { context: { ...(run.context ?? {}), ...input.context } } : {}),
    actualSeconds: Math.max(0, run.actualSeconds + Math.max(0, input.actualSecondsDelta ?? 0)),
    lastActivityAt: new Date(),
  }).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId), eq(routineRuns.status, 'active'))).returning();
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
      const recent = await db.select().from(fitnessSessions).where(and(eq(fitnessSessions.userId, userId), eq(fitnessSessions.workoutType, workoutType))).orderBy(desc(fitnessSessions.occurredAt)).limit(12);
      const duplicate = recent.find((session) => {
        const y = session.occurredAt.getFullYear();
        const m = String(session.occurredAt.getMonth() + 1).padStart(2, '0');
        const d = String(session.occurredAt.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}` === dateKey && String(session.notes ?? '').includes(`routine step ${stepId}`);
      });
      if (duplicate) {
        updates.push(`fitness:${duplicate.id}`);
        continue;
      }
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
  if (!run || run.status !== 'active' || !run.queueStepIds.includes(input.stepId)) return { run: null, linkedUpdates: [] as string[], alreadyCompleted: false };
  const step = await ownedStep(userId, input.stepId);
  if (!step || step.routineId !== run.routineId) return { run: null, linkedUpdates: [] as string[], alreadyCompleted: false };

  const [existingStepRun] = await db.select().from(routineStepRuns).where(and(eq(routineStepRuns.runId, input.runId), eq(routineStepRuns.stepId, input.stepId))).limit(1);
  if (existingStepRun?.status === 'completed') {
    return { run, linkedUpdates: [] as string[], alreadyCompleted: true };
  }

  const now = new Date();
  const seconds = Math.max(0, Math.min(86400, Math.round(input.actualSeconds)));
  if (existingStepRun) {
    await db.update(routineStepRuns).set({ status: 'completed', completedAt: now, actualSeconds: seconds }).where(and(eq(routineStepRuns.id, existingStepRun.id), eq(routineStepRuns.userId, userId)));
  } else {
    await db.insert(routineStepRuns).values({ userId, runId: input.runId, stepId: input.stepId, status: 'completed', startedAt: new Date(now.getTime() - seconds * 1000), completedAt: now, actualSeconds: seconds });
  }

  const [stat] = await db.select().from(routineStepStats).where(and(eq(routineStepStats.userId, userId), eq(routineStepStats.stepId, input.stepId))).limit(1);
  if (stat) {
    const sampleCount = stat.sampleCount + 1;
    const totalSeconds = stat.totalSeconds + seconds;
    await db.update(routineStepStats).set({ sampleCount, totalSeconds, averageSeconds: Math.round(totalSeconds / sampleCount), lastSeconds: seconds, updatedAt: now }).where(and(eq(routineStepStats.id, stat.id), eq(routineStepStats.userId, userId)));
  } else {
    await db.insert(routineStepStats).values({ userId, stepId: input.stepId, sampleCount: 1, totalSeconds: seconds, averageSeconds: seconds, lastSeconds: seconds });
  }

  const completedStepIds = Array.from(new Set([...(run.completedStepIds ?? []), input.stepId]));
  const [updatedRun] = await db.update(routineRuns).set({
    completedStepIds,
    actualSeconds: run.actualSeconds + seconds,
    lastActivityAt: now,
  }).where(and(eq(routineRuns.id, input.runId), eq(routineRuns.userId, userId), eq(routineRuns.status, 'active'))).returning();

  const linkedUpdates = await syncLinkedCompletion(userId, input.stepId, seconds, input.dateKey);
  return { run: updatedRun ?? run, linkedUpdates, alreadyCompleted: false };
}

export async function skipRoutineStep(userId: string, input: { runId: string; stepId: string }) {
  const [run] = await db.select().from(routineRuns).where(and(eq(routineRuns.id, input.runId), eq(routineRuns.userId, userId))).limit(1);
  if (!run || run.status !== 'active' || !run.queueStepIds.includes(input.stepId)) return null;
  const step = await ownedStep(userId, input.stepId);
  if (!step || step.routineId !== run.routineId) return null;
  const skippedStepIds = Array.from(new Set([...(run.skippedStepIds ?? []), input.stepId]));
  const [updated] = await db.update(routineRuns).set({ skippedStepIds, lastActivityAt: new Date() }).where(and(eq(routineRuns.id, input.runId), eq(routineRuns.userId, userId), eq(routineRuns.status, 'active'))).returning();
  return updated ?? null;
}

export async function completeRoutineRun(userId: string, runId: string) {
  const [run] = await db.select().from(routineRuns).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId))).limit(1);
  if (!run) return { run: null, nextRun: null };
  if (run.status === 'completed') return { run, nextRun: null };
  if (run.status !== 'active') return { run: null, nextRun: null };

  const attempted = new Set([...(run.completedStepIds ?? []), ...(run.skippedStepIds ?? [])]);
  if (!run.queueStepIds.length || attempted.size < run.queueStepIds.length) return { run: null, nextRun: null };

  const now = new Date();
  const [completed] = await db.update(routineRuns).set({ status: 'completed', completedAt: now, lastActivityAt: now, currentIndex: run.queueStepIds.length }).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId), eq(routineRuns.status, 'active'))).returning();
  if (!completed) return { run: null, nextRun: null };

  const [chain] = await db.select().from(routineChains).where(and(eq(routineChains.userId, userId), eq(routineChains.sourceRoutineId, run.routineId), eq(routineChains.enabled, true))).limit(1);
  if (!chain) return { run: completed, nextRun: null };

  const nextRoutine = await ownedRoutine(userId, chain.nextRoutineId);
  if (!nextRoutine || nextRoutine.archived) return { run: completed, nextRun: null };
  const nextSteps = await db.select().from(routineSteps).where(and(eq(routineSteps.userId, userId), eq(routineSteps.routineId, chain.nextRoutineId))).orderBy(routineSteps.order);
  if (!nextSteps.length) return { run: completed, nextRun: null };

  const [existingNext] = await db.select().from(routineRuns).where(and(eq(routineRuns.userId, userId), eq(routineRuns.routineId, chain.nextRoutineId), eq(routineRuns.status, 'active'))).orderBy(desc(routineRuns.lastActivityAt)).limit(1);
  if (existingNext) return { run: completed, nextRun: existingNext };

  try {
    const [nextRun] = await db.insert(routineRuns).values({
      userId,
      routineId: chain.nextRoutineId,
      mode: run.mode,
      queueStepIds: nextSteps.map((step) => step.id),
      context: { chainedFromRunId: runId, chainedFromRoutineId: run.routineId },
    }).returning();
    return { run: completed, nextRun: nextRun ?? null };
  } catch {
    const [racedNext] = await db.select().from(routineRuns).where(and(eq(routineRuns.userId, userId), eq(routineRuns.routineId, chain.nextRoutineId), eq(routineRuns.status, 'active'))).orderBy(desc(routineRuns.lastActivityAt)).limit(1);
    return { run: completed, nextRun: racedNext ?? null };
  }
}

export async function abandonRoutineRun(userId: string, runId: string) {
  const [run] = await db.update(routineRuns).set({ status: 'abandoned', lastActivityAt: new Date() }).where(and(eq(routineRuns.id, runId), eq(routineRuns.userId, userId), eq(routineRuns.status, 'active'))).returning();
  return run ?? null;
}

export async function upsertRoutineStepLink(
  userId: string,
  input: { stepId: string; targetType: 'task' | 'habit' | 'fitness'; targetId: string; metadata?: Record<string, unknown> },
) {
  const step = await ownedStep(userId, input.stepId);
  if (!step || !input.targetId.trim()) return null;
  if (input.targetType === 'task') {
    const [target] = await db.select({ id: tasks.id }).from(tasks).where(and(eq(tasks.id, input.targetId), eq(tasks.userId, userId))).limit(1);
    if (!target) return null;
  }
  if (input.targetType === 'habit') {
    const [target] = await db.select({ id: habits.id }).from(habits).where(and(eq(habits.id, input.targetId), eq(habits.userId, userId))).limit(1);
    if (!target) return null;
  }
  const [existing] = await db.select().from(routineStepLinks).where(and(eq(routineStepLinks.userId, userId), eq(routineStepLinks.stepId, input.stepId), eq(routineStepLinks.targetType, input.targetType), eq(routineStepLinks.targetId, input.targetId))).limit(1);
  if (existing) return existing;
  const [link] = await db.insert(routineStepLinks).values({ userId, ...input, metadata: input.metadata ?? {} }).returning();
  return link ?? null;
}

export async function removeRoutineStepLink(userId: string, id: string) {
  const [removed] = await db.delete(routineStepLinks).where(and(eq(routineStepLinks.id, id), eq(routineStepLinks.userId, userId))).returning();
  return removed ?? null;
}

export async function createRoutineTrigger(userId: string, input: { routineId: string; triggerType: string; config: Record<string, unknown> }) {
  const routine = await ownedRoutine(userId, input.routineId);
  if (!routine || routine.archived) return null;
  const [trigger] = await db.insert(routineTriggers).values({ userId, ...input }).returning();
  return trigger ?? null;
}

export async function toggleRoutineTrigger(userId: string, id: string, enabled: boolean) {
  const [trigger] = await db.update(routineTriggers).set({ enabled, updatedAt: new Date() }).where(and(eq(routineTriggers.id, id), eq(routineTriggers.userId, userId))).returning();
  return trigger ?? null;
}

export async function createRoutineStepRule(userId: string, input: { stepId: string; ruleType: string; config: Record<string, unknown> }) {
  const step = await ownedStep(userId, input.stepId);
  if (!step) return null;
  const [rule] = await db.insert(routineStepRules).values({ userId, ...input }).returning();
  return rule ?? null;
}

export async function toggleRoutineStepRule(userId: string, id: string, enabled: boolean) {
  const [rule] = await db.update(routineStepRules).set({ enabled, updatedAt: new Date() }).where(and(eq(routineStepRules.id, id), eq(routineStepRules.userId, userId))).returning();
  return rule ?? null;
}

export async function setRoutineChain(userId: string, sourceRoutineId: string, nextRoutineId: string | null) {
  const source = await ownedRoutine(userId, sourceRoutineId);
  if (!source || source.archived) return null;
  const [existing] = await db.select().from(routineChains).where(and(eq(routineChains.userId, userId), eq(routineChains.sourceRoutineId, sourceRoutineId))).limit(1);
  if (!nextRoutineId) {
    if (!existing) return null;
    const [removed] = await db.delete(routineChains).where(and(eq(routineChains.id, existing.id), eq(routineChains.userId, userId))).returning();
    return removed ?? null;
  }
  if (nextRoutineId === sourceRoutineId) return null;
  const next = await ownedRoutine(userId, nextRoutineId);
  if (!next || next.archived) return null;
  if (existing) {
    const [updated] = await db.update(routineChains).set({ nextRoutineId, enabled: true }).where(and(eq(routineChains.id, existing.id), eq(routineChains.userId, userId))).returning();
    return updated ?? null;
  }
  const [chain] = await db.insert(routineChains).values({ userId, sourceRoutineId, nextRoutineId }).returning();
  return chain ?? null;
}
