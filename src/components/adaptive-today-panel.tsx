import Link from 'next/link';
import { ArrowRight, BrainCircuit, CheckCircle2, Clock3, Inbox, MoonStar, Play, ShieldCheck, Target, Zap } from 'lucide-react';
import { addInboxItemFormAction, finishDayFormAction, finishFocusSessionFormAction, setLifeModeAction, startFocusSessionAction } from '@/app/actions/adaptive-os';
import { getActiveFocusSession, getAdaptiveState, getLifeModes, getTodayReview } from '@/lib/intelligence/adaptive-os';

function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[18px] border border-[#F1E7E3] bg-white ${className}`}>{children}</section>;
}

const fieldClass = 'rounded-lg border border-[#F1E7E3] px-3 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] outline-none focus:border-[#C9727E]';

export async function AdaptiveTodayPanel({ userId }: { userId: string }) {
  let state; let modes; let activeFocus; let dayReview;
  try {
    const dateKey = new Date().toISOString().slice(0, 10);
    [state, modes, activeFocus, dayReview] = await Promise.all([getAdaptiveState(userId), getLifeModes(userId), getActiveFocusSession(userId), getTodayReview(userId, dateKey)]);
  } catch {
    return (
      <Surface className="border-[#F1E8D9] bg-[#FDF6F1] p-5">
        <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#9A7A3D]">Adaptive Intelligence</p>
        <p className="mt-2 text-[13px] text-[#2B2420]">The intelligence database layer still needs activation.</p>
        <Link href="/settings/intelligence" className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#9A7A3D]">Activate it <ArrowRight size={12} /></Link>
      </Surface>
    );
  }
  const primary = state.now.primary;
  const nextEvent = state.context.nextEvent;

  return (
    <div className="space-y-4">
      <Surface className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-3">
          <p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#8A8078]">Life Mode</p>
          <Link href="/settings/intelligence" className="text-[10.5px] text-[#C9727E]">Intelligence settings</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto p-4">
          {modes.map((mode) => (
            <form action={setLifeModeAction.bind(null, mode.id)} key={mode.id}>
              <button type="submit" className={`min-w-max rounded-full border px-4 py-2 text-[11.5px] font-medium transition ${mode.isActive ? 'border-[#C9727E] bg-[#FBE4E8] text-[#B15A68]' : 'border-[#F1E7E3] bg-white text-[#8A8078] hover:bg-[#FDF8F6]'}`}>{mode.name}</button>
            </form>
          ))}
        </div>
      </Surface>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_.9fr]">
        <div className="space-y-4">
          <Surface className="overflow-hidden bg-[linear-gradient(135deg,#FDF8F6,#FBE4E8)]">
            <div className="flex items-center justify-between border-b border-white/70 px-5 py-4">
              <div className="flex items-center gap-2"><Zap size={15} className="text-[#C9727E]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#4A4440]">Do This Now</p></div>
              <p className="text-[11px] text-[#8A8078]">{state.now.availableMinutes == null ? 'Open block' : `${state.now.availableMinutes} min available`}</p>
            </div>
            <div className="p-6">
              {primary ? (
                <>
                  <h2 className="glow-display text-[28px] leading-tight text-[#2B2420]">{primary.title}</h2>
                  <p className="mt-2 max-w-2xl text-[12.5px] leading-5 text-[#4A4440]">{primary.reason}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10.5px] text-[#8A8078]">
                    <span className="rounded-full bg-white/80 px-3 py-1.5">~{primary.estimatedMinutes} min</span>
                    <span className="rounded-full bg-white/80 px-3 py-1.5 capitalize">{primary.energyCost} energy</span>
                    <span className="rounded-full bg-white/80 px-3 py-1.5 capitalize">{primary.source}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {activeFocus ? (
                      <form action={finishFocusSessionFormAction.bind(null, activeFocus.id)}>
                        <input type="hidden" name="outcome" value="completed" />
                        <button className="rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] font-medium text-white">Finish Focus: {activeFocus.title}</button>
                      </form>
                    ) : (
                      <form action={startFocusSessionAction.bind(null, primary.source, primary.id, primary.title, primary.estimatedMinutes)}>
                        <button className="flex items-center gap-2 rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] font-medium text-white"><Play size={12} />Start Focus</button>
                      </form>
                    )}
                    <Link href={primary.href} className="flex items-center gap-2 rounded-full border border-[#F1E7E3] bg-white px-4 py-2.5 text-[12px] text-[#4A4440] hover:bg-[#FDF8F6]">Open source <ArrowRight size={11} /></Link>
                  </div>
                </>
              ) : (
                <div className="py-5 text-center"><CheckCircle2 className="mx-auto text-[#5A6E52]" size={28} /><p className="glow-display mt-2 text-[20px] text-[#2B2420]">Nothing urgent needs you right now.</p></div>
              )}
            </div>
          </Surface>

          <div className="grid gap-4 md:grid-cols-2">
            <Surface>
              <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><Target size={13} className="text-[#C9727E]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Next Best Options</p></div>
              <div className="divide-y divide-[#F1E7E3]">
                {state.now.alternatives.length ? state.now.alternatives.map((item) => (
                  <Link key={item.id} href={item.href} className="block px-4 py-3 hover:bg-[#FDF8F6]">
                    <div className="flex justify-between gap-4"><div><p className="text-[12.5px] font-medium text-[#2B2420]">{item.title}</p><p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#8A8078]">{item.reason}</p></div><span className="text-[10.5px] text-[#B5ACA5]">{item.estimatedMinutes}m</span></div>
                  </Link>
                )) : <p className="p-4 text-[12px] text-[#8A8078]">No extra actions need attention.</p>}
              </div>
            </Surface>
            <Surface>
              <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><ShieldCheck size={13} className="text-[#5A6E52]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Protected Today</p></div>
              <div className="space-y-2 p-4">{state.now.protected.map((item) => <div key={item} className="flex items-center gap-2"><CheckCircle2 size={12} className="text-[#5A6E52]" /><p className="text-[12px] text-[#4A4440]">{item}</p></div>)}</div>
            </Surface>
          </div>

          <Surface>
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><BrainCircuit size={13} className="text-[#7C6B9C]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">System Health</p></div>
            <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-5">
              {state.systemHealth.map((item) => (
                <div key={item.domain} className={`rounded-[12px] border p-3 ${item.status === 'behind' ? 'border-[#F1E0D9] bg-[#FDF3F2]' : item.status === 'attention' ? 'border-[#F1E8D9] bg-[#FDF6F1]' : 'border-[#E4EBDD] bg-[#F3F6F0]'}`}>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[.08em] text-[#8A8078]">{item.domain}</p>
                  <p className="mt-1 text-[12.5px] font-medium capitalize text-[#2B2420]">{item.status}</p>
                  <p className="mt-1 text-[10px] leading-3.5 text-[#8A8078]">{item.reason}</p>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <aside className="space-y-4">
          <Surface>
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><Clock3 size={13} className="text-[#C9727E]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Next Commitment</p></div>
            <div className="p-4">
              {nextEvent ? (
                <>
                  <p className="glow-display text-[18px] text-[#2B2420]">{nextEvent.title}</p>
                  <p className="mt-1 text-[11.5px] text-[#8A8078]">{nextEvent.allDay ? 'All day' : nextEvent.startAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  <Link href="/calendar" className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-[#C9727E]">Open calendar <ArrowRight size={10} /></Link>
                </>
              ) : <p className="text-[12px] text-[#8A8078]">No upcoming commitment is constraining your block.</p>}
            </div>
          </Surface>
          <Surface>
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><Inbox size={13} className="text-[#C9727E]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Quick Capture</p></div>
            <form action={addInboxItemFormAction} className="p-4">
              <textarea name="rawText" rows={3} placeholder="Call dentist, buy retinol, research prototype vendors..." className={`w-full resize-none bg-[#FDF8F6] ${fieldClass}`} />
              <button type="submit" className="mt-2 w-full rounded-full bg-[#2B2420] py-2.5 text-[11.5px] font-medium text-white">Send to Glow Inbox</button>
            </form>
          </Surface>
          <Surface>
            <div className="flex items-center gap-2 border-b border-[#F1E7E3] px-4 py-3"><MoonStar size={13} className="text-[#7C6B9C]" /><p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-[#8A8078]">Finish My Day</p></div>
            <form action={finishDayFormAction} className="space-y-2 p-4">
              <div className="grid grid-cols-2 gap-2">
                <input name="energy" type="number" min={1} max={10} defaultValue={dayReview?.energy ?? undefined} placeholder="Energy 1–10" className={fieldClass} />
                <input name="mood" defaultValue={dayReview?.mood ?? ''} placeholder="Mood" className={fieldClass} />
              </div>
              <textarea name="completedSummary" defaultValue={dayReview?.completedSummary ?? ''} rows={2} placeholder="What got done?" className={`w-full ${fieldClass}`} />
              <textarea name="movedSummary" defaultValue={dayReview?.movedSummary ?? ''} rows={2} placeholder="What should move?" className={`w-full ${fieldClass}`} />
              <textarea name="memoryNote" defaultValue={dayReview?.memoryNote ?? ''} rows={2} placeholder="Anything worth remembering?" className={`w-full ${fieldClass}`} />
              {[0, 1, 2].map((index) => <input key={index} name={`tomorrow${index + 1}`} defaultValue={dayReview?.tomorrowTopThree?.[index] ?? ''} placeholder={`Tomorrow ${index + 1}`} className={`w-full ${fieldClass}`} />)}
              <button type="submit" className="w-full rounded-full bg-[#7C6B9C] py-2.5 text-[11.5px] font-medium text-white hover:bg-[#655682]">Save Day + Prepare Tomorrow</button>
            </form>
          </Surface>
        </aside>
      </div>
    </div>
  );
}
