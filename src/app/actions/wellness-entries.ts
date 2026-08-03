'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createWellnessEntrySchema, updateWellnessEntrySchema } from '@/lib/validations/wellness-entries';
import * as data from '@/lib/data/wellness-entries';

export async function createWellnessEntryAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createWellnessEntrySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const entry = await data.createWellnessEntry(userId, parsed.data);
  revalidatePath('/wellness');
  return { data: entry };
}

export async function updateWellnessEntryAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateWellnessEntrySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const entry = await data.updateWellnessEntry(id, userId, parsed.data);
  revalidatePath('/wellness');
  return { data: entry };
}

export async function deleteWellnessEntryAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const entry = await data.deleteWellnessEntry(id, userId);
  revalidatePath('/wellness');
  return { data: entry };
}
