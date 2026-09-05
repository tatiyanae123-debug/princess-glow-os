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
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';
import styles from './glow-plan-world.module.css';

type Horizon = 'day' | 'week' | 'month' | 'quarter' | 'year';
type ObservatoryMode = 'plan' | 'focus' | 'build' | 'reflect';

type OrbitItem = {
  id: string;
  kind: 'event' | 'task' | 'goal';
  title: string;
  meta: string;
  detail: string;
  href: string;
  external?: boolean;
  tone: 'violet' | 'blue' | 'pearl' | 'mint' | 'blush';
};

const horizons: Array<{ id: Horizon; label: string; days: number }> = [
  { id: 'day', label: 'Day', days: 1 },
  { id: 'week', label: 'Week', days: 7 },
  { id: 'month', label: 'Month', days: 30 },
  { id: 'quarter', label: 'Quarter', days: 90 },
  { id: 'year', label: 'Year', days: 365 },
];

const orbitSlots = [
  'slotA',
  'slotB',
  'slotC',
  'slotD',
  'slotE',
  'slotF',
  'slotG',
  'slotH',
] as const;

const toneCycle: OrbitItem['tone'][] = ['violet', 'blue', 'pearl', 'mint', 'blush'];

function startOfDay(date = new Date()) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfHorizon(days: number) {
  const result = startOfDay();
  result.setDate(result.getDate() + days);
  return result;
}

function formatShortDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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

function dueWithin(task: PersonalTask, end: Date) {
  if (!task.dueDate) return false;
  const due = new Date(task.dueDate);
  return due >= startOfDay() && due < end;
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
  const [horizon, setHorizon] = useState<Horizon>('day');
  const [mode, setMode] = useState<ObservatoryMode>('plan');
  const [askOpen, setAskOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [history, setHistory] = useState<Horizon[]>([]);
  const [future, setFuture] = useState<Horizon[]>([]);
  const navTimer = useRef<number | null>(null);

  const data = personal.status === 'ready' ? personal.data : null;
  const horizonConfig = horizons.find((item) => item.id === horizon) ?? horizons[0];

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
    const start = startOfDay();
    const end = endOfHorizon(horizonConfig.days);
    const now = Date.now();

    const events = data.events
      .filter((event) => {
        const value = new Date(event.startAt);
        return value >= start && value < end;
      })
      .slice(0, 18);

    const tasks = data.tasks
      .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
      .filter((task) => !task.dueDate || dueWithin(task, end))
      .slice(0, 14);

    const goals = data.goals
      .filter((goal) => {
        if (!goal.targetDate) return horizon === 'quarter' || horizon === 'year';
        return new Date(goal.targetDate) < end;
      })
      .slice(0, 8);

    const eventItems: OrbitItem[] = events.map((event, index) => ({
      id: `event-${event.source}-${event.id}`,
      kind: 'event',
      title: event.title,
      meta: event.allDay ? formatShortDate(event.startAt) : `${formatShortDate(event.startAt)} · ${formatTime(event.startAt)}`,
      detail: eventDuration(event),
      href: event.htmlLink || '/calendar',
      external: Boolean(event.htmlLink),
      tone: toneCycle[index % toneCycle.length],
    }));

    const taskItems: OrbitItem[] = tasks.map((task, index) => ({
      id: `task-${task.id}`,
      kind: 'task',
      title: task.title,
      meta: task.dueDate ? `Due ${formatShortDate(task.dueDate)}` : `${task.priority} priority`,
      detail: task.status === 'in_progress' ? 'In progress' : 'Open',
      href: '/tasks',
      tone: toneCycle[(index + 1) % toneCycle.length],
    }));

    const goalItems: OrbitItem[] = goals.map((goal, index) => ({
      id: `goal-${goal.id}`,
      kind: 'goal',
      title: goal.title,
      meta: goal.targetDate ? `Target ${formatShortDate(goal.targetDate)}` : goal.category,
      detail: `${Math.round(goal.progress)}%`,
      href: '/goals',
      tone: toneCycle[(index + 2) % toneCycle.length],
    }));

    const orbitItems = [...eventItems, ...taskItems, ...goalItems].slice(0, orbitSlots.length);
    const conflicts = buildConflicts(events);
    const deadlines = tasks.filter((task) => task.dueDate && new Date(task.dueDate).getTime() >= now).length;
    const meetings = events.filter(isMeeting).length;
    const focusUnits = tasks.filter((task) => task.status === 'in_progress' || task.priority === 'high' || task.priority === 'urgent').length;
    const adminUnits = Math.max(0, events.length - meetings);
    const totalUnits = Math.max(1, focusUnits + meetings + adminUnits);
    const focusPct = Math.round((focusUnits / totalUnits) * 100);
    const meetingPct = Math.round((meetings / totalUnits) * 100);
    const adminPct = Math.max(0, 100 - focusPct - meetingPct);
    const score = Math.max(35, Math.min(100, 96 - conflicts.length * 11 - Math.max(0, deadlines - 4) * 2));

    const nextEvent = data.events.find((event) => new Date(event.startAt).getTime() >= now) ?? null;
    const prepTasks = nextEvent
      ? data.tasks.filter((task) => task.dueDate && new Date(task.dueDate).getTime() <= new Date(nextEvent.startAt).getTime() && task.status !== 'done').slice(0, 2)
      : [];

    const todayTimed = data.todayEvents
      .filter((event) => !event.allDay)
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    let openMinutes = 0;
    if (todayTimed.length === 0) {
      openMinutes = 8 * 60;
    } else {
      const dayStart = new Date();
      dayStart.setHours(8, 0, 0, 0);
      const dayEnd = new Date();
      dayEnd.setHours(20, 0, 0, 0);
      let cursor = dayStart.getTime();
      for (const event of todayTimed) {
        const eventStart = new Date(event.startAt).getTime();
        const eventEnd = event.endAt ? new Date(event.endAt).getTime() : eventStart + 30 * 60000;
        if (eventStart > cursor) openMinutes += Math.round((eventStart - cursor) / 60000);
        cursor = Math.max(cursor, eventEnd);
      }
      if (cursor < dayEnd.getTime()) openMinutes += Math.round((dayEnd.getTime() - cursor) / 60000);
    }

    return {
      events,
      tasks,
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
      openMinutes: Math.max(0, openMinutes),
    };
  }, [data, horizon, horizonConfig.days]);

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

  const centerDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'long',
  });

  const openHours = observatory ? Math.floor(observatory.openMinutes / 60) : 0;
  const openRemainder = observatory ? observatory.openMinutes % 60 : 0;

  return (
    <main className={styles.world}>
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

        <section className={styles.observatory}>
          <div className={styles.horizonLabelA}><span>Later</span><small>{horizon === 'day' ? 'Beyond today' : `Beyond ${horizonConfig.label.toLowerCase()}`}</small></div>
          <div className={styles.horizonLabelB}><span>Next</span><small>{horizon === 'day' ? 'Coming up' : `${horizonConfig.days} day horizon`}</small></div>
          <div className={styles.horizonLabelC}><span>Near</span><small>Closest commitments</small></div>

          <div className={`${styles.orbit} ${styles.orbitOuter}`} aria-hidden="true" />
          <div className={`${styles.orbit} ${styles.orbitMid}`} aria-hidden="true" />
          <div className={`${styles.orbit} ${styles.orbitInner}`} aria-hidden="true" />
          <div className={`${styles.orbit} ${styles.orbitCore}`} aria-hidden="true" />
          <div className={styles.orbitGlow} aria-hidden="true" />

          <button type="button" className={styles.todayCore} onClick={() => window.location.assign('/today?room=what-now')}>
            <span>Today</span>
            <small>{centerDate}</small>
          </button>

          {personal.status === 'loading' ? <EmptyOrbit detail="Reading your connected time…" /> : null}
          {personal.status === 'error' ? <EmptyOrbit detail="Your connected Plan data is unavailable. Glow will not insert sample commitments." /> : null}
          {observatory && observatory.orbitItems.length === 0 ? <EmptyOrbit detail={`No real events, tasks, or goals were found in this ${horizon}.`} /> : null}

          {observatory?.orbitItems.map((item, index) => (
            <a
              key={item.id}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noreferrer' : undefined}
              className={`${styles.orbitCard} ${styles[orbitSlots[index]]} ${styles[`tone${item.tone[0].toUpperCase()}${item.tone.slice(1)}`]}`}
            >
              <span className={styles.cardGlyph} aria-hidden="true">
                {item.kind === 'event' ? <CalendarDays /> : item.kind === 'task' ? <CheckCircle2 /> : <Target />}
              </span>
              <span className={styles.cardText}>
                <strong>{item.title}</strong>
                <small>{item.meta}</small>
              </span>
              <em>{item.detail}</em>
            </a>
          ))}

          <div className={styles.particleField} aria-hidden="true">
            {Array.from({ length: 22 }).map((_, index) => <i key={index} />)}
          </div>
        </section>

        <aside className={styles.analysisPanel} aria-label="Time analysis">
          <span className={styles.panelEyebrow}>Time analysis</span>
          <div className={styles.analysisRow}>
            <span><i className={styles.focusDot} />Focus</span><b style={{ '--meter': `${observatory?.focusPct ?? 0}%` } as React.CSSProperties} /><em>{observatory?.focusPct ?? 0}%</em>
          </div>
          <div className={styles.analysisRow}>
            <span><i className={styles.meetingDot} />Meetings</span><b style={{ '--meter': `${observatory?.meetingPct ?? 0}%` } as React.CSSProperties} /><em>{observatory?.meetingPct ?? 0}%</em>
          </div>
          <div className={styles.analysisRow}>
            <span><i className={styles.adminDot} />Admin</span><b style={{ '--meter': `${observatory?.adminPct ?? 0}%` } as React.CSSProperties} /><em>{observatory?.adminPct ?? 0}%</em>
          </div>

          <div className={styles.alertBlock}>
            <a href="#conflicts"><span><CircleDot />{observatory?.conflicts.length ?? 0} conflicts</span><em>Review <ChevronRight /></em></a>
            <a href="/tasks"><span><Clock3 />{observatory?.deadlines ?? 0} deadlines</span><em>Prepare <ChevronRight /></em></a>
          </div>

          <div className={styles.scoreBlock}>
            <span className={styles.scoreRing}>{observatory?.score ?? '—'}</span>
            <div><strong>Schedule score</strong><small>Derived from your connected load</small></div>
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
            <div className={styles.chartAxis}><span>6A</span><span>12P</span><span>6P</span></div>
          </article>

          <article className={styles.intelCard} id="conflicts">
            <span className={styles.panelEyebrow}>Conflicts</span>
            {observatory?.conflicts.length ? observatory.conflicts.slice(0, 2).map((conflict, index) => (
              <div className={styles.conflictLine} key={`${conflict.a.id}-${conflict.b.id}`}>
                <i className={index === 0 ? styles.conflictRed : styles.conflictLavender} />
                <span><strong>{conflict.a.title}</strong><small>{formatTime(conflict.a.startAt)} · overlaps {conflict.b.title}</small></span>
              </div>
            )) : <p className={styles.quietText}>No overlapping connected events in this horizon.</p>}
            <a href="/calendar" className={styles.softButton}>Review calendar</a>
          </article>

          <article className={styles.intelCard}>
            <span className={styles.panelEyebrow}>Preparation</span>
            {observatory?.nextEvent ? (
              <>
                <strong className={styles.prepTitle}>{observatory.nextEvent.title} · {formatTime(observatory.nextEvent.startAt)}</strong>
                <small className={styles.prepMeta}>{observatory.prepTasks.length} connected task{observatory.prepTasks.length === 1 ? '' : 's'} due before this event</small>
                {observatory.prepTasks.map((task) => <span className={styles.prepItem} key={task.id}><i />{task.title}</span>)}
                <a href={observatory.nextEvent.htmlLink || '/calendar'} className={styles.softButton} target={observatory.nextEvent.htmlLink ? '_blank' : undefined} rel={observatory.nextEvent.htmlLink ? 'noreferrer' : undefined}>Open event <ChevronRight /></a>
              </>
            ) : <p className={styles.quietText}>No upcoming connected event needs preparation.</p>}
          </article>

          <article className={styles.intelCard}>
            <span className={styles.panelEyebrow}>Open time</span>
            <div className={styles.openTimeLine}><span>Today</span><strong>{openHours}h {openRemainder ? `${openRemainder}m` : ''}</strong></div>
            <div className={styles.openTimeLine}><span>Tomorrow</span><strong>{data?.tomorrowEvents.length ?? 0} events</strong></div>
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
            <button type="button" onClick={() => selectHorizon('day')} aria-label="Return to day"><ChevronLeft /></button>
            <span>Today</span>
            <button type="button" onClick={() => window.location.assign('/calendar')} aria-label="Open calendar"><ChevronRight /></button>
            <CalendarDays />
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
          <p>Ask Glow to help you interpret your schedule, find open time, prepare for what is next, or replan the day. Missing data stays missing rather than being invented.</p>
          <a href="/today?room=replan"><ListTodo /> Replan today</a>
          <a href="/calendar"><CalendarDays /> Open calendar</a>
        </aside>
      ) : null}
    </main>
  );
}
