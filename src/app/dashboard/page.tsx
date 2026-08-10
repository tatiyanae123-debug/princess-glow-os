import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';
import { MoodBoard } from '@/components/dashboard/mood-board';
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
    googleCalendar: { status: 'error', events: [] },
    gmailInbox: { status: 'error', unreadCount: 0, messages: [] },
    workoutOfTheDay: { label: '', focus: '', exercises: [] },
    importStatus: { totalConfirmed: 0, lastImportAt: null },
  };
}

function DashboardWithMoodBoard({ data, error }: { data: LivingDashboardData; error?: string }) {
  return (
    <div className="relative">
      <div className="mb-4 md:hidden">
        <MoodBoard />
      </div>
      <LivingDashboard data={data} error={error} />
      <div className="pointer-events-auto absolute right-[18px] top-[58px] z-20 hidden h-[300px] w-[50%] md:block xl:right-[318px] xl:w-[42%]">
        <MoodBoard />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  if (!process.env.DATABASE_URL) {
    return (
      <AppShell>
        <DashboardWithMoodBoard data={getFallbackData()} error="DATABASE_URL is not configured." />
      </AppShell>
    );
  }

  try {
    const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
    const data = await getLivingDashboardData(userId);
    return (
      <AppShell>
        <DashboardWithMoodBoard data={data} />
      </AppShell>
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return (
      <AppShell>
        <DashboardWithMoodBoard data={getFallbackData()} error={message} />
      </AppShell>
    );
  }
}
