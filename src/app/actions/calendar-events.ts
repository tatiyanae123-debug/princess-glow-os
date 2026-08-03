'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createCalendarEventSchema, updateCalendarEventSchema } from '@/lib/validations/calendar-events';
import * as data from '@/lib/data/calendar-events';

export async function createCalendarEventAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createCalendarEventSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const event = await data.createCalendarEvent(userId, parsed.data);
  revalidatePath('/calendar');
  return { data: event };
}

export async function updateCalendarEventAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateCalendarEventSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const event = await data.updateCalendarEvent(id, userId, parsed.data);
  revalidatePath('/calendar');
  return { data: event };
}

export async function deleteCalendarEventAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const event = await data.deleteCalendarEvent(id, userId);
  revalidatePath('/calendar');
  return { data: event };
}
