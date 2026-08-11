import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { and, desc, eq } from 'drizzle-orm';
import { AppShell } from '@/components/app-shell';
import { LivingDashboard } from '@/components/dashboard/living-dashboard';
import { DashboardLifeDock, type DashboardReminder } from '@/components/dashboard/dashboard-life-dock';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { db } from '@/db';
import { glowInboxItems } from '@/db/schema/adaptive-os';
import { getAppleRemindersByUser } from '@/lib/apple-reminders/service';
import { understandAppleReminder } from '@/lib/apple-reminders/intelligence';

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

async function getReminderPreview(userId:string):Promise<DashboardReminder[]>{
  const results:DashboardReminder[]=[];
  try{
    const apple=(await getAppleRemindersByUser(userId)).filter(row=>!row.completed);
    const ranked=apple.map(row=>({row,intelligence:understandAppleReminder({title:row.title,notes:row.notes,dueAt:row.dueAt,completed:row.completed})})).sort((a,b)=>{
      const score=(value:string)=>value==='overdue'?0:value==='today'?1:value==='upcoming'?2:3;
      return score(a.intelligence.urgency)-score(b.intelligence.urgency);
    }).slice(0,4);
    results.push(...ranked.map(({row,intelligence})=>({id:row.id,title:row.title,rawText:`${intelligence.urgency==='unscheduled'?'No date':row.dueAt?.toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})??'No date'} · ${intelligence.domain}`,href:'/reminders',source:'Apple'})));
  }catch{}
  try{
    const rows=await db.select({id:glowInboxItems.id,title:glowInboxItems.suggestedTitle,rawText:glowInboxItems.rawText}).from(glowInboxItems).where(and(eq(glowInboxItems.userId,userId),eq(glowInboxItems.suggestedType,'reminder'),eq(glowInboxItems.status,'unprocessed'))).orderBy(desc(glowInboxItems.createdAt)).limit(Math.max(1,5-results.length));
    results.push(...rows.map(row=>({id:row.id,title:row.title||'Reminder',rawText:row.rawText,href:'/inbox',source:'Glow'})));
  }catch{}
  return results.slice(0,5);
}

function DashboardExperience({data,error,reminders}:{data:LivingDashboardData;error?:string;reminders:DashboardReminder[]}){
  return <><LivingDashboard data={data} error={error}/><DashboardLifeDock data={data} reminders={reminders}/></>;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const reminders=await getReminderPreview(userId);

  if (!process.env.DATABASE_URL) {
    const data=getFallbackData();
    return <AppShell><DashboardExperience data={data} error="DATABASE_URL is not configured." reminders={reminders}/></AppShell>;
  }

  try {
    const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
    const data = await getLivingDashboardData(userId);
    return <AppShell><DashboardExperience data={data} reminders={reminders}/></AppShell>;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const data=getFallbackData();
    return <AppShell><DashboardExperience data={data} error={message} reminders={reminders}/></AppShell>;
  }
}
