import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { and, desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';
import { MoodBoard } from '@/components/dashboard/mood-board';
import { DashboardLifeSignals } from '@/components/dashboard/dashboard-life-signals';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { db } from '@/db';
import { glowInboxItems } from '@/db/schema/adaptive-os';

export const dynamic = 'force-dynamic';

function getFallbackData(): LivingDashboardData {
  return {
    greeting: { label: 'Welcome', title: 'Your living dashboard is ready.', message: 'Start by adding tasks, routines, and goals to shape your day with clarity.' },
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

type ReminderPreview={id:string;title:string;rawText:string};

function DashboardWithMoodBoard({ data, error, reminders }: { data: LivingDashboardData; error?: string; reminders:ReminderPreview[] }) {
  return (
    <div className="relative space-y-4">
      <DashboardLifeSignals reminders={reminders}/>
      <div className="mb-4 md:hidden"><MoodBoard /></div>
      <LivingDashboard data={data} error={error} />
      <div className="pointer-events-auto absolute right-[18px] top-[220px] z-20 hidden h-[300px] w-[50%] md:block xl:right-[318px] xl:w-[42%]">
        <MoodBoard />
      </div>
    </div>
  );
}

async function reminderPreview(userId:string):Promise<ReminderPreview[]>{
  try{
    const rows=await db.select({id:glowInboxItems.id,title:glowInboxItems.suggestedTitle,rawText:glowInboxItems.rawText}).from(glowInboxItems).where(and(eq(glowInboxItems.userId,userId),eq(glowInboxItems.suggestedType,'reminder'),eq(glowInboxItems.status,'unprocessed'))).orderBy(desc(glowInboxItems.createdAt)).limit(5);
    return rows.map(row=>({id:row.id,title:row.title||'Reminder',rawText:row.rawText}));
  }catch{return[];}
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const reminders=await reminderPreview(userId);

  if (!process.env.DATABASE_URL) {
    return <AppShell><DashboardWithMoodBoard data={getFallbackData()} error="DATABASE_URL is not configured." reminders={reminders}/></AppShell>;
  }

  try {
    const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
    const data = await getLivingDashboardData(userId);
    return <AppShell><DashboardWithMoodBoard data={data} reminders={reminders}/></AppShell>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return <AppShell><DashboardWithMoodBoard data={getFallbackData()} error={message} reminders={reminders}/></AppShell>;
  }
}
