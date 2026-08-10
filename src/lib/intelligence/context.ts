import 'server-only';

import { getTasksByUser } from '@/lib/data/tasks';
import { getHabitsByUser, getHabitLogsForUserByDate } from '@/lib/data/habits';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getGoalsByUser } from '@/lib/data/goals';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { rankRecommendations } from '@/lib/intelligence/recommendations';

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
  appleReminders: { id: string; title: string; dueAt: Date | null; completed: boolean; listName: string }[];
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
  const [tasks, habits, habitLogs, routines, goals, events, appleReminders] = await Promise.all([
    getTasksByUser(userId),
    getHabitsByUser(userId),
    getHabitLogsForUserByDate(userId, dateKey),
    getRoutinesByUser(userId),
    getGoalsByUser(userId),
    getCalendarEventsByUser(userId),
    getAppleRemindersByUser(userId),
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

  const ranked = rankRecommendations({
    tasks: unfinishedTasks.map((task) => ({ id: task.id, title: task.title, priority: task.priority, dueDate: task.dueDate })),
    reminders: appleReminders.map((reminder) => ({ id: reminder.id, title: reminder.title, dueAt: reminder.dueAt, completed: reminder.completed })),
    routines: routinesForToday.map((routine) => ({ id: routine.id, name: routine.name, incomplete: true })),
    habits: habits.map((habit) => ({ id: habit.id, name: habit.name, completedToday: completedHabitIds.has(habit.id) })),
    nextEventAt: nextEvent?.startAt ?? null,
    now,
  });

  const recommendations: ContextRecommendation[] = ranked.slice(0, 5).map((item) => ({
    id: item.id,
    title: item.title,
    reason: item.reason,
    href: item.sourceType === 'apple_reminder' ? '/connections' : item.sourceType === 'task' ? '/tasks' : item.sourceType === 'habit' ? '/habits' : '/planning',
    priority: item.score >= 60 ? 'high' : item.score >= 30 ? 'medium' : 'low',
  }));

  if (nextEvent && recommendations.length < 5) recommendations.push({ id: `event-${nextEvent.id}`, title: nextEvent.title, reason: `Your next event begins ${nextEvent.allDay ? 'today' : nextEvent.startAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}.`, href: '/calendar', priority: 'low' });

  const completedCount = habits.filter((habit) => completedHabitIds.has(habit.id)).length;
  const openReminderCount = appleReminders.filter((item) => !item.completed).length;
  const focusScore = Math.max(0, Math.min(100, 70 - overdueTasks.length * 10 - Math.min(openReminderCount, 5) * 2 + completedCount * 5));
  const dailyBrief = `Good ${dayPart}. You have ${todaysEvents.length} event${todaysEvents.length === 1 ? '' : 's'} today, ${unfinishedTasks.length} unfinished Glow OS task${unfinishedTasks.length === 1 ? '' : 's'}, ${openReminderCount} open Apple Reminder${openReminderCount === 1 ? '' : 's'}, and ${completedCount} of ${habits.length} habits logged.`;

  return {
    generatedAt: now,
    dayPart,
    todayLabel: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
    nextEvent: nextEvent ? { id: nextEvent.id, title: nextEvent.title, startAt: nextEvent.startAt, allDay: nextEvent.allDay } : null,
    todaysEvents: todaysEvents.map((event) => ({ id: event.id, title: event.title, startAt: event.startAt, allDay: event.allDay, source: event.source })),
    unfinishedTasks: unfinishedTasks.slice(0, 12).map((task) => ({ id: task.id, title: task.title, priority: task.priority, dueDate: task.dueDate })),
    overdueTasks,
    appleReminders: appleReminders.slice(0, 20).map((item) => ({ id: item.id, title: item.title, dueAt: item.dueAt, completed: item.completed, listName: item.listName })),
    habits: habits.map((habit) => ({ id: habit.id, name: habit.name, completedToday: completedHabitIds.has(habit.id) })),
    routinesForToday: routinesForToday.map((routine) => ({ id: routine.id, name: routine.name, timeOfDay: routine.timeOfDay })),
    activeGoals: goals.slice(0, 8).map((goal) => ({ id: goal.id, title: goal.title })),
    recommendations,
    dailyBrief,
    focusScore,
  };
}
