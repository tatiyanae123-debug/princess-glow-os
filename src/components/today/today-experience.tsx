'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, ChevronRight, Circle, Clock3, Leaf, MoonStar, Pencil, Sparkles, SunMedium } from 'lucide-react';
import type { TodaySceneData } from '@/lib/today/scenes';
import { completeTodayTaskAction, moveTodayTaskToTomorrowAction } from '@/app/actions/today-scenes';
import { finishDayFormAction } from '@/app/actions/adaptive-os';

export type TodaySceneView = 'home' | 'morning' | 'flow' | 'evening';

const sceneRoutes: Array<{ view: TodaySceneView; label: string; href: string }> = [
  { view: 'home', label: 'Home', href: '/dashboard' },
  { view: 'morning', label: 'Brief', href: '/today/morning' },
  { view: 'flow', label: 'Day Flow', href: '/today/flow' },
  { view: 'evening', label: 'Debrief', href: '/today/evening' },
];

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

function formatDate(moment: Date | null) {
  return moment ? new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(moment) : 'Loading today…';
}

function formatTime(value: Date | string | null | undefined) {
  if (!value) return null;
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function greetingFor(moment: Date | null) {
  if (!moment) return 'Welcome';
  const hour = moment.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function energyPercent(value: string | number | null | undefined) {
  if (typeof value === 'number') return Math.min(100, Math.max(0, value * 10));
  if (value === 'high') return 90;
  if (value === 'medium') return 70;
  if (value === 'low') return 40;
  if (value === 'exhausted') return 20;
  return null;
}

function energyLabel(value: string | number | null | undefined) {
  if (typeof value === 'number') return `${value} of 10`;
  if (value === 'high') return 'high';
  if (value === 'medium') return 'balanced';
  if (value === 'low') return 'low';
  if (value === 'exhausted') return 'very low';
  return null;
}

function energyReviewScore(value: string | number | null | undefined) {
  const percent = energyPercent(value);
  return percent === null ? '' : Math.max(1, Math.round(percent / 10));
}

function TodayPathNav({ view }: { view: TodaySceneView }) {
  return <nav className="today-path-nav" aria-label="Today journey">
    {sceneRoutes.map((item) => <Link key={item.view} href={item.href} aria-current={item.view === view ? 'page' : undefined} className={item.view === view ? 'is-active' : ''}>{item.label}</Link>)}
  </nav>;
}

function GlassPanel({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <section className={`today-glass ${className}`}>{children}</section>;
}

function PriorityList({ data, showActions = false }: { data: TodaySceneData; showActions?: boolean }) {
  const open = data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled').slice(0, 3);
  return <div className="today-priorities">
    {open.length ? open.map((task, index) => <div className="today-priority" key={task.id}>
      <span>{index + 1}</span><p>{task.title}</p>
      {showActions ? <form action={completeTodayTaskAction.bind(null, task.id)}><button type="submit" aria-label={`Complete ${task.title}`}><Check /></button></form> : null}
    </div>) : <Link className="today-empty-link" href="/tasks">Your priority space is open. Choose what matters today <ArrowRight /></Link>}
  </div>;
}

function AskGlowButton({ large = false }: { large?: boolean }) {
  return <button type="button" className={large ? 'today-primary-action' : 'today-ask'} onClick={() => document.dispatchEvent(new Event('glow:voice-open'))}>
    <Sparkles /> <span>{large ? 'What should I do now?' : 'Ask Glow'}</span>{large ? <ChevronRight /> : null}
  </button>;
}

function TodayHome({ data, firstName, moment }: { data: TodaySceneData; firstName: string; moment: Date | null }) {
  const nextEvent = [...data.dashboard.todaySchedule.events].filter((event) => new Date(event.endAt ?? event.startAt).getTime() >= (moment?.getTime() ?? Date.now())).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] ?? null;
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  const capacity = energyPercent(energy);
  return <main className="today-scene today-scene--home">
    <TodayPathNav view="home" />
    <header className="today-hero today-home__hero">
      <h1>{greetingFor(moment)},<br/><em>{firstName}.</em></h1>
      <div className="today-rule"><span/><Sparkles/><span/></div>
      <p>{data.dashboard.greeting.message || 'Your day is lighter than it looks.'}</p>
      <time>{formatDate(moment)}</time>
    </header>
    <div className="today-home__grid">
      <GlassPanel className="today-home__priorities"><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} showActions /></GlassPanel>
      <GlassPanel className="today-home__event"><p className="today-eyebrow">Next event</p>{nextEvent ? <Link href="/calendar"><CalendarDays/><span><strong>{nextEvent.title}</strong><small>{formatTime(nextEvent.startAt)}{nextEvent.endAt ? ` · ${formatTime(nextEvent.endAt)}` : ''}</small></span></Link> : <Link href="/calendar"><CalendarDays/><span><strong>Open time</strong><small>Your calendar has room</small></span></Link>}</GlassPanel>
      <GlassPanel className="today-home__capacity"><p className="today-eyebrow">Current capacity</p><strong>{capacity === null ? 'Check in' : `${capacity}%`}</strong><p>{capacity === null ? 'Log your energy so Glow can adapt the day.' : capacity < 50 ? 'Glow will keep the day intentionally light.' : 'You have room for what matters most.'}</p><Link href="/wellness">View capacity factors <ArrowRight/></Link></GlassPanel>
    </div>
    <div className="today-actions"><AskGlowButton large/><AskGlowButton/></div>
  </main>;
}

function MorningBrief({ data, moment }: { data: TodaySceneData; moment: Date | null }) {
  const nextEvent = [...data.dashboard.todaySchedule.events].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())[0] ?? null;
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  const intentions = [
    { title: 'Clarity', icon: SunMedium, text: data.tasks.find((task) => task.status !== 'done' && task.status !== 'cancelled')?.title ?? 'Choose one clear first step.' },
    { title: 'Wellness', icon: Leaf, text: energy ? `Energy is ${energyLabel(energy)}. Plan from what is true.` : 'Check in with your body and energy.' },
    { title: 'Purpose', icon: Sparkles, text: data.dashboard.weekTheme.note || 'Create meaningful progress today.' },
  ];
  return <main className="today-scene today-scene--morning">
    <TodayPathNav view="morning" />
    <header className="today-hero today-morning__hero"><h1>Morning<br/>Brief</h1><div className="today-rule"><span/><Sparkles/><span/></div><time>{formatDate(moment)}</time><p>A new day of becoming.<br/>Move with clarity, grace, and purpose.</p></header>
    <section className="morning-intentions">{intentions.map(({ title, icon: Icon, text }) => <GlassPanel key={title}><Icon/><h2>{title}</h2><p>{text}</p></GlassPanel>)}</section>
    <div className="morning-brief__grid">
      <GlassPanel><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} showActions /></GlassPanel>
      <GlassPanel><p className="today-eyebrow">First appointment</p>{nextEvent ? <Link className="today-event-row" href="/calendar"><CalendarDays/><span><strong>{formatTime(nextEvent.startAt)}{nextEvent.endAt ? ` – ${formatTime(nextEvent.endAt)}` : ''}</strong><small>{nextEvent.title}{nextEvent.location ? ` · ${nextEvent.location}` : ''}</small></span></Link> : <Link className="today-event-row" href="/calendar"><CalendarDays/><span><strong>Open morning</strong><small>Add an appointment</small></span></Link>}</GlassPanel>
      <GlassPanel><p className="today-eyebrow">Current energy</p><div className="today-energy"><span>{energy ? 'Logged' : 'Not logged'}</span><strong>{energyPercent(energy) === null ? '—' : `${energyPercent(energy)}%`}</strong><i style={{ '--energy': `${energyPercent(energy) ?? 0}%` } as React.CSSProperties}/></div><Link className="today-inline-link" href="/wellness">{energy ? 'You are aligned with what you logged.' : 'Complete your wellness check-in'} <ArrowRight/></Link></GlassPanel>
      <GlassPanel><p className="today-eyebrow">Today&apos;s recommendation</p><Link className="today-recommendation" href="/brain"><SunMedium/><span>{data.dashboard.greeting.title}</span><ChevronRight/></Link></GlassPanel>
    </div>
    <div className="today-actions"><Link href="/today/flow" className="today-primary-action"><SunMedium/><span>Begin Morning</span><ChevronRight/></Link><AskGlowButton/></div>
  </main>;
}

function DayFlow({ data, moment }: { data: TodaySceneData; moment: Date | null }) {
  const [active, setActive] = useState<'morning' | 'afternoon' | 'evening' | 'night'>(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night';
  });
  const segments = [
    { id: 'morning' as const, icon: SunMedium, title: 'Morning', detail: 'Hydrate · medication · sunlight · assess energy', href: '/routines' },
    { id: 'afternoon' as const, icon: Clock3, title: 'Afternoon', detail: 'Priority block · meal · movement', href: '/planning' },
    { id: 'evening' as const, icon: SunMedium, title: 'Evening', detail: 'Reset space · care routine · tomorrow setup', href: '/beauty' },
    { id: 'night' as const, icon: MoonStar, title: 'Night', detail: 'Low stimulation · medication check · sleep wind-down', href: '/wellness' },
  ];
  const selected = segments.find((segment) => segment.id === active)!;
  const nextEvent = data.dashboard.todaySchedule.events[0] ?? null;
  const energy = data.dashboard.wellnessToday.entry?.energy ?? null;
  return <main className="today-scene today-scene--flow">
    <TodayPathNav view="flow" />
    <header className="today-hero today-flow__hero"><h1>Today</h1><div className="today-rule"><span/><Sparkles/><span/></div><time>{formatDate(moment)}</time></header>
    <section className="day-flow__timeline" aria-label="Day flow">{segments.map(({ id, icon: Icon, title, detail }) => <button type="button" key={id} onClick={() => setActive(id)} className={active === id ? 'is-active' : ''}><span><Icon/></span><span><strong>{title}</strong><small>{detail}</small></span></button>)}</section>
    <GlassPanel className="day-flow__active"><p className="today-eyebrow">{selected.title} · now</p><h2>{selected.detail}</h2><Link href={selected.href}>Open this part of your day <ArrowRight/></Link></GlassPanel>
    <aside className="day-flow__facts">
      <GlassPanel><p className="today-eyebrow">Today&apos;s priorities</p><PriorityList data={data} showActions /></GlassPanel>
      <GlassPanel><p className="today-eyebrow">Next appointment</p><Link className="today-event-row" href="/calendar"><CalendarDays/><span><strong>{nextEvent ? formatTime(nextEvent.startAt) : 'Open time'}</strong><small>{nextEvent?.title ?? 'No event is constraining your day'}</small></span></Link></GlassPanel>
      <GlassPanel><p className="today-eyebrow">Current energy</p><div className="today-energy"><span>{energy ? 'From your check-in' : 'Check-in needed'}</span><strong>{energyPercent(energy) === null ? '—' : `${energyPercent(energy)}%`}</strong><i style={{ '--energy': `${energyPercent(energy) ?? 0}%` } as React.CSSProperties}/></div></GlassPanel>
      <GlassPanel><p className="today-eyebrow">Today&apos;s recommendation</p><Link className="today-recommendation" href="/brain"><Leaf/><span>{data.dashboard.greeting.title}</span><ChevronRight/></Link></GlassPanel>
    </aside>
    <div className="today-actions"><AskGlowButton large/></div>
  </main>;
}

function EveningDebrief({ data }: { data: TodaySceneData }) {
  const completed = data.tasks.filter((task) => task.status === 'done').slice(0, 3);
  const open = data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled').slice(0, 3);
  return <main className="today-scene today-scene--evening">
    <TodayPathNav view="evening" />
    <header className="today-hero today-evening__hero"><h1>Evening<br/>Debrief</h1><div className="today-rule"><span/><Sparkles/><span/></div><p>What do I carry forward?</p></header>
    <div className="evening-grid">
      <GlassPanel><p className="today-eyebrow">Today</p><p className="evening-summary"><Check/> {completed.length} priorities completed</p><p className="evening-summary"><Clock3/> {open.length} priorities still open</p></GlassPanel>
      <GlassPanel><p className="today-eyebrow">Completed</p>{completed.length ? completed.map((task) => <p key={task.id} className="evening-summary"><Check/> {task.title}</p>) : <Link className="today-empty-link" href="/tasks">Nothing is marked complete yet <ArrowRight/></Link>}</GlassPanel>
      <GlassPanel><p className="today-eyebrow">Move to tomorrow</p>{open.length ? open.map((task) => <form key={task.id} action={moveTodayTaskToTomorrowAction.bind(null, task.id)}><button type="submit" className="evening-move"><ArrowRight/> {task.title}</button></form>) : <p className="evening-summary"><Check/> No carryover needed</p>}</GlassPanel>
    </div>
    <form action={finishDayFormAction} className="evening-reflection">
      <GlassPanel><label><span className="today-eyebrow">What I noticed</span><textarea name="memoryNote" defaultValue={data.review?.memoryNote ?? ''} placeholder="Energy, patterns, or something worth remembering…"/></label></GlassPanel>
      <GlassPanel><label><span className="today-eyebrow">Gratitude</span><textarea name="completedSummary" defaultValue={data.review?.completedSummary ?? ''} placeholder="One thing that felt good today…"/></label></GlassPanel>
      <GlassPanel className="tomorrow-first"><label><span className="today-eyebrow">Tomorrow&apos;s first step</span><input name="tomorrow1" defaultValue={data.review?.tomorrowTopThree?.[0] ?? ''} placeholder="Choose one gentle first step"/></label><input type="hidden" name="movedSummary" value={open.map((task) => task.title).join(', ')}/><input type="hidden" name="energy" value={energyReviewScore(data.dashboard.wellnessToday.entry?.energy)}/><input type="hidden" name="mood" value={data.dashboard.wellnessToday.entry?.mood ?? ''}/></GlassPanel>
      <button type="submit" className="today-primary-action"><Circle/><span>Close the day</span><Check/></button><Link href="/today" className="today-secondary-action"><Pencil/> Edit full reflection</Link>
    </form>
    <div className="today-actions"><AskGlowButton/></div>
  </main>;
}

export function TodayExperience({ view, data, userName }: { view: TodaySceneView; data: TodaySceneData; userName?: string | null }) {
  const moment = useLiveMoment();
  const firstName = useMemo(() => userName?.trim().split(/\s+/)[0] || 'Tatiyana', [userName]);
  if (view === 'morning') return <MorningBrief data={data} moment={moment}/>;
  if (view === 'flow') return <DayFlow data={data} moment={moment}/>;
  if (view === 'evening') return <EveningDebrief data={data}/>;
  return <TodayHome data={data} firstName={firstName} moment={moment}/>;
}
