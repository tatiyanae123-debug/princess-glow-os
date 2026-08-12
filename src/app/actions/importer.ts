'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { buildImportPreview } from '@/lib/importer/preview';
import { confirmImportBatch, undoImportBatch } from '@/lib/importer/confirm';
import { isDuplicate } from '@/lib/importer/duplicate-detection';
import { confirmImportSchema } from '@/lib/validations/importer';
import type { ImportCategory, ImportTemplate } from '@/lib/glow-content/library';

export async function previewImportAction(categories: ImportCategory[]) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const preview = await buildImportPreview(session.user.id, categories);
  return { data: preview };
}

export async function previewUploadedImportAction(items: unknown) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/sign-in');

  const parsed = confirmImportSchema.safeParse({ batchCategory: 'uploaded', items });
  if (!parsed.success) return { error: parsed.error.flatten() };

  const preview = await Promise.all(
    parsed.data.items.map(async (item) => ({
      item,
      duplicate: await isDuplicate(userId, item as ImportTemplate),
    })),
  );

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
