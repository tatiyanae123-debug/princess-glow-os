import 'server-only';

import { and, desc, eq, like } from 'drizzle-orm';
import { db } from '@/db';
import { planningPeriods } from '@/db/schema/completion-v1';
import {
  isPlannerView,
  parsePlannerDocument,
  type PlannerDocumentRecord,
} from '@/lib/planning/planner-templates-v1';

export async function getPlannerTemplateDocuments(userId: string): Promise<PlannerDocumentRecord[]> {
  try {
    const rows = await db
      .select()
      .from(planningPeriods)
      .where(and(
        eq(planningPeriods.userId, userId),
        eq(planningPeriods.archived, false),
        like(planningPeriods.level, 'planner-v1:%'),
      ))
      .orderBy(desc(planningPeriods.updatedAt))
      .limit(365);

    return rows.flatMap((row) => {
      const view = row.level.replace('planner-v1:', '');
      if (!isPlannerView(view)) return [];
      const data = parsePlannerDocument(row.reflection, view, row.title);
      return [{
        id: row.id,
        view,
        periodKey: row.title,
        data,
        focus: row.focus,
        progress: row.progress,
        startsAt: row.startsAt?.toISOString() ?? null,
        endsAt: row.endsAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      } satisfies PlannerDocumentRecord];
    });
  } catch (error) {
    console.error('[Glow OS] Planner Templates V1 unavailable', error);
    return [];
  }
}
