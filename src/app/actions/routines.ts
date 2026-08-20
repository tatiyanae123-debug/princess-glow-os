'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createRoutineSchema, updateRoutineSchema, createRoutineStepSchema, updateRoutineStepSchema } from '@/lib/validations/routines';
import * as data from '@/lib/data/routines';

function revalidateRoutineSurfaces() {
  for (const path of [
    '/routines',
    '/dashboard',
    '/today',
    '/tomorrow',
    '/briefings/morning',
    '/briefings/evening',
    '/calendar',
    '/habits',
  ]) revalidatePath(path);
}

export async function createRoutineAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createRoutineSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const routine = await data.createRoutine(userId, parsed.data);
  revalidateRoutineSurfaces();
  return { data: routine };
}

export async function updateRoutineAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateRoutineSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const routine = await data.updateRoutine(id, userId, parsed.data);
  revalidateRoutineSurfaces();
  return { data: routine };
}

export async function deleteRoutineAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const routine = await data.deleteRoutine(id, userId);
  revalidateRoutineSurfaces();
  return { data: routine };
}

export async function createRoutineStepAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createRoutineStepSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const step = await data.createRoutineStep(userId, parsed.data);
  revalidateRoutineSurfaces();
  return { data: step };
}

export async function updateRoutineStepAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateRoutineStepSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const step = await data.updateRoutineStep(id, userId, parsed.data);
  revalidateRoutineSurfaces();
  return { data: step };
}

export async function deleteRoutineStepAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const step = await data.deleteRoutineStep(id, userId);
  revalidateRoutineSurfaces();
  return { data: step };
}
