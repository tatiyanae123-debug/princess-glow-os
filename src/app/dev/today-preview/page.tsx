import { notFound } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { TodayExperience } from '@/components/today/today-experience';
import type { TodaySceneData } from '@/lib/today/scenes';

const now = new Date();
const previewData: TodaySceneData = {
  dashboard: {
    greeting: { label: 'Today', title: 'Start with what steadies you.', message: 'Your day has room.' },
    weekTheme: { title: 'A clear week', note: 'Create meaningful progress today.' },
    todayOverview: { tasksDueToday: 6, eventsToday: 1, activeRoutines: 2, activeGoals: 2 },
    dailyFocus: null,
    topPriorityTasks: [],
    routinesForNow: [],
    todaySchedule: { workSlots: [], events: [{ id: 'preview-event', title: 'Strategy Call', startAt: new Date(now.getTime() + 60 * 60 * 1000), endAt: new Date(now.getTime() + 105 * 60 * 1000), location: 'Virtual', allDay: false }] },
    projectStatus: { goalsInProgress: 2, goalsAchieved: 1, averageGoalProgress: 58, activeTaskCount: 6, completedTaskCount: 2 },
    habitSummary: { totalHabits: 3, completedToday: 1, habits: [] },
    notesSummary: { pinnedCount: 1, recentNotes: [] },
    beautyToday: [],
    wellnessToday: { loggedToday: true, entry: { id: 'preview-wellness', mood: 'good', energy: 'medium', sleepHours: 8, waterGlasses: 3 } },
    googleCalendar: { status: 'connected', events: [] },
    gmailInbox: { status: 'not_connected', unreadCount: 0, messages: [] },
    workoutOfTheDay: { label: 'Gentle movement', focus: 'Posture and energy', exercises: [] },
    importStatus: { totalConfirmed: 0, lastImportAt: null },
  },
  tasks: [
    'Protect your energy',
    'Finish what matters',
    'Create a little space',
    'Drink water and take medication',
    'Prepare for the strategy call',
    'Reset the room gently',
  ].map((title, index) => ({ id: `preview-task-${index}`, title, status: 'pending', priority: index < 3 ? 'high' : 'medium', dueDate: now, completedAt: null })),
  review: null,
};

export default function TodayPreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <AppShell><TodayExperience view="home" data={previewData} userName="Tatiyana" /></AppShell>;
}
