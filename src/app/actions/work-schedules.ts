'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createWorkScheduleSchema, updateWorkScheduleSchema } from '@/lib/validations/work-schedules';
import * as data from '@/lib/data/work-schedules';

export async function createWorkScheduleAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createWorkScheduleSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const schedule = await data.createWorkSchedule(userId, parsed.data);
  revalidatePath('/work');
  return { data: schedule };
}

export async function updateWorkScheduleAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateWorkScheduleSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const schedule = await data.updateWorkSchedule(id, userId, parsed.data);
  revalidatePath('/work');
  return { data: schedule };
}

export async function deleteWorkScheduleAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const schedule = await data.deleteWorkSchedule(id, userId);
  revalidatePath('/work');
  return { data: schedule };
}
