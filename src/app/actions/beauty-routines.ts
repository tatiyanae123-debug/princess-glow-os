'use server';

import { revalidatePath } from 'next/cache';
import { createBeautyRoutineSchema, updateBeautyRoutineSchema } from '@/lib/validations/beauty-routines';
import * as data from '@/lib/data/beauty-routines';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createBeautyRoutineAction(formData: unknown) {
  const parsed = createBeautyRoutineSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const routine = await data.createBeautyRoutine(MOCK_USER_ID, parsed.data);
  revalidatePath('/beauty');
  return { data: routine };
}

export async function updateBeautyRoutineAction(id: string, formData: unknown) {
  const parsed = updateBeautyRoutineSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const routine = await data.updateBeautyRoutine(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/beauty');
  return { data: routine };
}

export async function deleteBeautyRoutineAction(id: string) {
  const routine = await data.deleteBeautyRoutine(id, MOCK_USER_ID);
  revalidatePath('/beauty');
  return { data: routine };
}
