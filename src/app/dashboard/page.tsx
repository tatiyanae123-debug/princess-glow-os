import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';
import type { LivingDashboardData } from '@/lib/dashboard/types';

export const dynamic = 'force-dynamic';

function getFallbackData(): LivingDashboardData {
  return {
    greeting: {
      label: 'Welcome',
      title: 'Your living dashboard is ready.',
      message: 'Start by adding tasks, routines, and goals to shape your day with clarity.',
    },
    weekTheme: {
      title: 'Foundation Week',
      note: 'Set one clear direction for this week and keep it visible.',
    },
    todayOverview: {
      tasksDueToday: 0,
      eventsToday: 0,
      activeRoutines: 0,
      activeGoals: 0,
    },
    dailyFocus: null,
    topPriorityTasks: [],
    routinesForNow: [],
    todaySchedule: {
      workSlots: [],
      events: [],
    },
    projectStatus: {
      goalsInProgress: 0,
      goalsAchieved: 0,
      averageGoalProgress: 0,
      activeTaskCount: 0,
      completedTaskCount: 0,
    },
    habitSummary: {
      totalHabits: 0,
      completedToday: 0,
      habits: [],
    },
    notesSummary: {
      pinnedCount: 0,
      recentNotes: [],
    },
    beautyToday: [],
    wellnessToday: {
      loggedToday: false,
      entry: null,
    },
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  if (!process.env.DATABASE_URL) {
    return (
      <AppShell>
        <LivingDashboard data={getFallbackData()} error="DATABASE_URL is not configured." />
      </AppShell>
    );
  }

  try {
    const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
    const data = await getLivingDashboardData(userId);
    return (
      <AppShell>
        <LivingDashboard data={data} />
      </AppShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return (
      <AppShell>
        <LivingDashboard data={getFallbackData()} error={message} />
      </AppShell>
    );
  }
}
