import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { personalRules } from '@/db/schema/adaptive-os';

export async function getPersonalRules(userId: string) {
  return db.select().from(personalRules).where(eq(personalRules.userId, userId)).orderBy(desc(personalRules.priority), desc(personalRules.createdAt));
}

export async function createPersonalRule(userId: string, input: { title: string; ruleType: string; priority?: number; conditionText?: string; effectText?: string }) {
  const [created] = await db.insert(personalRules).values({
    userId,
    title: input.title,
    ruleType: input.ruleType,
    priority: input.priority ?? 50,
    condition: { description: input.conditionText ?? '' },
    effect: { description: input.effectText ?? '' },
    source: 'user',
    enabled: true,
  }).returning();
  return created;
}

export async function setPersonalRuleEnabled(userId: string, ruleId: string, enabled: boolean) {
  const [updated] = await db.update(personalRules).set({ enabled, updatedAt: new Date() }).where(and(eq(personalRules.id, ruleId), eq(personalRules.userId, userId))).returning();
  return updated ?? null;
}

export async function deletePersonalRule(userId: string, ruleId: string) {
  const [deleted] = await db.delete(personalRules).where(and(eq(personalRules.id, ruleId), eq(personalRules.userId, userId))).returning();
  return deleted ?? null;
}
