import { AppShell } from '@/components/app-shell';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';
import { getLivingDashboardData } from '@/lib/dashboard/living-dashboard';
import type { LivingDashboardData } from '@/lib/dashboard/living-dashboard';

const MOCK_USER_ID = 'placeholder-user-id';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    const data = await getLivingDashboardData(MOCK_USER_ID);
    return (
      <AppShell>
        <LivingDashboard data={data} />
      </AppShell>
    );
  } catch (error) {
    const fallbackData: LivingDashboardData = {
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

    const message = error instanceof Error ? error.message : 'Unknown error';

    return (
      <AppShell>
        <LivingDashboard data={fallbackData} error={message} />
      </AppShell>
    );
  }
}
