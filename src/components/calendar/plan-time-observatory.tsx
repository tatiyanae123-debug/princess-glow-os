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
  Goal,
  Orbit,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import type { CalendarEvent } from '@/lib/types';

type Scale = 'today' | '7d' | '14d' | 'month' | 'year';
type PlanMode = 'plan' | 'focus' | 'build' | 'reflect';

type Props = { initialEvents: CalendarEvent[] };

const DAY = 86_400_000;
const SCALES: { id: Scale; label: string }[] = [
  { id: 'today', label: 'TODAY' },
  { id: '7d', label: '7 DAYS' },
  { id: '14d', label: '14 DAYS' },
  { id: 'month', label: 'MONTH' },
  { id: 'year', label: 'YEAR' },
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
function duration(event: CalendarEvent) {
  if (event.allDay) return 'All day';
  if (!event.endAt) return '';
  const minutes = Math.max(0, Math.round((event.endAt.getTime() - event.startAt.getTime()) / 60000));
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
  const mondayIndex = (first.getDay() + 6) % 7;
  const start = addDays(first, -mondayIndex);
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
  if (scale === '7d') return [start, addDays(start, 7)] as const;
  if (scale === '14d') return [start, addDays(start, 14)] as const;
  if (scale === 'month') return [new Date(anchor.getFullYear(), anchor.getMonth(), 1), new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)] as const;
  return [new Date(anchor.getFullYear(), 0, 1), new Date(anchor.getFullYear() + 1, 0, 1)] as const;
}
function moveAnchor(anchor: Date, scale: Scale, direction: -1 | 1) {
  if (scale === 'today') return addDays(anchor, direction);
  if (scale === '7d') return addDays(anchor, direction * 7);
  if (scale === '14d') return addDays(anchor, direction * 14);
  if (scale === 'month') return new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1);
  return new Date(anchor.getFullYear() + direction, anchor.getMonth(), 1);
}
function scaleHeading(scale: Scale, anchor: Date) {
  if (scale === 'today') return anchor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  if (scale === '7d') return `${labelDay(anchor)} → ${labelDay(addDays(anchor, 6))}`;
  if (scale === '14d') return `${labelDay(anchor)} → ${labelDay(addDays(anchor, 13))}`;
  if (scale === 'month') return anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return String(anchor.getFullYear());
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
    const workStart = new Date(day); workStart.setHours(8, 0, 0, 0);
    const workEnd = new Date(day); workEnd.setHours(21, 0, 0, 0);
    const timed = todayEvents.filter((e) => !e.allDay).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    let cursor = workStart.getTime();
    let largest = 0;
    timed.forEach((e) => {
      largest = Math.max(largest, e.startAt.getTime() - cursor);
      cursor = Math.max(cursor, e.endAt?.getTime() ?? e.startAt.getTime() + 60 * 60_000);
    });
    largest = Math.max(largest, workEnd.getTime() - cursor);
    return Math.max(0, Math.round(largest / 60_000));
  }, [todayEvents, anchor]);

  const focusPercent = useMemo(() => {
    const totalMinutes = windowEvents.reduce((sum, event) => sum + (event.allDay ? 0 : Math.max(30, event.endAt ? (event.endAt.getTime() - event.startAt.getTime()) / 60000 : 60)), 0);
    if (!totalMinutes) return 72;
    const focusLike = windowEvents.filter((event) => /focus|deep|design|study|work|build|project/i.test(event.title)).reduce((sum, event) => sum + (event.endAt ? Math.max(30, (event.endAt.getTime() - event.startAt.getTime()) / 60000) : 60), 0);
    return Math.min(92, Math.max(18, Math.round((focusLike / totalMinutes) * 100)));
  }, [windowEvents]);

  function openGlow(prompt?: string) {
    document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill: prompt } }));
  }

  return (
    <div className="pto-root" data-scale={scale}>
      <div className="pto-world-light" aria-hidden="true" />
      <div className="pto-shell">
        <header className="pto-header">
          <div className="pto-title-block">
            <div className="pto-kicker">GLOW OS BATCH 1 <span>·</span> WORLD 2</div>
            <h1>PLAN · THE TIME OBSERVATORY</h1>
            <p>See the arc. Shape the day. Align the becoming.</p>
          </div>

          <div className="pto-mode-switch" aria-label="Plan modes">
            {(['plan','focus','build','reflect'] as PlanMode[]).map((item) => (
              <button key={item} type="button" className={mode === item ? 'active' : ''} onClick={() => { setMode(item); if (item !== 'plan') openGlow(`${item[0].toUpperCase()+item.slice(1)} with me using this ${scale === 'today' ? 'day' : scale} plan.`); }}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>

          <button type="button" className="pto-ask" onClick={() => openGlow(`Help me plan this ${scale === 'today' ? 'day' : scale} view.`)}>
            <span className="pto-ask-pearl" aria-hidden="true" />
            <span>Ask Glow</span>
          </button>
        </header>

        <aside className="pto-rail">
          {RAIL.map(({ label, href, icon: Icon }, index) => (
            <button key={label} type="button" className={index === 0 ? 'active' : ''} onClick={() => router.push(href)}>
              <span className="pto-rail-icon"><Icon size={19} /></span>
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <main className="pto-main">
          <section className="pto-stage" aria-label={`${scaleHeading(scale, anchor)} planning surface`}>
            <div className="pto-stage-glow" aria-hidden="true" />
            {scale === 'today' ? <TodayOrbit events={todayEvents} anchor={anchor} onSelect={setSelected} /> : null}
            {scale === '7d' ? <SevenDayArc events={windowEvents} anchor={anchor} onSelect={setSelected} /> : null}
            {scale === '14d' ? <FourteenDayHorizon events={windowEvents} anchor={anchor} onSelect={setSelected} /> : null}
            {scale === 'month' ? <MonthField events={windowEvents} anchor={anchor} onSelect={setSelected} /> : null}
            {scale === 'year' ? <YearOrbit events={windowEvents} anchor={anchor} onSelect={setSelected} /> : null}
          </section>

          <aside className="pto-analysis">
            <div className="pto-analysis-card">
              <h2>TIME ANALYSIS</h2>
              <div className="pto-meter"><span>Focus</span><i><b style={{ width: `${focusPercent}%` }} /></i><strong>{focusPercent}%</strong></div>
              <div className="pto-meter"><span>Meetings</span><i><b style={{ width: `${Math.min(85, Math.round(windowEvents.filter(e => /meeting|call|sync|appointment/i.test(e.title)).length / Math.max(1,windowEvents.length) * 100))}%` }} /></i><strong>{Math.min(85, Math.round(windowEvents.filter(e => /meeting|call|sync|appointment/i.test(e.title)).length / Math.max(1,windowEvents.length) * 100))}%</strong></div>
              <div className="pto-meter"><span>Admin</span><i><b style={{ width: `${Math.max(8, 100-focusPercent-24)}%` }} /></i><strong>{Math.max(8, 100-focusPercent-24)}%</strong></div>
            </div>
            <button className="pto-analysis-row danger" type="button" onClick={() => openGlow(`Resolve the ${conflictPairs.length} schedule conflict${conflictPairs.length === 1 ? '' : 's'} in my ${scale} plan. Show me the proposal first.`)}><span><Flag size={14}/> {conflictPairs.length} conflict{conflictPairs.length === 1 ? '' : 's'}</span><b>Resolve ›</b></button>
            <button className="pto-analysis-row warning" type="button" onClick={() => openGlow(`Show me deadlines and preparation I should handle in this ${scale} plan.`)}><span><Crosshair size={14}/> {windowEvents.filter(e => /deadline|due|review|submit/i.test(e.title)).length} deadline</span><b>Prepare ›</b></button>
            <div className="pto-score"><span>{Math.max(58, 100 - conflictPairs.length * 8)}</span><p>Schedule score<br/><b>{conflictPairs.length ? 'Needs shaping' : 'Excellent'}</b></p></div>
          </aside>

          <section className="pto-insights">
            <article>
              <h3>SCHEDULE COMPARISON</h3>
              <div className="pto-legend"><span><i className="you"/>You</span><span><i className="ideal"/>Ideal</span></div>
              <div className="pto-mini-chart" aria-hidden="true"><i/><i/><i/></div>
              <div className="pto-chart-labels"><span>6A</span><span>12P</span><span>6P</span></div>
            </article>
            <article>
              <h3>CONFLICTS</h3>
              {conflictPairs.length ? conflictPairs.slice(0,2).map(([a,b]) => <button key={`${a.id}-${b.id}`} type="button" onClick={() => openGlow(`Resolve the overlap between ${a.title} and ${b.title}.`)}><span>{a.title}<small>{labelDay(a.startAt)} · {formatTime(a.startAt)}</small></span><b>{b.title}</b></button>) : <p className="pto-empty">No detected overlaps in this view.</p>}
            </article>
            <article>
              <h3>PREPARATION</h3>
              {windowEvents[0] ? <><p className="pto-prep-title">{windowEvents[0].title} · {labelDay(windowEvents[0].startAt)}</p><p className="pto-prep-copy">Glow can surface what needs to happen before this.</p><button className="pto-small-action" type="button" onClick={() => openGlow(`Prepare me for ${windowEvents[0].title}.`)}>Open prep ✣</button></> : <p className="pto-empty">Nothing needs preparation yet.</p>}
            </article>
            <article>
              <h3>OPEN TIME</h3>
              <p className="pto-open-time">Largest opening</p>
              <strong>{Math.floor(openTime/60)}h {openTime%60}m</strong>
              <button className="pto-small-action" type="button" onClick={() => openGlow(`Find the best open time in my ${scale} plan.`)}>Find best time</button>
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
            <div className="pto-save"><button type="button" onClick={() => openGlow('Undo my last approved planning change if possible.')}>↶ UNDO</button><span>Saved just now ✓</span></div>
          </footer>
        </main>
      </div>

      {selected ? <EventLens event={selected} onClose={() => setSelected(null)} onGlow={openGlow} /> : null}
    </div>
  );
}

function TodayOrbit({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const visible = events.slice(0, 8);
  const positions = [[18,71],[37,80],[64,78],[82,65],[77,37],[59,24],[37,27],[19,40]];
  return <div className="pto-today-orbit">
    <div className="pto-orbit-ring ring-1"/><div className="pto-orbit-ring ring-2"/><div className="pto-orbit-ring ring-3"/><div className="pto-orbit-ring ring-4"/>
    <div className="pto-time-label later"><b>LATER</b><span>{labelDay(addDays(anchor,14))} and beyond</span></div>
    <div className="pto-time-label near"><b>NEAR</b><span>{labelDay(addDays(anchor,1))} – {labelDay(addDays(anchor,3))}</span></div>
    <div className="pto-time-label next"><b>NEXT</b><span>{labelDay(addDays(anchor,4))} – {labelDay(addDays(anchor,7))}</span></div>
    <button className="pto-today-core" type="button"><span>TODAY</span><small>{anchor.toLocaleDateString('en-US',{month:'short',day:'numeric',weekday:'long'})}</small></button>
    {visible.map((event,index) => <button type="button" className={`pto-orbit-event ${eventColor(index)}`} style={{ left:`${positions[index][0]}%`, top:`${positions[index][1]}%` }} key={event.id} onClick={() => onSelect(event)}><span className="pto-event-pearl"/><span><b>{event.title}</b><small>{formatRange(event)}</small></span><em>{duration(event)}</em></button>)}
    {!visible.length ? <div className="pto-empty-orbit">Today is open. The observatory is waiting for you.</div> : null}
  </div>;
}

function SevenDayArc({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const days = Array.from({length:7},(_,i)=>addDays(anchor,i));
  return <div className="pto-seven"><div className="pto-seven-arc"/>
    <div className="pto-scale-copy"><span>7-DAY PLAN</span><b>One week, held in a single arc.</b><p>Compare load, openings, and commitments without turning the week into seven disconnected columns.</p></div>
    <div className="pto-day-arc">{days.map((day,index)=>{const dayEvents=events.filter(e=>sameDay(e.startAt,day));return <button className={`pto-day-node ${index===0?'current':''}`} type="button" key={day.toISOString()} onClick={()=>dayEvents[0]&&onSelect(dayEvents[0])}><span className="pto-day-pearl"/><small>{day.toLocaleDateString('en-US',{weekday:'short'})}</small><b>{day.getDate()}</b><em>{dayEvents.length} event{dayEvents.length===1?'':'s'}</em><i style={{height:`${Math.min(72,18+dayEvents.length*12)}px`}}/></button>})}</div>
    <div className="pto-week-events">{events.slice(0,5).map((event,index)=><button type="button" key={event.id} className={eventColor(index)} onClick={()=>onSelect(event)}><span className="pto-event-pearl"/><b>{event.title}</b><small>{labelDay(event.startAt)} · {formatRange(event)}</small></button>)}</div>
  </div>;
}

function FourteenDayHorizon({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const days = Array.from({length:14},(_,i)=>addDays(anchor,i));
  return <div className="pto-fourteen">
    <div className="pto-scale-copy"><span>14-DAY PLAN</span><b>Near future becomes a double horizon.</b><p>The first seven days remain close. The second seven recede so you can see pressure before it arrives.</p></div>
    <div className="pto-horizon horizon-near"><label>NEAR · DAYS 1–7</label>{days.slice(0,7).map((day,i)=>{const count=events.filter(e=>sameDay(e.startAt,day)).length;return <button key={day.toISOString()} type="button" onClick={()=>{const event=events.find(e=>sameDay(e.startAt,day));if(event)onSelect(event)}}><span className={`pto-horizon-pearl ${eventColor(i)}`}/><b>{day.toLocaleDateString('en-US',{weekday:'short'})} {day.getDate()}</b><small>{count ? `${count} scheduled`:'open'}</small></button>})}</div>
    <div className="pto-horizon horizon-far"><label>NEXT · DAYS 8–14</label>{days.slice(7).map((day,i)=>{const count=events.filter(e=>sameDay(e.startAt,day)).length;return <button key={day.toISOString()} type="button" onClick={()=>{const event=events.find(e=>sameDay(e.startAt,day));if(event)onSelect(event)}}><span className={`pto-horizon-pearl ${eventColor(i+2)}`}/><b>{day.toLocaleDateString('en-US',{weekday:'short'})} {day.getDate()}</b><small>{count ? `${count} scheduled`:'open'}</small></button>})}</div>
  </div>;
}

function MonthField({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const days=monthDays(anchor); const month=anchor.getMonth();
  return <div className="pto-month">
    <div className="pto-scale-copy"><span>MONTH PLAN</span><b>{anchor.toLocaleDateString('en-US',{month:'long'})} as a field, not a grid.</b><p>Busy dates gather weight. Open dates breathe. Deadlines become landmarks.</p></div>
    <div className="pto-month-weekdays">{['M','T','W','T','F','S','S'].map((d,i)=><span key={`${d}-${i}`}>{d}</span>)}</div>
    <div className="pto-month-field">{days.map((day,index)=>{const dayEvents=events.filter(e=>sameDay(e.startAt,day));const outside=day.getMonth()!==month;const landmark=dayEvents.some(e=>/deadline|due|review|submit|birthday|trip/i.test(e.title));return <button type="button" key={day.toISOString()} className={`${outside?'outside':''} ${landmark?'landmark':''}`} onClick={()=>dayEvents[0]&&onSelect(dayEvents[0])}><span>{day.getDate()}</span><i className={eventColor(index)} style={{transform:`scale(${1+Math.min(1.1,dayEvents.length*.22)})`}}/><small>{dayEvents.length||''}</small></button>})}</div>
  </div>;
}

function YearOrbit({ events, anchor, onSelect }: { events: CalendarEvent[]; anchor: Date; onSelect: (e: CalendarEvent) => void }) {
  const months=Array.from({length:12},(_,i)=>new Date(anchor.getFullYear(),i,1));
  return <div className="pto-year">
    <div className="pto-year-ring ring-a"/><div className="pto-year-ring ring-b"/>
    <div className="pto-scale-copy"><span>YEAR PLAN</span><b>{anchor.getFullYear()} · the long horizon.</b><p>See the shape of the year: dense seasons, open seasons, deadlines, travel, and recurring commitments.</p></div>
    <div className="pto-year-core"><span>{anchor.getFullYear()}</span><small>THE LONG HORIZON</small></div>
    <div className="pto-month-orbit">{months.map((month,index)=>{const monthEvents=events.filter(e=>e.startAt.getMonth()===index&&e.startAt.getFullYear()===anchor.getFullYear());return <button type="button" key={month.toISOString()} onClick={()=>monthEvents[0]&&onSelect(monthEvents[0])} style={{'--i':index} as React.CSSProperties}><i className={eventColor(index)}/><b>{month.toLocaleDateString('en-US',{month:'short'}).toUpperCase()}</b><small>{monthEvents.length} event{monthEvents.length===1?'':'s'}</small></button>})}</div>
  </div>;
}

function EventLens({ event, onClose, onGlow }: { event: CalendarEvent; onClose: () => void; onGlow: (prompt?: string) => void }) {
  return <div className="pto-lens-backdrop" role="presentation" onClick={onClose}><section className="pto-event-lens" role="dialog" aria-modal="true" aria-label={event.title} onClick={e=>e.stopPropagation()}><button className="pto-lens-close" type="button" onClick={onClose}>×</button><div className="pto-lens-pearl"/><p>TIME OBJECT</p><h2>{event.title}</h2><div className="pto-lens-meta"><span><CalendarDays size={13}/>{labelDay(event.startAt)}</span><span><Clock3 size={13}/>{formatRange(event)}</span></div>{event.location?<div className="pto-lens-location">{event.location}</div>:null}{event.description?<p className="pto-lens-description">{event.description}</p>:null}<div className="pto-lens-actions"><button type="button" onClick={()=>onGlow(`Prepare me for ${event.title}.`)}>Prepare with Glow</button><button type="button" onClick={()=>onGlow(`Find a better time for ${event.title}. Show me the proposal before changing anything.`)}>Find better time</button><button type="button" onClick={()=>onGlow(`What should I know about ${event.title}?`)}>Ask about this</button></div></section></div>;
}
