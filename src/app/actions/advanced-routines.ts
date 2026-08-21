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
  if (!run) return { data: null, error: 'This routine could not start. It may be archived, empty, or contain an invalid step queue.' };
  refreshRoutineSurfaces();
  return { data: run, error: undefined as string | undefined };
}

export async function updateRoutineRunAction(runId: string, input: { mode?: RoutineMode; queueStepIds?: string[]; completedStepIds?: string[]; skippedStepIds?: string[]; currentIndex?: number; actualSecondsDelta?: number; context?: Record<string, unknown> }) {
  const userId = await requireUser();
  const run = await data.updateRoutineRunProgress(userId, runId, input);
  return run ? { data: run, error: undefined as string | undefined } : { data: null, error: 'Routine run is no longer active or its step queue is invalid.' };
}

export async function completeRoutineStepAction(input: { runId: string; stepId: string; actualSeconds: number; dateKey: string }) {
  const userId = await requireUser();
  const result = await data.completeRoutineStep(userId, input);
  if (!result.run) return { data: null, error: 'This step is not part of the active routine run.' };
  refreshRoutineSurfaces();
  return { data: result, error: undefined as string | undefined };
}

export async function skipRoutineStepAction(input: { runId: string; stepId: string }) {
  const userId = await requireUser();
  const run = await data.skipRoutineStep(userId, input);
  return run ? { data: run, error: undefined as string | undefined } : { data: null, error: 'This step is not part of the active routine run.' };
}

export async function completeRoutineRunAction(runId: string) {
  const userId = await requireUser();
  const result = await data.completeRoutineRun(userId, runId);
  if (!result.run) return { data: null, error: 'Finish every queued step by completing or intentionally skipping it before closing this routine.' };
  refreshRoutineSurfaces();
  return { data: result, error: undefined as string | undefined };
}

export async function abandonRoutineRunAction(runId: string) {
  const userId = await requireUser();
  const run = await data.abandonRoutineRun(userId, runId);
  if (!run) return { data: null, error: 'Routine run was not active.' };
  refreshRoutineSurfaces();
  return { data: run, error: undefined as string | undefined };
}

export async function linkRoutineStepAction(input: { stepId: string; targetType: 'task' | 'habit' | 'fitness'; targetId: string; metadata?: Record<string, unknown> }) {
  const userId = await requireUser();
  const link = await data.upsertRoutineStepLink(userId, input);
  if (!link) return { data: null, error: 'Glow could not verify this routine-step connection.' };
  refreshRoutineSurfaces();
  return { data: link, error: undefined as string | undefined };
}

export async function unlinkRoutineStepAction(id: string) {
  const userId = await requireUser();
  const link = await data.removeRoutineStepLink(userId, id);
  if (!link) return { data: null, error: 'Link was not found.' };
  refreshRoutineSurfaces();
  return { data: link, error: undefined as string | undefined };
}

export async function createRoutineTriggerAction(input: { routineId: string; triggerType: string; config: Record<string, unknown> }) {
  const userId = await requireUser();
  if (!['time', 'calendar', 'event', 'weather', 'location'].includes(input.triggerType)) return { data: null, error: 'Unsupported routine trigger type.' };
  const trigger = await data.createRoutineTrigger(userId, input);
  if (!trigger) return { data: null, error: 'Glow could not verify that routine before saving the trigger.' };
  revalidatePath('/routines');
  return { data: trigger, error: undefined as string | undefined };
}

export async function toggleRoutineTriggerAction(id: string, enabled: boolean) {
  const userId = await requireUser();
  const trigger = await data.toggleRoutineTrigger(userId, id, enabled);
  return trigger ? { data: trigger, error: undefined as string | undefined } : { data: null, error: 'Trigger was not found.' };
}

export async function createRoutineStepRuleAction(input: { stepId: string; ruleType: string; config: Record<string, unknown> }) {
  const userId = await requireUser();
  if (!['location', 'weather', 'calendar'].includes(input.ruleType)) return { data: null, error: 'Unsupported routine condition type.' };
  const rule = await data.createRoutineStepRule(userId, input);
  if (!rule) return { data: null, error: 'Glow could not verify that routine step before saving the condition.' };
  revalidatePath('/routines');
  return { data: rule, error: undefined as string | undefined };
}

export async function toggleRoutineStepRuleAction(id: string, enabled: boolean) {
  const userId = await requireUser();
  const rule = await data.toggleRoutineStepRule(userId, id, enabled);
  return rule ? { data: rule, error: undefined as string | undefined } : { data: null, error: 'Condition was not found.' };
}

export async function setRoutineChainAction(sourceRoutineId: string, nextRoutineId: string | null) {
  const userId = await requireUser();
  const chain = await data.setRoutineChain(userId, sourceRoutineId, nextRoutineId);
  if (nextRoutineId && !chain) return { data: null, error: 'Glow could not verify both routines or the chain would point back to itself.' };
  revalidatePath('/routines');
  return { data: chain, error: undefined as string | undefined };
}
