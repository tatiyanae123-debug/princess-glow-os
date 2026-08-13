import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { AlertTriangle, ArrowLeft, ArrowRight, BrainCircuit, CalendarDays, CheckCircle2, Network, Sparkles, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BrainInsightsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  let context: Awaited<ReturnType<typeof buildPersonalContext>> | null = null;
  try {
    context = await buildPersonalContext(session.user.id);
  } catch (error) {
    console.error('[Glow OS] Brain insights unavailable', error);
  }

  if (!context) {
    return (
      <AppShell>
        <section className="mx-auto max-w-4xl rounded-[20px] border border-[#F1E7E3] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#2B2420]">Deep intelligence needs one connected data source that is not readable right now.</p>
          <Link href="/brain" className="mt-4 inline-block text-[12px] font-medium text-[#C9727E]">← Back to Brain</Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Link href="/brain" className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#8A8078] hover:text-[#4A4440]"><ArrowLeft size={13} />Back to Brain</Link>

        <section className="relative overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-[linear-gradient(130deg,#FBE4E8,#F1E8D9)] p-7">
          <BrainCircuit size={80} strokeWidth={0.6} className="absolute right-6 top-4 text-[#C9727E]/18" />
          <p className="glow-eyebrow">Deep intelligence</p>
          <h1 className="glow-display mt-2 max-w-3xl text-[34px] leading-[1.05] text-[#2B2420] sm:text-[38px]">Your life, interpreted clearly.</h1>
          <p className="mt-3 max-w-3xl text-[13px] leading-5 text-[#4A4440]">{context.dailyBrief}</p>
          <p className="mt-4 text-[10.5px] uppercase tracking-[.1em] text-[#8A8078]">Updated {context.generatedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} · {context.todayLabel}</p>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10.5px] text-[#8A8078]">Focus score</p><p className="glow-display mt-2 text-[28px] text-[#2B2420]">{context.focusScore}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">A snapshot, not a judgment.</p></div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10.5px] text-[#8A8078]">Unfinished tasks</p><p className="glow-display mt-2 text-[28px] text-[#2B2420]">{context.unfinishedTasks.length}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">{context.overdueTasks.length} overdue</p></div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10.5px] text-[#8A8078]">Today&apos;s events</p><p className="glow-display mt-2 text-[28px] text-[#2B2420]">{context.todaysEvents.length}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">Calendar-aware context</p></div>
          <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10.5px] text-[#8A8078]">Active goals</p><p className="glow-display mt-2 text-[28px] text-[#2B2420]">{context.activeGoals.length}</p><p className="mt-1 text-[10px] text-[#B5ACA5]">Available for next-action reasoning</p></div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-5 py-4"><Sparkles size={13} className="text-[#C9727E]" /><div><p className="glow-eyebrow">Attention queue</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Next best actions</p></div></div>
            <div className="p-3">
              {context.recommendations.length === 0 ? (
                <p className="p-5 text-[12px] text-[#8A8078]">You are clear for now.</p>
              ) : context.recommendations.map((item, index) => (
                <Link key={item.id} href={item.href} className={`block rounded-[12px] p-3 ${index === 0 ? 'bg-[#FBE4E8]' : 'hover:bg-[#FDF8F6]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="glow-display text-[14px] text-[#2B2420]">{item.title}</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">{item.reason}</p></div>
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] uppercase text-[#B15A68]">{item.priority}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[18px] bg-[#2B2420] p-5 text-white">
            <CalendarDays size={50} strokeWidth={0.8} className="absolute right-4 top-4 text-white/10" />
            <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#E4C9C0]">Next event</p>
            {context.nextEvent ? (
              <div className="mt-4">
                <p className="glow-display text-[20px]">{context.nextEvent.title}</p>
                <p className="mt-2 text-[11px] text-white/70">{context.nextEvent.allDay ? 'All day' : context.nextEvent.startAt.toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</p>
                <Link href="/calendar" className="mt-4 inline-flex items-center gap-1 text-[11px] text-[#F0DCE9]">Open Calendar <ArrowRight size={9} /></Link>
              </div>
            ) : <p className="mt-4 text-[12px] text-white/70">No upcoming event found.</p>}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-5 py-4"><AlertTriangle size={13} className="text-[#9A7A3D]" /><div><p className="glow-eyebrow">What needs attention</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Pressure signals</p></div></div>
            <div className="p-3">{context.attentionSignals.map((signal) => (
              <Link key={signal.id} href={signal.href} className="block rounded-[14px] border border-[#F1E7E3] p-3 hover:bg-[#FDF8F6]">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-[12px] font-semibold text-[#2B2420]">{signal.label}</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">{signal.detail}</p></div>
                  <span className="rounded-full bg-[#F1E8D9] px-2.5 py-1 text-[10px] uppercase text-[#9A7A3D]">{signal.level}</span>
                </div>
              </Link>
            ))}</div>
          </div>
          <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-5 py-4"><Network size={13} className="text-[#7C6B9C]" /><div><p className="glow-eyebrow">Cross-system reasoning</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">Patterns Glow Brain sees</p></div></div>
            <div className="p-3">{context.patterns.map((pattern) => (
              <Link key={pattern.id} href={pattern.href} className="block rounded-[12px] p-3 hover:bg-[#FDF8F6]">
                <div className="flex items-start gap-3"><Sparkles size={12} className="mt-1 shrink-0 text-[#7C6B9C]" /><div><p className="glow-display text-[13px] text-[#2B2420]">{pattern.title}</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">{pattern.detail}</p></div></div>
              </Link>
            ))}</div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
            <div className="border-b border-[#F1E7E3] px-5 py-4"><p className="glow-eyebrow">Habits today</p></div>
            <div className="p-3">{context.habits.length === 0 ? <p className="p-4 text-[12px] text-[#8A8078]">No habits scheduled yet.</p> : context.habits.slice(0, 8).map((habit) => (
              <div key={habit.id} className="flex items-center justify-between border-b border-[#F1E7E3] px-2 py-3 last:border-0">
                <span className="text-[12px] text-[#4A4440]">{habit.name}</span>
                <span className={`flex items-center gap-1 text-[10.5px] ${habit.completedToday ? 'text-[#5A6E52]' : 'text-[#B5ACA5]'}`}>{habit.completedToday ? <CheckCircle2 size={10} /> : null}{habit.completedToday ? 'Done' : 'Not logged'}</span>
              </div>
            ))}</div>
          </div>
          <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
            <div className="border-b border-[#F1E7E3] px-5 py-4"><p className="glow-eyebrow">Routines for today</p></div>
            <div className="p-3">{context.routinesForToday.length === 0 ? <p className="p-4 text-[12px] text-[#8A8078]">No routines scheduled yet.</p> : context.routinesForToday.slice(0, 8).map((routine) => (
              <div key={routine.id} className="border-b border-[#F1E7E3] px-2 py-3 last:border-0">
                <p className="glow-display text-[12px] text-[#2B2420]">{routine.name}</p>
                <p className="mt-1 text-[10px] capitalize text-[#B5ACA5]">{routine.timeOfDay}</p>
              </div>
            ))}</div>
          </div>
        </section>

        <section className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-2"><Target size={13} className="text-[#C9727E]" /><div><p className="glow-eyebrow">Goal context</p><p className="glow-display mt-1 text-[18px] text-[#2B2420]">What the system is aiming toward</p></div></div>
          {context.activeGoals.length === 0 ? (
            <div className="mt-4 rounded-[12px] border border-dashed border-[#F1E7E3] p-4">
              <p className="text-[12px] text-[#8A8078]">No active goals are available to guide prioritization yet.</p>
              <Link href="/goals" className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#C9727E]">Add a goal <ArrowRight size={9} /></Link>
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">{context.activeGoals.map((goal) => (
              <Link key={goal.id} href="/goals" className="rounded-full border border-[#F1E7E3] bg-[#FDF8F6] px-3.5 py-2 text-[11px] text-[#4A4440] hover:bg-[#FBE4E8]">{goal.title}</Link>
            ))}</div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
