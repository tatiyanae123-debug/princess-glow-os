'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Circle, Compass, Gauge, List, MapPin, Mic, Plus, Search } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { EventForm } from '@/components/calendar/event-form';
import { createCalendarEventAction, updateCalendarEventAction } from '@/app/actions/calendar-events';
import type { CalendarEvent } from '@/lib/types';

type TaskLite = { id: string; title: string; priority: string; dueDate: Date | null };
type ViewMode = 'day' | 'week' | 'month' | 'focus' | 'agenda' | 'world';
type DayMode = 'Normal' | 'Busy' | 'Low Energy' | 'Recovery' | 'Social' | 'Travel' | 'Reset Day';
type EventKind = 'appointment' | 'work' | 'workout' | 'social' | 'beauty' | 'reset' | 'travel' | 'deadline' | 'general';
type FreeWindow = { start: Date; end: Date; minutes: number };
type Props = { initialEvents: CalendarEvent[]; tasks: TaskLite[]; modeName: string };

const VIEW_LABELS: Record<ViewMode, string> = { day: 'Day', week: 'Week', month: 'Month', focus: 'Focus', agenda: 'Agenda', world: 'World' };
const DAY_MODES: DayMode[] = ['Normal', 'Busy', 'Low Energy', 'Recovery', 'Social', 'Travel', 'Reset Day'];
const PRIORITY_WEIGHT: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const GRID_START = 5;
const GRID_END = 23;
const DEFAULT_TASK_MINUTES = 30;

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfWeek(date: Date) {
  const d = startOfDay(date);
  const offset = d.getDay() === 0 ? -6 : 1 - d.getDay();
  d.setDate(d.getDate() + offset);
  return d;
}
function fmtTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function fmtDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
function eventEnd(event: CalendarEvent) {
  return event.endAt ?? new Date(event.startAt.getTime() + 60 * 60_000);
}
function classify(title: string): EventKind {
  const v = title.toLowerCase();
  if (/doctor|dentist|appointment|interview|meeting/.test(v)) return 'appointment';
  if (/work|shift|office/.test(v)) return 'work';
  if (/workout|gym|pilates|run|training/.test(v)) return 'workout';
  if (/dinner|date|party|friend|social|brunch/.test(v)) return 'social';
  if (/hair|beauty|makeup|nails|skin|facial/.test(v)) return 'beauty';
  if (/reset|clean|laundry|meal prep/.test(v)) return 'reset';
  if (/flight|train|travel|airport|trip/.test(v)) return 'travel';
  if (/deadline|due|submit/.test(v)) return 'deadline';
  return 'general';
}
function tone(kind: EventKind) {
  return ({
    appointment: 'bg-[#f7e7e8] border-[#efd1d5]',
    work: 'bg-[#eee8f5] border-[#ddd1ea]',
    workout: 'bg-[#e8eff5] border-[#d2e0ec]',
    social: 'bg-[#f7e8ed] border-[#efd5df]',
    beauty: 'bg-[#f7efe3] border-[#eadcc4]',
    reset: 'bg-[#edf2e8] border-[#dce7d3]',
    travel: 'bg-[#e7efec] border-[#d5e3de]',
    deadline: 'bg-[#f5e9dd] border-[#e9d5bd]',
    general: 'bg-[#f7f4ee] border-[#ebe4d8]',
  })[kind];
}
function freeWindows(events: CalendarEvent[], date: Date) {
  const start = new Date(date);
  start.setHours(GRID_START, 0, 0, 0);
  const end = new Date(date);
  end.setHours(GRID_END, 0, 0, 0);
  const timed = events.filter((e) => sameDay(e.startAt, date) && !e.allDay).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const result: FreeWindow[] = [];
  let cursor = start;
  for (const event of timed) {
    if (event.startAt.getTime() > cursor.getTime()) {
      const minutes = Math.round((event.startAt.getTime() - cursor.getTime()) / 60_000);
      if (minutes >= 25) result.push({ start: new Date(cursor), end: new Date(event.startAt), minutes });
    }
    const endAt = eventEnd(event);
    if (endAt.getTime() > cursor.getTime()) cursor = endAt;
  }
  if (cursor.getTime() < end.getTime()) {
    const minutes = Math.round((end.getTime() - cursor.getTime()) / 60_000);
    if (minutes >= 25) result.push({ start: new Date(cursor), end, minutes });
  }
  return result;
}
function futureWindows(windows: FreeWindow[], now: Date) {
  return windows
    .filter((window) => window.end.getTime() > now.getTime())
    .map((window) => {
      const start = window.start.getTime() < now.getTime() ? new Date(Math.ceil(now.getTime() / 300_000) * 300_000) : window.start;
      return { start, end: window.end, minutes: Math.max(0, Math.floor((window.end.getTime() - start.getTime()) / 60_000)) };
    })
    .filter((window) => window.minutes >= 15);
}
function minutesLabel(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}
function overlaps(events: CalendarEvent[], movingId: string, start: Date, end: Date) {
  return events.find((event) => event.id !== movingId && !event.allDay && sameDay(event.startAt, start) && start.getTime() < eventEnd(event).getTime() && end.getTime() > event.startAt.getTime());
}

export function CalendarIntelligenceCenter({ initialEvents, tasks, modeName }: Props) {
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState<ViewMode>('day');
  const [anchor, setAnchor] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [editEvent, setEditEvent] = useState<CalendarEvent | 'new' | null>(null);
  const [dayMode, setDayMode] = useState<DayMode>((DAY_MODES.includes(modeName as DayMode) ? modeName : 'Normal') as DayMode);
  const [energyOverlay, setEnergyOverlay] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [findText, setFindText] = useState('');
  const [fitMinutes, setFitMinutes] = useState(45);
  const [fitOpen, setFitOpen] = useState(false);
  const [fixOpen, setFixOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [searchText, setSearchText] = useState('');
  const [notice, setNotice] = useState('');
  const [asking, setAsking] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const anchorEvents = useMemo(() => events.filter((e) => sameDay(e.startAt, anchor)).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()), [events, anchor]);
  const todayEvents = useMemo(() => events.filter((e) => sameDay(e.startAt, now)).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()), [events, now]);
  const current = useMemo(() => todayEvents.find((e) => !e.allDay && e.startAt.getTime() <= now.getTime() && eventEnd(e).getTime() > now.getTime()) ?? null, [todayEvents, now]);
  const futureToday = useMemo(() => todayEvents.filter((e) => !e.allDay && e.startAt.getTime() >= now.getTime()), [todayEvents, now]);
  const next = futureToday[0] ?? null;
  const later = futureToday[1] ?? null;
  const windows = useMemo(() => freeWindows(events, anchor), [events, anchor]);
  const activeWindows = useMemo(() => sameDay(anchor, now) ? futureWindows(windows, now) : windows, [anchor, now, windows]);
  const todayWindows = useMemo(() => futureWindows(freeWindows(events, now), now), [events, now]);
  const availabilityStart = current ? eventEnd(current) : now;
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), GRID_END, 0, 0, 0);
  const usable = next
    ? Math.max(0, Math.round((next.startAt.getTime() - availabilityStart.getTime()) / 60_000))
    : Math.max(0, Math.round((endOfToday.getTime() - availabilityStart.getTime()) / 60_000));
  const flexible = useMemo(() => [...tasks]
    .filter((task) => !task.dueDate || sameDay(task.dueDate, anchor))
    .sort((a, b) => (PRIORITY_WEIGHT[a.priority] ?? 2) - (PRIORITY_WEIGHT[b.priority] ?? 2) || (a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 6), [tasks, anchor]);
  const inbox = useMemo(() => tasks.filter((task) => !task.dueDate).slice(0, 6), [tasks]);
  const fitOptions = useMemo(() => activeWindows.filter((window) => window.minutes >= fitMinutes).slice(0, 3), [activeWindows, fitMinutes]);
  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; }), [weekStart]);
  const weekMinutes = useMemo(() => weekDays.map((day) => events.filter((event) => sameDay(event.startAt, day) && !event.allDay).reduce((sum, event) => sum + Math.max(0, Math.round((eventEnd(event).getTime() - event.startAt.getTime()) / 60_000)), 0)), [events, weekDays]);
  const busiestMinutes = Math.max(...weekMinutes, 0);
  const lightestMinutes = Math.min(...weekMinutes, 0);
  const totalWeekCapacity = (GRID_END - GRID_START) * 60 * 7;
  const capacity = Math.min(100, Math.round((weekMinutes.reduce((sum, minutes) => sum + minutes, 0) / totalWeekCapacity) * 100));
  const weekCategoryCounts = useMemo(() => {
    const counts: Record<EventKind, number> = { appointment: 0, work: 0, workout: 0, social: 0, beauty: 0, reset: 0, travel: 0, deadline: 0, general: 0 };
    for (const day of weekDays) for (const event of events.filter((item) => sameDay(item.startAt, day))) counts[classify(event.title)] += 1;
    return counts;
  }, [events, weekDays]);
  const scheduledMinutes = todayEvents.reduce((sum, event) => sum + (event.allDay ? 0 : Math.max(0, Math.round((eventEnd(event).getTime() - event.startAt.getTime()) / 60_000))), 0);
  const estimatedFlexibleMinutes = tasks.filter((task) => !task.dueDate || sameDay(task.dueDate, now)).slice(0, 6).length * DEFAULT_TASK_MINUTES;
  const capacityMinutes = (GRID_END - GRID_START) * 60;
  const overBy = Math.max(0, scheduledMinutes + estimatedFlexibleMinutes - capacityMinutes);
  const prepMinutes = selected ? ({ appointment: 35, work: 20, workout: 10, social: 70, beauty: 20, reset: 10, travel: 90, deadline: 15, general: 15 }[classify(selected.title)]) : 0;
  const travelMinutes = selected?.location ? 30 : 0;
  const prepStart = selected ? new Date(selected.startAt.getTime() - (prepMinutes + travelMinutes + 10) * 60_000) : null;
  const filteredEvents = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return events;
    return events.filter((event) => `${event.title} ${event.description ?? ''} ${event.location ?? ''}`.toLowerCase().includes(q));
  }, [events, searchText]);
  const monthCells = useMemo(() => {
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    const firstIndex = (first.getDay() + 6) % 7;
    const days = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
    return [...Array.from({ length: firstIndex }, () => null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [anchor]);

  function shift(days: number) {
    setAnchor((currentDate) => { const d = new Date(currentDate); d.setDate(d.getDate() + days); return d; });
  }
  function updateLocal(event: CalendarEvent) {
    setEvents((currentEvents) => currentEvents.map((item) => item.id === event.id ? event : item).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()));
    setSelected((currentSelected) => currentSelected?.id === event.id ? event : currentSelected);
  }
  function moveEvent(event: CalendarEvent, targetStart: Date) {
    if (!event.editable) {
      setNotice('This synced event is read-only here. Edit it in its source calendar.');
      return;
    }
    const duration = Math.max(15 * 60_000, eventEnd(event).getTime() - event.startAt.getTime());
    const targetEnd = new Date(targetStart.getTime() + duration);
    const conflict = overlaps(events, event.id, targetStart, targetEnd);
    if (conflict) {
      setNotice(`That move overlaps “${conflict.title}”. Glow left the event where it was.`);
      return;
    }
    setNotice('');
    startTransition(async () => {
      const result = await updateCalendarEventAction(event.id, { startAt: targetStart, endAt: targetEnd });
      if (result.data) {
        updateLocal(result.data);
        setNotice(`Moved “${event.title}” to ${fmtTime(targetStart)}.`);
      } else setNotice('Glow could not move that event. Nothing changed.');
    });
  }
  function fillWindow(window: FreeWindow, title = 'Focus block', requestedMinutes = DEFAULT_TASK_MINUTES) {
    const duration = Math.min(window.minutes, Math.max(15, requestedMinutes));
    const end = new Date(window.start.getTime() + duration * 60_000);
    setNotice('');
    startTransition(async () => {
      const result = await createCalendarEventAction({ title, startAt: window.start, endAt: end, allDay: false, color: '#e8d9dd' });
      if (result.data) {
        setEvents((currentEvents) => [...currentEvents, result.data].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()));
        setNotice(`Scheduled “${title}” for ${fmtTime(window.start)}.`);
      } else setNotice('Glow could not schedule that block. Nothing changed.');
    });
  }
  async function askGlow(text = question) {
    const q = text.trim();
    if (!q || asking) return;
    setAnswer('');
    setAsking(true);
    try {
      const response = await fetch('/api/glow/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: q, history: [] }) });
      if (!response.ok) throw new Error('Glow request failed');
      const data = await response.json();
      setAnswer(data.message ?? 'Glow could not answer yet.');
    } catch {
      setAnswer('Glow could not answer yet. Your calendar was not changed.');
    } finally {
      setAsking(false);
    }
  }
  function startVoice() {
    document.dispatchEvent(new CustomEvent('glow:voice-open'));
  }
  function quickAdd(kind: 'task' | 'event') {
    document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: { type: kind } }));
  }
  function applyFix() {
    if (overBy > 0) setDayMode('Busy');
    setFixOpen(false);
    setView('focus');
    setNotice(overBy > 0 ? 'Glow switched to Busy mode and Focus view. Fixed events were not moved.' : 'Glow opened Focus view. Your fixed schedule already fits.');
  }

  const balanceRows = [
    ['Work', weekCategoryCounts.work],
    ['Fitness', weekCategoryCounts.workout],
    ['Beauty', weekCategoryCounts.beauty],
    ['Recovery', weekCategoryCounts.reset],
    ['Social', weekCategoryCounts.social],
  ] as const;
  const maxBalance = Math.max(1, ...balanceRows.map(([, count]) => count));

  return <div className="mx-auto max-w-[1380px] space-y-6 pb-24">
    {notice ? <div role="status" className="sticky top-3 z-30 mx-auto w-fit max-w-[92vw] rounded-full border border-[#eadfd5] bg-white/95 px-4 py-2 text-center text-xs text-[#6c625b] shadow-lg backdrop-blur">{notice}</div> : null}

    <section className="relative overflow-hidden rounded-[38px] border border-[#e9e3d9] bg-[radial-gradient(circle_at_88%_8%,rgba(221,233,213,.85),transparent_28%),radial-gradient(circle_at_65%_0%,rgba(249,226,217,.8),transparent_32%),linear-gradient(135deg,#fffdf8,#f7f4ee)] p-6 shadow-[0_30px_100px_rgba(78,65,52,.08)] sm:p-9">
      <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#9b8d7d]">Calendar · Time → Context → Action</p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-.04em] text-[#302c28] sm:text-6xl">Protect your time.</h1>
          <p className="mt-3 text-sm text-[#a56f72]">{fmtDate(now)} · {fmtTime(now)}</p>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#69625c]">{futureToday.length ? `You have ${futureToday.length} ${futureToday.length === 1 ? 'event' : 'events'} left today.` : 'Your fixed calendar is clear for the rest of today.'} {current ? `You are currently in ${current.title}.` : next ? `Next is ${next.title} at ${fmtTime(next.startAt)}.` : 'Glow can protect the remaining open space.'}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[20px] border border-white/80 bg-white/70 p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#9a928a]">Usable before next</p><p className="mt-1 font-serif text-2xl text-[#3d3833]">{minutesLabel(usable)}</p></div>
            <div className="rounded-[20px] border border-white/80 bg-white/70 p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#9a928a]">Best use</p><p className="mt-1 text-sm font-medium text-[#4c4741]">{usable >= 60 ? 'Flexible task + prep' : usable >= 30 ? 'Quick win + buffer' : 'Protect the buffer'}</p></div>
            <div className="rounded-[20px] border border-white/80 bg-white/70 p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#9a928a]">Day mode</p><p className="mt-1 text-sm font-medium text-[#4c4741]">{dayMode}</p></div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => setView('focus')} className="rounded-full bg-[#38342f] px-5 py-3 text-sm text-white">Use This Time</button><button type="button" disabled={!next} onClick={() => next && setSelected(next)} className="rounded-full border border-[#dfd7cd] bg-white/80 px-5 py-3 text-sm disabled:opacity-40">Prepare for Event</button><button type="button" disabled={asking} onClick={() => askGlow('What should I do with the time around my next calendar event?')} className="rounded-full border border-[#dfd7cd] bg-white/80 px-5 py-3 text-sm disabled:opacity-50">{asking ? 'Asking Glow…' : 'Ask Glow'}</button></div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/66 p-5 backdrop-blur-xl"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#9b9389]">Reality check · estimate</p><p className="mt-1 font-serif text-2xl text-[#3c3732]">{overBy > 0 ? `${minutesLabel(overBy)} over capacity` : 'Your day fits'}</p></div><Gauge size={18} className="text-[#9b7b73]" /></div><p className="mt-3 text-xs leading-5 text-[#777068]">{overBy > 0 ? 'Based on fixed event duration plus a 30-minute estimate for up to six flexible items. Move flexible work first and protect travel buffers.' : 'Based on fixed event duration plus a small estimated flexible workload.'}</p><button type="button" onClick={() => setFixOpen(true)} className="mt-4 w-full rounded-full bg-[#f2ece5] px-4 py-2.5 text-xs font-medium text-[#574f47]">Fix My Day</button></div>
      </div>
    </section>

    <section className="rounded-[26px] border border-[#ebe5dd] bg-white p-3 sm:p-4"><div className="flex gap-2 overflow-x-auto pb-1">{DAY_MODES.map((mode) => <button key={mode} type="button" onClick={() => setDayMode(mode)} className={`shrink-0 rounded-full px-4 py-2 text-xs ${dayMode === mode ? 'bg-[#3e3934] text-white' : 'bg-[#faf7f2] text-[#7c746c]'}`}>{mode}</button>)}</div></section>

    <section className="rounded-[30px] border border-[#ebe5dd] bg-white p-4 sm:p-5"><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => setAnchor(new Date())} className="rounded-full border border-[#e8e1d9] px-3 py-2 text-xs">Today</button><button type="button" aria-label="Previous" onClick={() => shift(view === 'week' ? -7 : view === 'month' ? -new Date(anchor.getFullYear(), anchor.getMonth(), 0).getDate() : -1)} className="rounded-full p-2 hover:bg-[#faf7f2]"><ChevronLeft size={16} /></button><button type="button" aria-label="Next" onClick={() => shift(view === 'week' ? 7 : view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate() : 1)} className="rounded-full p-2 hover:bg-[#faf7f2]"><ChevronRight size={16} /></button><p className="font-serif text-xl text-[#3d3833]">{view === 'week' ? `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} week` : view === 'month' ? anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : fmtDate(anchor)}</p><div className="ml-auto flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#faf7f2] p-1">{(Object.keys(VIEW_LABELS) as ViewMode[]).map((item) => <button key={item} type="button" onClick={() => setView(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${view === item ? 'bg-white text-[#a35f6b] shadow-sm' : 'text-[#847c74]'}`}>{VIEW_LABELS[item]}</button>)}</div><button type="button" onClick={() => setEditEvent('new')} className="inline-flex items-center gap-1.5 rounded-full bg-[#b96d78] px-4 py-2 text-xs text-white"><Plus size={13} />Add event</button></div></section>

    {view === 'focus' ? <section className="rounded-[34px] border border-[#e7e0d7] bg-[linear-gradient(145deg,#fbfaf6,#f2f0ea)] p-6 sm:p-9"><div className="grid gap-5 lg:grid-cols-4"><div className="rounded-[22px] bg-white p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#9e958d]">Now</p><p className="mt-2 font-serif text-2xl">{current?.title ?? 'Open time'}</p><p className="mt-2 text-xs text-[#7e766f]">{current ? `Until ${fmtTime(eventEnd(current))}` : 'Nothing fixed right now'}</p></div><div className="rounded-[22px] bg-white p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#9e958d]">Next</p><p className="mt-2 font-serif text-2xl">{next?.title ?? 'Open'}</p><p className="mt-2 text-xs text-[#7e766f]">{next ? fmtTime(next.startAt) : 'No fixed event'}</p></div><div className="rounded-[22px] bg-white p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#9e958d]">Later</p><p className="mt-2 font-serif text-2xl">{later?.title ?? 'Open'}</p><p className="mt-2 text-xs text-[#7e766f]">{later ? fmtTime(later.startAt) : 'Keep it light'}</p></div><div className="rounded-[22px] bg-[#3b3732] p-5 text-white"><p className="text-[10px] uppercase tracking-[.14em] text-white/55">Usable time</p><p className="mt-2 font-serif text-3xl">{minutesLabel(usable)}</p><p className="mt-2 text-xs text-white/65">after the current event, before the next fixed item</p></div></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={!todayWindows.length || isPending} onClick={() => todayWindows[0] && fillWindow(todayWindows[0], flexible[0]?.title ?? 'Focus block', DEFAULT_TASK_MINUTES)} className="rounded-full bg-[#3b3732] px-4 py-2.5 text-xs text-white disabled:opacity-40">Start / Place Best Action</button><button type="button" onClick={() => setFitOpen(true)} className="rounded-full border border-[#dfd8cf] bg-white px-4 py-2.5 text-xs">Move / Find Time</button><button type="button" onClick={() => setDayMode('Low Energy')} className="rounded-full border border-[#dfd8cf] bg-white px-4 py-2.5 text-xs">Simplify</button></div></section> : null}

    {view === 'day' ? <section className="grid gap-5 xl:grid-cols-[1fr_330px]"><div className="rounded-[30px] border border-[#ebe5dd] bg-white p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#9c9389]">Adaptive day timeline</p><h2 className="mt-1 font-serif text-3xl">Open time is part of the plan.</h2></div><label className="flex items-center gap-2 text-xs text-[#817970]"><input type="checkbox" checked={energyOverlay} onChange={(e) => setEnergyOverlay(e.target.checked)} /> Energy overlay</label></div><div className={`mt-6 rounded-[24px] border border-[#eee8e0] p-4 ${energyOverlay ? 'bg-[linear-gradient(180deg,#fff8e9_0%,#f6f7ef_35%,#edf2ee_68%,#f1edf5_100%)]' : 'bg-[#fcfbf8]'}`}><div className="space-y-3">{Array.from({ length: GRID_END - GRID_START + 1 }, (_, i) => GRID_START + i).map((hour) => { const at = new Date(anchor); at.setHours(hour, 0, 0, 0); const hourEvents = anchorEvents.filter((event) => !event.allDay && event.startAt.getHours() === hour); const openWindow = activeWindows.find((window) => window.start.getHours() === hour); const isNow = sameDay(anchor, now) && now.getHours() === hour; return <div key={hour} className="grid grid-cols-[54px_minmax(0,1fr)] gap-3"><div className="pt-2 text-right text-[10px] text-[#aaa199]">{at.toLocaleTimeString('en-US', { hour: 'numeric' })}</div><div className={`relative min-h-14 rounded-[16px] border px-3 py-2 ${isNow ? 'border-[#d8949f] shadow-[0_0_0_3px_rgba(216,148,159,.12)]' : hourEvents.length ? tone(classify(hourEvents[0].title)) : 'border-transparent'}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const id = e.dataTransfer.getData('text/calendar-id'); const item = events.find((event) => event.id === id); if (item) { const target = new Date(anchor); target.setHours(hour, item.startAt.getMinutes(), 0, 0); moveEvent(item, target); } }}>{isNow ? <span className="absolute -left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#cb7784]" /> : null}{hourEvents.length ? <div className="space-y-2">{hourEvents.map((event) => <button key={event.id} type="button" draggable={event.editable} onDragStart={(e) => { if (event.editable) e.dataTransfer.setData('text/calendar-id', event.id); }} onClick={() => setSelected(event)} className={`w-full rounded-[10px] border px-3 py-2 text-left ${tone(classify(event.title))}`}><span className="block text-xs font-semibold text-[#514943]">{event.title}</span><span className="mt-1 block text-[10px] text-[#817970]">{fmtTime(event.startAt)} · {minutesLabel((eventEnd(event).getTime() - event.startAt.getTime()) / 60_000)}{event.editable ? ' · drag to move' : ' · synced'}</span></button>)}</div> : openWindow ? <button type="button" onClick={() => { setFitMinutes(Math.min(60, openWindow.minutes)); setFitOpen(true); }} className="w-full rounded-[12px] border border-dashed border-[#ddd5cb] bg-white/55 px-3 py-2 text-left"><span className="text-[10px] uppercase tracking-[.12em] text-[#9d948b]">Open window</span><span className="ml-2 text-xs text-[#625b54]">{minutesLabel(openWindow.minutes)}</span></button> : null}</div></div>; })}</div></div></div><aside className="space-y-4"><div className="rounded-[24px] border border-[#ebe5dd] bg-white p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#9c9389]">Smart free windows</p><div className="mt-4 space-y-3">{activeWindows.slice(0, 4).map((window) => <div key={`${window.start.toISOString()}-${window.end.toISOString()}`} className="rounded-[16px] bg-[#faf8f3] p-4"><p className="text-sm font-medium">{fmtTime(window.start)}–{fmtTime(window.end)}</p><p className="mt-1 text-xs text-[#827a72]">{minutesLabel(window.minutes)} open</p><div className="mt-3 flex gap-2"><button type="button" disabled={isPending} onClick={() => fillWindow(window, flexible[0]?.title ?? 'Focus block', DEFAULT_TASK_MINUTES)} className="rounded-full bg-[#3e3934] px-3 py-1.5 text-[10px] text-white disabled:opacity-40">Fill</button><button type="button" onClick={() => { setFitMinutes(Math.min(60, window.minutes)); setFitOpen(true); }} className="rounded-full border border-[#e2dbd2] px-3 py-1.5 text-[10px]">Options</button></div></div>)}{!activeWindows.length ? <p className="text-xs text-[#938b83]">No meaningful open window remains in this day view.</p> : null}</div></div><div className="rounded-[24px] border border-[#ebe5dd] bg-white p-5"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.14em] text-[#9c9389]">Flexible today</p><label className="text-[10px] text-[#928980]"><input type="checkbox" checked={showTasks} onChange={(e) => setShowTasks(e.target.checked)} className="mr-1" />show</label></div>{showTasks ? <div className="mt-3 space-y-2">{flexible.map((task) => <div key={task.id} className="rounded-[14px] bg-[#f8f6f1] px-3 py-3"><p className="text-xs font-medium">{task.title}</p><p className="mt-1 text-[10px] text-[#91887f]">Flexible · {task.priority} · ~30m estimate</p></div>)}{!flexible.length ? <p className="text-xs text-[#91887f]">Nothing flexible is waiting.</p> : null}</div> : null}<button type="button" disabled={!activeWindows.length || !flexible.length || isPending} onClick={() => activeWindows[0] && flexible[0] && fillWindow(activeWindows[0], flexible[0].title, DEFAULT_TASK_MINUTES)} className="mt-4 w-full rounded-full bg-[#f0ebe4] py-2.5 text-xs disabled:opacity-40">Auto-place best item</button></div></aside></section> : null}

    {view === 'week' ? <section className="rounded-[30px] border border-[#ebe5dd] bg-white p-5 sm:p-7"><div className="grid gap-4 lg:grid-cols-[1fr_300px]"><div className="overflow-x-auto"><div className="grid min-w-[760px] grid-cols-7 gap-2">{weekDays.map((day) => <button type="button" key={day.toISOString()} onClick={() => { setAnchor(day); setView('day'); }} className={`min-h-36 rounded-[18px] border p-3 text-left ${sameDay(day, now) ? 'border-[#d9a2aa] bg-[#fff6f7]' : 'border-[#eee8e0] bg-[#fcfbf8]'}`}><p className="text-[10px] uppercase tracking-[.12em] text-[#958c84]">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p><p className="mt-1 font-serif text-xl">{day.getDate()}</p><div className="mt-4 space-y-1">{events.filter((event) => sameDay(event.startAt, day)).slice(0, 3).map((event) => <div key={event.id} className={`truncate rounded-full border px-2 py-1 text-[9px] ${tone(classify(event.title))}`}>{event.title}</div>)}</div></button>)}</div></div><div className="space-y-3"><div className="rounded-[20px] bg-[#faf7f2] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#948b83]">This week</p><p className="mt-2 font-serif text-3xl">{capacity}% scheduled</p><p className="mt-2 text-xs text-[#7f776f]">Heaviest: {weekDays.filter((_, i) => weekMinutes[i] === busiestMinutes).map((day) => day.toLocaleDateString('en-US', { weekday: 'short' })).join(', ') || '—'} · Lightest: {weekDays.filter((_, i) => weekMinutes[i] === lightestMinutes).map((day) => day.toLocaleDateString('en-US', { weekday: 'short' })).join(', ') || '—'}</p></div><div className="rounded-[20px] bg-[#f7f4ee] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#948b83]">Balance map · actual event counts</p>{balanceRows.map(([label, count]) => <div key={label} className="mt-3"><div className="flex justify-between text-[10px]"><span>{label}</span><span>{count}</span></div><div className="mt-1 h-1.5 rounded-full bg-[#e9e3db]"><div className="h-full rounded-full bg-[#aaa197]" style={{ width: `${count ? Math.max(12, (count / maxBalance) * 100) : 0}%` }} /></div></div>)}<p className="mt-4 text-xs leading-5 text-[#7f776f]">Recovery currently reflects reset/recovery-style calendar blocks. It is an awareness signal, not a score.</p></div><button type="button" onClick={() => setFixOpen(true)} className="w-full rounded-full bg-[#3e3934] py-2.5 text-xs text-white">Rebalance Week</button></div></div></section> : null}

    {view === 'month' ? <section className="rounded-[30px] border border-[#ebe5dd] bg-white p-4 sm:p-7"><div className="mb-2 grid grid-cols-7 gap-1 text-center text-[9px] uppercase tracking-[.12em] text-[#9a9188] sm:gap-2">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => <div key={label}>{label}</div>)}</div><div className="grid grid-cols-7 gap-1 sm:gap-2">{monthCells.map((day, index) => day === null ? <div key={`blank-${index}`} className="min-h-20 rounded-[12px] bg-[#faf8f4]/50 sm:min-h-24" /> : (() => { const d = new Date(anchor.getFullYear(), anchor.getMonth(), day); const count = events.filter((event) => sameDay(event.startAt, d)).length; return <button type="button" key={day} onClick={() => { setAnchor(d); setView('day'); }} className={`min-h-20 rounded-[12px] border p-2 text-left sm:min-h-24 sm:rounded-[16px] sm:p-3 ${sameDay(d, now) ? 'border-[#d9a2aa] bg-[#fff6f7]' : 'border-[#eee8e0] bg-[#fcfbf8]'}`}><p className="font-serif text-base sm:text-lg">{day}</p><div className="mt-3 flex flex-wrap gap-1">{Array.from({ length: Math.min(4, count) }, (_, i) => <span key={i} className="h-1.5 w-1.5 rounded-full bg-[#c98a94]" />)}</div><p className="mt-2 hidden text-[9px] text-[#9b938a] sm:block">{count ? `${count} item${count === 1 ? '' : 's'}` : 'Open'}</p></button>; })())}</div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[10px] text-[#958c84]">Most crowded</p><p className="mt-1 text-sm font-medium">Days with more dots carry more fixed calendar items.</p></div><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[10px] text-[#958c84]">Maintenance</p><p className="mt-1 text-sm font-medium">Beauty, hair, reset, and deadline titles keep their soft category treatment.</p></div><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[10px] text-[#958c84]">Open windows</p><p className="mt-1 text-sm font-medium">Tap a day to calculate its real free windows.</p></div></div></section> : null}

    {view === 'agenda' ? <section className="rounded-[30px] border border-[#ebe5dd] bg-white p-5 sm:p-7"><div className="flex items-center gap-2"><List size={16} /><h2 className="font-serif text-2xl">Agenda</h2></div><div className="mt-5 space-y-3">{[...filteredEvents].sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 40).map((event) => <button key={event.id} type="button" onClick={() => setSelected(event)} className="flex w-full items-center gap-4 rounded-[18px] border border-[#eee8e0] p-4 text-left"><div className="w-20 text-[10px] text-[#948b83]">{event.startAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br />{event.allDay ? 'All day' : fmtTime(event.startAt)}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{event.title}</p><p className="mt-1 text-[10px] text-[#948b83]">{classify(event.title)}</p></div><ArrowRight size={14} /></button>)}{searchText && !filteredEvents.length ? <p className="rounded-[18px] bg-[#faf7f2] p-5 text-sm text-[#817970]">No calendar items match “{searchText}”.</p> : null}</div></section> : null}

    {view === 'world' ? <section className="rounded-[34px] border border-[#e8e1d8] bg-[radial-gradient(circle_at_top,#eef3e9,#f8f3eb_48%,#f2e9ed)] p-7 sm:p-10"><div className="text-center"><Compass className="mx-auto" size={22} /><p className="mt-3 text-[10px] uppercase tracking-[.18em] text-[#938a82]">World view</p><h2 className="mt-2 font-serif text-4xl">Your time as destinations.</h2><p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#766f68]">Fixed events are destinations. Flexible tasks are movable objects. Routines are pathways between rooms.</p></div><div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">{anchorEvents.slice(0, 6).map((event) => <button key={event.id} type="button" onClick={() => setSelected(event)} className={`rounded-[24px] border p-5 text-left ${tone(classify(event.title))}`}><MapPin size={15} /><p className="mt-4 font-serif text-xl">{event.title}</p><p className="mt-2 text-xs text-[#776f68]">{event.allDay ? 'All day' : fmtTime(event.startAt)}</p></button>)}{!anchorEvents.length ? <p className="col-span-full text-center text-sm text-[#817970]">This day has no fixed destinations yet.</p> : null}</div></section> : null}

    <section className="grid gap-5 lg:grid-cols-[1fr_.9fr]"><div className="rounded-[28px] border border-[#ebe5dd] bg-white p-5 sm:p-7"><div className="flex items-center gap-2"><Search size={15} /><p className="text-[10px] uppercase tracking-[.14em] text-[#938a82]">Calendar search</p></div><div className="mt-4 flex flex-wrap gap-2"><input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search interviews, appointments, locations…" className="min-w-[180px] flex-1 rounded-full border border-[#e7e0d8] px-4 py-3 text-sm outline-none" /><button type="button" onClick={() => setView('agenda')} className="rounded-full bg-[#3e3934] px-4 py-3 text-xs text-white">Search</button><button type="button" onClick={startVoice} className="rounded-full border border-[#e7e0d8] p-3" aria-label="Voice scheduling"><Mic size={15} /></button></div><div className="mt-5 rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#958c84]">Ask Glow in natural language</p><div className="mt-3 flex flex-wrap gap-2"><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Where do I have 2 hours free next week?" className="min-w-[180px] flex-1 rounded-full border border-[#e8e1d8] bg-white px-4 py-2.5 text-xs outline-none" /><button type="button" disabled={asking || !question.trim()} onClick={() => askGlow()} className="rounded-full bg-[#a86c75] px-4 py-2.5 text-xs text-white disabled:opacity-40">{asking ? 'Thinking…' : 'Ask'}</button></div>{answer ? <p className="mt-3 text-xs leading-6 text-[#766f68]">{answer}</p> : null}</div></div><div className="rounded-[28px] border border-[#ebe5dd] bg-white p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[.14em] text-[#938a82]">Calendar inbox</p><h2 className="mt-1 font-serif text-2xl">Needs a time</h2><div className="mt-4 space-y-2">{inbox.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-[16px] bg-[#faf7f2] p-3"><Circle size={12} /><span className="min-w-0 flex-1 truncate text-xs">{task.title}</span><button type="button" onClick={() => { setAnchor(new Date()); setFindText(task.title); setFitOpen(true); }} className="shrink-0 text-[10px] text-[#a1626d]">Place today</button></div>)}{!inbox.length ? <p className="text-xs text-[#91887f]">Nothing is waiting for a time.</p> : null}</div></div></section>

    <button type="button" onClick={() => setCommandOpen(true)} className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#3b3732] text-white shadow-xl sm:bottom-8" aria-label="Open Calendar command palette"><Plus size={19} /></button>

    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? 'Event'}>{selected ? <div className="space-y-5"><div className={`rounded-[20px] border p-5 ${tone(classify(selected.title))}`}><p className="text-[10px] uppercase tracking-[.14em] text-[#817970]">{classify(selected.title)}</p><h3 className="mt-2 font-serif text-3xl">{selected.title}</h3><p className="mt-2 text-xs text-[#756e67]">{selected.allDay ? 'All day' : `${fmtTime(selected.startAt)}${selected.endAt ? `–${fmtTime(selected.endAt)}` : ''}`}</p>{selected.location ? <p className="mt-2 flex items-center gap-1 text-xs"><MapPin size={12} />{selected.location}</p> : null}</div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-[16px] bg-[#faf7f2] p-4"><p className="text-[10px] uppercase text-[#958c84]">Before · estimate</p><p className="mt-2 text-xs leading-5">Prep ~{prepMinutes}m{selected.location ? ` · travel placeholder ~${travelMinutes}m` : ''}{prepStart ? ` · begin around ${fmtTime(prepStart)}` : ''}</p></div><div className="rounded-[16px] bg-[#faf7f2] p-4"><p className="text-[10px] uppercase text-[#958c84]">During</p><p className="mt-2 text-xs leading-5">Notes · location · contact context</p></div><div className="rounded-[16px] bg-[#faf7f2] p-4"><p className="text-[10px] uppercase text-[#958c84]">After</p><p className="mt-2 text-xs leading-5">Follow up · capture outcome · schedule next step</p></div></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setSelected(null); setView('focus'); }} className="rounded-full bg-[#3e3934] px-4 py-2.5 text-xs text-white">Start Prep</button>{selected.location ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.location)}`} target="_blank" rel="noreferrer" className="rounded-full border border-[#e4ddd5] px-4 py-2.5 text-xs">Navigate</a> : null}<Link href="/notes" className="rounded-full border border-[#e4ddd5] px-4 py-2.5 text-xs">Open Notes</Link><button type="button" disabled={asking} onClick={() => askGlow(`What follow-up should I do after ${selected.title}?`)} className="rounded-full border border-[#e4ddd5] px-4 py-2.5 text-xs disabled:opacity-40">Follow Up</button>{selected.editable ? <button type="button" onClick={() => setEditEvent(selected)} className="rounded-full border border-[#e4ddd5] px-4 py-2.5 text-xs">Edit</button> : null}</div></div> : null}</Dialog>

    <Dialog open={Boolean(editEvent)} onClose={() => setEditEvent(null)} title={editEvent === 'new' ? 'Add event' : 'Edit event'}>{editEvent ? <EventForm event={editEvent === 'new' ? undefined : editEvent} onSaved={(event) => { setEvents((currentEvents) => { const exists = currentEvents.some((item) => item.id === event.id); return (exists ? currentEvents.map((item) => item.id === event.id ? event : item) : [...currentEvents, event]).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()); }); setSelected((currentSelected) => currentSelected?.id === event.id ? event : currentSelected); setEditEvent(null); setNotice(`Saved “${event.title}”.`); }} onCancel={() => setEditEvent(null)} /> : null}</Dialog>

    <Dialog open={fitOpen} onClose={() => setFitOpen(false)} title="What can I fit?"><div className="space-y-4"><div className="grid grid-cols-[1fr_100px] gap-2"><input value={findText} onChange={(e) => setFindText(e.target.value)} placeholder="45 minute workout" className="rounded-[14px] border border-[#e5ddd4] px-3 py-2.5 text-sm" /><input aria-label="Duration in minutes" type="number" min={15} max={240} step={5} value={fitMinutes} onChange={(e) => setFitMinutes(Math.min(240, Math.max(15, Number(e.target.value) || 45)))} className="rounded-[14px] border border-[#e5ddd4] px-3 py-2.5 text-sm" /></div><p className="text-[10px] text-[#938b83]">Searching {fmtDate(anchor)}. Past time is excluded when this is today.</p><div className="space-y-2">{fitOptions.map((window, index) => <div key={`${window.start.toISOString()}-${index}`} className="rounded-[16px] bg-[#faf7f2] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-medium">{fmtTime(window.start)}–{fmtTime(new Date(window.start.getTime() + fitMinutes * 60_000))}</p><p className="mt-1 text-[10px] text-[#8f877f]">{index === 0 ? 'Best fit' : index === 1 ? 'Possible' : 'Backup option'}</p></div><button type="button" disabled={isPending} onClick={() => { fillWindow(window, findText.trim() || 'Flexible block', fitMinutes); setFitOpen(false); }} className="rounded-full bg-[#3d3934] px-3 py-2 text-[10px] text-white disabled:opacity-40">Schedule</button></div></div>)}{!fitOptions.length ? <p className="text-sm text-[#817970]">No remaining window on this day is long enough. Try a shorter duration or another day.</p> : null}</div></div></Dialog>

    <Dialog open={fixOpen} onClose={() => setFixOpen(false)} title="Fix My Day"><div className="space-y-4"><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#958c84]">Estimated capacity</p><p className="mt-2 font-serif text-3xl">{overBy > 0 ? `${minutesLabel(overBy)} over` : 'Fits with buffer'}</p></div><div className="space-y-2 text-sm"><p><b>Keep:</b> fixed calendar events and anything urgent.</p><p><b>Move:</b> lowest-priority flexible work first.</p><p><b>Shorten:</b> optional routines when Day Mode is Busy or Low Energy.</p><p><b>Protect:</b> travel and at least a small breathing buffer.</p></div><button type="button" onClick={applyFix} className="w-full rounded-full bg-[#3d3934] py-3 text-sm text-white">Apply Cleaner View</button><p className="text-[10px] leading-5 text-[#938b83]">This changes planning mode and Focus view only. It never silently moves fixed events.</p></div></Dialog>

    <Dialog open={commandOpen} onClose={() => setCommandOpen(false)} title="Calendar commands"><div className="grid gap-2 sm:grid-cols-2">{[
      ['Add event', () => setEditEvent('new')],
      ['Add task', () => quickAdd('task')],
      ['Block focus', () => { setFindText('Focus block'); setFitMinutes(45); setFitOpen(true); }],
      ['Add routine', () => window.location.assign('/routines')],
      ['Find free time', () => setFitOpen(true)],
      ['Reschedule day', () => setFixOpen(true)],
      ['Add travel', () => { setFindText('Travel'); setFitMinutes(30); setFitOpen(true); }],
      ['Ask Glow', () => askGlow('Help me organize my calendar today.')],
    ].map(([label, handler]) => <button key={String(label)} type="button" onClick={() => { (handler as () => void)(); setCommandOpen(false); }} className="rounded-[16px] border border-[#e8e1d8] bg-[#faf7f2] p-4 text-left text-sm">{String(label)}</button>)}</div></Dialog>
  </div>;
}
