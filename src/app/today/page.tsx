import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BrainCircuit, CalendarClock, CheckCircle2, Clock3, Droplets, MoonStar, Sparkles, Target, Zap } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { AdaptiveTodayPanel } from '@/components/adaptive-today-panel';
import { getTasksByUser } from '@/lib/data/tasks';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { buildCrossSystemSnapshot } from '@/lib/intelligence/cross-system';

export const dynamic = 'force-dynamic';

const priorityWeight: Record<string, number> = { urgent: 100, high: 80, medium: 55, low: 30 };

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const now = new Date();
  const [tasks, wellnessEntries, beautyRoutines, events, snapshot] = await Promise.all([
    getTasksByUser(userId), getWellnessEntriesByUser(userId), getBeautyRoutinesByUser(userId), getCalendarEventsByUser(userId), buildCrossSystemSnapshot(userId, 'today', now),
  ]);
  const open = tasks.filter((t) => t.status !== 'done' && t.status !== 'cancelled');
  const scored = [...open].sort((a, b) => {
    const aDue = a.dueDate ? Math.max(-40, 30 - Math.floor((a.dueDate.getTime() - now.getTime()) / 86400000) * 5) : 0;
    const bDue = b.dueDate ? Math.max(-40, 30 - Math.floor((b.dueDate.getTime() - now.getTime()) / 86400000) * 5) : 0;
    return (priorityWeight[b.priority] ?? 0) + bDue - ((priorityWeight[a.priority] ?? 0) + aDue);
  });
  const primary = scored[0] ?? null;
  const next = scored[1] ?? null;
  const later = scored.slice(2, 5);
  const nextEvent = events.filter((e) => e.startAt >= now).sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null;
  const availableMinutes = nextEvent ? Math.max(0, Math.floor((nextEvent.startAt.getTime() - now.getTime()) / 60000) - 15) : null;
  const latestWellness = wellnessEntries[0] ?? null;
  const beauty = beautyRoutines.filter((r) => r.timeOfDay === 'evening' || r.timeOfDay === 'night').slice(0, 3);
  const todaysEvents = events.filter((e) => e.startAt.toDateString() === now.toDateString()).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  return (
    <AppShell>
      <div className="mx-auto max-w-[1460px] space-y-5">
        <header className="rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(120deg,#FBE4E8,#FDF8F6_55%,#F1E8D9)] p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#C9727E]">TODAY · ADAPTIVE ACTION LAYER</p>
              <h1 className="glow-display mt-2 text-[36px] leading-none text-[#2B2420] sm:text-[46px]">Only show me what matters now.</h1>
              <p className="mt-3 max-w-2xl text-[13px] leading-5 text-[#8A8078]">Glow combines tasks, calendar, wellness, routines, Life Modes, personal rules and focus history so you can act without deciding where to look first.</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="rounded-[16px] border border-white/70 bg-white/70 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[.12em] text-[#8A8078]">Available block</p>
                <p className="glow-display mt-1 text-[24px] text-[#2B2420]">{availableMinutes == null ? 'Open' : `${availableMinutes} min`}</p>
                <p className="mt-1 text-[10.5px] text-[#8A8078]">{nextEvent ? `before ${nextEvent.title}` : 'no upcoming constraint'}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/tomorrow" className="rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-center text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]">Prepare Tomorrow</Link>
                <Link href="/focus" className="rounded-full bg-[#2B2420] px-3.5 py-2 text-center text-[11px] text-white">Focus Mode</Link>
              </div>
            </div>
          </div>
        </header>

        <AdaptiveTodayPanel userId={userId} />

        <section className="rounded-[18px] border border-[#F1E7E3] bg-white px-4 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Detailed day view</p><p className="mt-1 text-[11.5px] text-[#4A4440]">The adaptive layer above decides. The sections below show the evidence and supporting detail.</p></div>
            <div className="flex gap-2">
              <Link href="/rules" className="rounded-full border border-[#F1E7E3] px-3.5 py-1.5 text-[10.5px] text-[#8A8078] hover:bg-[#FDF8F6]">Personal Rules</Link>
              <Link href="/maintenance" className="rounded-full border border-[#F1E7E3] px-3.5 py-1.5 text-[10.5px] text-[#8A8078] hover:bg-[#FDF8F6]">Maintenance</Link>
              <Link href="/notices" className="rounded-full border border-[#F1E7E3] px-3.5 py-1.5 text-[10.5px] text-[#8A8078] hover:bg-[#FDF8F6]">Glow Notices</Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_.9fr]">
          <div className="space-y-4">
            <section className="overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-[#2B2420] text-white">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div className="flex items-center gap-2"><Zap size={15} className="text-[#E4C9C0]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-white/70">PRIORITY EVIDENCE</p></div><span className="text-[10.5px] text-white/45">task urgency + due-date pressure</span></div>
              <div className="p-6 sm:p-8">
                {primary ? (
                  <>
                    <p className="glow-display max-w-3xl text-[32px] leading-[1.05] sm:text-[40px]">{primary.title}</p>
                    <p className="mt-3 max-w-2xl text-[12.5px] leading-5 text-white/60">{primary.description || `Priority: ${primary.priority}. Glow ranked this above ${Math.max(0, open.length - 1)} other open item${open.length - 1 === 1 ? '' : 's'} using urgency and due-date pressure.`}</p>
                    <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-[10.5px] uppercase tracking-[.08em]">{primary.priority}</span>{primary.dueDate ? <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10.5px]">Due {primary.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span> : null}</div>
                    <div className="mt-6 flex flex-wrap gap-2"><Link href="/tasks" className="rounded-full bg-[#F3D8DA] px-4 py-2.5 text-[11.5px] font-medium text-[#44302f]">Open Task Desk</Link><Link href="/brain" className="rounded-full border border-white/20 px-4 py-2.5 text-[11.5px] text-white/80">Ask Glow why</Link></div>
                  </>
                ) : (
                  <div className="py-8 text-center"><CheckCircle2 className="mx-auto text-[#B6D3B8]" size={32} /><p className="glow-display mt-3 text-[23px]">Nothing urgent needs you.</p><p className="mt-2 text-[11.5px] text-white/55">Use the space intentionally or add something new.</p></div>
                )}
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white"><div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><Target size={13} className="text-[#C9727E]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">NEXT</p></div><div className="p-4">{next ? <><p className="glow-display text-[20px] text-[#2B2420]">{next.title}</p><p className="mt-2 text-[11.5px] text-[#8A8078]">Keep this visible, but do not let it compete with NOW.</p><Link href="/tasks" className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Open task <ArrowRight size={11} /></Link></> : <p className="text-[11.5px] text-[#8A8078]">No second priority needs attention.</p>}</div></section>
              <section className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white"><div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><CalendarClock size={13} className="text-[#7C6B9C]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">NEXT COMMITMENT</p></div><div className="p-4">{nextEvent ? <><p className="glow-display text-[20px] text-[#2B2420]">{nextEvent.title}</p><p className="mt-2 text-[11.5px] text-[#8A8078]">{nextEvent.allDay ? 'All day' : nextEvent.startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p><Link href="/calendar" className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Open calendar <ArrowRight size={11} /></Link></> : <p className="text-[11.5px] text-[#8A8078]">Your schedule is open.</p>}</div></section>
            </div>

            <section className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
              <div className="flex items-center justify-between border-b border-[#F1E7E3] px-4 py-3"><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">TODAY FLOW</p><Link href="/calendar" className="text-[11px] font-medium text-[#C9727E]">Full calendar</Link></div>
              <div className="grid gap-px bg-[#F1E7E3] sm:grid-cols-2 lg:grid-cols-3">
                {todaysEvents.length ? todaysEvents.map((event) => (
                  <div key={event.id} className="bg-white p-4"><p className="text-[10.5px] text-[#B5ACA5]">{event.allDay ? 'All day' : event.startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p><p className="glow-display mt-1 text-[15px] text-[#2B2420]">{event.title}</p><p className="mt-1 text-[10.5px] text-[#8A8078]">{event.location || event.source}</p></div>
                )) : <div className="bg-white p-5 text-[11.5px] text-[#8A8078]">No fixed calendar events today.</div>}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white"><div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><Sparkles size={13} className="text-[#C9727E]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">GLOW CONTEXT</p></div><div className="p-4"><p className="glow-display text-[18px] leading-6 text-[#2B2420]">{snapshot.message}</p><p className="mt-2 text-[11px] leading-4 text-[#8A8078]">This is generated from live cross-system context, not a decorative message.</p><Link href="/notices" className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">See actionable notices <ArrowRight size={11} /></Link></div></section>

            <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">LIFE SNAPSHOT</p><div className="mt-3 grid grid-cols-2 gap-2">{[[`${snapshot.openTasks}`, 'Open tasks'], [`${snapshot.habitPercent}%`, 'Habits'], [`${snapshot.eventsToday}`, 'Events'], [latestWellness?.energy ? String(latestWellness.energy) : '–', 'Energy']].map(([value, label]) => <div key={label} className="rounded-[12px] bg-[#FDF3F2] p-3"><p className="glow-display text-[21px] text-[#2B2420]">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[.08em] text-[#B5ACA5]">{label}</p></div>)}</div></section>

            <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-2"><Droplets size={13} className="text-[#4A6A7C]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">WELLNESS CONTEXT</p></div><div className="mt-3 grid grid-cols-3 gap-2 text-center">{[['Mood', latestWellness?.mood ? String(latestWellness.mood) : '–'], ['Energy', latestWellness?.energy ? String(latestWellness.energy) : '–'], ['Sleep', latestWellness?.sleepHours != null ? `${latestWellness.sleepHours}h` : '–']].map(([label, value]) => <div key={label} className="rounded-[12px] bg-[#FDF8F6] p-3"><p className="glow-display text-[16px] capitalize text-[#2B2420]">{value}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">{label}</p></div>)}</div><Link href="/wellness" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Update wellness <ArrowRight size={11} /></Link></section>

            <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-2"><MoonStar size={13} className="text-[#7C6B9C]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">TONIGHT</p></div><div className="mt-3 space-y-2">{beauty.length ? beauty.map((step) => <div key={step.id} className="rounded-[12px] bg-[#FDF3F2] px-3 py-2"><p className="text-[11.5px] text-[#4A4440]">{step.name}</p></div>) : <p className="text-[11.5px] text-[#8A8078]">Open Beauty or Planning to shape tonight.</p>}</div><div className="mt-3 flex gap-2"><Link href="/beauty" className="rounded-full bg-[#FBE4E8] px-3.5 py-2 text-[11px] text-[#B15A68]">Beauty</Link><Link href="/tomorrow" className="rounded-full border border-[#F1E7E3] px-3.5 py-2 text-[11px] text-[#8A8078] hover:bg-[#FDF8F6]">Prepare tomorrow</Link></div></section>

            {later.length ? (
              <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center gap-2"><Clock3 size={13} className="text-[#9A7A3D]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">LATER</p></div><div className="mt-3 space-y-2">{later.map((task) => <div key={task.id} className="flex items-center justify-between gap-3 border-b border-[#F1E7E3] pb-2 last:border-0"><p className="min-w-0 truncate text-[11.5px] text-[#4A4440]">{task.title}</p><span className="text-[10px] uppercase text-[#B5ACA5]">{task.priority}</span></div>)}</div><p className="mt-3 text-[10.5px] text-[#B5ACA5]">These stay visible without competing with your current action.</p></section>
            ) : null}

            <Link href="/brain" className="flex items-center justify-between rounded-[18px] border border-[#F1E7E3] bg-[linear-gradient(130deg,#FBE4E8,#F1E8D9)] p-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.1em] text-[#B15A68]">GLOW BRAIN</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">What should I do now?</p></div><BrainCircuit size={24} className="text-[#C9727E]" /></Link>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
