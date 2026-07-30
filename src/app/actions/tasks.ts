'use server';

import { revalidatePath } from 'next/cache';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations/tasks';
import * as data from '@/lib/data/tasks';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createTaskAction(formData: unknown) {
  const parsed = createTaskSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const task = await data.createTask(MOCK_USER_ID, parsed.data);
  revalidatePath('/tasks');
  return { data: task };
}

export async function updateTaskAction(id: string, formData: unknown) {
  const parsed = updateTaskSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const task = await data.updateTask(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/tasks');
  return { data: task };
}

export async function deleteTaskAction(id: string) {
  const task = await data.deleteTask(id, MOCK_USER_ID);
  revalidatePath('/tasks');
  return { data: task };
}
