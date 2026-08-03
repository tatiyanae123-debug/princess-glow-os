'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createBeautyRoutineSchema, updateBeautyRoutineSchema } from '@/lib/validations/beauty-routines';
import * as data from '@/lib/data/beauty-routines';

export async function createBeautyRoutineAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createBeautyRoutineSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const routine = await data.createBeautyRoutine(userId, parsed.data);
  revalidatePath('/beauty');
  return { data: routine };
}

export async function updateBeautyRoutineAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateBeautyRoutineSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const routine = await data.updateBeautyRoutine(id, userId, parsed.data);
  revalidatePath('/beauty');
  return { data: routine };
}

export async function deleteBeautyRoutineAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const routine = await data.deleteBeautyRoutine(id, userId);
  revalidatePath('/beauty');
  return { data: routine };
}
