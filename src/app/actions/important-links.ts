'use server';

import { revalidatePath } from 'next/cache';
import { createImportantLinkSchema, updateImportantLinkSchema } from '@/lib/validations/important-links';
import * as data from '@/lib/data/important-links';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createImportantLinkAction(formData: unknown) {
  const parsed = createImportantLinkSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const link = await data.createImportantLink(MOCK_USER_ID, parsed.data);
  revalidatePath('/notes');
  return { data: link };
}

export async function updateImportantLinkAction(id: string, formData: unknown) {
  const parsed = updateImportantLinkSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const link = await data.updateImportantLink(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/notes');
  return { data: link };
}

export async function deleteImportantLinkAction(id: string) {
  const link = await data.deleteImportantLink(id, MOCK_USER_ID);
  revalidatePath('/notes');
  return { data: link };
}
