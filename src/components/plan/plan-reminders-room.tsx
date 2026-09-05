'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  BellRing,
  CalendarClock,
  Clock3,
  ListChecks,
  MapPin,
  Repeat2,
  RotateCcw,
  Sparkles,
  UserRound,
  Volume2,
} from 'lucide-react';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import { PlanOrbitField } from './plan-orbit-field';
import styles from './plan-instruments.module.css';

export type PlanReminderItem = {
  id: string;
  title: string;
  notes: string | null;
  listName: string;
  dueAt: string | null;
  completed: boolean;
  lastSyncedAt: string;
  domain: string;
  intent: string;
  urgency: string;
  nextAction: string;
};

export type PlanReminderCalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
};

type Connection = { status: string; lastImportedAt: string | null } | null;
type TriggerKind = 'time' | 'location' | 'person' | 'routine' | 'unscheduled';

type Trigger = { kind: TriggerKind; label: string; value: string };

const DAY = 86_400_000;

function reminderText(reminder: PlanReminderItem) {
  return `${reminder.title} ${reminder.notes ?? ''}`;
}

function reminderTriggers(reminder: PlanReminderItem): Trigger[] {
  const original = reminderText(reminder);
  const lower = original.toLowerCase();
  const triggers: Trigger[] = [];

  if (reminder.dueAt) {
    triggers.push({ kind: 'time', label: 'Time Anchor', value: new Date(reminder.dueAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) });
  }

  if (/when i (?:get to|arrive at|reach)|when near|when at|at work|at home|near the|location trigger/i.test(original)) {
    triggers.push({ kind: 'location', label: 'Location', value: 'Explicit location cue' });
  }

  const person = original.match(/\bwith\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (person) triggers.push({ kind: 'person', label: `With ${person[1]}`, value: 'Person cue in reminder' });

  if (/\bevery\s+(?:day|week|month|morning|evening)|\bdaily\b|\bweekly\b|\bmonthly\b|\broutine\b|\brepeat(?:s|ing)?\b/.test(lower)) {
    triggers.push({ kind: 'routine', label: 'Routine', value: 'Repeat/routine cue' });
  }

  if (!triggers.length) triggers.push({ kind: 'unscheduled', label: 'Unscheduled', value: 'No trigger detected' });
  return triggers;
}

function triggerIcon(kind: TriggerKind) {
  if (kind === 'time') return Clock3;
  if (kind === 'location') return MapPin;
  if (kind === 'person') return UserRound;
  if (kind === 'routine') return RotateCcw;
  return Bell;
}

function horizonEnd(horizon: PlanHorizon, now: Date) {
  if (horizon === 'today') { const end = new Date(now); end.setHours(23, 59, 59, 999); return end; }
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
  if (!value) return 'No due time';
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function formatDate(value: Date) {
  return value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
}

export function PlanRemindersRoom({ reminders, connection, calendarEvents }: { reminders: PlanReminderItem[]; connection: Connection; calendarEvents: PlanReminderCalendarEvent[] }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const [selectedId, setSelectedId] = useState<string | null>(reminders.find((item) => !item.completed)?.id ?? reminders[0]?.id ?? null);
  const now = useMemo(() => new Date(), []);
  const end = useMemo(() => horizonEnd(horizon, now), [horizon, now]);

  const visible = useMemo(() => reminders.filter((reminder) => {
    if (reminder.completed) return false;
    if (!reminder.dueAt) return true;
    const due = new Date(reminder.dueAt);
    return due <= end || due < now;
  }).sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return a.title.localeCompare(b.title);
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  }), [reminders, end, now]);

  const selected = visible.find((item) => item.id === selectedId) ?? visible[0] ?? reminders.find((item) => !item.completed) ?? reminders[0] ?? null;
  const selectedTriggers = selected ? reminderTriggers(selected) : [];
  const due = selected?.dueAt ? new Date(selected.dueAt) : null;

  const context = useMemo(() => {
    if (!selected || !due) return { overlap: null as PlanReminderCalendarEvent | null, previous: null as PlanReminderCalendarEvent | null, next: null as PlanReminderCalendarEvent | null };
    const events = calendarEvents.map((event) => ({ ...event, start: new Date(event.startAt), end: event.endAt ? new Date(event.endAt) : new Date(new Date(event.startAt).getTime() + 60 * 60_000) })).sort((a, b) => a.start.getTime() - b.start.getTime());
    const overlap = events.find((event) => !event.allDay && due >= event.start && due <= event.end) ?? null;
    const previous = [...events].reverse().find((event) => event.end <= due) ?? null;
    const next = events.find((event) => event.start >= due) ?? null;
    return { overlap, previous, next };
  }, [selected, due, calendarEvents]);

  const topReminder = visible.slice(0, 7);
  const connectionReady = connection?.status === 'connected' || reminders.length > 0;
  const dateText = formatDate(now);

  const smartTiming = !selected?.dueAt ? 'No due time' : context.overlap ? `Overlaps ${context.overlap.title}` : 'Clear nearby';
  const quietCopy = !selected ? 'Choose a reminder to see its timing context.' : !selected.dueAt ? 'This reminder has no due time, so Glow will not pretend it knows the right moment.' : context.overlap ? `This reminder lands during “${context.overlap.title}.” Glow can surface that conflict without changing the Apple source.` : 'No calendar conflict is detected around the selected reminder.';

  const contextRows = selected ? [
    context.previous ? { title: context.previous.title, time: new Date(context.previous.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), state: 'Before' } : null,
    { title: selected.title, time: selected.dueAt ? new Date(selected.dueAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Unscheduled', state: context.overlap ? 'Conflict' : 'Reminder' },
    context.next && context.next.id !== context.previous?.id ? { title: context.next.title, time: new Date(context.next.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), state: 'After' } : null,
  ].filter(Boolean) as { title: string; time: string; state: string }[] : [];

  const triggerRows: { kind: TriggerKind; title: string; value: string }[] = [
    { kind: 'time', title: 'Time', value: selectedTriggers.find((item) => item.kind === 'time')?.value ?? 'Not attached' },
    { kind: 'location', title: 'Location', value: selectedTriggers.find((item) => item.kind === 'location')?.value ?? 'Not attached' },
    { kind: 'person', title: 'Person', value: selectedTriggers.find((item) => item.kind === 'person')?.label ?? 'Not attached' },
    { kind: 'routine', title: 'Routine', value: selectedTriggers.find((item) => item.kind === 'routine')?.value ?? 'Not attached' },
  ];

  return (
    <PlanInstrumentChrome
      title="PLAN · REMINDERS"
      subtitle="Gentle nudges, in the right moment, in the right place. A calmer you, on time."
      activeInstrument="Reminders"
      horizon={horizon}
      onHorizonChange={setHorizon}
      centerLabel={horizonLabel(horizon)}
      rightReceipt={connection?.status === 'connected' ? 'Source synced' : 'Import only'}
      remindersLayout
    >
      <section className={`${styles.stage} ${styles.remindersStage}`} aria-label="Reminder context field">
        <PlanOrbitField dense />

        {topReminder.map((reminder, index) => {
          const trigger = reminderTriggers(reminder)[0];
          const Icon = triggerIcon(trigger.kind);
          return (
            <div key={reminder.id} className={`${styles.reminderOrbitItem} ${styles[`reminderPos${index}`]}`}>
              <div className={styles.reminderNodeHead}>
                <span className={styles.reminderTriggerOrb}><Icon /></span>
                <span className={styles.reminderTriggerText}><strong>{trigger.label}</strong><small>{trigger.value}</small></span>
              </div>
              <button type="button" className={`${styles.reminderCard} ${selected?.id === reminder.id ? styles.selected : ''}`} onClick={() => setSelectedId(reminder.id)}>
                <span className={styles.reminderMiniIcon}><Bell /></span>
                <span className={styles.reminderInfo}><strong>{reminder.title}</strong><small>{dueLabel(reminder.dueAt)}</small></span>
                <BellRing className={styles.reminderBell} size={15} strokeWidth={1.3} />
              </button>
            </div>
          );
        })}

        <div className={styles.centerLens}>
          <span className={styles.centerSpectral} />
          <strong>{horizon === 'today' ? 'TODAY' : horizonLabel(horizon)}</strong>
          <span>{horizon === 'today' ? dateText : `${visible.length} open reminder${visible.length === 1 ? '' : 's'}`}</span>
          <small>{horizon === 'today' ? `${visible.length} reminder${visible.length === 1 ? '' : 's'} in view` : 'Context expands with the horizon.'}</small>
        </div>

        <div className={styles.quietCard}>
          <span className={styles.quietOrb}><Sparkles /></span>
          <span className={styles.quietText}><strong>Timing context</strong><p>{quietCopy}</p></span>
        </div>
        <blockquote className={styles.quote}>The right reminder,<br/>at the right moment,<br/>changes everything.</blockquote>

        {!connectionReady ? <div className={styles.connectionEmpty}><strong>Apple Reminders is not connected yet.</strong><p>Glow will leave this field empty rather than invent reminders or triggers.</p><Link href="/connections">Connect Apple Reminders</Link></div> : null}
      </section>

      <section className={styles.inspectorBand} aria-label="Reminder inspector">
        <article className={styles.inspectorPanel}>
          <div className={styles.panelTitle}>SELECTED REMINDER</div>
          {selected ? <>
            <div className={styles.selectedHeader}><span className={styles.selectedOrb}><Bell /></span><span><strong>{selected.title}</strong><small>{dueLabel(selected.dueAt)}</small></span></div>
            <div className={styles.importState}><span className={styles.importSwitch}/><span>Imported from Apple Reminders</span></div>
            <div className={styles.noteBox}>{selected.notes?.trim() || 'No note attached.'}</div>
            <span className={styles.listChip}><ListChecks size={11}/> {selected.listName}</span>
          </> : <div className={styles.noteBox}>No reminder selected.</div>}
        </article>

        <article className={styles.inspectorPanel}>
          <div className={styles.panelTitle}>TRIGGERS</div>
          <div className={styles.triggerList}>
            {triggerRows.map((row) => {
              const Icon = triggerIcon(row.kind);
              return <div className={styles.triggerRow} key={row.kind}><span className={styles.triggerRowIcon}><Icon/></span><span><strong>{row.title}</strong><small>{row.value === 'Not attached' ? 'No verified trigger' : 'Detected from source'}</small></span><span className={styles.triggerValue}>{row.value}</span></div>;
            })}
          </div>
        </article>

        <article className={styles.inspectorPanel}>
          <div className={styles.panelTitle}>REMINDER SETTINGS</div>
          <div className={styles.settingsList}>
            <div className={styles.settingRow}><span className={styles.settingRowIcon}><Bell/></span><span><strong>Notification style</strong><small>Read-only source</small></span><span className={styles.settingValue}>Apple Reminders</span></div>
            <div className={styles.settingRow}><span className={styles.settingRowIcon}><Volume2/></span><span><strong>Spoken reminder</strong><small>Glow has no saved spoken setting</small></span><span className={styles.settingValue}>Not configured</span></div>
            <div className={styles.settingRow}><span className={styles.settingRowIcon}><Repeat2/></span><span><strong>Repeat</strong><small>Only when source text supports it</small></span><span className={styles.settingValue}>{selectedTriggers.some((item) => item.kind === 'routine') ? 'Cue detected' : 'Not detected'}</span></div>
            <div className={styles.settingRow}><span className={styles.settingRowIcon}><Sparkles/></span><span><strong>Smart timing</strong><small>Compared with your real calendar</small></span><span className={styles.settingValue}>{smartTiming}</span></div>
          </div>
        </article>

        <article className={styles.inspectorPanel}>
          <div className={styles.panelTitle}>CONTEXT PREVIEW</div>
          <div className={styles.contextList}>
            {contextRows.length ? contextRows.map((row, index) => <div className={styles.contextRow} key={`${row.title}-${index}`}><span className={styles.contextDot}/><span><strong>{row.time}</strong><small>{row.title}</small></span><span className={styles.contextState}>{row.state}</span></div>) : <div className={styles.contextSummary}>No calendar context can be compared until this reminder has a real due time.</div>}
          </div>
          <div className={styles.contextSummary}>{context.overlap ? `Glow detected a real overlap with “${context.overlap.title}.” The Apple reminder itself remains unchanged.` : selected?.dueAt ? 'No overlapping calendar event was detected at this reminder time.' : 'No timing claim is made for an unscheduled reminder.'}</div>
        </article>
      </section>
    </PlanInstrumentChrome>
  );
}
