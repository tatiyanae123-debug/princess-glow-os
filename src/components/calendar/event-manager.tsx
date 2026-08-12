'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EventForm } from '@/components/calendar/event-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteCalendarEventAction } from '@/app/actions/calendar-events';
import type { CalendarEvent } from '@/lib/types';

const views = ['Day', 'Week', 'Month', 'Year', 'Timeline'] as const;
const dayparts = [
  { label: 'MORNING', icon: '☀', range: '5AM – 10AM', start: 5, end: 10 },
  { label: 'AFTERNOON', icon: '☼', range: '10AM – 4PM', start: 10, end: 16 },
  { label: 'EVENING', icon: '◌', range: '4PM – 8:30PM', start: 16, end: 20.5 },
  { label: 'NIGHT', icon: '☾', range: '8:30PM – 11PM', start: 20.5, end: 24 },
] as const;

function startOfWeek(date: Date) {
  const value = new Date(date); const day = value.getDay();
  value.setDate(value.getDate() - (day === 0 ? 6 : day - 1)); value.setHours(0, 0, 0, 0); return value;
}
function sameDate(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function eventHour(event: CalendarEvent) { return event.startAt.getHours() + event.startAt.getMinutes() / 60; }
function eventTone(event: CalendarEvent) {
  const text = `${event.title} ${event.description || ''}`.toLowerCase();
  if (/work|focus|project|client/.test(text)) return 'lavender';
  if (/meal|lunch|dinner|breakfast|grocery/.test(text)) return 'peach';
  if (/workout|health|walk|gym/.test(text)) return 'sage';
  if (/routine|beauty|self/.test(text)) return 'blush';
  return 'blue';
}

export function EventManager({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const [events, setEvents] = useState([...initialEvents].sort((a,b) => a.startAt.getTime() - b.startAt.getTime()));
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeek(new Date()));
  const [activeView, setActiveView] = useState<(typeof views)[number]>('Week');
  const [dialogEvent, setDialogEvent] = useState<CalendarEvent | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
  const del = useServerAction((id: string) => deleteCalendarEventAction(id));
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekAnchor); d.setDate(d.getDate() + i); return d; }), [weekAnchor]);
  const weekEvents = events.filter(e => e.startAt >= days[0] && e.startAt < new Date(days[6].getTime() + 86_400_000));
  const busiest = days.map(d => ({ day:d, count:weekEvents.filter(e => sameDate(e.startAt,d)).length })).sort((a,b) => b.count-a.count)[0];

  function handleSaved(event: CalendarEvent) { setEvents(current => [...current.filter(e => e.id !== event.id), event].sort((a,b) => a.startAt.getTime()-b.startAt.getTime())); setDialogEvent(null); }
  function handleDelete() { if (!deleteTarget) return; del.run(deleteTarget.id, () => { setEvents(current => current.filter(e => e.id !== deleteTarget.id)); setDeleteTarget(null); }); }
  function moveWeek(amount: number) { setWeekAnchor(current => { const next = new Date(current); next.setDate(next.getDate() + amount * 7); return next; }); }

  return <div className="editorial-page calendar-page">
    <header className="calendar-heading"><div><h1>Calendar</h1><p>your time, intentionally designed. ♕</p></div><div className="calendar-views">{views.map(view => <button key={view} className={activeView === view ? 'active' : ''} onClick={() => setActiveView(view)}>{view}</button>)}</div></header>
    <div className="calendar-toolbar"><div><button onClick={() => moveWeek(-1)} aria-label="Previous week"><ChevronLeft /></button><button onClick={() => setWeekAnchor(startOfWeek(new Date()))}>Today</button></div><strong>{days[0].toLocaleDateString('en',{month:'long',day:'numeric'})} – {days[6].toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})}</strong><div><button onClick={() => moveWeek(1)} aria-label="Next week"><ChevronRight /></button><button className="add-event" onClick={() => setDialogEvent('new')}><Plus /> Add Event</button></div></div>
    <div className="calendar-layout">
      <div className="week-scroll"><section className="week-wall">
        <div className="week-corner" />{days.map(day => <header className={sameDate(day,new Date())?'today':''} key={day.toISOString()}><b>{day.toLocaleDateString('en',{weekday:'short'}).toUpperCase()}</b><span>{day.toLocaleDateString('en',{month:'short',day:'numeric'})}</span></header>)}
        {dayparts.map(part => <div className="daypart-row" key={part.label}>
          <aside><span>{part.icon}</span><b>{part.label}</b><small>{part.range}</small></aside>
          {days.map(day => <div className="day-cell" key={day.toISOString()}>{weekEvents.filter(e => sameDate(e.startAt,day) && (e.allDay ? part.label === 'MORNING' : eventHour(e)>=part.start && eventHour(e)<part.end)).map(event => <article className={`calendar-event ${eventTone(event)}`} key={event.id} onDoubleClick={() => setDialogEvent(event)}><div><b>{event.title}</b><time>{event.allDay?'All day':event.startAt.toLocaleTimeString('en',{hour:'numeric',minute:'2-digit'})}{event.endAt?` – ${event.endAt.toLocaleTimeString('en',{hour:'numeric',minute:'2-digit'})}`:''}</time></div><button onClick={() => setDialogEvent(event)} aria-label={`Edit ${event.title}`}><Pencil /></button><button onClick={() => setDeleteTarget(event)} aria-label={`Delete ${event.title}`}><Trash2 /></button></article>)}</div>)}
        </div>)}
      </section></div>
      <aside className="calendar-rail">
        <section className="mini-month"><div><button onClick={() => moveWeek(-4)}>‹</button><b>{weekAnchor.toLocaleDateString('en',{month:'long',year:'numeric'}).toUpperCase()}</b><button onClick={() => moveWeek(4)}>›</button></div><p>{['S','M','T','W','T','F','S'].map((d,i)=><b key={`${d}${i}`}>{d}</b>)}</p><div>{Array.from({length:35},(_,i)=>{const first=new Date(weekAnchor.getFullYear(),weekAnchor.getMonth(),1); const num=i-first.getDay()+1; return <span className={num===new Date().getDate()&&weekAnchor.getMonth()===new Date().getMonth()?'current':''} key={i}>{num>0&&num<=new Date(weekAnchor.getFullYear(),weekAnchor.getMonth()+1,0).getDate()?num:''}</span>})}</div></section>
        <section><h2>UPCOMING EVENTS</h2>{events.filter(e=>e.startAt>=new Date()).slice(0,5).map(e=><p className="upcoming-event" key={e.id}><i className={eventTone(e)} /><span>{e.title}<small>{e.startAt.toLocaleDateString('en',{weekday:'short'})} · {e.startAt.toLocaleTimeString('en',{hour:'numeric',minute:'2-digit'})}</small></span></p>)}{!events.some(e=>e.startAt>=new Date())&&<small>No upcoming events.</small>}</section>
        <section><h2>WEEK OVERVIEW</h2><div className="calendar-metric"><strong>{weekEvents.length}<small>Events</small></strong><p><span>BUSIEST DAY <b>{busiest?.count ? busiest.day.toLocaleDateString('en',{weekday:'long'}) : '—'}</b></span><span>OPEN DAYS <b>{days.filter(d=>!weekEvents.some(e=>sameDate(e.startAt,d))).length}</b></span></p></div></section>
        <section className="calendar-insight"><h2>CALENDAR INTELLIGENCE <Sparkles /></h2><p>{busiest?.count ? `${busiest.day.toLocaleDateString('en',{weekday:'long'})} is your busiest day with ${busiest.count} event${busiest.count===1?'':'s'}.` : 'This week is open. Protect a block for your highest priority.'}</p></section>
      </aside>
    </div>
    <Dialog open={dialogEvent!==null} onClose={()=>setDialogEvent(null)} title={dialogEvent==='new'?'Add event':'Edit event'}><EventForm event={dialogEvent==='new'?null:dialogEvent} onSaved={handleSaved} onCancel={()=>setDialogEvent(null)} /></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this event?" description={deleteTarget?`“${deleteTarget.title}” will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete} />
  </div>;
}
