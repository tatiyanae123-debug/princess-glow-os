import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';
import type { LivingDashboardData } from '@/lib/dashboard/types';

export const dynamic = 'force-dynamic';

function getFallbackData(): LivingDashboardData {
  return {
    greeting: { label: 'Welcome', title: 'Your living dashboard is ready.', message: 'Anchor one priority early and keep your pace intentional.' },
    weekTheme: { title: 'Foundation Week', note: 'Set one clear direction for this week and keep it visible.' },
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
    googleCalendar: { status: 'error', events: [] },
    gmailInbox: { status: 'error', unreadCount: 0, messages: [] },
    workoutOfTheDay: { label: '', focus: '', exercises: [] },
    importStatus: { totalConfirmed: 0, lastImportAt: null },
  };
}

async function getDashboardInsight(userId: string) {
  try {
    const work = (async () => {
      const { buildPersonalContext } = await import('@/lib/intelligence/context');
      const context = await buildPersonalContext(userId);
      return context.recommendations[0]?.reason ?? context.dailyBrief ?? null;
    })();
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 75));
    return await Promise.race([work, timeout]);
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const userName = session.user.name?.split(' ')[0] ?? 'Tatiyana';
  const userImage = session.user.image ?? null;

  let dashboard: React.ReactNode;
  if (!process.env.DATABASE_URL) {
    dashboard = <LivingDashboard data={getFallbackData()} error="DATABASE_URL is not configured." userName={userName} userImage={userImage} />;
  } else {
    try {
      const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
      const [data, insight] = await Promise.all([
        getLivingDashboardData(userId),
        getDashboardInsight(userId),
      ]);
      dashboard = <LivingDashboard data={data} insight={insight} userName={userName} userImage={userImage} />;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      dashboard = <LivingDashboard data={getFallbackData()} error={message} userName={userName} userImage={userImage} />;
    }
  }

  return <AppShell>{dashboard}</AppShell>;
}
