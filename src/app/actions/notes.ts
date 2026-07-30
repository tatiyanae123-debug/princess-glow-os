'use server';

import { revalidatePath } from 'next/cache';
import { createNoteSchema, updateNoteSchema } from '@/lib/validations/notes';
import * as data from '@/lib/data/notes';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createNoteAction(formData: unknown) {
  const parsed = createNoteSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const note = await data.createNote(MOCK_USER_ID, parsed.data);
  revalidatePath('/notes');
  return { data: note };
}

export async function updateNoteAction(id: string, formData: unknown) {
  const parsed = updateNoteSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const note = await data.updateNote(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/notes');
  return { data: note };
}

export async function deleteNoteAction(id: string) {
  const note = await data.deleteNote(id, MOCK_USER_ID);
  revalidatePath('/notes');
  return { data: note };
}
