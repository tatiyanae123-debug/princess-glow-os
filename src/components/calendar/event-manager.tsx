'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, MoreHorizontal, Pencil, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EventForm } from '@/components/calendar/event-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { convertCalendarEventToTaskAction, deleteCalendarEventAction } from '@/app/actions/calendar-events';
import type { CalendarEvent } from '@/lib/types';

type ViewMode = 'day' | 'week' | 'month' | 'flow';

const DAY_MS = 86_400_000;
const GRID_START_HOUR = 6;
const GRID_END_HOUR = 21;
const EVENT_TONES = ['bg-[#FBE4E8] border-[#F1C7CE] text-[#A2505E]', 'bg-[#E9E4F2] border-[#D9CFEA] text-[#6E5E92]', 'bg-[#F1E8D9] border-[#E5D5B4] text-[#9A7A3D]', 'bg-[#E4EBDD] border-[#D2E0C5] text-[#5A6E52]'];

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
  if (mode === 'day' || mode === 'flow') return anchor.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
  if (mode === 'week') {
    const start = startOfWeek(anchor);
    const end = endOfWeek(anchor);
    return `${start.toLocaleDateString('en', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
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
function minutesFromGridStart(date: Date) {
  return (date.getHours() - GRID_START_HOUR) * 60 + date.getMinutes();
}

const CALENDAR_VIEWS = new Set<ViewMode>(['day', 'week', 'month', 'flow']);
const GRID_TOTAL_MINUTES = (GRID_END_HOUR - GRID_START_HOUR) * 60;

export function EventManager({ initialEvents }: { initialEvents: CalendarEvent[] }) {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get('view');
  const initialView: ViewMode = requestedView && CALENDAR_VIEWS.has(requestedView as ViewMode) ? (requestedView as ViewMode) : 'week';
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [dialogEvent, setDialogEvent] = useState<CalendarEvent | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>(initialView);
  const [anchor, setAnchor] = useState(() => new Date());
  const del = useServerAction((id: string) => deleteCalendarEventAction(id));
  const convert = useServerAction(convertCalendarEventToTaskAction);

  const visibleEvents = useMemo(() => eventsInRange(events, anchor, view), [events, anchor, view]);
  const upcoming = useMemo(() => events.filter((event) => event.startAt.getTime() >= Date.now()).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 4), [events]);
  const todayEvents = useMemo(() => events.filter((event) => sameDay(event.startAt, new Date())), [events]);
  const weekDays = useMemo(() => buildWeekDays(anchor), [anchor]);
  const monthDays = useMemo(() => buildMonthDays(anchor), [anchor]);
  const selected = events.find((event) => event.id === selectedId) ?? null;

  const openTimeThisWeek = useMemo(() => {
    const wakingHoursPerDay = GRID_END_HOUR - GRID_START_HOUR;
    const totalHours = wakingHoursPerDay * 7;
    const weekEvents = eventsInRange(events, anchor, 'week').filter((event) => !event.allDay);
    const scheduledHours = weekEvents.reduce((sum, event) => {
      const end = event.endAt ?? new Date(event.startAt.getTime() + 60 * 60_000);
      return sum + Math.max(0, (end.getTime() - event.startAt.getTime()) / 3_600_000);
    }, 0);
    const open = Math.max(0, totalHours - scheduledHours);
    return { open: Math.round(open * 10) / 10, percent: Math.round((open / totalHours) * 100) };
  }, [events, anchor]);

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
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
    });
  }

  function toneFor(event: CalendarEvent) {
    const hash = [...event.id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return EVENT_TONES[hash % EVENT_TONES.length];
  }

  const rightRail = (
    <div className="hidden w-[300px] shrink-0 space-y-4 xl:block">
      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
        {!selected ? (
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#2B2420]"><CalendarDays size={14} className="text-[#C9727E]" />Event Details</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-[#2B2420]">Event Details</p>
              <button type="button" onClick={() => setSelectedId(null)} aria-label="Close" className="rounded-full p-1 text-[#9A9088] hover:bg-[#FDFAF8]"><X size={13} /></button>
            </div>
            <p className="glow-display mt-3 text-[16px] leading-tight text-[#2B2420]">{selected.title}</p>
            <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-[#8A8078]"><Clock3 size={11} />{selected.allDay ? 'All day' : `${selected.startAt.toLocaleString('en', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}${selected.endAt ? ` – ${selected.endAt.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}` : ''}`}</p>
            {selected.location ? <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[#8A8078]"><MapPin size={11} />{selected.location}</p> : null}
            {selected.description ? <p className="mt-3 text-[11.5px] leading-5 text-[#6B6560]">{selected.description}</p> : null}
            <div className="mt-4 flex items-center gap-2">
              {selected.editable ? <button type="button" onClick={() => setDialogEvent(selected)} className="flex items-center gap-1.5 rounded-full bg-[#FBE4E8] px-3 py-1.5 text-[11px] font-medium text-[#B15A68]"><Pencil size={11} />Edit</button> : null}
              <button type="button" onClick={() => setDeleteTarget(selected)} className="flex items-center gap-1.5 rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[11px] font-medium text-[#8A8078]"><Trash2 size={11} />Delete</button>
              {selected.source === 'google_calendar' ? <button type="button" disabled={convert.isPending} onClick={() => convert.run({ eventId: selected.id })} className="rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[11px] font-medium text-[#8A8078]"><MoreHorizontal size={11} /></button> : null}
            </div>
          </>
        )}
      </div>

      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
        <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Upcoming</p></div>
        <div className="mt-3 space-y-2.5">
          {upcoming.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">Nothing scheduled next.</p> : upcoming.map((event) => (
            <button key={event.id} type="button" onClick={() => setSelectedId(event.id)} className="flex w-full items-center gap-2 text-left">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9727E]" />
              <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium text-[#3A332E]">{event.title}</span><span className="text-[10.5px] text-[#9A9088]">{event.startAt.toLocaleString('en', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</span></span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
        <p className="text-[13px] font-medium text-[#2B2420]">Open Time <span className="text-[11px] font-normal text-[#9A9088]">This Week</span></p>
        <div className="mt-3 flex items-baseline gap-2"><p className="glow-display text-[22px] text-[#2B2420]">{openTimeThisWeek.open} hrs</p><p className="text-[11px] text-[#9A9088]">Open time</p></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${Math.min(100, openTimeThisWeek.percent)}%` }} /></div>
        <p className="mt-1 text-[10.5px] text-[#9A9088]">{openTimeThisWeek.percent}% of week</p>
        <button type="button" onClick={() => setDialogEvent('new')} className="mt-3 w-full rounded-full bg-[#4A4440] py-2 text-[11.5px] font-medium text-white">Find Time</button>
      </div>

      <div className="relative overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-4">
        <Sparkles size={14} className="text-[#C9727E]" />
        <p className="mt-2 text-[11px] font-medium text-[#2B2420]">Insight</p>
        <p className="mt-1.5 text-[11.5px] leading-5 text-[#6B6560]">{schedulingInsight}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="glow-display text-[38px] leading-none text-[#2B2420] sm:text-[46px]">Calendar</h1>
      </header>

      <div className="flex flex-wrap items-center gap-3 rounded-[16px] border border-[#F1E7E3] bg-white px-3 py-2.5">
        <button type="button" onClick={() => setAnchor(new Date())} className="rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[12px] font-medium text-[#4A4440] hover:bg-[#FDFAF8]">Today</button>
        <div className="flex items-center gap-0.5">
          <button type="button" aria-label="Previous period" onClick={() => setAnchor((current) => moveAnchor(current, view, -1))} className="rounded-full p-1.5 text-[#8A8078] hover:bg-[#FDFAF8]"><ChevronLeft size={16} /></button>
          <button type="button" aria-label="Next period" onClick={() => setAnchor((current) => moveAnchor(current, view, 1))} className="rounded-full p-1.5 text-[#8A8078] hover:bg-[#FDFAF8]"><ChevronRight size={16} /></button>
        </div>
        <p className="text-[13px] font-medium text-[#2B2420]">{rangeLabel(anchor, view)}</p>
        <div className="ml-auto flex items-center gap-1 rounded-full border border-[#F1E7E3] bg-[#FDFAF8] p-1">
          {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
            <button key={mode} type="button" onClick={() => setView(mode)} className={`rounded-full px-3 py-1.5 text-[12px] font-medium capitalize transition ${view === mode ? 'bg-white text-[#C9727E] shadow-sm' : 'text-[#8A8078]'}`}>{mode}</button>
          ))}
        </div>
        <button type="button" onClick={() => setView('flow')} aria-label="Daily flow view" className={`rounded-full border p-2 ${view === 'flow' ? 'border-[#C9727E] text-[#C9727E]' : 'border-[#F1E7E3] text-[#8A8078]'}`}><MoreHorizontal size={14} /></button>
        <button type="button" onClick={() => setDialogEvent('new')} className="flex items-center gap-1.5 rounded-full bg-[#C9727E] px-3.5 py-1.5 text-[12px] font-medium text-white"><Plus size={13} />Add event</button>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="min-w-0 flex-1">
          {view === 'week' ? (
            <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
              <div className="grid grid-cols-[52px_repeat(7,1fr)] border-b border-[#F1E7E3]">
                <div />
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="border-l border-[#F4ECE8] px-2 py-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-[.1em] text-[#9A9088]">{day.toLocaleDateString('en', { weekday: 'short' })}</p>
                    <p className={`glow-display mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full text-[13px] ${sameDay(day, new Date()) ? 'bg-[#C9727E] text-white' : 'text-[#2B2420]'}`}>{day.getDate()}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[52px_repeat(7,1fr)]" style={{ height: `${(GRID_END_HOUR - GRID_START_HOUR) * 48}px` }}>
                <div className="relative">
                  {Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, index) => GRID_START_HOUR + index).map((hour, index) => (
                    <div key={hour} className="absolute left-0 right-0 -translate-y-1/2 pr-2 text-right text-[9px] text-[#B5ACA5]" style={{ top: `${(index / (GRID_END_HOUR - GRID_START_HOUR)) * 100}%` }}>
                      {new Date(2000, 0, 1, hour).toLocaleTimeString('en', { hour: 'numeric' })}
                    </div>
                  ))}
                </div>
                {weekDays.map((day) => {
                  const dayEvents = events.filter((event) => sameDay(event.startAt, day) && !event.allDay);
                  const isToday = sameDay(day, new Date());
                  const nowOffset = isToday ? (minutesFromGridStart(new Date()) / GRID_TOTAL_MINUTES) * 100 : null;
                  return (
                    <div key={day.toISOString()} className="relative border-l border-[#F4ECE8]" style={{ backgroundImage: `repeating-linear-gradient(180deg, transparent 0, transparent ${100 / (GRID_END_HOUR - GRID_START_HOUR) - 0.01}%, #F4ECE8 ${100 / (GRID_END_HOUR - GRID_START_HOUR)}%)` }}>
                      {nowOffset !== null && nowOffset >= 0 && nowOffset <= 100 ? <div className="absolute inset-x-0 z-10 h-px bg-[#C9727E]" style={{ top: `${nowOffset}%` }}><span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-[#C9727E]" /></div> : null}
                      {dayEvents.map((event) => {
                        const top = Math.max(0, (minutesFromGridStart(event.startAt) / GRID_TOTAL_MINUTES) * 100);
                        const endMinutes = event.endAt ? minutesFromGridStart(event.endAt) : minutesFromGridStart(event.startAt) + 60;
                        const height = Math.max(3, ((endMinutes - minutesFromGridStart(event.startAt)) / GRID_TOTAL_MINUTES) * 100);
                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedId(event.id)}
                            className={`absolute inset-x-0.5 overflow-hidden rounded-[6px] border px-1.5 py-1 text-left text-[9.5px] leading-tight transition hover:brightness-95 ${toneFor(event)} ${selectedId === event.id ? 'ring-2 ring-[#C9727E]' : ''}`}
                            style={{ top: `${top}%`, height: `${height}%` }}
                          >
                            <span className="block truncate font-medium">{event.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              {events.some((event) => event.allDay && eventsInRange([event], anchor, 'week').length) ? (
                <div className="flex flex-wrap gap-1.5 border-t border-[#F1E7E3] px-3 py-2">
                  {visibleEvents.filter((event) => event.allDay).map((event) => (
                    <button key={event.id} type="button" onClick={() => setSelectedId(event.id)} className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${toneFor(event)}`}>{event.title}</button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {view === 'day' ? (
            <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
              <div className="grid gap-2 md:grid-cols-[90px_1fr]">
                {Array.from({ length: 15 }, (_, index) => index + 7).map((hour) => {
                  const hourEvents = visibleEvents.filter((event) => !event.allDay && event.startAt.getHours() === hour);
                  return (
                    <div key={hour} className="contents">
                      <div className="border-b border-[#F4ECE8] py-3 pr-3 text-right text-[10px] text-[#9A9088]">{new Date(2000, 0, 1, hour).toLocaleTimeString('en', { hour: 'numeric' })}</div>
                      <div className="min-h-[54px] border-b border-[#F4ECE8] py-2">{hourEvents.length ? <div className="grid gap-2">{hourEvents.map((event) => (
                        <button key={event.id} type="button" onClick={() => setSelectedId(event.id)} className={`rounded-[10px] border px-3 py-2 text-left text-[12px] font-medium ${toneFor(event)}`}>{event.title}</button>
                      ))}</div> : null}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {view === 'month' ? (
            <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white">
              <div className="grid grid-cols-7 border-b border-[#F1E7E3] bg-[#FDFAF8]">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <div key={day} className="px-2 py-2 text-center text-[10px] uppercase tracking-[.1em] text-[#9A9088]">{day}</div>)}</div>
              <div className="grid grid-cols-7">
                {monthDays.map((day) => {
                  const dayEvents = events.filter((event) => sameDay(event.startAt, day));
                  const inMonth = day.getMonth() === anchor.getMonth();
                  return (
                    <button key={day.toISOString()} type="button" onClick={() => { setAnchor(day); setView('day'); }} className={`min-h-[92px] border-b border-r border-[#F4ECE8] p-2 text-left transition hover:bg-[#FDFAF8] ${inMonth ? 'bg-white' : 'bg-[#FDFAF8] opacity-55'}`}>
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${sameDay(day, new Date()) ? 'bg-[#C9727E] text-white' : 'text-[#4A4440]'}`}>{day.getDate()}</span>
                      <div className="mt-1 space-y-1">{dayEvents.slice(0, 3).map((event) => <div key={event.id} className={`truncate rounded-[6px] border px-1.5 py-0.5 text-[9.5px] ${toneFor(event)}`}>{event.title}</div>)}{dayEvents.length > 3 ? <p className="text-[9px] text-[#9A9088]">+{dayEvents.length - 3} more</p> : null}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {view === 'flow' ? (
            <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
              <p className="text-[13px] font-medium text-[#2B2420]">Your day, in sequence</p>
              <div className="mt-4 space-y-2">
                {visibleEvents.length ? visibleEvents.sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).map((event) => (
                  <button key={event.id} type="button" onClick={() => setSelectedId(event.id)} className="flex w-full items-center justify-between gap-2 rounded-[12px] border border-[#F1E7E3] px-4 py-3 text-left hover:bg-[#FDFAF8]">
                    <span className="text-[12.5px] font-medium text-[#3A332E]">{event.title}</span>
                    <span className="text-[11px] text-[#9A9088]">{event.allDay ? 'All day' : event.startAt.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })} · {eventDuration(event)}</span>
                  </button>
                )) : <p className="rounded-[12px] border border-dashed border-[#F1E7E3] p-6 text-center text-[12px] text-[#9A9088]">No fixed commitments yet.</p>}
              </div>
            </div>
          ) : null}
        </div>

        {rightRail}
      </div>

      <Dialog open={dialogEvent !== null} onClose={() => setDialogEvent(null)} title={dialogEvent === 'new' ? 'Add event' : 'Edit event'}>
        <EventForm event={dialogEvent === 'new' ? null : dialogEvent} onSaved={handleSaved} onCancel={() => setDialogEvent(null)} />
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this event?" description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
