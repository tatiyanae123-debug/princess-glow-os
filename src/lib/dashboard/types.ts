import type { Appointment, CalendarEvent, FinanceEntry, Goal, Habit, Routine, Task, WorkSchedule, WellnessEntry, BeautyRoutine } from '@/lib/types';

export type DashboardWidgetId =
  | 'command-center'
  | 'today-flow'
  | 'routines'
  | 'calendar'
  | 'habits'
  | 'wellness'
  | 'beauty'
  | 'projects'
  | 'finance'
  | 'insights';

export const DEFAULT_WIDGET_ORDER: DashboardWidgetId[] = [
  'command-center',
  'today-flow',
  'routines',
  'calendar',
  'habits',
  'wellness',
  'beauty',
  'projects',
  'finance',
  'insights',
];

export type DashboardRoutineProgress = {
  label: string;
  completion: number;
  completedSteps: number;
  totalSteps: number;
  pendingSteps: number;
  currentStep: string | null;
  routines: Array<{
    id: Routine['id'];
    name: Routine['name'];
    description: Routine['description'];
  }>;
};

export type DashboardHabitSummary = {
  id: Habit['id'];
  name: Habit['name'];
  frequency: Habit['frequency'];
  color: Habit['color'];
  streak: number;
  completionRate: number;
  completedToday: number;
  targetCount: number;
};

export type DashboardAchievement = {
  id: string;
  label: string;
  detail: string;
  achievedAt: Date;
};

export type DashboardProjectSummary = {
  label: string;
  activeTasks: number;
  completedTasks: number;
  goalProgress: number;
};

export type DashboardCalendarItem = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date | null;
  source: 'calendar' | 'appointment' | 'work';
  detail: string;
  allDay: boolean;
};

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
  hero: {
    title: string;
    subtitle: string;
    primaryFocus: string;
    secondaryFocus: string;
  };
  commandCenter: {
    todayLabel: string;
    weather: string;
    aiInsight: string;
    sleepGoal: string;
    weeklyFocus: string;
    completedAchievements: number;
    overdueCount: number;
  };
  todayOverview: {
    tasksDueToday: number;
    eventsToday: number;
    activeRoutines: number;
    activeGoals: number;
    appointmentsToday: number;
    habitsTracked: number;
    completedToday: number;
  };
  dailyFocus: {
    title: string;
    note: string;
    priority: string;
  } | null;
  topPriorityTasks: Pick<Task, 'id' | 'title' | 'description' | 'priority' | 'dueDate' | 'status'>[];
  routines: {
    morning: DashboardRoutineProgress;
    midday: DashboardRoutineProgress;
    evening: DashboardRoutineProgress;
    night: DashboardRoutineProgress;
  };
  todaySchedule: {
    workSlots: Pick<WorkSchedule, 'id' | 'title' | 'startTime' | 'endTime' | 'dayOfWeek'>[];
    events: Pick<CalendarEvent, 'id' | 'title' | 'startAt' | 'endAt' | 'location' | 'allDay'>[];
    appointments: Pick<Appointment, 'id' | 'title' | 'startAt' | 'endAt' | 'location' | 'type'>[];
    timeline: DashboardCalendarItem[];
  };
  habits: {
    total: number;
    completedToday: number;
    averageCompletion: number;
    totalXp: number;
    summaries: DashboardHabitSummary[];
  };
  wellness: {
    water: number;
    targetWater: number;
    sleepHours: number | null;
    sleepGoalHours: number;
    workout: string;
    meals: string[];
    medication: string[];
    beautyFocus: string;
    hairFocus: string;
  };
  finance: {
    income: number;
    expenses: number;
    savings: number;
    subscriptions: number;
    snapshotLabel: string;
  };
  projects: {
    current: DashboardProjectSummary[];
    goalsInProgress: number;
    goalsAchieved: number;
    averageGoalProgress: number;
    activeTaskCount: number;
    completedTaskCount: number;
  };
  achievements: DashboardAchievement[];
  insights: {
    overdue: string[];
    upcoming: string[];
    recommendation: string;
  };
  sourceData: {
    tasks: Task[];
    habits: Habit[];
    routines: Routine[];
    goals: Goal[];
    events: CalendarEvent[];
    appointments: Appointment[];
    wellnessEntries: WellnessEntry[];
    beautyRoutines: BeautyRoutine[];
    financeEntries: FinanceEntry[];
  };
};
