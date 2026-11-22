'use client';

import { useEffect, useState } from 'react';
import type {
  PersonalContextData,
  PersonalEvent,
  PersonalGoal,
  PersonalHabit,
  PersonalNote,
  PersonalRoutine,
  PersonalTask,
  PersonalWellness,
} from './types';

export type PersonalContextState =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: PersonalContextData }
  | { status: 'signed-out'; data: null }
  | { status: 'error'; data: null };

type KernelObject = {
  id: string;
  domain: string;
  title: string;
  summary: string | null;
  state: string;
  timing: Record<string, unknown>;
  metadata: Record<string, unknown>;
  provenance: Record<string, unknown>;
};

type KernelContext = {
  generatedAt?: string;
  currentRealityId?: string;
  objects?: KernelObject[];
};

const KERNEL_KEY = 'glow.kernel.context';
const SESSION_KEY = 'glow:personal-context:v2:kernel';

const EMPTY_CONTEXT: PersonalContextData = {
  ok: true,
  user: { name: null, email: null },
  tasks: [],
  activeTask: null,
  events: [],
  todayEvents: [],
  tomorrowEvents: [],
  routines: [],
  habits: [],
  notes: [],
  goals: [],
  wellness: null,
  sourceStatus: { googleCalendar: 'not_connected' },
};

function dayKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function validTaskState(value: string): PersonalTask['status'] {
  return value === 'in_progress' || value === 'done' || value === 'cancelled' ? value : 'pending';
}

function validPriority(value: unknown): PersonalTask['priority'] {
  return value === 'low' || value === 'high' || value === 'urgent' ? value : 'medium';
}

function validRoutineTime(value: unknown): PersonalRoutine['timeOfDay'] {
  return value === 'afternoon' || value === 'evening' || value === 'night' || value === 'anytime' ? value : 'morning';
}

function validFrequency(value: unknown): PersonalHabit['frequency'] {
  return value === 'weekdays' || value === 'weekends' || value === 'weekly' || value === 'custom' ? value : 'daily';
}

function toIso(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function objectDateKey(value: unknown) {
  const iso = toIso(value);
  return iso ? iso.slice(0, 10) : String(value ?? '').slice(0, 10);
}

function projectKernelContext(kernel: KernelContext): PersonalContextData {
  const objects = Array.isArray(kernel.objects) ? kernel.objects : [];
  const now = new Date();
  const today = dayKey(now);
  const tomorrowDate = new Date(now); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = dayKey(tomorrowDate);

  const tasks: PersonalTask[] = objects
    .filter((item) => item.domain === 'task' && item.state !== 'archived')
    .map((item) => ({
      id: item.id.replace(/^task:/, ''),
      title: item.title,
      description: item.summary,
      status: validTaskState(item.state),
      priority: validPriority(item.metadata.priority),
      dueDate: toIso(item.timing.dueAt),
    }))
    .sort((a, b) => {
      const priority = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
      return priority[a.priority] - priority[b.priority] || String(a.dueDate ?? '').localeCompare(String(b.dueDate ?? ''));
    });

  const events: PersonalEvent[] = objects
    .filter((item) => item.domain === 'calendar-event' && item.state !== 'archived')
    .map((item) => ({
      id: item.id.replace(/^calendar-event:/, ''),
      source: (item.provenance.sourceSystem === 'google' ? 'google' : 'glow') as PersonalEvent['source'],
      title: item.title,
      startAt: toIso(item.timing.startAt) ?? new Date(0).toISOString(),
      endAt: toIso(item.timing.endAt),
      allDay: item.timing.allDay === true,
      location: typeof item.metadata.location === 'string' ? item.metadata.location : null,
      htmlLink: typeof item.metadata.htmlLink === 'string' ? item.metadata.htmlLink : null,
    }))
    .filter((event) => event.startAt !== new Date(0).toISOString())
    .sort((a, b) => a.startAt.localeCompare(b.startAt));

  const routines: PersonalRoutine[] = objects
    .filter((item) => item.domain === 'routine' && item.state !== 'archived')
    .map((item) => ({
      id: item.id.replace(/^routine:/, ''),
      name: item.title,
      description: item.summary,
      timeOfDay: validRoutineTime(item.timing.timeOfDay),
    }));

  const habits: PersonalHabit[] = objects
    .filter((item) => item.domain === 'habit' && item.state !== 'archived')
    .map((item) => ({
      id: item.id.replace(/^habit:/, ''),
      name: item.title,
      description: item.summary,
      frequency: validFrequency(item.metadata.frequency),
    }));

  const notes: PersonalNote[] = objects
    .filter((item) => item.domain === 'note' && item.state !== 'archived')
    .map((item) => ({
      id: item.id.replace(/^note:/, ''),
      title: item.title,
      content: item.summary,
      pinned: item.metadata.pinned === true,
      updatedAt: typeof item.metadata.updatedAt === 'string' ? item.metadata.updatedAt : (kernel.generatedAt ?? new Date().toISOString()),
    }));

  const goals: PersonalGoal[] = objects
    .filter((item) => item.domain === 'goal' && item.state !== 'archived')
    .map((item) => ({
      id: item.id.replace(/^goal:/, ''),
      title: item.title,
      description: item.summary,
      category: String(item.metadata.category ?? 'other'),
      status: item.state,
      progress: Number(item.metadata.progress ?? 0),
      targetDate: toIso(item.timing.targetDate),
    }));

  const wellnessObject = objects
    .filter((item) => item.domain === 'wellness-signal')
    .sort((a, b) => objectDateKey(b.timing.occurredAt).localeCompare(objectDateKey(a.timing.occurredAt)))[0];
  const wellness: PersonalWellness = wellnessObject ? {
    entryDate: objectDateKey(wellnessObject.timing.occurredAt),
    mood: typeof wellnessObject.metadata.mood === 'string' ? wellnessObject.metadata.mood : null,
    energy: typeof wellnessObject.metadata.energy === 'string' ? wellnessObject.metadata.energy : null,
    sleepHours: wellnessObject.metadata.sleepHours == null ? null : Number(wellnessObject.metadata.sleepHours),
    waterGlasses: wellnessObject.metadata.waterGlasses == null ? null : Number(wellnessObject.metadata.waterGlasses),
    notes: wellnessObject.summary,
  } : null;

  const todayEvents = events.filter((event) => event.startAt.slice(0, 10) === today);
  const tomorrowEvents = events.filter((event) => event.startAt.slice(0, 10) === tomorrow);
  const activeTask = tasks.find((task) => task.status === 'in_progress') ?? tasks.find((task) => task.status === 'pending') ?? null;
  const hasGoogleCalendar = objects.some((item) => item.domain === 'calendar-event' && item.provenance.sourceSystem === 'google');

  return {
    ok: true,
    user: { name: null, email: null },
    tasks,
    activeTask,
    events,
    todayEvents,
    tomorrowEvents,
    routines,
    habits,
    notes,
    goals,
    wellness,
    sourceStatus: { googleCalendar: hasGoogleCalendar ? 'connected' : 'not_connected' },
  };
}

function readKernel(): KernelContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KERNEL_KEY);
    return raw ? JSON.parse(raw) as KernelContext : null;
  } catch {
    return null;
  }
}

function readCachedData(): PersonalContextData {
  if (typeof window === 'undefined') return EMPTY_CONTEXT;
  const kernel = readKernel();
  if (kernel) return projectKernelContext(kernel);
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) as PersonalContextData : null;
    return parsed?.ok ? parsed : EMPTY_CONTEXT;
  } catch {
    return EMPTY_CONTEXT;
  }
}

function saveProjection(data: PersonalContextData) {
  try { window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); } catch {}
}

export function usePersonalContext(): PersonalContextState {
  const [state, setState] = useState<PersonalContextState>(() => ({ status: 'ready', data: readCachedData() }));

  useEffect(() => {
    const update = (event?: Event) => {
      const detail = event instanceof CustomEvent ? event.detail as KernelContext : null;
      const kernel = detail ?? readKernel();
      if (!kernel) return;
      const data = projectKernelContext(kernel);
      saveProjection(data);
      setState({ status: 'ready', data });
    };

    update();
    document.addEventListener('glow:kernel-context', update);
    return () => document.removeEventListener('glow:kernel-context', update);
  }, []);

  return state;
}
