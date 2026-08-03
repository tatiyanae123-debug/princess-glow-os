'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createImportantLinkSchema, updateImportantLinkSchema } from '@/lib/validations/important-links';
import * as data from '@/lib/data/important-links';

export async function createImportantLinkAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createImportantLinkSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const link = await data.createImportantLink(userId, parsed.data);
  revalidatePath('/notes');
  return { data: link };
}

export async function updateImportantLinkAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateImportantLinkSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const link = await data.updateImportantLink(id, userId, parsed.data);
  revalidatePath('/notes');
  return { data: link };
}

export async function deleteImportantLinkAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const link = await data.deleteImportantLink(id, userId);
  revalidatePath('/notes');
  return { data: link };
}
