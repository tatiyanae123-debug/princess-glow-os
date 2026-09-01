'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Check, ChevronRight, Clock3, Leaf, MoonStar, Pencil, Sparkles, SunMedium } from 'lucide-react';
import type { TodaySceneData } from '@/lib/today/scenes';
import { completeTodayTaskAction, moveTodayTaskToTomorrowAction } from '@/app/actions/today-scenes';
import { finishDayFormAction } from '@/app/actions/adaptive-os';

export type TodaySceneView = 'home' | 'morning' | 'flow' | 'evening';
type TimePhase = 'morning' | 'afternoon' | 'evening' | 'night';

const phaseCopy: Record<TimePhase, { greeting: string; brief: string; action: string }> = {
  morning: { greeting: 'Good morning', brief: 'Morning Brief', action: 'Begin Morning' },
  afternoon: { greeting: 'Good afternoon', brief: 'Midday Brief', action: 'Continue Today' },
  evening: { greeting: 'Good evening', brief: 'Evening Brief', action: 'Open Debrief' },
  night: { greeting: 'Good night', brief: 'Night Brief', action: 'Begin Wind-down' },
};

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

function formatDate(moment: Date | null) {
  return moment ? new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(moment) : 'Today';
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

function openTasks(data: TodaySceneData) {
  if (data.dashboard.topPriorityTasks.length) return data.dashboard.topPriorityTasks.slice(0, 3);
  return data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled').slice(0, 3);
}

function nextEvent(data: TodaySceneData, moment: Date | null) {
  const now = moment?.getTime() ?? Date.now();
  return [...data.dashboard.todaySchedule.events]
    .filter((event) => new Date(event.endAt ?? event.startAt).getTime() >= now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] ?? null;
}

function ScenePanel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <section className={`today-live-panel ${className}`}>{children}</section>;
}

function PriorityList({ data, complete = false }: { data: TodaySceneData; complete?: boolean }) {
  const tasks = openTasks(data);
  return <div className="today-priorities">{tasks.length ? tasks.map((task, index) => <div className="today-priority" key={task.id}>
    <span>{index + 1}</span><p>{task.title}</p>
    {complete ? <form action={completeTodayTaskAction.bind(null, task.id)}><button type="submit" aria-label={`Complete ${task.title}`}><Check /></button></form> : null}
  </div>) : <Link className="today-empty-link" href="/tasks">Choose what matters today <ArrowRight /></Link>}</div>;
}

function AskGlowButton({ large = false }: { large?: boolean }) {
  return <button type="button" className={large ? 'today-primary-action' : 'today-ask'} onClick={() => document.dispatchEvent(new Event('glow:voice-open'))}>
    <Sparkles /><span>{large ? 'What should I do now?' : 'Ask Glow'}</span>{large ? <ChevronRight /> : null}
  </button>;
}

function Opening() {
  return <button type="button" className="glow-opening" aria-label="Enter Glow" onClick={() => document.dispatchEvent(new Event('glow:opening-complete'))}>
    <span className="glow-opening__live"><strong>Glow</strong><small>Your life, held in light.</small></span><span className="glow-opening__hint">Tap to enter</span>
  </button>;
}

function Home({ data, firstName, moment }: { data: TodaySceneData; firstName: string; moment: Date | null }) {
  const event = nextEvent(data, moment);
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  const capacity = energyPercent(energy);
  return <main className="today-scene today-scene--home">
    <header className="today-hero today-home__hero"><h1>{phaseCopy[phaseFor(moment)].greeting},<br/><em>{firstName}.</em></h1><div className="today-rule"><span/><Sparkles/><span/></div><p>{data.dashboard.greeting.message || 'Your day is lighter than it looks.'}</p><time>{formatDate(moment)}</time></header>
    <ScenePanel className="today-home__priorities"><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} complete /></ScenePanel>
    <ScenePanel className="today-home__event"><p className="today-eyebrow">Next event</p><Link href="/calendar"><CalendarDays/><span><strong>{event?.title ?? 'Open time'}</strong><small>{event ? `${formatTime(event.startAt)}${event.endAt ? ` · ${formatTime(event.endAt)}` : ''}` : 'Your calendar has room'}</small></span></Link></ScenePanel>
    <ScenePanel className="today-home__capacity"><p className="today-eyebrow">Current capacity</p><strong>{capacity === null ? '—' : `${capacity}%`}</strong><p>{capacity === null ? 'Check in so Glow can shape today.' : capacity < 50 ? 'Your day will stay intentionally gentle.' : 'You have enough for what matters most.'}</p><Link href="/wellness">View capacity factors <ArrowRight/></Link></ScenePanel>
    <div className="today-actions"><AskGlowButton large/><AskGlowButton/></div>
  </main>;
}

function EarlyBrief({ data, moment }: { data: TodaySceneData; moment: Date | null }) {
  const phase = phaseFor(moment);
  const event = nextEvent(data, moment);
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  const intentions = [
    { title: 'Clarity', icon: SunMedium, text: openTasks(data)[0]?.title ?? 'Set the tone with purpose.' },
    { title: 'Wellness', icon: Leaf, text: energyPercent(energy) === null ? 'Nourish mind and body.' : `Move from ${energyLabel(energy).toLowerCase()} energy.` },
    { title: 'Purpose', icon: Sparkles, text: data.dashboard.weekTheme.note || 'Create meaningful progress today.' },
  ];
  return <main className="today-scene today-scene--morning">
    <header className="today-hero today-morning__hero"><h1>{phaseCopy[phase].brief.split(' ').map((word) => <span key={word}>{word}</span>)}</h1><div className="today-rule"><span/><Sparkles/><span/></div><time>{formatDate(moment)}</time><p>A new day of becoming.<br/>Move with clarity, grace, and purpose.</p></header>
    <section className="morning-intentions">{intentions.map(({ title, icon: Icon, text }) => <ScenePanel key={title}><Icon/><h2>{title}</h2><p>{text}</p></ScenePanel>)}</section>
    <div className="morning-brief__grid">
      <ScenePanel><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} complete /></ScenePanel>
      <ScenePanel><p className="today-eyebrow">First appointment</p><Link className="today-event-row" href="/calendar"><CalendarDays/><span><strong>{event ? `${formatTime(event.startAt)}${event.endAt ? ` – ${formatTime(event.endAt)}` : ''}` : 'Open time'}</strong><small>{event ? `${event.title}${event.location ? ` · ${event.location}` : ''}` : 'Your calendar has room'}</small></span></Link></ScenePanel>
      <ScenePanel><p className="today-eyebrow">Current energy</p><div className="today-energy"><span>{energyLabel(energy)}</span><strong>{energyPercent(energy) === null ? '—' : `${energyPercent(energy)}%`}</strong><i style={{ '--energy': `${energyPercent(energy) ?? 0}%` } as React.CSSProperties}/></div><Link className="today-inline-link" href="/wellness">{energy ? 'You are aligned and ready.' : 'Complete your check-in'} <ArrowRight/></Link></ScenePanel>
      <ScenePanel><p className="today-eyebrow">Today&apos;s recommendation</p><Link className="today-recommendation" href="/brain"><SunMedium/><span>{data.dashboard.greeting.title}</span><ChevronRight/></Link></ScenePanel>
    </div>
    <div className="today-actions"><Link href="/today/flow" className="today-primary-action"><SunMedium/><span>{phaseCopy[phase].action}</span><ChevronRight/></Link><AskGlowButton/></div>
  </main>;
}

function DayFlow({ data, moment }: { data: TodaySceneData; moment: Date | null }) {
  const livePhase = phaseFor(moment);
  const [active, setActive] = useState<TimePhase>(livePhase);
  useEffect(() => setActive(livePhase), [livePhase]);
  const segments = [
    { id: 'morning' as const, icon: SunMedium, title: 'Morning', detail: data.dashboard.routinesForNow[0]?.name ?? 'Hydrate · medication · sunlight · assess energy', href: '/routines' },
    { id: 'afternoon' as const, icon: Clock3, title: 'Afternoon', detail: 'Priority block · meal · movement', href: '/planning' },
    { id: 'evening' as const, icon: SunMedium, title: 'Evening', detail: 'Reset space · care routine · tomorrow setup', href: '/today/evening' },
    { id: 'night' as const, icon: MoonStar, title: 'Night', detail: 'Low stimulation · medication check · sleep wind-down', href: '/wellness' },
  ];
  const event = nextEvent(data, moment);
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  return <main className="today-scene today-scene--flow">
    <header className="today-hero today-flow__hero"><h1>Today</h1><div className="today-rule"><span/><Sparkles/><span/></div><time>{formatDate(moment)}</time></header>
    <section className="day-flow__timeline" aria-label="Day flow">{segments.map(({ id, icon: Icon, title, detail, href }) => <Link href={href} key={id} onClick={(event) => { if (active !== id) { event.preventDefault(); setActive(id); } }} className={active === id ? 'is-active' : ''}><span><Icon/></span><span><strong>{title}</strong><small>{detail}</small></span></Link>)}</section>
    <aside className="day-flow__facts">
      <ScenePanel><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} complete /></ScenePanel>
      <ScenePanel><p className="today-eyebrow">Next appointment</p><Link className="today-event-row" href="/calendar"><CalendarDays/><span><strong>{event ? formatTime(event.startAt) : 'Open time'}</strong><small>{event?.title ?? 'No event is constraining your day'}</small></span></Link></ScenePanel>
      <ScenePanel><p className="today-eyebrow">Current energy</p><div className="today-energy"><span>{energyLabel(energy)}</span><strong>{energyPercent(energy) === null ? '—' : `${energyPercent(energy)}%`}</strong><i style={{ '--energy': `${energyPercent(energy) ?? 0}%` } as React.CSSProperties}/></div></ScenePanel>
      <ScenePanel><p className="today-eyebrow">Today&apos;s recommendation</p><Link className="today-recommendation" href="/brain"><Leaf/><span>{data.dashboard.greeting.title}</span><ChevronRight/></Link></ScenePanel>
    </aside>
    <div className="today-actions"><AskGlowButton large/></div>
  </main>;
}

function EveningDebrief({ data, moment, phase }: { data: TodaySceneData; moment: Date | null; phase: TimePhase }) {
  const completed = data.tasks.filter((task) => task.status === 'done').slice(0, 2);
  const open = openTasks(data);
  return <main className="today-scene today-scene--evening">
    <header className="today-hero today-evening__hero"><h1>{phase === 'night' ? 'Night' : 'Evening'}<span>Debrief</span></h1><div className="today-rule"><span/><Sparkles/><span/></div><time>{formatDate(moment)}</time><p>What do I carry forward?</p></header>
    <div className="evening-grid">
      <ScenePanel><p className="today-eyebrow">Today</p><p className="evening-summary"><Check/> {completed.length} priorities completed</p><p className="evening-summary"><Clock3/> {open.length} priorities still open</p></ScenePanel>
      <ScenePanel><p className="today-eyebrow">Completed</p>{completed.length ? completed.map((task) => <p key={task.id} className="evening-summary"><Check/> {task.title}</p>) : <Link className="today-empty-link" href="/tasks">Review today <ArrowRight/></Link>}</ScenePanel>
      <ScenePanel><p className="today-eyebrow">Move to tomorrow</p>{open[0] ? <form action={moveTodayTaskToTomorrowAction.bind(null, open[0].id)}><button type="submit" className="evening-move"><ArrowRight/> {open[0].title}</button></form> : <p className="evening-summary"><Check/> No carryover needed</p>}</ScenePanel>
    </div>
    <form action={finishDayFormAction} className="evening-reflection">
      <ScenePanel><label><span className="today-eyebrow">What I noticed</span><textarea name="memoryNote" defaultValue={data.review?.memoryNote ?? ''} placeholder="Energy improved after lunch…"/></label></ScenePanel>
      <ScenePanel><label><span className="today-eyebrow">Gratitude</span><textarea name="completedSummary" defaultValue={data.review?.completedSummary ?? ''} placeholder="One thing that felt good today…"/></label></ScenePanel>
      <ScenePanel className="tomorrow-first"><label><span className="today-eyebrow">Tomorrow&apos;s first step</span><input name="tomorrow1" defaultValue={data.review?.tomorrowTopThree?.[0] ?? ''} placeholder="Begin with water, medication, and sunlight."/></label><input type="hidden" name="movedSummary" value={open.map((task) => task.title).join(', ')}/><input type="hidden" name="energy" value={energyReviewScore(data.dashboard.wellnessToday.entry?.energy)}/><input type="hidden" name="mood" value={data.dashboard.wellnessToday.entry?.mood ?? ''}/></ScenePanel>
      <button type="submit" className="today-primary-action"><Check/><span>Close the day</span></button><Link href="/today" className="today-secondary-action"><Pencil/> Edit reflection</Link>
    </form>
    <div className="today-actions"><AskGlowButton/></div>
  </main>;
}

export function TodayExperience({ view, data, userName }: { view: TodaySceneView; data: TodaySceneData; userName?: string | null }) {
  const moment = useLiveMoment();
  const phase = phaseFor(moment);
  const firstName = useMemo(() => userName?.trim().split(/\s+/)[0] || 'Tatiyana', [userName]);
  const [opening, setOpening] = useState(false);
  useTimeZoneSync();

  useEffect(() => {
    if (view === 'home') setOpening(window.sessionStorage.getItem('glow:opening-seen-v3') !== 'yes');
    const complete = () => { window.sessionStorage.setItem('glow:opening-seen-v3', 'yes'); setOpening(false); };
    document.addEventListener('glow:opening-complete', complete);
    return () => document.removeEventListener('glow:opening-complete', complete);
  }, [view]);

  useEffect(() => {
    if (opening) document.documentElement.dataset.glowOpening = 'true';
    else delete document.documentElement.dataset.glowOpening;
    return () => { delete document.documentElement.dataset.glowOpening; };
  }, [opening]);

  if (opening) return <Opening/>;
  if (view === 'morning') return phase === 'evening' || phase === 'night' ? <EveningDebrief data={data} moment={moment} phase={phase}/> : <EarlyBrief data={data} moment={moment}/>;
  if (view === 'flow') return <DayFlow data={data} moment={moment}/>;
  if (view === 'evening') return <EveningDebrief data={data} moment={moment} phase={phase}/>;
  return <Home data={data} firstName={firstName} moment={moment}/>;
}
