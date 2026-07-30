import type { Routine, Task, WorkSchedule, CalendarEvent } from '@/lib/types';

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
