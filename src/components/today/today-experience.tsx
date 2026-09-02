'use client';

import { useEffect, useMemo, useState, useTransition, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, ChevronRight, Clock3, Droplets, Gauge, Home, Leaf, List, MapPin, MoonStar, RotateCcw, Sparkles, SunMedium, Volume2, VolumeX, Workflow, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { TodaySceneData } from '@/lib/today/scenes';
import { completeTodayTaskAction, moveTodayTaskToTomorrowAction } from '@/app/actions/today-scenes';
import { finishDayFormAction } from '@/app/actions/adaptive-os';

export type TodaySceneView = 'home' | 'morning' | 'flow' | 'evening';
type JourneyScene = 'opening' | 'home' | 'brief' | 'flow' | 'debrief';
type TimePhase = 'morning' | 'afternoon' | 'evening' | 'night';
type DetailView = 'priorities' | 'event' | 'capacity';

const phaseLanguage: Record<TimePhase, { greeting: string; brief: string; message: string; action: string }> = {
  morning: { greeting: 'Good morning', brief: 'Morning Brief', message: 'Your day is lighter than it looks.', action: 'Begin Morning' },
  afternoon: { greeting: 'Good afternoon', brief: 'Midday Brief', message: 'Keep what matters close. The rest can wait.', action: 'Continue Today' },
  evening: { greeting: 'Good evening', brief: 'Evening Brief', message: 'Let the day close with clarity and ease.', action: 'Review Today' },
  night: { greeting: 'Good night', brief: 'Night Brief', message: 'You have done enough. Tomorrow can begin gently.', action: 'Begin Wind-down' },
};

const journeySteps: Array<{ id: Exclude<JourneyScene, 'opening'>; label: string; icon: typeof Home }> = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'brief', label: 'Brief', icon: SunMedium },
  { id: 'flow', label: 'Day Flow', icon: Workflow },
  { id: 'debrief', label: 'Debrief', icon: MoonStar },
];

function phaseFor(moment: Date | null): TimePhase {
  const hour = moment?.getHours() ?? 8;
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function useLiveMoment() {
  const [moment, setMoment] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => setMoment(new Date());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return moment;
}

function useTimeZoneSync() {
  const router = useRouter();
  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!zone) return;
    const encoded = encodeURIComponent(zone);
    const saved = document.cookie.split('; ').find((entry) => entry.startsWith('glow-timezone='))?.split('=')[1];
    if (saved === encoded) return;
    document.cookie = `glow-timezone=${encoded}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);
}

function useHidePreviewToolbar() {
  useEffect(() => {
    const hide = () => {
      for (const element of document.querySelectorAll<HTMLElement>('vercel-live-feedback, [data-vercel-toolbar], iframe[src*="vercel.live"], iframe[title*="Vercel"]')) {
        element.style.setProperty('display', 'none', 'important');
        element.style.setProperty('pointer-events', 'none', 'important');
      }
    };
    hide();
    const observer = new MutationObserver(hide);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}

function useGlowSensory() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => setEnabled(window.localStorage.getItem('glow:sensory') === 'on'), []);
  function toggle() {
    setEnabled((current) => {
      const next = !current;
      window.localStorage.setItem('glow:sensory', next ? 'on' : 'off');
      if (next && 'vibrate' in navigator) navigator.vibrate(12);
      return next;
    });
  }
  function pulse(kind: 'tap' | 'success' | 'open' = 'tap') {
    if (!enabled) return;
    if ('vibrate' in navigator) navigator.vibrate(kind === 'success' ? [10, 35, 18] : kind === 'open' ? 16 : 8);
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(kind === 'success' ? 660 : kind === 'open' ? 520 : 440, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(kind === 'success' ? 880 : 620, context.currentTime + .16);
    gain.gain.setValueAtTime(.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.035, context.currentTime + .018);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .22);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + .23);
    oscillator.addEventListener('ended', () => void context.close(), { once: true });
  }
  return { enabled, toggle, pulse };
}

function formatDate(moment: Date | null) {
  return moment ? new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(moment) : 'Today';
}

function formatClock(moment: Date | null) {
  return moment ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(moment) : '';
}

function formatTime(value: Date | string | null | undefined) {
  return value ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value)) : null;
}

function energyPercent(value: string | number | null | undefined) {
  if (typeof value === 'number') return Math.min(100, Math.max(0, value * 10));
  return value === 'high' ? 90 : value === 'medium' ? 70 : value === 'low' ? 40 : value === 'exhausted' ? 20 : null;
}

function energyLabel(value: string | number | null | undefined) {
  const percent = energyPercent(value);
  if (percent === null) return 'Check in';
  if (percent >= 80) return 'Strong';
  if (percent >= 55) return 'Balanced';
  if (percent >= 30) return 'Gentle';
  return 'Restorative';
}

function energyReviewScore(value: string | number | null | undefined) {
  const percent = energyPercent(value);
  return percent === null ? '' : Math.max(1, Math.round(percent / 10));
}

function openTasks(data: TodaySceneData, completedIds: Set<string>) {
  const source = data.dashboard.topPriorityTasks.length ? data.dashboard.topPriorityTasks : data.tasks;
  return source.filter((task) => task.status !== 'done' && task.status !== 'cancelled' && !completedIds.has(task.id));
}

function nextEvent(data: TodaySceneData, moment: Date | null) {
  const now = moment?.getTime() ?? Date.now();
  return [...data.dashboard.todaySchedule.events]
    .filter((event) => new Date(event.endAt ?? event.startAt).getTime() >= now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] ?? null;
}

function Opening({ enter }: { enter: () => void }) {
  return <button type="button" className="glow-opening" aria-label="Enter Glow" onClick={enter}>
    <picture><source media="(min-width: 700px) and (orientation: landscape)" srcSet="/glow/today/opening-wide.png"/><img className="glow-opening__image" src="/glow/today/opening-reference.jpeg" alt=""/></picture>
    <span className="glow-opening__live" aria-hidden="true"><strong>Glow</strong><small>Your life, held in light.</small></span>
    <span className="glow-opening__pulse" aria-hidden="true"/>
    <span className="glow-opening__hint">Tap the light to enter</span>
  </button>;
}

function JourneyControls({ scene, phase, livePhase, isPreview, sensoryEnabled, toggleSensory, setPhase, resetPhase, go, replay }: { scene: JourneyScene; phase: TimePhase; livePhase: TimePhase; isPreview: boolean; sensoryEnabled: boolean; toggleSensory: () => void; setPhase: (phase: TimePhase) => void; resetPhase: () => void; go: (scene: JourneyScene) => void; replay: () => void }) {
  return <>
    <nav className="today-journey-nav" aria-label="Today journey">
      <span className="today-journey-nav__line" aria-hidden="true"/>
      {journeySteps.map(({ id, label, icon: Icon }, index) => <button type="button" key={id} onClick={() => go(id)} aria-current={scene === id ? 'step' : undefined}><i>{index + 1}</i><Icon/><span>{label}</span></button>)}
    </nav>
    <div className="today-utility-controls">
      <label><span>{isPreview ? 'Preview' : 'Live'}</span><select value={phase} onChange={(event) => setPhase(event.target.value as TimePhase)} aria-label={`Preview part of day. Live phase is ${livePhase}`}><option value="morning">Morning</option><option value="afternoon">Afternoon</option><option value="evening">Evening</option><option value="night">Night</option></select></label>
      {isPreview ? <button type="button" onClick={resetPhase} aria-label="Return to current live phase"><Clock3/></button> : null}
      <button type="button" onClick={toggleSensory} aria-pressed={sensoryEnabled} aria-label={`${sensoryEnabled ? 'Disable' : 'Enable'} Glow sound and haptic feedback`}>{sensoryEnabled ? <Volume2/> : <VolumeX/>}</button>
      <button type="button" onClick={replay} aria-label="Replay Glow opening"><RotateCcw/></button>
    </div>
  </>;
}

function PriorityList({ data, completedIds, completeTask, pending, expand, full = false }: { data: TodaySceneData; completedIds: Set<string>; completeTask: (id: string, title: string) => void; pending: boolean; expand?: () => void; full?: boolean }) {
  const tasks = openTasks(data, completedIds);
  return <div className="today-priorities">{tasks.length ? (full ? tasks : tasks.slice(0, 3)).map((task, index) => <div className="today-priority" key={task.id}>
    <span>{index + 1}</span><p>{task.title.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim()}</p>
    <button type="button" disabled={pending} onClick={() => completeTask(task.id, task.title)} aria-label={`Complete ${task.title}`}><Check /></button>
  </div>) : <Link className="today-empty-link" href="/tasks">Your priority space is clear <ArrowRight /></Link>}{!full && (tasks.length > 3 || expand) ? <button type="button" className="today-view-all" onClick={expand}><List/>View all {tasks.length} priorities</button> : null}</div>;
}

function DetailSurface({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); }; const previous = document.documentElement.style.overflow; document.documentElement.style.overflow = 'hidden'; window.addEventListener('keydown', onKey); return () => { document.documentElement.style.overflow = previous; window.removeEventListener('keydown', onKey); }; }, [close]);
  return <div className="today-detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}><section className="today-detail" role="dialog" aria-modal="true" aria-labelledby="today-detail-title"><span className="today-detail__handle"/><header><h2 id="today-detail-title">{title}</h2><button type="button" onClick={close} aria-label="Close details"><X/></button></header><div className="today-detail__body">{children}</div></section></div>;
}

function AskGlowButton({ openGlow, large = false }: { openGlow: () => void; large?: boolean }) {
  return <button type="button" className={large ? 'today-primary-action' : 'today-ask'} onClick={openGlow}><Sparkles/><span>{large ? 'What should I do now?' : 'Ask Glow'}</span>{large ? <ChevronRight/> : null}</button>;
}

type SceneProps = {
  data: TodaySceneData;
  moment: Date | null;
  phase: TimePhase;
  completedIds: Set<string>;
  completeTask: (id: string, title: string) => void;
  pending: boolean;
  go: (scene: JourneyScene) => void;
  openGlow: () => void;
  expandPriorities: () => void;
  expandEvent: () => void;
  expandCapacity: () => void;
};

function TodayHome({ data, moment, phase, completedIds, completeTask, pending, go, openGlow, expandPriorities, expandEvent, expandCapacity, firstName }: SceneProps & { firstName: string }) {
  const event = nextEvent(data, moment);
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  const capacity = energyPercent(energy);
  const calendarDisconnected = data.dashboard.googleCalendar.status !== 'connected' && data.dashboard.todaySchedule.events.length === 0;
  return <section className="today-scene today-scene--home" aria-label="Today Home">
    <header className="today-hero today-home__hero">
      <p className="today-live-time"><time>{formatDate(moment)}</time><span>{formatClock(moment)}</span><b>{phase}</b></p>
      <h1><span>{phaseLanguage[phase].greeting},</span><em>{firstName}.</em></h1>
      <div className="today-rule"><span/><Sparkles/><span/></div><p>{phaseLanguage[phase].message}</p>
    </header>
    <article className="today-live-panel today-home__priorities"><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} completedIds={completedIds} completeTask={completeTask} pending={pending} expand={expandPriorities}/></article>
    <article className="today-live-panel today-home__event"><p className="today-eyebrow">Next event</p><button type="button" className="today-monument-button" onClick={expandEvent}><CalendarDays/><span><strong>{calendarDisconnected ? 'Connect calendar' : event?.title ?? 'Open time'}</strong><small>{calendarDisconnected ? 'Show Glow your live schedule' : event ? `${formatTime(event.startAt)}${event.endAt ? ` · ${formatTime(event.endAt)}` : ''}` : 'Your calendar has room'}</small></span><ChevronRight/></button></article>
    <article className="today-live-panel today-home__capacity"><p className="today-eyebrow">Current capacity</p><button type="button" className="today-capacity-button" onClick={expandCapacity}>{capacity === null ? <><strong className="today-capacity-check">Check in</strong><span>Tell Glow how you feel so today can adapt.</span></> : <><strong>{capacity}%</strong><span>{capacity < 50 ? 'Glow will keep today intentionally gentle.' : 'You have enough for what matters most.'}</span></>}<small>{capacity === null ? 'Begin check-in' : 'View capacity factors'} <ArrowRight/></small></button></article>
    <div className="today-actions"><button type="button" className="today-primary-action" onClick={() => go('brief')}><Sparkles/><span>{phaseLanguage[phase].action}</span><ChevronRight/></button><AskGlowButton openGlow={openGlow}/></div>
  </section>;
}

function TodayBrief({ data, moment, phase, completedIds, completeTask, pending, go, openGlow }: SceneProps) {
  const event = nextEvent(data, moment);
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  const intentions = [
    { title: 'Clarity', icon: SunMedium, text: openTasks(data, completedIds)[0]?.title ?? 'Set the tone with purpose.' },
    { title: 'Wellness', icon: Leaf, text: energyPercent(energy) === null ? 'Nourish mind and body.' : `Move from ${energyLabel(energy).toLowerCase()} energy.` },
    { title: 'Purpose', icon: Sparkles, text: data.dashboard.weekTheme.note || 'Create meaningful progress today.' },
  ];
  return <section className="today-scene today-scene--brief" aria-label={phaseLanguage[phase].brief}>
    <header className="today-hero today-brief__hero"><p className="today-live-time"><time>{formatDate(moment)}</time><span>{formatClock(moment)}</span><b>{phase}</b></p><h1>{phaseLanguage[phase].brief.split(' ').map((word) => <span key={word}>{word}</span>)}</h1><div className="today-rule"><span/><Sparkles/><span/></div><p>A new part of your becoming.<br/>Move with clarity, grace, and purpose.</p></header>
    <div className="today-intentions">{intentions.map(({ title, icon: Icon, text }) => <article className="today-live-panel" key={title}><Icon/><h2>{title}</h2><p>{text}</p></article>)}</div>
    <div className="today-brief-grid">
      <article className="today-live-panel"><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} completedIds={completedIds} completeTask={completeTask} pending={pending}/></article>
      <article className="today-live-panel"><p className="today-eyebrow">First appointment</p><Link className="today-event-row" href="/calendar"><CalendarDays/><span><strong>{event ? `${formatTime(event.startAt)}${event.endAt ? ` – ${formatTime(event.endAt)}` : ''}` : 'Open time'}</strong><small>{event?.title ?? 'Your calendar has room'}</small></span></Link></article>
      <article className="today-live-panel"><p className="today-eyebrow">Current energy</p><div className="today-energy"><span>{energyLabel(energy)}</span><strong>{energyPercent(energy) === null ? 'Check in' : `${energyPercent(energy)}%`}</strong><i style={{ '--energy': `${energyPercent(energy) ?? 0}%` } as CSSProperties}/></div><Link className="today-inline-link" href="/wellness">{energy ? 'You are aligned and ready.' : 'Complete your check-in'} <ArrowRight/></Link></article>
      <article className="today-live-panel"><p className="today-eyebrow">Today&apos;s recommendation</p><Link className="today-recommendation" href="/brain"><SunMedium/><span>{data.dashboard.greeting.title}</span><ChevronRight/></Link></article>
    </div>
    <div className="today-actions"><button type="button" className="today-primary-action" onClick={() => go('flow')}><SunMedium/><span>Enter Day Flow</span><ChevronRight/></button><AskGlowButton openGlow={openGlow}/></div>
  </section>;
}

function TodayFlow({ data, moment, phase, completedIds, completeTask, pending, go, openGlow }: SceneProps) {
  const [active, setActive] = useState<TimePhase>(phase);
  useEffect(() => setActive(phase), [phase]);
  const event = nextEvent(data, moment);
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  const segments = [
    { id: 'morning' as const, icon: SunMedium, title: 'Morning', detail: 'Hydrate · medication · sunlight · assess energy' },
    { id: 'afternoon' as const, icon: Clock3, title: 'Afternoon', detail: 'Priority block · meal · movement' },
    { id: 'evening' as const, icon: SunMedium, title: 'Evening', detail: 'Reset space · care routine · tomorrow setup' },
    { id: 'night' as const, icon: MoonStar, title: 'Night', detail: 'Low stimulation · medication check · sleep wind-down' },
  ];
  return <section className="today-scene today-scene--flow" aria-label="Day Flow">
    <header className="today-hero today-flow__hero"><p className="today-live-time"><time>{formatDate(moment)}</time><span>{formatClock(moment)}</span><b>{phase}</b></p><h1>Today</h1><div className="today-rule"><span/><Sparkles/><span/></div></header>
    <div className="today-flow-timeline" aria-label="Parts of today">{segments.map(({ id, icon: Icon, title, detail }) => <button type="button" key={id} onClick={() => setActive(id)} className={active === id ? 'is-active' : ''} aria-pressed={active === id}><span><Icon/></span><span><strong>{title}</strong><small>{detail}</small></span></button>)}</div>
    <aside className="today-flow-facts">
      <article className="today-live-panel"><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} completedIds={completedIds} completeTask={completeTask} pending={pending}/></article>
      <article className="today-live-panel"><p className="today-eyebrow">Next appointment</p><Link className="today-event-row" href="/calendar"><CalendarDays/><span><strong>{event ? formatTime(event.startAt) : 'Open time'}</strong><small>{event?.title ?? 'No event is constraining your day'}</small></span></Link></article>
      <article className="today-live-panel"><p className="today-eyebrow">Current energy</p><div className="today-energy"><span>{energyLabel(energy)}</span><strong>{energyPercent(energy) === null ? 'Check in' : `${energyPercent(energy)}%`}</strong><i style={{ '--energy': `${energyPercent(energy) ?? 0}%` } as CSSProperties}/></div></article>
      <article className="today-live-panel"><p className="today-eyebrow">Now illuminated</p><p className="today-flow-now">{segments.find((segment) => segment.id === active)?.detail}</p></article>
    </aside>
    <div className="today-actions"><button type="button" className="today-primary-action" onClick={() => go('debrief')}><MoonStar/><span>Reflect on Today</span><ChevronRight/></button><AskGlowButton openGlow={openGlow}/></div>
  </section>;
}

function TodayDebrief({ data, moment, phase, completedIds, pending, go, openGlow, moveTask, saveDay }: SceneProps & { moveTask: (id: string, title: string) => void; saveDay: (formData: FormData) => void }) {
  const completed = data.tasks.filter((task) => task.status === 'done' || completedIds.has(task.id));
  const open = openTasks(data, completedIds);
  return <section className="today-scene today-scene--debrief" aria-label="Evening Debrief">
    <header className="today-hero today-debrief__hero"><p className="today-live-time"><time>{formatDate(moment)}</time><span>{formatClock(moment)}</span><b>{phase}</b></p><h1><span>{phase === 'night' ? 'Night' : 'Evening'}</span><span>Debrief</span></h1><div className="today-rule"><span/><Sparkles/><span/></div><p>What do I carry forward?</p></header>
    <div className="today-debrief-stack">
      <article className="today-live-panel"><p className="today-eyebrow">Today</p><p className="today-summary"><Check/> {completed.length} priorities completed</p><p className="today-summary"><Clock3/> {open.length} priorities remain</p></article>
      <article className="today-live-panel"><p className="today-eyebrow">Completed</p>{completed.length ? completed.map((task) => <p key={task.id} className="today-summary"><Check/> {task.title.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim()}</p>) : <p className="today-summary">Your reflection is open.</p>}</article>
      <article className="today-live-panel"><p className="today-eyebrow">Move to tomorrow</p>{open[0] ? <button type="button" disabled={pending} className="today-move" onClick={() => moveTask(open[0].id, open[0].title)}><ArrowRight/> {open[0].title.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim()}</button> : <p className="today-summary"><Check/> No carryover needed</p>}</article>
    </div>
    <form action={saveDay} className="today-reflection-form">
      <article className="today-live-panel"><label><span className="today-eyebrow">What I noticed</span><textarea name="memoryNote" defaultValue={data.review?.memoryNote ?? ''} placeholder="Energy improved after lunch…"/></label></article>
      <article className="today-live-panel"><label><span className="today-eyebrow">Gratitude</span><textarea name="completedSummary" defaultValue={data.review?.completedSummary ?? ''} placeholder="One thing that felt good today…"/></label></article>
      <article className="today-live-panel today-tomorrow-first"><label><span className="today-eyebrow">Tomorrow&apos;s first step</span><input name="tomorrow1" defaultValue={data.review?.tomorrowTopThree?.[0] ?? ''} placeholder="Begin with water, medication, and sunlight."/></label><input type="hidden" name="movedSummary" value={open.map((task) => task.title).join(', ')}/><input type="hidden" name="energy" value={energyReviewScore(data.dashboard.wellnessToday.entry?.energy)}/><input type="hidden" name="mood" value={data.dashboard.wellnessToday.entry?.mood ?? ''}/></article>
      <button type="submit" disabled={pending} className="today-primary-action"><Check/><span>{pending ? 'Saving…' : 'Close the day'}</span></button><button type="button" className="today-secondary-action" onClick={() => go('home')}>Return Home</button>
    </form>
    <div className="today-actions"><AskGlowButton openGlow={openGlow}/></div>
  </section>;
}

export function TodayExperience({ view, data, userName }: { view: TodaySceneView; data: TodaySceneData; userName?: string | null }) {
  const initialScene: JourneyScene = view === 'morning' ? 'brief' : view === 'flow' ? 'flow' : view === 'evening' ? 'debrief' : 'opening';
  const moment = useLiveMoment();
  const livePhase = phaseFor(moment);
  const [previewPhase, setPreviewPhase] = useState<TimePhase | null>(null);
  const phase = previewPhase ?? livePhase;
  const [scene, setScene] = useState<JourneyScene>(initialScene);
  const [detail, setDetail] = useState<DetailView | null>(null);
  const [feedback, setFeedback] = useState('');
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set());
  const [pending, startTransition] = useTransition();
  const firstName = useMemo(() => userName?.trim().split(/\s+/)[0] || 'Tatiyana', [userName]);
  const sensory = useGlowSensory();
  useTimeZoneSync();
  useHidePreviewToolbar();

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const previous = event.state?.glowScene as JourneyScene | undefined;
      if (previous && journeySteps.some((step) => step.id === previous)) setScene(previous);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => {
    if (scene === 'opening') document.documentElement.dataset.glowOpening = 'true';
    else delete document.documentElement.dataset.glowOpening;
    return () => { delete document.documentElement.dataset.glowOpening; };
  }, [scene]);
  function go(next: JourneyScene, replace = false) {
    if (next === scene) return;
    setScene(next);
    setDetail(null);
    sensory.pulse(next === 'opening' ? 'tap' : 'open');
    if (next !== 'opening') window.history[replace ? 'replaceState' : 'pushState']({ glowScene: next }, '', window.location.href);
    document.querySelector('.today-journey')?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeTask(id: string, title: string) {
    setCompletedIds((current) => new Set(current).add(id));
    setFeedback(`${title} completed.`);
    sensory.pulse('success');
    startTransition(async () => {
      try { await completeTodayTaskAction(id); }
      catch { setCompletedIds((current) => { const next = new Set(current); next.delete(id); return next; }); setFeedback('Glow could not complete that priority. Try again.'); }
    });
  }

  function moveTask(id: string, title: string) {
    setCompletedIds((current) => new Set(current).add(id));
    setFeedback(`${title} moved to tomorrow.`);
    sensory.pulse('success');
    startTransition(async () => {
      try { await moveTodayTaskToTomorrowAction(id); }
      catch { setCompletedIds((current) => { const next = new Set(current); next.delete(id); return next; }); setFeedback('Glow could not move that priority. Try again.'); }
    });
  }

  function saveDay(formData: FormData) {
    formData.set('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    setFeedback('Saving your reflection…');
    startTransition(async () => {
      try { await finishDayFormAction(formData); setFeedback('Today is closed gently. Your reflection is saved.'); }
      catch { setFeedback('Glow could not save the reflection. Your writing is still on this screen.'); }
    });
  }

  function openGlow() {
    setFeedback('Opening Ask Glow…');
    sensory.pulse('open');
    document.dispatchEvent(new Event('glow:voice-open'));
  }

  if (scene === 'opening') return <Opening enter={() => go('home')}/>;

  const event = nextEvent(data, moment);
  const wellness = data.dashboard.wellnessToday.entry;
  const capacity = energyPercent(wellness?.energy);
  const calendarDisconnected = data.dashboard.googleCalendar.status !== 'connected' && data.dashboard.todaySchedule.events.length === 0;
  const shared = { data, moment, phase, completedIds, completeTask, pending, go, openGlow, expandPriorities: () => setDetail('priorities'), expandEvent: () => setDetail('event'), expandCapacity: () => setDetail('capacity') };
  return <main className="today-journey" data-scene={scene} data-phase={phase}>
    <JourneyControls scene={scene} phase={phase} livePhase={livePhase} isPreview={previewPhase !== null} sensoryEnabled={sensory.enabled} toggleSensory={() => { sensory.toggle(); setFeedback(`Glow sound and haptics ${sensory.enabled ? 'off' : 'on'}.`); }} setPhase={setPreviewPhase} resetPhase={() => setPreviewPhase(null)} go={go} replay={() => go('opening')}/>
    {scene === 'home' ? <TodayHome {...shared} firstName={firstName}/> : null}
    {scene === 'brief' ? <TodayBrief {...shared}/> : null}
    {scene === 'flow' ? <TodayFlow {...shared}/> : null}
    {scene === 'debrief' ? <TodayDebrief {...shared} moveTask={moveTask} saveDay={saveDay}/> : null}
    {detail === 'priorities' ? <DetailSurface title="Today’s priorities" close={() => setDetail(null)}><PriorityList data={data} completedIds={completedIds} completeTask={completeTask} pending={pending} full/><Link className="today-detail__link" href="/tasks">Open task room <ArrowRight/></Link></DetailSurface> : null}
    {detail === 'event' ? <DetailSurface title="Next event" close={() => setDetail(null)}><div className="today-detail-card"><CalendarDays/><div><p className="today-eyebrow">{calendarDisconnected ? 'Calendar disconnected' : event ? 'Coming up' : 'Open time'}</p><h3>{calendarDisconnected ? 'Connect your calendar' : event?.title ?? 'Your calendar has room'}</h3>{event ? <><p>{formatTime(event.startAt)}{event.endAt ? ` – ${formatTime(event.endAt)}` : ''}{event.allDay ? ' · All day' : ''}</p>{event.location ? <p><MapPin/> {event.location}</p> : null}</> : <p>{calendarDisconnected ? 'Connect Google Calendar so Glow can protect time around your real schedule.' : 'Nothing is scheduled next. Glow can help you use this space intentionally.'}</p>}</div></div><Link className="today-detail__link" href={calendarDisconnected ? '/connections' : '/calendar'}>{calendarDisconnected ? 'Connect calendar' : 'Open daily calendar'} <ArrowRight/></Link></DetailSurface> : null}
    {detail === 'capacity' ? <DetailSurface title="Current capacity" close={() => setDetail(null)}><div className="today-capacity-detail"><Gauge/><strong>{capacity === null ? 'Check in' : `${capacity}%`}</strong><p>{capacity === null ? 'Add a quick energy check-in so Glow can shape today around your actual capacity.' : `${energyLabel(wellness?.energy)} capacity. ${capacity < 50 ? 'Glow will protect recovery and reduce pressure.' : 'You have room for focused progress and care.'}`}</p></div><div className="today-factor-grid"><article><Leaf/><span>Energy</span><strong>{wellness?.energy ?? 'Not logged'}</strong></article><article><MoonStar/><span>Sleep</span><strong>{wellness?.sleepHours == null ? 'Not logged' : `${wellness.sleepHours} hr`}</strong></article><article><Droplets/><span>Water</span><strong>{wellness?.waterGlasses == null ? 'Not logged' : `${wellness.waterGlasses} glasses`}</strong></article><article><Sparkles/><span>Mood</span><strong>{wellness?.mood ?? 'Not logged'}</strong></article></div><Link className="today-detail__link" href="/wellness">{capacity === null ? 'Begin capacity check-in' : 'Update capacity factors'} <ArrowRight/></Link></DetailSurface> : null}
    <p className="today-feedback" role="status" aria-live="polite">{feedback}</p>
  </main>;
}
