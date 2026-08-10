import 'server-only';

import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getTodayReview } from '@/lib/intelligence/adaptive-os';

export type TomorrowPlan = {
  date: Date;
  label: string;
  events: { id: string; title: string; startAt: Date; endAt: Date | null; allDay: boolean; location: string | null }[];
  topTasks: { id: string; title: string; priority: string; dueDate: Date | null }[];
  routines: { id: string; name: string; timeOfDay: string }[];
  prepTonight: string[];
  topThree: string[];
  summary: string;
};

export async function buildTomorrowPlan(userId: string, now = new Date()): Promise<TomorrowPlan> {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const end = new Date(tomorrow);
  end.setHours(23, 59, 59, 999);
  const dateKey = now.toISOString().slice(0, 10);

  const [tasks, events, routines, review] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getRoutinesByUser(userId),
    getTodayReview(userId, dateKey),
  ]);

  const tomorrowEvents = events.filter((event) => event.startAt >= tomorrow && event.startAt <= end).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const openTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const dueTomorrow = openTasks.filter((task) => task.dueDate && task.dueDate >= tomorrow && task.dueDate <= end);
  const urgentUndated = openTasks.filter((task) => !task.dueDate && (task.priority === 'urgent' || task.priority === 'high'));
  const priorityRank: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
  const topTasks = [...dueTomorrow, ...urgentUndated].filter((task, index, array) => array.findIndex((candidate) => candidate.id === task.id) === index).sort((a, b) => (priorityRank[b.priority] ?? 0) - (priorityRank[a.priority] ?? 0)).slice(0, 6);

  const weekday = tomorrow.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const tomorrowRoutines = routines.filter((routine) => !routine.daysOfWeek?.length || routine.daysOfWeek.some((day) => day.toLowerCase() === weekday));

  const prepTonight: string[] = [];
  if (tomorrowEvents.length) prepTonight.push('Review the first commitment and protect travel/get-ready buffer.');
  if (tomorrowEvents.some((event) => event.location)) prepTonight.push('Set out anything you need to bring and confirm the location.');
  if (topTasks.length >= 4) prepTonight.push('Keep tomorrow to the top three; defer lower-value work before the day begins.');
  if (tomorrowRoutines.some((routine) => routine.name.toLowerCase().includes('hair'))) prepTonight.push('Set out hair products/tools tonight so maintenance starts without friction.');
  if (tomorrowRoutines.some((routine) => routine.name.toLowerCase().includes('workout') || routine.name.toLowerCase().includes('fitness'))) prepTonight.push('Choose workout clothes and confirm the realistic time window.');
  if (!prepTonight.length) prepTonight.push('Do a 5-minute reset, charge devices, and leave tomorrow’s first action visible.');

  const topThree = review?.tomorrowTopThree?.length ? review.tomorrowTopThree.slice(0, 3) : topTasks.slice(0, 3).map((task) => task.title);
  const summary = `Tomorrow has ${tomorrowEvents.length} calendar event${tomorrowEvents.length === 1 ? '' : 's'}, ${topTasks.length} priority task${topTasks.length === 1 ? '' : 's'} worth considering, and ${tomorrowRoutines.length} routine${tomorrowRoutines.length === 1 ? '' : 's'} scheduled.`;

  return {
    date: tomorrow,
    label: tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    events: tomorrowEvents.map((event) => ({ id: event.id, title: event.title, startAt: event.startAt, endAt: event.endAt, allDay: event.allDay, location: event.location })),
    topTasks: topTasks.map((task) => ({ id: task.id, title: task.title, priority: task.priority, dueDate: task.dueDate })),
    routines: tomorrowRoutines.map((routine) => ({ id: routine.id, name: routine.name, timeOfDay: routine.timeOfDay })),
    prepTonight,
    topThree,
    summary,
  };
}
