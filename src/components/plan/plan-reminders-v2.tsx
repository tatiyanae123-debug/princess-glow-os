'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  Bell,
  BellRing,
  CalendarClock,
  Check,
  Clock3,
  ListChecks,
  MapPin,
  Plus,
  Repeat2,
  RotateCcw,
  Sparkles,
  UserRound,
  Volume2,
  Waves,
} from 'lucide-react';
import { savePlanObjectSettingAction } from '@/app/actions/plan-reference';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import styles from './plan-reminders-v2.module.css';

const DAY = 86_400_000;
type JsonMap = Record<string, unknown>;
export type ReminderSettingSnapshot = Record<string, JsonMap>;

export type PlanReminderV2 = {
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
  source: {
    location: string | null;
    person: string | null;
    recurrence: string | null;
    notificationStyle: string | null;
    spokenReminder: boolean | null;
    smartTiming: boolean | null;
    url: string | null;
  };
};

export type PlanReminderCalendarEventV2 = {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
};

type Connection = { status: string; lastImportedAt: string | null } | null;
type TriggerKind = 'time' | 'location' | 'person' | 'routine' | 'unscheduled';
type Trigger = { kind: TriggerKind; label: string; value: string; provenance: 'source' | 'glow' };

type OverlaySettings = {
  glowEnabled: boolean;
  notificationStyle: string;
  spokenReminder: boolean;
  repeatRule: string;
  smartTiming: boolean;
  location: string;
  person: string;
  routine: string;
};

function asString(value: unknown) { return typeof value === 'string' ? value : ''; }
function asBoolean(value: unknown) { return typeof value === 'boolean' ? value : null; }
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
function triggerIcon(kind: TriggerKind) {
  if (kind === 'time') return Clock3;
  if (kind === 'location') return MapPin;
  if (kind === 'person') return UserRound;
  if (kind === 'routine') return RotateCcw;
  return Bell;
}

function initialOverlay(reminder: PlanReminderV2 | null, settings: JsonMap): OverlaySettings {
  return {
    glowEnabled: asBoolean(settings.glowEnabled) ?? true,
    notificationStyle: asString(settings.notificationStyle) || reminder?.source.notificationStyle || 'Gentle',
    spokenReminder: asBoolean(settings.spokenReminder) ?? reminder?.source.spokenReminder ?? false,
    repeatRule: asString(settings.repeatRule) || reminder?.source.recurrence || 'Does not repeat',
    smartTiming: asBoolean(settings.smartTiming) ?? reminder?.source.smartTiming ?? true,
    location: asString(settings.location) || reminder?.source.location || '',
    person: asString(settings.person) || reminder?.source.person || '',
    routine: asString(settings.routine) || '',
  };
}

function verifiedTriggers(reminder: PlanReminderV2, overlay: OverlaySettings): Trigger[] {
  const values: Trigger[] = [];
  if (reminder.dueAt) values.push({ kind: 'time', label: 'Time Anchor', value: dueLabel(reminder.dueAt), provenance: 'source' });
  if (reminder.source.location) values.push({ kind: 'location', label: reminder.source.location, value: 'Apple source location', provenance: 'source' });
  else if (overlay.location) values.push({ kind: 'location', label: overlay.location, value: 'Glow trigger layer', provenance: 'glow' });
  if (reminder.source.person) values.push({ kind: 'person', label: `With ${reminder.source.person}`, value: 'Apple source person', provenance: 'source' });
  else if (overlay.person) values.push({ kind: 'person', label: `With ${overlay.person}`, value: 'Glow trigger layer', provenance: 'glow' });
  if (reminder.source.recurrence) values.push({ kind: 'routine', label: reminder.source.recurrence, value: 'Apple recurrence', provenance: 'source' });
  else if (overlay.routine) values.push({ kind: 'routine', label: overlay.routine, value: 'Glow routine trigger', provenance: 'glow' });
  if (!values.length) values.push({ kind: 'unscheduled', label: 'Unscheduled', value: 'No verified trigger', provenance: 'glow' });
  return values;
}

export function PlanRemindersV2({ reminders, connection, calendarEvents, settings }: { reminders: PlanReminderV2[]; connection: Connection; calendarEvents: PlanReminderCalendarEventV2[]; settings: ReminderSettingSnapshot }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const [selectedId, setSelectedId] = useState<string | null>(reminders.find((item) => !item.completed)?.id ?? reminders[0]?.id ?? null);
  const [draft, setDraft] = useState<OverlaySettings>(() => initialOverlay(reminders.find((item) => !item.completed) ?? reminders[0] ?? null, settings[`plan:reminder:${reminders.find((item) => !item.completed)?.id ?? reminders[0]?.id ?? ''}`] ?? {}));
  const [receipt, setReceipt] = useState('Source synced');
  const [isPending, startTransition] = useTransition();
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

  const selected = visible.find((item) => item.id === selectedId) ?? reminders.find((item) => item.id === selectedId) ?? visible[0] ?? reminders[0] ?? null;
  useEffect(() => {
    if (!selected) return;
    setDraft(initialOverlay(selected, settings[`plan:reminder:${selected.id}`] ?? {}));
  }, [selected?.id]);

  const triggers = selected ? verifiedTriggers(selected, draft) : [];
  const due = selected?.dueAt ? new Date(selected.dueAt) : null;
  const context = useMemo(() => {
    if (!selected || !due) return { overlap: null as PlanReminderCalendarEventV2 | null, previous: null as PlanReminderCalendarEventV2 | null, next: null as PlanReminderCalendarEventV2 | null };
    const rows = calendarEvents.map((event) => ({ ...event, start: new Date(event.startAt), end: event.endAt ? new Date(event.endAt) : new Date(new Date(event.startAt).getTime() + 60 * 60_000) })).sort((a, b) => a.start.getTime() - b.start.getTime());
    const overlap = rows.find((event) => !event.allDay && due >= event.start && due <= event.end) ?? null;
    const previous = [...rows].reverse().find((event) => event.end <= due) ?? null;
    const next = rows.find((event) => event.start >= due) ?? null;
    return { overlap, previous, next };
  }, [selected?.id, due?.getTime(), calendarEvents]);

  const top = visible.slice(0, 8);
  const connectionReady = connection?.status === 'connected' || reminders.length > 0;
  const quiet = draft.smartTiming && context.overlap;
  const quietCopy = !selected ? 'Choose a reminder to see timing context.' : !selected.dueAt ? 'No due time is stored, so Glow makes no timing claim.' : quiet ? `Stays quiet during “${context.overlap?.title}” and waits for a better moment.` : 'No blocking calendar context is detected at this reminder time.';

  const triggerRows: { kind: TriggerKind; title: string; value: string; provenance: string }[] = [
    { kind: 'time', title: 'Time', value: triggers.find((item) => item.kind === 'time')?.value ?? 'Not attached', provenance: triggers.find((item) => item.kind === 'time')?.provenance ?? '' },
    { kind: 'location', title: 'Location', value: triggers.find((item) => item.kind === 'location')?.label ?? 'Not attached', provenance: triggers.find((item) => item.kind === 'location')?.provenance ?? '' },
    { kind: 'person', title: 'Person', value: triggers.find((item) => item.kind === 'person')?.label ?? 'Not attached', provenance: triggers.find((item) => item.kind === 'person')?.provenance ?? '' },
    { kind: 'routine', title: 'Routine', value: triggers.find((item) => item.kind === 'routine')?.label ?? 'Not attached', provenance: triggers.find((item) => item.kind === 'routine')?.provenance ?? '' },
  ];

  const contextRows = selected ? [
    context.previous ? { time: new Date(context.previous.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), title: context.previous.title, state: 'No reminder' } : null,
    { time: selected.dueAt ? new Date(selected.dueAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'Unscheduled', title: selected.title, state: quiet ? 'Delayed gently' : draft.notificationStyle },
    context.next && context.next.id !== context.previous?.id ? { time: new Date(context.next.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), title: context.next.title, state: draft.repeatRule === 'Does not repeat' ? 'No repeat' : draft.repeatRule } : null,
  ].filter(Boolean) as { time: string; title: string; state: string }[] : [];

  function save() {
    if (!selected) return;
    startTransition(async () => {
      const result = await savePlanObjectSettingAction({ key: `plan:reminder:${selected.id}`, patch: draft, label: selected.title });
      if ('error' in result && result.error) setReceipt(result.error);
      else setReceipt('Glow reminder layer saved · Apple source unchanged');
    });
  }

  return (
    <PlanInstrumentChrome title="PLAN · REMINDERS" subtitle="Gentle nudges, in the right moment, in the right place. A calmer you, on time." activeInstrument="Reminders" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)} rightReceipt={isPending ? 'Saving…' : receipt} footerActionLabel={selected ? 'Save changes' : undefined} onFooterAction={selected ? save : undefined} remindersLayout>
      <section className={styles.stage} aria-label="Reminder context field">
        <div className={styles.orbits} aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i}/>)}</div>
        <div className={styles.pearls} aria-hidden="true">{Array.from({ length: 38 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties}/>)}</div>
        {top.map((reminder, index) => {
          const rowSettings = settings[`plan:reminder:${reminder.id}`] ?? {};
          const rowOverlay = initialOverlay(reminder, rowSettings);
          const trigger = verifiedTriggers(reminder, rowOverlay)[0];
          const Icon = triggerIcon(trigger.kind);
          return <div className={styles.reminderItem} data-pos={index} key={reminder.id}><div className={styles.triggerHead}><span><Icon/></span><div><strong>{trigger.label}</strong><small>{trigger.kind === 'time' ? 'Specific time' : trigger.kind === 'location' ? 'Location trigger' : trigger.kind === 'person' ? 'Person trigger' : trigger.kind === 'routine' ? 'Routine trigger' : 'No verified trigger'}</small></div></div><button type="button" aria-pressed={selected?.id === reminder.id} onClick={() => setSelectedId(reminder.id)}><span><Bell/></span><div><strong>{reminder.title}</strong><small>{dueLabel(reminder.dueAt)}</small></div><BellRing/></button></div>;
        })}

        <div className={styles.todayCore}><strong>{horizon === 'today' ? 'TODAY' : horizonLabel(horizon)}</strong><span>{horizon === 'today' ? now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'long' }) : `${visible.length} reminders`}</span></div>
        <div className={styles.quietCard}><span><Waves/></span><div><strong>Stays quiet when not ideal</strong><p>{quietCopy}</p></div></div>
        <blockquote>The right reminder,<br/>at the right moment,<br/>changes everything.</blockquote>
        {!connectionReady ? <div className={styles.emptyField}><strong>No reminder source connected.</strong><p>Glow keeps the field empty instead of inventing reminders.</p></div> : null}
      </section>

      <section className={styles.inspectorBand}>
        <article>
          <header>SELECTED REMINDER</header>
          {selected ? <><div className={styles.selectedHeader}><span><Bell/></span><div><strong>{selected.title}</strong><small>{dueLabel(selected.dueAt)}</small></div></div><Toggle label="Enabled in Glow" value={draft.glowEnabled} onChange={(value) => setDraft((current) => ({ ...current, glowEnabled: value }))}/><div className={styles.note}>{selected.notes?.trim() || 'No note attached.'}</div><div className={styles.tags}><span><ListChecks/> {selected.listName}</span>{selected.source.url ? <a href={selected.source.url}>Open source</a> : null}</div><small className={styles.sourceNote}>Apple reminder is read-only here. Glow settings below are a separate orchestration layer.</small></> : <p>No reminder selected.</p>}
        </article>

        <article>
          <header>TRIGGERS</header>
          <div className={styles.triggerRows}>{triggerRows.map((row) => { const Icon = triggerIcon(row.kind); return <div key={row.kind}><span><Icon/></span><div><strong>{row.title}</strong><small>{row.provenance === 'source' ? 'Apple source' : row.provenance === 'glow' ? 'Glow layer' : 'Not attached'}</small></div><b>{row.value}</b>{row.provenance !== 'source' ? <button type="button" onClick={() => setReceipt(`Edit ${row.title.toLowerCase()} in the Glow layer below`)}><Plus/></button> : <Check/>}</div>; })}</div>
          <div className={styles.triggerEditors}><input aria-label="Glow location trigger" value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} placeholder="Glow location"/><input aria-label="Glow person trigger" value={draft.person} onChange={(event) => setDraft((current) => ({ ...current, person: event.target.value }))} placeholder="Glow person"/><input aria-label="Glow routine trigger" value={draft.routine} onChange={(event) => setDraft((current) => ({ ...current, routine: event.target.value }))} placeholder="Glow routine"/></div>
        </article>

        <article>
          <header>REMINDER SETTINGS</header>
          <label className={styles.settingRow}><span><Bell/><div><strong>Notification style</strong><small>Glow orchestration layer</small></div></span><select value={draft.notificationStyle} onChange={(event) => setDraft((current) => ({ ...current, notificationStyle: event.target.value }))}><option>Gentle</option><option>Standard</option><option>Quiet</option></select></label>
          <Toggle label="Spoken reminder" sub={selected?.source.spokenReminder !== null ? 'Source preference available' : 'Glow layer preference'} value={draft.spokenReminder} onChange={(value) => setDraft((current) => ({ ...current, spokenReminder: value }))} icon={<Volume2/>}/>
          <label className={styles.settingRow}><span><Repeat2/><div><strong>Repeat</strong><small>{selected?.source.recurrence ? 'Apple recurrence is preserved' : 'Glow layer'}</small></div></span><select value={draft.repeatRule} onChange={(event) => setDraft((current) => ({ ...current, repeatRule: event.target.value }))} disabled={Boolean(selected?.source.recurrence)}><option>Does not repeat</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label>
          <Toggle label="Smart timing" sub="Avoids active calendar conflicts when possible" value={draft.smartTiming} onChange={(value) => setDraft((current) => ({ ...current, smartTiming: value }))} icon={<Sparkles/>}/>
        </article>

        <article>
          <header>CONTEXT PREVIEW</header>
          <div className={styles.contextRows}>{contextRows.length ? contextRows.map((row, index) => <div key={`${row.title}-${index}`}><i/><span><strong>{row.time}</strong><small>{row.title}</small></span><b>{row.state}</b></div>) : <p>No timed context can be previewed.</p>}</div>
          <div className={styles.contextSummary}><CalendarClock/>{quiet ? `Glow can hold this nudge until “${context.overlap?.title}” ends.` : selected?.dueAt ? 'No overlapping event is blocking this reminder.' : 'No timing claim is made until a real due time exists.'}</div>
        </article>
      </section>
    </PlanInstrumentChrome>
  );
}

function Toggle({ label, sub, value, onChange, icon }: { label: string; sub?: string; value: boolean; onChange: (value: boolean) => void; icon?: React.ReactNode }) {
  return <div className={styles.toggleRow}><span>{icon ?? <Bell/>}<div><strong>{label}</strong>{sub ? <small>{sub}</small> : null}</div></span><button type="button" aria-pressed={value} onClick={() => onChange(!value)}><i/></button></div>;
}
