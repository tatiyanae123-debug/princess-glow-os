'use server';

import { and, eq, or } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { taskDependencies } from '@/db/schema/adaptive-os';
import { tasks } from '@/db/schema/tasks';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function uid() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

const allowedDependencyTypes = new Set(['blocks', 'precedes', 'requires']);

export async function createDependencyAction(formData: FormData) {
  const userId = await uid();
  const predecessorId = String(formData.get('predecessorId') ?? '');
  const successorId = String(formData.get('successorId') ?? '');
  const requestedType = String(formData.get('dependencyType') ?? 'blocks');
  const dependencyType = allowedDependencyTypes.has(requestedType) ? requestedType : 'blocks';

  if (!predecessorId || !successorId || predecessorId === successorId) return;

  const ownedTasks = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        or(eq(tasks.id, predecessorId), eq(tasks.id, successorId)),
      ),
    );

  if (new Set(ownedTasks.map((task) => task.id)).size !== 2) return;

  const existing = await db
    .select({
      predecessorId: taskDependencies.predecessorId,
      successorId: taskDependencies.successorId,
    })
    .from(taskDependencies)
    .where(
      and(
        eq(taskDependencies.userId, userId),
        eq(taskDependencies.predecessorType, 'task'),
        eq(taskDependencies.successorType, 'task'),
        or(
          and(
            eq(taskDependencies.predecessorId, predecessorId),
            eq(taskDependencies.successorId, successorId),
          ),
          and(
            eq(taskDependencies.predecessorId, successorId),
            eq(taskDependencies.successorId, predecessorId),
          ),
        ),
      ),
    );

  // Duplicate edges add no value, and a direct reverse edge creates an immediate cycle.
  if (existing.length > 0) return;

  await db.insert(taskDependencies).values({
    userId,
    predecessorType: 'task',
    predecessorId,
    successorType: 'task',
    successorId,
    dependencyType,
  });

  revalidatePath('/tasks');
  revalidatePath('/today');
}

export async function deleteDependencyAction(id: string) {
  const userId = await uid();
  await db
    .delete(taskDependencies)
    .where(and(eq(taskDependencies.id, id), eq(taskDependencies.userId, userId)));
  revalidatePath('/tasks');
  revalidatePath('/today');
}
