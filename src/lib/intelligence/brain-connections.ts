import 'server-only';

import { getTasksByUser } from '@/lib/data/tasks';
import { getGoalsByUser } from '@/lib/data/goals';
import { getHabitsByUser } from '@/lib/data/habits';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getNotesByUser } from '@/lib/data/notes';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getMedicationsByUser, getSupplementsByUser } from '@/lib/data/health-intelligence';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getProjectsByUser, getAllLifeMemoriesByUser } from '@/lib/data/user-scope';
import { getBeautyProducts, getFinanceGoals, getFitnessSessions, getTimelineEvents } from '@/lib/data/completion-v1';

export type BrainConnectionInstance = {
  id: string;
  title: string;
  detail: string;
  occurredAt: Date | null;
  href: string;
};

export type BrainConnectionType = {
  id: string;
  domainA: string;
  domainB: string;
  label: string;
  basis: 'stored' | 'inferred' | 'system';
  rule: string;
  hrefA: string;
  hrefB: string;
  instances: BrainConnectionInstance[];
};

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'because', 'before', 'being', 'could', 'daily', 'from', 'have',
  'into', 'just', 'life', 'more', 'note', 'personal', 'that', 'their', 'there', 'these', 'they', 'this',
  'with', 'would', 'your', 'week', 'weekly', 'plan', 'goal', 'project',
]);

function significantWords(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !STOP_WORDS.has(word)),
  );
}

function sharedWord(a: Set<string>, b: Set<string>) {
  for (const word of a) if (b.has(word)) return word;
  return null;
}

function sameDay(a: Date | null | undefined, b: Date | null | undefined) {
  if (!a || !b) return false;
  return a.toDateString() === b.toDateString();
}

export type BrainConnectionsResult = {
  types: BrainConnectionType[];
  totalInstances: number;
  activeTypeCount: number;
};

export async function buildBrainConnections(userId: string): Promise<BrainConnectionsResult> {
  const [
    tasks, goals, habits, routines, events, notes, wellnessEntries, medications, supplements,
    beautyRoutines, beautyProducts, financeEntries, financeGoals, projects, memories, timelineEvents,
  ] = await Promise.all([
    getTasksByUser(userId),
    getGoalsByUser(userId),
    getHabitsByUser(userId),
    getRoutinesByUser(userId),
    getCalendarEventsByUser(userId),
    getNotesByUser(userId),
    getWellnessEntriesByUser(userId),
    getMedicationsByUser(userId),
    getSupplementsByUser(userId),
    getBeautyRoutinesByUser(userId),
    getBeautyProducts(userId),
    getFinanceEntriesByUser(userId),
    getFinanceGoals(userId),
    getProjectsByUser(userId),
    getAllLifeMemoriesByUser(userId),
    getTimelineEvents(userId),
  ]);

  const types: BrainConnectionType[] = [];

  // 1. Tasks ↔ Projects — real stored relationship (project.relatedTaskIds)
  const taskById = new Map(tasks.map((t) => [t.id, t]));
  const taskProjectInstances: BrainConnectionInstance[] = [];
  for (const project of projects) {
    for (const taskId of project.relatedTaskIds ?? []) {
      const task = taskById.get(taskId);
      if (!task) continue;
      taskProjectInstances.push({
        id: `${project.id}-${task.id}`,
        title: `${project.title} ↔ ${task.title}`,
        detail: `"${task.title}" is linked directly to the project "${project.title}".`,
        occurredAt: task.updatedAt ?? task.createdAt ?? null,
        href: '/projects',
      });
    }
  }
  types.push({
    id: 'tasks-projects', domainA: 'Tasks', domainB: 'Projects', label: 'Tasks ↔ Projects',
    basis: 'stored', rule: 'A task is linked when it appears in that project’s stored related-task list.',
    hrefA: '/tasks', hrefB: '/projects', instances: taskProjectInstances,
  });

  // 2. Calendar ↔ Tasks — same-day due date match
  const calendarTaskInstances: BrainConnectionInstance[] = [];
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const match = events.find((event) => sameDay(event.startAt, task.dueDate));
    if (!match) continue;
    calendarTaskInstances.push({
      id: `${task.id}-${match.id}`,
      title: `${task.title} ↔ ${match.title}`,
      detail: `Task is due the same day as your calendar event "${match.title}".`,
      occurredAt: task.dueDate,
      href: '/calendar',
    });
  }
  types.push({
    id: 'calendar-tasks', domainA: 'Calendar', domainB: 'Tasks', label: 'Calendar ↔ Tasks',
    basis: 'inferred', rule: 'A task and an event are linked when they fall on the same calendar day.',
    hrefA: '/calendar', hrefB: '/tasks', instances: calendarTaskInstances,
  });

  // 3. Goals ↔ Projects — inferred keyword overlap
  const goalProjectInstances: BrainConnectionInstance[] = [];
  for (const goal of goals) {
    const goalWords = significantWords(`${goal.title} ${goal.category}`);
    for (const project of projects) {
      const projectWords = significantWords(`${project.title} ${project.area} ${project.notes ?? ''}`);
      const word = sharedWord(goalWords, projectWords);
      if (!word) continue;
      goalProjectInstances.push({
        id: `${goal.id}-${project.id}`,
        title: `${goal.title} ↔ ${project.title}`,
        detail: `Goal and project both reference "${word}".`,
        occurredAt: project.updatedAt ?? null,
        href: '/goals',
      });
    }
  }
  types.push({
    id: 'goals-projects', domainA: 'Goals', domainB: 'Projects', label: 'Goals ↔ Projects',
    basis: 'inferred', rule: 'Linked when a goal and a project share a significant keyword in their title, category, or area.',
    hrefA: '/goals', hrefB: '/projects', instances: goalProjectInstances,
  });

  // 4. Habits ↔ Routines — inferred keyword overlap
  const habitRoutineInstances: BrainConnectionInstance[] = [];
  for (const habit of habits) {
    const habitWords = significantWords(`${habit.name} ${habit.description ?? ''}`);
    for (const routine of routines) {
      const routineWords = significantWords(`${routine.name} ${routine.description ?? ''}`);
      const word = sharedWord(habitWords, routineWords);
      if (!word) continue;
      habitRoutineInstances.push({
        id: `${habit.id}-${routine.id}`,
        title: `${habit.name} ↔ ${routine.name}`,
        detail: `Habit and routine both reference "${word}".`,
        occurredAt: null,
        href: '/habits',
      });
    }
  }
  types.push({
    id: 'habits-routines', domainA: 'Habits', domainB: 'Routines', label: 'Habits ↔ Routines',
    basis: 'inferred', rule: 'Linked when a habit and a routine share a significant keyword in their name or description.',
    hrefA: '/habits', hrefB: '/routines', instances: habitRoutineInstances,
  });

  // 5. Health & Care ↔ Wellness — same system (medications/supplements live inside Wellness)
  const wellnessInstances: BrainConnectionInstance[] = [
    ...medications.filter((m) => m.active).map((m) => ({
      id: `med-${m.id}`,
      title: `${m.name} ↔ Wellness check-ins`,
      detail: `Active medication tracked alongside ${wellnessEntries.length} logged check-in${wellnessEntries.length === 1 ? '' : 's'}.`,
      occurredAt: m.updatedAt ?? null,
      href: '/wellness',
    })),
    ...supplements.filter((s) => s.active).map((s) => ({
      id: `supp-${s.id}`,
      title: `${s.name} ↔ Wellness check-ins`,
      detail: `Active supplement tracked alongside ${wellnessEntries.length} logged check-in${wellnessEntries.length === 1 ? '' : 's'}.`,
      occurredAt: s.updatedAt ?? null,
      href: '/wellness',
    })),
  ];
  types.push({
    id: 'health-wellness', domainA: 'Health & Care', domainB: 'Wellness', label: 'Health & Care ↔ Wellness',
    basis: 'system', rule: 'Medications and supplements are stored and reviewed inside the same Wellness room as your daily check-ins.',
    hrefA: '/wellness', hrefB: '/wellness', instances: wellnessInstances,
  });

  // 6. Beauty ↔ Beauty Lab — real routine/product cross-reference
  const amProductNames = new Set(beautyRoutines.filter((r) => r.timeOfDay === 'morning').flatMap((r) => r.products ?? []).map((p) => p.toLowerCase()));
  const pmProductNames = new Set(beautyRoutines.filter((r) => r.timeOfDay === 'evening' || r.timeOfDay === 'night').flatMap((r) => r.products ?? []).map((p) => p.toLowerCase()));
  const repurchaseProducts = beautyProducts.filter((p) => p.repurchase === 'yes');
  const beautyInstances: BrainConnectionInstance[] = [];
  for (const product of repurchaseProducts) {
    const name = product.name.toLowerCase();
    if (amProductNames.has(name)) beautyInstances.push({ id: `${product.id}-am`, title: `${product.name} ↔ Morning Routine`, detail: 'Repurchase-worthy product appears in your logged morning routine.', occurredAt: null, href: '/beauty' });
    if (pmProductNames.has(name)) beautyInstances.push({ id: `${product.id}-pm`, title: `${product.name} ↔ Evening Routine`, detail: 'Repurchase-worthy product appears in your logged evening routine.', occurredAt: null, href: '/beauty' });
  }
  types.push({
    id: 'beauty-lab', domainA: 'Beauty', domainB: 'Beauty Lab', label: 'Beauty ↔ Beauty Lab',
    basis: 'stored', rule: 'Linked when a product you marked "repurchase" also appears in a logged AM or PM routine step.',
    hrefA: '/beauty', hrefB: '/beauty/lab', instances: beautyInstances,
  });

  // 7. Money & Growth ↔ Financial Brain — same system (finance goals reviewed via shared ledger)
  const financeInstances: BrainConnectionInstance[] = financeGoals.map((g) => ({
    id: `fg-${g.id}`,
    title: `${g.name} ↔ Finance Ledger`,
    detail: `${Math.round(g.targetCents ? (g.currentCents / g.targetCents) * 100 : 0)}% funded from ${financeEntries.length} logged entr${financeEntries.length === 1 ? 'y' : 'ies'}.`,
    occurredAt: g.updatedAt ?? null,
    href: '/finance/brain',
  }));
  types.push({
    id: 'finance-brain', domainA: 'Money & Growth', domainB: 'Financial Brain', label: 'Money & Growth ↔ Financial Brain',
    basis: 'system', rule: 'Financial Brain forecasts and goal pace are computed directly from your Money & Growth ledger.',
    hrefA: '/finance', hrefB: '/finance/brain', instances: financeInstances,
  });

  // 8. Memory ↔ Timeline — same-day match
  const memoryTimelineInstances: BrainConnectionInstance[] = [];
  for (const memory of memories) {
    if (!memory.sourceDate) continue;
    const match = timelineEvents.find((event) => sameDay(event.occurredAt, memory.sourceDate));
    if (!match) continue;
    memoryTimelineInstances.push({
      id: `${memory.id}-${match.id}`,
      title: `${memory.title} ↔ ${match.title}`,
      detail: 'Memory and timeline event share the same date.',
      occurredAt: memory.sourceDate,
      href: '/timeline',
    });
  }
  types.push({
    id: 'memory-timeline', domainA: 'Memory', domainB: 'Timeline', label: 'Memory ↔ Timeline',
    basis: 'inferred', rule: 'Linked when a saved memory and a timeline event share the same date.',
    hrefA: '/memory', hrefB: '/timeline', instances: memoryTimelineInstances,
  });

  // 9. Memory ↔ Projects — real stored relationship (lifeMemory.relatedProjectId)
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const memoryProjectInstances: BrainConnectionInstance[] = [];
  for (const memory of memories) {
    if (!memory.relatedProjectId) continue;
    const project = projectById.get(memory.relatedProjectId);
    if (!project) continue;
    memoryProjectInstances.push({
      id: `${memory.id}-${project.id}`,
      title: `${memory.title} ↔ ${project.title}`,
      detail: `Memory is explicitly connected to the project "${project.title}".`,
      occurredAt: memory.sourceDate ?? memory.createdAt ?? null,
      href: '/memory',
    });
  }
  types.push({
    id: 'memory-projects', domainA: 'Memory', domainB: 'Projects', label: 'Memory ↔ Projects',
    basis: 'stored', rule: 'A memory is linked when you explicitly connected it to that project while saving it.',
    hrefA: '/memory', hrefB: '/projects', instances: memoryProjectInstances,
  });

  // 10. Ideas (Notes) ↔ Projects — real text pattern ("Project: X")
  const noteProjectInstances: BrainConnectionInstance[] = [];
  for (const note of notes) {
    const text = `${note.title} ${note.content ?? ''}`;
    const mentions = Array.from(text.matchAll(/\bproject\s*:\s*([^\n,.;]+)/gi)).map((m) => m[1].trim().toLowerCase());
    if (!mentions.length) continue;
    for (const project of projects) {
      if (!mentions.some((mention) => project.title.toLowerCase().includes(mention) || mention.includes(project.title.toLowerCase()))) continue;
      noteProjectInstances.push({
        id: `${note.id}-${project.id}`,
        title: `${note.title || 'Untitled note'} ↔ ${project.title}`,
        detail: `Note text mentions "Project: ${project.title}".`,
        occurredAt: note.updatedAt ?? note.createdAt ?? null,
        href: '/notes',
      });
    }
  }
  types.push({
    id: 'ideas-projects', domainA: 'Ideas', domainB: 'Projects', label: 'Ideas ↔ Projects',
    basis: 'inferred', rule: 'Linked when a note contains the text "Project: <name>" matching a real project title.',
    hrefA: '/notes', hrefB: '/projects', instances: noteProjectInstances,
  });

  const totalInstances = types.reduce((sum, type) => sum + type.instances.length, 0);
  const activeTypeCount = types.filter((type) => type.instances.length > 0).length;

  return { types, totalInstances, activeTypeCount };
}

export type BrainMapDomain = {
  id: string;
  label: string;
  href: string;
  count: number;
};

export async function buildBrainMapDomains(userId: string): Promise<BrainMapDomain[]> {
  const [goals, notes, memories] = await Promise.all([
    getGoalsByUser(userId),
    getNotesByUser(userId),
    getAllLifeMemoriesByUser(userId),
  ]);
  const [fitnessSessions, projects, financeEntries, wellnessEntries] = await Promise.all([
    getFitnessSessions(userId),
    getProjectsByUser(userId),
    getFinanceEntriesByUser(userId),
    getWellnessEntriesByUser(userId),
  ]);

  return [
    { id: 'goals', label: 'Goals', href: '/goals', count: goals.filter((g) => g.status !== 'achieved' && g.status !== 'abandoned').length },
    { id: 'fitness', label: 'Fitness', href: '/fitness', count: fitnessSessions.length },
    { id: 'finance', label: 'Finance', href: '/finance', count: financeEntries.length },
    { id: 'work', label: 'Work', href: '/projects', count: projects.filter((p) => p.status === 'active').length },
    { id: 'ideas', label: 'Ideas', href: '/notes', count: notes.length },
    { id: 'wellness', label: 'Wellness', href: '/wellness', count: wellnessEntries.length },
    { id: 'memories', label: 'Memories', href: '/memory', count: memories.filter((m) => !m.archived).length },
  ];
}
