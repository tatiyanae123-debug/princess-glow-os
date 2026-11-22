import 'server-only';

import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { appointments } from '@/db/schema/appointments';
import { beautyRoutines } from '@/db/schema/beauty-routines';
import { calendarEvents } from '@/db/schema/calendar-events';
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
import { financeEntries } from '@/db/schema/finance-entries';
import { goals } from '@/db/schema/goals';
import { habits, habitLogs } from '@/db/schema/habits';
import { medications, supplements } from '@/db/schema/health-intelligence';
import { importantLinks } from '@/db/schema/important-links';
import {
  appleReminders,
  lifeMemories,
  planningBlocks,
  projects,
} from '@/db/schema/intelligence-expansion';
import { notes } from '@/db/schema/notes';
import { routines, routineSteps } from '@/db/schema/routines';
import { tasks } from '@/db/schema/tasks';
import { wellnessEntries } from '@/db/schema/wellness-entries';
import { workSchedules } from '@/db/schema/work-schedules';
import {
  dayReviews,
  focusSessions,
  glowInboxItems,
  maintenanceForecasts,
  personalRules,
  taskDependencies,
} from '@/db/schema/adaptive-os';
import {
  glowNotices,
  resourceLibraryItems,
  universalIntakeArtifacts,
} from '@/db/schema/interconnected-os';
import { glowKernelStates } from '@/db/schema/living-kernel';
import {
  canonicalGlowObjectId,
  getOrCreateKernelState,
  recordKernelEvent,
  upsertCanonicalGlowObject,
  upsertGlowGraphEdge,
  type CanonicalGlowObjectInput,
} from '@/lib/intelligence/living-kernel-registry';
import { ensureLivingKernelSchema, LIVING_KERNEL_SCHEMA_VERSION } from '@/lib/intelligence/living-kernel-schema';

const SYNC_TTL_MS = 5 * 60 * 1000;
const CONCURRENCY = 12;

type AnyRow = Record<string, unknown>;

async function safeRows<T>(label: string, query: Promise<T[]>): Promise<T[]> {
  try {
    return await query;
  } catch (error) {
    console.error(`[Glow Kernel] ${label} projection unavailable`, error);
    return [];
  }
}

function asDate(value: unknown) {
  return value instanceof Date ? value : value ? new Date(String(value)) : null;
}

function sourceSystem(value: unknown): 'glow-os' | 'apple' | 'google' | 'import' | 'manual' | 'unknown' {
  const source = String(value ?? '').toLowerCase();
  if (source.includes('google')) return 'google';
  if (source.includes('apple')) return 'apple';
  if (source.includes('import')) return 'import';
  if (source.includes('manual')) return 'manual';
  return source ? 'glow-os' : 'glow-os';
}

function archiveState(archived: unknown, active = 'active') {
  return archived === true ? 'archived' : active;
}

function object(input: CanonicalGlowObjectInput) {
  return input;
}

async function inChunks<T>(items: T[], work: (item: T) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    await Promise.all(items.slice(i, i + CONCURRENCY).map(work));
  }
}

export async function markLivingKernelDirty(userId: string, source = 'domain-mutation') {
  await ensureLivingKernelSchema();
  const state = await getOrCreateKernelState(userId);
  await db.update(glowKernelStates).set({
    lastFullSyncAt: null,
    lastError: null,
    lastEventAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(glowKernelStates.userId, userId));
  return state.currentRealityId;
}

export async function syncLivingLifeModel(userId: string, options: { force?: boolean; reason?: string } = {}) {
  await ensureLivingKernelSchema();
  const state = await getOrCreateKernelState(userId);
  const now = new Date();
  if (!options.force && state.lastFullSyncAt && now.getTime() - state.lastFullSyncAt.getTime() < SYNC_TTL_MS) {
    return { state, synced: false, projected: 0 };
  }

  try {
    const [
      taskRows, habitRows, habitLogRows, routineRows, routineStepRows, goalRows, eventRows,
      beautyRoutineRows, wellnessRows, financeRows, noteRows, linkRows, appointmentRows, workRows,
      reminderRows, planningBlockRows, memoryRows, projectRows, planningPeriodRows, observationRows,
      beautyProductRows, hairLogRows, fitnessRows, closetRows, financeGoalRows, timelineRows,
      medicationRows, supplementRows, ruleRows, maintenanceRows, inboxRows, artifactRows, resourceRows,
      noticeRows, focusRows, reviewRows, proposalRows, auditRows, briefingRows, dependencyRows,
    ] = await Promise.all([
      safeRows('tasks', db.select().from(tasks).where(eq(tasks.userId, userId))),
      safeRows('habits', db.select().from(habits).where(eq(habits.userId, userId))),
      safeRows('habit logs', db.select().from(habitLogs).where(eq(habitLogs.userId, userId))),
      safeRows('routines', db.select().from(routines).where(eq(routines.userId, userId))),
      safeRows('routine steps', db.select().from(routineSteps).where(eq(routineSteps.userId, userId))),
      safeRows('goals', db.select().from(goals).where(eq(goals.userId, userId))),
      safeRows('calendar events', db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId))),
      safeRows('beauty routines', db.select().from(beautyRoutines).where(eq(beautyRoutines.userId, userId))),
      safeRows('wellness entries', db.select().from(wellnessEntries).where(eq(wellnessEntries.userId, userId))),
      safeRows('finance entries', db.select().from(financeEntries).where(eq(financeEntries.userId, userId))),
      safeRows('notes', db.select().from(notes).where(eq(notes.userId, userId))),
      safeRows('important links', db.select().from(importantLinks).where(eq(importantLinks.userId, userId))),
      safeRows('appointments', db.select().from(appointments).where(eq(appointments.userId, userId))),
      safeRows('work schedules', db.select().from(workSchedules).where(eq(workSchedules.userId, userId))),
      safeRows('apple reminders', db.select().from(appleReminders).where(eq(appleReminders.userId, userId))),
      safeRows('planning blocks', db.select().from(planningBlocks).where(eq(planningBlocks.userId, userId))),
      safeRows('life memories', db.select().from(lifeMemories).where(eq(lifeMemories.userId, userId))),
      safeRows('projects', db.select().from(projects).where(eq(projects.userId, userId))),
      safeRows('planning periods', db.select().from(planningPeriods).where(eq(planningPeriods.userId, userId))),
      safeRows('observations', db.select().from(intelligentObservations).where(eq(intelligentObservations.userId, userId))),
      safeRows('beauty products', db.select().from(beautyProducts).where(eq(beautyProducts.userId, userId))),
      safeRows('hair logs', db.select().from(hairLogs).where(eq(hairLogs.userId, userId))),
      safeRows('fitness sessions', db.select().from(fitnessSessions).where(eq(fitnessSessions.userId, userId))),
      safeRows('closet items', db.select().from(closetItems).where(eq(closetItems.userId, userId))),
      safeRows('finance goals', db.select().from(financeGoals).where(eq(financeGoals.userId, userId))),
      safeRows('timeline events', db.select().from(lifeTimelineEvents).where(eq(lifeTimelineEvents.userId, userId))),
      safeRows('medications', db.select().from(medications).where(eq(medications.userId, userId))),
      safeRows('supplements', db.select().from(supplements).where(eq(supplements.userId, userId))),
      safeRows('personal rules', db.select().from(personalRules).where(eq(personalRules.userId, userId))),
      safeRows('maintenance forecasts', db.select().from(maintenanceForecasts).where(eq(maintenanceForecasts.userId, userId))),
      safeRows('inbox items', db.select().from(glowInboxItems).where(eq(glowInboxItems.userId, userId))),
      safeRows('intake artifacts', db.select().from(universalIntakeArtifacts).where(eq(universalIntakeArtifacts.userId, userId))),
      safeRows('resource library', db.select().from(resourceLibraryItems).where(eq(resourceLibraryItems.userId, userId))),
      safeRows('notices', db.select().from(glowNotices).where(eq(glowNotices.userId, userId))),
      safeRows('focus sessions', db.select().from(focusSessions).where(eq(focusSessions.userId, userId))),
      safeRows('day reviews', db.select().from(dayReviews).where(eq(dayReviews.userId, userId))),
      safeRows('AI proposals', db.select().from(aiProposals).where(eq(aiProposals.userId, userId))),
      safeRows('audit events', db.select().from(auditEvents).where(eq(auditEvents.userId, userId))),
      safeRows('briefings', db.select().from(briefingSnapshots).where(eq(briefingSnapshots.userId, userId))),
      safeRows('task dependencies', db.select().from(taskDependencies).where(eq(taskDependencies.userId, userId))),
    ]);

    const inputs: CanonicalGlowObjectInput[] = [];

    for (const row of taskRows) inputs.push(object({
      domain: 'task', sourceTable: 'tasks', sourceId: row.id, title: row.title,
      summary: row.description, state: row.archived ? 'archived' : row.status,
      provenance: { sourceSystem: sourceSystem(row.source), sourceTable: 'tasks', sourceId: row.id, sourceVersion: row.sourceVersion, importBatchId: row.importBatchId, observedAt: now },
      timing: row.dueDate ? { dueAt: row.dueDate } : {},
      triggers: row.dueDate ? ['due-date'] : [], availableActions: ['open', 'plan', 'reschedule', 'complete'],
      crossDomainEffects: ['time', 'attention', 'goals'], completionStage: row.status,
      metadata: { priority: row.priority, completedAt: row.completedAt, sourceMessageId: row.sourceMessageId, sourceThreadId: row.sourceThreadId, editable: row.editable },
    }));

    for (const row of habitRows) inputs.push(object({
      domain: 'habit', sourceTable: 'habits', sourceId: row.id, title: row.name,
      summary: row.description, state: archiveState(row.archived),
      provenance: { sourceSystem: sourceSystem(row.source), sourceTable: 'habits', sourceId: row.id, sourceVersion: row.sourceVersion, importBatchId: row.importBatchId, observedAt: now },
      triggers: ['daily-context'], availableActions: ['open', 'log', 'skip-intentionally', 'adjust'],
      crossDomainEffects: ['routines', 'attention', 'goals'], metadata: { frequency: row.frequency, targetCount: row.targetCount, editable: row.editable },
    }));

    for (const row of habitLogRows) inputs.push(object({
      domain: 'habit-log', sourceTable: 'habit_logs', sourceId: row.id, title: `Habit log · ${row.loggedDate}`,
      state: 'recorded', provenance: { sourceSystem: 'glow-os', sourceTable: 'habit_logs', sourceId: row.id, observedAt: now },
      timing: { occurredAt: row.loggedDate }, availableActions: ['open'], crossDomainEffects: ['habits', 'learning'],
      metadata: { habitId: row.habitId, count: row.count, notes: row.notes },
    }));

    for (const row of routineRows) inputs.push(object({
      domain: 'routine', sourceTable: 'routines', sourceId: row.id, title: row.name,
      summary: row.description, state: archiveState(row.archived),
      provenance: { sourceSystem: sourceSystem(row.source), sourceTable: 'routines', sourceId: row.id, sourceVersion: row.sourceVersion, importBatchId: row.importBatchId, observedAt: now },
      timing: { timeOfDay: row.timeOfDay, daysOfWeek: row.daysOfWeek ?? [] }, triggers: ['time-of-day'],
      availableActions: ['open', 'start', 'use-quick-version', 'reschedule'], crossDomainEffects: ['time', 'energy', 'habits'],
      metadata: { editable: row.editable },
    }));

    for (const row of routineStepRows) inputs.push(object({
      domain: 'routine-step', sourceTable: 'routine_steps', sourceId: row.id, title: row.title,
      summary: row.notes, state: 'active', provenance: { sourceSystem: 'glow-os', sourceTable: 'routine_steps', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'complete'], crossDomainEffects: ['routine', 'time'], metadata: { routineId: row.routineId, order: row.order, durationMinutes: row.durationMinutes },
    }));

    for (const row of goalRows) inputs.push(object({
      domain: 'goal', sourceTable: 'goals', sourceId: row.id, title: row.title,
      summary: row.description, state: row.archived ? 'archived' : row.status,
      provenance: { sourceSystem: 'glow-os', sourceTable: 'goals', sourceId: row.id, observedAt: now }, timing: row.targetDate ? { targetDate: row.targetDate } : {},
      availableActions: ['open', 'identify-next-action', 'plan', 'review-progress'], crossDomainEffects: ['tasks', 'planning', 'decisions'],
      metadata: { category: row.category, progress: row.progress },
    }));

    for (const row of eventRows) inputs.push(object({
      domain: 'calendar-event', sourceTable: 'calendar_events', sourceId: row.id, title: row.title,
      summary: row.description, state: archiveState(row.archived, row.startAt < now ? 'past-or-active' : 'scheduled'),
      provenance: { sourceSystem: sourceSystem(row.source), sourceTable: 'calendar_events', sourceId: row.id, sourceVersion: row.sourceVersion, externalId: row.googleEventId, observedAt: now },
      timing: { startAt: row.startAt, endAt: row.endAt, allDay: row.allDay, timezone: row.eventTimezone }, constraints: ['occupies-time'], triggers: ['start-time'],
      availableActions: ['open', 'prepare', 'find-conflicts', 'reschedule'], crossDomainEffects: ['time', 'travel', 'preparation', 'routines', 'spending'],
      metadata: { location: row.location, googleCalendarId: row.googleCalendarId, googleRecurringEventId: row.googleRecurringEventId, recurrenceRule: row.recurrenceRule, syncStatus: row.syncStatus, lastSyncedAt: row.lastSyncedAt },
    }));

    for (const row of beautyRoutineRows) inputs.push(object({
      domain: 'beauty-routine', sourceTable: 'beauty_routines', sourceId: row.id, title: row.name,
      summary: row.notes, state: archiveState(row.archived), provenance: { sourceSystem: sourceSystem(row.source), sourceTable: 'beauty_routines', sourceId: row.id, sourceVersion: row.sourceVersion, importBatchId: row.importBatchId, observedAt: now },
      timing: { timeOfDay: row.timeOfDay }, availableActions: ['open', 'start', 'adjust'], crossDomainEffects: ['beauty', 'time', 'inventory'],
      metadata: { stepOrder: row.stepOrder, products: row.products ?? [], editable: row.editable },
    }));

    for (const row of wellnessRows) inputs.push(object({
      domain: 'wellness-signal', sourceTable: 'wellness_entries', sourceId: row.id, title: `Wellness · ${row.entryDate}`,
      summary: row.notes, state: 'recorded', provenance: { sourceSystem: 'glow-os', sourceTable: 'wellness_entries', sourceId: row.id, observedAt: now },
      timing: { occurredAt: row.entryDate }, availableActions: ['open', 'compare'], crossDomainEffects: ['energy', 'fitness', 'routines', 'planning'],
      metadata: { mood: row.mood, energy: row.energy, stressLevel: row.stressLevel, sleepHours: row.sleepHours, waterGlasses: row.waterGlasses },
    }));

    for (const row of financeRows) inputs.push(object({
      domain: 'finance', sourceTable: 'finance_entries', sourceId: row.id, title: row.title,
      summary: row.notes, state: archiveState(row.archived, 'recorded'), provenance: { sourceSystem: 'glow-os', sourceTable: 'finance_entries', sourceId: row.id, observedAt: now },
      timing: { occurredAt: row.entryDate }, availableActions: ['open', 'categorize', 'review'], crossDomainEffects: ['budget', 'goals', 'shopping'],
      metadata: { amount: row.amount, type: row.type, category: row.category },
    }));

    for (const row of noteRows) inputs.push(object({
      domain: 'note', sourceTable: 'notes', sourceId: row.id, title: row.title,
      summary: row.content?.slice(0, 1200), searchableText: `${row.title} ${row.content ?? ''} ${(row.tags ?? []).join(' ')}`,
      state: archiveState(row.archived), provenance: { sourceSystem: 'glow-os', sourceTable: 'notes', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'edit', 'link', 'archive'], crossDomainEffects: ['memory', 'projects', 'decisions'], metadata: { tags: row.tags ?? [], pinned: row.pinned },
    }));

    for (const row of linkRows) inputs.push(object({
      domain: 'resource', sourceTable: 'important_links', sourceId: row.id, title: row.title,
      summary: row.notes, searchableText: `${row.title} ${row.url} ${row.category ?? ''} ${row.notes ?? ''}`, state: archiveState(row.archived),
      provenance: { sourceSystem: 'glow-os', sourceTable: 'important_links', sourceId: row.id, observedAt: now }, availableActions: ['open', 'link', 'archive'],
      crossDomainEffects: ['projects', 'memory'], resources: [row.url], metadata: { url: row.url, category: row.category, pinned: row.pinned },
    }));

    for (const row of appointmentRows) inputs.push(object({
      domain: 'appointment', sourceTable: 'appointments', sourceId: row.id, title: row.title,
      summary: row.notes, state: archiveState(row.archived, row.startAt < now ? 'past-or-active' : 'scheduled'), provenance: { sourceSystem: 'glow-os', sourceTable: 'appointments', sourceId: row.id, observedAt: now },
      timing: { startAt: row.startAt, endAt: row.endAt }, constraints: ['occupies-time'], triggers: ['start-time'], availableActions: ['open', 'prepare', 'reschedule'],
      crossDomainEffects: ['time', 'travel', 'preparation', 'spending'], metadata: { provider: row.provider, location: row.location, type: row.type },
    }));

    for (const row of workRows) inputs.push(object({
      domain: 'work-schedule', sourceTable: 'work_schedules', sourceId: row.id, title: row.title,
      summary: row.notes, state: archiveState(row.archived), provenance: { sourceSystem: 'glow-os', sourceTable: 'work_schedules', sourceId: row.id, observedAt: now },
      timing: { dayOfWeek: row.dayOfWeek, startTime: row.startTime, endTime: row.endTime }, constraints: ['occupies-time'], triggers: ['weekly-schedule'],
      availableActions: ['open', 'prepare'], crossDomainEffects: ['time', 'energy', 'routines', 'planning'], metadata: {},
    }));

    for (const row of reminderRows) inputs.push(object({
      domain: 'reminder', sourceTable: 'apple_reminders', sourceId: row.id, title: row.title,
      summary: row.notes, state: row.completed ? 'completed' : 'open', provenance: { sourceSystem: 'apple', sourceTable: 'apple_reminders', sourceId: row.id, externalId: row.externalId, observedAt: now },
      timing: row.dueAt ? { dueAt: row.dueAt } : {}, triggers: row.dueAt ? ['due-time'] : [], availableActions: ['open', 'plan', 'complete', 'move-into-glow'],
      crossDomainEffects: ['tasks', 'time', 'attention'], metadata: { listName: row.listName, lastSyncedAt: row.lastSyncedAt, importAudit: row.importAudit },
    }));

    for (const row of projectRows) inputs.push(object({
      domain: 'project', sourceTable: 'projects', sourceId: row.id, title: row.title,
      summary: row.notes, state: row.status, provenance: { sourceSystem: 'glow-os', sourceTable: 'projects', sourceId: row.id, observedAt: now },
      timing: row.deadline ? { dueAt: row.deadline } : {}, availableActions: ['open', 'identify-next-action', 'plan', 'review-progress'],
      crossDomainEffects: ['tasks', 'goals', 'time', 'resources'], metadata: { area: row.area, priority: row.priority, progress: row.progress, nextAction: row.nextAction, milestones: row.milestones, relatedTaskIds: row.relatedTaskIds },
    }));

    for (const row of planningBlockRows) inputs.push(object({
      domain: 'planning-block', sourceTable: 'planning_blocks', sourceId: row.id, title: row.title,
      summary: row.reason, state: row.status, provenance: { sourceSystem: 'glow-os', sourceTable: 'planning_blocks', sourceId: row.id, observedAt: now },
      timing: { startAt: row.startAt, endAt: row.endAt }, constraints: ['occupies-time'], availableActions: ['open', 'reschedule'], crossDomainEffects: ['time', 'planning'],
      metadata: { proposalId: row.proposalId, sourceType: row.sourceType, sourceId: row.sourceId },
    }));

    for (const row of memoryRows) inputs.push(object({
      domain: 'memory', sourceTable: 'life_memories', sourceId: row.id, title: row.title,
      summary: row.summary, state: row.archived ? 'archived' : 'remembered', confidence: row.confidence,
      provenance: { sourceSystem: sourceSystem(row.source), sourceTable: 'life_memories', sourceId: row.id, observedAt: now }, timing: row.sourceDate ? { occurredAt: row.sourceDate } : {},
      availableActions: ['open', 'correct', 'link', 'archive'], crossDomainEffects: ['brain', row.relatedArea ?? 'life'], metadata: { category: row.category, relatedArea: row.relatedArea, relatedProjectId: row.relatedProjectId, privacyLevel: row.privacyLevel, pinned: row.pinned },
    }));

    for (const row of planningPeriodRows) inputs.push(object({
      domain: 'planning-period', sourceTable: 'planning_periods', sourceId: row.id, title: row.title,
      summary: row.focus, state: archiveState(row.archived), provenance: { sourceSystem: 'glow-os', sourceTable: 'planning_periods', sourceId: row.id, observedAt: now },
      timing: { startAt: row.startsAt, endAt: row.endsAt }, availableActions: ['open', 'review', 'adjust'], crossDomainEffects: ['planning', 'goals', 'projects'],
      metadata: { level: row.level, progress: row.progress, reflection: row.reflection },
    }));

    for (const row of observationRows) inputs.push(object({
      domain: 'observation', sourceTable: 'intelligent_observations', sourceId: row.id, title: row.title,
      summary: row.evidence, state: row.status, confidence: row.confidence, provenance: { sourceSystem: 'glow-os', sourceTable: 'intelligent_observations', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'confirm', 'dismiss', 'snooze'], crossDomainEffects: ['learning', row.category], metadata: { category: row.category, timeWindow: row.timeWindow, snoozedUntil: row.snoozedUntil },
    }));

    for (const row of beautyProductRows) inputs.push(object({
      domain: 'beauty-item', sourceTable: 'beauty_products', sourceId: row.id, title: row.name,
      state: archiveState(row.archived, row.openedAt ? 'in-use' : 'owned'), provenance: { sourceSystem: 'glow-os', sourceTable: 'beauty_products', sourceId: row.id, observedAt: now },
      timing: { openedAt: row.openedAt, expiresAt: row.expiresAt }, triggers: row.expiresAt ? ['expiration'] : [], availableActions: ['open', 'log-use', 'replace', 'archive'],
      crossDomainEffects: ['beauty', 'inventory', 'routines', 'spending'], metadata: { category: row.category, ingredients: row.ingredients, routinePosition: row.routinePosition, reaction: row.reaction, costCents: row.costCents, repurchase: row.repurchase, usageFrequency: row.usageFrequency, photoUrl: row.photoUrl },
    }));

    for (const row of hairLogRows) inputs.push(object({
      domain: 'hair-log', sourceTable: 'hair_logs', sourceId: row.id, title: `Hair · ${row.eventType}`,
      summary: row.notes, state: 'recorded', provenance: { sourceSystem: 'glow-os', sourceTable: 'hair_logs', sourceId: row.id, observedAt: now }, timing: { occurredAt: row.occurredAt },
      availableActions: ['open'], crossDomainEffects: ['hair', 'routine', 'learning'], metadata: { eventType: row.eventType, style: row.style, products: row.products, heatUsed: row.heatUsed, nextAction: row.nextAction },
    }));

    for (const row of fitnessRows) inputs.push(object({
      domain: 'fitness-session', sourceTable: 'fitness_sessions', sourceId: row.id, title: row.workoutType,
      summary: row.notes, state: 'completed', provenance: { sourceSystem: 'glow-os', sourceTable: 'fitness_sessions', sourceId: row.id, observedAt: now }, timing: { occurredAt: row.occurredAt },
      availableActions: ['open', 'compare'], crossDomainEffects: ['fitness', 'energy', 'recovery', 'learning'], metadata: { durationMinutes: row.durationMinutes, energy: row.energy, soreness: row.soreness, equipment: row.equipment },
    }));

    for (const row of closetRows) inputs.push(object({
      domain: 'clothing', sourceTable: 'closet_items', sourceId: row.id, title: row.name,
      state: row.status, provenance: { sourceSystem: 'glow-os', sourceTable: 'closet_items', sourceId: row.id, observedAt: now }, timing: { purchaseDate: row.purchaseDate },
      availableActions: ['open', 'style', 'log-wear', 'update-laundry'], crossDomainEffects: ['closet', 'calendar', 'weather', 'spending'], metadata: { category: row.category, season: row.season, weatherTags: row.weatherTags, purchasePriceCents: row.purchasePriceCents, wearCount: row.wearCount, laundryState: row.laundryState, favorite: row.favorite, imageUrl: row.imageUrl },
    }));

    for (const row of financeGoalRows) inputs.push(object({
      domain: 'finance-goal', sourceTable: 'finance_goals', sourceId: row.id, title: row.name,
      summary: row.notes, state: Number(row.currentCents) >= Number(row.targetCents) ? 'achieved' : 'active', provenance: { sourceSystem: 'glow-os', sourceTable: 'finance_goals', sourceId: row.id, observedAt: now },
      timing: row.targetDate ? { targetDate: row.targetDate } : {}, availableActions: ['open', 'plan', 'review-progress'], crossDomainEffects: ['finance', 'goals', 'spending'], metadata: { goalType: row.goalType, targetCents: row.targetCents, currentCents: row.currentCents },
    }));

    for (const row of timelineRows) inputs.push(object({
      domain: 'timeline-event', sourceTable: 'life_timeline_events', sourceId: row.id, title: row.title,
      summary: row.summary, state: 'historical', provenance: { sourceSystem: 'glow-os', sourceTable: 'life_timeline_events', sourceId: row.id, observedAt: now }, timing: { occurredAt: row.occurredAt },
      availableActions: ['open', 'link'], crossDomainEffects: ['memory', row.category], metadata: { category: row.category, relatedEntityType: row.relatedEntityType, relatedEntityId: row.relatedEntityId, imageUrl: row.imageUrl },
    }));

    for (const row of medicationRows) inputs.push(object({
      domain: 'medication', sourceTable: 'medications', sourceId: row.id, title: row.name,
      summary: row.notes, state: row.active ? 'active' : 'inactive', provenance: { sourceSystem: 'glow-os', sourceTable: 'medications', sourceId: row.id, observedAt: now },
      timing: { startedAt: row.startedAt, endedAt: row.endedAt, timeOfDay: row.timeOfDay }, availableActions: ['open', 'log', 'update'], crossDomainEffects: ['wellness', 'routine', 'schedule'],
      permissions: { consequentialChangesRequireApproval: true }, metadata: { dosage: row.dosage, frequency: row.frequency, instructions: row.instructions, prescriber: row.prescriber },
    }));

    for (const row of supplementRows) inputs.push(object({
      domain: 'supplement', sourceTable: 'supplements', sourceId: row.id, title: row.name,
      summary: row.notes, state: row.active ? 'active' : 'inactive', provenance: { sourceSystem: 'glow-os', sourceTable: 'supplements', sourceId: row.id, observedAt: now },
      timing: { startedAt: row.startedAt, endedAt: row.endedAt, timeOfDay: row.timeOfDay }, availableActions: ['open', 'log', 'update'], crossDomainEffects: ['wellness', 'routine'], metadata: { dosage: row.dosage, frequency: row.frequency, instructions: row.instructions },
    }));

    for (const row of ruleRows) inputs.push(object({
      domain: 'rule', sourceTable: 'personal_rules', sourceId: row.id, title: row.title,
      state: row.enabled ? 'active' : 'disabled', provenance: { sourceSystem: sourceSystem(row.source), sourceTable: 'personal_rules', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'disable', 'update'], crossDomainEffects: ['planning', 'decision', 'execution'], metadata: { ruleType: row.ruleType, condition: row.condition, effect: row.effect, priority: row.priority },
    }));

    for (const row of maintenanceRows) inputs.push(object({
      domain: 'maintenance-forecast', sourceTable: 'maintenance_forecasts', sourceId: row.id, title: row.title,
      summary: row.recommendation, state: row.status, provenance: { sourceSystem: 'glow-os', sourceTable: 'maintenance_forecasts', sourceId: row.id, observedAt: now }, timing: row.dueAt ? { dueAt: row.dueAt } : {},
      availableActions: ['open', 'schedule', 'snooze', 'complete'], crossDomainEffects: ['maintenance', row.domain, 'planning'], metadata: { domain: row.domain, urgency: row.urgency, sourceType: row.sourceType, sourceId: row.sourceId },
    }));

    for (const row of inboxRows) inputs.push(object({
      domain: 'intake-item', sourceTable: 'glow_inbox_items', sourceId: row.id, title: row.suggestedTitle || row.rawText.slice(0, 120),
      summary: row.rawText, state: row.status, confidence: row.confidence, provenance: { sourceSystem: sourceSystem(row.source), sourceTable: 'glow_inbox_items', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'route', 'archive'], crossDomainEffects: ['create', row.suggestedType ?? 'other'], metadata: { suggestedType: row.suggestedType, routedEntityType: row.routedEntityType, routedEntityId: row.routedEntityId, originalMetadata: row.metadata },
    }));

    for (const row of artifactRows) inputs.push(object({
      domain: 'intake-artifact', sourceTable: 'universal_intake_artifacts', sourceId: row.id, title: row.detectedTitle || row.originalName || row.kind,
      summary: row.sourceText?.slice(0, 1200), state: row.analysisStatus, confidence: row.confidence, provenance: { sourceSystem: 'import', sourceTable: 'universal_intake_artifacts', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'route', 'link'], crossDomainEffects: ['create', row.detectedType ?? 'other'], metadata: { inboxItemId: row.inboxItemId, kind: row.kind, originalName: row.originalName, mimeType: row.mimeType, sizeBytes: row.sizeBytes, detectedType: row.detectedType, extracted: row.extracted, proposedDestinations: row.proposedDestinations },
    }));

    for (const row of resourceRows) inputs.push(object({
      domain: 'resource', sourceTable: 'resource_library_items', sourceId: row.id, title: row.title,
      summary: row.content?.slice(0, 1200), state: archiveState(row.archived), provenance: { sourceSystem: 'glow-os', sourceTable: 'resource_library_items', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'use', 'link', 'archive'], crossDomainEffects: ['planning', 'routines', row.category], metadata: { category: row.category, durationMinutes: row.durationMinutes, tags: row.tags, conditions: row.conditions },
    }));

    for (const row of noticeRows) inputs.push(object({
      domain: 'notice', sourceTable: 'glow_notices', sourceId: row.id, title: row.title,
      summary: row.recommendation || row.evidence, state: row.status, confidence: row.confidence, provenance: { sourceSystem: 'glow-os', sourceTable: 'glow_notices', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'act', 'snooze', 'dismiss'], crossDomainEffects: [row.domain, 'attention'], metadata: { domain: row.domain, evidence: row.evidence, actionType: row.actionType, actionPayload: row.actionPayload, snoozedUntil: row.snoozedUntil },
    }));

    for (const row of focusRows) inputs.push(object({
      domain: 'focus-session', sourceTable: 'focus_sessions', sourceId: row.id, title: row.title,
      summary: row.notes, state: row.completed ? 'completed' : row.endedAt ? 'ended' : 'active', provenance: { sourceSystem: 'glow-os', sourceTable: 'focus_sessions', sourceId: row.id, observedAt: now },
      timing: { startAt: row.startedAt, endAt: row.endedAt }, availableActions: ['open', 'end'], crossDomainEffects: ['attention', 'learning', row.entityType], metadata: { entityType: row.entityType, entityId: row.entityId, plannedMinutes: row.plannedMinutes, actualMinutes: row.actualMinutes, outcome: row.outcome },
    }));

    for (const row of reviewRows) inputs.push(object({
      domain: 'day-review', sourceTable: 'day_reviews', sourceId: row.id, title: `Day review · ${row.dateKey}`,
      summary: row.memoryNote || row.completedSummary, state: 'recorded', provenance: { sourceSystem: 'glow-os', sourceTable: 'day_reviews', sourceId: row.id, observedAt: now }, timing: { occurredAt: row.dateKey },
      availableActions: ['open'], crossDomainEffects: ['learning', 'planning', 'memory'], metadata: { energy: row.energy, mood: row.mood, completedSummary: row.completedSummary, movedSummary: row.movedSummary, tomorrowTopThree: row.tomorrowTopThree },
    }));

    for (const row of proposalRows) inputs.push(object({
      domain: 'proposal', sourceTable: 'ai_proposals', sourceId: row.id, title: row.summary,
      summary: row.reason, state: row.status, confidence: row.confidence, provenance: { sourceSystem: 'glow-os', sourceTable: 'ai_proposals', sourceId: row.id, observedAt: now },
      availableActions: ['open', 'approve', 'reject'], crossDomainEffects: ['decision', 'execution'], metadata: { intent: row.intent, reversible: row.reversible, payload: row.payload, decidedAt: row.decidedAt },
    }));

    for (const row of auditRows) inputs.push(object({
      domain: 'audit-event', sourceTable: 'audit_events', sourceId: row.id, title: row.action,
      state: 'historical', provenance: { sourceSystem: 'glow-os', sourceTable: 'audit_events', sourceId: row.id, observedAt: now }, timing: { occurredAt: row.createdAt },
      availableActions: ['open'], crossDomainEffects: ['history', row.entityType], metadata: { entityType: row.entityType, entityId: row.entityId, details: row.details },
    }));

    for (const row of briefingRows) inputs.push(object({
      domain: 'briefing', sourceTable: 'briefing_snapshots', sourceId: row.id, title: `${row.kind} briefing · ${row.periodKey}`,
      state: 'historical', provenance: { sourceSystem: 'glow-os', sourceTable: 'briefing_snapshots', sourceId: row.id, observedAt: now }, timing: { generatedAt: row.generatedAt },
      availableActions: ['open'], crossDomainEffects: ['attention', 'history'], metadata: { kind: row.kind, periodKey: row.periodKey, content: row.content },
    }));

    await inChunks(inputs, (input) => upsertCanonicalGlowObject(userId, { ...input, actor: 'kernel-sync', reason: options.reason ?? 'Full application Life Model projection' }));

    const edges: Array<Parameters<typeof upsertGlowGraphEdge>[1]> = [];
    for (const row of routineStepRows) edges.push({
      fromObjectId: canonicalGlowObjectId('routine-step', row.id), toObjectId: canonicalGlowObjectId('routine', row.routineId),
      fromType: 'routine-step', fromSourceId: row.id, toType: 'routine', toSourceId: row.routineId,
      relation: 'belongs-to', provenance: 'explicit', confidence: 1, rationale: 'The step is stored under this routine.'
    });
    for (const row of habitLogRows) edges.push({
      fromObjectId: canonicalGlowObjectId('habit-log', row.id), toObjectId: canonicalGlowObjectId('habit', row.habitId),
      fromType: 'habit-log', fromSourceId: row.id, toType: 'habit', toSourceId: row.habitId,
      relation: 'derived-from', provenance: 'explicit', confidence: 1, rationale: 'The log records completion data for this habit.'
    });
    for (const row of dependencyRows) edges.push({
      fromObjectId: canonicalGlowObjectId(row.predecessorType, row.predecessorId), toObjectId: canonicalGlowObjectId(row.successorType, row.successorId),
      fromType: row.predecessorType, fromSourceId: row.predecessorId, toType: row.successorType, toSourceId: row.successorId,
      relation: row.dependencyType, provenance: 'explicit', confidence: 1, rationale: `Stored ${row.dependencyType} dependency.`
    });
    for (const row of planningBlockRows) if (row.sourceId) edges.push({
      fromObjectId: canonicalGlowObjectId('planning-block', row.id), toObjectId: canonicalGlowObjectId(row.sourceType, row.sourceId),
      fromType: 'planning-block', fromSourceId: row.id, toType: row.sourceType, toSourceId: row.sourceId,
      relation: 'scheduled-with', provenance: 'explicit', confidence: 1, rationale: 'The planning block was created for this source object.'
    });
    for (const row of memoryRows) if (row.relatedProjectId) edges.push({
      fromObjectId: canonicalGlowObjectId('memory', row.id), toObjectId: canonicalGlowObjectId('project', row.relatedProjectId),
      fromType: 'memory', fromSourceId: row.id, toType: 'project', toSourceId: row.relatedProjectId,
      relation: 'related-to', provenance: 'explicit', confidence: 1, rationale: 'The memory is explicitly linked to this project.'
    });
    for (const row of timelineRows) if (row.relatedEntityType && row.relatedEntityId) edges.push({
      fromObjectId: canonicalGlowObjectId('timeline-event', row.id), toObjectId: canonicalGlowObjectId(row.relatedEntityType, row.relatedEntityId),
      fromType: 'timeline-event', fromSourceId: row.id, toType: row.relatedEntityType, toSourceId: row.relatedEntityId,
      relation: 'related-to', provenance: 'explicit', confidence: 1, rationale: 'The timeline event explicitly references this entity.'
    });

    const dayStart = new Date(now); dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(now); dayEnd.setHours(23, 59, 59, 999);
    const todayEvents = eventRows.filter((row) => row.startAt >= dayStart && row.startAt <= dayEnd && !row.archived).slice(0, 24);
    const todayTasks = taskRows.filter((row) => row.dueDate && row.dueDate >= dayStart && row.dueDate <= dayEnd && row.status !== 'done' && row.status !== 'cancelled' && !row.archived).slice(0, 36);
    for (const task of todayTasks) for (const event of todayEvents) edges.push({
      fromObjectId: canonicalGlowObjectId('task', task.id), toObjectId: canonicalGlowObjectId('calendar-event', event.id),
      fromType: 'task', fromSourceId: task.id, toType: 'calendar-event', toSourceId: event.id,
      relation: 'competes-for-time-with', direction: 'bidirectional', provenance: 'inferred', confidence: .8,
      rationale: 'The task is due on the same day that the event occupies calendar capacity.'
    });

    await inChunks(edges, (edge) => upsertGlowGraphEdge(userId, edge));

    const realityId = `current-reality:${now.toISOString()}`;
    const [updatedState] = await db.update(glowKernelStates).set({
      schemaVersion: LIVING_KERNEL_SCHEMA_VERSION,
      currentRealityId: realityId,
      lastFullSyncAt: now,
      lastEventAt: now,
      lastError: null,
      syncRevision: (state.syncRevision ?? 0) + 1,
      updatedAt: now,
    }).where(eq(glowKernelStates.userId, userId)).returning();

    await recordKernelEvent({
      userId,
      eventType: 'kernel.sync.completed',
      payload: { projected: inputs.length, edges: edges.length, realityId, reason: options.reason ?? 'scheduled projection' },
      source: 'life-model-sync',
    });
    return { state: updatedState ?? state, synced: true, projected: inputs.length, edges: edges.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Life Model synchronization error';
    await db.update(glowKernelStates).set({ lastError: message, updatedAt: new Date() }).where(eq(glowKernelStates.userId, userId));
    throw error;
  }
}

export function rawObjectIdFromRow(domain: string, row: AnyRow) {
  return canonicalGlowObjectId(domain, String(row.id ?? 'unknown'));
}
