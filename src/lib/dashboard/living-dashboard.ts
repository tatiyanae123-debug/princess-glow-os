import type { Task } from '@/lib/types';
import { getTasksByUser } from '@/lib/data/tasks';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getGoalsByUser } from '@/lib/data/goals';
import { getWorkSchedulesByUser } from '@/lib/data/work-schedules';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getHabitsByUser, getHabitLogsForUserByDate } from '@/lib/data/habits';
import { getNotesByUser } from '@/lib/data/notes';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getUpcomingGoogleEvents } from '@/lib/google/calendar-client';
import { getRecentInboxMessages } from '@/lib/google/gmail-client';
import { getImportBatchesByUser } from '@/lib/importer/confirm';
import { getWorkoutOfTheDay, getWeeklyTheme, type Weekday } from '@/lib/glow-content/library';
import type { LivingDashboardData, GoogleWidgetStatus } from '@/lib/dashboard/types';

const priorityRank: Record<Task['priority'], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const weekdayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

function getTimeOfDayState(date: Date) {
  const hour = date.getHours();
  if (hour < 12) {
    return {
      label: 'Good morning',
      title: 'Start with calm clarity.',
      message: 'Anchor one priority early and keep your pace intentional.',
      routineMatch: 'morning' as const,
    };
  }
  if (hour < 17) {
    return {
      label: 'Good afternoon',
      title: 'Protect your momentum.',
      message: 'Keep focus light and finish your highest-value block next.',
      routineMatch: 'afternoon' as const,
    };
  }
  if (hour < 21) {
    return {
      label: 'Good evening',
      title: 'Close the day with intention.',
      message: 'Wrap key tasks, then shift into routines that reset your energy.',
      routineMatch: 'evening' as const,
    };
  }
  return {
    label: 'Good night',
    title: 'A gentle wind-down keeps tomorrow strong.',
    message: 'Capture wins, simplify tomorrow, and end the day with ease.',
    routineMatch: 'night' as const,
  };
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function sortTasksByPriority(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });
}

export async function getLivingDashboardData(userId: string): Promise<LivingDashboardData> {
  const now = new Date();
  const dayOfWeek = weekdayOrder[now.getDay()];
  const timeState = getTimeOfDayState(now);
  const todayKey = now.toISOString().slice(0, 10);

  const [
    tasks,
    routines,
    goals,
    workSchedules,
    events,
    habits,
    todaysHabitLogs,
    notes,
    beautyRoutines,
    wellnessEntries,
    googleCalendarResult,
    gmailResult,
    importBatches,
  ] = await Promise.all([
    getTasksByUser(userId),
    getRoutinesByUser(userId),
    getGoalsByUser(userId),
    getWorkSchedulesByUser(userId),
    getCalendarEventsByUser(userId),
    getHabitsByUser(userId),
    getHabitLogsForUserByDate(userId, todayKey),
    getNotesByUser(userId),
    getBeautyRoutinesByUser(userId),
    getWellnessEntriesByUser(userId),
    getUpcomingGoogleEvents(userId),
    getRecentInboxMessages(userId),
    getImportBatchesByUser(userId),
  ]);

  const activeTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const topPriorityTasks = sortTasksByPriority(activeTasks).slice(0, 3);
  const tasksDueToday = activeTasks.filter((task) => task.dueDate && isSameDay(task.dueDate, now)).length;

  const todaysEvents = events
    .filter((event) => isSameDay(event.startAt, now))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 4);

  const routinesForNow = routines
    .filter((routine) => {
      const dayMatch = !routine.daysOfWeek || routine.daysOfWeek.length === 0 || routine.daysOfWeek.includes(dayOfWeek);
      const timeMatch = routine.timeOfDay === timeState.routineMatch || routine.timeOfDay === 'anytime';
      return dayMatch && timeMatch;
    })
    .slice(0, 4);

  const todaysWorkSchedule = workSchedules
    .filter((schedule) => schedule.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  const inProgressGoals = goals.filter((goal) => goal.status === 'in_progress');
  const achievedGoals = goals.filter((goal) => goal.status === 'achieved');
  const averageGoalProgress = goals.length
    ? Math.round(goals.reduce((total, goal) => total + goal.progress, 0) / goals.length)
    : 0;

  const loggedHabitIds = new Set(todaysHabitLogs.map((log) => log.habitId));
  const habitSummary = {
    totalHabits: habits.length,
    completedToday: habits.filter((habit) => loggedHabitIds.has(habit.id)).length,
    habits: habits.slice(0, 6).map((habit) => ({
      id: habit.id,
      name: habit.name,
      color: habit.color,
      targetCount: habit.targetCount,
      completedToday: loggedHabitIds.has(habit.id),
    })),
  };

  const pinnedNotes = notes.filter((note) => note.pinned);
  const notesSummary = {
    pinnedCount: pinnedNotes.length,
    recentNotes: notes.slice(0, 4).map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      pinned: note.pinned,
      updatedAt: note.updatedAt,
    })),
  };

  const beautyToday = beautyRoutines
    .filter((routine) => routine.timeOfDay === timeState.routineMatch || routine.timeOfDay === 'anytime')
    .slice(0, 4)
    .map((routine) => ({
      id: routine.id,
      name: routine.name,
      timeOfDay: routine.timeOfDay,
      products: routine.products,
    }));

  const todaysWellnessEntry = wellnessEntries.find((entry) => entry.entryDate === todayKey) ?? null;
  const wellnessToday = {
    loggedToday: todaysWellnessEntry !== null,
    entry: todaysWellnessEntry
      ? {
          id: todaysWellnessEntry.id,
          mood: todaysWellnessEntry.mood,
          energy: todaysWellnessEntry.energy,
          sleepHours: todaysWellnessEntry.sleepHours,
          waterGlasses: todaysWellnessEntry.waterGlasses,
        }
      : null,
  };

  const googleCalendarStatus: GoogleWidgetStatus = googleCalendarResult.ok
    ? 'connected'
    : googleCalendarResult.reason === 'not_connected'
      ? 'not_connected'
      : googleCalendarResult.reason === 'insufficient_scope'
        ? 'insufficient_scope'
        : googleCalendarResult.reason === 'revoked'
          ? 'revoked'
          : 'error';
  const googleCalendar = {
    status: googleCalendarStatus,
    events: googleCalendarResult.ok ? googleCalendarResult.events : [],
  };

  const gmailStatus: GoogleWidgetStatus = gmailResult.ok
    ? 'connected'
    : gmailResult.reason === 'not_connected'
      ? 'not_connected'
      : gmailResult.reason === 'insufficient_scope'
        ? 'insufficient_scope'
        : gmailResult.reason === 'revoked'
          ? 'revoked'
          : 'error';
  const gmailInbox = {
    status: gmailStatus,
    unreadCount: gmailResult.ok ? gmailResult.unreadCount : 0,
    messages: gmailResult.ok
      ? gmailResult.messages.slice(0, 5).map((m) => ({ id: m.id, from: m.from, subject: m.subject, snippet: m.snippet, unread: m.unread }))
      : [],
  };

  const workout = getWorkoutOfTheDay(dayOfWeek as Weekday);
  const workoutOfTheDay = { label: workout.label, focus: workout.focus, exercises: workout.exercises };

  const confirmedBatches = importBatches.filter((b) => b.status === 'confirmed');
  const importStatus = {
    totalConfirmed: confirmedBatches.length,
    lastImportAt: confirmedBatches[confirmedBatches.length - 1]?.confirmedAt ?? null,
  };

  const glowWeeklyTheme = getWeeklyTheme(dayOfWeek as Weekday);

  return {
    greeting: {
      label: timeState.label,
      title: timeState.title,
      message: timeState.message,
    },
    weekTheme: { title: glowWeeklyTheme.title, note: glowWeeklyTheme.focus },
    todayOverview: {
      tasksDueToday,
      eventsToday: todaysEvents.length,
      activeRoutines: routinesForNow.length,
      activeGoals: inProgressGoals.length,
    },
    dailyFocus:
      topPriorityTasks[0]
        ? {
            title: topPriorityTasks[0].title,
            note: topPriorityTasks[0].description ?? 'No extra notes yet. Keep this task first while focus is fresh.',
            priority: topPriorityTasks[0].priority,
          }
        : null,
    topPriorityTasks: topPriorityTasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
    })),
    routinesForNow: routinesForNow.map((routine) => ({
      id: routine.id,
      name: routine.name,
      description: routine.description,
      timeOfDay: routine.timeOfDay,
    })),
    todaySchedule: {
      workSlots: todaysWorkSchedule.map((schedule) => ({
        id: schedule.id,
        title: schedule.title,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        dayOfWeek: schedule.dayOfWeek,
      })),
      events: todaysEvents.map((event) => ({
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        location: event.location,
        allDay: event.allDay,
      })),
    },
    projectStatus: {
      goalsInProgress: inProgressGoals.length,
      goalsAchieved: achievedGoals.length,
      averageGoalProgress,
      activeTaskCount: activeTasks.length,
      completedTaskCount: tasks.filter((task) => task.status === 'done').length,
    },
    habitSummary,
    notesSummary,
    beautyToday,
    wellnessToday,
    googleCalendar,
    gmailInbox,
    workoutOfTheDay,
    importStatus,
  };
}
