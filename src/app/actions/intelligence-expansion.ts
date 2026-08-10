'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { lifeMemories, planningBlocks, projects } from '@/db/schema/intelligence-expansion';
import { prepareAppleReminderBridge } from '@/lib/apple-reminders/service';
import type { ScheduleItem } from '@/lib/intelligence/domain';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function optionalDate(raw: string) {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function prepareAppleReminderBridgeAction() {
  const userId = await requireUser();
  const key = await prepareAppleReminderBridge(userId);
  revalidatePath('/connections');
  return { data: { key } };
}

export async function acceptPlanningSuggestionAction(input: { proposalId: string; item: ScheduleItem }) {
  const userId = await requireUser();
  const item = input.item;
  const [row] = await db.insert(planningBlocks).values({
    userId,
    proposalId: input.proposalId,
    sourceType: item.sourceType,
    sourceId: item.sourceId,
    title: item.title,
    reason: item.reason,
    startAt: new Date(item.startAt),
    endAt: new Date(item.endAt),
  }).returning();
  revalidatePath('/planning');
  return { data: row };
}

export async function createLifeMemoryAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const title = text(formData, 'title');
  if (!title) return;
  await db.insert(lifeMemories).values({
    userId,
    title: title.slice(0, 300),
    category: (text(formData, 'category') || 'personal').slice(0, 80),
    source: 'manual',
    summary: text(formData, 'summary').slice(0, 2000) || null,
    relatedArea: text(formData, 'relatedArea').slice(0, 120) || null,
    privacyLevel: 'private',
  });
  revalidatePath('/memory');
}

export async function setLifeMemoryArchivedAction(id: string, archived: boolean): Promise<void> {
  const userId = await requireUser();
  await db
    .update(lifeMemories)
    .set({ archived })
    .where(and(eq(lifeMemories.id, id), eq(lifeMemories.userId, userId)));
  revalidatePath('/memory');
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const title = text(formData, 'title');
  if (!title) return;
  await db.insert(projects).values({
    userId,
    title: title.slice(0, 300),
    area: (text(formData, 'area') || 'personal').slice(0, 120),
    priority: (text(formData, 'priority') || 'medium').slice(0, 40),
    nextAction: text(formData, 'nextAction').slice(0, 1000) || null,
    deadline: optionalDate(text(formData, 'deadline')),
  });
  revalidatePath('/projects');
}

export async function updateProjectAction(id: string, formData: FormData): Promise<void> {
  const userId = await requireUser();
  const progressRaw = Number(text(formData, 'progress'));
  const progress = Number.isFinite(progressRaw) ? Math.max(0, Math.min(100, Math.round(progressRaw))) : 0;
  const status = text(formData, 'status') || 'active';
  const priority = text(formData, 'priority') || 'medium';

  await db
    .update(projects)
    .set({
      status: status.slice(0, 40),
      priority: priority.slice(0, 40),
      progress,
      nextAction: text(formData, 'nextAction').slice(0, 1000) || null,
      deadline: optionalDate(text(formData, 'deadline')),
      notes: text(formData, 'notes').slice(0, 3000) || null,
      updatedAt: new Date(),
    })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)));

  revalidatePath('/projects');
}
