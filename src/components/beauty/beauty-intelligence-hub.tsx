'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Clock3,
  FlaskConical,
  Heart,
  Mic,
  Package,
  Play,
  Search,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { BeautyOperatingStudio } from '@/components/beauty/beauty-operating-studio';
import type { BeautyRoutine } from '@/lib/types';

type Mode = 'Today' | 'Get Ready' | 'Library' | 'Progress' | 'Beauty Lab';
type BeautyProduct = {
  id: string;
  name: string;
  category: string;
  openedAt: Date | null;
  expiresAt: Date | null;
  routinePosition: string | null;
  reaction: string | null;
  repurchase: string | null;
  usageFrequency: string | null;
  photoUrl: string | null;
};
type EventLite = { id: string; title: string; startAt: Date; location: string | null };
type RitualRun = {
  id: string;
  ritualKey: string;
  title: string;
  mode: string;
  status: string;
  queueRoutineIds: string[];
  completedRoutineIds: string[];
  skippedRoutineIds: string[];
  currentIndex: number;
  actualSeconds: number;
  context: Record<string, unknown>;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt: Date | null;
};
type StepLog = { id: string; runId: string; routineId: string | null; stepName: string; status: string; actualSeconds: number; completedAt: Date };
type TreatmentLog = { id: string; treatmentKey: string; treatmentName: string; area: string; productId: string | null; response: string | null; notes: string | null; occurredAt: Date };
type MaintenanceItem = { id: string; title: string; category: string; cadenceDays: number | null; nextDueAt: Date | null; lastCompletedAt: Date | null; notes: string | null; source: string; archived: boolean };
type Observation = { id: string; kind: string; subject: string; confidence: string; body: string; evidence: Record<string, unknown>; status: string; createdAt: Date };
type Intelligence = {
  activeRuns: RitualRun[];
  recentRuns: RitualRun[];
  stepLogs: StepLog[];
  treatmentLogs: TreatmentLog[];
  maintenance: MaintenanceItem[];
  observations: Observation[];
};
type Props = {
  routines: BeautyRoutine[];
  products: BeautyProduct[];
  upcomingAppointments: EventLite[];
  intelligence: Intelligence;
};

const rooms = [
  ['Skincare', 'Prep, treatment and skin progress', '/skincare'],
  ['Makeup', 'Looks, vanity mode and makeup memory', '/makeup'],
  ['Hair', 'Daily styling, wash days and scalp care', '/hair'],
  ['Gua Sha', 'Guided sculpting and massage', '/beauty/gua-sha'],
  ['Body', 'Moisture, exfoliation and body care', '/beauty/body'],
  ['Nails', 'Manicures, colors and maintenance', '/beauty/nails'],
  ['Fragrance', 'Day, night and signature scents', '/beauty/fragrance'],
  ['Beauty Lab', 'Experiments, comparisons and discoveries', '/beauty/lab'],
] as const;

const readySteps = [
  ['Shower', '10 min'],
  ['Skin prep', '10 min'],
  ['Hair', '20 min'],
  ['Makeup', '22 min'],
  ['Dress', '8 min'],
  ['Jewelry + fragrance', '5 min'],
  ['Bag + final check', '5 min'],
] as const;

function timeLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function dateLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(value);
}

export function BeautyIntelligenceHub({ routines, products, upcomingAppointments, intelligence }: Props) {
  const [mode, setMode] = useState<Mode>('Today');
  const [readyIndex, setReadyIndex] = useState(0);
  const [lateMinutes, setLateMinutes] = useState(0);
  const [query, setQuery] = useState('');
  const [searchAnswer, setSearchAnswer] = useState('');

  const now = new Date();
  const nextEvent = upcomingAppointments[0] ?? null;
  const completed = intelligence.recentRuns.filter((run) => run.status === 'completed');
  const due = intelligence.maintenance.filter(
    (item) => !item.archived && (!item.nextDueAt || new Date(item.nextDueAt).getTime() <= now.getTime() + 7 * 86_400_000),
  );
  const expiring = products.filter(
    (product) => product.expiresAt && new Date(product.expiresAt).getTime() <= now.getTime() + 45 * 86_400_000,
  );
  const recentNotes = intelligence.observations.filter((item) => item.status !== 'dismissed').slice(0, 4);
  const favoriteLook = useMemo(
    () =>
      intelligence.observations.find((item) => /makeup|blush|foundation|lip/i.test(`${item.subject} ${item.body}`))?.body ??
      'Soft Romantic is ready to become your first fully learned recipe.',
    [intelligence.observations],
  );
  const leaveTarget = nextEvent ? new Date(new Date(nextEvent.startAt).getTime() - 15 * 60_000) : null;
  const readyStart = leaveTarget ? new Date(leaveTarget.getTime() - 80 * 60_000) : null;
  const progress = Math.round((readyIndex / readySteps.length) * 100);

  function openGlow(prompt?: string) {
    if (prompt) {
      window.dispatchEvent(new CustomEvent('glow:beauty-context', { detail: { prompt } }));
    }
    document.dispatchEvent(new CustomEvent('glow:open-conversation'));
  }

  function searchBeauty() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    let answer = 'I opened Glow so you can ask this across your complete Beauty memory.';

    if (lower.includes('replace') || lower.includes('empty')) {
      answer = `${expiring.length + due.length} Beauty items currently need attention.`;
    } else if (lower.includes('makeup') || lower.includes('blush') || lower.includes('lip')) {
      answer = favoriteLook;
    } else if (lower.includes('tonight') || lower.includes('today')) {
      answer = nextEvent
        ? `Your next Beauty-relevant plan is ${nextEvent.title} at ${timeLabel(nextEvent.startAt)}. Start Get Ready mode for the guided sequence.`
        : 'No Beauty appointment is on your near-term calendar, so Glow can build a routine around your available time.';
    }

    setSearchAnswer(answer);
  }

  return (
    <div className="mx-auto max-w-[1480px] space-y-5 pb-28">
      <section className="overflow-hidden rounded-[32px] border border-[#eadfd9] bg-[radial-gradient(circle_at_12%_8%,rgba(255,229,236,.94),transparent_35%),radial-gradient(circle_at_88%_0%,rgba(240,230,249,.86),transparent_36%),linear-gradient(135deg,#fffdfb,#f7f1ed)] px-5 py-6 shadow-[0_28px_90px_rgba(68,42,35,.08)] sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[9px] uppercase tracking-[.24em] text-[#b97789]">Beauty · Today</p>
            <h1 className="mt-2 font-serif text-[38px] leading-none text-[#2d2826] sm:text-[50px]">Beauty Intelligence</h1>
            <p className="mt-3 max-w-2xl text-[12px] leading-6 text-[#7d716c]">
              Decide → prepare → do → learn → remember. One connected beauty system for skincare, hair, makeup, body care and getting ready.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openGlow('Glow, I need to get ready. Build the best Beauty plan from my calendar, available time, routines and current context.')}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2f2927] px-5 py-3 text-[12px] text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d9a8b4]"
          >
            <Mic size={15} aria-hidden="true" />Talk to Glow
          </button>
        </div>
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {(['Today', 'Get Ready', 'Library', 'Progress', 'Beauty Lab'] as Mode[]).map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setMode(item)}
              aria-pressed={mode === item}
              className={`min-h-10 shrink-0 rounded-full px-4 text-[11px] transition ${mode === item ? 'bg-[#2f2927] text-white' : 'border border-[#eadfdb] bg-white/75 text-[#756a65]'}`}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {mode === 'Today' && (
        <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-7">
            <p className="text-[9px] uppercase tracking-[.2em] text-[#b77b8a]">Tonight&apos;s Beauty Plan</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-3xl text-[#302a27]">{nextEvent ? nextEvent.title : 'Your evening glow'}</h2>
                <p className="mt-2 text-[12px] text-[#817672]">{dateLabel(now)}{nextEvent ? ` · ${timeLabel(nextEvent.startAt)}` : ''}</p>
              </div>
              <button type="button" onClick={() => setMode('Get Ready')} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#c47c8d] px-5 py-3 text-[12px] text-white">
                <Play size={14} aria-hidden="true" />Start getting ready
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Skincare', 'Hydrating prep', '/skincare'],
                ['Hair', 'Soft polished finish', '/hair'],
                ['Makeup', 'Soft Romantic · 22 min', '/makeup'],
                ['Body', 'Lotion + fragrance', '/beauty/body'],
              ].map(([title, detail, href]) => (
                <Link key={title} href={href} className="rounded-[22px] bg-[#fbf7f5] p-4 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#e7c9d0]">
                  <p className="text-[9px] uppercase tracking-[.16em] text-[#a58f88]">{title}</p>
                  <p className="mt-2 font-serif text-lg text-[#332d2a]">{detail}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-[10px] text-[#a76f7e]">Open <ArrowRight size={11} aria-hidden="true" /></span>
                </Link>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-[20px] bg-[#fff7f9] px-4 py-3">
              <Clock3 size={15} className="text-[#bc7d8c]" aria-hidden="true" />
              <div>
                <p className="text-[10px] uppercase tracking-[.14em] text-[#a58c94]">Leave-ready target</p>
                <p className="mt-0.5 text-[12px] text-[#514946]">{leaveTarget ? timeLabel(leaveTarget) : 'Choose an event in Calendar and Glow will calculate it automatically.'}</p>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            <section className="rounded-[28px] border border-[#eadfda] bg-[linear-gradient(145deg,#fff8fa,#f8f4fb)] p-5">
              <div className="flex items-center gap-2"><Sparkles size={15} className="text-[#b87888]" aria-hidden="true" /><h3 className="font-serif text-xl">Glow noticed</h3></div>
              <p className="mt-4 text-[12px] leading-6 text-[#6f6460]">{favoriteLook}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-[10px]">
                <div className="rounded-2xl bg-white p-3"><strong className="block text-lg text-[#342d2a]">{completed.length}</strong>completed rituals</div>
                <div className="rounded-2xl bg-white p-3"><strong className="block text-lg text-[#342d2a]">{products.length}</strong>products known</div>
              </div>
            </section>
            <section className="rounded-[28px] border border-[#eadfda] bg-white p-5">
              <p className="text-[9px] uppercase tracking-[.18em] text-[#a58f88]">Beauty needs attention</p>
              <div className="mt-3 space-y-2">
                {due.slice(0, 3).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf7f5] px-3 py-2.5 text-[11px]"><span>{item.title}</span><span className="text-[#b27684]">Due</span></div>)}
                {expiring.slice(0, 2).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#fff7f5] px-3 py-2.5 text-[11px]"><span>{item.name}</span><span className="text-[#b27684]">Check soon</span></div>)}
                {!due.length && !expiring.length && <p className="text-[11px] text-[#887d78]">Nothing urgent. Your Beauty attention queue is clear.</p>}
              </div>
            </section>
          </div>
        </div>
      )}

      {mode === 'Get Ready' && (
        <section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[9px] uppercase tracking-[.2em] text-[#b77b8a]">Get Ready {nextEvent ? `· ${nextEvent.title}` : ''}</p>
              <h2 className="mt-1 font-serif text-3xl text-[#302a27]">One guided sequence</h2>
              <p className="mt-2 text-[12px] text-[#827772]">{readyStart ? `Start around ${timeLabel(readyStart)} · ` : ''}{leaveTarget ? `ready by ${timeLabel(leaveTarget)}` : 'Glow will adapt this when an event is available.'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setLateMinutes((value) => value === 0 ? 12 : 0)} aria-pressed={lateMinutes > 0} className="rounded-full border border-[#eadfda] px-4 py-2 text-[11px]">{lateMinutes > 0 ? 'Back on time' : 'I’m running late'}</button>
              <button type="button" onClick={() => openGlow('Adapt my Get Ready plan right now. I am following Beauty Get Ready mode.')} className="rounded-full bg-[#2f2927] px-4 py-2 text-[11px] text-white">Ask Glow</button>
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-[#f0e8e5]" role="progressbar" aria-label="Get Ready progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full rounded-full bg-[#c98797] transition-all" style={{ width: `${progress}%` }} />
          </div>

          {lateMinutes > 0 && <div className="mt-4 rounded-[20px] bg-[#fff2f4] p-4"><p className="text-[10px] font-medium uppercase tracking-[.15em] text-[#ad6476]">You&apos;re {lateMinutes} min behind</p><p className="mt-2 text-[12px] text-[#6f6160]">Glow shortened makeup to mascara + cheeks + lip and changed hair to a faster finish.</p></div>}

          <div className="mt-5 space-y-2">
            {readySteps.map(([title, duration], index) => (
              <button
                type="button"
                key={title}
                onClick={() => setReadyIndex((current) => Math.max(current, index + 1))}
                aria-pressed={index < readyIndex}
                className={`flex min-h-14 w-full items-center justify-between rounded-[18px] px-4 text-left transition ${index < readyIndex ? 'bg-[#eef4ec] text-[#60705b]' : index === readyIndex ? 'bg-[#fff5f7] ring-1 ring-[#e7c9d0]' : 'bg-[#faf8f6] text-[#6d6460]'}`}
              >
                <span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[11px]">{index < readyIndex ? <Check size={14} aria-hidden="true" /> : index + 1}</span><span className="font-serif text-base">{title}</span></span>
                <span className="text-[10px]">{lateMinutes > 0 && ['Hair', 'Makeup'].includes(title) ? 'Quick version' : duration}</span>
              </button>
            ))}
          </div>

          {readyIndex === readySteps.length && <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,#fff3f7,#f5eff8)] p-6 text-center"><Heart className="mx-auto text-[#c47c8d]" size={20} aria-hidden="true" /><h3 className="mt-2 font-serif text-2xl">Look complete ♡</h3><button type="button" onClick={() => setReadyIndex(0)} className="mt-4 rounded-full bg-white px-4 py-2 text-[11px]">Reset sequence</button></div>}
        </section>
      )}

      {mode === 'Library' && (
        <div className="space-y-4">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {rooms.map(([title, detail, href]) => (
              <Link key={title} href={href} className="rounded-[24px] border border-[#eadfda] bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#e7c9d0]">
                <WandSparkles size={16} className="text-[#b77989]" aria-hidden="true" />
                <h3 className="mt-3 font-serif text-xl text-[#342d2a]">{title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-[#817570]">{detail}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[10px] text-[#a66e7c]">Open room <ArrowRight size={11} aria-hidden="true" /></span>
              </Link>
            ))}
          </section>
          <BeautyOperatingStudio routines={routines} products={products} upcomingAppointments={upcomingAppointments} />
        </div>
      )}

      {mode === 'Progress' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-2"><Package size={15} className="text-[#b87989]" aria-hidden="true" /><h2 className="font-serif text-2xl">Beauty memory</h2></div>
            <div className="mt-4 space-y-2">
              {recentNotes.length ? recentNotes.map((item) => <div key={item.id} className="rounded-[18px] bg-[#faf7f5] p-4"><p className="text-[10px] font-medium text-[#544a46]">{item.subject}</p><p className="mt-1 text-[11px] leading-5 text-[#81746e]">{item.body}</p></div>) : <p className="text-[11px] text-[#887d78]">Complete and rate Beauty sessions to build your personal Beauty memory.</p>}
            </div>
          </div>
          <div className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-6">
            <p className="text-[9px] uppercase tracking-[.18em] text-[#a58f88]">Recent history</p>
            <div className="mt-4 space-y-2">{intelligence.recentRuns.slice(0, 6).map((run) => <div key={run.id} className="flex items-center justify-between rounded-[18px] bg-[#faf8f6] px-4 py-3"><div><p className="text-[11px] font-medium">{run.title}</p><p className="mt-1 text-[9px] text-[#968984]">{new Date(run.startedAt).toLocaleDateString()}</p></div><span className="text-[10px] text-[#a66f7d]">{run.status}</span></div>)}{!intelligence.recentRuns.length && <p className="text-[11px] text-[#887d78]">Your completed Beauty sessions will appear here.</p>}</div>
          </div>
        </section>
      )}

      {mode === 'Beauty Lab' && (
        <div className="grid gap-4 lg:grid-cols-[.8fr_1.2fr]">
          <section className="rounded-[28px] border border-[#eadfda] bg-[linear-gradient(145deg,#fff7f8,#f7f3fb)] p-5 sm:p-6">
            <FlaskConical size={18} className="text-[#b97989]" aria-hidden="true" />
            <h2 className="mt-3 font-serif text-3xl text-[#332c29]">Test what actually works</h2>
            <p className="mt-3 text-[12px] leading-6 text-[#786c67]">Compare products, routines and techniques, then keep the result in Beauty memory instead of relying on guesswork.</p>
            <Link href="/beauty/lab" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2f2927] px-5 py-3 text-[11px] text-white">Open Beauty Lab <ArrowRight size={12} aria-hidden="true" /></Link>
          </section>
          <section className="rounded-[28px] border border-[#eadfda] bg-white p-5 sm:p-6">
            <p className="text-[9px] uppercase tracking-[.18em] text-[#a58f88]">Ask your Beauty memory</p>
            <div className="mt-4 flex gap-2">
              <label className="sr-only" htmlFor="beauty-search">Search Beauty memory</label>
              <input id="beauty-search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') searchBeauty(); }} placeholder="Which blush looked best?" className="min-h-11 flex-1 rounded-full border border-[#eadfda] px-4 text-[12px] outline-none focus:ring-2 focus:ring-[#ead0d6]" />
              <button type="button" onClick={searchBeauty} aria-label="Search Beauty memory" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f2927] text-white"><Search size={15} aria-hidden="true" /></button>
            </div>
            {searchAnswer && <div className="mt-4 rounded-[18px] bg-[#faf7f5] p-4 text-[11px] leading-5 text-[#6f6460]">{searchAnswer}</div>}
            <button type="button" onClick={() => openGlow(query || 'Help me with my Beauty routine right now.')} className="mt-4 text-[11px] font-medium text-[#a46d7a]">Continue this with Glow →</button>
          </section>
        </div>
      )}
    </div>
  );
}
