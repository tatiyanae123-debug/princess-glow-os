import 'server-only';

import { and, eq, like } from 'drizzle-orm';
import { db } from '@/db';
import { systemPreferences } from '@/db/schema/interconnected-os';

export type PlanObjectPreferences = Record<string, unknown>;

export async function getPlanObjectSetting(userId: string, key: string): Promise<PlanObjectPreferences> {
  try {
    const [row] = await db.select({ preferences: systemPreferences.preferences })
      .from(systemPreferences)
      .where(and(eq(systemPreferences.userId, userId), eq(systemPreferences.systemKey, key)))
      .limit(1);
    return row?.preferences ?? {};
  } catch (error) {
    console.error('[Glow OS] Plan object setting unavailable', error);
    return {};
  }
}

export async function getPlanObjectSettingsByPrefix(userId: string, prefix: string) {
  try {
    const rows = await db.select({
      key: systemPreferences.systemKey,
      preferences: systemPreferences.preferences,
      label: systemPreferences.label,
      updatedAt: systemPreferences.updatedAt,
    })
      .from(systemPreferences)
      .where(and(eq(systemPreferences.userId, userId), like(systemPreferences.systemKey, `${prefix}%`)));
    return new Map(rows.map((row) => [row.key, row]));
  } catch (error) {
    console.error('[Glow OS] Plan object settings unavailable', error);
    return new Map<string, { key: string; preferences: PlanObjectPreferences; label: string | null; updatedAt: Date }>();
  }
}

export async function savePlanObjectSetting(
  userId: string,
  key: string,
  preferences: PlanObjectPreferences,
  label?: string | null,
) {
  const now = new Date();
  const [row] = await db.insert(systemPreferences)
    .values({
      userId,
      systemKey: key,
      label: label ?? null,
      preferences,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [systemPreferences.userId, systemPreferences.systemKey],
      set: { preferences, label: label ?? null, updatedAt: now },
    })
    .returning();
  return row;
}

export async function mergePlanObjectSetting(
  userId: string,
  key: string,
  patch: PlanObjectPreferences,
  label?: string | null,
) {
  const current = await getPlanObjectSetting(userId, key);
  return savePlanObjectSetting(userId, key, { ...current, ...patch }, label);
}
