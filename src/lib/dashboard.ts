import { CheckSquare, NotebookText, Sparkles, Wallet, type LucideIcon } from 'lucide-react';

export type TimeSegment = 'morning' | 'afternoon' | 'evening' | 'night';
export type ThemeDay = 'Focus' | 'Restore' | 'Reset';
export type DashboardWidgetId = 'focus' | 'tasks' | 'habits' | 'schedule' | 'project' | 'observations' | 'actions';

type DashboardProfile = {
  name: string;
  weeklyTheme: ThemeDay;
};

type DashboardSchedule = {
  workLabel: string;
  workTime: string;
  workoutWindow: string;
  nextEventLabel: string;
  nextEventTime: string;
};

type DashboardRoutine = {
  label: string;
  timeSegment: TimeSegment;
};

export type DashboardTask = {
  title: string;
  note: string;
  priority: 'High' | 'Medium' | 'Low';
  time: string;
};

export type DashboardHabit = {
  name: string;
  progress: number;
  streak: number;
  note: string;
};

export type DashboardEvent = {
  title: string;
  time: string;
  location: string;
};

export type DashboardQuickAction = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type DashboardProjectStatus = {
  name: string;
  progress: number;
  status: string;
  nextAction: string;
  milestone: string;
};

export type DashboardObservation = {
  title: string;
  detail: string;
};

export type DashboardMessage = {
  eyebrow: string;
  title: string;
  description: string;
  focusLabel: string;
  focusNote: string;
};

export const dashboardProfile: DashboardProfile = {
  name: 'Tatiyana',
  weeklyTheme: 'Focus',
};

export const dashboardSchedule: DashboardSchedule = {
  workLabel: 'Work',
  workTime: '1:00 PM',
  workoutWindow: 'before noon',
  nextEventLabel: 'Dermatology consult',
  nextEventTime: '2:00 PM',
};

export const dashboardRoutines: DashboardRoutine[] = [
  { label: 'Hydrate and review the day', timeSegment: 'morning' },
  { label: 'Protect the highest-focus block', timeSegment: 'morning' },
  { label: 'Move beauty care into the afternoon', timeSegment: 'afternoon' },
  { label: 'Reset the apartment before bed', timeSegment: 'evening' },
];

export const dashboardTasks: DashboardTask[] = [
  { title: 'Finish vendor comparison', note: 'Share the shortlist before lunch.', priority: 'High', time: '09:30' },
  { title: 'Prep beauty kit', note: 'Pack SPF and serum for tonight.', priority: 'Medium', time: '18:00' },
  { title: 'Review weekly budget', note: 'Check subscriptions and adjust spending.', priority: 'Low', time: '20:30' },
];

export const dashboardHabits: DashboardHabit[] = [
  { name: 'Hydration', progress: 82, streak: 14, note: 'Two more glasses to complete the day.' },
  { name: 'Movement', progress: 64, streak: 8, note: 'A 20-minute walk would feel great.' },
  { name: 'Skincare', progress: 100, streak: 21, note: 'Routine is already locked in.' },
];

export const dashboardEvents: DashboardEvent[] = [
  { title: 'Dermatology consult', time: '14:00', location: 'West Avenue Clinic' },
  { title: 'Dinner with friends', time: '19:30', location: 'Golden Hour' },
  { title: 'Creative block', time: '21:00', location: 'Studio desk' },
];

export const dashboardQuickActions: DashboardQuickAction[] = [
  { title: 'Start ritual', description: 'Begin your morning reset', icon: Sparkles },
  { title: 'Capture note', description: 'Add a fleeting idea', icon: NotebookText },
  { title: 'Review finances', description: 'Check this week’s balance', icon: Wallet },
  { title: 'Clarify priorities', description: 'Choose the next meaningful move', icon: CheckSquare },
];

export const dashboardProject: DashboardProjectStatus = {
  name: 'Glow OS foundation',
  progress: 68,
  status: 'In motion',
  nextAction: 'Consolidate the dashboard foundations before adding more modules.',
  milestone: 'Shared dashboard systems',
};

export const dashboardObservations: DashboardObservation[] = [
  {
    title: 'Workout timing looks strongest this morning',
    detail: 'Completing movement before noon keeps the weekly fitness goal on track without crowding the evening.',
  },
  {
    title: 'Beauty reset fits better after work',
    detail: 'Shift the longer routine until later so the midday schedule stays lighter and more realistic.',
  },
  {
    title: 'Finance review is low-pressure tonight',
    detail: 'A short subscription check tonight supports the weekly money theme without draining focus hours.',
  },
];

export function getTimeSegment(date: Date): TimeSegment {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return 'morning';
  }

  if (hour >= 12 && hour < 17) {
    return 'afternoon';
  }

  if (hour >= 17 && hour < 22) {
    return 'evening';
  }

  return 'night';
}

export function buildDashboardMessage(date = new Date()): DashboardMessage {
  const timeSegment = getTimeSegment(date);
  const baseName = dashboardProfile.name;

  const messages: Record<TimeSegment, DashboardMessage> = {
    morning: {
      eyebrow: 'Good morning',
      title: `${baseName}, your day is ready.`,
      description: `Today follows a ${dashboardProfile.weeklyTheme.toLowerCase()} rhythm. ${dashboardRoutines[0]?.label}. ${dashboardSchedule.workLabel} starts at ${dashboardSchedule.workTime}, so finishing your workout ${dashboardSchedule.workoutWindow} keeps the day on track.`,
      focusLabel: 'Best next move',
      focusNote: 'Complete the highest-value work before lunch, then keep the afternoon lighter.',
    },
    afternoon: {
      eyebrow: 'Good afternoon',
      title: `${baseName}, protect your momentum.`,
      description: `The morning foundation is already in place. Keep the next block focused on the most important outcome before ${dashboardSchedule.nextEventLabel.toLowerCase()} at ${dashboardSchedule.nextEventTime}.`,
      focusLabel: 'Afternoon pacing',
      focusNote: 'Finish one meaningful task, then transition into appointments and lower-energy admin.',
    },
    evening: {
      eyebrow: 'Good evening',
      title: `${baseName}, let the day soften.`,
      description: `The most demanding work is finished. Use tonight for a gentle reset, a concise money review, and preparation for tomorrow’s first focus block.`,
      focusLabel: 'Evening reset',
      focusNote: 'Close open loops, prep tomorrow, and leave space for rest.',
    },
    night: {
      eyebrow: 'Good night',
      title: `${baseName}, keep tomorrow easy to begin.`,
      description: `This is the quietest window of the day. A brief reflection and a simple setup for tomorrow are enough.`,
      focusLabel: 'Night intention',
      focusNote: 'Choose one priority for tomorrow and let the rest wait until morning.',
    },
  };

  return messages[timeSegment];
}

export function getRecommendedWidgetOrder(date = new Date()): DashboardWidgetId[] {
  const timeSegment = getTimeSegment(date);

  switch (timeSegment) {
    case 'morning':
      return ['focus', 'tasks', 'habits', 'schedule', 'project', 'observations', 'actions'];
    case 'afternoon':
      return ['focus', 'schedule', 'tasks', 'project', 'observations', 'habits', 'actions'];
    case 'evening':
      return ['focus', 'observations', 'schedule', 'tasks', 'project', 'habits', 'actions'];
    case 'night':
      return ['focus', 'observations', 'actions', 'project', 'tasks', 'schedule', 'habits'];
    default:
      return ['focus', 'tasks', 'habits', 'schedule', 'project', 'observations', 'actions'];
  }
}
