import 'server-only';

import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { getTaskByGmailMessageId } from '@/lib/data/tasks';
import type { CreateTaskFromEmailInput } from '@/lib/validations/gmail-task';

const GMAIL_TASK_SOURCE = 'gmail' as const;

function buildDescription(input: CreateTaskFromEmailInput) {
  const from = input.from ? `From: ${input.from}` : null;
  return [from, input.snippet].filter(Boolean).join('\n\n') || undefined;
}

/**
 * Creates a normal Glow OS task (same `tasks` table and shape used
 * everywhere else in the app) from a Gmail message the user explicitly
 * chose to turn into a task. Never touches the Gmail message itself —
 * this only reads the fields it was given and writes a new task row.
 * Idempotent: calling this again with the same messageId returns the
 * existing task instead of creating a duplicate.
 */
export async function createTaskFromEmail(userId: string, input: CreateTaskFromEmailInput) {
  const existing = await getTaskByGmailMessageId(userId, input.messageId);
  if (existing) {
    return { task: existing, created: false as const };
  }

  const [task] = await db
    .insert(tasks)
    .values({
      userId,
      title: input.subject || '(No subject)',
      description: buildDescription(input),
      status: 'pending',
      priority: 'medium',
      source: GMAIL_TASK_SOURCE,
      sourceVersion: 'gmail-message',
      editable: true,
      sourceMessageId: input.messageId,
      sourceThreadId: input.threadId,
    })
    .returning();

  return { task, created: true as const };
}
