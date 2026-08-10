import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import {
  addInboxItemFormAction,
  finishDayFormAction,
  finishFocusSessionFormAction,
  setLifeModeAction,
  startFocusSessionAction,
} from '@/app/actions/adaptive-os';
import {
  getActiveFocusSession,
  getAdaptiveState,
  getLifeModes,
  getTodayReview,
} from '@/lib/intelligence/adaptive-os';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Crown,
  Inbox,
  MoonStar,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[24px] border border-stone-200/70 bg-white/70 shadow-[0_18px_55px_rgba(108,82,64,.07)] backdrop-blur-md ${className}`}>{children}</section>;
}

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  if (!process.env.DATABASE_URL) {
    return <AppShell><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">DATABASE_URL is not configured.</div></AppShell>;
  }

  const now = new Date();
  const dateKey = now.toISOString().slice(0, 10);
  const [state, modes, activeFocus, dayReview] = await Promise.all([
    getAdaptiveState(userId, now),
    getLifeModes(userId),
    getActiveFocusSession(userId),
    getTodayReview(userId, dateKey),
  ]);

  const primary = state.now.primary;
  const nextEvent = state.context.nextEvent;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-rose-700"><Crown size={18} /><p className="text-[10px] font-bold uppercase tracking-[0.22em]">Adaptive Today</p></div>
            <h1 className="mt-2 text-4xl tracking-[-0.04em] text-stone-950" style={{ fontFamily: 'var(--glow-font-display)' }}>Your day, decided for you.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Glow weighs time, urgency, energy, routines, reminders, habits, and your next commitment, then surfaces the best next move.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/brain" className="rounded-xl border border-stone-200 bg-white/70 px-4 py-2.5 text-xs text-stone-700 hover:bg-rose-50">Ask Glow</Link>
            <Link href="/inbox" className="flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-xs text-white hover:bg-rose-950"><Inbox size={14} /> Inbox {state.inboxCount ? `(${state.inboxCount})` : ''}</Link>
          </div>
        </header>

        <Surface className="overflow-hidden">
          <div className="border-b border-stone-200/70 px-5 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500">Life Mode</p></div>
          <div className="flex gap-2 overflow-x-auto p-4">
            {modes.map((mode) => {
              const action = setLifeModeAction.bind(null, mode.id);
              return <form action={action} key={mode.id}><button type="submit" className={`min-w-max rounded-full border px-4 py-2 text-xs transition ${mode.isActive ? 'border-rose-300 bg-rose-100 text-rose-900' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}>{mode.name}</button></form>;
            })}
          </div>
          <div className="border-t border-stone-100 px-5 py-3 text-xs text-stone-500">Active: <strong className="text-stone-800">{state.activeMode?.name ?? 'Normal Day'}</strong> · Max major tasks: {state.activeMode?.maxMajorTasks ?? 3}</div>
        </Surface>

        <div className="grid gap-5 xl:grid-cols-[1.55fr_.9fr]">
          <div className="space-y-5">
            <Surface className="overflow-hidden bg-[linear-gradient(135deg,rgba(252,245,239,.95),rgba(244,222,224,.82))]">
              <div className="flex items-center justify-between border-b border-white/70 px-5 py-4"><div className="flex items-center gap-2"><Zap size={16} className="text-rose-600" /><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-600">Do This Now</p></div><p className="text-[10px] text-stone-500">{state.now.availableMinutes == null ? 'Open block' : `${state.now.availableMinutes} min available`}</p></div>
              <div className="p-6 sm:p-8">
                {primary ? <>
                  <p className="max-w-2xl text-3xl leading-tight text-stone-950 sm:text-4xl" style={{ fontFamily: 'var(--glow-font-display)' }}>{primary.title}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{primary.reason}</p>
                  <div className="mt-5 flex flex-wrap gap-2 text-[10px] text-stone-600"><span className="rounded-full bg-white/70 px-3 py-1.5">~{primary.estimatedMinutes} min</span><span className="rounded-full bg-white/70 px-3 py-1.5 capitalize">{primary.energyCost} energy</span><span className="rounded-full bg-white/70 px-3 py-1.5 capitalize">{primary.source}</span></div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {activeFocus ? <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/80 p-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-800">Focus session active</p><p className="mt-1 text-sm font-medium text-stone-900">{activeFocus.title}</p><form action={finishFocusSessionFormAction.bind(null, activeFocus.id)} className="mt-3 flex gap-2"><input type="hidden" name="outcome" value="completed" /><button className="rounded-xl bg-stone-900 px-4 py-2 text-xs text-white" type="submit">Finish Focus</button></form></div> : <form action={startFocusSessionAction.bind(null, primary.source, primary.id, primary.title, primary.estimatedMinutes)}><button type="submit" className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-3 text-xs font-medium text-white hover:bg-rose-950"><Play size={14} /> Start Focus</button></form>}
                    <Link href={primary.href} className="flex items-center gap-2 rounded-xl border border-stone-300 bg-white/70 px-5 py-3 text-xs text-stone-700">Open source <ArrowRight size={13} /></Link>
                  </div>
                </> : <div className="py-8 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={34} /><p className="mt-3 text-xl text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>Nothing urgent needs you right now.</p><p className="mt-1 text-xs text-stone-500">Use the space intentionally or capture something in Glow Inbox.</p></div>}
              </div>
            </Surface>

            <div className="grid gap-5 lg:grid-cols-2">
              <Surface className="overflow-hidden"><div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4"><div className="flex items-center gap-2"><Target size={15} className="text-rose-600" /><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Next Best Options</p></div><span className="text-[10px] text-stone-400">{state.now.hiddenCount} deprioritized</span></div><div className="divide-y divide-stone-100">{state.now.alternatives.length ? state.now.alternatives.map((item) => <Link key={item.id} href={item.href} className="block px-5 py-4 transition hover:bg-stone-50"><div className="flex justify-between gap-4"><div><p className="text-sm font-medium text-stone-900">{item.title}</p><p className="mt-1 line-clamp-2 text-[10px] leading-4 text-stone-500">{item.reason}</p></div><span className="shrink-0 text-[10px] text-stone-400">{item.estimatedMinutes}m</span></div></Link>) : <p className="p-5 text-xs text-stone-500">No extra actions need attention.</p>}</div></Surface>
              <Surface className="overflow-hidden"><div className="flex items-center gap-2 border-b border-stone-200/70 px-5 py-4"><ShieldCheck size={15} className="text-emerald-700" /><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Protected Today</p></div><div className="space-y-3 p-5">{state.now.protected.map((item) => <div key={item} className="flex items-center gap-3"><CheckCircle2 size={15} className="text-emerald-600" /><p className="text-sm text-stone-700">{item}</p></div>)}</div></Surface>
            </div>

            <Surface className="overflow-hidden"><div className="flex items-center justify-between border-b border-stone-200/70 px-5 py-4"><div className="flex items-center gap-2"><BrainCircuit size={15} className="text-violet-600" /><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">System Health</p></div><span className="text-[10px] text-stone-400">Only attention-worthy areas rise</span></div><div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">{state.systemHealth.map((item) => <div key={item.domain} className={`rounded-2xl border p-4 ${item.status === 'behind' ? 'border-rose-200 bg-rose-50' : item.status === 'attention' ? 'border-amber-200 bg-amber-50' : 'border-emerald-100 bg-emerald-50/60'}`}><p className="text-[10px] font-bold uppercase tracking-[.14em] text-stone-500">{item.domain}</p><p className="mt-2 text-sm font-medium capitalize text-stone-900">{item.status}</p><p className="mt-1 text-[10px] leading-4 text-stone-500">{item.reason}</p></div>)}</div></Surface>
          </div>

          <aside className="space-y-5">
            <Surface className="overflow-hidden"><div className="flex items-center gap-2 border-b border-stone-200/70 px-5 py-4"><Clock3 size={15} className="text-rose-600" /><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Next Commitment</p></div><div className="p-5">{nextEvent ? <><p className="text-xl text-stone-900" style={{ fontFamily: 'var(--glow-font-display)' }}>{nextEvent.title}</p><p className="mt-2 text-sm text-stone-500">{nextEvent.allDay ? 'All day' : nextEvent.startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p><Link href="/calendar" className="mt-4 inline-flex items-center gap-2 text-xs text-rose-700">Open calendar <ArrowRight size={12} /></Link></> : <p className="text-xs text-stone-500">No upcoming commitment is constraining your block.</p>}</div></Surface>
            <Surface className="overflow-hidden"><div className="flex items-center gap-2 border-b border-stone-200/70 px-5 py-4"><Sparkles size={15} className="text-amber-700" /><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Coming Soon</p></div><div className="divide-y divide-stone-100">{state.maintenance.length ? state.maintenance.map((item) => <div key={item.id} className="px-5 py-4"><div className="flex justify-between gap-3"><p className="text-sm font-medium text-stone-800">{item.title}</p><span className="text-[9px] uppercase text-stone-400">{item.domain}</span></div>{item.recommendation ? <p className="mt-1 text-[10px] leading-4 text-stone-500">{item.recommendation}</p> : null}</div>) : <p className="p-5 text-xs text-stone-500">No maintenance forecast needs attention yet.</p>}</div></Surface>
            <Surface className="overflow-hidden"><div className="flex items-center gap-2 border-b border-stone-200/70 px-5 py-4"><Inbox size={15} className="text-rose-600" /><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Quick Capture</p></div><form action={addInboxItemFormAction} className="p-4"><textarea name="rawText" rows={3} placeholder="Call dentist, buy retinol, research prototype vendors..." className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50/70 p-3 text-sm outline-none focus:border-rose-300" /><button type="submit" className="mt-3 w-full rounded-xl bg-stone-900 py-2.5 text-xs text-white">Send to Glow Inbox</button></form></Surface>
            <Surface className="overflow-hidden"><div className="flex items-center gap-2 border-b border-stone-200/70 px-5 py-4"><MoonStar size={15} className="text-violet-600" /><p className="text-[10px] font-bold uppercase tracking-[.18em] text-stone-600">Finish My Day</p></div><form action={finishDayFormAction} className="space-y-3 p-4"><div className="grid grid-cols-2 gap-2"><input name="energy" type="number" min={1} max={10} defaultValue={dayReview?.energy ?? undefined} placeholder="Energy 1–10" className="rounded-xl border border-stone-200 px-3 py-2 text-xs" /><input name="mood" defaultValue={dayReview?.mood ?? ''} placeholder="Mood" className="rounded-xl border border-stone-200 px-3 py-2 text-xs" /></div><textarea name="completedSummary" defaultValue={dayReview?.completedSummary ?? ''} rows={2} placeholder="What got done?" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs" /><textarea name="movedSummary" defaultValue={dayReview?.movedSummary ?? ''} rows={2} placeholder="What should move?" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs" /><textarea name="memoryNote" defaultValue={dayReview?.memoryNote ?? ''} rows={2} placeholder="Anything worth remembering?" className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs" /><p className="text-[9px] font-bold uppercase tracking-[.14em] text-stone-400">Tomorrow top three</p>{[0,1,2].map((index) => <input key={index} name={`tomorrow${index + 1}`} defaultValue={dayReview?.tomorrowTopThree?.[index] ?? ''} placeholder={`${index + 1}.`} className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs" />)}<button type="submit" className="w-full rounded-xl bg-violet-950 py-2.5 text-xs text-white">Save Day + Prepare Tomorrow</button></form></Surface>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
