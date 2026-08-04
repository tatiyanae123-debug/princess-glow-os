import type { Routine, Task, WorkSchedule, CalendarEvent, Habit, Note, BeautyRoutine, WellnessEntry } from '@/lib/types';

export type DashboardWidgetId =
  | 'today-overview'
  | 'daily-focus'
  | 'top-priority'
  | 'routine-summary'
  | 'schedule-summary'
  | 'project-status'
  | 'habit-summary'
  | 'notes-summary'
  | 'beauty-today'
  | 'wellness-today';

export const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
  'today-overview',
  'daily-focus',
  'top-priority',
  'habit-summary',
  'routine-summary',
  'beauty-today',
  'wellness-today',
  'schedule-summary',
  'notes-summary',
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
  habitSummary: {
    totalHabits: number;
    completedToday: number;
    habits: (Pick<Habit, 'id' | 'name' | 'color' | 'targetCount'> & { completedToday: boolean })[];
  };
  notesSummary: {
    pinnedCount: number;
    recentNotes: Pick<Note, 'id' | 'title' | 'content' | 'pinned' | 'updatedAt'>[];
  };
  beautyToday: Pick<BeautyRoutine, 'id' | 'name' | 'timeOfDay' | 'products'>[];
  wellnessToday: {
    loggedToday: boolean;
    entry: Pick<WellnessEntry, 'id' | 'mood' | 'energy' | 'sleepHours' | 'waterGlasses'> | null;
  };
};
