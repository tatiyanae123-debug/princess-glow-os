'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crosshair,
  Flag,
  FolderKanban,
  Orbit,
  RotateCcw,
  Target,
} from 'lucide-react';
import type { CalendarEvent } from '@/lib/types';

type Scale = 'today' | 'week' | 'two-weeks' | 'month' | 'three-months';
type PlanMode = 'plan' | 'focus' | 'build' | 'reflect';

type Props = { initialEvents: CalendarEvent[] };

const DAY = 86_400_000;
const SCALES: { id: Scale; label: string }[] = [
  { id: 'today', label: 'TODAY' },
  { id: 'week', label: 'WEEK' },
  { id: 'two-weeks', label: '2 WEEKS' },
  { id: 'month', label: 'MONTH' },
  { id: 'three-months', label: '3 MONTHS' },
];

const RAIL = [
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Tasks', href: '/tasks', icon: CheckCircle2 },
  { label: 'Reminders', href: '/reminders', icon: Bell },
  { label: 'Goals', href: '/goals', icon: Target },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Routines', href: '/routines', icon: RotateCcw },
  { label: 'Habits', href: '/habits', icon: Orbit },
];

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}
function addDays(date: Date, count: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + count);
  return value;
}
function addMonths(date: Date, count: number) {
  const value = new Date(date);
  value.setMonth(value.getMonth() + count);
  return value;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}
function formatRange(event: CalendarEvent) {
  if (event.allDay) return 'All day';
  if (!event.endAt) return formatTime(event.startAt);
  return `${formatTime(event.startAt)} – ${formatTime(event.endAt)}`;
}
function eventMinutes(event: CalendarEvent) {
  if (event.allDay) return 0;
  const end = event.endAt ?? new Date(event.startAt.getTime() + 60 * 60_000);
  return Math.max(0, Math.round((end.getTime() - event.startAt.getTime()) / 60_000));
}
function duration(event: CalendarEvent) {
  if (event.allDay) return 'All day';
  const minutes = eventMinutes(event);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}
function labelDay(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
function eventColor(index: number) {
  return ['cool', 'violet', 'peach', 'mint', 'silver'][index % 5];
}
function monthDays(anchor: Date) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const sundayIndex = first.getDay();
  const start = addDays(first, -sundayIndex);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
function eventsBetween(events: CalendarEvent[], start: Date, end: Date) {
  const a = start.getTime();
  const b = end.getTime();
  return events.filter((event) => event.startAt.getTime() >= a && event.startAt.getTime() < b);
}
function scaleWindow(scale: Scale, anchor: Date) {
  const start = startOfDay(anchor);
  if (scale === 'today') return [start, addDays(start, 1)] as const;
  if (scale === 'week') return [start, addDays(start, 7)] as const;
  if (scale === 'two-weeks') return [start, addDays(start, 14)] as const;
  if (scale === 'month') return [new Date(anchor.getFullYear(), anchor.getMonth(), 1), new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)] as const;
  return [new Date(anchor.getFullYear(), anchor.getMonth(), 1), new Date(anchor.getFullYear(), anchor.getMonth() + 3, 1)] as const;
}
function moveAnchor(anchor: Date, scale: Scale, direction: -1 | 1) {
  if (scale === 'today') return addDays(anchor, direction);
  if (scale === 'week') return addDays(anchor, direction * 7);
  if (scale === 'two-weeks') return addDays(anchor, direction * 14);
  if (scale === 'month') return addMonths(anchor, direction);
  return addMonths(anchor, direction * 3);
}
function scaleHeading(scale: Scale, anchor: Date) {
  if (scale === 'today') return anchor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  if (scale === 'week') return `${labelDay(anchor)} → ${labelDay(addDays(anchor, 6))}`;
  if (scale === 'two-weeks') return `${labelDay(anchor)} → ${labelDay(addDays(anchor, 13))}`;
  if (scale === 'month') return anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return `${anchor.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} → ${addMonths(anchor, 2).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}
function ratioByDuration(events: CalendarEvent[], matcher: RegExp) {
  const total = events.reduce((sum, event) => sum + eventMinutes(event), 0);
  if (!total) return null;
  const matched = events.filter((event) => matcher.test(event.title)).reduce((sum, event) => sum + eventMinutes(event), 0);
  return Math.max(0, Math.min(100, Math.round((matched / total) * 100)));
}
function modeMatcher(mode: PlanMode) {
  if (mode === 'focus') return /focus|deep|study|design|write|research|work/i;
  if (mode === 'build') return /project|build|design|review|deadline|deliver|launch/i;
  return null;
}
function loadBins(events: CalendarEvent[]) {
  const bins = [0, 0, 0, 0];
  events.forEach((event) => {
    if (event.allDay) return;
    const hour = event.startAt.getHours();
    const index = hour < 9 ? 0 : hour < 13 ? 1 : hour < 17 ? 2 : 3;
    bins[index] += Math.max(15, eventMinutes(event));
  });
  const max = Math.max(1, ...bins);
  return bins.map((value) => Math.round((value / max) * 100));
}

export function PlanTimeObservatory({ initialEvents }: Props) {
  const router = useRouter();
  const [scale, setScale] = useState<Scale>('today');
  const [mode, setMode] = useState<PlanMode>('plan');
  const [anchor, setAnchor] = useState(() => new Date());
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  const ordered = useMemo(() => [...initialEvents].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()), [initialEvents]);
  const windowEvents = useMemo(() => {
    const [start, end] = scaleWindow(scale, anchor);
    return eventsBetween(ordered, start, end);
  }, [ordered, scale, anchor]);
  const todayEvents = useMemo(() => ordered.filter((event) => sameDay(event.startAt, anchor)), [ordered, anchor]);
  const visibleEvents = useMemo(() => {
    const matcher = modeMatcher(mode);
    if (!matcher) return windowEvents;
    const matched = windowEvents.filter((event) => matcher.test(event.title));
    return matched.length ? matched : windowEvents;
  }, [windowEvents, mode]);

  const conflictPairs = useMemo(() => {
    const timed = windowEvents.filter((e) => !e.allDay && e.endAt).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    const conflicts: [CalendarEvent, CalendarEvent][] = [];
    for (let i = 1; i < timed.length; i += 1) {
      const previous = timed[i - 1];
      if (previous.endAt && timed[i].startAt < previous.endAt) conflicts.push([previous, timed[i]]);
    }
    return conflicts;
  }, [windowEvents]);

  const openTime = useMemo(() => {
    const day = startOfDay(anchor);
    const availabilityStart = new Date(day); availabilityStart.setHours(7, 0, 0, 0);
    const availabilityEnd = new Date(day); availabilityEnd.setHours(22, 0, 0, 0);
    const timed = todayEvents.filter((e) => !e.allDay).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    let cursor = availabilityStart.getTime();
    let largest = 0;
    timed.forEach((event) => {
      const start = Math.max(event.startAt.getTime(), availabilityStart.getTime());
      const end = Math.min((event.endAt ?? new Date(event.startAt.getTime() + 60 * 60_000)).getTime(), availabilityEnd.getTime());
      if (start > cursor) largest = Math.max(largest, start - cursor);
      cursor = Math.max(cursor, end);
    });
    largest = Math.max(largest, availabilityEnd.getTime() - cursor);
    return Math.max(0, Math.round(largest / 60_000));
  }, [todayEvents, anchor]);

  const focusPercent = useMemo(() => ratioByDuration(windowEvents, /focus|deep|study|design|write|research|work/i), [windowEvents]);
  const meetingPercent = useMemo(() => ratioByDuration(windowEvents, /meeting|call|sync|appointment|interview/i), [windowEvents]);
  const adminPercent = useMemo(() => ratioByDuration(windowEvents, /admin|email|inbox|paperwork|forms|errand|book|confirm/i), [windowEvents]);
  const deadlineCues = windowEvents.filter((event) => /deadline|due|submit/i.test(event.title));
  const preparationEvents = windowEvents.filter((event) => Boolean(event.description?.trim()));
  const load = useMemo(() => loadBins(windowEvents), [windowEvents]);

  function openGlow(prompt?: string) {
    document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill: prompt, context: { room: 'Plan · Time Observatory', mode, scale } } }));
  }

  const modeCopy = mode === 'plan' ? 'All verified commitments' : mode === 'focus' ? 'Focus-like commitments emphasized' : mode === 'build' ? 'Project and delivery commitments emphasized' : 'Reviewing the shape of this plan';

  return (
    <div className="pto-root" data-scale={scale} data-mode={mode}>
      <div className="pto-world-light" aria-hidden="true" />
      <div className="pto-shell">
        <header className="pto-header">
          <div className="pto-title-block">
            <div className="pto-kicker">GLOW OS <span>·</span> PLAN</div>
            <h1>PLAN · THE TIME OBSERVATORY</h1>
            <p>See the arc. Shape the day. Align the becoming.</p>
          </div>

          <div className="pto-mode-switch" aria-label="Plan modes">
            {(['plan','focus','build','reflect'] as PlanMode[]).map((item) => (
              <button key={item} type="button" className={mode === item ? 'active' : ''} onClick={() => setMode(item)}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <button type="button" className="pto-ask" onClick={() => openGlow(`Help me with this ${scaleHeading(scale, anchor)} plan. Keep proposals separate from approved changes.`)}>
            <span className="pto-ask-pearl" aria-hidden="true" />
            <span>Ask Glow</span>
          </button>
        </header>

        <aside className="pto-rail" aria-label="Nearby Plan instruments">
          {RAIL.map(({ label, href, icon: Icon }) => (
            <button key={label} type="button" onClick={() => router.push(href)}>
              <span className="pto-rail-icon"><Icon size={19} /></span>
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <main className="pto-main">
          <section className="pto-stage" aria-label={`${scaleHeading(scale, anchor)} planning surface`}>
            <div className="pto-stage-glow" aria-hidden="true" />
            <div className="pto-mode-caption"><strong>{mode.toUpperCase()}</strong><span>{modeCopy}</span></div>
            {scale === 'today' ? <TodayOrbit events={mode === 'plan' || mode === 'reflect' ? todayEvents : visibleEvents.filter((event) => sameDay(event.startAt, anchor))} anchor={anchor} onSelect={setSelected} /> : null}
            {scale === 'week' ? <SevenDayArc events={visibleEvents} anchor={anchor} onSelect={setSelected} /> : null}
            {scale === 'two-weeks' ? <FourteenDayHorizon events={visibleEvents} anchor={anchor} onSelect={setSelected} /> : null}
            {scale === 'month' ? <MonthField events={visibleEvents} anchor={anchor} onSelect={setSelected} /> : null}
            {scale === 'three-months' ? <ThreeMonthHorizon events={visibleEvents} anchor={anchor} onSelect={setSelected} /> : null}
          </section>

          <aside className="pto-analysis">
            <div className="pto-analysis-card">
              <h2>TIME ANALYSIS</h2>
              <Metric label="Focus" value={focusPercent} />
              <Metric label="Meetings" value={meetingPercent} />
              <Metric label="Admin" value={adminPercent} />
              <p className="pto-analysis-note">Percentages use scheduled duration and explicit title cues. Unknown classifications stay unknown.</p>
            </div>
            <button className="pto-analysis-row danger" type="button" onClick={() => openGlow(`Resolve the ${conflictPairs.length} detected calendar conflict${conflictPairs.length === 1 ? '' : 's'}. Show the proposed moves and tradeoffs before changing anything.`)}><span><Flag size={14}/> {conflictPairs.length} conflict{conflictPairs.length === 1 ? '' : 's'}</span><b>{conflictPairs.length ? 'Resolve ›' : 'Clear'}</b></button>
            <button className="pto-analysis-row warning" type="button" onClick={() => openGlow('Review deadline cues and stored preparation notes in this plan. Do not invent missing preparation.')}><span><Crosshair size={14}/> {deadlineCues.length} deadline cue{deadlineCues.length === 1 ? '' : 's'}</span><b>Review ›</b></button>
            <div className="pto-score"><span>{conflictPairs.length ? conflictPairs.length : '✓'}</span><p>Schedule state<br/><b>{conflictPairs.length ? 'Conflict detected' : 'No overlap detected'}</b></p></div>
          </aside>

          <section className="pto-insights">
            <article>
              <h3>SCHEDULE LOAD</h3>
              <div className="pto-legend"><span><i className="you"/>Scheduled load</span><span><i className="ideal"/>No invented ideal</span></div>
              <div className="pto-load-bars" aria-label="Scheduled load by daypart">{load.map((value, index) => <i key={index} style={{ height: `${Math.max(6, value)}%` }} />)}</div>
              <div className="pto-chart-labels"><span>Morning</span><span>Midday</span><span>Afternoon</span><span>Evening</span></div>
            </article>
            <article>
              <h3>CONFLICTS</h3>
              {conflictPairs.length ? conflictPairs.slice(0,2).map(([a,b]) => <button key={`${a.id}-${b.id}`} type="button" onClick={() => openGlow(`Resolve the overlap between ${a.title} and ${b.title}. Show the proposal before applying it.`)}><span>{a.title}<small>{labelDay(a.startAt)} · {formatTime(a.startAt)}</small></span><b>{b.title}</b></button>) : <p className="pto-empty">No detected overlaps in this view.</p>}
            </article>
            <article>
              <h3>PREPARATION</h3>
              {preparationEvents.length ? <>{preparationEvents.slice(0,2).map((event) => <div className="pto-prep-record" key={event.id}><p className="pto-prep-title">{event.title} · {labelDay(event.startAt)}</p><p className="pto-prep-copy">{event.description}</p></div>)}<button className="pto-small-action" type="button" onClick={() => openGlow('Turn only the stored preparation notes in this view into an actionable preparation plan.')}>Open prep ✣</button></> : <p className="pto-empty">No explicit preparation notes are stored in this view. Glow will not invent them.</p>}
            </article>
            <article>
              <h3>OPEN TIME</h3>
              <p className="pto-open-time">Largest calendar-only opening</p>
              <strong>{Math.floor(openTime/60)}h {openTime%60}m</strong>
              <p className="pto-open-method">Calculated from 7 AM–10 PM calendar commitments. Travel, energy and preparation still need confirmation.</p>
              <button className="pto-small-action" type="button" onClick={() => openGlow('Find the best open time using my real calendar plus any verified preparation, travel, routine and capacity context available.')}>Find best time</button>
            </article>
          </section>

          <footer className="pto-footer">
            <div className="pto-scale-switch" aria-label="Time scale">
              {SCALES.map((item) => <button key={item.id} type="button" className={scale === item.id ? 'active' : ''} onClick={() => setScale(item.id)}>{item.label}</button>)}
            </div>
            <div className="pto-anchor-control">
              <button type="button" onClick={() => setAnchor(current => moveAnchor(current, scale, -1))} aria-label="Previous period"><ArrowLeft size={13}/></button>
              <button type="button" className="pto-anchor-label" onClick={() => setAnchor(new Date())}>{scaleHeading(scale, anchor)}</button>
              <button type="button" onClick={() => setAnchor(current => moveAnchor(current, scale, 1))} aria-label="Next period"><ArrowRight size={13}/></button>
            </div>
            <div className="pto-save"><button type="button" disabled aria-disabled="true">↶ UNDO</button><span>Live calendar ✓</span></div>
          </footer>
        </main>
      </div>

      {selected ? <EventLens event={selected} onClose={() => setSelected(null)} onGlow={openGlow} /> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return <div className="pto-meter"><span>{label}</span><i><b style={{ width: `${value ?? 0}%` }} /></i><strong>{value === null ? '—' : `${value}%`}</strong></div>;
}

function orbitPosition(event: CalendarEvent, index: number) {
  if (event.allDay) {
    const angle = ((index * 47) % 300 + 120) * Math.PI / 180;
    return [50 + Math.cos(angle) * 34, 50 + Math.sin(angle) * 25];
  }
  const minutes = event.startAt.getHours() * 60 + event.startAt.getMinutes();
  const progress = Math.max(0, Math.min(1, (minutes - 6 * 60) / (16 * 60)));
  const angle = (140 + progress * 260 + (index % 2 ? 3 : -3)) * Math.PI / 180;
  return [50 + Math.cos(angle) * 36, 51 + Math.sin(angle) * 28];
}

function TodayOrbit({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const visible = events.slice(0, 12);
  const now = new Date();
  const sameAnchor = sameDay(anchor, now);
  const nearEnd = new Date(anchor); nearEnd.setHours(Math.min(23, sameAnchor ? now.getHours() + 3 : 12), 0, 0, 0);
  return <div className="pto-today-orbit">
    <div className="pto-orbit-ring ring-1"/><div className="pto-orbit-ring ring-2"/><div className="pto-orbit-ring ring-3"/><div className="pto-orbit-ring ring-4"/>
    <div className="pto-time-label later"><b>LATER</b><span>{sameAnchor ? 'Later today' : 'Later in the day'}</span></div>
    <div className="pto-time-label near"><b>NEAR</b><span>{sameAnchor ? `Now – ${formatTime(nearEnd)}` : 'Morning'}</span></div>
    <div className="pto-time-label next"><b>NEXT</b><span>{sameAnchor ? 'Next commitments' : 'Afternoon'}</span></div>
    <button className="pto-today-core" type="button"><span>TODAY</span><small>{anchor.toLocaleDateString('en-US',{month:'short',day:'numeric',weekday:'long'})}</small></button>
    {visible.map((event,index) => { const [left, top] = orbitPosition(event, index); return <button type="button" className={`pto-orbit-event ${eventColor(index)}`} style={{ left:`${left}%`, top:`${top}%` }} key={event.id} onClick={() => onSelect(event)}><span className="pto-event-pearl"/><span><b>{event.title}</b><small>{formatRange(event)}</small></span><em>{duration(event)}</em></button>; })}
    {events.length > visible.length ? <div className="pto-overflow-count">+{events.length - visible.length} more commitments in this day</div> : null}
    {!visible.length ? <div className="pto-empty-orbit">This day is open. No commitments are being invented.</div> : null}
  </div>;
}

function SevenDayArc({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const days = Array.from({length:7},(_,i)=>addDays(anchor,i));
  return <div className="pto-seven"><div className="pto-seven-arc"/>
    <div className="pto-scale-copy"><span>WEEK PLAN</span><b>One week, held in a single arc.</b><p>Compare load, openings and commitments without turning the week into seven disconnected dashboards.</p></div>
    <div className="pto-day-arc">{days.map((day,index)=>{const dayEvents=events.filter(e=>sameDay(e.startAt,day));return <button className={`pto-day-node ${index===0?'current':''}`} type="button" key={day.toISOString()} onClick={()=>dayEvents[0]&&onSelect(dayEvents[0])}><span className="pto-day-pearl"/><small>{day.toLocaleDateString('en-US',{weekday:'short'})}</small><b>{day.getDate()}</b><em>{dayEvents.length} event{dayEvents.length===1?'':'s'}</em><i style={{height:`${Math.min(72,18+dayEvents.length*12)}px`}}/></button>})}</div>
    <div className="pto-week-events">{events.slice(0,7).map((event,index)=><button type="button" key={event.id} className={eventColor(index)} onClick={()=>onSelect(event)}><span className="pto-event-pearl"/><b>{event.title}</b><small>{labelDay(event.startAt)} · {formatRange(event)}</small></button>)}</div>
  </div>;
}

function FourteenDayHorizon({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const days = Array.from({length:14},(_,i)=>addDays(anchor,i));
  return <div className="pto-fourteen">
    <div className="pto-scale-copy"><span>2-WEEK PLAN</span><b>Near future becomes a double horizon.</b><p>The first seven days remain close. The second seven recede so pressure can be seen before it arrives.</p></div>
    <div className="pto-horizon horizon-near"><label>NEAR · DAYS 1–7</label>{days.slice(0,7).map((day,i)=>{const dayEvents=events.filter(e=>sameDay(e.startAt,day));return <button key={day.toISOString()} type="button" onClick={()=>dayEvents[0]&&onSelect(dayEvents[0])}><span className={`pto-horizon-pearl ${eventColor(i)}`}/><b>{day.toLocaleDateString('en-US',{weekday:'short'})} {day.getDate()}</b><small>{dayEvents.length ? `${dayEvents.length} scheduled`:'open'}</small></button>})}</div>
    <div className="pto-horizon horizon-far"><label>NEXT · DAYS 8–14</label>{days.slice(7).map((day,i)=>{const dayEvents=events.filter(e=>sameDay(e.startAt,day));return <button key={day.toISOString()} type="button" onClick={()=>dayEvents[0]&&onSelect(dayEvents[0])}><span className={`pto-horizon-pearl ${eventColor(i+2)}`}/><b>{day.toLocaleDateString('en-US',{weekday:'short'})} {day.getDate()}</b><small>{dayEvents.length ? `${dayEvents.length} scheduled`:'open'}</small></button>})}</div>
  </div>;
}

function MonthField({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const days=monthDays(anchor); const month=anchor.getMonth();
  return <div className="pto-month">
    <div className="pto-scale-copy"><span>MONTH PLAN</span><b>{anchor.toLocaleDateString('en-US',{month:'long'})} as a field, not a grid.</b><p>Busy dates gather weight. Open dates breathe. Explicit deadline cues become landmarks.</p></div>
    <div className="pto-month-weekdays">{['S','M','T','W','T','F','S'].map((d,i)=><span key={`${d}-${i}`}>{d}</span>)}</div>
    <div className="pto-month-field">{days.map((day,index)=>{const dayEvents=events.filter(e=>sameDay(e.startAt,day));const outside=day.getMonth()!==month;const landmark=dayEvents.some(e=>/deadline|due|submit|birthday|trip/i.test(e.title));return <button type="button" key={day.toISOString()} className={`${outside?'outside':''} ${landmark?'landmark':''}`} onClick={()=>dayEvents[0]&&onSelect(dayEvents[0])}><span>{day.getDate()}</span><i className={eventColor(index)} style={{transform:`scale(${1+Math.min(1.1,dayEvents.length*.22)})`}}/><small>{dayEvents.length||''}</small></button>})}</div>
  </div>;
}

function ThreeMonthHorizon({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const months = Array.from({ length: 3 }, (_, index) => new Date(anchor.getFullYear(), anchor.getMonth() + index, 1));
  return <div className="pto-year pto-three-months">
    <div className="pto-year-ring ring-a"/><div className="pto-year-ring ring-b"/>
    <div className="pto-scale-copy"><span>3-MONTH PLAN</span><b>{months[0].toLocaleDateString('en-US',{month:'short'})} → {months[2].toLocaleDateString('en-US',{month:'short',year:'numeric'})}</b><p>See the near horizon: dense weeks, open weeks and explicit landmarks without pretending to know more than the calendar contains.</p></div>
    <div className="pto-year-core"><span>3</span><small>MONTH HORIZON</small></div>
    <div className="pto-month-orbit">{months.map((month,index)=>{const monthEvents=events.filter(e=>e.startAt.getMonth()===month.getMonth()&&e.startAt.getFullYear()===month.getFullYear());return <button type="button" key={month.toISOString()} onClick={()=>monthEvents[0]&&onSelect(monthEvents[0])} style={{'--i':index} as React.CSSProperties}><i className={eventColor(index)}/><b>{month.toLocaleDateString('en-US',{month:'short'}).toUpperCase()}</b><small>{monthEvents.length} event{monthEvents.length===1?'':'s'}</small></button>})}</div>
  </div>;
}

function EventLens({ event, onClose, onGlow }: { event: CalendarEvent; onClose: () => void; onGlow: (prompt?: string) => void }) {
  return <div className="pto-lens-backdrop" role="presentation" onClick={onClose}><section className="pto-event-lens" role="dialog" aria-modal="true" aria-label={event.title} onClick={e=>e.stopPropagation()}><button className="pto-lens-close" type="button" onClick={onClose}>×</button><div className="pto-lens-pearl"/><p>TIME OBJECT</p><h2>{event.title}</h2><div className="pto-lens-meta"><span><CalendarDays size={13}/>{labelDay(event.startAt)}</span><span><Clock3 size={13}/>{formatRange(event)}</span></div>{event.location?<div className="pto-lens-location">{event.location}</div>:null}{event.description?<p className="pto-lens-description">{event.description}</p>:<p className="pto-lens-description">No description is stored for this event.</p>}<div className="pto-lens-actions"><button type="button" onClick={()=>onGlow(`Prepare me for ${event.title}. Use only real linked notes, tasks and context, and label anything inferred.`)}>Prepare with Glow</button><button type="button" onClick={()=>onGlow(`Find a better time for ${event.title}. Show me the proposal and consequences before changing anything.`)}>Find better time</button><button type="button" onClick={()=>onGlow(`What should I know about ${event.title}? Separate stored facts from inference.`)}>Ask about this</button></div></section></div>;
}
