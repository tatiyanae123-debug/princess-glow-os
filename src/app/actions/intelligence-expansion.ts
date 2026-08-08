'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  await db.insert(lifeMemories).values({
    userId,
    title: title.slice(0, 300),
    category: String(formData.get('category') ?? 'personal').slice(0, 80),
    source: 'manual',
    summary: String(formData.get('summary') ?? '').trim().slice(0, 2000) || null,
    relatedArea: String(formData.get('relatedArea') ?? '').trim().slice(0, 120) || null,
    privacyLevel: 'private',
  });
  revalidatePath('/memory');
}

export async function createProjectAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return;
  await db.insert(projects).values({
    userId,
    title: title.slice(0, 300),
    area: String(formData.get('area') ?? 'personal').slice(0, 120),
    priority: String(formData.get('priority') ?? 'medium').slice(0, 40),
    nextAction: String(formData.get('nextAction') ?? '').trim().slice(0, 1000) || null,
  });
  revalidatePath('/projects');
}
