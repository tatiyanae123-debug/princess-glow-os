'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as data from '@/lib/data/advanced-beauty';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function refreshBeauty() {
  ['/beauty', '/dashboard', '/today', '/tomorrow', '/routines', '/habits', '/calendar'].forEach((path) => revalidatePath(path));
}

const startSchema = z.object({ ritualKey: z.string().min(1).max(80), title: z.string().min(1).max(160), mode: z.enum(['full','standard','quick','minimum']), queueRoutineIds: z.array(z.string().min(1)).min(1).max(100), context: z.record(z.unknown()).optional() });
const stepSchema = z.object({ runId: z.string().min(1), routineId: z.string().min(1), status: z.enum(['completed','skipped']), actualSeconds: z.number().int().min(0).max(7200), notes: z.string().max(1200).optional() });
const treatmentSchema = z.object({ treatmentKey: z.string().min(1).max(100), treatmentName: z.string().min(1).max(180), area: z.string().min(1).max(80), productId: z.string().nullable().optional(), response: z.enum(['comfortable','neutral','irritating']).nullable().optional(), notes: z.string().max(2000).optional() });
const maintenanceSchema = z.object({ title: z.string().min(1).max(180), category: z.string().min(1).max(80), cadenceDays: z.number().int().min(1).max(3650).nullable().optional(), nextDueAt: z.coerce.date().nullable().optional(), notes: z.string().max(1500).optional(), source: z.string().max(80).optional() });
const observationSchema = z.object({ kind: z.string().min(1).max(80), subject: z.string().min(1).max(160), confidence: z.string().max(40).optional(), body: z.string().min(1).max(3000), evidence: z.record(z.unknown()).optional() });

export async function startBeautyRitualAction(input: unknown) {
  const userId = await requireUser();
  const parsed = startSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: 'Beauty routine could not start because its plan was invalid.' };
  const run = await data.startBeautyRitual(userId, parsed.data);
  if (!run) return { data: null, error: 'Beauty routine has no valid saved steps.' };
  refreshBeauty();
  return { data: run, error: null };
}

export async function recordBeautyStepAction(input: unknown) {
  const userId = await requireUser();
  const parsed = stepSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: 'Glow could not save this Beauty step.' };
  const run = await data.recordBeautyStep(userId, parsed.data);
  if (!run) return { data: null, error: 'This step is not part of the active Beauty ritual.' };
  refreshBeauty();
  return { data: run, error: null };
}

export async function completeBeautyRitualAction(runId: string) {
  const userId = await requireUser();
  const run = await data.completeBeautyRitual(userId, runId);
  if (!run) return { data: null, error: 'Finish or intentionally skip every Beauty step before closing the ritual.' };
  refreshBeauty();
  return { data: run, error: null };
}

export async function abandonBeautyRitualAction(runId: string) {
  const userId = await requireUser();
  const run = await data.abandonBeautyRitual(userId, runId);
  refreshBeauty();
  return run ? { data: run, error: null } : { data: null, error: 'This Beauty ritual is no longer active.' };
}

export async function logBeautyTreatmentAction(input: unknown) {
  const userId = await requireUser();
  const parsed = treatmentSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: 'Treatment note is incomplete.' };
  const row = await data.logBeautyTreatment(userId, parsed.data);
  if (!row) return { data: null, error: 'Glow could not verify the selected Beauty product.' };
  refreshBeauty();
  return { data: row, error: null };
}

export async function createBeautyMaintenanceAction(input: unknown) {
  const userId = await requireUser();
  const parsed = maintenanceSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: 'Maintenance item is incomplete.' };
  const row = await data.createMaintenanceItem(userId, parsed.data);
  revalidatePath('/beauty');
  return { data: row, error: null };
}

export async function completeBeautyMaintenanceAction(id: string) {
  const userId = await requireUser();
  const row = await data.completeMaintenanceItem(userId, id);
  revalidatePath('/beauty');
  return row ? { data: row, error: null } : { data: null, error: 'Maintenance item was not found.' };
}

export async function saveBeautyObservationAction(input: unknown) {
  const userId = await requireUser();
  const parsed = observationSchema.safeParse(input);
  if (!parsed.success) return { data: null, error: 'Beauty note is incomplete.' };
  const row = await data.saveBeautyObservation(userId, parsed.data);
  revalidatePath('/beauty');
  return { data: row, error: null };
}

export async function dismissBeautyObservationAction(id: string) {
  const userId = await requireUser();
  const row = await data.dismissBeautyObservation(userId, id);
  revalidatePath('/beauty');
  return row ? { data: row, error: null } : { data: null, error: 'Beauty observation was not found.' };
}
