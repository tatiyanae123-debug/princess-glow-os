'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/db';
import { aiProposals, auditEvents } from '@/db/schema/completion-v1';
import { tasks } from '@/db/schema/tasks';

const proposalSchema = z.discriminatedUnion('actionType', [
  z.object({
    actionType: z.literal('advisory'),
    intent: z.string().trim().min(1).max(300),
    summary: z.string().trim().min(1).max(1000),
    reason: z.string().trim().min(1).max(2000),
  }),
  z.object({
    actionType: z.literal('create_task'),
    intent: z.string().trim().min(1).max(300),
    summary: z.string().trim().min(1).max(1000),
    reason: z.string().trim().min(1).max(2000),
    taskTitle: z.string().trim().min(1).max(300),
    taskPriority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    taskDueDate: z.string().trim().max(80).optional(),
  }),
]);

const executableTaskPayloadSchema = z.object({
  actionType: z.literal('create_task'),
  task: z.object({
    title: z.string().trim().min(1).max(300),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    dueDate: z.string().nullable().optional(),
  }),
  execution: z.object({
    entityType: z.literal('task'),
    entityId: z.string(),
    executedAt: z.string(),
    reversedAt: z.string().optional(),
  }).optional(),
});

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function parseOptionalDate(raw?: string | null) {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function revalidateConciergeSurfaces() {
  revalidatePath('/concierge');
  revalidatePath('/tasks');
  revalidatePath('/today');
  revalidatePath('/dashboard');
}

export async function createConciergeProposalAction(formData: FormData) {
  const userId = await requireUser();
  const actionType = value(formData, 'actionType') || 'advisory';
  const base = {
    actionType,
    intent: value(formData, 'intent'),
    summary: value(formData, 'summary'),
    reason: value(formData, 'reason'),
  };
  const candidate = actionType === 'create_task'
    ? {
        ...base,
        taskTitle: value(formData, 'taskTitle') || base.summary,
        taskPriority: value(formData, 'taskPriority') || 'medium',
        taskDueDate: value(formData, 'taskDueDate') || undefined,
      }
    : base;
  const parsed = proposalSchema.safeParse(candidate);
  if (!parsed.success) return;

  const payload = parsed.data.actionType === 'create_task'
    ? {
        actionType: 'create_task' as const,
        task: {
          title: parsed.data.taskTitle,
          priority: parsed.data.taskPriority,
          dueDate: parseOptionalDate(parsed.data.taskDueDate)?.toISOString() ?? null,
        },
      }
    : { actionType: 'advisory' as const };

  await db.insert(aiProposals).values({
    userId,
    intent: parsed.data.intent,
    summary: parsed.data.summary,
    reason: parsed.data.reason,
    confidence: parsed.data.actionType === 'create_task' ? 0.9 : 0.75,
    reversible: parsed.data.actionType === 'create_task',
    payload,
  });
  revalidateConciergeSurfaces();
}

export async function decideConciergeProposalAction(id: string, decision: 'approved' | 'rejected') {
  const userId = await requireUser();
  const [proposal] = await db
    .select()
    .from(aiProposals)
    .where(and(eq(aiProposals.id, id), eq(aiProposals.userId, userId)))
    .limit(1);
  if (!proposal || proposal.status !== 'pending') return;

  const now = new Date();
  let nextPayload = proposal.payload;
  let executedEntity: { entityType: 'task'; entityId: string } | null = null;

  if (decision === 'approved') {
    const executable = executableTaskPayloadSchema.safeParse(proposal.payload);
    if (executable.success && !executable.data.execution) {
      const [existingTask] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(and(
          eq(tasks.userId, userId),
          eq(tasks.source, 'ai_concierge'),
          eq(tasks.sourceVersion, proposal.id),
        ))
        .limit(1);
      const entityId = existingTask?.id ?? (await db
        .insert(tasks)
        .values({
          userId,
          title: executable.data.task.title,
          priority: executable.data.task.priority,
          dueDate: parseOptionalDate(executable.data.task.dueDate),
          source: 'ai_concierge',
          sourceVersion: proposal.id,
        })
        .returning({ id: tasks.id }))[0]?.id;
      if (!entityId) return;
      executedEntity = { entityType: 'task', entityId };
      nextPayload = {
        ...executable.data,
        execution: {
          entityType: 'task',
          entityId,
          executedAt: now.toISOString(),
        },
      };
    }
  }

  await db
    .update(aiProposals)
    .set({ status: decision, decidedAt: now, payload: nextPayload })
    .where(and(eq(aiProposals.id, id), eq(aiProposals.userId, userId), eq(aiProposals.status, 'pending')));

  await db.insert(auditEvents).values({
    userId,
    action: `ai_proposal_${decision}`,
    entityType: 'ai_proposal',
    entityId: id,
    details: {
      intent: proposal.intent,
      summary: proposal.summary,
      actionType: typeof proposal.payload?.actionType === 'string' ? proposal.payload.actionType : 'advisory',
      executedEntity,
    },
  });
  revalidateConciergeSurfaces();
}

export async function reverseConciergeProposalAction(id: string) {
  const userId = await requireUser();
  const [proposal] = await db
    .select()
    .from(aiProposals)
    .where(and(eq(aiProposals.id, id), eq(aiProposals.userId, userId)))
    .limit(1);
  if (!proposal || proposal.status !== 'approved' || !proposal.reversible) return;

  const executable = executableTaskPayloadSchema.safeParse(proposal.payload);
  if (!executable.success || !executable.data.execution || executable.data.execution.reversedAt) return;

  const [deletedTask] = await db
    .delete(tasks)
    .where(and(
      eq(tasks.id, executable.data.execution.entityId),
      eq(tasks.userId, userId),
      eq(tasks.source, 'ai_concierge'),
      eq(tasks.sourceVersion, proposal.id),
    ))
    .returning({ id: tasks.id });
  if (!deletedTask) return;

  const reversedAt = new Date();
  const nextPayload = {
    ...executable.data,
    execution: {
      ...executable.data.execution,
      reversedAt: reversedAt.toISOString(),
    },
  };

  await db
    .update(aiProposals)
    .set({ status: 'reversed', payload: nextPayload })
    .where(and(eq(aiProposals.id, id), eq(aiProposals.userId, userId), eq(aiProposals.status, 'approved')));

  await db.insert(auditEvents).values({
    userId,
    action: 'ai_proposal_reversed',
    entityType: 'ai_proposal',
    entityId: id,
    details: {
      intent: proposal.intent,
      summary: proposal.summary,
      reversedEntity: { entityType: 'task', entityId: deletedTask.id },
    },
  });
  revalidateConciergeSurfaces();
}
