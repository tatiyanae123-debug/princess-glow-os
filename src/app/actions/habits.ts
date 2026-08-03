'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createHabitSchema, updateHabitSchema, createHabitLogSchema } from '@/lib/validations/habits';
import * as data from '@/lib/data/habits';

export async function createHabitAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createHabitSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const habit = await data.createHabit(userId, parsed.data);
  revalidatePath('/habits');
  return { data: habit };
}

export async function updateHabitAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateHabitSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const habit = await data.updateHabit(id, userId, parsed.data);
  revalidatePath('/habits');
  return { data: habit };
}

export async function deleteHabitAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const habit = await data.deleteHabit(id, userId);
  revalidatePath('/habits');
  return { data: habit };
}

export async function logHabitAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createHabitLogSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const log = await data.createHabitLog(userId, parsed.data);
  revalidatePath('/habits');
  return { data: log };
}
