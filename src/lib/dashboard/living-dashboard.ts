import type { Goal, Routine, Task, WorkSchedule, CalendarEvent } from '@/lib/types';
import { getTasksByUser } from '@/lib/data/tasks';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getGoalsByUser } from '@/lib/data/goals';
import { getWorkSchedulesByUser } from '@/lib/data/work-schedules';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

const priorityRank: Record<Task['priority'], number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const weekdayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const weeklyThemes = [
  { title: 'Momentum Week', note: 'Build steady progress with one meaningful win each day.' },
  { title: 'Clarity Week', note: 'Protect focus and simplify what matters most.' },
  { title: 'Balance Week', note: 'Keep effort sustainable and your schedule breathable.' },
  { title: 'Refinement Week', note: 'Tighten routines and improve your system gently.' },
] as const;

export type DashboardWidgetId =
  | 'today-overview'
  | 'daily-focus'
  | 'top-priority'
  | 'routine-summary'
  | 'schedule-summary'
  | 'project-status';

export const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
  'today-overview',
  'daily-focus',
  'top-priority',
  'routine-summary',
  'schedule-summary',
  'project-status',
];

export type LivingDashboardData = {
  greeting: {
    label: string;
    title: string;
    message: string;
  };
  weekTheme: {
    title: string;
    note: string;
  };
  todayOverview: {
    tasksDueToday: number;
    eventsToday: number;
    activeRoutines: number;
    activeGoals: number;
  };
  dailyFocus: {
    title: string;
    note: string;
    priority: string;
  } | null;
  topPriorityTasks: Pick<Task, 'id' | 'title' | 'description' | 'priority' | 'dueDate' | 'status'>[];
  routinesForNow: Pick<Routine, 'id' | 'name' | 'description' | 'timeOfDay'>[];
  todaySchedule: {
    workSlots: Pick<WorkSchedule, 'id' | 'title' | 'startTime' | 'endTime' | 'dayOfWeek'>[];
    events: Pick<CalendarEvent, 'id' | 'title' | 'startAt' | 'endAt' | 'location' | 'allDay'>[];
  };
  projectStatus: {
    goalsInProgress: number;
    goalsAchieved: number;
    averageGoalProgress: number;
    activeTaskCount: number;
    completedTaskCount: number;
  };
};

function formatWeekTheme(date: Date) {
  const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
  return weeklyThemes[weekNumber % weeklyThemes.length];
}

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

  const [tasks, routines, goals, workSchedules, events] = await Promise.all([
    getTasksByUser(userId),
    getRoutinesByUser(userId),
    getGoalsByUser(userId),
    getWorkSchedulesByUser(userId),
    getCalendarEventsByUser(userId),
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

  return {
    greeting: {
      label: timeState.label,
      title: timeState.title,
      message: timeState.message,
    },
    weekTheme: formatWeekTheme(now),
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
  };
}
