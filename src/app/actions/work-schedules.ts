'use server';

import { revalidatePath } from 'next/cache';
import { createWorkScheduleSchema, updateWorkScheduleSchema } from '@/lib/validations/work-schedules';
import * as data from '@/lib/data/work-schedules';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createWorkScheduleAction(formData: unknown) {
  const parsed = createWorkScheduleSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const schedule = await data.createWorkSchedule(MOCK_USER_ID, parsed.data);
  revalidatePath('/work');
  return { data: schedule };
}

export async function updateWorkScheduleAction(id: string, formData: unknown) {
  const parsed = updateWorkScheduleSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const schedule = await data.updateWorkSchedule(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/work');
  return { data: schedule };
}

export async function deleteWorkScheduleAction(id: string) {
  const schedule = await data.deleteWorkSchedule(id, MOCK_USER_ID);
  revalidatePath('/work');
  return { data: schedule };
}
