'use server';

import { revalidatePath } from 'next/cache';
import { createHabitSchema, updateHabitSchema, createHabitLogSchema } from '@/lib/validations/habits';
import * as data from '@/lib/data/habits';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createHabitAction(formData: unknown) {
  const parsed = createHabitSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const habit = await data.createHabit(MOCK_USER_ID, parsed.data);
  revalidatePath('/habits');
  return { data: habit };
}

export async function updateHabitAction(id: string, formData: unknown) {
  const parsed = updateHabitSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const habit = await data.updateHabit(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/habits');
  return { data: habit };
}

export async function deleteHabitAction(id: string) {
  const habit = await data.deleteHabit(id, MOCK_USER_ID);
  revalidatePath('/habits');
  return { data: habit };
}

export async function logHabitAction(formData: unknown) {
  const parsed = createHabitLogSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const log = await data.createHabitLog(MOCK_USER_ID, parsed.data);
  revalidatePath('/habits');
  return { data: log };
}
