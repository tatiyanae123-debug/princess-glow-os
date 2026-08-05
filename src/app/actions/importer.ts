'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { buildImportPreview } from '@/lib/importer/preview';
import { confirmImportBatch, undoImportBatch } from '@/lib/importer/confirm';
import { confirmImportSchema } from '@/lib/validations/importer';
import type { ImportCategory } from '@/lib/glow-content/library';

export async function previewImportAction(categories: ImportCategory[]) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const preview = await buildImportPreview(session.user.id, categories);
  return { data: preview };
}

export async function confirmImportAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const parsed = confirmImportSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const batch = await confirmImportBatch(session.user.id, parsed.data);
  revalidatePath('/import');
  revalidatePath('/dashboard');
  revalidatePath('/tasks');
  revalidatePath('/habits');
  revalidatePath('/routines');
  revalidatePath('/beauty');
  revalidatePath('/calendar');
  return { data: batch };
}

export async function undoImportAction(batchId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const result = await undoImportBatch(session.user.id, batchId);
  revalidatePath('/import');
  revalidatePath('/dashboard');
  revalidatePath('/tasks');
  revalidatePath('/habits');
  revalidatePath('/routines');
  revalidatePath('/beauty');
  revalidatePath('/calendar');
  return { data: result };
}
