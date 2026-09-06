export type GlowIntelligenceMode = 'reactive' | 'proactive' | 'predictive' | 'simulative' | 'executive';

export type GlowScenarioKind =
  | 'current-reality'
  | 'proposed-reality'
  | 'if-i-do-x'
  | 'if-i-do-not-do-x'
  | 'best-balanced-option';

export type GlowScenarioStatus = 'draft' | 'accepted' | 'rejected';

export type KnownGlowObjectDomain =
  | 'task'
  | 'habit'
  | 'routine'
  | 'goal'
  | 'calendar-event'
  | 'reminder'
  | 'project'
  | 'note'
  | 'document'
  | 'product'
  | 'purchase'
  | 'clothing'
  | 'beauty-item'
  | 'space'
  | 'appointment'
  | 'person'
  | 'relationship'
  | 'place'
  | 'finance'
  | 'wellness-signal'
  | 'resource'
  | 'other';

export type GlowObjectDomain = KnownGlowObjectDomain | (string & {});

export type GlowObjectProvenance = {
  sourceSystem: 'glow-os' | 'apple' | 'google' | 'import' | 'manual' | 'unknown';
  sourceTable?: string;
  sourceId: string;
  observedAt?: Date;
};

export type GlowObjectTiming = {
  startAt?: Date;
  endAt?: Date;
  dueAt?: Date;
  timeOfDay?: string;
  allDay?: boolean;
};

export type GlowObject = {
  id: string;
  domain: GlowObjectDomain;
  title: string;
  state: string;
  version: number;
  confidence: number;
  provenance: GlowObjectProvenance;
  timing?: GlowObjectTiming;
  dependencies: string[];
  constraints: string[];
  triggers: string[];
  availableActions: string[];
  resources: string[];
  crossDomainEffects: string[];
  metadata: Record<string, unknown>;
};

export type GlowRelationship = {
  id: string;
  fromObjectId: string;
  toObjectId: string;
  type:
    | 'depends-on'
    | 'blocks'
    | 'supports'
    | 'belongs-to'
    | 'scheduled-with'
    | 'caused-by'
    | 'affects'
    | 'conflicts-with'
    | 'competes-for-time-with'
    | 'replenishes'
    | 'replaces'
    | 'used-by'
    | 'prepares-for'
    | 'follows'
    | 'precedes'
    | 'purchased-for'
    | 'derived-from'
    | 'related-to'
    | (string & {});
  direction: 'directed' | 'bidirectional';
  confidence: number;
  provenance: 'explicit' | 'inferred';
  rationale?: string;
};

export type GlowRealityVersion = {
  id: string;
  kind: 'current-reality';
  generatedAt: Date;
};

export type LivingLifeModelSnapshot = {
  reality: GlowRealityVersion;
  objects: GlowObject[];
  relationships: GlowRelationship[];
  intelligenceModes: readonly GlowIntelligenceMode[];
  kernelComponents: readonly string[];
};

export type GlowScenarioChange = {
  objectId: string;
  patch: Partial<Pick<GlowObject, 'state' | 'timing' | 'constraints' | 'triggers' | 'availableActions' | 'resources' | 'crossDomainEffects' | 'metadata'>>;
  rationale: string;
  expectedEffects: string[];
};

export type GlowScenario = {
  id: string;
  kind: Exclude<GlowScenarioKind, 'current-reality'>;
  title: string;
  basedOnRealityId: string;
  status: GlowScenarioStatus;
  createdAt: Date;
  changes: GlowScenarioChange[];
  summary?: string;
};

export type GlowActionReceipt = {
  id: string;
  action: string;
  changedAt: Date;
  reasons: string[];
  evidence: string[];
  affectedObjectIds: string[];
  affectedDomains: string[];
  confidence: number;
  executor: string;
  result: 'proposed' | 'completed' | 'failed' | 'unavailable';
  reversible: boolean;
  undoRef?: string;
};

export const GLOW_LIFE_MODEL_PIPELINE = [
  'Life Model',
  'Glow Graph',
  'Glow Intelligence Kernel',
  'Rooms / Experiences',
  'Actions',
  'Learning',
  'History',
] as const;

export const GLOW_INTELLIGENCE_MODES: readonly GlowIntelligenceMode[] = [
  'reactive',
  'proactive',
  'predictive',
  'simulative',
  'executive',
] as const;

export const GLOW_KERNEL_COMPONENTS = [
  'Life Model',
  'Glow Graph',
  'Context Engine',
  'Intent Engine',
  'Specialist Network',
  'Prediction Engine',
  'Simulation Engine',
  'Decision Engine',
  'Execution Engine',
  'Learning Engine',
  'History Engine',
  'Provenance Engine',
  'Permission System',
  'Explanation / Receipt System',
  'Event Bus',
  'Schema / Version / Migration Infrastructure',
] as const;

export type LifeModelTaskInput = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: Date | null;
};

export type LifeModelHabitInput = {
  id: string;
  name: string;
  completedToday: boolean;
};

export type LifeModelRoutineInput = {
  id: string;
  name: string;
  timeOfDay: string;
};

export type LifeModelGoalInput = {
  id: string;
  title: string;
};

export type LifeModelEventInput = {
  id: string;
  title: string;
  startAt: Date;
  allDay: boolean;
  source: string | null;
};

export type LifeModelReminderInput = {
  id: string;
  title: string;
  dueAt: Date | null;
  completed: boolean;
  listName: string;
};

export type LivingLifeModelInput = {
  generatedAt: Date;
  tasks: LifeModelTaskInput[];
  habits: LifeModelHabitInput[];
  routines: LifeModelRoutineInput[];
  goals: LifeModelGoalInput[];
  events: LifeModelEventInput[];
  reminders: LifeModelReminderInput[];
};

function clampConfidence(value: number) {
  return Math.max(0, Math.min(1, value));
}

function objectId(domain: GlowObjectDomain, sourceId: string) {
  return `${domain}:${sourceId}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function sourceSystemFromEventSource(source: string | null): GlowObjectProvenance['sourceSystem'] {
  const value = source?.toLowerCase() ?? '';
  if (value.includes('google')) return 'google';
  if (value.includes('apple')) return 'apple';
  if (value.includes('import')) return 'import';
  return 'glow-os';
}

function relationshipId(fromObjectId: string, type: string, toObjectId: string) {
  return `${fromObjectId}|${type}|${toObjectId}`;
}

export function buildLivingLifeModelSnapshot(input: LivingLifeModelInput): LivingLifeModelSnapshot {
  const objects = new Map<string, GlowObject>();

  for (const task of input.tasks) {
    const id = objectId('task', task.id);
    objects.set(id, {
      id,
      domain: 'task',
      title: task.title,
      state: task.status,
      version: 1,
      confidence: 1,
      provenance: { sourceSystem: 'glow-os', sourceTable: 'tasks', sourceId: task.id, observedAt: input.generatedAt },
      timing: task.dueDate ? { dueAt: task.dueDate } : undefined,
      dependencies: [],
      constraints: [],
      triggers: task.dueDate ? ['due-date'] : [],
      availableActions: ['open', 'plan', 'reschedule', 'complete'],
      resources: [],
      crossDomainEffects: ['time', 'attention', 'goals'],
      metadata: { priority: task.priority },
    });
  }

  for (const habit of input.habits) {
    const id = objectId('habit', habit.id);
    objects.set(id, {
      id,
      domain: 'habit',
      title: habit.name,
      state: habit.completedToday ? 'completed-today' : 'scheduled',
      version: 1,
      confidence: 1,
      provenance: { sourceSystem: 'glow-os', sourceTable: 'habits', sourceId: habit.id, observedAt: input.generatedAt },
      dependencies: [],
      constraints: [],
      triggers: ['daily-context'],
      availableActions: ['open', 'log', 'skip-intentionally', 'adjust'],
      resources: [],
      crossDomainEffects: ['routines', 'attention', 'goals'],
      metadata: { completedToday: habit.completedToday },
    });
  }

  for (const routine of input.routines) {
    const id = objectId('routine', routine.id);
    objects.set(id, {
      id,
      domain: 'routine',
      title: routine.name,
      state: 'scheduled-today',
      version: 1,
      confidence: 1,
      provenance: { sourceSystem: 'glow-os', sourceTable: 'routines', sourceId: routine.id, observedAt: input.generatedAt },
      timing: { timeOfDay: routine.timeOfDay },
      dependencies: [],
      constraints: [],
      triggers: ['time-of-day'],
      availableActions: ['open', 'start', 'use-quick-version', 'reschedule'],
      resources: [],
      crossDomainEffects: ['time', 'energy', 'habits'],
      metadata: {},
    });
  }

  for (const goal of input.goals) {
    const id = objectId('goal', goal.id);
    objects.set(id, {
      id,
      domain: 'goal',
      title: goal.title,
      state: 'active',
      version: 1,
      confidence: 1,
      provenance: { sourceSystem: 'glow-os', sourceTable: 'goals', sourceId: goal.id, observedAt: input.generatedAt },
      dependencies: [],
      constraints: [],
      triggers: [],
      availableActions: ['open', 'identify-next-action', 'plan', 'review-progress'],
      resources: [],
      crossDomainEffects: ['tasks', 'planning', 'decisions'],
      metadata: {},
    });
  }

  for (const event of input.events) {
    const id = objectId('calendar-event', event.id);
    objects.set(id, {
      id,
      domain: 'calendar-event',
      title: event.title,
      state: event.startAt < input.generatedAt ? 'past-or-active' : 'scheduled',
      version: 1,
      confidence: 1,
      provenance: {
        sourceSystem: sourceSystemFromEventSource(event.source),
        sourceTable: 'calendar_events',
        sourceId: event.id,
        observedAt: input.generatedAt,
      },
      timing: { startAt: event.startAt, allDay: event.allDay },
      dependencies: [],
      constraints: ['occupies-time'],
      triggers: ['start-time'],
      availableActions: ['open', 'prepare', 'find-conflicts', 'reschedule'],
      resources: [],
      crossDomainEffects: ['time', 'travel', 'preparation', 'routines', 'spending'],
      metadata: { source: event.source },
    });
  }

  for (const reminder of input.reminders) {
    const id = objectId('reminder', reminder.id);
    objects.set(id, {
      id,
      domain: 'reminder',
      title: reminder.title,
      state: reminder.completed ? 'completed' : 'open',
      version: 1,
      confidence: 1,
      provenance: { sourceSystem: 'apple', sourceTable: 'apple_reminders', sourceId: reminder.id, observedAt: input.generatedAt },
      timing: reminder.dueAt ? { dueAt: reminder.dueAt } : undefined,
      dependencies: [],
      constraints: [],
      triggers: reminder.dueAt ? ['due-time'] : [],
      availableActions: ['open', 'plan', 'complete', 'move-into-glow'],
      resources: [],
      crossDomainEffects: ['tasks', 'time', 'attention'],
      metadata: { listName: reminder.listName },
    });
  }

  const relationships = new Map<string, GlowRelationship>();
  const currentDayEvents = input.events.filter((event) => isSameDay(event.startAt, input.generatedAt));
  const currentDayTasks = input.tasks.filter((task) => task.dueDate && isSameDay(task.dueDate, input.generatedAt) && task.status !== 'done' && task.status !== 'cancelled');

  for (const task of currentDayTasks) {
    for (const event of currentDayEvents) {
      const fromObjectId = objectId('task', task.id);
      const toObjectId = objectId('calendar-event', event.id);
      const id = relationshipId(fromObjectId, 'competes-for-time-with', toObjectId);
      relationships.set(id, {
        id,
        fromObjectId,
        toObjectId,
        type: 'competes-for-time-with',
        direction: 'bidirectional',
        confidence: 0.8,
        provenance: 'inferred',
        rationale: 'The task is due on the same day that the event occupies calendar capacity.',
      });
    }
  }

  for (const routine of input.routines) {
    for (const event of currentDayEvents) {
      const fromObjectId = objectId('routine', routine.id);
      const toObjectId = objectId('calendar-event', event.id);
      const id = relationshipId(fromObjectId, 'competes-for-time-with', toObjectId);
      relationships.set(id, {
        id,
        fromObjectId,
        toObjectId,
        type: 'competes-for-time-with',
        direction: 'bidirectional',
        confidence: 0.65,
        provenance: 'inferred',
        rationale: 'The routine and calendar event both need real time today.',
      });
    }
  }

  return {
    reality: {
      id: `current-reality:${input.generatedAt.toISOString()}`,
      kind: 'current-reality',
      generatedAt: input.generatedAt,
    },
    objects: Array.from(objects.values()),
    relationships: Array.from(relationships.values()),
    intelligenceModes: GLOW_INTELLIGENCE_MODES,
    kernelComponents: GLOW_KERNEL_COMPONENTS,
  };
}

export function createGlowScenario(input: {
  kind: Exclude<GlowScenarioKind, 'current-reality'>;
  title: string;
  basedOnRealityId: string;
  changes: GlowScenarioChange[];
  summary?: string;
  now?: Date;
}): GlowScenario {
  return {
    id: `scenario:${crypto.randomUUID()}`,
    kind: input.kind,
    title: input.title,
    basedOnRealityId: input.basedOnRealityId,
    status: 'draft',
    createdAt: input.now ?? new Date(),
    changes: input.changes,
    summary: input.summary,
  };
}

export function applyAcceptedScenario(snapshot: LivingLifeModelSnapshot, scenario: GlowScenario): LivingLifeModelSnapshot {
  if (scenario.status !== 'accepted' || scenario.basedOnRealityId !== snapshot.reality.id) return snapshot;

  const changesByObjectId = new Map(scenario.changes.map((change) => [change.objectId, change]));
  const objects = snapshot.objects.map((object) => {
    const change = changesByObjectId.get(object.id);
    if (!change) return object;
    return {
      ...object,
      ...change.patch,
      version: object.version + 1,
      metadata: {
        ...object.metadata,
        ...(change.patch.metadata ?? {}),
      },
    };
  });

  const generatedAt = new Date();
  return {
    ...snapshot,
    reality: {
      id: `current-reality:${generatedAt.toISOString()}`,
      kind: 'current-reality',
      generatedAt,
    },
    objects,
  };
}

export function createGlowActionReceipt(input: Omit<GlowActionReceipt, 'id' | 'changedAt' | 'confidence'> & { confidence: number; changedAt?: Date }): GlowActionReceipt {
  return {
    ...input,
    id: `receipt:${crypto.randomUUID()}`,
    changedAt: input.changedAt ?? new Date(),
    confidence: clampConfidence(input.confidence),
  };
}
