'use server';

import { revalidatePath } from 'next/cache';
import { createAppointmentSchema, updateAppointmentSchema } from '@/lib/validations/appointments';
import * as data from '@/lib/data/appointments';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createAppointmentAction(formData: unknown) {
  const parsed = createAppointmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const appointment = await data.createAppointment(MOCK_USER_ID, parsed.data);
  revalidatePath('/calendar');
  return { data: appointment };
}

export async function updateAppointmentAction(id: string, formData: unknown) {
  const parsed = updateAppointmentSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const appointment = await data.updateAppointment(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/calendar');
  return { data: appointment };
}

export async function deleteAppointmentAction(id: string) {
  const appointment = await data.deleteAppointment(id, MOCK_USER_ID);
  revalidatePath('/calendar');
  return { data: appointment };
}
