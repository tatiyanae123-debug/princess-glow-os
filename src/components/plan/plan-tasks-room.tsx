'use client';

import type { CSSProperties } from 'react';
import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ban,
  Circle,
  CheckCircle2,
  Clock3,
  Hourglass,
  ListTree,
  Sparkles,
  TimerReset,
  Wrench,
  Zap,
} from 'lucide-react';
import { updateTaskAction } from '@/app/actions/tasks';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import { PlanOrbitField } from './plan-orbit-field';
import styles from './plan-instruments.module.css';

export type PlanTaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  completedAt: string | null;
  source: string | null;
  createdAt: string;
};

type ZoneId = 'deep' | 'ready' | 'quick' | 'prep' | 'later' | 'waiting' | 'blocked' | 'unplaced';
type ViewBy = 'readiness' | 'priority' | 'due';

const DAY = 86_400_000;

function taskText(task: PlanTaskItem) {
  return `${task.title} ${task.description ?? ''}`.toLowerCase();
}

function estimateMinutes(task: PlanTaskItem) {
  const text = taskText(task);
  const hours = text.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)(?:\s|$)/i);
  if (hours) return Math.max(5, Math.min(360, Math.round(Number(hours[1]) * 60)));
  const minutes = text.match(/(?:^|\s)(\d{1,3})\s*(?:m|min|mins|minute|minutes)(?:\s|$)/i);
  if (minutes) return Math.max(5, Math.min(360, Number(minutes[1])));
  if (/email|reply|respond|confirm|book|order|send|text|call|tidy|quick/.test(text)) return 10;
  if (/clean|reset|workout|plan|review|prep|grocery|errand/.test(text)) return 30;
  if (/design|write|research|study|build|project|portfolio|proposal|strategy|deep|synthesis/.test(text)) return 60;
  return 25;
}

function explicitLocation(task: PlanTaskItem) {
  const text = taskText(task);
  if (/\bhome\b|bedroom|kitchen|bathroom|laundry/.test(text)) return 'Home';
  if (/\bwork\b|office|shift|client/.test(text)) return 'Work';
  if (/gym|pilates|studio/.test(text)) return 'Fitness';
  if (/store|shop|grocery|pharmacy|mall|pickup|pick up/.test(text)) return 'Errand';
  if (/online|website|email|zoom|meet/.test(text)) return 'Online';
  return 'Unspecified';
}

function classifyTask(task: PlanTaskItem, now: Date): ZoneId {
  const text = taskText(task);
  const estimate = estimateMinutes(task);
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const msUntilDue = due ? due.getTime() - now.getTime() : null;

  if (/\bblocked\b|\bstuck\b|cannot proceed|can't proceed|can’t proceed|cannot start|can't start|can’t start/.test(text)) return 'blocked';
  if (/waiting on|awaiting|pending feedback|pending reply|pending approval|need response|waiting for/.test(text)) return 'waiting';
  if (/prepare|preparation|prep\b|gather|materials|research first|set up|setup|before i can|before starting/.test(text)) return 'prep';
  if (task.status === 'in_progress' || (estimate >= 45 && (task.priority === 'urgent' || task.priority === 'high')) || /deep focus|design|write|research|study|build|strategy|synthesis/.test(text) && estimate >= 45) return 'deep';
  if (estimate <= 15) return 'quick';
  if (task.priority === 'urgent' || task.priority === 'high' || (msUntilDue !== null && msUntilDue <= DAY * 2)) return 'ready';
  if (task.priority === 'low' || (msUntilDue !== null && msUntilDue > DAY * 7)) return 'later';
  return 'unplaced';
}

function horizonEnd(horizon: PlanHorizon, now: Date) {
  if (horizon === 'today') {
    const end = new Date(now); end.setHours(23, 59, 59, 999); return end;
  }
  if (horizon === 'week') return new Date(now.getTime() + DAY * 7);
  if (horizon === 'two-weeks') return new Date(now.getTime() + DAY * 14);
  if (horizon === 'month') return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return new Date(now.getTime() + DAY * 90);
}

function horizonLabel(horizon: PlanHorizon) {
  if (horizon === 'today') return 'TODAY';
  if (horizon === 'week') return 'THIS WEEK';
  if (horizon === 'two-weeks') return 'NEXT 2 WEEKS';
  if (horizon === 'month') return 'THIS MONTH';
  return 'NEXT 3 MONTHS';
}

function dueLabel(value: string | null) {
  if (!value) return 'No due date';
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return `Today · ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function energyMarks(priority: PlanTaskItem['priority']) {
  return priority === 'urgent' ? '⚡⚡⚡' : priority === 'high' ? '⚡⚡' : priority === 'medium' ? '⚡' : '';
}

function subtaskLines(task: PlanTaskItem) {
  if (!task.description) return [];
  return task.description.split(/\n+/).map((line) => line.trim()).filter((line) => /^[-*]?\s*\[[ xX]\]\s+/.test(line)).map((line) => line.replace(/^[-*]?\s*\[[ xX]\]\s+/, ''));
}

function priorityRank(priority: PlanTaskItem['priority']) {
  return { urgent: 4, high: 3, medium: 2, low: 1 }[priority];
}

export function PlanTasksRoom({ initialTasks }: { initialTasks: PlanTaskItem[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const [viewBy, setViewBy] = useState<ViewBy>('readiness');
  const [contextFilter, setContextFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [isPending, startTransition] = useTransition();

  const now = useMemo(() => new Date(), []);
  const end = useMemo(() => horizonEnd(horizon, now), [horizon, now]);
  const sources = useMemo(() => Array.from(new Set(tasks.map((task) => task.source ?? 'Glow'))).sort(), [tasks]);
  const locations = useMemo(() => Array.from(new Set(tasks.map(explicitLocation).filter((value) => value !== 'Unspecified'))).sort(), [tasks]);

  const filteredOpen = useMemo(() => {
    let values = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
    values = values.filter((task) => {
      if (!task.dueDate) return true;
      const due = new Date(task.dueDate);
      return due <= end || due < now;
    });
    if (contextFilter !== 'all') values = values.filter((task) => (task.source ?? 'Glow') === contextFilter);
    if (locationFilter !== 'all') values = values.filter((task) => explicitLocation(task) === locationFilter);
    if (priorityFilter !== 'all') values = values.filter((task) => task.priority === priorityFilter);
    if (durationFilter !== 'all') values = values.filter((task) => {
      const minutes = estimateMinutes(task);
      if (durationFilter === 'quick') return minutes <= 15;
      if (durationFilter === 'medium') return minutes > 15 && minutes <= 45;
      return minutes > 45;
    });
    return values.sort((a, b) => {
      if (viewBy === 'priority') return priorityRank(b.priority) - priorityRank(a.priority);
      if (viewBy === 'due') return (a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER) - (b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER);
      const zoneOrder: Record<ZoneId, number> = { blocked: 0, waiting: 1, ready: 2, deep: 3, prep: 4, quick: 5, later: 6, unplaced: 7 };
      return zoneOrder[classifyTask(a, now)] - zoneOrder[classifyTask(b, now)];
    });
  }, [tasks, end, now, contextFilter, locationFilter, priorityFilter, durationFilter, viewBy]);

  const zones = useMemo(() => {
    const grouped: Record<ZoneId, PlanTaskItem[]> = { deep: [], ready: [], quick: [], prep: [], later: [], waiting: [], blocked: [], unplaced: [] };
    filteredOpen.forEach((task) => grouped[classifyTask(task, now)].push(task));
    return grouped;
  }, [filteredOpen, now]);

  const completed = tasks.filter((task) => task.status === 'done');
  const progressTotal = tasks.filter((task) => task.status !== 'cancelled').length;
  const progress = progressTotal ? Math.round((completed.length / progressTotal) * 100) : 0;
  const nonEmptyZones = (['deep','ready','quick','prep','later','waiting','blocked'] as ZoneId[]).filter((zone) => zones[zone].length).length;

  function toggleTask(task: PlanTaskItem) {
    const nextStatus = task.status === 'done' ? 'pending' : 'done';
    const before = tasks;
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: nextStatus, completedAt: nextStatus === 'done' ? new Date().toISOString() : null } : item));
    startTransition(async () => {
      const result = await updateTaskAction(task.id, nextStatus === 'done' ? { status: 'done', completedAt: new Date() } : { status: 'pending' });
      if (!result?.data) setTasks(before);
      else router.refresh();
    });
  }

  const zoneConfig = [
    { id: 'deep' as const, title: 'DEEP FOCUS', subtitle: 'Uninterrupted time', className: `${styles.deepFocus} ${styles.zoneViolet}`, icon: Sparkles },
    { id: 'ready' as const, title: 'READY NOW', subtitle: 'Do it now', className: `${styles.readyNow} ${styles.zoneMint}`, icon: Zap },
    { id: 'quick' as const, title: 'QUICK RELIEF', subtitle: 'Small wins, big momentum', className: `${styles.quickRelief} ${styles.zonePink}`, icon: Sparkles },
    { id: 'prep' as const, title: 'NEEDS PREPARATION', subtitle: 'Set things up', className: `${styles.needsPrep} ${styles.zoneViolet}`, icon: Wrench },
    { id: 'later' as const, title: 'CAN WAIT', subtitle: 'Later is fine', className: `${styles.canWait} ${styles.zoneBlue}`, icon: TimerReset },
    { id: 'waiting' as const, title: 'WAITING', subtitle: 'On others', className: `${styles.waiting} ${styles.zonePeach}`, icon: Hourglass },
    { id: 'blocked' as const, title: 'BLOCKED', subtitle: "Can't proceed yet", className: `${styles.blocked} ${styles.zoneRed}`, icon: Ban },
  ];

  return (
    <PlanInstrumentChrome
      title="PLAN · TASKS"
      subtitle="Turn intention into movement. Tasks find their place."
      activeInstrument="Tasks"
      horizon={horizon}
      onHorizonChange={setHorizon}
      centerLabel={horizonLabel(horizon)}
      rightReceipt={isPending ? 'Saving…' : 'Saved just now'}
    >
      <div className={styles.viewBy}>
        <span>VIEW BY</span>
        <select value={viewBy} onChange={(event) => setViewBy(event.target.value as ViewBy)} aria-label="View tasks by">
          <option value="readiness">Readiness</option>
          <option value="priority">Priority</option>
          <option value="due">Due date</option>
        </select>
      </div>

      <section className={styles.stage} aria-label="Task readiness field">
        <PlanOrbitField dense />
        {zoneConfig.map(({ id, title, subtitle, className, icon: Icon }) => (
          <article key={id} className={`${styles.zone} ${className}`}>
            <header className={styles.zoneHead}>
              <span className={styles.zoneGlyph}><Icon /></span>
              <span className={styles.zoneHeadText}><strong>{title}</strong><small>{subtitle}</small></span>
              <span className={styles.zoneCount}>{zones[id].length}</span>
            </header>
            <div className={styles.zoneTasks}>
              {zones[id].length ? zones[id].slice(0, id === 'ready' ? 3 : 2).map((task) => {
                const subtasks = showSubtasks ? subtaskLines(task) : [];
                return (
                  <div className={styles.taskRow} key={task.id}>
                    <button type="button" className={styles.taskCheck} onClick={() => toggleTask(task)} disabled={isPending} aria-label={`Complete ${task.title}`}><Circle /></button>
                    <span className={styles.taskInfo}>
                      <strong>{task.title}</strong>
                      <small>{dueLabel(task.dueDate)} · ~{estimateMinutes(task)}m</small>
                      {subtasks.length ? <em>{subtasks.length} recognized subtask{subtasks.length === 1 ? '' : 's'}</em> : null}
                    </span>
                    <span className={styles.taskEnergy}>{energyMarks(task.priority)}</span>
                  </div>
                );
              }) : <p className={styles.emptyZone}>Nothing confidently belongs here yet.</p>}
              {zones[id].length > (id === 'ready' ? 3 : 2) ? <span className={styles.moreCount}>+{zones[id].length - (id === 'ready' ? 3 : 2)} more</span> : null}
            </div>
          </article>
        ))}

        <div className={styles.centerLens}>
          <span className={styles.centerSpectral} />
          <strong>TASKS</strong>
          <span>{nonEmptyZones} active zone{nonEmptyZones === 1 ? '' : 's'} · {filteredOpen.length} task{filteredOpen.length === 1 ? '' : 's'}</span>
          <small>Find your next move.</small>
        </div>

        {zones.unplaced.length ? <div className={styles.unplaced}>{zones.unplaced.length} task{zones.unplaced.length === 1 ? '' : 's'} remain unclassified until Glow has enough readiness context.</div> : null}
        <div className={styles.completedLabel}><strong>COMPLETED</strong><span>{completed.length ? `${completed.length} finished task${completed.length === 1 ? '' : 's'}` : 'Small steps, a brighter you.'}</span></div>
      </section>

      <section className={styles.controlBand} aria-label="Task controls">
        <div className={styles.controlCard}>
          <div className={styles.controlTitle}>TASK CONTROLS</div>
          <div className={styles.controlsRow}>
            <div className={styles.controlPill}><ListTree size={14}/><label><small>Context</small><select value={contextFilter} onChange={(event) => setContextFilter(event.target.value)}><option value="all">All</option>{sources.map((source) => <option key={source} value={source}>{source}</option>)}</select></label></div>
            <div className={styles.controlPill}><span>⌖</span><label><small>Location</small><select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}><option value="all">All</option>{locations.map((location) => <option key={location} value={location}>{location}</option>)}</select></label></div>
            <div className={styles.controlPill}><span>⚑</span><label><small>Priority</small><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option value="all">All</option><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></div>
            <button type="button" className={`${styles.controlPill} ${styles.togglePill}`} onClick={() => setShowSubtasks((value) => !value)}><span className={`${styles.toggleTrack} ${showSubtasks ? styles.on : ''}`} /><label><small>Subtasks</small><span>{showSubtasks ? 'Shown' : 'Hidden'}</span></label></button>
            <div className={styles.controlPill}><Clock3 size={14}/><label><small>Est. duration</small><select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)}><option value="all">Any</option><option value="quick">≤15m</option><option value="medium">15–45m</option><option value="long">45m+</option></select></label></div>
          </div>
        </div>

        <div className={styles.progressCard}>
          <div className={styles.controlTitle}>TODAY'S PROGRESS</div>
          <div className={styles.progressBody}>
            <div className={styles.progressRing} style={{ '--progress': `${progress}%` } as CSSProperties}><strong>{completed.length}/{progressTotal}</strong></div>
            <span className={styles.progressText}><strong>tasks completed</strong><small>Keep going — progress compounds.</small></span>
          </div>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}
