import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';
import { DashboardLifeDock } from '@/components/dashboard/dashboard-life-dock';
import type { LivingDashboardData } from '@/lib/dashboard/types';

export const dynamic = 'force-dynamic';

function getFallbackData(): LivingDashboardData {
  return {
    greeting: {
      label: 'Welcome',
      title: 'Your living dashboard is ready.',
      message: 'Anchor one priority early and keep your pace intentional.',
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
    googleCalendar: { status: 'error', events: [] },
    gmailInbox: { status: 'error', unreadCount: 0, messages: [] },
    workoutOfTheDay: { label: '', focus: '', exercises: [] },
    importStatus: { totalConfirmed: 0, lastImportAt: null },
  };
}

function DashboardExperience({data,error}:{data:LivingDashboardData;error?:string}){
  return <><LivingDashboard data={data} error={error}/><DashboardLifeDock data={data}/></>;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  if (!process.env.DATABASE_URL) {
    const data=getFallbackData();
    return (
      <AppShell>
        <DashboardExperience data={data} error="DATABASE_URL is not configured." />
      </AppShell>
    );
  }

  try {
    const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
    const data = await getLivingDashboardData(userId);
    return (
      <AppShell>
        <DashboardExperience data={data} />
      </AppShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const data=getFallbackData();
    return (
      <AppShell>
        <DashboardExperience data={data} error={message} />
      </AppShell>
    );
  }
}
