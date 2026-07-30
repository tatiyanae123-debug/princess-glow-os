import { AppShell } from '@/components/app-shell';
import { DashboardWithCustomization } from '@/components/dashboard/dashboard-with-customization';
import type { LivingDashboardData } from '@/lib/dashboard/types';

const MOCK_USER_ID = 'placeholder-user-id';

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
  };
}

export default async function DashboardPage() {
  if (!process.env.DATABASE_URL) {
    return (
      <AppShell>
        <DashboardWithCustomization data={getFallbackData()} error="DATABASE_URL is not configured." />
      </AppShell>
    );
  }

  try {
    const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
    const data = await getLivingDashboardData(MOCK_USER_ID);
    return (
      <AppShell>
        <DashboardWithCustomization data={data} />
      </AppShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return (
      <AppShell>
        <DashboardWithCustomization data={getFallbackData()} error={message} />
      </AppShell>
    );
  }
}
