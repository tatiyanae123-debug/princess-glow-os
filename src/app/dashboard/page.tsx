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
      title: 'Your Living Command Center is ready.',
      message: 'Start by adding tasks, routines, goals, wellness logs, and financial entries so your dashboard can organize the full day.',
    },
    weekTheme: {
      title: 'Foundation Week',
      note: 'Set one clear direction for this week and keep it visible.',
    },
    hero: {
      title: 'Personal Life Operating System',
      subtitle: 'The premium dashboard is active and ready to pull from your existing modules as data becomes available.',
      primaryFocus: 'Add your top priority',
      secondaryFocus: 'Connect your first event or appointment',
    },
    commandCenter: {
      todayLabel: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      weather: 'Weather sync ready for integration',
      aiInsight: 'Begin by adding a few core records so the dashboard can personalize your day automatically.',
      sleepGoal: '0/8 hrs',
      weeklyFocus: 'Foundation Week',
      completedAchievements: 0,
      overdueCount: 0,
    },
    todayOverview: {
      tasksDueToday: 0,
      eventsToday: 0,
      activeRoutines: 0,
      activeGoals: 0,
      appointmentsToday: 0,
      habitsTracked: 0,
      completedToday: 0,
    },
    dailyFocus: null,
    topPriorityTasks: [],
    routines: {
      morning: { label: 'Morning routine', completion: 0, completedSteps: 0, totalSteps: 0, pendingSteps: 0, currentStep: 'Add your first morning ritual.', routines: [] },
      midday: { label: 'Midday routine', completion: 0, completedSteps: 0, totalSteps: 0, pendingSteps: 0, currentStep: 'Add your first midday reset.', routines: [] },
      evening: { label: 'Evening routine', completion: 0, completedSteps: 0, totalSteps: 0, pendingSteps: 0, currentStep: 'Add your first evening routine.', routines: [] },
      night: { label: 'Night routine', completion: 0, completedSteps: 0, totalSteps: 0, pendingSteps: 0, currentStep: 'Add your first night routine.', routines: [] },
    },
    todaySchedule: {
      workSlots: [],
      events: [],
      appointments: [],
      timeline: [],
    },
    habits: {
      total: 0,
      completedToday: 0,
      averageCompletion: 0,
      totalXp: 0,
      summaries: [],
    },
    wellness: {
      water: 0,
      targetWater: 8,
      sleepHours: null,
      sleepGoalHours: 8,
      workout: 'Movement block not set',
      meals: ['Breakfast · 8:00 AM', 'Lunch · 1:00 PM', 'Dinner · 7:00 PM'],
      medication: ['Daily vitamins · 9:00 AM', 'Night routine supplements · 9:30 PM'],
      beautyFocus: 'Skincare ritual',
      hairFocus: 'Scalp care and protective styling',
    },
    finance: {
      income: 0,
      expenses: 0,
      savings: 0,
      subscriptions: 0,
      snapshotLabel: '$0 available after tracked expenses',
    },
    projects: {
      current: [],
      goalsInProgress: 0,
      goalsAchieved: 0,
      averageGoalProgress: 0,
      activeTaskCount: 0,
      completedTaskCount: 0,
    },
    achievements: [],
    insights: {
      overdue: [],
      upcoming: [],
      recommendation: 'Begin by adding the modules you want the dashboard to orchestrate.',
    },
    sourceData: {
      tasks: [],
      habits: [],
      routines: [],
      goals: [],
      events: [],
      appointments: [],
      wellnessEntries: [],
      beautyRoutines: [],
      financeEntries: [],
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
