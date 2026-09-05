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
import styles from './glow-plan-world.module.css';

type Horizon = 'today' | 'week' | 'twoWeeks' | 'month' | 'threeMonths';
type ObservatoryMode = 'plan' | 'focus' | 'build' | 'reflect';

type OrbitItem = {
  id: string;
  kind: 'event' | 'task' | 'goal' | 'cluster';
  title: string;
  meta: string;
  detail: string;
  href?: string;
  external?: boolean;
  drillTo?: Horizon;
  tone: 'violet' | 'blue' | 'pearl' | 'mint' | 'blush';
};

type HorizonRange = {
  start: Date;
  end: Date;
  centerTitle: string;
  centerDetail: string;
  shortLabel: string;
  zoneA: [string, string];
  zoneB: [string, string];
  zoneC: [string, string];
};

const horizons: Array<{ id: Horizon; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'twoWeeks', label: '2 Weeks' },
  { id: 'month', label: 'Month' },
  { id: 'threeMonths', label: '3 Months' },
];

const orbitSlots = ['slotA', 'slotB', 'slotC', 'slotD', 'slotE', 'slotF', 'slotG', 'slotH'] as const;
const toneCycle: OrbitItem['tone'][] = ['violet', 'blue', 'pearl', 'mint', 'blush'];

function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function startOfMonth(date = new Date()) {
  const result = new Date(date.getFullYear(), date.getMonth(), 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function formatShortDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function monthName(value: Date, short = false) {
  return value.toLocaleDateString('en-US', { month: short ? 'short' : 'long' });
}

function rangeForHorizon(horizon: Horizon): HorizonRange {
  const today = startOfDay();

  if (horizon === 'today') {
    return {
      start: today,
      end: addDays(today, 1),
      centerTitle: 'TODAY',
      centerDetail: today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
      shortLabel: 'Today',
      zoneA: ['LATER', 'Later today'],
      zoneB: ['NEXT', 'Coming up'],
      zoneC: ['NEAR', 'Closest commitments'],
    };
  }

  if (horizon === 'week') {
    const end = addDays(today, 7);
    return {
      start: today,
      end,
      centerTitle: 'THIS WEEK',
      centerDetail: `${formatShortDate(today)} – ${formatShortDate(addDays(end, -1))}`,
      shortLabel: 'This week',
      zoneA: ['LATER', 'End of the week'],
      zoneB: ['NEXT', 'Later this week'],
      zoneC: ['NEAR', 'Next few days'],
    };
  }

  if (horizon === 'twoWeeks') {
    const end = addDays(today, 14);
    return {
      start: today,
      end,
      centerTitle: 'NEXT 2 WEEKS',
      centerDetail: `${formatShortDate(today)} – ${formatShortDate(addDays(end, -1))}`,
      shortLabel: 'Next 2 weeks',
      zoneA: ['BEYOND', 'After the next 2 weeks'],
      zoneB: ['NEXT WEEK', `${formatShortDate(addDays(today, 7))} – ${formatShortDate(addDays(today, 13))}`],
      zoneC: ['THIS WEEK', `${formatShortDate(today)} – ${formatShortDate(addDays(today, 6))}`],
    };
  }

  if (horizon === 'month') {
    const start = startOfMonth(today);
    const end = addMonths(start, 1);
    return {
      start,
      end,
      centerTitle: 'THIS MONTH',
      centerDetail: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      shortLabel: monthName(today),
      zoneA: ['LATE MONTH', 'Final third'],
      zoneB: ['MID MONTH', 'Middle stretch'],
      zoneC: ['EARLY MONTH', 'Opening weeks'],
    };
  }

  const start = startOfMonth(today);
  const end = addMonths(start, 3);
  const lastMonth = addMonths(start, 2);
  return {
    start,
    end,
    centerTitle: 'NEXT 3 MONTHS',
    centerDetail: `${monthName(start, true)} – ${monthName(lastMonth, true)} ${lastMonth.getFullYear()}`,
    shortLabel: '3 months',
    zoneA: ['THIRD MONTH', monthName(lastMonth)],
    zoneB: ['NEXT MONTH', monthName(addMonths(start, 1))],
    zoneC: ['THIS MONTH', monthName(start)],
  };
}

function eventDuration(event: PersonalEvent) {
  if (event.allDay) return 'All day';
  if (!event.endAt) return formatTime(event.startAt);
  const minutes = Math.max(0, Math.round((new Date(event.endAt).getTime() - new Date(event.startAt).getTime()) / 60000));
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

function isMeeting(event: PersonalEvent) {
  return /(meeting|call|sync|review|interview|appointment|session|1:1|one-on-one)/i.test(event.title);
}

function overlaps(a: PersonalEvent, b: PersonalEvent) {
  if (a.allDay || b.allDay || !a.endAt || !b.endAt) return false;
  const aStart = new Date(a.startAt).getTime();
  const aEnd = new Date(a.endAt).getTime();
  const bStart = new Date(b.startAt).getTime();
  const bEnd = new Date(b.endAt).getTime();
  return aStart < bEnd && bStart < aEnd;
}

function buildConflicts(events: PersonalEvent[]) {
  const conflicts: Array<{ a: PersonalEvent; b: PersonalEvent }> = [];
  for (let i = 0; i < events.length; i += 1) {
    for (let j = i + 1; j < events.length; j += 1) {
      if (overlaps(events[i], events[j])) conflicts.push({ a: events[i], b: events[j] });
    }
  }
  return conflicts;
}

function inRange(value: string | null, range: HorizonRange) {
  if (!value) return false;
  const date = new Date(value);
  return date >= range.start && date < range.end;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function loadForPeriod(events: PersonalEvent[], tasks: PersonalTask[]) {
  return events.length + tasks.length;
}

function openMinutesForRange(range: HorizonRange, events: PersonalEvent[]) {
  let total = 0;
  for (let day = new Date(range.start); day < range.end; day = addDays(day, 1)) {
    const dayStart = new Date(day);
    dayStart.setHours(8, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(20, 0, 0, 0);
    const dayEvents = events
      .filter((event) => !event.allDay && dayKey(new Date(event.startAt)) === dayKey(day))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

    let cursor = dayStart.getTime();
    for (const event of dayEvents) {
      const eventStart = Math.max(dayStart.getTime(), new Date(event.startAt).getTime());
      const eventEnd = Math.min(dayEnd.getTime(), event.endAt ? new Date(event.endAt).getTime() : eventStart + 30 * 60000);
      if (eventStart > cursor) total += Math.round((eventStart - cursor) / 60000);
      cursor = Math.max(cursor, eventEnd);
    }
    if (cursor < dayEnd.getTime()) total += Math.round((dayEnd.getTime() - cursor) / 60000);
  }
  return Math.max(0, total);
}

function EmptyOrbit({ detail }: { detail: string }) {
  return (
    <div className={styles.emptyOrbit}>
      <Sparkles size={15} />
      <span>{detail}</span>
    </div>
  );
}

export function GlowPlanWorld() {
  const personal = usePersonalContext();
  const [horizon, setHorizon] = useState<Horizon>('today');
  const [mode, setMode] = useState<ObservatoryMode>('plan');
  const [askOpen, setAskOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [history, setHistory] = useState<Horizon[]>([]);
  const [future, setFuture] = useState<Horizon[]>([]);
  const navTimer = useRef<number | null>(null);

  const data = personal.status === 'ready' ? personal.data : null;
  const range = useMemo(() => rangeForHorizon(horizon), [horizon]);

  useEffect(() => {
    const clear = () => {
      if (navTimer.current !== null) window.clearTimeout(navTimer.current);
    };
    const schedule = () => {
      clear();
      navTimer.current = window.setTimeout(() => setNavVisible(false), 2200);
    };
    const reveal = () => {
      setNavVisible(true);
      schedule();
    };
    const pointer = (event: PointerEvent) => {
      if (event.clientY < 72) reveal();
    };
    const touch = (event: TouchEvent) => {
      const point = event.touches[0];
      if (point && point.clientY < 70) reveal();
    };
    window.addEventListener('pointermove', pointer, { passive: true });
    window.addEventListener('touchstart', touch, { passive: true });
    reveal();
    return () => {
      clear();
      window.removeEventListener('pointermove', pointer);
      window.removeEventListener('touchstart', touch);
    };
  }, []);

  const observatory = useMemo(() => {
    if (!data) return null;

    const now = Date.now();
    const events = data.events.filter((event) => {
      const value = new Date(event.startAt);
      return value >= range.start && value < range.end;
    });

    const openTasks = data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
    const dueTasks = openTasks.filter((task) => inRange(task.dueDate, range));
    const goals = data.goals.filter((goal) => goal.targetDate && inRange(goal.targetDate, range));

    const eventItem = (event: PersonalEvent, index: number): OrbitItem => ({
      id: `event-${event.source}-${event.id}`,
      kind: 'event',
      title: event.title,
      meta: event.allDay ? formatShortDate(event.startAt) : `${formatShortDate(event.startAt)} · ${formatTime(event.startAt)}`,
      detail: eventDuration(event),
      href: event.htmlLink || '/calendar',
      external: Boolean(event.htmlLink),
      tone: toneCycle[index % toneCycle.length],
    });

    const taskItem = (task: PersonalTask, index: number): OrbitItem => ({
      id: `task-${task.id}`,
      kind: 'task',
      title: task.title,
      meta: task.dueDate ? `Due ${formatShortDate(task.dueDate)}` : `${task.priority} priority`,
      detail: task.status === 'in_progress' ? 'In progress' : 'Open',
      href: '/tasks',
      tone: toneCycle[(index + 1) % toneCycle.length],
    });

    const goalItem = (goal: (typeof data.goals)[number], index: number): OrbitItem => ({
      id: `goal-${goal.id}`,
      kind: 'goal',
      title: goal.title,
      meta: goal.targetDate ? `Target ${formatShortDate(goal.targetDate)}` : goal.category,
      detail: `${Math.round(goal.progress)}%`,
      href: '/goals',
      tone: toneCycle[(index + 2) % toneCycle.length],
    });

    let orbitItems: OrbitItem[] = [];

    if (horizon === 'today') {
      const activeTasks = openTasks
        .filter((task) => task.status === 'in_progress' || task.priority === 'urgent' || task.priority === 'high' || inRange(task.dueDate, range))
        .slice(0, 4);
      orbitItems = [
        ...events.slice(0, 6).map(eventItem),
        ...activeTasks.map(taskItem),
      ].slice(0, 8);
    }

    if (horizon === 'week') {
      const dailyClusters: OrbitItem[] = [];
      for (let offset = 0; offset < 7; offset += 1) {
        const day = addDays(range.start, offset);
        const dayEvents = events.filter((event) => dayKey(new Date(event.startAt)) === dayKey(day));
        const dayTasks = dueTasks.filter((task) => task.dueDate && dayKey(new Date(task.dueDate)) === dayKey(day));
        const load = loadForPeriod(dayEvents, dayTasks);
        if (!load) continue;
        const lead = dayEvents[0]?.title ?? dayTasks[0]?.title ?? 'Connected activity';
        dailyClusters.push({
          id: `day-${dayKey(day)}`,
          kind: 'cluster',
          title: day.toLocaleDateString('en-US', { weekday: 'long' }),
          meta: `${formatShortDate(day)} · ${load} item${load === 1 ? '' : 's'}`,
          detail: lead,
          drillTo: 'today',
          tone: toneCycle[offset % toneCycle.length],
        });
      }
      orbitItems = dailyClusters.slice(0, 8);
    }

    if (horizon === 'twoWeeks') {
      const firstWeekEnd = addDays(range.start, 7);
      const firstWeekEvents = events.filter((event) => new Date(event.startAt) < firstWeekEnd);
      const secondWeekEvents = events.filter((event) => new Date(event.startAt) >= firstWeekEnd);
      const firstWeekTasks = dueTasks.filter((task) => task.dueDate && new Date(task.dueDate) < firstWeekEnd);
      const secondWeekTasks = dueTasks.filter((task) => task.dueDate && new Date(task.dueDate) >= firstWeekEnd);

      const clusters: OrbitItem[] = [
        {
          id: 'cluster-this-week', kind: 'cluster', title: 'This week',
          meta: `${loadForPeriod(firstWeekEvents, firstWeekTasks)} connected items`,
          detail: firstWeekEvents[0]?.title ?? firstWeekTasks[0]?.title ?? 'No connected commitments',
          drillTo: 'week', tone: 'violet',
        },
        {
          id: 'cluster-next-week', kind: 'cluster', title: 'Next week',
          meta: `${loadForPeriod(secondWeekEvents, secondWeekTasks)} connected items`,
          detail: secondWeekEvents[0]?.title ?? secondWeekTasks[0]?.title ?? 'No connected commitments',
          drillTo: 'week', tone: 'blue',
        },
      ];

      orbitItems = [
        ...clusters,
        ...events.slice(0, 4).map(eventItem),
        ...dueTasks.slice(0, 2).map(taskItem),
      ].slice(0, 8);
    }

    if (horizon === 'month') {
      const monthStart = range.start;
      const weekClusters: OrbitItem[] = [];
      for (let week = 0; week < 5; week += 1) {
        const segmentStart = addDays(monthStart, week * 7);
        if (segmentStart >= range.end) break;
        const segmentEnd = new Date(Math.min(addDays(segmentStart, 7).getTime(), range.end.getTime()));
        const segmentEvents = events.filter((event) => new Date(event.startAt) >= segmentStart && new Date(event.startAt) < segmentEnd);
        const segmentTasks = dueTasks.filter((task) => task.dueDate && new Date(task.dueDate) >= segmentStart && new Date(task.dueDate) < segmentEnd);
        const load = loadForPeriod(segmentEvents, segmentTasks);
        if (!load) continue;
        weekClusters.push({
          id: `month-week-${week}`,
          kind: 'cluster',
          title: `Week ${week + 1}`,
          meta: `${formatShortDate(segmentStart)} – ${formatShortDate(addDays(segmentEnd, -1))}`,
          detail: `${load} connected item${load === 1 ? '' : 's'}`,
          drillTo: 'week',
          tone: toneCycle[week % toneCycle.length],
        });
      }
      orbitItems = [
        ...weekClusters,
        ...goals.slice(0, 2).map(goalItem),
        ...dueTasks.filter((task) => task.priority === 'urgent' || task.priority === 'high').slice(0, 2).map(taskItem),
      ].slice(0, 8);
    }

    if (horizon === 'threeMonths') {
      const monthClusters: OrbitItem[] = [];
      for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
        const segmentStart = addMonths(range.start, monthOffset);
        const segmentEnd = addMonths(range.start, monthOffset + 1);
        const segmentEvents = events.filter((event) => new Date(event.startAt) >= segmentStart && new Date(event.startAt) < segmentEnd);
        const segmentTasks = dueTasks.filter((task) => task.dueDate && new Date(task.dueDate) >= segmentStart && new Date(task.dueDate) < segmentEnd);
        const segmentGoals = goals.filter((goal) => goal.targetDate && new Date(goal.targetDate) >= segmentStart && new Date(goal.targetDate) < segmentEnd);
        const count = segmentEvents.length + segmentTasks.length + segmentGoals.length;
        monthClusters.push({
          id: `three-month-${monthOffset}`,
          kind: 'cluster',
          title: monthName(segmentStart),
          meta: `${count} connected milestone${count === 1 ? '' : 's'}`,
          detail: segmentGoals[0]?.title ?? segmentEvents[0]?.title ?? segmentTasks[0]?.title ?? 'Open horizon',
          drillTo: 'month',
          tone: toneCycle[monthOffset % toneCycle.length],
        });
      }
      orbitItems = [
        ...monthClusters,
        ...goals.slice(0, 3).map(goalItem),
        ...dueTasks.filter((task) => task.priority === 'urgent' || task.priority === 'high').slice(0, 2).map(taskItem),
      ].slice(0, 8);
    }

    const conflicts = buildConflicts(events);
    const deadlines = dueTasks.length;
    const meetings = events.filter(isMeeting).length;
    const focusUnits = openTasks.filter((task) => task.status === 'in_progress' || task.priority === 'high' || task.priority === 'urgent').length;
    const adminUnits = Math.max(0, events.length - meetings);
    const totalUnits = Math.max(1, focusUnits + meetings + adminUnits);
    const focusPct = Math.round((focusUnits / totalUnits) * 100);
    const meetingPct = Math.round((meetings / totalUnits) * 100);
    const adminPct = Math.max(0, 100 - focusPct - meetingPct);
    const daysInRange = Math.max(1, Math.round((range.end.getTime() - range.start.getTime()) / 86400000));
    const density = (events.length + dueTasks.length) / daysInRange;
    const score = Math.max(35, Math.min(100, Math.round(96 - conflicts.length * 11 - Math.max(0, density - 3) * 5)));

    const nextEvent = events.find((event) => new Date(event.startAt).getTime() >= now) ?? null;
    const prepTasks = nextEvent
      ? openTasks.filter((task) => task.dueDate && new Date(task.dueDate).getTime() <= new Date(nextEvent.startAt).getTime()).slice(0, 2)
      : [];

    return {
      events,
      dueTasks,
      goals,
      orbitItems,
      conflicts,
      deadlines,
      focusPct,
      meetingPct,
      adminPct,
      score,
      nextEvent,
      prepTasks,
      openMinutes: openMinutesForRange(range, events),
    };
  }, [data, horizon, range]);

  function selectHorizon(next: Horizon) {
    if (next === horizon) return;
    setHistory((items) => [...items, horizon].slice(-12));
    setFuture([]);
    setHorizon(next);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((items) => items.slice(0, -1));
    setFuture((items) => [horizon, ...items].slice(0, 12));
    setHorizon(previous);
  }

  function redo() {
    const next = future[0];
    if (!next) return;
    setFuture((items) => items.slice(1));
    setHistory((items) => [...items, horizon].slice(-12));
    setHorizon(next);
  }

  function selectMode(next: ObservatoryMode) {
    setMode(next);
    if (next === 'focus') window.location.assign('/today?room=focus');
    if (next === 'build') window.location.assign('/tasks');
    if (next === 'reflect') window.location.assign('/notes');
  }

  function drillCenter() {
    const order: Horizon[] = ['today', 'week', 'twoWeeks', 'month', 'threeMonths'];
    const index = order.indexOf(horizon);
    if (index <= 0) {
      window.location.assign('/today?room=what-now');
      return;
    }
    selectHorizon(order[index - 1]);
  }

  function stepHorizon(direction: -1 | 1) {
    const order: Horizon[] = ['today', 'week', 'twoWeeks', 'month', 'threeMonths'];
    const index = order.indexOf(horizon);
    const next = order[Math.max(0, Math.min(order.length - 1, index + direction))];
    selectHorizon(next);
  }

  const openHours = observatory ? Math.floor(observatory.openMinutes / 60) : 0;
  const openRemainder = observatory ? observatory.openMinutes % 60 : 0;
  const coreClass = styles[`core${horizon[0].toUpperCase()}${horizon.slice(1)}`];

  return (
    <main className={styles.world} data-horizon={horizon}>
      <div className={styles.lightWashA} aria-hidden="true" />
      <div className={styles.lightWashB} aria-hidden="true" />
      <div className={styles.topRevealZone} aria-hidden="true" onPointerEnter={() => setNavVisible(true)} />

      <section className={styles.frame} aria-label="Plan · The Time Observatory">
        <header className={styles.masthead}>
          <div className={styles.identity}>
            <div className={styles.microNav}>
              <a href="/home">Glow OS</a>
              <span>·</span>
              <a href="/today?room=what-now">Today</a>
            </div>
            <h1>PLAN · THE TIME OBSERVATORY</h1>
            <p>See the arc. Shape the day. Align the becoming.</p>
          </div>

          <nav className={`${styles.modeRail} ${navVisible || askOpen ? styles.navShown : styles.navReceded}`} aria-label="Plan modes">
            {(['plan', 'focus', 'build', 'reflect'] as ObservatoryMode[]).map((item) => (
              <button key={item} type="button" onClick={() => selectMode(item)} className={mode === item ? styles.modeActive : ''}>
                {item}
              </button>
            ))}
          </nav>

          <button
            type="button"
            className={`${styles.askGlow} ${navVisible || askOpen ? styles.navShown : styles.navReceded}`}
            onClick={() => setAskOpen((value) => !value)}
            aria-expanded={askOpen}
          >
            <span className={styles.askPearl} aria-hidden="true" />
            Ask Glow
          </button>
        </header>

        <aside className={styles.instrumentRail} aria-label="Plan instruments">
          <a href="/calendar"><CalendarDays /><span>Calendar</span></a>
          <a href="/tasks"><CheckCircle2 /><span>Tasks</span></a>
          <a href="/tasks"><Bell /><span>Reminders</span></a>
          <a href="/goals"><Target /><span>Goals</span></a>
          <a href="/tasks"><FolderKanban /><span>Projects</span></a>
          <a href="/routines"><RefreshCw /><span>Routines</span></a>
          <a href="/habits"><Sparkles /><span>Habits</span></a>
        </aside>

        <section className={`${styles.observatory} ${styles[`observatory${horizon[0].toUpperCase()}${horizon.slice(1)}`]}`}>
          <div className={styles.horizonLabelA}><span>{range.zoneA[0]}</span><small>{range.zoneA[1]}</small></div>
          <div className={styles.horizonLabelB}><span>{range.zoneB[0]}</span><small>{range.zoneB[1]}</small></div>
          <div className={styles.horizonLabelC}><span>{range.zoneC[0]}</span><small>{range.zoneC[1]}</small></div>

          <div className={`${styles.orbit} ${styles.orbitFar}`} aria-hidden="true" />
          <div className={`${styles.orbit} ${styles.orbitOuter}`} aria-hidden="true" />
          <div className={`${styles.orbit} ${styles.orbitMid}`} aria-hidden="true" />
          <div className={`${styles.orbit} ${styles.orbitInner}`} aria-hidden="true" />
          <div className={`${styles.orbit} ${styles.orbitCore}`} aria-hidden="true" />
          <div className={styles.orbitGlow} aria-hidden="true" />
          <div className={styles.refractedTrackA} aria-hidden="true" />
          <div className={styles.refractedTrackB} aria-hidden="true" />

          <button type="button" className={`${styles.timeCore} ${coreClass}`} onClick={drillCenter} aria-label={`Open ${range.shortLabel}`}>
            <span className={styles.coreShadow} aria-hidden="true" />
            <span className={styles.coreBackShell} aria-hidden="true" />
            <span className={styles.coreOuterShell} aria-hidden="true" />
            <span className={styles.coreMidShell} aria-hidden="true" />
            <span className={styles.corePrismA} aria-hidden="true" />
            <span className={styles.corePrismB} aria-hidden="true" />
            <span className={styles.coreLens} aria-hidden="true" />
            <span className={styles.coreSpecular} aria-hidden="true" />
            <span className={styles.coreText}>
              <strong>{range.centerTitle}</strong>
              <small>{range.centerDetail}</small>
            </span>
          </button>

          {personal.status === 'loading' ? <EmptyOrbit detail="Reading your connected time…" /> : null}
          {personal.status === 'error' ? <EmptyOrbit detail="Your connected Plan data is unavailable. Glow will not insert sample commitments." /> : null}
          {observatory && observatory.orbitItems.length === 0 ? <EmptyOrbit detail={`No real connected activity was found for ${range.shortLabel.toLowerCase()}.`} /> : null}

          {observatory?.orbitItems.map((item, index) => {
            const className = `${styles.orbitCard} ${styles[orbitSlots[index]]} ${styles[`tone${item.tone[0].toUpperCase()}${item.tone.slice(1)}`]}`;
            const inner = (
              <>
                <span className={styles.cardGlyph} aria-hidden="true">
                  {item.kind === 'event' ? <CalendarDays /> : item.kind === 'task' ? <CheckCircle2 /> : item.kind === 'goal' ? <Target /> : <CircleDot />}
                </span>
                <span className={styles.cardText}>
                  <strong>{item.title}</strong>
                  <small>{item.meta}</small>
                </span>
                <em>{item.detail}</em>
              </>
            );

            if (item.drillTo) {
              return <button key={item.id} type="button" className={className} onClick={() => selectHorizon(item.drillTo!)}>{inner}</button>;
            }

            return (
              <a key={item.id} href={item.href || '#'} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined} className={className}>
                {inner}
              </a>
            );
          })}

          <div className={styles.particleField} aria-hidden="true">
            {Array.from({ length: 34 }).map((_, index) => <i key={index} />)}
          </div>
        </section>

        <aside className={styles.analysisPanel} aria-label="Time analysis">
          <span className={styles.panelEyebrow}>Time analysis</span>
          <div className={styles.analysisRow}>
            <span><i className={styles.focusDot} />Focus</span><b style={{ '--meter': `${observatory?.focusPct ?? 0}%` } as CSSProperties} /><em>{observatory?.focusPct ?? 0}%</em>
          </div>
          <div className={styles.analysisRow}>
            <span><i className={styles.meetingDot} />Meetings</span><b style={{ '--meter': `${observatory?.meetingPct ?? 0}%` } as CSSProperties} /><em>{observatory?.meetingPct ?? 0}%</em>
          </div>
          <div className={styles.analysisRow}>
            <span><i className={styles.adminDot} />Admin</span><b style={{ '--meter': `${observatory?.adminPct ?? 0}%` } as CSSProperties} /><em>{observatory?.adminPct ?? 0}%</em>
          </div>

          <div className={styles.alertBlock}>
            <a href="#conflicts"><span><CircleDot />{observatory?.conflicts.length ?? 0} conflicts</span><em>Review <ChevronRight /></em></a>
            <a href="/tasks"><span><Clock3 />{observatory?.deadlines ?? 0} deadlines</span><em>Prepare <ChevronRight /></em></a>
          </div>

          <div className={styles.scoreBlock}>
            <span className={styles.scoreRing}>{observatory?.score ?? '—'}</span>
            <div><strong>Schedule score</strong><small>{range.shortLabel} · connected load</small></div>
          </div>
        </aside>

        <section className={styles.bottomIntelligence}>
          <article className={styles.intelCard}>
            <span className={styles.panelEyebrow}>Schedule comparison</span>
            <div className={styles.compareLegend}><span><i />You</span><span><i />Available</span></div>
            <svg className={styles.sparkChart} viewBox="0 0 320 82" role="img" aria-label="Derived schedule load curve">
              <path d="M8 58 C45 14 74 71 111 40 S175 22 205 48 S261 63 312 20" />
              <path d="M8 66 C45 45 70 35 108 50 S163 62 203 35 S258 17 312 40" />
              <line x1="8" y1="76" x2="312" y2="76" />
            </svg>
            <div className={styles.chartAxis}><span>Near</span><span>Middle</span><span>Later</span></div>
          </article>

          <article className={styles.intelCard} id="conflicts">
            <span className={styles.panelEyebrow}>Conflicts</span>
            {observatory?.conflicts.length ? observatory.conflicts.slice(0, 2).map((conflict, index) => (
              <div className={styles.conflictLine} key={`${conflict.a.id}-${conflict.b.id}`}>
                <i className={index === 0 ? styles.conflictRed : styles.conflictLavender} />
                <span><strong>{conflict.a.title}</strong><small>{formatShortDate(conflict.a.startAt)} · {formatTime(conflict.a.startAt)} overlaps {conflict.b.title}</small></span>
              </div>
            )) : <p className={styles.quietText}>No overlapping connected events in {range.shortLabel.toLowerCase()}.</p>}
            <a href="/calendar" className={styles.softButton}>Review calendar</a>
          </article>

          <article className={styles.intelCard}>
            <span className={styles.panelEyebrow}>Preparation</span>
            {observatory?.nextEvent ? (
              <>
                <strong className={styles.prepTitle}>{observatory.nextEvent.title} · {formatShortDate(observatory.nextEvent.startAt)}</strong>
                <small className={styles.prepMeta}>{observatory.prepTasks.length} connected task{observatory.prepTasks.length === 1 ? '' : 's'} due before this event</small>
                {observatory.prepTasks.map((task) => <span className={styles.prepItem} key={task.id}><i />{task.title}</span>)}
                <a href={observatory.nextEvent.htmlLink || '/calendar'} className={styles.softButton} target={observatory.nextEvent.htmlLink ? '_blank' : undefined} rel={observatory.nextEvent.htmlLink ? 'noreferrer' : undefined}>Open event <ChevronRight /></a>
              </>
            ) : <p className={styles.quietText}>No connected event in this horizon currently needs preparation.</p>}
          </article>

          <article className={styles.intelCard}>
            <span className={styles.panelEyebrow}>Open time</span>
            <div className={styles.openTimeLine}><span>{range.shortLabel}</span><strong>{openHours}h {openRemainder ? `${openRemainder}m` : ''}</strong></div>
            <div className={styles.openTimeLine}><span>Connected events</span><strong>{observatory?.events.length ?? 0}</strong></div>
            <a href="/calendar" className={styles.findTimeButton}><Sparkles /> Find best time</a>
          </article>
        </section>

        <footer className={styles.footerBar}>
          <div className={styles.horizonRail} role="tablist" aria-label="Planning horizon">
            {horizons.map((item) => (
              <button key={item.id} type="button" role="tab" aria-selected={horizon === item.id} onClick={() => selectHorizon(item.id)} className={horizon === item.id ? styles.horizonActive : ''}>
                {item.label}
              </button>
            ))}
          </div>

          <div className={styles.todayStepper}>
            <button type="button" onClick={() => stepHorizon(-1)} aria-label="Move inward in time"><ChevronLeft /></button>
            <span>{range.shortLabel}</span>
            <button type="button" onClick={() => stepHorizon(1)} aria-label="Move outward in time"><ChevronRight /></button>
            <a href="/calendar" aria-label="Open calendar"><CalendarDays /></a>
          </div>

          <div className={styles.historyControls}>
            <button type="button" onClick={undo} disabled={!history.length}><RotateCcw /> Undo</button>
            <button type="button" onClick={redo} disabled={!future.length}><RotateCw /> Redo</button>
          </div>

          <span className={styles.liveReceipt}>Live connected data <CheckCircle2 /></span>
        </footer>
      </section>

      {askOpen ? (
        <aside className={styles.askPanel} role="dialog" aria-label="Ask Glow">
          <div className={styles.askPanelHead}>
            <span className={styles.askPearl} />
            <div><strong>Glow</strong><small>Your connected Plan context stays attached.</small></div>
            <button type="button" onClick={() => setAskOpen(false)} aria-label="Close">×</button>
          </div>
          <p>Ask Glow to interpret your schedule, find open time, prepare for what is next, or move between time horizons. Missing data stays missing rather than being invented.</p>
          <a href="/today?room=replan"><ListTodo /> Replan today</a>
          <a href="/calendar"><CalendarDays /> Open calendar</a>
        </aside>
      ) : null}
    </main>
  );
}
