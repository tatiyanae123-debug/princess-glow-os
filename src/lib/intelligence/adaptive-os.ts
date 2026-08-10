import 'server-only';

import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import {
  dayReviews,
  entityRelations,
  focusSessions,
  glowInboxItems,
  lifeModes,
  maintenanceForecasts,
  personalRules,
  taskDependencies,
} from '@/db/schema/adaptive-os';
import { buildPersonalContext, type PersonalContext } from '@/lib/intelligence/context';

export type LifeModeSlug = 'normal' | 'low-energy' | 'sick' | 'work-day' | 'deep-work' | 'social' | 'travel' | 'reset' | 'beauty-maintenance' | 'catch-up';

export type NowAction = {
  id: string;
  title: string;
  reason: string;
  href: string;
  source: 'task' | 'reminder' | 'habit' | 'routine' | 'event';
  score: number;
  estimatedMinutes: number;
  energyCost: 'low' | 'medium' | 'high';
  canDoNow: boolean;
};

export type AdaptiveSnapshot = {
  context: PersonalContext;
  activeMode: { id: string; name: string; slug: string; maxMajorTasks: number; energyTarget: number | null } | null;
  rules: { id: string; title: string; ruleType: string; priority: number }[];
  now: {
    availableMinutes: number | null;
    primary: NowAction | null;
    alternatives: NowAction[];
    protected: string[];
    hiddenCount: number;
  };
  inboxCount: number;
  maintenance: { id: string; domain: string; title: string; dueAt: Date | null; urgency: string; recommendation: string | null }[];
  systemHealth: { domain: string; status: 'stable' | 'attention' | 'behind'; reason: string }[];
};

const DEFAULT_MODES: Array<{ name: string; slug: LifeModeSlug; description: string; energyTarget: number; maxMajorTasks: number; workoutPolicy: string; routinePolicy: string; schedulingPolicy: string }> = [
  { name: 'Normal Day', slug: 'normal', description: 'Balanced default day.', energyTarget: 6, maxMajorTasks: 3, workoutPolicy: 'normal', routinePolicy: 'full', schedulingPolicy: 'balanced' },
  { name: 'Low Energy', slug: 'low-energy', description: 'Protect essentials and reduce cognitive load.', energyTarget: 3, maxMajorTasks: 1, workoutPolicy: 'recovery', routinePolicy: 'essentials', schedulingPolicy: 'light' },
  { name: 'Sick Mode', slug: 'sick', description: 'Recovery first. Keep only health, medication, hydration, and critical commitments.', energyTarget: 1, maxMajorTasks: 0, workoutPolicy: 'rest', routinePolicy: 'minimum', schedulingPolicy: 'critical-only' },
  { name: 'Work Day', slug: 'work-day', description: 'Protect work, commute, meals, and a small number of personal priorities.', energyTarget: 5, maxMajorTasks: 2, workoutPolicy: 'short', routinePolicy: 'compact', schedulingPolicy: 'work-buffered' },
  { name: 'Deep Work', slug: 'deep-work', description: 'Fewer interruptions and longer focus blocks.', energyTarget: 7, maxMajorTasks: 2, workoutPolicy: 'normal', routinePolicy: 'compact', schedulingPolicy: 'focus-blocks' },
  { name: 'Social Day', slug: 'social', description: 'Protect preparation, travel, and recovery around plans.', energyTarget: 5, maxMajorTasks: 1, workoutPolicy: 'optional', routinePolicy: 'beauty-forward', schedulingPolicy: 'event-buffered' },
  { name: 'Travel Mode', slug: 'travel', description: 'Prioritize itinerary, packing, documents, timing, and essentials.', energyTarget: 5, maxMajorTasks: 2, workoutPolicy: 'flexible', routinePolicy: 'travel', schedulingPolicy: 'travel' },
  { name: 'Reset Day', slug: 'reset', description: 'Home, planning, maintenance, and preparation.', energyTarget: 5, maxMajorTasks: 3, workoutPolicy: 'light', routinePolicy: 'reset', schedulingPolicy: 'reset' },
  { name: 'Beauty Maintenance', slug: 'beauty-maintenance', description: 'Prioritize hair, skincare, grooming, and appointments.', energyTarget: 5, maxMajorTasks: 2, workoutPolicy: 'light', routinePolicy: 'beauty-full', schedulingPolicy: 'maintenance' },
  { name: 'Catch-Up', slug: 'catch-up', description: 'Triage overdue work and unblock projects without overloading the day.', energyTarget: 6, maxMajorTasks: 3, workoutPolicy: 'short', routinePolicy: 'essentials', schedulingPolicy: 'triage' },
];

const DEFAULT_RULES = [
  { title: 'Protect medication visibility', ruleType: 'health', priority: 100, condition: { itemType: 'medication', completed: false }, effect: { alwaysVisible: true } },
  { title: 'Work days stay realistic', ruleType: 'scheduling', priority: 90, condition: { mode: 'work-day' }, effect: { maxMajorTasks: 2 } },
  { title: 'Low energy protects essentials', ruleType: 'scheduling', priority: 95, condition: { mode: 'low-energy' }, effect: { hideOptional: true, maxMajorTasks: 1 } },
  { title: 'Sick mode removes noncritical pressure', ruleType: 'scheduling', priority: 100, condition: { mode: 'sick' }, effect: { criticalOnly: true } },
  { title: 'Do not start long work before an event', ruleType: 'time', priority: 80, condition: { minutesBeforeEventLessThan: 45 }, effect: { maxTaskMinutes: 25 } },
  { title: 'Hair wash needs a real time block', ruleType: 'beauty', priority: 75, condition: { keyword: 'hair wash' }, effect: { minimumMinutes: 120 } },
];

export async function ensureAdaptiveDefaults(userId: string) {
  const [existingModes, existingRules] = await Promise.all([
    db.select({ id: lifeModes.id }).from(lifeModes).where(eq(lifeModes.userId, userId)).limit(1),
    db.select({ id: personalRules.id }).from(personalRules).where(eq(personalRules.userId, userId)).limit(1),
  ]);

  if (existingModes.length === 0) {
    await db.insert(lifeModes).values(DEFAULT_MODES.map((mode, index) => ({ ...mode, userId, isActive: index === 0 })));
  }
  if (existingRules.length === 0) {
    await db.insert(personalRules).values(DEFAULT_RULES.map((rule) => ({ ...rule, userId, enabled: true, source: 'system' })));
  }
}

export async function getAdaptiveState(userId: string, now = new Date()): Promise<AdaptiveSnapshot> {
  await ensureAdaptiveDefaults(userId);
  const context = await buildPersonalContext(userId, now);
  const [activeModeRows, rules, inboxRows, maintenance] = await Promise.all([
    db.select().from(lifeModes).where(and(eq(lifeModes.userId, userId), eq(lifeModes.isActive, true))).limit(1),
    db.select().from(personalRules).where(and(eq(personalRules.userId, userId), eq(personalRules.enabled, true))).orderBy(desc(personalRules.priority)),
    db.select({ id: glowInboxItems.id }).from(glowInboxItems).where(and(eq(glowInboxItems.userId, userId), eq(glowInboxItems.status, 'unprocessed'))),
    db.select().from(maintenanceForecasts).where(and(eq(maintenanceForecasts.userId, userId), eq(maintenanceForecasts.status, 'active'))).orderBy(asc(maintenanceForecasts.dueAt)).limit(8),
  ]);

  const activeMode = activeModeRows[0] ?? null;
  const availableMinutes = context.nextEvent && !context.nextEvent.allDay
    ? Math.max(0, Math.floor((context.nextEvent.startAt.getTime() - now.getTime()) / 60000) - 15)
    : null;

  const actions: NowAction[] = [];
  const modeSlug = activeMode?.slug ?? 'normal';
  const lowMode = modeSlug === 'low-energy' || modeSlug === 'sick';
  const maxMinutes = availableMinutes == null ? 90 : availableMinutes;

  context.recommendations.forEach((recommendation, index) => {
    const title = recommendation.title;
    const source: NowAction['source'] = recommendation.href === '/tasks' ? 'task' : recommendation.href === '/habits' ? 'habit' : recommendation.href === '/connections' ? 'reminder' : 'routine';
    const lower = title.toLowerCase();
    const estimatedMinutes = lower.includes('hair wash') ? 120 : lower.includes('workout') ? 45 : lower.includes('email') || lower.includes('reply') ? 10 : lower.includes('water') || lower.includes('supplement') ? 3 : source === 'habit' ? 5 : 25;
    const energyCost: NowAction['energyCost'] = estimatedMinutes >= 45 ? 'high' : estimatedMinutes >= 20 ? 'medium' : 'low';
    const base = recommendation.priority === 'high' ? 85 : recommendation.priority === 'medium' ? 60 : 40;
    const fitsTime = estimatedMinutes <= maxMinutes;
    const fitsEnergy = !(lowMode && energyCost === 'high');
    const score = base - index * 4 + (fitsTime ? 8 : -25) + (fitsEnergy ? 4 : -30);
    actions.push({ id: recommendation.id, title, reason: recommendation.reason, href: recommendation.href, source, score, estimatedMinutes, energyCost, canDoNow: fitsTime && fitsEnergy });
  });

  if (context.nextEvent && availableMinutes !== null && availableMinutes <= 45) {
    actions.push({
      id: `event-${context.nextEvent.id}`,
      title: `Prepare for ${context.nextEvent.title}`,
      reason: `Your next event begins soon. Protect the transition instead of starting something too large.`,
      href: '/calendar',
      source: 'event',
      score: 96,
      estimatedMinutes: Math.min(20, Math.max(5, availableMinutes)),
      energyCost: 'low',
      canDoNow: true,
    });
  }

  const ranked = actions.sort((a, b) => b.score - a.score);
  const majorLimit = activeMode?.maxMajorTasks ?? 3;
  const viable = ranked.filter((item) => item.canDoNow).slice(0, Math.max(1, majorLimit + 2));
  const primary = viable[0] ?? ranked[0] ?? null;
  const alternatives = viable.filter((item) => item.id !== primary?.id).slice(0, 4);

  const protected: string[] = [];
  if (modeSlug === 'sick') protected.push('Medication', 'Hydration', 'Meals', 'Rest', 'Critical calendar commitments');
  else if (modeSlug === 'low-energy') protected.push('Medication', 'Meals', 'Hydration', 'Top priority', 'Night reset');
  else if (modeSlug === 'work-day') protected.push('Work', 'Commute buffer', 'Meals', 'One or two personal priorities');
  else protected.push('Top priority', 'Calendar commitments', 'Health essentials');

  const systemHealth = buildSystemHealth(context);

  return {
    context,
    activeMode: activeMode ? { id: activeMode.id, name: activeMode.name, slug: activeMode.slug, maxMajorTasks: activeMode.maxMajorTasks, energyTarget: activeMode.energyTarget } : null,
    rules: rules.map((rule) => ({ id: rule.id, title: rule.title, ruleType: rule.ruleType, priority: rule.priority })),
    now: { availableMinutes, primary, alternatives, protected, hiddenCount: Math.max(0, ranked.length - viable.length) },
    inboxCount: inboxRows.length,
    maintenance: maintenance.map((item) => ({ id: item.id, domain: item.domain, title: item.title, dueAt: item.dueAt, urgency: item.urgency, recommendation: item.recommendation })),
    systemHealth,
  };
}

function buildSystemHealth(context: PersonalContext): AdaptiveSnapshot['systemHealth'] {
  const habitsDone = context.habits.filter((habit) => habit.completedToday).length;
  const habitRatio = context.habits.length ? habitsDone / context.habits.length : 1;
  return [
    { domain: 'Planning', status: context.overdueTasks.length >= 4 ? 'behind' : context.overdueTasks.length ? 'attention' : 'stable', reason: context.overdueTasks.length ? `${context.overdueTasks.length} overdue item${context.overdueTasks.length === 1 ? '' : 's'}.` : 'No overdue tasks.' },
    { domain: 'Habits', status: habitRatio < 0.4 ? 'behind' : habitRatio < 0.75 ? 'attention' : 'stable', reason: `${habitsDone} of ${context.habits.length} habits complete.` },
    { domain: 'Calendar', status: context.todaysEvents.length >= 7 ? 'attention' : 'stable', reason: `${context.todaysEvents.length} scheduled event${context.todaysEvents.length === 1 ? '' : 's'} today.` },
    { domain: 'Reminders', status: context.appleReminders.filter((item) => !item.completed).length >= 8 ? 'attention' : 'stable', reason: `${context.appleReminders.filter((item) => !item.completed).length} open Apple Reminder${context.appleReminders.filter((item) => !item.completed).length === 1 ? '' : 's'}.` },
    { domain: 'Focus', status: context.focusScore < 45 ? 'behind' : context.focusScore < 70 ? 'attention' : 'stable', reason: `Current focus score ${context.focusScore}/100.` },
  ];
}

export async function setActiveLifeMode(userId: string, modeId: string) {
  await db.transaction(async (tx) => {
    await tx.update(lifeModes).set({ isActive: false, updatedAt: new Date() }).where(eq(lifeModes.userId, userId));
    await tx.update(lifeModes).set({ isActive: true, updatedAt: new Date() }).where(and(eq(lifeModes.id, modeId), eq(lifeModes.userId, userId)));
  });
}

export async function getLifeModes(userId: string) {
  await ensureAdaptiveDefaults(userId);
  return db.select().from(lifeModes).where(eq(lifeModes.userId, userId)).orderBy(asc(lifeModes.createdAt));
}

export async function getInbox(userId: string) {
  return db.select().from(glowInboxItems).where(eq(glowInboxItems.userId, userId)).orderBy(desc(glowInboxItems.createdAt));
}

export function classifyInboxText(rawText: string) {
  const value = rawText.trim();
  const lower = value.toLowerCase();
  let suggestedType = 'note';
  let confidence = 0.58;
  if (/\b(call|email|reply|book|schedule|submit|finish|buy|pick up|return|send|do|clean|wash)\b/.test(lower)) { suggestedType = 'task'; confidence = 0.82; }
  if (/\b(appointment|dentist|doctor|meeting|interview|reservation)\b/.test(lower)) { suggestedType = 'calendar'; confidence = 0.78; }
  if (/\b(idea|maybe|concept|inspiration|research)\b/.test(lower)) { suggestedType = 'idea'; confidence = 0.72; }
  if (/\b(goal|save|target|by end of|milestone)\b/.test(lower)) { suggestedType = 'goal'; confidence = 0.7; }
  if (/\b(buy|order|shop|restock|need more)\b/.test(lower)) { suggestedType = 'shopping'; confidence = 0.75; }
  return { suggestedType, suggestedTitle: value.slice(0, 120), confidence };
}

export async function addInboxItem(userId: string, rawText: string, source = 'manual') {
  const classified = classifyInboxText(rawText);
  const [item] = await db.insert(glowInboxItems).values({ userId, rawText, source, ...classified }).returning();
  return item;
}

export async function markInboxProcessed(userId: string, itemId: string, routedEntityType?: string, routedEntityId?: string) {
  const [item] = await db.update(glowInboxItems).set({ status: 'processed', routedEntityType, routedEntityId, processedAt: new Date() }).where(and(eq(glowInboxItems.id, itemId), eq(glowInboxItems.userId, userId))).returning();
  return item ?? null;
}

export async function startFocusSession(userId: string, entityType: string, entityId: string, title: string, plannedMinutes = 25) {
  const [session] = await db.insert(focusSessions).values({ userId, entityType, entityId, title, plannedMinutes }).returning();
  return session;
}

export async function finishFocusSession(userId: string, sessionId: string, outcome?: string, notes?: string) {
  const rows = await db.select().from(focusSessions).where(and(eq(focusSessions.id, sessionId), eq(focusSessions.userId, userId))).limit(1);
  const session = rows[0];
  if (!session) return null;
  const endedAt = new Date();
  const actualMinutes = Math.max(1, Math.round((endedAt.getTime() - session.startedAt.getTime()) / 60000));
  const [updated] = await db.update(focusSessions).set({ endedAt, actualMinutes, outcome, notes, completed: true }).where(and(eq(focusSessions.id, sessionId), eq(focusSessions.userId, userId))).returning();
  return updated ?? null;
}

export async function getActiveFocusSession(userId: string) {
  const rows = await db.select().from(focusSessions).where(and(eq(focusSessions.userId, userId), eq(focusSessions.completed, false))).orderBy(desc(focusSessions.startedAt)).limit(1);
  return rows[0] ?? null;
}

export async function getTodayReview(userId: string, dateKey: string) {
  const rows = await db.select().from(dayReviews).where(and(eq(dayReviews.userId, userId), eq(dayReviews.dateKey, dateKey))).limit(1);
  return rows[0] ?? null;
}

export async function upsertDayReview(userId: string, dateKey: string, values: { energy?: number; mood?: string; completedSummary?: string; movedSummary?: string; memoryNote?: string; tomorrowTopThree?: string[] }) {
  const existing = await getTodayReview(userId, dateKey);
  if (existing) {
    const [updated] = await db.update(dayReviews).set({ ...values, updatedAt: new Date() }).where(and(eq(dayReviews.id, existing.id), eq(dayReviews.userId, userId))).returning();
    return updated;
  }
  const [created] = await db.insert(dayReviews).values({ userId, dateKey, ...values }).returning();
  return created;
}

export async function getDependenciesForEntities(userId: string, entityIds: string[]) {
  if (!entityIds.length) return [];
  return db.select().from(taskDependencies).where(and(eq(taskDependencies.userId, userId), inArray(taskDependencies.successorId, entityIds)));
}

export async function getRelationsForEntity(userId: string, entityType: string, entityId: string) {
  return db.select().from(entityRelations).where(and(eq(entityRelations.userId, userId), eq(entityRelations.fromType, entityType), eq(entityRelations.fromId, entityId)));
}
