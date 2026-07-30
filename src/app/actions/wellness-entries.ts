'use server';

import { revalidatePath } from 'next/cache';
import { createWellnessEntrySchema, updateWellnessEntrySchema } from '@/lib/validations/wellness-entries';
import * as data from '@/lib/data/wellness-entries';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createWellnessEntryAction(formData: unknown) {
  const parsed = createWellnessEntrySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const entry = await data.createWellnessEntry(MOCK_USER_ID, parsed.data);
  revalidatePath('/wellness');
  return { data: entry };
}

export async function updateWellnessEntryAction(id: string, formData: unknown) {
  const parsed = updateWellnessEntrySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const entry = await data.updateWellnessEntry(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/wellness');
  return { data: entry };
}

export async function deleteWellnessEntryAction(id: string) {
  const entry = await data.deleteWellnessEntry(id, MOCK_USER_ID);
  revalidatePath('/wellness');
  return { data: entry };
}
