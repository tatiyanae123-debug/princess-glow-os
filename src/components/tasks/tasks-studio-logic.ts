import type { CalendarEvent, Task } from '@/lib/types';

export type TaskEnergy = 'High' | 'Normal' | 'Low' | 'Exhausted';
export type TaskContext = 'Anywhere' | 'Home' | 'Out' | 'Work' | 'Gym' | 'Computer' | 'Phone';

export const TASK_PRIORITY_SCORE: Record<Task['priority'], number> = { urgent: 4, high: 3, medium: 2, low: 1 };

export function sameTaskDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function endOfTaskDay(now: Date) {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function estimateTaskMinutes(task: Task) {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  if (/email|reply|text|confirm|order|refill|call/.test(text)) return 10;
  if (/laundry|shower|beauty|makeup|hair|clean|tidy/.test(text)) return 25;
  if (/workout|gym|run|pilates/.test(text)) return 35;
  if (/plan|research|interview|application|organize|project/.test(text)) return 45;
  return 20;
}

export function inferTaskContext(task: Task): TaskContext {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  if (/call|text|phone/.test(text)) return 'Phone';
  if (/email|research|application|computer|online|draft/.test(text)) return 'Computer';
  if (/grocery|return|pickup|pick up|store|errand/.test(text)) return 'Out';
  if (/gym|workout|pilates|run/.test(text)) return 'Gym';
  if (/laundry|clean|closet|bedroom|kitchen|home/.test(text)) return 'Home';
  if (/work|office|shift/.test(text)) return 'Work';
  return 'Anywhere';
}

export function inferTaskEnergy(task: Task): TaskEnergy {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  if (/research|planning|plan |application|interview|project|write|design/.test(text)) return 'High';
  if (/email|reply|call|order|confirm|refill|text/.test(text)) return 'Low';
  return 'Normal';
}

export function taskFitScore(task: Task, now: Date, energy: TaskEnergy, context: TaskContext, timeFit: number) {
  let score = TASK_PRIORITY_SCORE[task.priority] * 20;
  const minutes = estimateTaskMinutes(task);
  if (task.dueDate) {
    const delta = task.dueDate.getTime() - now.getTime();
    if (delta < 0) score += 35;
    else if (delta < 24 * 60 * 60_000) score += 25;
    else if (delta < 3 * 24 * 60 * 60_000) score += 10;
  }
  score += minutes <= timeFit ? 20 : -15;
  const inferredEnergy = inferTaskEnergy(task);
  if (energy === 'Exhausted') score += inferredEnergy === 'Low' ? 25 : inferredEnergy === 'High' ? -25 : -5;
  if (energy === 'Low') score += inferredEnergy === 'Low' ? 18 : inferredEnergy === 'High' ? -15 : 2;
  if (energy === 'High' && inferredEnergy === 'High') score += 10;
  const inferredContext = inferTaskContext(task);
  if (context !== 'Anywhere') score += inferredContext === context || inferredContext === 'Anywhere' ? 15 : -20;
  if (task.status === 'in_progress') score += 30;
  return score;
}

function timedIntervals(events: CalendarEvent[], now: Date) {
  return events
    .filter(event => !event.allDay && sameTaskDay(event.startAt, now))
    .map(event => ({ start: event.startAt, end: event.endAt ?? new Date(event.startAt.getTime() + 60 * 60_000) }))
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export function currentOpenWindowMinutes(events: CalendarEvent[], now: Date) {
  const intervals = timedIntervals(events, now);
  if (intervals.some(interval => interval.start <= now && interval.end > now)) return 0;
  const next = intervals.find(interval => interval.start > now);
  if (next) return Math.max(0, Math.floor((next.start.getTime() - now.getTime()) / 60_000));
  const end = new Date(now);
  end.setHours(23, 0, 0, 0);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60_000));
}

export function remainingDayFreeMinutes(events: CalendarEvent[], now: Date) {
  const end = new Date(now);
  end.setHours(23, 0, 0, 0);
  if (end <= now) return 0;
  const intervals = timedIntervals(events, now)
    .map(interval => ({
      start: new Date(Math.max(interval.start.getTime(), now.getTime())),
      end: new Date(Math.min(interval.end.getTime(), end.getTime())),
    }))
    .filter(interval => interval.end > interval.start);
  let busyMs = 0;
  let cursor: Date | null = null;
  for (const interval of intervals) {
    if (!cursor) {
      busyMs += interval.end.getTime() - interval.start.getTime();
      cursor = interval.end;
      continue;
    }
    if (interval.start >= cursor) {
      busyMs += interval.end.getTime() - interval.start.getTime();
      cursor = interval.end;
    } else if (interval.end > cursor) {
      busyMs += interval.end.getTime() - cursor.getTime();
      cursor = interval.end;
    }
  }
  return Math.max(0, Math.floor(((end.getTime() - now.getTime()) - busyMs) / 60_000));
}

export function committedTasksForToday(tasks: Task[], now: Date) {
  const end = endOfTaskDay(now);
  return tasks.filter(task => task.status === 'in_progress' || Boolean(task.dueDate && task.dueDate <= end));
}
