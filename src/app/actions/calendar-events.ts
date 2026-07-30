'use server';

import { revalidatePath } from 'next/cache';
import { createCalendarEventSchema, updateCalendarEventSchema } from '@/lib/validations/calendar-events';
import * as data from '@/lib/data/calendar-events';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createCalendarEventAction(formData: unknown) {
  const parsed = createCalendarEventSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const event = await data.createCalendarEvent(MOCK_USER_ID, parsed.data);
  revalidatePath('/calendar');
  return { data: event };
}

export async function updateCalendarEventAction(id: string, formData: unknown) {
  const parsed = updateCalendarEventSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const event = await data.updateCalendarEvent(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/calendar');
  return { data: event };
}

export async function deleteCalendarEventAction(id: string) {
  const event = await data.deleteCalendarEvent(id, MOCK_USER_ID);
  revalidatePath('/calendar');
  return { data: event };
}
