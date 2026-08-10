'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ingestFile, ingestText } from '@/lib/intelligence/universal-intake';

async function userId() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

export async function universalIntakeAction(formData: FormData) {
  const id = await userId();
  const text = String(formData.get('text') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const file = formData.get('file');
  try {
    const result = file instanceof File && file.size > 0 ? await ingestFile(id, file, note || text) : text ? await ingestText(id, text) : null;
    if (!result) return { error: 'Add text, paste information, or choose a file first.' };
    revalidatePath('/intake');
    revalidatePath('/inbox');
    revalidatePath('/today');
    return { ok: true, type: result.classification.type, title: result.classification.title, destinations: result.classification.destinations };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Glow could not process that intake.' };
  }
}
