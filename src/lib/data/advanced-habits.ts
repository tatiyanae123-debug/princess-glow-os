import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';
import { db } from '@/db';
import { habits, habitLogs } from '@/db/schema/habits';
import {
  habitCompletionDetails,
  habitExperiments,
  habitProfiles,
  habitSourceLinks,
  habitStacks,
  habitTimingStats,
  habitTriggers,
} from '@/db/schema/advanced-habits';

export async function getHabitProfiles(userId: string) {
  return db.select().from(habitProfiles).where(eq(habitProfiles.userId, userId));
}

export async function getHabitCompletionDetails(userId: string, startDate: string, endDate: string) {
  return db.select().from(habitCompletionDetails)
    .where(and(eq(habitCompletionDetails.userId, userId), gte(habitCompletionDetails.dateKey, startDate), lte(habitCompletionDetails.dateKey, endDate)))
    .orderBy(desc(habitCompletionDetails.completedAt));
}

export async function getHabitTimingStats(userId: string) {
  return db.select().from(habitTimingStats).where(eq(habitTimingStats.userId, userId));
}

export async function getHabitTriggers(userId: string) {
  return db.select().from(habitTriggers).where(eq(habitTriggers.userId, userId));
}

export async function getHabitStacks(userId: string) {
  return db.select().from(habitStacks).where(eq(habitStacks.userId, userId)).orderBy(asc(habitStacks.createdAt));
}

export async function getHabitExperiments(userId: string) {
  return db.select().from(habitExperiments).where(eq(habitExperiments.userId, userId)).orderBy(desc(habitExperiments.createdAt));
}

export async function getHabitSourceLinks(userId: string) {
  return db.select().from(habitSourceLinks).where(eq(habitSourceLinks.userId, userId));
}

export async function upsertHabitProfile(userId: string, habitId: string, values: Partial<typeof habitProfiles.$inferInsert>) {
  const [existing] = await db.select().from(habitProfiles)
    .where(and(eq(habitProfiles.userId, userId), eq(habitProfiles.habitId, habitId))).limit(1);
  if (existing) {
    const [updated] = await db.update(habitProfiles).set({ ...values, updatedAt: new Date() })
      .where(eq(habitProfiles.id, existing.id)).returning();
    return updated;
  }
  const [created] = await db.insert(habitProfiles).values({ userId, habitId, ...values }).returning();
  return created;
}

function timeBand(date: Date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < 10) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 20.5) return 'evening';
  return 'night';
}

export async function completeHabit(userId: string, input: {
  habitId: string;
  dateKey: string;
  version?: 'full' | 'quick' | 'minimum';
  actualSeconds?: number | null;
  quantity?: number;
  sourceType?: string;
  sourceId?: string | null;
  helpedBy?: string | null;
  friction?: string | null;
}) {
  const [habit] = await db.select().from(habits).where(and(eq(habits.id, input.habitId), eq(habits.userId, userId))).limit(1);
  if (!habit || habit.archived) return null;

  let [log] = await db.select().from(habitLogs).where(and(
    eq(habitLogs.userId, userId), eq(habitLogs.habitId, input.habitId), eq(habitLogs.loggedDate, input.dateKey),
  )).limit(1);
  if (!log) {
    [log] = await db.insert(habitLogs).values({ userId, habitId: input.habitId, loggedDate: input.dateKey, count: Math.max(1, input.quantity ?? 1) }).returning();
  } else if ((input.quantity ?? 1) > log.count) {
    [log] = await db.update(habitLogs).set({ count: input.quantity ?? log.count }).where(eq(habitLogs.id, log.id)).returning();
  }

  const [detail] = await db.insert(habitCompletionDetails).values({
    userId,
    habitId: input.habitId,
    dateKey: input.dateKey,
    version: input.version ?? 'full',
    actualSeconds: input.actualSeconds ?? null,
    quantity: Math.max(1, input.quantity ?? 1),
    intentionalSkip: false,
    sourceType: input.sourceType ?? 'habits',
    sourceId: input.sourceId ?? null,
    helpedBy: input.helpedBy ?? null,
    friction: input.friction ?? null,
  }).onConflictDoUpdate({
    target: [habitCompletionDetails.userId, habitCompletionDetails.habitId, habitCompletionDetails.dateKey],
    set: {
      version: input.version ?? 'full',
      actualSeconds: input.actualSeconds ?? null,
      quantity: Math.max(1, input.quantity ?? 1),
      intentionalSkip: false,
      sourceType: input.sourceType ?? 'habits',
      sourceId: input.sourceId ?? null,
      helpedBy: input.helpedBy ?? null,
      friction: input.friction ?? null,
      completedAt: new Date(),
    },
  }).returning();

  if (input.actualSeconds && input.actualSeconds > 0) {
    const [stat] = await db.select().from(habitTimingStats).where(and(eq(habitTimingStats.userId, userId), eq(habitTimingStats.habitId, input.habitId))).limit(1);
    const band = timeBand(new Date());
    if (stat) {
      const nextCount = stat.sampleCount + 1;
      const nextAverage = Math.round(((stat.averageSeconds * stat.sampleCount) + input.actualSeconds) / nextCount);
      await db.update(habitTimingStats).set({
        sampleCount: nextCount,
        averageSeconds: nextAverage,
        morningCount: stat.morningCount + (band === 'morning' ? 1 : 0),
        afternoonCount: stat.afternoonCount + (band === 'afternoon' ? 1 : 0),
        eveningCount: stat.eveningCount + (band === 'evening' ? 1 : 0),
        nightCount: stat.nightCount + (band === 'night' ? 1 : 0),
        updatedAt: new Date(),
      }).where(eq(habitTimingStats.id, stat.id));
    } else {
      await db.insert(habitTimingStats).values({
        userId,
        habitId: input.habitId,
        sampleCount: 1,
        averageSeconds: input.actualSeconds,
        morningCount: band === 'morning' ? 1 : 0,
        afternoonCount: band === 'afternoon' ? 1 : 0,
        eveningCount: band === 'evening' ? 1 : 0,
        nightCount: band === 'night' ? 1 : 0,
      });
    }
  }
  return { log, detail };
}

export async function intentionalSkipHabit(userId: string, habitId: string, dateKey: string, reason?: string | null) {
  const [habit] = await db.select().from(habits).where(and(eq(habits.id, habitId), eq(habits.userId, userId))).limit(1);
  if (!habit || habit.archived) return null;
  const [detail] = await db.insert(habitCompletionDetails).values({
    userId, habitId, dateKey, version: 'minimum', quantity: 0, intentionalSkip: true, skipReason: reason ?? 'Intentional rest', sourceType: 'habits',
  }).onConflictDoUpdate({
    target: [habitCompletionDetails.userId, habitCompletionDetails.habitId, habitCompletionDetails.dateKey],
    set: { intentionalSkip: true, skipReason: reason ?? 'Intentional rest', quantity: 0, completedAt: new Date() },
  }).returning();
  return detail;
}

export async function createHabitTrigger(userId: string, values: { habitId: string; triggerType: string; triggerValue: string }) {
  const [row] = await db.insert(habitTriggers).values({ userId, ...values }).returning();
  return row;
}

export async function deleteHabitTrigger(userId: string, id: string) {
  const [row] = await db.delete(habitTriggers).where(and(eq(habitTriggers.id, id), eq(habitTriggers.userId, userId))).returning();
  return row ?? null;
}

export async function createHabitStack(userId: string, values: { name: string; anchorType?: string; anchorValue?: string | null; habitIds: string[] }) {
  const [row] = await db.insert(habitStacks).values({ userId, name: values.name, anchorType: values.anchorType ?? 'manual', anchorValue: values.anchorValue ?? null, habitIds: values.habitIds }).returning();
  return row;
}

export async function createHabitExperiment(userId: string, values: { habitId: string; hypothesis: string; change: string; endsAt?: Date | null; baselineRate?: number | null }) {
  const [row] = await db.insert(habitExperiments).values({ userId, ...values }).returning();
  return row;
}

export async function updateHabitExperiment(userId: string, id: string, values: Partial<typeof habitExperiments.$inferInsert>) {
  const [row] = await db.update(habitExperiments).set(values).where(and(eq(habitExperiments.id, id), eq(habitExperiments.userId, userId))).returning();
  return row ?? null;
}

export async function createHabitSourceLink(userId: string, values: { habitId: string; sourceType: string; sourceId: string }) {
  const [row] = await db.insert(habitSourceLinks).values({ userId, ...values }).onConflictDoNothing().returning();
  return row ?? null;
}

export async function syncHabitsFromFitnessSession(userId: string, workoutType: string, occurredAt: Date, durationMinutes?: number | null) {
  const links = await db.select().from(habitSourceLinks).where(and(eq(habitSourceLinks.userId, userId), eq(habitSourceLinks.sourceType, 'fitness'), eq(habitSourceLinks.enabled, true)));
  const normalized = workoutType.trim().toLowerCase();
  const matched = links.filter((link) => normalized.includes(link.sourceId.trim().toLowerCase()) || link.sourceId.trim().toLowerCase().includes(normalized));
  const dateKey = `${occurredAt.getFullYear()}-${String(occurredAt.getMonth() + 1).padStart(2, '0')}-${String(occurredAt.getDate()).padStart(2, '0')}`;
  for (const link of matched) await completeHabit(userId, { habitId: link.habitId, dateKey, version: 'full', actualSeconds: durationMinutes ? durationMinutes * 60 : null, sourceType: 'fitness', sourceId: workoutType });
  return matched.length;
}
