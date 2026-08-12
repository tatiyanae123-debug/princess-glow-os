'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EventForm } from '@/components/calendar/event-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { convertCalendarEventToTaskAction, deleteCalendarEventAction } from '@/app/actions/calendar-events';
import type { CalendarEvent } from '@/lib/types';

type ViewMode = 'day' | 'week' | 'month' | 'flow';

const DAY_MS = 86_400_000;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function startOfWeek(date: Date) {
  const next = startOfDay(date);
  const day = next.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + mondayOffset);
  return next;
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  return new Date(start.getTime() + 7 * DAY_MS - 1);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, -1);
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function eventDuration(event: CalendarEvent) {
  if (event.allDay) return 'All day';
  if (!event.endAt) return event.startAt.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
  const minutes = Math.max(0, Math.round((event.endAt.getTime() - event.startAt.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function rangeLabel(anchor: Date, mode: ViewMode) {
  if (mode === 'day' || mode === 'flow') {
    return anchor.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  if (mode === 'week') {
    const start = startOfWeek(anchor);
    const end = endOfWeek(anchor);
    return `${start.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`;
  }
  return anchor.toLocaleDateString('en', { month: 'long', year: 'numeric' });
}

function eventsInRange(events: CalendarEvent[], anchor: Date, mode: ViewMode) {
  if (mode === 'day' || mode === 'flow') return events.filter((event) => sameDay(event.startAt, anchor));
  if (mode === 'week') {
    const start = startOfWeek(anchor).getTime();
    const end = endOfWeek(anchor).getTime();
    return events.filter((event) => event.startAt.getTime() >= start && event.startAt.getTime() <= end);
  }
  const start = startOfMonth(anchor).getTime();
  const end = endOfMonth(anchor).getTime();
  return events.filter((event) => event.startAt.getTime() >= start && event.startAt.getTime() <= end);
}

function moveAnchor(anchor: Date, mode: ViewMode, direction: -1 | 1) {
  const next = new Date(anchor);
  if (mode === 'day' || mode === 'flow') next.setDate(next.getDate() + direction);
  else if (mode === 'week') next.setDate(next.getDate() + 7 * direction);
  else next.setMonth(next.getMonth() + direction);
  return next;
}

function buildWeekDays(anchor: Date) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => new Date(start.getTime() + index * DAY_MS));
}

function buildMonthDays(anchor: Date) {
  const monthStart = startOfMonth(anchor);
  const gridStart = startOfWeek(monthStart);
  return Array.from({ length: 42 }, (_, index) => new Date(gridStart.getTime() + index * DAY_MS));
}

const CALENDAR_VIEWS = new Set<ViewMode>(['day', 'week', 'month', 'flow']);

export function EventManager({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view');
  const initialView: ViewMode = requestedView && CALENDAR_VIEWS.has(requestedView as ViewMode) ? (requestedView as ViewMode) : 'week';
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [dialogEvent, setDialogEvent] = useState<CalendarEvent | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<ViewMode>(initialView);
  const [anchor, setAnchor] = useState(() => new Date());
  const del = useServerAction((id: string) => deleteCalendarEventAction(id));
  const convert = useServerAction(convertCalendarEventToTaskAction);

  const visibleEvents = useMemo(() => eventsInRange(events, anchor, view), [events, anchor, view]);
  const nextEvent = useMemo(() => events.filter((event) => event.startAt.getTime() >= Date.now())[0] ?? null, [events]);
  const todayEvents = useMemo(() => events.filter((event) => sameDay(event.startAt, new Date())), [events]);
  const weekDays = useMemo(() => buildWeekDays(anchor), [anchor]);
  const monthDays = useMemo(() => buildMonthDays(anchor), [anchor]);

  const schedulingInsight = useMemo(() => {
    const timed = todayEvents.filter((event) => !event.allDay).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    if (timed.length === 0) return 'Today is unusually open. Protect a 60–90 minute focus block before adding more commitments.';
    if (timed.length === 1) return 'You only have one timed commitment today. Keep at least one recovery or focus block around it.';
    let largestGap = 0;
    for (let i = 1; i < timed.length; i += 1) {
      const previousEnd = timed[i - 1].endAt?.getTime() ?? timed[i - 1].startAt.getTime() + 60 * 60_000;
      largestGap = Math.max(largestGap, timed[i].startAt.getTime() - previousEnd);
    }
    if (largestGap >= 2 * 60 * 60_000) return `Glow found a ${Math.round(largestGap / 3_600_000)}-hour opening between commitments today. Use it for deep work, fitness, or a reset.`;
    return 'Today is tightly packed. Avoid adding another fixed commitment unless it replaces something else.';
  }, [todayEvents]);

  function handleSaved(event: CalendarEvent) {
    setEvents((current) => {
      const exists = current.some((item) => item.id === event.id);
      const next = exists ? current.map((item) => (item.id === event.id ? event : item)) : [event, ...current];
      return [...next].sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    });
    setDialogEvent(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setEvents((current) => current.filter((event) => event.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  function eventActions(event: CalendarEvent) {
    return (
      <div className="flex items-center gap-1">
        {event.editable ? (
          <button type="button" onClick={() => setDialogEvent(event)} aria-label="Edit event" className="rounded-full p-1.5 text-[#8a7884] hover:bg-white/60">
            <Pencil size={11} />
          </button>
        ) : null}
        <button type="button" onClick={() => setDeleteTarget(event)} aria-label="Delete event" className="rounded-full p-1.5 text-[#8a7884] hover:bg-white/60">
          <Trash2 size={11} />
        </button>
      </div>
    );
  }

  function eventCard(event: CalendarEvent, compact = false) {
    return (
      <div key={event.id} className="rounded-[14px] border border-[#eadfe7] bg-white/55 p-3 shadow-[0_8px_24px_rgba(94,70,85,.04)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="glow-display truncate text-[13px] text-[#453944]">{event.title}</p>
            <p className="mt-1 flex items-center gap-1 text-[8px] text-[#7d707a]"><Clock3 size={9} />{event.allDay ? 'All day' : event.startAt.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })} · {eventDuration(event)}</p>
          </div>
          {eventActions(event)}
        </div>
        {!compact && event.description ? <p className="mt-2 line-clamp-2 text-[8px] leading-4 text-[#81757d]">{event.description}</p> : null}
        {!compact && event.location ? <p className="mt-2 text-[8px] text-[#8f8089]">{event.location}</p> : null}
        {!compact && event.source === 'google_calendar' ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#f5edf4] px-2 py-1 text-[7px] text-[#786878]">Google Calendar</span>
            <Button type="button" variant="secondary" disabled={convert.isPending} onClick={() => convert.run({ eventId: event.id })}>Convert to task</Button>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1.15fr_.85fr]">
        <Card className="relative overflow-hidden p-5">
          <CalendarDays size={54} strokeWidth={0.8} className="absolute right-4 top-3 text-[#8d7894]/18" />
          <p className="glow-eyebrow">Calendar command wall</p>
          <p className="glow-display mt-2 text-[23px] text-[#40343f]">{nextEvent?.title ?? 'A spacious week'}</p>
          <p className="mt-2 text-[9px] leading-4 text-[#776b77]">{nextEvent ? `Next: ${nextEvent.startAt.toLocaleString('en', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'Your calendar is open enough to design around what matters.'}</p>
        </Card>
        <Card className="bg-[linear-gradient(145deg,#ece5ef,#f7f0ed)] p-5">
          <p className="glow-display text-[16px] text-[#4d414c]">Shape the week.</p>
          <p className="mt-2 text-[9px] leading-4 text-[#81747e]">Add commitments first, then protect the space around them.</p>
          <Button onClick={() => setDialogEvent('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12} />Add event</Button>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {(['day', 'week', 'month', 'flow'] as ViewMode[]).map((mode) => (
              <Button key={mode} type="button" variant={view === mode ? 'primary' : 'secondary'} onClick={() => setView(mode)} className="capitalize">{mode === 'flow' ? 'Daily flow' : mode}</Button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 lg:justify-end">
            <Button type="button" variant="ghost" aria-label="Previous period" onClick={() => setAnchor((current) => moveAnchor(current, view, -1))}><ChevronLeft size={14} /></Button>
            <button type="button" onClick={() => setAnchor(new Date())} className="min-w-[170px] text-center">
              <p className="glow-display text-[14px] text-[#4b3f49]">{rangeLabel(anchor, view)}</p>
              <p className="mt-0.5 text-[7px] uppercase tracking-[.16em] text-[#9a8995]">Tap to return to today</p>
            </button>
            <Button type="button" variant="ghost" aria-label="Next period" onClick={() => setAnchor((current) => moveAnchor(current, view, 1))}><ChevronRight size={14} /></Button>
          </div>
        </div>
      </Card>

      {view === 'day' ? (
        <Card className="p-4">
          <div className="grid gap-2 md:grid-cols-[110px_1fr]">
            {Array.from({ length: 15 }, (_, index) => index + 7).map((hour) => {
              const hourEvents = visibleEvents.filter((event) => !event.allDay && event.startAt.getHours() === hour);
              return (
                <div key={hour} className="contents">
                  <div className="border-b border-[#eee5eb] py-3 pr-3 text-right text-[8px] text-[#9a8993]">{new Date(2000, 0, 1, hour).toLocaleTimeString('en', { hour: 'numeric' })}</div>
                  <div className="min-h-[58px] border-b border-[#eee5eb] py-2">{hourEvents.length ? <div className="grid gap-2">{hourEvents.map((event) => eventCard(event, true))}</div> : null}</div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {view === 'week' ? (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-7">
          {weekDays.map((day) => {
            const dayEvents = events.filter((event) => sameDay(event.startAt, day));
            return (
              <Card key={day.toISOString()} className={sameDay(day, new Date()) ? 'border-[#cdb8c9] bg-[#f8f0f5]' : ''}>
                <p className="text-[7px] uppercase tracking-[.18em] text-[#9c8994]">{day.toLocaleDateString('en', { weekday: 'short' })}</p>
                <p className="glow-display mt-1 text-[18px] text-[#493d47]">{day.getDate()}</p>
                <div className="mt-3 space-y-2">{dayEvents.length ? dayEvents.map((event) => eventCard(event, true)) : <button type="button" onClick={() => setDialogEvent('new')} className="w-full rounded-[12px] border border-dashed border-[#dfd2dc] p-3 text-left text-[8px] text-[#9a8993]">Open day · add something meaningful</button>}</div>
              </Card>
            );
          })}
        </div>
      ) : null}

      {view === 'month' ? (
        <Card className="overflow-hidden p-0">
          <div className="grid grid-cols-7 border-b border-[#eadfe7] bg-[#f7f1f5]">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="px-2 py-2 text-center text-[7px] uppercase tracking-[.16em] text-[#8c7b86]">{day}</div>)}</div>
          <div className="grid grid-cols-7">
            {monthDays.map((day) => {
              const dayEvents = events.filter((event) => sameDay(event.startAt, day));
              const inMonth = day.getMonth() === anchor.getMonth();
              return (
                <button key={day.toISOString()} type="button" onClick={() => { setAnchor(day); setView('day'); }} className={`min-h-[96px] border-b border-r border-[#eee5eb] p-2 text-left transition hover:bg-[#faf5f8] ${inMonth ? 'bg-white/45' : 'bg-[#f7f4f5]/55 opacity-55'}`}>
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[8px] ${sameDay(day, new Date()) ? 'bg-[#66505f] text-white' : 'text-[#6f616b]'}`}>{day.getDate()}</span>
                  <div className="mt-1 space-y-1">{dayEvents.slice(0, 3).map((event) => <div key={event.id} className="truncate rounded-[7px] bg-[#f1e8ef] px-1.5 py-1 text-[7px] text-[#725f6d]">{event.allDay ? '' : `${event.startAt.toLocaleTimeString('en', { hour: 'numeric' })} · `}{event.title}</div>)}{dayEvents.length > 3 ? <p className="text-[7px] text-[#9a8993]">+{dayEvents.length - 3} more</p> : null}</div>
                </button>
              );
            })}
          </div>
        </Card>
      ) : null}

      {view === 'flow' ? (
        <div className="grid gap-3 lg:grid-cols-[1.2fr_.8fr]">
          <Card>
            <p className="glow-eyebrow">Daily flow</p>
            <p className="glow-display mt-2 text-[18px] text-[#493d47]">Your day, in sequence</p>
            <div className="mt-4 space-y-2">{visibleEvents.length ? visibleEvents.sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).map((event) => eventCard(event)) : <button type="button" onClick={() => setDialogEvent('new')} className="w-full rounded-[14px] border border-dashed border-[#dfd2dc] p-5 text-left"><p className="glow-display text-[13px] text-[#554752]">No fixed commitments yet.</p><p className="mt-1 text-[8px] text-[#8f8089]">Add an anchor, then let the rest of the day breathe around it.</p></button>}</div>
          </Card>
          <div className="space-y-3">
            <Card className="bg-[linear-gradient(145deg,#f2eaf1,#f8f2ed)]">
              <div className="flex items-start gap-3"><Sparkles size={16} className="mt-0.5 text-[#8d7894]" /><div><p className="glow-display text-[14px] text-[#4b3f49]">Smart scheduling</p><p className="mt-2 text-[9px] leading-4 text-[#80747d]">{schedulingInsight}</p></div></div>
              <Button type="button" variant="secondary" className="mt-4" onClick={() => setDialogEvent('new')}>Add the next anchor</Button>
            </Card>
            <Card>
              <p className="glow-eyebrow">Pacing check</p>
              <p className="glow-display mt-2 text-[15px] text-[#493d47]">{todayEvents.length} commitments today</p>
              <p className="mt-2 text-[8px] leading-4 text-[#8a7a85]">Glow treats fixed events as anchors for tasks, routines, preparation time and recovery space rather than filling every open minute.</p>
            </Card>
          </div>
        </div>
      ) : null}

      {visibleEvents.length === 0 && view !== 'month' && view !== 'week' && view !== 'flow' ? (
        <Card><button type="button" onClick={() => setDialogEvent('new')} className="w-full py-8 text-center"><p className="glow-display text-[14px] text-[#554752]">Nothing is scheduled here yet.</p><p className="mt-1 text-[9px] text-[#8d7d88]">Add an event or move to another date.</p></button></Card>
      ) : null}

      <Card className="flex items-center gap-3 bg-[linear-gradient(90deg,#f5e9ed,#f7f1ec)]">
        <Sparkles size={17} className="text-[#8d7894]" />
        <div><p className="glow-display text-[13px] text-[#4b3f49]">Build around your commitments.</p><p className="mt-1 text-[8px] text-[#80747d]">Glow uses calendar events as anchors for tasks, routines, workouts and preparation time while protecting breathing room.</p></div>
      </Card>

      <Dialog open={dialogEvent !== null} onClose={() => setDialogEvent(null)} title={dialogEvent === 'new' ? 'Add event' : 'Edit event'}>
        <EventForm event={dialogEvent === 'new' ? null : dialogEvent} onSaved={handleSaved} onCancel={() => setDialogEvent(null)} />
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this event?" description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
