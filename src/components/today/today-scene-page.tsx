import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { AppShell } from '@/components/app-shell';
import { TodayExperience, type TodaySceneView } from '@/components/today/today-experience';
import { getTodaySceneData, type TodaySceneData } from '@/lib/today/scenes';
import { normalizeTimeZone } from '@/lib/time/zone';

const fallback: TodaySceneData = {
  dashboard: {
    greeting: { label: 'Today', title: 'Begin gently.', message: 'Your day has room. Connect your data to let Glow shape it with you.' },
    weekTheme: { title: 'A clear week', note: 'Choose what deserves your energy.' },
    todayOverview: { tasksDueToday: 0, eventsToday: 0, activeRoutines: 0, activeGoals: 0 },
    dailyFocus: null,
    topPriorityTasks: [],
    routinesForNow: [],
    todaySchedule: { workSlots: [], events: [] },
    projectStatus: { goalsInProgress: 0, goalsAchieved: 0, averageGoalProgress: 0, activeTaskCount: 0, completedTaskCount: 0 },
    habitSummary: { totalHabits: 0, completedToday: 0, habits: [] },
    notesSummary: { pinnedCount: 0, recentNotes: [] },
    beautyToday: [],
    wellnessToday: { loggedToday: false, entry: null },
    googleCalendar: { status: 'not_connected', events: [] },
    gmailInbox: { status: 'not_connected', unreadCount: 0, messages: [] },
    workoutOfTheDay: { label: '', focus: '', exercises: [] },
    importStatus: { totalConfirmed: 0, lastImportAt: null },
  },
  tasks: [],
  review: null,
};

export async function TodayScenePage({ view }: { view: TodaySceneView }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const cookieStore = await cookies();
  const timeZone = normalizeTimeZone(cookieStore.get('glow-timezone')?.value);
  const data = process.env.DATABASE_URL ? await getTodaySceneData(session.user.id, timeZone).catch(() => fallback) : fallback;
  return <AppShell><TodayExperience view={view} data={data} userName={session.user.name}/></AppShell>;
}
