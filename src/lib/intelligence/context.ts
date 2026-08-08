import 'server-only';

import { getTasksByUser } from '@/lib/data/tasks';
import { getHabitsByUser, getHabitLogsForUserByDate } from '@/lib/data/habits';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getGoalsByUser } from '@/lib/data/goals';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export type ContextRecommendation = {
  id: string;
  title: string;
  reason: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
};

export type PersonalContext = {
  generatedAt: Date;
  dayPart: 'morning' | 'afternoon' | 'evening' | 'night';
  todayLabel: string;
  nextEvent: { id: string; title: string; startAt: Date; allDay: boolean } | null;
  todaysEvents: { id: string; title: string; startAt: Date; allDay: boolean; source: string | null }[];
  unfinishedTasks: { id: string; title: string; priority: string; dueDate: Date | null }[];
  overdueTasks: { id: string; title: string; dueDate: Date }[];
  habits: { id: string; name: string; completedToday: boolean }[];
  routinesForToday: { id: string; name: string; timeOfDay: string }[];
  activeGoals: { id: string; title: string }[];
  recommendations: ContextRecommendation[];
  dailyBrief: string;
  focusScore: number;
};

function getDayPart(hour: number): PersonalContext['dayPart'] {
  if (hour < 10) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export async function buildPersonalContext(userId: string, now = new Date()): Promise<PersonalContext> {
  const dateKey = now.toISOString().slice(0, 10);
  const [tasks, habits, habitLogs, routines, goals, events] = await Promise.all([
    getTasksByUser(userId),
    getHabitsByUser(userId),
    getHabitLogsForUserByDate(userId, dateKey),
    getRoutinesByUser(userId),
    getGoalsByUser(userId),
    getCalendarEventsByUser(userId),
  ]);

  const dayPart = getDayPart(now.getHours());
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);
  const unfinishedTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const overdueTasks = unfinishedTasks.filter((task) => task.dueDate && task.dueDate < startOfToday).map((task) => ({ id: task.id, title: task.title, dueDate: task.dueDate! }));
  const todaysEvents = events.filter((event) => event.startAt >= startOfToday && event.startAt <= endOfToday).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const nextEvent = events.filter((event) => event.startAt >= now).sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null;
  const completedHabitIds = new Set(habitLogs.map((log) => log.habitId));
  const weekday = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const routinesForToday = routines.filter((routine) => !routine.daysOfWeek?.length || routine.daysOfWeek.some((day) => day.toLowerCase() === weekday));

  const recommendations: ContextRecommendation[] = [];
  if (overdueTasks[0]) recommendations.push({ id: `task-${overdueTasks[0].id}`, title: overdueTasks[0].title, reason: 'This task is overdue and should be reviewed first.', href: '/tasks', priority: 'high' });
  const dueToday = unfinishedTasks.find((task) => task.dueDate && task.dueDate >= startOfToday && task.dueDate <= endOfToday);
  if (dueToday) recommendations.push({ id: `due-${dueToday.id}`, title: dueToday.title, reason: 'This task is due today.', href: '/tasks', priority: 'high' });
  const skippedHabit = habits.find((habit) => !completedHabitIds.has(habit.id));
  if (skippedHabit) recommendations.push({ id: `habit-${skippedHabit.id}`, title: skippedHabit.name, reason: 'This habit has not been logged today.', href: '/habits', priority: 'medium' });
  const matchingRoutine = routinesForToday.find((routine) => routine.timeOfDay === dayPart || routine.timeOfDay === 'anytime');
  if (matchingRoutine) recommendations.push({ id: `routine-${matchingRoutine.id}`, title: matchingRoutine.name, reason: `This routine fits your ${dayPart}.`, href: '/routines', priority: 'medium' });
  if (nextEvent) recommendations.push({ id: `event-${nextEvent.id}`, title: nextEvent.title, reason: `Your next event begins ${nextEvent.allDay ? 'today' : nextEvent.startAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`, href: '/calendar', priority: 'low' });

  const completedCount = habits.filter((habit) => completedHabitIds.has(habit.id)).length;
  const focusScore = Math.max(0, Math.min(100, 70 - overdueTasks.length * 10 + completedCount * 5));
  const dailyBrief = `Good ${dayPart}. You have ${todaysEvents.length} event${todaysEvents.length === 1 ? '' : 's'} today, ${unfinishedTasks.length} unfinished task${unfinishedTasks.length === 1 ? '' : 's'}, and ${completedCount} of ${habits.length} habits logged.`;

  return {
    generatedAt: now,
    dayPart,
    todayLabel: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    nextEvent: nextEvent ? { id: nextEvent.id, title: nextEvent.title, startAt: nextEvent.startAt, allDay: nextEvent.allDay } : null,
    todaysEvents: todaysEvents.map((event) => ({ id: event.id, title: event.title, startAt: event.startAt, allDay: event.allDay, source: event.source })),
    unfinishedTasks: unfinishedTasks.slice(0, 12).map((task) => ({ id: task.id, title: task.title, priority: task.priority, dueDate: task.dueDate })),
    overdueTasks,
    habits: habits.map((habit) => ({ id: habit.id, name: habit.name, completedToday: completedHabitIds.has(habit.id) })),
    routinesForToday: routinesForToday.map((routine) => ({ id: routine.id, name: routine.name, timeOfDay: routine.timeOfDay })),
    activeGoals: goals.slice(0, 8).map((goal) => ({ id: goal.id, title: goal.title })),
    recommendations: recommendations.slice(0, 5),
    dailyBrief,
    focusScore,
  };
}
