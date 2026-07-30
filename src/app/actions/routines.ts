'use server';

import { revalidatePath } from 'next/cache';
import { createRoutineSchema, updateRoutineSchema, createRoutineStepSchema, updateRoutineStepSchema } from '@/lib/validations/routines';
import * as data from '@/lib/data/routines';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createRoutineAction(formData: unknown) {
  const parsed = createRoutineSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const routine = await data.createRoutine(MOCK_USER_ID, parsed.data);
  revalidatePath('/routines');
  return { data: routine };
}

export async function updateRoutineAction(id: string, formData: unknown) {
  const parsed = updateRoutineSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const routine = await data.updateRoutine(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/routines');
  return { data: routine };
}

export async function deleteRoutineAction(id: string) {
  const routine = await data.deleteRoutine(id, MOCK_USER_ID);
  revalidatePath('/routines');
  return { data: routine };
}

export async function createRoutineStepAction(formData: unknown) {
  const parsed = createRoutineStepSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const step = await data.createRoutineStep(MOCK_USER_ID, parsed.data);
  revalidatePath('/routines');
  return { data: step };
}

export async function updateRoutineStepAction(id: string, formData: unknown) {
  const parsed = updateRoutineStepSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const step = await data.updateRoutineStep(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/routines');
  return { data: step };
}

export async function deleteRoutineStepAction(id: string) {
  const step = await data.deleteRoutineStep(id, MOCK_USER_ID);
  revalidatePath('/routines');
  return { data: step };
}
