import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  aiProposals,
  auditEvents,
  beautyProducts,
  briefingSnapshots,
  closetItems,
  financeGoals,
  fitnessSessions,
  hairLogs,
  intelligentObservations,
  lifeTimelineEvents,
  planningPeriods,
} from '@/db/schema/completion-v1';

export function getPlanningPeriods(userId: string) {
  return db.select().from(planningPeriods).where(and(eq(planningPeriods.userId, userId), eq(planningPeriods.archived, false))).orderBy(desc(planningPeriods.updatedAt));
}

export function getAiProposals(userId: string) {
  return db.select().from(aiProposals).where(eq(aiProposals.userId, userId)).orderBy(desc(aiProposals.createdAt));
}

export function getAuditEvents(userId: string) {
  return db.select().from(auditEvents).where(eq(auditEvents.userId, userId)).orderBy(desc(auditEvents.createdAt)).limit(50);
}

export function getObservations(userId: string) {
  return db.select().from(intelligentObservations).where(eq(intelligentObservations.userId, userId)).orderBy(desc(intelligentObservations.createdAt));
}

export function getBeautyProducts(userId: string) {
  return db.select().from(beautyProducts).where(and(eq(beautyProducts.userId, userId), eq(beautyProducts.archived, false))).orderBy(desc(beautyProducts.createdAt));
}

export function getHairLogs(userId: string) {
  return db.select().from(hairLogs).where(eq(hairLogs.userId, userId)).orderBy(desc(hairLogs.occurredAt)).limit(100);
}

export function getFitnessSessions(userId: string) {
  return db.select().from(fitnessSessions).where(eq(fitnessSessions.userId, userId)).orderBy(desc(fitnessSessions.occurredAt)).limit(100);
}

export function getClosetItems(userId: string) {
  return db.select().from(closetItems).where(eq(closetItems.userId, userId)).orderBy(desc(closetItems.createdAt));
}

export function getFinanceGoals(userId: string) {
  return db.select().from(financeGoals).where(eq(financeGoals.userId, userId)).orderBy(desc(financeGoals.updatedAt));
}

export function getTimelineEvents(userId: string) {
  return db.select().from(lifeTimelineEvents).where(eq(lifeTimelineEvents.userId, userId)).orderBy(desc(lifeTimelineEvents.occurredAt)).limit(250);
}

export function getBriefings(userId: string) {
  return db.select().from(briefingSnapshots).where(eq(briefingSnapshots.userId, userId)).orderBy(desc(briefingSnapshots.generatedAt)).limit(30);
}
