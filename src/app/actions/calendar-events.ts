'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createCalendarEventSchema, updateCalendarEventSchema } from '@/lib/validations/calendar-events';
import * as data from '@/lib/data/calendar-events';
import { convertCalendarEventSchema } from '@/lib/validations/google-calendar';
import { createTask } from '@/lib/data/tasks';

function revalidateCalendarSurfaces() {
  revalidatePath('/calendar');
  revalidatePath('/dashboard');
  revalidatePath('/tasks');
  revalidatePath('/today');
  revalidatePath('/tomorrow');
  revalidatePath('/briefings/morning');
  revalidatePath('/briefings/evening');
}

export async function createCalendarEventAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createCalendarEventSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const event = await data.createCalendarEvent(userId, parsed.data);
  revalidateCalendarSurfaces();
  return { data: event };
}

export async function convertCalendarEventToTaskAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const parsed = convertCalendarEventSchema.safeParse(input);
  if (!parsed.success) return { error: { formErrors: ['Invalid calendar event.'] } };
  const event = await data.getCalendarEventById(parsed.data.eventId, session.user.id);
  if (!event || event.source !== 'google_calendar' || event.archived) {
    return { error: { formErrors: ['Google Calendar event not found.'] } };
  }
  const task = await createTask(session.user.id, {
    title: event.title,
    description: event.description ?? undefined,
    dueDate: event.startAt,
    status: 'pending',
    priority: 'medium',
  });
  revalidateCalendarSurfaces();
  return { data: task };
}

export async function updateCalendarEventAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateCalendarEventSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const event = await data.updateCalendarEvent(id, userId, parsed.data);
  revalidateCalendarSurfaces();
  return { data: event };
}

export async function deleteCalendarEventAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const event = await data.deleteCalendarEvent(id, userId);
  revalidateCalendarSurfaces();
  return { data: event };
}
