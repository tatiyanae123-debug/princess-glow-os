'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations/tasks';
import * as data from '@/lib/data/tasks';

export async function createTaskAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createTaskSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const task = await data.createTask(userId, parsed.data);
  revalidatePath('/tasks');
  return { data: task };
}

export async function updateTaskAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateTaskSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const task = await data.updateTask(id, userId, parsed.data);
  revalidatePath('/tasks');
  return { data: task };
}

export async function deleteTaskAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const task = await data.deleteTask(id, userId);
  revalidatePath('/tasks');
  return { data: task };
}
