'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createGoalSchema, updateGoalSchema } from '@/lib/validations/goals';
import * as data from '@/lib/data/goals';

export async function createGoalAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createGoalSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const goal = await data.createGoal(userId, parsed.data);
  revalidatePath('/goals');
  return { data: goal };
}

export async function updateGoalAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateGoalSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const goal = await data.updateGoal(id, userId, parsed.data);
  revalidatePath('/goals');
  return { data: goal };
}

export async function deleteGoalAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const goal = await data.deleteGoal(id, userId);
  revalidatePath('/goals');
  return { data: goal };
}
