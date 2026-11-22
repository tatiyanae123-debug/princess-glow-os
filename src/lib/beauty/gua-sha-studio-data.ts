import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { lifeTimelineEvents } from '@/db/schema/completion-v1';
import { lifeMemories } from '@/db/schema/intelligence-expansion';
import { MASTER_BEAUTY_INVENTORY } from '@/lib/beauty/skincare-master';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

const FACIAL_ROUTINE_MATCH = /gua\s*sha|facial\s*massage|face\s*massage|facial\s*movement|lymphatic|face\s*yoga|jaw|cheek|neck\s*release/i;
const FAVORITE_SOURCE_PREFIX = 'gua-sha-routine:';

export type GuaShaSavedStep = {
  id: string;
  name: string;
  notes: string | null;
  products: string[];
  stepOrder: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  source: string | null;
};

export type GuaShaOwnedTool = {
  name: string;
  status: 'confirmed' | 'backup' | 'needs-confirmation' | 'needs-identification';
  quantity: number;
  notes: string | null;
};

export type GuaShaRecentSession = {
  id: string;
  title: string;
  occurredAt: string;
  summary: string | null;
};

export async function getGuaShaStudioData(userId: string) {
  const [routines, timeline, favoriteMemories] = await Promise.all([
    getBeautyRoutinesByUser(userId),
    db
      .select({
        id: lifeTimelineEvents.id,
        title: lifeTimelineEvents.title,
        occurredAt: lifeTimelineEvents.occurredAt,
        summary: lifeTimelineEvents.summary,
      })
      .from(lifeTimelineEvents)
      .where(and(eq(lifeTimelineEvents.userId, userId), eq(lifeTimelineEvents.category, 'gua_sha_session')))
      .orderBy(desc(lifeTimelineEvents.occurredAt))
      .limit(10),
    db
      .select({ source: lifeMemories.source })
      .from(lifeMemories)
      .where(and(
        eq(lifeMemories.userId, userId),
        eq(lifeMemories.category, 'gua_sha_routine_favorite'),
        eq(lifeMemories.pinned, true),
        eq(lifeMemories.archived, false),
      )),
  ]);

  const savedRoutineSteps: GuaShaSavedStep[] = routines
    .filter((routine) => FACIAL_ROUTINE_MATCH.test(`${routine.name} ${routine.notes ?? ''}`))
    .map((routine) => ({
      id: routine.id,
      name: routine.name,
      notes: routine.notes ?? null,
      products: routine.products ?? [],
      stepOrder: routine.stepOrder,
      timeOfDay: routine.timeOfDay,
      source: routine.source ?? null,
    }))
    .sort((a, b) => a.stepOrder - b.stepOrder);

  const ownedTools: GuaShaOwnedTool[] = MASTER_BEAUTY_INVENTORY
    .filter((record) => record.category === 'Gua Sha + Massage Tools')
    .map((record) => ({
      name: record.name,
      status: record.status,
      quantity: record.quantity ?? 1,
      notes: record.notes ?? null,
    }));

  const linkedSlipProducts = Array.from(
    new Set(savedRoutineSteps.flatMap((step) => step.products).map((name) => name.trim()).filter(Boolean)),
  );

  const recentSessions: GuaShaRecentSession[] = timeline.map((entry) => ({
    id: entry.id,
    title: entry.title,
    occurredAt: entry.occurredAt.toISOString(),
    summary: entry.summary ?? null,
  }));

  const favoriteRoutineSlugs = favoriteMemories
    .map((memory) => memory.source.startsWith(FAVORITE_SOURCE_PREFIX) ? memory.source.slice(FAVORITE_SOURCE_PREFIX.length) : '')
    .filter(Boolean);

  return { savedRoutineSteps, ownedTools, linkedSlipProducts, recentSessions, favoriteRoutineSlugs };
}
