import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/validations/tasks';

export async function getTasksByUser(userId: string) {
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.archived, false)))
    .orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: string, userId: string) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
  return task ?? null;
}

// Used for "Create task from email" duplicate prevention — a Gmail message
// should never produce two tasks even if the user clicks the button twice.
export async function getTaskByGmailMessageId(userId: string, messageId: string) {
  const [task] = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.sourceMessageId, messageId)));
  return task ?? null;
}

export async function createTask(userId: string, data: CreateTaskInput) {
  const [task] = await db
    .insert(tasks)
    .values({ ...data, userId })
    .returning();
  return task;
}

export async function updateTask(id: string, userId: string, data: UpdateTaskInput) {
  const [task] = await db
    .update(tasks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();
  return task ?? null;
}

export async function deleteTask(id: string, userId: string) {
  const [task] = await db
    .update(tasks)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
    .returning();
  return task ?? null;
}
