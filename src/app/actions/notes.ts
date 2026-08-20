'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createNoteSchema, updateNoteSchema } from '@/lib/validations/notes';
import * as data from '@/lib/data/notes';

const NOTE_SURFACES = ['/notes', '/dashboard', '/today', '/tomorrow', '/briefings/morning', '/briefings/evening', '/search', '/brain'];
function revalidateNoteSurfaces() {
  NOTE_SURFACES.forEach((path) => revalidatePath(path));
}

export async function createNoteAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createNoteSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const note = await data.createNote(userId, parsed.data);
  revalidateNoteSurfaces();
  return { data: note };
}

export async function updateNoteAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateNoteSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const note = await data.updateNote(id, userId, parsed.data);
  revalidateNoteSurfaces();
  return { data: note };
}

export async function deleteNoteAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const note = await data.deleteNote(id, userId);
  revalidateNoteSurfaces();
  return { data: note };
}
