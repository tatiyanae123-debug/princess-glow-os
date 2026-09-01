'use server';

import { auth } from '@/auth';
import { updateTask } from '@/lib/data/tasks';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function revalidateTodayScenes() {
  for (const path of ['/dashboard', '/today', '/today/morning', '/today/flow', '/today/evening', '/tasks', '/tomorrow']) {
    revalidatePath(path);
  }
}

export async function completeTodayTaskAction(taskId: string): Promise<void> {
  const userId = await requireUserId();
  await updateTask(taskId, userId, { status: 'done', completedAt: new Date() });
  revalidateTodayScenes();
}

export async function moveTodayTaskToTomorrowAction(taskId: string): Promise<void> {
  const userId = await requireUserId();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  await updateTask(taskId, userId, { status: 'pending', dueDate: tomorrow, completedAt: undefined });
  revalidateTodayScenes();
}
