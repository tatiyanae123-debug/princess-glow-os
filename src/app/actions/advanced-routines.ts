'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as data from '@/lib/data/advanced-routines';

type RoutineMode = 'full' | 'normal' | 'quick' | 'minimum';

function refreshRoutineSurfaces() {
  for (const path of ['/routines', '/dashboard', '/today', '/tomorrow', '/briefings/morning', '/briefings/evening', '/calendar', '/habits', '/tasks', '/fitness']) revalidatePath(path);
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

export async function startRoutineRunAction(input: { routineId: string; mode: RoutineMode; queueStepIds: string[]; context?: Record<string, unknown> }) {
  const userId = await requireUser();
  const run = await data.startOrResumeRoutineRun(userId, input);
  refreshRoutineSurfaces();
  return { data: run };
}

export async function updateRoutineRunAction(runId: string, input: { mode?: RoutineMode; queueStepIds?: string[]; completedStepIds?: string[]; skippedStepIds?: string[]; currentIndex?: number; actualSecondsDelta?: number; context?: Record<string, unknown> }) {
  const userId = await requireUser();
  const run = await data.updateRoutineRunProgress(userId, runId, input);
  return run ? { data: run } : { error: 'Routine run is no longer active.' };
}

export async function completeRoutineStepAction(input: { runId: string; stepId: string; actualSeconds: number; dateKey: string }) {
  const userId = await requireUser();
  const result = await data.completeRoutineStep(userId, input);
  refreshRoutineSurfaces();
  return result.run ? { data: result } : { error: 'Routine run is no longer active.' };
}

export async function skipRoutineStepAction(input: { runId: string; stepId: string }) {
  const userId = await requireUser();
  const run = await data.skipRoutineStep(userId, input);
  return run ? { data: run } : { error: 'Routine run is no longer active.' };
}

export async function completeRoutineRunAction(runId: string) {
  const userId = await requireUser();
  const result = await data.completeRoutineRun(userId, runId);
  refreshRoutineSurfaces();
  return result.run ? { data: result } : { error: 'Routine run was not found.' };
}

export async function abandonRoutineRunAction(runId: string) {
  const userId = await requireUser();
  const run = await data.abandonRoutineRun(userId, runId);
  refreshRoutineSurfaces();
  return run ? { data: run } : { error: 'Routine run was not active.' };
}

export async function linkRoutineStepAction(input: { stepId: string; targetType: 'task' | 'habit' | 'fitness'; targetId: string; metadata?: Record<string, unknown> }) {
  const userId = await requireUser();
  const link = await data.upsertRoutineStepLink(userId, input);
  refreshRoutineSurfaces();
  return { data: link };
}

export async function unlinkRoutineStepAction(id: string) {
  const userId = await requireUser();
  const link = await data.removeRoutineStepLink(userId, id);
  refreshRoutineSurfaces();
  return link ? { data: link } : { error: 'Link was not found.' };
}

export async function createRoutineTriggerAction(input: { routineId: string; triggerType: string; config: Record<string, unknown> }) {
  const userId = await requireUser();
  const trigger = await data.createRoutineTrigger(userId, input);
  revalidatePath('/routines');
  return { data: trigger };
}

export async function toggleRoutineTriggerAction(id: string, enabled: boolean) {
  const userId = await requireUser();
  const trigger = await data.toggleRoutineTrigger(userId, id, enabled);
  revalidatePath('/routines');
  return trigger ? { data: trigger } : { error: 'Trigger was not found.' };
}

export async function createRoutineStepRuleAction(input: { stepId: string; ruleType: string; config: Record<string, unknown> }) {
  const userId = await requireUser();
  const rule = await data.createRoutineStepRule(userId, input);
  revalidatePath('/routines');
  return { data: rule };
}

export async function toggleRoutineStepRuleAction(id: string, enabled: boolean) {
  const userId = await requireUser();
  const rule = await data.toggleRoutineStepRule(userId, id, enabled);
  revalidatePath('/routines');
  return rule ? { data: rule } : { error: 'Condition was not found.' };
}

export async function setRoutineChainAction(sourceRoutineId: string, nextRoutineId: string | null) {
  const userId = await requireUser();
  const chain = await data.setRoutineChain(userId, sourceRoutineId, nextRoutineId);
  revalidatePath('/routines');
  return { data: chain };
}
