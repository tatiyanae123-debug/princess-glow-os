'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { auth } from '@/auth';
import * as data from '@/lib/data/advanced-habits';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function refreshHabitSurfaces() {
  ['/habits','/dashboard','/today','/tomorrow','/calendar','/routines','/fitness','/briefings/morning','/briefings/evening'].forEach((path) => revalidatePath(path));
}

const profileSchema = z.object({
  area: z.string().min(1).max(80).optional(),
  timeBand: z.enum(['morning','afternoon','evening','night','anytime']).optional(),
  importanceTier: z.enum(['essential','growth','nice']).optional(),
  fullLabel: z.string().max(180).nullable().optional(),
  fullMinutes: z.number().int().min(1).max(480).optional(),
  quickLabel: z.string().max(180).nullable().optional(),
  quickMinutes: z.number().int().min(1).max(240).optional(),
  minimumLabel: z.string().max(180).nullable().optional(),
  minimumMinutes: z.number().int().min(1).max(120).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  contextMode: z.string().min(1).max(80).optional(),
  identityStatement: z.string().max(300).nullable().optional(),
  whyItMatters: z.string().max(500).nullable().optional(),
  preferredAnchor: z.string().max(180).nullable().optional(),
  weeklyTarget: z.number().int().min(1).max(31).nullable().optional(),
  rollingGoalType: z.enum(['days','count','minutes','quantity','yesno']).optional(),
  rollingTarget: z.number().int().min(1).max(100000).nullable().optional(),
  focus: z.boolean().optional(),
  pausedUntil: z.date().nullable().optional(),
  pausedIndefinitely: z.boolean().optional(),
  seasonalStartMonth: z.number().int().min(1).max(12).nullable().optional(),
  seasonalEndMonth: z.number().int().min(1).max(12).nullable().optional(),
  progressiveLevel: z.number().int().min(1).max(100).optional(),
});

export async function upsertHabitProfileAction(habitId: string, raw: unknown) {
  const userId = await requireUser();
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { error: 'Glow could not save those habit settings.' };
  const profile = await data.upsertHabitProfile(userId, habitId, parsed.data);
  refreshHabitSurfaces();
  return { data: profile };
}

export async function completeHabitIntelligenceAction(raw: unknown) {
  const userId = await requireUser();
  const parsed = z.object({
    habitId: z.string().min(1),
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    version: z.enum(['full','quick','minimum']).default('full'),
    actualSeconds: z.number().int().min(1).max(86400).nullable().optional(),
    quantity: z.number().int().min(1).max(100000).optional(),
    helpedBy: z.string().max(120).nullable().optional(),
    friction: z.string().max(120).nullable().optional(),
  }).safeParse(raw);
  if (!parsed.success) return { error: 'Glow could not save this habit completion.' };
  const result = await data.completeHabit(userId, parsed.data);
  if (!result) return { error: 'That habit is no longer available.' };
  refreshHabitSurfaces();
  return { data: result };
}

export async function intentionalSkipHabitAction(raw: unknown) {
  const userId = await requireUser();
  const parsed = z.object({ habitId: z.string().min(1), dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().max(180).nullable().optional() }).parse(raw);
  const result = await data.intentionalSkipHabit(userId, parsed.habitId, parsed.dateKey, parsed.reason);
  if (!result) throw new Error('That habit is no longer available.');
  refreshHabitSurfaces();
  return { data: result, error: undefined as string | undefined };
}

export async function createHabitTriggerAction(raw: unknown) {
  const userId = await requireUser();
  const parsed = z.object({ habitId: z.string().min(1), triggerType: z.enum(['time','habit','routine','calendar','location','context']), triggerValue: z.string().min(1).max(180) }).safeParse(raw);
  if (!parsed.success) return { error: 'Glow could not create that trigger.' };
  const row = await data.createHabitTrigger(userId, parsed.data);
  revalidatePath('/habits');
  return { data: row };
}

export async function deleteHabitTriggerAction(id: string) {
  const userId = await requireUser();
  const row = await data.deleteHabitTrigger(userId, id);
  revalidatePath('/habits');
  return { data: row };
}

export async function createHabitStackAction(raw: unknown) {
  const userId = await requireUser();
  const parsed = z.object({ name: z.string().min(1).max(120), anchorType: z.string().max(40).optional(), anchorValue: z.string().max(180).nullable().optional(), habitIds: z.array(z.string().min(1)).min(1).max(20) }).safeParse(raw);
  if (!parsed.success) return { error: 'Glow could not create that habit stack.' };
  const row = await data.createHabitStack(userId, parsed.data);
  revalidatePath('/habits');
  return { data: row };
}

export async function createHabitExperimentAction(raw: unknown) {
  const userId = await requireUser();
  const parsed = z.object({ habitId: z.string().min(1), hypothesis: z.string().min(1).max(500), change: z.string().min(1).max(500), days: z.number().int().min(3).max(90).default(14), baselineRate: z.number().min(0).max(1).nullable().optional() }).safeParse(raw);
  if (!parsed.success) return { error: 'Glow could not create that experiment.' };
  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + parsed.data.days);
  const row = await data.createHabitExperiment(userId, { habitId: parsed.data.habitId, hypothesis: parsed.data.hypothesis, change: parsed.data.change, endsAt, baselineRate: parsed.data.baselineRate ?? null });
  revalidatePath('/habits');
  return { data: row };
}

export async function createHabitSourceLinkAction(raw: unknown) {
  const userId = await requireUser();
  const parsed = z.object({ habitId: z.string().min(1), sourceType: z.enum(['fitness','routine','task','goal']), sourceId: z.string().min(1).max(200) }).safeParse(raw);
  if (!parsed.success) return { error: 'Glow could not create that source link.' };
  const row = await data.createHabitSourceLink(userId, parsed.data);
  revalidatePath('/habits');
  return { data: row };
}
