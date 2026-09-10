import type { PersonalContextData, PersonalEvent, PersonalRoutine, PersonalTask } from '@/lib/personal-context/types';

export type TodayExperienceRoom =
  | 'morning'
  | 'what-now'
  | 'focus'
  | 'meeting'
  | 'next-up'
  | 'later'
  | 'tonight'
  | 'tomorrow'
  | 'replan'
  | 'day-view';

export type TodayObjectKind = 'task' | 'event' | 'routine';

export type TodayObjectRef = {
  glowId: string;
  sourceId: string;
  kind: TodayObjectKind;
  title: string;
  state: string;
  source: 'glow' | 'google';
  startAt?: string | null;
  endAt?: string | null;
  relationships: string[];
};

export type TodayDecision = {
  objectId: string;
  score: number;
  reasons: string[];
};

export type TodayActionReceipt = {
  id: string;
  at: string;
  room: TodayExperienceRoom;
  action: string;
  objectId?: string;
  previousState?: string;
  nextState?: string;
  affectedObjectIds: string[];
  externalWrite: boolean;
  undoable: boolean;
};

export type TodayLivingModel = {
  dayId: string;
  generatedAt: string;
  objects: TodayObjectRef[];
  rankedNextActions: TodayDecision[];
  nowObjectId: string | null;
  nextEventId: string | null;
  laterEventIds: string[];
  tonightEventIds: string[];
  tomorrowEventIds: string[];
  energy: string | null;
};

function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function taskGlowId(task: Pick<PersonalTask, 'id'>) {
  return `task:${task.id}`;
}

export function eventGlowId(event: Pick<PersonalEvent, 'id' | 'source'>) {
  return `event:${event.source}:${event.id}`;
}

export function routineGlowId(routine: Pick<PersonalRoutine, 'id'>) {
  return `routine:${routine.id}`;
}

function taskObject(task: PersonalTask): TodayObjectRef {
  return {
    glowId: taskGlowId(task),
    sourceId: task.id,
    kind: 'task',
    title: task.title,
    state: task.status,
    source: 'glow',
    relationships: [],
  };
}

function eventObject(event: PersonalEvent): TodayObjectRef {
  return {
    glowId: eventGlowId(event),
    sourceId: event.id,
    kind: 'event',
    title: event.title,
    state: new Date(event.endAt ?? event.startAt).getTime() < Date.now() ? 'past' : 'scheduled',
    source: event.source,
    startAt: event.startAt,
    endAt: event.endAt,
    relationships: [],
  };
}

function routineObject(routine: PersonalRoutine): TodayObjectRef {
  return {
    glowId: routineGlowId(routine),
    sourceId: routine.id,
    kind: 'routine',
    title: routine.name,
    state: 'available',
    source: 'glow',
    relationships: [],
  };
}

function scoreTask(task: PersonalTask, minutesAvailable: number, energy: string | null): TodayDecision {
  let score = 0;
  const reasons: string[] = [];

  const priorityWeight = { low: 10, medium: 25, high: 45, urgent: 65 }[task.priority];
  score += priorityWeight;
  reasons.push(`${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} priority`);

  if (task.status === 'in_progress') {
    score += 30;
    reasons.push('Already in progress');
  }

  if (minutesAvailable >= 25) {
    score += 15;
    reasons.push(`Fits your available time (${minutesAvailable} min)`);
  }

  const normalizedEnergy = (energy ?? '').toLowerCase();
  if (normalizedEnergy.includes('low') || normalizedEnergy.includes('recovery')) {
    if (task.priority === 'low' || task.priority === 'medium') {
      score += 8;
      reasons.push('Gentler fit for current energy');
    }
  } else {
    score += 10;
    reasons.push('Good fit for focused energy');
  }

  if (task.dueDate) {
    const hoursToDue = (new Date(task.dueDate).getTime() - Date.now()) / 3_600_000;
    if (hoursToDue <= 24) {
      score += 25;
      reasons.push('Due within 24 hours');
    }
  }

  return { objectId: taskGlowId(task), score, reasons: reasons.slice(0, 3) };
}

export function buildTodayLivingModel(data: PersonalContextData, now = new Date()): TodayLivingModel {
  const nowMs = now.getTime();
  const upcomingToday = data.todayEvents
    .filter((event) => new Date(event.endAt ?? event.startAt).getTime() >= nowMs)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const nextEvent = upcomingToday[0] ?? null;
  const minutesAvailable = nextEvent
    ? Math.max(5, Math.round((new Date(nextEvent.startAt).getTime() - nowMs) / 60_000))
    : 45;

  const openTasks = data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const rankedNextActions = openTasks
    .map((task) => scoreTask(task, minutesAvailable, data.wellness?.energy ?? null))
    .sort((a, b) => b.score - a.score);

  const objects = [
    ...data.tasks.map(taskObject),
    ...data.events.map(eventObject),
    ...data.routines.map(routineObject),
  ];

  const currentTask = data.activeTask ?? openTasks.find((task) => task.status === 'in_progress') ?? null;
  const laterEventIds = upcomingToday
    .filter((event) => {
      const hour = new Date(event.startAt).getHours();
      return hour >= 12 && hour < 17;
    })
    .map(eventGlowId);
  const tonightEventIds = upcomingToday
    .filter((event) => new Date(event.startAt).getHours() >= 17)
    .map(eventGlowId);

  return {
    dayId: `day:${dayKey(now)}`,
    generatedAt: now.toISOString(),
    objects,
    rankedNextActions,
    nowObjectId: currentTask ? taskGlowId(currentTask) : null,
    nextEventId: nextEvent ? eventGlowId(nextEvent) : null,
    laterEventIds,
    tonightEventIds,
    tomorrowEventIds: data.tomorrowEvents.map(eventGlowId),
    energy: data.wellness?.energy ?? null,
  };
}

export function createTodayActionReceipt(input: Omit<TodayActionReceipt, 'id' | 'at'>): TodayActionReceipt {
  const at = new Date().toISOString();
  return {
    ...input,
    id: `today-receipt:${at}:${Math.random().toString(36).slice(2, 9)}`,
    at,
  };
}
