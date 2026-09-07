'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '@/auth';
import { createCalendarEvent } from '@/lib/data/calendar-events';
import { mergePlanObjectSetting, savePlanObjectSetting } from '@/lib/plan/object-settings';

const settingsSchema = z.object({
  key: z.string().min(1).max(220).refine((value) => value.startsWith('plan:'), 'Plan settings key required.'),
  patch: z.record(z.unknown()),
  label: z.string().max(220).optional().nullable(),
});

export async function savePlanObjectSettingAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in.' };
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid Plan setting.' };
  try {
    const row = await mergePlanObjectSetting(session.user.id, parsed.data.key, parsed.data.patch, parsed.data.label);
    revalidatePath('/habits');
    revalidatePath('/routines');
    revalidatePath('/goals');
    revalidatePath('/projects');
    revalidatePath('/planning/studio');
    revalidatePath('/reminders');
    return { data: { key: row.systemKey, preferences: row.preferences } };
  } catch (error) {
    console.error('[Glow OS] Unable to save Plan setting', error);
    return { error: 'Unable to save this Plan setting right now.' };
  }
}

const draftEventSchema = z.object({
  id: z.string().min(1).max(220),
  title: z.string().min(1).max(255),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  status: z.enum(['draft', 'tentative']),
  sourceType: z.enum(['idea', 'scenario', 'manual']).default('manual'),
});

const approveScenarioSchema = z.object({
  scenarioId: z.string().min(1).max(220),
  name: z.string().min(1).max(160),
  events: z.array(draftEventSchema).max(40),
});

export async function approvePlanScenarioAction(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Not signed in.' };
  const parsed = approveScenarioSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid planning scenario.' };

  try {
    const created: string[] = [];
    for (const event of parsed.data.events) {
      const saved = await createCalendarEvent(session.user.id, {
        title: event.title,
        description: `Added from Planning Studio · ${parsed.data.name} · source ${event.sourceType}`,
        startAt: new Date(event.startAt),
        endAt: new Date(event.endAt),
        allDay: false,
        color: '#9c8ce8',
      });
      created.push(saved.id);
    }

    await savePlanObjectSetting(session.user.id, `plan:planning-studio:scenario:${parsed.data.scenarioId}`, {
      name: parsed.data.name,
      approvedAt: new Date().toISOString(),
      createdCalendarEventIds: created,
      state: 'approved',
    }, parsed.data.name);

    revalidatePath('/calendar');
    revalidatePath('/planning');
    revalidatePath('/planning/studio');
    return { data: { createdIds: created } };
  } catch (error) {
    console.error('[Glow OS] Unable to approve planning scenario', error);
    return { error: 'The scenario could not be added to your calendar.' };
  }
}
