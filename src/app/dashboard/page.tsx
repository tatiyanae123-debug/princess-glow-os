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

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  if (!process.env.DATABASE_URL) {
    return <AppShell><LivingDashboard data={getFallbackData()} error="DATABASE_URL is not configured." /></AppShell>;
  }

  try {
    const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
    const data = await getLivingDashboardData(userId);
    let insight: string | null = null;
    try {
      const { buildPersonalContext } = await import('@/lib/intelligence/context');
      const context = await buildPersonalContext(userId);
      insight = context.recommendations[0]?.reason ?? context.dailyBrief ?? null;
    } catch {
      insight = null;
    }
    return <AppShell><LivingDashboard data={data} insight={insight} userName={session.user.name?.split(' ')[0] ?? 'there'} /></AppShell>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return <AppShell><LivingDashboard data={getFallbackData()} error={message} userName={session.user.name?.split(' ')[0] ?? 'there'} /></AppShell>;
  }
}
