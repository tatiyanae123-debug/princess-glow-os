'use server';

import { revalidatePath } from 'next/cache';
import { createGoalSchema, updateGoalSchema } from '@/lib/validations/goals';
import * as data from '@/lib/data/goals';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createGoalAction(formData: unknown) {
  const parsed = createGoalSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const goal = await data.createGoal(MOCK_USER_ID, parsed.data);
  revalidatePath('/goals');
  return { data: goal };
}

export async function updateGoalAction(id: string, formData: unknown) {
  const parsed = updateGoalSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const goal = await data.updateGoal(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/goals');
  return { data: goal };
}

export async function deleteGoalAction(id: string) {
  const goal = await data.deleteGoal(id, MOCK_USER_ID);
  revalidatePath('/goals');
  return { data: goal };
}
