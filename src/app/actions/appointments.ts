'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createAppointmentSchema, updateAppointmentSchema } from '@/lib/validations/appointments';
import * as data from '@/lib/data/appointments';

export async function createAppointmentAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createAppointmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const appointment = await data.createAppointment(userId, parsed.data);
  revalidatePath('/calendar');
  return { data: appointment };
}

export async function updateAppointmentAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateAppointmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const appointment = await data.updateAppointment(id, userId, parsed.data);
  revalidatePath('/calendar');
  return { data: appointment };
}

export async function deleteAppointmentAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const appointment = await data.deleteAppointment(id, userId);
  revalidatePath('/calendar');
  return { data: appointment };
}
