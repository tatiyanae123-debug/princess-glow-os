'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/auth';
import { db } from '@/db';
import { aiProposals, planningPeriods } from '@/db/schema/completion-v1';
import { interpretGlowUtterance } from '@/lib/intelligence/glow-semantic-intent';
import {
  isPlannerView,
  plannerFocus,
  plannerPeriodBounds,
  plannerProgress,
  type PlannerDocumentData,
  type PlannerView,
} from '@/lib/planning/planner-templates-v1';

const saveSchema = z.object({
  view: z.enum(['today', 'tomorrow', 'week', 'month']),
  periodKey: z.string().trim().min(1).max(40),
  data: z.object({
    version: z.literal(1),
    view: z.enum(['today', 'tomorrow', 'week', 'month']),
    periodKey: z.string().max(40),
    values: z.record(z.union([z.string().max(12000), z.boolean()])),
  }),
});

const routeSchema = z.object({
  view: z.enum(['today', 'tomorrow', 'week', 'month']),
  periodKey: z.string().trim().min(1).max(40),
  text: z.string().trim().min(1).max(12000),
});

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function revalidatePlanner() {
  revalidatePath('/planning');
  revalidatePath('/planning/planner');
  revalidatePath('/planning/planner/today');
  revalidatePath('/planning/planner/tomorrow');
  revalidatePath('/planning/planner/week');
  revalidatePath('/planning/planner/month');
  revalidatePath('/planning/planner/archive');
  revalidatePath('/planning/planner/insights');
}

export async function savePlannerTemplateAction(input: {
  view: PlannerView;
  periodKey: string;
  data: PlannerDocumentData;
}) {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success || !isPlannerView(parsed.data.view)) {
    return { ok: false as const, error: 'Planner data could not be saved.' };
  }

  const userId = await requireUser();
  const data: PlannerDocumentData = {
    ...parsed.data.data,
    view: parsed.data.view,
    periodKey: parsed.data.periodKey,
  };
  const serialized = JSON.stringify(data);
  if (serialized.length > 100_000) {
    return { ok: false as const, error: 'This planner page is too large to autosave safely.' };
  }

  const level = `planner-v1:${parsed.data.view}`;
  const [existing] = await db
    .select({ id: planningPeriods.id })
    .from(planningPeriods)
    .where(and(
      eq(planningPeriods.userId, userId),
      eq(planningPeriods.level, level),
      eq(planningPeriods.title, parsed.data.periodKey),
      eq(planningPeriods.archived, false),
    ))
    .orderBy(desc(planningPeriods.updatedAt))
    .limit(1);

  const { start, end } = plannerPeriodBounds(parsed.data.view, parsed.data.periodKey);
  const nextValues = {
    focus: plannerFocus(data),
    reflection: serialized,
    progress: plannerProgress(data),
    startsAt: start,
    endsAt: end,
    updatedAt: new Date(),
  };

  let id = existing?.id;
  if (existing) {
    await db
      .update(planningPeriods)
      .set(nextValues)
      .where(and(eq(planningPeriods.id, existing.id), eq(planningPeriods.userId, userId)));
  } else {
    const [created] = await db
      .insert(planningPeriods)
      .values({
        userId,
        level,
        title: parsed.data.periodKey,
        ...nextValues,
      })
      .returning({ id: planningPeriods.id });
    id = created?.id;
  }

  revalidatePlanner();
  return { ok: true as const, id: id ?? null, savedAt: new Date().toISOString() };
}

export async function routePlannerCaptureAction(input: {
  view: PlannerView;
  periodKey: string;
  text: string;
}) {
  const parsed = routeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: 'Add something to the capture box first.', created: 0, routes: [] };
  }

  const userId = await requireUser();
  const sourceRoute = `/planning/planner/${parsed.data.view}`;
  const intent = await interpretGlowUtterance({
    text: parsed.data.text,
    sourceRoute,
    world: 'plan',
    selectedContext: `${parsed.data.view} planner for ${parsed.data.periodKey}`,
    history: [],
  });

  if (!intent) {
    return {
      ok: false as const,
      message: 'Glow could not interpret this capture right now. Your original text is still saved.',
      created: 0,
      routes: [],
    };
  }

  if (intent.mode === 'clarify') {
    return {
      ok: true as const,
      message: intent.clarification || 'Glow needs one detail before routing this.',
      created: 0,
      routes: [],
    };
  }

  if (!intent.actions.length) {
    return {
      ok: true as const,
      message: 'Glow read this as context, not a commitment. It stays in your planner and was not turned into a task.',
      created: 0,
      routes: [],
    };
  }

  const pending = await db
    .select({ payload: aiProposals.payload })
    .from(aiProposals)
    .where(and(eq(aiProposals.userId, userId), eq(aiProposals.status, 'pending')))
    .orderBy(desc(aiProposals.createdAt))
    .limit(80);

  const existingKeys = new Set(
    pending.flatMap(({ payload }) => {
      const key = payload && typeof payload === 'object' && typeof payload.sourceKey === 'string'
        ? payload.sourceKey
        : null;
      return key ? [key] : [];
    }),
  );

  let created = 0;
  const routes: Array<{ title: string; type: string; destinations: string[] }> = [];

  for (const action of intent.actions.slice(0, 8)) {
    const sourceKey = [
      'planner-v1',
      parsed.data.view,
      parsed.data.periodKey,
      action.type,
      action.sourceText.trim().toLowerCase(),
    ].join(':');
    routes.push({ title: action.title, type: action.type, destinations: action.destinations });
    if (existingKeys.has(sourceKey)) continue;

    const destinationLabel = action.destinations.length ? action.destinations.join(', ') : 'Glow';
    const payload = action.type === 'task'
      ? {
          actionType: 'create_task',
          task: { title: action.title, priority: 'medium', dueDate: null },
          sourceKey,
          source: {
            type: 'planner_capture',
            route: sourceRoute,
            view: parsed.data.view,
            periodKey: parsed.data.periodKey,
            sourceText: action.sourceText,
            destinations: action.destinations,
          },
        }
      : {
          actionType: 'advisory',
          sourceKey,
          source: {
            type: 'planner_capture',
            route: sourceRoute,
            view: parsed.data.view,
            periodKey: parsed.data.periodKey,
            sourceText: action.sourceText,
            semanticType: action.type,
            destinations: action.destinations,
          },
        };

    await db.insert(aiProposals).values({
      userId,
      intent: `planner_capture:${action.type}`,
      summary: `${action.title} → ${destinationLabel}`,
      reason: 'Glow interpreted this from Planner Capture. It is queued for review instead of silently changing your Life Model.',
      confidence: action.confidence,
      reversible: action.type === 'task',
      payload,
    });
    existingKeys.add(sourceKey);
    created += 1;
  }

  revalidatePath('/concierge');
  revalidatePath('/tasks');
  revalidatePlanner();

  return {
    ok: true as const,
    message: created
      ? `${created} ${created === 1 ? 'item is' : 'items are'} ready for review. Nothing was executed silently.`
      : 'Glow already routed these items for review.',
    created,
    routes,
  };
}
