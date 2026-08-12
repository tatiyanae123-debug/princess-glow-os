import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { ArrowUpRight, CircleDot, Flower2, Globe2, Sparkles } from 'lucide-react';

type Room = {
  title: string;
  href: string;
  description: string;
  wash: string;
  signal: (data: LivingDashboardData | null) => string;
};

const rooms: Room[] = [
  { title: 'Home', href: '/home', description: 'Your environment, resets, and household systems.', wash: '#e7eadf', signal: (data) => data ? `${data.todayOverview.tasksDueToday} task${data.todayOverview.tasksDueToday === 1 ? '' : 's'} due today` : 'Open your home systems' },
  { title: 'Mind', href: '/brain', description: 'Context, recommendations, memory, and reflection.', wash: '#ebe2ec', signal: (data) => data ? `${data.notesSummary.pinnedCount} pinned note${data.notesSummary.pinnedCount === 1 ? '' : 's'} in context` : 'Open Glow Brain' },
  { title: 'Fitness', href: '/fitness', description: 'Workouts, energy, soreness, equipment, and recovery context.', wash: '#e2e8e8', signal: (data) => data?.workoutOfTheDay.exercises.length ? `${data.workoutOfTheDay.exercises.length} exercises in today’s workout` : 'Plan your next movement' },
  { title: 'Beauty', href: '/beauty/lab', description: 'Products, routines, reactions, expiration, and repurchase decisions.', wash: '#f1dfdf', signal: (data) => data?.beautyToday.length ? `${data.beautyToday.length} beauty item${data.beautyToday.length === 1 ? '' : 's'} for today` : 'Review your beauty lab' },
  { title: 'Learning', href: '/planning', description: 'Books, reflection, planning, notes, and knowledge.', wash: '#eee5d9', signal: (data) => data ? `${data.todayOverview.activeGoals} active goal${data.todayOverview.activeGoals === 1 ? '' : 's'} shaping the plan` : 'Open your planning layers' },
  { title: 'Finance', href: '/finance/brain', description: 'Spending context, goals, savings direction, and financial planning.', wash: '#e5ebdf', signal: (data) => data ? `${data.projectStatus.averageGoalProgress}% average goal progress` : 'Open Financial Brain' },
  { title: 'Travel', href: '/timeline', description: 'Trips, memories, plans, and meaningful experiences over time.', wash: '#e7e3db', signal: (data) => data ? `${data.todayOverview.eventsToday} event${data.todayOverview.eventsToday === 1 ? '' : 's'} on today’s map` : 'Explore your timeline' },
  { title: 'Saint', href: '/tasks', description: 'Care tasks, routines, appointments, and reminders.', wash: '#eee2dc', signal: (data) => data ? `${data.projectStatus.activeTaskCount} active task${data.projectStatus.activeTaskCount === 1 ? '' : 's'} across Glow OS` : 'Review care tasks' },
  { title: 'Career', href: '/projects', description: 'Career moves, applications, deadlines, and work projects.', wash: '#e8ddd1', signal: (data) => data ? `${data.projectStatus.goalsInProgress} goal${data.projectStatus.goalsInProgress === 1 ? '' : 's'} in progress` : 'Open your project desk' },
  { title: 'Creativity', href: '/projects', description: 'Terrain Design, brands, content, and Creative Studio.', wash: '#eadbd0', signal: (data) => data ? `${data.topPriorityTasks.length} priority move${data.topPriorityTasks.length === 1 ? '' : 's'} surfaced` : 'Enter Creative Studio' },
  { title: 'Memory', href: '/memory', description: 'Facts, milestones, preferences, decisions, and private context.', wash: '#eee7d8', signal: (data) => data ? `${data.notesSummary.recentNotes.length} recent note${data.notesSummary.recentNotes.length === 1 ? '' : 's'} nearby` : 'Open your life archive' },
  { title: 'Connections', href: '/connections', description: 'Google, Apple Reminders, and your private digital bridges.', wash: '#e5e2de', signal: (data) => {
    if (!data) return 'Review connection health';
    const connected = [data.googleCalendar.status === 'connected', data.gmailInbox.status === 'connected'].filter(Boolean).length;
    return `${connected}/2 Google bridges connected`;
  } },
];

export const dynamic = 'force-dynamic';

async function getWorldData(userId: string): Promise<LivingDashboardData | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { getLivingDashboardData } = await import('@/lib/dashboard/living-dashboard');
    return await getLivingDashboardData(userId);
  } catch {
    return null;
  }
}

export default async function WorldPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const data = await getWorldData(session.user.id);
  const liveSignals = data
    ? [
        `${data.todayOverview.tasksDueToday} due today`,
        `${data.todayOverview.eventsToday} calendar event${data.todayOverview.eventsToday === 1 ? '' : 's'}`,
        `${data.habitSummary.completedToday}/${data.habitSummary.totalHabits} habits complete`,
        `${data.projectStatus.goalsInProgress} goals moving`,
      ]
    : ['Live room data will appear when your connected data is available'];

  return <AppShell><SectionPage eyebrow="Life World" title="Walk through the systems of your life" description="Every room opens a working Glow OS system. The world now reflects live signals from your real, user-scoped Glow OS data instead of acting like a static menu.">
    <div className="space-y-4">
      <section className="relative min-h-[260px] overflow-hidden rounded-[12px] border border-[#dce2d5] bg-[linear-gradient(130deg,#eff1e8,#f6ece5)] p-6">
        <Flower2 size={110} strokeWidth={.65} className="absolute -bottom-4 left-5 text-[#89977d]/25"/>
        <Globe2 size={90} strokeWidth={.65} className="absolute right-8 top-5 text-[#75816d]/16"/>
        <div className="relative ml-auto max-w-[72%] text-right">
          <p className="glow-eyebrow">My Universe</p>
          <h2 className="glow-display mt-2 text-[31px] leading-9 text-[#3f493b]">Your life is not a menu. It is a place.</h2>
          <p className="mt-3 text-[9px] leading-5 text-[#707a6b]">Move through Beauty, Finance, Home, Creativity, Memory and the rest of your systems like connected rooms. Each room keeps its own atmosphere while sharing the same life underneath.</p>
          <span className="glow-hand mt-4 inline-block text-[27px] text-[#77866f]">welcome home</span>
        </div>
      </section>

      <section className="rounded-[10px] border border-[#ded9d0] bg-[#fffdf9]/80 p-4 shadow-[0_8px_25px_rgba(65,53,45,.035)]">
        <div className="flex flex-wrap items-center gap-2 text-[8px] text-[#70655f]">
          <span className="inline-flex items-center gap-1 font-semibold uppercase tracking-[.12em] text-[#7a8a70]"><CircleDot size={10}/> Live world status</span>
          {liveSignals.map((signal) => <span key={signal} className="rounded-full border border-[#e5ded5] bg-white/70 px-2.5 py-1">{signal}</span>)}
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {rooms.map((room, index) => <Link key={room.title} href={room.href} className="group relative min-h-[190px] overflow-hidden rounded-[10px] border border-[#ded9d0] p-5 shadow-[0_8px_25px_rgba(65,53,45,.04)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(65,53,45,.08)]" style={{ background: `linear-gradient(145deg,rgba(255,252,248,.8),${room.wash})` }}>
          <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/30"><Sparkles size={13} className="text-[#8e7b71]"/></div>
          <p className="text-[7px] font-semibold uppercase tracking-[.14em] text-[#918078]">Room {String(index + 1).padStart(2, '0')}</p>
          <h2 className="glow-display mt-4 text-[21px] text-[#453a35]">{room.title}</h2>
          <p className="mt-2 max-w-[85%] text-[8px] leading-4 text-[#7c6e66]">{room.description}</p>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/55 px-2.5 py-1 text-[7px] font-medium text-[#6f7568]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8ca07f]"/>{room.signal(data)}
          </div>
          <p className="mt-3 inline-flex items-center gap-1 text-[8px] font-medium text-[#745c55]">Enter room <ArrowUpRight size={9}/></p>
        </Link>)}
      </div>
    </div>
  </SectionPage></AppShell>;
}
