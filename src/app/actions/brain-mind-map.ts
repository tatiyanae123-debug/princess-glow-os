'use server';

import { and, asc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/db';
import { brainMindMapLinks } from '@/db/schema/intelligence-expansion';

const allowedHrefs = new Set([
  '/tasks',
  '/calendar',
  '/projects',
  '/goals',
  '/beauty',
  '/beauty/lab',
  '/hair',
  '/wellness',
  '/fitness',
  '/food',
  '/finance',
  '/finance/brain',
  '/work',
  '/memory',
  '/timeline',
  '/notes',
]);

const linkInput = z.object({
  label: z.string().trim().min(1).max(40),
  href: z.string().trim().min(1).max(120),
});

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

export async function getBrainMindMapLinksAction() {
  const userId = await requireUser();
  const rows = await db
    .select({ id: brainMindMapLinks.id, label: brainMindMapLinks.label, href: brainMindMapLinks.href })
    .from(brainMindMapLinks)
    .where(eq(brainMindMapLinks.userId, userId))
    .orderBy(asc(brainMindMapLinks.createdAt));
  return { data: rows };
}

export async function createBrainMindMapLinkAction(input: { label: string; href: string }) {
  const userId = await requireUser();
  const parsed = linkInput.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten() };
  if (!allowedHrefs.has(parsed.data.href)) {
    return { error: { formErrors: ['Choose a real Glow OS room.'] } };
  }

  const existing = await db
    .select({ id: brainMindMapLinks.id, label: brainMindMapLinks.label, href: brainMindMapLinks.href })
    .from(brainMindMapLinks)
    .where(and(
      eq(brainMindMapLinks.userId, userId),
      eq(brainMindMapLinks.href, parsed.data.href),
      eq(brainMindMapLinks.label, parsed.data.label),
    ))
    .limit(1);

  if (existing[0]) return { data: existing[0] };

  const [created] = await db
    .insert(brainMindMapLinks)
    .values({ userId, ...parsed.data })
    .returning({ id: brainMindMapLinks.id, label: brainMindMapLinks.label, href: brainMindMapLinks.href });

  revalidatePath('/brain');
  return { data: created };
}

export async function deleteBrainMindMapLinkAction(id: string) {
  const userId = await requireUser();
  const [deleted] = await db
    .delete(brainMindMapLinks)
    .where(and(eq(brainMindMapLinks.id, id), eq(brainMindMapLinks.userId, userId)))
    .returning({ id: brainMindMapLinks.id });
  revalidatePath('/brain');
  return { data: deleted ?? null };
}
