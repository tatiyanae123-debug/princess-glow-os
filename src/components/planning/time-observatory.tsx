'use client';

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  FolderKanban,
  ListTodo,
  RefreshCw,
  RotateCcw,
  RotateCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';
import styles from './time-observatory.module.css';

type Horizon = 'today' | 'week' | 'twoWeeks' | 'month' | 'threeMonths';
type Mode = 'plan' | 'focus' | 'build' | 'reflect';

type Range = {
  start: Date;
  end: Date;
  title: string;
  detail: string;
  short: string;
  zones: [[string, string], [string, string], [string, string]];
};

type OrbitItem = {
  id: string;
  kind: 'event' | 'task' | 'goal' | 'cluster';
  title: string;
  meta: string;
  detail: string;
  href?: string;
  external?: boolean;
  drill?: Horizon;
  tone: 'violet' | 'blue' | 'pearl' | 'mint' | 'blush';
};

const HORIZONS: Array<{ id: Horizon; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'twoWeeks', label: '2 Weeks' },
  { id: 'month', label: 'Month' },
  { id: 'threeMonths', label: '3 Months' },
];
const TONES: OrbitItem['tone'][] = ['violet', 'blue', 'pearl', 'mint', 'blush'];

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}
function shortDate(value: string | Date) {
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function shortTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function monthName(value: Date, short = false) {
  return value.toLocaleDateString('en-US', { month: short ? 'short' : 'long' });
}

function rangeFor(horizon: Horizon): Range {
  const today = startOfDay();
  if (horizon === 'today') {
    return {
      start: today,
      end: addDays(today, 1),
      title: 'TODAY',
      detail: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'long' }),
      short: 'Today',
      zones: [['LATER', 'Later today'], ['NEXT', 'Coming up'], ['NEAR', 'Closest commitments']],
    };
  }
  if (horizon === 'week') {
    const end = addDays(today, 7);
    return {
      start: today,
      end,
      title: 'THIS WEEK',
      detail: `${shortDate(today)} – ${shortDate(addDays(end, -1))}`,
      short: 'This week',
      zones: [['LATER', 'End of week'], ['NEXT', 'Later this week'], ['NEAR', 'Next few days']],
    };
  }
  if (horizon === 'twoWeeks') {
    const end = addDays(today, 14);
    return {
      start: today,
      end,
      title: 'NEXT 2 WEEKS',
      detail: `${shortDate(today)} – ${shortDate(addDays(end, -1))}`,
      short: 'Next 2 weeks',
      zones: [['BEYOND', 'After two weeks'], ['NEXT WEEK', `${shortDate(addDays(today, 7))} – ${shortDate(addDays(today, 13))}`], ['THIS WEEK', `${shortDate(today)} – ${shortDate(addDays(today, 6))}`]],
    };
  }
  if (horizon === 'month') {
    const start = startOfMonth(today);
    return {
      start,
      end: addMonths(start, 1),
      title: 'THIS MONTH',
      detail: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      short: monthName(today),
      zones: [['LATE MONTH', 'Final third'], ['MID MONTH', 'Middle stretch'], ['EARLY MONTH', 'Opening weeks']],
    };
  }
  const start = startOfMonth(today);
  const third = addMonths(start, 2);
  return {
    start,
    end: addMonths(start, 3),
    title: 'NEXT 3 MONTHS',
    detail: `${monthName(start, true)} – ${monthName(third, true)} ${third.getFullYear()}`,
    short: '3 months',
    zones: [['THIRD MONTH', monthName(third)], ['NEXT MONTH', monthName(addMonths(start, 1))], ['THIS MONTH', monthName(start)]],
  };
}

function inRange(value: string | null, range: Range) {
  if (!value) return false;
  const d = new Date(value);
  return d >= range.start && d < range.end;
}
function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
function eventDuration(event: PersonalEvent) {
  if (event.allDay) return 'All day';
  if (!event.endAt) return shortTime(event.startAt);
  const minutes = Math.max(0, Math.round((new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) / 60000));
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
}
function isMeeting(event: PersonalEvent) {
  return /(meeting|call|sync|review|interview|appointment|session|1:1|one-on-one)/i.test(event.title);
}
function overlaps(a: PersonalEvent, b: PersonalEvent) {
  if (a.allDay || b.allDay || !a.endAt || !b.endAt) return false;
  return new Date(a.startAt).getTime() < new Date(b.endAt).getTime() && new Date(b.startAt).getTime() < new Date(a.endAt).getTime();
}
function conflictsFor(events: PersonalEvent[]) {
  const out: Array<{ a: PersonalEvent; b: PersonalEvent }> = [];
  for (let i = 0; i < events.length; i += 1) {
    for (let j = i + 1; j < events.length; j += 1) {
      if (overlaps(events[i], events[j])) out.push({ a: events[i], b: events[j] });
    }
  }
  return out;
}
function openMinutes(range: Range, events: PersonalEvent[]) {
  let total = 0;
  for (let d = new Date(range.start); d < range.end; d = addDays(d, 1)) {
    const start = new Date(d); start.setHours(8, 0, 0, 0);
    const end = new Date(d); end.setHours(20, 0, 0, 0);
    const timed = events
      .filter((event) => !event.allDay && dayKey(new Date(event.startAt)) === dayKey(d))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    let cursor = start.getTime();
    for (const event of timed) {
      const s = Math.max(cursor, new Date(event.startAt).getTime());
      const e = Math.min(end.getTime(), event.endAt ? new Date(event.endAt).getTime() : s + 30 * 60000);
      if (s > cursor) total += Math.round((s - cursor) / 60000);
      cursor = Math.max(cursor, e);
    }
    if (cursor < end.getTime()) total += Math.round((end.getTime() - cursor) / 60000);
  }
  return Math.max(0, total);
}
function seriesPoints(events: PersonalEvent[], tasks: PersonalTask[], range: Range) {
  const buckets = 7;
  const span = Math.max(1, range.end.getTime() - range.start.getTime());
  const load = Array.from({ length: buckets }, () => 0);
  for (const event of events) {
    const t = new Date(event.startAt).getTime();
    const i = Math.min(buckets - 1, Math.max(0, Math.floor(((t - range.start.getTime()) / span) * buckets)));
    load[i] += 2;
  }
  for (const task of tasks) {
    if (!task.dueDate) continue;
    const t = new Date(task.dueDate).getTime();
    const i = Math.min(buckets - 1, Math.max(0, Math.floor(((t - range.start.getTime()) / span) * buckets)));
    load[i] += 1;
  }
  const max = Math.max(1, ...load);
  return {
    points: load.map((value, index) => `${12 + index * 48},${69 - (value / max) * 50}`).join(' '),
    open: load.map((value, index) => `${12 + index * 48},${20 + (value / max) * 42}`).join(' '),
  };
}
function EmptyOrbit({ detail }: { detail: string }) {
  return <div className={styles.emptyOrbit}><Sparkles size={13} /><span>{detail}</span></div>;
}

export function TimeObservatory() {
  const personal = usePersonalContext();
  const [horizon, setHorizon] = useState<Horizon>('today');
  const [mode, setMode] = useState<Mode>('plan');
  const [askOpen, setAskOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [history, setHistory] = useState<Horizon[]>([]);
  const [future, setFuture] = useState<Horizon[]>([]);
  const navTimer = useRef<number | null>(null);
  const data = personal.status === 'ready' ? personal.data : null;
  const range = useMemo(() => rangeFor(horizon), [horizon]);

  useEffect(() => {
    const clear = () => { if (navTimer.current !== null) window.clearTimeout(navTimer.current); };
    const schedule = () => { clear(); navTimer.current = window.setTimeout(() => setNavVisible(false), 2200); };
    const reveal = () => { setNavVisible(true); schedule(); };
    const pointer = (event: PointerEvent) => { if (event.clientY < 74) reveal(); };
    const touch = (event: TouchEvent) => { const p = event.touches[0]; if (p && p.clientY < 74) reveal(); };
    window.addEventListener('pointermove', pointer, { passive: true });
    window.addEventListener('touchstart', touch, { passive: true });
    reveal();
    return () => {
      clear();
      window.removeEventListener('pointermove', pointer);
      window.removeEventListener('touchstart', touch);
    };
  }, []);

  const model = useMemo(() => {
    if (!data) return null;
    const events = data.events.filter((event) => {
      const d = new Date(event.startAt);
      return d >= range.start && d < range.end;
    });
    const openTasks = data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
    const dueTasks = openTasks.filter((task) => inRange(task.dueDate, range));
    const goals = data.goals.filter((goal) => goal.targetDate && inRange(goal.targetDate, range));

    const eventItem = (event: PersonalEvent, index: number): OrbitItem => ({
      id: `event-${event.source}-${event.id}`,
      kind: 'event', title: event.title,
      meta: event.allDay ? shortDate(event.startAt) : `${shortDate(event.startAt)} · ${shortTime(event.startAt)}`,
      detail: eventDuration(event), href: event.htmlLink || '/calendar', external: Boolean(event.htmlLink), tone: TONES[index % TONES.length],
    });
    const taskItem = (task: PersonalTask, index: number): OrbitItem => ({
      id: `task-${task.id}`, kind: 'task', title: task.title,
      meta: task.dueDate ? `Due ${shortDate(task.dueDate)}` : `${task.priority} priority`,
      detail: task.status === 'in_progress' ? 'In progress' : 'Open', href: '/tasks', tone: TONES[(index + 1) % TONES.length],
    });
    const goalItem = (goal: (typeof data.goals)[number], index: number): OrbitItem => ({
      id: `goal-${goal.id}`, kind: 'goal', title: goal.title,
      meta: goal.targetDate ? `Target ${shortDate(goal.targetDate)}` : goal.category,
      detail: `${Math.round(goal.progress)}%`, href: '/goals', tone: TONES[(index + 2) % TONES.length],
    });

    let items: OrbitItem[] = [];
    if (horizon === 'today') {
      const important = openTasks.filter((task) => task.status === 'in_progress' || task.priority === 'urgent' || task.priority === 'high' || inRange(task.dueDate, range));
      items = [...events.slice(0, 6).map(eventItem), ...important.slice(0, 3).map(taskItem)].slice(0, 8);
    } else if (horizon === 'week') {
      const clusters: OrbitItem[] = [];
      for (let i = 0; i < 7; i += 1) {
        const d = addDays(range.start, i);
        const e = events.filter((event) => dayKey(new Date(event.startAt)) === dayKey(d));
        const t = dueTasks.filter((task) => task.dueDate && dayKey(new Date(task.dueDate)) === dayKey(d));
        const count = e.length + t.length;
        if (!count) continue;
        clusters.push({ id: `day-${i}`, kind: 'cluster', title: d.toLocaleDateString('en-US', { weekday: 'long' }), meta: `${shortDate(d)} · ${count} item${count === 1 ? '' : 's'}`, detail: e[0]?.title ?? t[0]?.title ?? '', drill: 'today', tone: TONES[i % TONES.length] });
      }
      items = clusters.slice(0, 8);
    } else if (horizon === 'twoWeeks') {
      const split = addDays(range.start, 7);
      const weekOneEvents = events.filter((e) => new Date(e.startAt) < split);
      const weekTwoEvents = events.filter((e) => new Date(e.startAt) >= split);
      const weekOneTasks = dueTasks.filter((t) => t.dueDate && new Date(t.dueDate) < split);
      const weekTwoTasks = dueTasks.filter((t) => t.dueDate && new Date(t.dueDate) >= split);
      const clusters: OrbitItem[] = [
        { id: 'this-week', kind: 'cluster', title: 'This week', meta: `${weekOneEvents.length + weekOneTasks.length} connected items`, detail: weekOneEvents[0]?.title ?? weekOneTasks[0]?.title ?? 'Open horizon', drill: 'week', tone: 'violet' },
        { id: 'next-week', kind: 'cluster', title: 'Next week', meta: `${weekTwoEvents.length + weekTwoTasks.length} connected items`, detail: weekTwoEvents[0]?.title ?? weekTwoTasks[0]?.title ?? 'Open horizon', drill: 'week', tone: 'blue' },
      ];
      items = [...clusters, ...events.slice(0, 4).map(eventItem), ...dueTasks.slice(0, 2).map(taskItem)].slice(0, 8);
    } else if (horizon === 'month') {
      const clusters: OrbitItem[] = [];
      for (let i = 0; i < 5; i += 1) {
        const a = addDays(range.start, i * 7);
        if (a >= range.end) break;
        const b = new Date(Math.min(addDays(a, 7).getTime(), range.end.getTime()));
        const e = events.filter((event) => new Date(event.startAt) >= a && new Date(event.startAt) < b);
        const t = dueTasks.filter((task) => task.dueDate && new Date(task.dueDate) >= a && new Date(task.dueDate) < b);
        const count = e.length + t.length;
        if (!count) continue;
        clusters.push({ id: `month-week-${i}`, kind: 'cluster', title: `Week ${i + 1}`, meta: `${shortDate(a)} – ${shortDate(addDays(b, -1))}`, detail: `${count} connected item${count === 1 ? '' : 's'}`, drill: 'week', tone: TONES[i % TONES.length] });
      }
      items = [...clusters, ...goals.slice(0, 2).map(goalItem), ...dueTasks.filter((t) => t.priority === 'high' || t.priority === 'urgent').slice(0, 2).map(taskItem)].slice(0, 8);
    } else {
      const clusters: OrbitItem[] = [];
      for (let i = 0; i < 3; i += 1) {
        const a = addMonths(range.start, i);
        const b = addMonths(range.start, i + 1);
        const e = events.filter((event) => new Date(event.startAt) >= a && new Date(event.startAt) < b);
        const t = dueTasks.filter((task) => task.dueDate && new Date(task.dueDate) >= a && new Date(task.dueDate) < b);
        const g = goals.filter((goal) => goal.targetDate && new Date(goal.targetDate) >= a && new Date(goal.targetDate) < b);
        clusters.push({ id: `month-${i}`, kind: 'cluster', title: monthName(a), meta: `${e.length + t.length + g.length} connected milestones`, detail: g[0]?.title ?? e[0]?.title ?? t[0]?.title ?? 'Open horizon', drill: 'month', tone: TONES[i] });
      }
      items = [...clusters, ...goals.slice(0, 3).map(goalItem), ...dueTasks.filter((t) => t.priority === 'high' || t.priority === 'urgent').slice(0, 2).map(taskItem)].slice(0, 8);
    }

    const conflicts = conflictsFor(events);
    const meetings = events.filter(isMeeting).length;
    const focus = openTasks.filter((t) => t.status === 'in_progress' || t.priority === 'high' || t.priority === 'urgent').length;
    const admin = Math.max(0, events.length - meetings);
    const total = Math.max(1, focus + meetings + admin);
    const focusPct = Math.round((focus / total) * 100);
    const meetingPct = Math.round((meetings / total) * 100);
    const adminPct = Math.max(0, 100 - focusPct - meetingPct);
    const days = Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86400000));
    const density = (events.length + dueTasks.length) / days;
    const score = Math.max(35, Math.min(100, Math.round(96 - conflicts.length * 11 - Math.max(0, density - 3) * 5)));
    const nextEvent = events.find((event) => new Date(event.startAt).getTime() >= Date.now()) ?? null;
    const prepTasks = nextEvent ? openTasks.filter((task) => task.dueDate && new Date(task.dueDate).getTime() <= new Date(nextEvent.startAt).getTime()).slice(0, 2) : [];
    return { events, dueTasks, goals, items, conflicts, focusPct, meetingPct, adminPct, score, nextEvent, prepTasks, openMinutes: openMinutes(range, events), chart: seriesPoints(events, dueTasks, range) };
  }, [data, horizon, range]);

  function selectHorizon(next: Horizon) {
    if (next === horizon) return;
    setHistory((h) => [...h, horizon].slice(-10));
    setFuture([]);
    setHorizon(next);
  }
  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [horizon, ...f].slice(0, 10));
    setHorizon(previous);
  }
  function redo() {
    const next = future[0];
    if (!next) return;
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, horizon].slice(-10));
    setHorizon(next);
  }
  function selectMode(next: Mode) {
    setMode(next);
    if (next === 'focus') window.location.assign('/today?room=focus');
    if (next === 'build') window.location.assign('/tasks');
    if (next === 'reflect') window.location.assign('/notes');
  }
  function drillCenter() {
    const order: Horizon[] = ['today', 'week', 'twoWeeks', 'month', 'threeMonths'];
    const i = order.indexOf(horizon);
    if (i <= 0) window.location.assign('/today?room=what-now');
    else selectHorizon(order[i - 1]);
  }
  function step(direction: -1 | 1) {
    const order: Horizon[] = ['today', 'week', 'twoWeeks', 'month', 'threeMonths'];
    const i = order.indexOf(horizon);
    selectHorizon(order[Math.max(0, Math.min(order.length - 1, i + direction))]);
  }

  const openHours = model ? Math.floor(model.openMinutes / 60) : 0;
  const openRemainder = model ? model.openMinutes % 60 : 0;

  return (
    <main className={styles.world} data-horizon={horizon}>
      <div className={styles.causticOne} aria-hidden="true" />
      <div className={styles.causticTwo} aria-hidden="true" />
      <div className={styles.causticThree} aria-hidden="true" />
      <div className={styles.revealZone} onPointerEnter={() => setNavVisible(true)} aria-hidden="true" />

      <section className={styles.frame}>
        <header className={styles.masthead}>
          <div className={styles.identity}>
            <div className={styles.microNav}><a href="/home">Glow OS</a><span>·</span><span>Plan</span></div>
            <h1>PLAN · THE TIME OBSERVATORY</h1>
            <p>See the arc. Shape the day. Align the becoming.</p>
          </div>
          <nav className={`${styles.modeRail} ${navVisible || askOpen ? styles.visible : styles.receded}`} aria-label="Plan modes">
            {(['plan', 'focus', 'build', 'reflect'] as Mode[]).map((item) => <button key={item} type="button" className={mode === item ? styles.modeActive : ''} onClick={() => selectMode(item)}>{item}</button>)}
          </nav>
          <button type="button" className={`${styles.askGlow} ${navVisible || askOpen ? styles.visible : styles.receded}`} onClick={() => setAskOpen((v) => !v)} aria-expanded={askOpen}>
            <span className={styles.askPearl} aria-hidden="true"><i /><b /></span><span>Ask Glow</span>
          </button>
        </header>

        <aside className={styles.instrumentRail} aria-label="Plan instruments">
          <a href="/calendar" className={styles.railActive}><CalendarDays /><span>Calendar</span></a>
          <a href="/tasks"><CheckCircle2 /><span>Tasks</span></a>
          <a href="/tasks"><Bell /><span>Reminders</span></a>
          <a href="/goals"><Target /><span>Goals</span></a>
          <a href="/tasks"><FolderKanban /><span>Projects</span></a>
          <a href="/routines"><RefreshCw /><span>Routines</span></a>
          <a href="/habits"><Sparkles /><span>Habits</span></a>
        </aside>

        <section className={styles.observatory}>
          <div className={styles.zoneA}><span>{range.zones[0][0]}</span><small>{range.zones[0][1]}</small></div>
          <div className={styles.zoneB}><span>{range.zones[1][0]}</span><small>{range.zones[1][1]}</small></div>
          <div className={styles.zoneC}><span>{range.zones[2][0]}</span><small>{range.zones[2][1]}</small></div>
          <div className={`${styles.orbit} ${styles.orbitFar}`} />
          <div className={`${styles.orbit} ${styles.orbitOuter}`} />
          <div className={`${styles.orbit} ${styles.orbitSecond}`} />
          <div className={`${styles.orbit} ${styles.orbitMid}`} />
          <div className={`${styles.orbit} ${styles.orbitInner}`} />
          <div className={`${styles.orbit} ${styles.orbitCore}`} />
          <div className={`${styles.track} ${styles.trackA}`} />
          <div className={`${styles.track} ${styles.trackB}`} />
          <div className={`${styles.track} ${styles.trackC}`} />
          <div className={`${styles.track} ${styles.trackD}`} />
          <div className={styles.depthHaze} />

          <button type="button" className={`${styles.timeCore} ${styles[`core_${horizon}`]}`} onClick={drillCenter} aria-label={`Open ${range.short}`}>
            <span className={styles.coreGround} aria-hidden="true" />
            <span className={styles.coreRear} aria-hidden="true" />
            <span className={styles.coreRearTwo} aria-hidden="true" />
            <span className={styles.coreShell} aria-hidden="true" />
            <span className={styles.coreEdgeA} aria-hidden="true" />
            <span className={styles.coreEdgeB} aria-hidden="true" />
            <span className={styles.coreDiffusion} aria-hidden="true" />
            <span className={styles.corePrismA} aria-hidden="true" />
            <span className={styles.corePrismB} aria-hidden="true" />
            <span className={styles.corePrismC} aria-hidden="true" />
            <span className={styles.coreSpecularA} aria-hidden="true" />
            <span className={styles.coreSpecularB} aria-hidden="true" />
            <span className={styles.coreText}><strong>{range.title}</strong><small>{range.detail}</small></span>
          </button>

          {personal.status === 'loading' ? <EmptyOrbit detail="Reading your connected time…" /> : null}
          {personal.status === 'error' ? <EmptyOrbit detail="Your Plan data is unavailable. Glow will not insert sample commitments." /> : null}
          {model && model.items.length === 0 ? <EmptyOrbit detail={`No real connected activity was found for ${range.short.toLowerCase()}.`} /> : null}

          {model?.items.map((item, index) => {
            const className = `${styles.orbitCard} ${styles[`slot${index + 1}`]} ${styles[`tone_${item.tone}`]}`;
            const content = <>
              <span className={styles.cardGlyph}>{item.kind === 'event' ? <CalendarDays /> : item.kind === 'task' ? <CheckCircle2 /> : item.kind === 'goal' ? <Target /> : <CircleDot />}</span>
              <span className={styles.cardText}><strong>{item.title}</strong><small>{item.meta}</small></span>
              <em>{item.detail}</em>
            </>;
            if (item.drill) return <button key={item.id} type="button" className={className} onClick={() => selectHorizon(item.drill!)}>{content}</button>;
            return <a key={item.id} href={item.href || '#'} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className={className}>{content}</a>;
          })}
          <div className={styles.nodes} aria-hidden="true">{Array.from({ length: 58 }).map((_, i) => <i key={i} />)}</div>
        </section>

        <aside className={styles.analysisPanel}>
          <span className={styles.eyebrow}>Time analysis</span>
          {[
            ['Focus', model?.focusPct ?? 0, 'focus'],
            ['Meetings', model?.meetingPct ?? 0, 'meetings'],
            ['Admin', model?.adminPct ?? 0, 'admin'],
          ].map(([label, value, key]) => <div className={styles.analysisRow} key={String(key)}>
            <span><i data-dot={key} />{label}</span>
            <b style={{ '--meter': `${value}%` } as CSSProperties} />
            <em>{value}%</em>
          </div>)}
          <div className={styles.alertBlock}>
            <a href="#conflicts"><span><CircleDot />{model?.conflicts.length ?? 0} conflicts</span><em>Resolve <ChevronRight /></em></a>
            <a href="/tasks"><span><Clock3 />{model?.dueTasks.length ?? 0} deadlines</span><em>Prepare <ChevronRight /></em></a>
          </div>
          <div className={styles.scoreBlock}><span>{model?.score ?? '—'}</span><div><strong>Schedule score</strong><small>{range.short} · connected load</small></div></div>
        </aside>

        <section className={styles.intelligenceBand}>
          <article className={styles.intelCard}>
            <span className={styles.eyebrow}>Schedule comparison</span>
            <div className={styles.legend}><span><i />You</span><span><i />Open</span></div>
            <svg className={styles.chart} viewBox="0 0 310 82" aria-label="Connected schedule load"><polyline points={model?.chart.points ?? ''} /><polyline points={model?.chart.open ?? ''} /><line x1="10" x2="300" y1="74" y2="74" /></svg>
            <div className={styles.axis}><span>Near</span><span>Middle</span><span>Later</span></div>
          </article>
          <article className={styles.intelCard} id="conflicts">
            <span className={styles.eyebrow}>Conflicts</span>
            {model?.conflicts.length ? model.conflicts.slice(0, 2).map((conflict, index) => <div className={styles.conflict} key={`${conflict.a.id}-${conflict.b.id}`}><i data-index={index} /><span><strong>{conflict.a.title}</strong><small>{shortDate(conflict.a.startAt)} · {shortTime(conflict.a.startAt)} overlaps {conflict.b.title}</small></span></div>) : <p className={styles.quiet}>No overlapping connected events.</p>}
            <a className={styles.softButton} href="/calendar">Review</a>
          </article>
          <article className={styles.intelCard}>
            <span className={styles.eyebrow}>Preparation</span>
            {model?.nextEvent ? <>
              <strong className={styles.prepTitle}>{model.nextEvent.title} · {shortDate(model.nextEvent.startAt)}</strong>
              <small className={styles.prepMeta}>{model.prepTasks.length} connected task{model.prepTasks.length === 1 ? '' : 's'} due before this event</small>
              {model.prepTasks.map((task) => <span className={styles.prepItem} key={task.id}><i />{task.title}</span>)}
              <a className={styles.softButton} href={model.nextEvent.htmlLink || '/calendar'} target={model.nextEvent.htmlLink ? '_blank' : undefined} rel={model.nextEvent.htmlLink ? 'noreferrer' : undefined}>Open prep <ChevronRight /></a>
            </> : <p className={styles.quiet}>No connected event currently needs preparation.</p>}
          </article>
          <article className={styles.intelCard}>
            <span className={styles.eyebrow}>Open time</span>
            <div className={styles.openLine}><span>{range.short}</span><strong>{openHours}h {openRemainder ? `${openRemainder}m` : ''}</strong></div>
            <div className={styles.openLine}><span>Connected events</span><strong>{model?.events.length ?? 0}</strong></div>
            <a href="/calendar" className={styles.findTime}><Sparkles />Find best time</a>
          </article>
        </section>

        <footer className={styles.footerBar}>
          <div className={styles.horizonRail} role="tablist" aria-label="Planning horizon">
            {HORIZONS.map((item) => <button key={item.id} type="button" role="tab" aria-selected={horizon === item.id} className={horizon === item.id ? styles.horizonActive : ''} onClick={() => selectHorizon(item.id)}>{item.label}</button>)}
          </div>
          <div className={styles.stepper}><button type="button" onClick={() => step(-1)}><ChevronLeft /></button><span>{range.short}</span><button type="button" onClick={() => step(1)}><ChevronRight /></button><a href="/calendar"><CalendarDays /></a></div>
          <div className={styles.history}><button type="button" disabled={!history.length} onClick={undo}><RotateCcw />Undo</button><button type="button" disabled={!future.length} onClick={redo}><RotateCw />Redo</button></div>
          <span className={styles.receipt}>Saved from live data <CheckCircle2 /></span>
        </footer>
      </section>

      {askOpen ? <aside className={styles.askPanel} role="dialog" aria-label="Ask Glow">
        <div><span className={styles.askPearl}><i /><b /></span><div><strong>Glow</strong><small>Plan with your connected context.</small></div><button type="button" onClick={() => setAskOpen(false)}>×</button></div>
        <p>Ask Glow to interpret your schedule, find open time, prepare for what is next, or move between time horizons. Missing data stays missing rather than being invented.</p>
        <a href="/today?room=replan"><ListTodo />Replan today</a><a href="/calendar"><CalendarDays />Open calendar</a>
      </aside> : null}
    </main>
  );
}
