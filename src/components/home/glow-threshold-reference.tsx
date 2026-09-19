'use client';

import {
  ArrowRight,
  Bell,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Inbox,
  Mic2,
  Plus,
  Search,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { universalIntakeAction } from '@/app/actions/universal-intake';
import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';

export type HomeAction = {
  id: string;
  title: string;
  reason: string;
  href: string;
  source: 'task' | 'reminder' | 'habit' | 'routine' | 'event';
  score: number;
  estimatedMinutes: number;
  energyCost: 'low' | 'medium' | 'high';
  canDoNow: boolean;
};

export type HomeIntelligence = {
  mode: {
    name: string;
    slug: string;
    maxMajorTasks: number;
    energyTarget: number | null;
  } | null;
  availableMinutes: number | null;
  primary: HomeAction | null;
  alternatives: HomeAction[];
  inboxCount: number;
  maintenance: Array<{
    id: string;
    domain: string;
    title: string;
    dueAt: string | null;
    urgency: string;
    recommendation: string | null;
  }>;
  systemHealth: Array<{
    domain: string;
    status: 'stable' | 'attention' | 'behind';
    reason: string;
  }>;
} | null;

type DayMode = 'morning' | 'day' | 'evening' | 'night';

type WeatherState = {
  temperature: number;
  apparent: number;
  code: number;
} | null;

type FlowItem = {
  id: string;
  kind: 'event' | 'open';
  title: string;
  start: Date;
  end: Date;
  event?: PersonalEvent;
};

function travel(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

function openGlow(prefill?: string) {
  document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill } }));
}

function openVoice() {
  document.dispatchEvent(new CustomEvent('glow:voice-open'));
}

function formatClock(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDuration(minutes: number) {
  if (minutes <= 0) return 'Now';
  if (minutes < 60) return String(minutes) + ' min';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? String(hours) + 'h ' + String(rest) + 'm' : String(hours) + 'h';
}

function modeFor(date: Date): DayMode {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes >= 300 && minutes < 600) return 'morning';
  if (minutes >= 600 && minutes < 960) return 'day';
  if (minutes >= 960 && minutes < 1230) return 'evening';
  return 'night';
}

function modeLabel(mode: DayMode) {
  if (mode === 'morning') return 'Morning';
  if (mode === 'day') return 'Active day';
  if (mode === 'evening') return 'Evening';
  return 'Night';
}

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function eventEnd(event: PersonalEvent) {
  const start = new Date(event.startAt);
  return event.endAt ? new Date(event.endAt) : new Date(start.getTime() + 60 * 60_000);
}

function taskScore(task: PersonalTask, now: Date) {
  const priority = task.priority === 'urgent' ? 120 : task.priority === 'high' ? 85 : task.priority === 'medium' ? 45 : 15;
  const active = task.status === 'in_progress' ? 38 : 0;
  if (!task.dueDate) return priority + active;
  const due = new Date(task.dueDate);
  const diffHours = (due.getTime() - now.getTime()) / 3_600_000;
  const dueScore = diffHours < 0 ? 140 : diffHours <= 24 ? 110 : diffHours <= 72 ? 65 : diffHours <= 168 ? 30 : 0;
  return priority + active + dueScore;
}

function dueLabel(task: PersonalTask, now: Date) {
  if (task.status === 'in_progress') return 'In progress';
  if (!task.dueDate) return task.priority === 'urgent' ? 'Urgent' : task.priority === 'high' ? 'High priority' : 'Ready';
  const due = new Date(task.dueDate);
  const diffHours = Math.ceil((due.getTime() - now.getTime()) / 3_600_000);
  if (diffHours < 0) return 'Overdue';
  if (diffHours <= 24) return 'Due today';
  if (diffHours <= 48) return 'Due tomorrow';
  return 'Due ' + due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function weatherText(code: number) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code === 45 || code === 48) return 'Fog';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Showers';
  if (code >= 95) return 'Storms';
  return 'Weather';
}

function buildFlow(events: PersonalEvent[], now: Date): FlowItem[] {
  const dayStart = new Date(now);
  dayStart.setHours(5, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 0, 0, 0);

  const timed = events
    .filter((event) => !event.allDay)
    .map((event) => ({ event, start: new Date(event.startAt), end: eventEnd(event) }))
    .filter((item) => item.end > dayStart && item.start < dayEnd)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const result: FlowItem[] = [];
  let cursor = dayStart;

  for (const item of timed) {
    const start = item.start < dayStart ? dayStart : item.start;
    const end = item.end > dayEnd ? dayEnd : item.end;
    if (start.getTime() - cursor.getTime() >= 45 * 60_000) {
      result.push({
        id: 'open-' + String(cursor.getTime()),
        kind: 'open',
        title: 'Open space',
        start: new Date(cursor),
        end: new Date(start),
      });
    }
    result.push({
      id: 'event-' + item.event.id,
      kind: 'event',
      title: item.event.title,
      start,
      end,
      event: item.event,
    });
    if (end > cursor) cursor = end;
  }

  if (dayEnd.getTime() - cursor.getTime() >= 45 * 60_000) {
    result.push({
      id: 'open-' + String(cursor.getTime()),
      kind: 'open',
      title: 'Open space',
      start: new Date(cursor),
      end: dayEnd,
    });
  }

  return result;
}

function minutesOfOverlap(start: Date, end: Date, rangeStart: Date, rangeEnd: Date) {
  const left = Math.max(start.getTime(), rangeStart.getTime());
  const right = Math.min(end.getTime(), rangeEnd.getTime());
  return Math.max(0, Math.round((right - left) / 60_000));
}

function sectionTitle(eyebrow: string, title: string, detail?: string) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a7d6d]">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-[25px] leading-none tracking-[-0.025em] text-[#29231f]">{title}</h2>
      </div>
      {detail ? <p className="max-w-[240px] text-right text-[11px] leading-4 text-[#8d817a]">{detail}</p> : null}
    </div>
  );
}

function Surface({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        'relative overflow-hidden rounded-[28px] border border-[#ded4ca]/80 bg-[rgba(255,253,250,.78)] shadow-[0_18px_60px_rgba(71,55,46,.07),inset_0_1px_0_rgba(255,255,255,.82)] backdrop-blur-xl ' +
        className
      }
    >
      {children}
    </section>
  );
}

export function GlowThresholdReference({ intelligence }: { intelligence?: HomeIntelligence }) {
  const personal = usePersonalContext();
  const data = personal.status === 'ready' ? personal.data : null;
  const [now, setNow] = useState<Date | null>(null);
  const [capture, setCapture] = useState('');
  const [weather, setWeather] = useState<WeatherState>(null);
  const [weatherStatus, setWeatherStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem('glow:weather-enabled') === 'yes') {
      requestWeather();
    }
  }, []);

  const clock = now ?? new Date(0);
  const mode = now ? modeFor(now) : 'day';
  const firstName = data?.user.name?.trim().split(/\s+/)[0] ?? '';
  const todayEvents = useMemo(
    () => [...(data?.todayEvents ?? [])].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [data?.todayEvents],
  );
  const activeTasks = useMemo(
    () =>
      [...(data?.tasks ?? [])]
        .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
        .sort((a, b) => taskScore(b, clock) - taskScore(a, clock)),
    [data?.tasks, clock],
  );

  const currentEvent = now
    ? todayEvents.find((event) => {
        if (event.allDay) return false;
        const start = new Date(event.startAt);
        const end = eventEnd(event);
        return start <= now && end > now;
      }) ?? null
    : null;

  const nextEvent = now
    ? todayEvents.find((event) => !event.allDay && new Date(event.startAt) > now) ?? null
    : null;

  const eventProgress = currentEvent && now
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            ((now.getTime() - new Date(currentEvent.startAt).getTime()) /
              (eventEnd(currentEvent).getTime() - new Date(currentEvent.startAt).getTime())) *
              100,
          ),
        ),
      )
    : null;

  const eventMinutesLeft = currentEvent && now
    ? Math.max(0, Math.round((eventEnd(currentEvent).getTime() - now.getTime()) / 60_000))
    : null;

  const engineAction = intelligence?.primary ?? null;
  const nowTitle = currentEvent?.title ?? engineAction?.title ?? data?.activeTask?.title ?? 'Your next right step';
  const nowReason = currentEvent
    ? currentEvent.location
      ? 'You are in a scheduled block at ' + currentEvent.location + '.'
      : 'This is the commitment occupying the current block.'
    : engineAction?.reason ?? 'Glow will place the most useful next action here as your day develops.';
  const nowHref = currentEvent ? '/today?room=meeting&event=' + encodeURIComponent(currentEvent.id) : engineAction?.href ?? '/today?room=what-now';

  const nextEventMinutes = nextEvent && now ? Math.max(0, Math.round((new Date(nextEvent.startAt).getTime() - now.getTime()) / 60_000)) : null;
  const recommendedAction =
    nextEvent && nextEventMinutes !== null && nextEventMinutes <= 45
      ? {
          title: 'Prepare for ' + nextEvent.title,
          detail: 'Begins in ' + formatDuration(nextEventMinutes),
          href: '/calendar',
        }
      : engineAction
        ? {
            title: engineAction.title,
            detail: engineAction.reason,
            href: engineAction.href,
          }
        : activeTasks[0]
          ? {
              title: activeTasks[0].title,
              detail: dueLabel(activeTasks[0], clock),
              href: '/tasks',
            }
          : {
              title: 'Protect the open space',
              detail: 'Nothing urgent is asking for intervention.',
              href: '/today',
            };

  const todayThree = activeTasks.slice(0, 3);
  const flow = now ? buildFlow(todayEvents, now) : [];
  const allDayEvents = todayEvents.filter((event) => event.allDay);

  const dayEnd = now ? new Date(now) : new Date();
  dayEnd.setHours(23, 0, 0, 0);
  const remainingMinutes = now ? Math.max(0, Math.round((dayEnd.getTime() - now.getTime()) / 60_000)) : 0;
  const scheduledRemaining = now
    ? todayEvents
        .filter((event) => !event.allDay)
        .reduce((total, event) => total + minutesOfOverlap(new Date(event.startAt), eventEnd(event), now, dayEnd), 0)
    : 0;
  const openMinutes = Math.max(0, remainingMinutes - scheduledRemaining);
  const openPercent = remainingMinutes ? Math.round((openMinutes / remainingMinutes) * 100) : 0;

  const overdueTasks = now
    ? activeTasks.filter((task) => task.dueDate && new Date(task.dueDate) < now).slice(0, 2)
    : [];

  const conflicts = useMemo(() => {
    const timed = todayEvents.filter((event) => !event.allDay);
    const found: Array<[PersonalEvent, PersonalEvent]> = [];
    for (let i = 0; i < timed.length - 1; i += 1) {
      if (eventEnd(timed[i]) > new Date(timed[i + 1].startAt)) found.push([timed[i], timed[i + 1]]);
    }
    return found.slice(0, 1);
  }, [todayEvents]);

  const attention = [
    ...overdueTasks.map((task) => ({
      id: 'task-' + task.id,
      title: task.title,
      detail: 'Overdue task',
      href: '/tasks',
      level: 'urgent',
    })),
    ...conflicts.map(([first, second]) => ({
      id: 'conflict-' + first.id,
      title: 'Calendar conflict',
      detail: first.title + ' overlaps ' + second.title,
      href: '/calendar',
      level: 'urgent',
    })),
    ...(nextEvent && nextEventMinutes !== null && nextEventMinutes <= 60
      ? [
          {
            id: 'prep-' + nextEvent.id,
            title: 'Prepare for ' + nextEvent.title,
            detail: 'Starts in ' + formatDuration(nextEventMinutes),
            href: '/calendar',
            level: 'soon',
          },
        ]
      : []),
    ...(data?.sourceStatus.googleCalendar && data.sourceStatus.googleCalendar !== 'connected'
      ? [
          {
            id: 'calendar-source',
            title: 'Calendar needs attention',
            detail: 'Connection status: ' + data.sourceStatus.googleCalendar.replace(/_/g, ' '),
            href: '/connections',
            level: 'soon',
          },
        ]
      : []),
    ...(intelligence?.maintenance ?? []).slice(0, 2).map((item) => ({
      id: 'maintenance-' + item.id,
      title: item.title,
      detail: item.recommendation ?? item.domain + ' maintenance',
      href: '/maintenance',
      level: item.urgency === 'urgent' ? 'urgent' : 'soon',
    })),
    ...(intelligence?.systemHealth ?? [])
      .filter((item) => item.status !== 'stable')
      .slice(0, 2)
      .map((item) => ({
        id: 'health-' + item.domain,
        title: item.domain + ' needs attention',
        detail: item.reason,
        href: '/brain',
        level: item.status === 'behind' ? 'urgent' : 'soon',
      })),
  ].filter((item, index, list) => list.findIndex((other) => other.id === item.id) === index).slice(0, 4);

  const remainingToday = now ? todayEvents.filter((event) => new Date(event.startAt) > now) : [];
  const tonight = remainingToday.filter((event) => new Date(event.startAt).getHours() >= 17).slice(0, 3);
  const laterToday = remainingToday.filter((event) => new Date(event.startAt).getHours() < 17).slice(0, 3);
  const tomorrow = (data?.tomorrowEvents ?? []).slice(0, 3);

  const observations = useMemo(() => {
    const items: string[] = [];
    if (openMinutes >= 120 && activeTasks.length) {
      items.push('You still have ' + formatDuration(openMinutes) + ' of genuine open space. Protect the longest block for one meaningful task.');
    }
    if (todayEvents.length >= 4 && activeTasks.filter((task) => task.priority === 'urgent' || task.priority === 'high').length >= 2) {
      items.push('Today is commitment-heavy. Glow is keeping the task layer selective instead of showing the full database.');
    }
    if (!attention.length && todayEvents.length <= 2) {
      items.push('Nothing currently requires intervention. The calm screen is intentional.');
    }
    if (data?.wellness?.energy) {
      items.push('Today’s energy check-in is ' + data.wellness.energy + '. The action layer can use that signal when choosing what fits now.');
    }
    return items.slice(0, 2);
  }, [activeTasks, attention.length, data?.wellness?.energy, openMinutes, todayEvents.length]);

  const routineWindow = (data?.routines ?? []).filter((routine) => {
    if (mode === 'morning') return routine.timeOfDay === 'morning' || routine.timeOfDay === 'anytime';
    if (mode === 'day') return routine.timeOfDay === 'afternoon' || routine.timeOfDay === 'anytime';
    if (mode === 'evening') return routine.timeOfDay === 'evening' || routine.timeOfDay === 'anytime';
    return routine.timeOfDay === 'night' || routine.timeOfDay === 'anytime';
  }).slice(0, 4);

  const summary = now
    ? mode === 'morning'
      ? String(todayEvents.length) + ' calendar commitments and ' + String(todayThree.length) + ' priority outcomes shape the day.'
      : mode === 'day'
        ? currentEvent
          ? 'You are inside ' + currentEvent.title + '. Glow is protecting the transition that follows.'
          : nextEvent
            ? 'Your next commitment is ' + nextEvent.title + ' in ' + formatDuration(nextEventMinutes ?? 0) + '.'
            : 'The rest of the active day is comparatively open. Use the space deliberately.'
        : mode === 'evening'
          ? String(tonight.length) + ' evening commitments remain. Tomorrow is already visible below.'
          : tomorrow[0]
            ? 'The interface is quieter now. Tomorrow begins with ' + tomorrow[0].title + '.'
            : 'The interface is quieter now. Close loops and protect your night.'
    : 'Glow is assembling the shape of your day.';

  async function requestWeather() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setWeatherStatus('error');
      return;
    }
    setWeatherStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude.toFixed(4);
          const longitude = position.coords.longitude.toFixed(4);
          const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=' +
              latitude +
              '&longitude=' +
              longitude +
              '&current=temperature_2m,apparent_temperature,weather_code&temperature_unit=fahrenheit',
          );
          if (!response.ok) throw new Error('Weather unavailable');
          const payload = await response.json();
          setWeather({
            temperature: Math.round(payload.current.temperature_2m),
            apparent: Math.round(payload.current.apparent_temperature),
            code: Number(payload.current.weather_code),
          });
          setWeatherStatus('ready');
          window.localStorage.setItem('glow:weather-enabled', 'yes');
        } catch {
          setWeatherStatus('error');
        }
      },
      () => setWeatherStatus('error'),
      { enableHighAccuracy: false, maximumAge: 15 * 60_000, timeout: 8_000 },
    );
  }

  const forwardLook = (
    <Surface className={mode === 'night' ? 'border-[#d4c7bd] bg-[rgba(249,246,243,.88)] p-6 md:p-7' : 'p-6 md:p-7'}>
      {sectionTitle('Forward', mode === 'night' ? 'Close today. See tomorrow.' : 'Later today · tonight · tomorrow', 'Only the next horizon, not the whole calendar.')}
      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['Later today', laterToday, '/calendar'],
          ['Tonight', tonight, '/today?room=tonight'],
          ['Tomorrow', tomorrow, '/tomorrow'],
        ].map(([label, items, href]) => {
          const list = items as PersonalEvent[];
          return (
            <button
              key={String(label)}
              type="button"
              onClick={() => travel(String(href))}
              className="group min-h-[132px] rounded-[20px] border border-[#e4dbd3] bg-white/65 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#cbb7a7] hover:shadow-[0_12px_30px_rgba(68,51,43,.06)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b7f70]">{String(label)}</span>
                <ArrowRight size={14} className="text-[#baa99e] transition group-hover:translate-x-0.5" />
              </div>
              {list.length ? (
                <div className="mt-4 space-y-2">
                  {list.slice(0, 2).map((event) => (
                    <div key={event.id}>
                      <p className="truncate text-[12px] font-medium text-[#302a26]">{event.title}</p>
                      <p className="mt-0.5 text-[10px] text-[#91857e]">{event.allDay ? 'All day' : formatClock(new Date(event.startAt))}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-5 text-[12px] leading-5 text-[#948880]">Nothing fixed here yet.</p>
              )}
            </button>
          );
        })}
      </div>
    </Surface>
  );

  return (
    <div
      data-home-mode={mode}
      className={
        mode === 'night'
          ? 'min-h-screen overflow-x-hidden bg-[#eeebe9] pb-24 text-[#2a2522] transition-colors duration-700'
          : 'min-h-screen overflow-x-hidden bg-[#f5f1ec] pb-24 text-[#2a2522] transition-colors duration-700'
      }
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[18%] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.95)_0%,rgba(239,219,209,.28)_42%,transparent_72%)]" />
        <div className="absolute right-[-12%] top-[12%] h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,rgba(228,235,232,.55)_0%,rgba(245,240,235,.08)_55%,transparent_74%)]" />
        <div className="absolute bottom-[-24%] left-[26%] h-[620px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(238,224,215,.48)_0%,transparent_69%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-14 pt-5 sm:px-6 md:px-8 lg:px-10">
        <header className="rounded-[32px] border border-white/70 bg-[rgba(255,253,250,.62)] px-5 py-5 shadow-[0_18px_70px_rgba(77,59,49,.06),inset_0_1px_0_rgba(255,255,255,.92)] backdrop-blur-2xl md:px-7 md:py-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#947b6d]">
                <span>{now ? formatDate(now) : 'Today'}</span>
                <span className="h-1 w-1 rounded-full bg-[#c8b8ad]" />
                <span>{now ? formatClock(now) : '—'}</span>
                <span className="h-1 w-1 rounded-full bg-[#c8b8ad]" />
                <span>{modeLabel(mode)}</span>
              </div>
              <h1 className="mt-3 font-serif text-[35px] leading-[1.04] tracking-[-0.04em] text-[#2d2723] sm:text-[43px] md:text-[50px]">
                {now ? greetingFor(now) : 'Glow Home'}{firstName ? ', ' + firstName : ''}.
              </h1>
              <p className="mt-3 max-w-3xl text-[13px] leading-6 text-[#746a64] md:text-[14px]">{summary}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:max-w-[470px] lg:justify-end">
              <button
                type="button"
                onClick={requestWeather}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dfd5cd] bg-white/65 px-4 text-[11px] text-[#5f554f] transition hover:bg-white"
                aria-label="Load local weather"
              >
                <Sparkles size={13} />
                {weatherStatus === 'loading'
                  ? 'Weather…'
                  : weatherStatus === 'ready' && weather
                    ? String(weather.temperature) + '° · ' + weatherText(weather.code)
                    : weatherStatus === 'error'
                      ? 'Weather unavailable'
                      : 'Enable weather'}
              </button>
              <button
                type="button"
                onClick={() => travel('/settings/intelligence')}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#dfd5cd] bg-white/65 px-4 text-[11px] text-[#5f554f] transition hover:bg-white"
              >
                <Zap size={13} />
                {intelligence?.mode?.name ?? 'Normal Day'}
              </button>
              <button
                type="button"
                onClick={() => travel('/notifications')}
                className="grid h-11 w-11 place-items-center rounded-full border border-[#dfd5cd] bg-white/65 text-[#665b54] transition hover:bg-white"
                aria-label="Open notifications"
              >
                <Bell size={15} />
              </button>
            </div>
          </div>
        </header>

        <div className="mt-5 space-y-5">
          {(mode === 'evening' || mode === 'night') ? forwardLook : null}

          <div className="grid gap-5 xl:grid-cols-[1.45fr_.78fr]">
            <Surface className="min-h-[390px] p-6 md:p-8">
              <div className="absolute right-[-90px] top-[-110px] h-[310px] w-[310px] rounded-full bg-[radial-gradient(circle,rgba(223,205,194,.55),rgba(255,255,255,.05)_62%,transparent_72%)]" />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d6c7ba] bg-[#f7f0ea]/80 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9f7f6c]" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#83695b]">Now</span>
                  </div>
                  {eventMinutesLeft !== null ? (
                    <span className="text-[11px] text-[#81766e]">{formatDuration(eventMinutesLeft)} remaining</span>
                  ) : intelligence?.availableMinutes !== null && intelligence?.availableMinutes !== undefined ? (
                    <span className="text-[11px] text-[#81766e]">{formatDuration(intelligence.availableMinutes)} usable before next constraint</span>
                  ) : null}
                </div>

                <h2 className="mt-7 max-w-3xl font-serif text-[34px] leading-[1.08] tracking-[-0.035em] text-[#28221f] sm:text-[40px] md:text-[46px]">{nowTitle}</h2>
                <p className="mt-4 max-w-2xl text-[13px] leading-6 text-[#746a63]">{nowReason}</p>

                {eventProgress !== null ? (
                  <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between text-[10px] text-[#8a7d75]">
                      <span>Block progress</span>
                      <span>{eventProgress}%</span>
                    </div>
                    <div className="h-[5px] overflow-hidden rounded-full bg-[#e5ddd6]">
                      <div className="h-full rounded-full bg-[#8e7567] transition-all" style={{ width: String(eventProgress) + '%' }} />
                    </div>
                  </div>
                ) : null}

                <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <button
                    type="button"
                    onClick={() => travel(recommendedAction.href)}
                    className="group rounded-[21px] border border-[#dfd3c8] bg-white/72 p-4 text-left transition hover:border-[#cbb6a7] hover:bg-white"
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9b7d6e]">Recommended next action</p>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[#302923]">{recommendedAction.title}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#857a73]">{recommendedAction.detail}</p>
                      </div>
                      <ArrowRight size={16} className="mt-1 shrink-0 text-[#a99080] transition group-hover:translate-x-1" />
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => travel(nowHref)}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#312a26] px-5 text-[11px] font-medium text-white shadow-[0_10px_24px_rgba(48,38,33,.16)] transition hover:-translate-y-0.5"
                  >
                    Open current context <ArrowRight size={14} />
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {nextEvent ? (
                    <button type="button" onClick={() => travel('/calendar')} className="rounded-full border border-[#e4dad2] bg-white/55 px-3 py-2 text-[10px] text-[#756a63]">
                      Next · {formatClock(new Date(nextEvent.startAt))} · {nextEvent.title}
                    </button>
                  ) : (
                    <span className="rounded-full border border-[#e4dad2] bg-white/55 px-3 py-2 text-[10px] text-[#756a63]">No fixed event next</span>
                  )}
                  {routineWindow.slice(0, 2).map((routine) => (
                    <button key={routine.id} type="button" onClick={() => travel('/routines')} className="rounded-full border border-[#e4dad2] bg-white/55 px-3 py-2 text-[10px] text-[#756a63]">
                      {routine.name}
                    </button>
                  ))}
                </div>
              </div>
            </Surface>

            <Surface className="p-6 md:p-7">
              {sectionTitle('Outcomes', 'Today’s Three', 'Exactly three. Everything else stays underneath.')}
              <div className="space-y-3">
                {[0, 1, 2].map((index) => {
                  const task = todayThree[index];
                  if (!task) {
                    return (
                      <button key={index} type="button" onClick={() => travel('/tasks')} className="flex w-full items-center gap-3 rounded-[19px] border border-dashed border-[#ddd1c7] bg-white/35 p-4 text-left">
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-[#d8ccc2] text-[#a08f85]"><Plus size={13} /></span>
                        <span className="text-[11px] text-[#8d8179]">Choose outcome {index + 1}</span>
                      </button>
                    );
                  }
                  return (
                    <button key={task.id} type="button" onClick={() => travel('/tasks')} className="group flex w-full items-start gap-3 rounded-[19px] border border-[#e3d9d1] bg-white/62 p-4 text-left transition hover:border-[#cbb9ac] hover:bg-white/85">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#d6c8bd] bg-[#f9f5f1] font-serif text-[12px] text-[#7f685b]">{index + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-[13px] font-medium leading-5 text-[#322b27]">{task.title}</span>
                        <span className="mt-1.5 block text-[9px] uppercase tracking-[0.12em] text-[#9b877a]">{dueLabel(task, clock)}</span>
                      </span>
                      <ChevronDown size={13} className="-rotate-90 text-[#baa99d] transition group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </div>
              <button type="button" onClick={() => travel('/tasks')} className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#8a6f60]">
                Open task system <ArrowRight size={12} />
              </button>
            </Surface>
          </div>

          {mode === 'morning' ? (
            <Surface className="p-6 md:p-7">
              {sectionTitle('Flow', 'The shape of today', 'Calendar facts stay visible. Open space is shown as real space.')}
              {allDayEvents.length ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  {allDayEvents.map((event) => <span key={event.id} className="rounded-full bg-[#eee6df] px-3 py-1.5 text-[9px] text-[#786b63]">All day · {event.title}</span>)}
                </div>
              ) : null}
              <div className="space-y-2">
                {flow.slice(0, 7).map((item) => {
                  const isCurrent = now ? item.start <= now && item.end > now : false;
                  const isPast = now ? item.end <= now : false;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => travel(item.kind === 'event' ? '/calendar' : '/today?room=what-now')}
                      className={
                        item.kind === 'open'
                          ? 'flex w-full items-center gap-4 rounded-[17px] border border-dashed border-[#dcd1c8] bg-white/26 px-4 py-3 text-left'
                          : isCurrent
                            ? 'flex w-full items-center gap-4 rounded-[17px] border border-[#cbb7a7] bg-[#f6eee8] px-4 py-3 text-left shadow-[inset_3px_0_0_#9d7b68]'
                            : isPast
                              ? 'flex w-full items-center gap-4 rounded-[17px] border border-[#e7dfd8] bg-white/36 px-4 py-3 text-left opacity-55'
                              : 'flex w-full items-center gap-4 rounded-[17px] border border-[#e1d7cf] bg-white/62 px-4 py-3 text-left'
                      }
                    >
                      <span className="w-[76px] shrink-0 text-[10px] tabular-nums text-[#8c7f77]">{formatClock(item.start)}</span>
                      <span className="h-7 w-px bg-[#d9cdc4]" />
                      <span className="min-w-0 flex-1">
                        <span className={item.kind === 'open' ? 'text-[12px] italic text-[#92867f]' : 'truncate text-[12px] font-medium text-[#342d29]'}>{item.title}</span>
                        <span className="mt-0.5 block text-[9px] text-[#9a8d85]">{formatDuration(Math.max(0, Math.round((item.end.getTime() - item.start.getTime()) / 60_000)))}</span>
                      </span>
                      {isCurrent ? <span className="rounded-full bg-[#8c7060] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white">Now</span> : null}
                    </button>
                  );
                })}
              </div>
              {flow.length > 7 ? (
                <details className="mt-3">
                  <summary className="cursor-pointer list-none text-[10px] font-medium text-[#896f61]">Show full day flow</summary>
                  <div className="mt-3 space-y-2">
                    {flow.slice(7).map((item) => (
                      <button key={item.id} type="button" onClick={() => travel(item.kind === 'event' ? '/calendar' : '/today')} className="flex w-full items-center gap-4 rounded-[17px] border border-[#e4dbd4] bg-white/48 px-4 py-3 text-left">
                        <span className="w-[76px] text-[10px] text-[#8c7f77]">{formatClock(item.start)}</span>
                        <span className="text-[12px] text-[#4a413b]">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </details>
              ) : null}
            </Surface>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[1.18fr_.82fr]">
            <Surface className="p-6 md:p-7">
              {sectionTitle('Execution', 'Smart Tasks', 'Ranked by live constraints when Glow Intelligence is available.')}
              <div className="space-y-3">
                {(intelligence?.primary ? [intelligence.primary, ...(intelligence.alternatives ?? [])] : []).slice(0, 4).map((action, index) => (
                  <button key={action.id} type="button" onClick={() => travel(action.href)} className="group grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 rounded-[20px] border border-[#e3dad2] bg-white/58 p-4 text-left transition hover:border-[#cab8ab] hover:bg-white/86">
                    <span className={index === 0 ? 'grid h-9 w-9 place-items-center rounded-full bg-[#342c27] text-white' : 'grid h-9 w-9 place-items-center rounded-full bg-[#efe7e0] text-[#8b7061]'}>
                      {index === 0 ? <Zap size={14} /> : <Target size={14} />}
                    </span>
                    <span>
                      <span className="text-[13px] font-medium text-[#312a26]">{action.title}</span>
                      <span className="mt-1 block line-clamp-2 text-[10px] leading-4 text-[#8b7f77]">{action.reason}</span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-[#f0e8e1] px-2 py-1 text-[8px] uppercase tracking-[0.1em] text-[#8d7465]">{action.source}</span>
                        <span className="rounded-full bg-[#f0e8e1] px-2 py-1 text-[8px] uppercase tracking-[0.1em] text-[#8d7465]">{action.estimatedMinutes} min</span>
                        <span className="rounded-full bg-[#f0e8e1] px-2 py-1 text-[8px] uppercase tracking-[0.1em] text-[#8d7465]">{action.energyCost} energy</span>
                      </span>
                    </span>
                    <ArrowRight size={14} className="mt-1 text-[#b7a69a] transition group-hover:translate-x-1" />
                  </button>
                ))}
                {!intelligence?.primary
                  ? activeTasks.slice(0, 4).map((task) => (
                      <button key={task.id} type="button" onClick={() => travel('/tasks')} className="group grid w-full grid-cols-[auto_1fr_auto] items-start gap-3 rounded-[20px] border border-[#e3dad2] bg-white/58 p-4 text-left transition hover:border-[#cab8ab] hover:bg-white/86">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#efe7e0] text-[#8b7061]"><Target size={14} /></span>
                        <span>
                          <span className="text-[13px] font-medium text-[#312a26]">{task.title}</span>
                          <span className="mt-1 block text-[10px] text-[#8b7f77]">{dueLabel(task, clock)} · ranked from task priority and deadline</span>
                        </span>
                        <ArrowRight size={14} className="mt-1 text-[#b7a69a] transition group-hover:translate-x-1" />
                      </button>
                    ))
                  : null}
                {!activeTasks.length && !intelligence?.primary ? <p className="rounded-[18px] border border-[#e3dad2] bg-white/42 p-5 text-[12px] leading-5 text-[#897d75]">No active tasks are competing for attention.</p> : null}
              </div>
            </Surface>

            <Surface className="p-6 md:p-7">
              {sectionTitle('Capacity + Energy', 'What the day can hold', 'Time is measured. Energy is shown only from signals Glow actually has.')}
              <div className="rounded-[22px] border border-[#e1d7cf] bg-white/60 p-5">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9a8172]">Open time remaining</p>
                    <p className="mt-2 font-serif text-[34px] tracking-[-0.04em] text-[#302925]">{formatDuration(openMinutes)}</p>
                  </div>
                  <p className="text-[11px] text-[#897d76]">{openPercent}% of the remaining day</p>
                </div>
                <div className="mt-4 h-[6px] overflow-hidden rounded-full bg-[#e7dfd8]">
                  <div className="h-full rounded-full bg-[#9a806f]" style={{ width: String(openPercent) + '%' }} />
                </div>
                {intelligence?.availableMinutes !== null && intelligence?.availableMinutes !== undefined ? (
                  <p className="mt-3 text-[10px] leading-4 text-[#887b73]">Immediate usable block: {formatDuration(intelligence.availableMinutes)} after Glow’s transition buffer.</p>
                ) : null}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  ['Mental', data?.wellness?.energy ?? 'Not checked in'],
                  ['Physical', data?.wellness?.energy ?? 'Not checked in'],
                  ['Creative', engineAction?.source === 'task' ? 'Task context' : 'Contextual'],
                  ['Social', todayEvents.length ? String(todayEvents.length) + ' commitments' : 'Open'],
                  ['Emotional', data?.wellness?.mood ?? 'Not logged'],
                ].map(([label, value], index) => (
                  <div key={label} className={index === 4 ? 'col-span-2 rounded-[16px] border border-[#e5dcd5] bg-white/45 px-3 py-3' : 'rounded-[16px] border border-[#e5dcd5] bg-white/45 px-3 py-3'}>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#9d887b]">{label}</p>
                    <p className="mt-1.5 truncate text-[11px] font-medium text-[#4c423c]">{value}</p>
                  </div>
                ))}
              </div>
            </Surface>
          </div>

          {mode !== 'morning' ? (
            <Surface className="p-6 md:p-7">
              {sectionTitle('Flow', 'Day Flow', 'Events and genuine open space. Routine windows stay contextual, not falsely scheduled.')}
              <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                <div className="space-y-2">
                  {flow.slice(0, 6).map((item) => {
                    const isCurrent = now ? item.start <= now && item.end > now : false;
                    const isPast = now ? item.end <= now : false;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => travel(item.kind === 'event' ? '/calendar' : '/today?room=what-now')}
                        className={
                          item.kind === 'open'
                            ? 'flex w-full items-center gap-4 rounded-[17px] border border-dashed border-[#dcd1c8] bg-white/26 px-4 py-3 text-left'
                            : isCurrent
                              ? 'flex w-full items-center gap-4 rounded-[17px] border border-[#cbb7a7] bg-[#f6eee8] px-4 py-3 text-left shadow-[inset_3px_0_0_#9d7b68]'
                              : isPast
                                ? 'flex w-full items-center gap-4 rounded-[17px] border border-[#e7dfd8] bg-white/36 px-4 py-3 text-left opacity-55'
                                : 'flex w-full items-center gap-4 rounded-[17px] border border-[#e1d7cf] bg-white/62 px-4 py-3 text-left'
                        }
                      >
                        <span className="w-[72px] shrink-0 text-[10px] tabular-nums text-[#8c7f77]">{formatClock(item.start)}</span>
                        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#342d29]">{item.title}</span>
                        {isCurrent ? <span className="rounded-full bg-[#8c7060] px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-white">Now</span> : null}
                      </button>
                    );
                  })}
                </div>
                <div className="min-w-[210px] rounded-[20px] border border-[#e2d8d0] bg-white/45 p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-[#9b8172]">Current routine window</p>
                  <div className="mt-3 space-y-2">
                    {routineWindow.length ? routineWindow.map((routine) => (
                      <button key={routine.id} type="button" onClick={() => travel('/routines')} className="block w-full rounded-[13px] bg-white/65 px-3 py-2.5 text-left text-[10px] text-[#61564f]">{routine.name}</button>
                    )) : <p className="text-[10px] leading-5 text-[#94877f]">No routine is explicitly assigned to this daypart.</p>}
                  </div>
                </div>
              </div>
              {flow.length > 6 ? (
                <details className="mt-4">
                  <summary className="cursor-pointer list-none text-[10px] font-medium text-[#896f61]">Show the rest of the day</summary>
                  <div className="mt-3 space-y-2">
                    {flow.slice(6).map((item) => (
                      <button key={item.id} type="button" onClick={() => travel(item.kind === 'event' ? '/calendar' : '/today')} className="flex w-full items-center gap-4 rounded-[17px] border border-[#e4dbd4] bg-white/48 px-4 py-3 text-left">
                        <span className="w-[72px] text-[10px] text-[#8c7f77]">{formatClock(item.start)}</span>
                        <span className="text-[12px] text-[#4a413b]">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </details>
              ) : null}
            </Surface>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <Surface className="p-6 md:p-7">
              {sectionTitle('Intervention only', 'Attention Center', 'This room stays quiet unless something actually needs you.')}
              {attention.length ? (
                <div className="space-y-3">
                  {attention.map((item) => (
                    <button key={item.id} type="button" onClick={() => travel(item.href)} className="flex w-full items-start gap-3 rounded-[18px] border border-[#e2d8d0] bg-white/55 p-4 text-left transition hover:bg-white/82">
                      <span className={item.level === 'urgent' ? 'mt-1 h-2 w-2 shrink-0 rounded-full bg-[#a55e5e]' : 'mt-1 h-2 w-2 shrink-0 rounded-full bg-[#b59669]'} />
                      <span className="min-w-0 flex-1">
                        <span className="text-[12px] font-medium text-[#3a322d]">{item.title}</span>
                        <span className="mt-1 block line-clamp-2 text-[10px] leading-4 text-[#8b7e76]">{item.detail}</span>
                      </span>
                      <ArrowRight size={13} className="mt-1 text-[#b8a79b]" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-[20px] border border-[#dfe1d9] bg-[#f5f7f2]/70 p-5">
                  <div className="flex items-center gap-2 text-[#65705c]"><CheckCircle2 size={16} /><span className="text-[11px] font-medium">Nothing needs intervention right now.</span></div>
                  <p className="mt-2 text-[10px] leading-5 text-[#7e8878]">No overdue task, conflict, urgent maintenance item, or connection issue is currently being surfaced.</p>
                </div>
              )}
            </Surface>

            <Surface className="p-6 md:p-7">
              {sectionTitle('Pattern layer', 'Glow Noticed', 'One or two useful observations. No suggestion wall.')}
              {observations.length ? (
                <div className="space-y-3">
                  {observations.map((observation, index) => (
                    <div key={observation} className="rounded-[20px] border border-[#e2d8d0] bg-white/55 p-5">
                      <div className="flex items-start gap-3">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eee4dc] text-[#8d7061]"><Sparkles size={13} /></span>
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9b8172]">Observation {index + 1}</p>
                          <p className="mt-2 text-[12px] leading-5 text-[#4b413b]">{observation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-[20px] border border-[#e2d8d0] bg-white/45 p-5 text-[11px] leading-5 text-[#897d75]">Glow is waiting for enough context to make a useful observation.</p>
              )}
              <button type="button" onClick={() => travel('/brain/insights')} className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-medium text-[#8a6f60]">
                Open evidence-backed insights <ArrowRight size={12} />
              </button>
            </Surface>
          </div>

          <Surface className="p-6 md:p-7">
            {sectionTitle('Universal input', 'Capture something or ask Glow', 'One field. Glow decides whether you are saving information or asking for help.')}
            <form action={universalIntakeAction} className="rounded-[24px] border border-[#d8cdc4] bg-white/70 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.8)]">
              <input type="hidden" name="sourceRoute" value="/home" />
              <div className="flex items-center gap-2">
                <Search size={17} className="ml-3 shrink-0 text-[#9f8b7e]" />
                <input
                  name="text"
                  value={capture}
                  onChange={(event) => setCapture(event.target.value)}
                  placeholder="Task, idea, shopping item, appointment, note, question, command…"
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-[13px] text-[#342d29] outline-none placeholder:text-[#a79b94]"
                />
                <button type="button" onClick={openVoice} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#dfd5cd] bg-white text-[#79685e]" aria-label="Use voice with Glow">
                  <Mic2 size={15} />
                </button>
                <button type="submit" className="hidden min-h-10 items-center gap-2 rounded-full border border-[#d7cac0] bg-[#f6f0eb] px-4 text-[10px] font-medium text-[#675850] sm:inline-flex">
                  <Inbox size={13} /> Capture
                </button>
                <button type="button" onClick={() => openGlow(capture.trim() || 'What should I do next?')} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full bg-[#302925] px-4 text-[10px] font-medium text-white sm:px-5">
                  <Sparkles size={13} /> Ask Glow
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#ebe3dc] px-3 py-2 sm:hidden">
                <span className="text-[9px] text-[#94877f]">Capture classifies + stores for review.</span>
                <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-[#f2ebe5] px-3 py-2 text-[9px] text-[#6d5d54]"><Plus size={11} /> Capture</button>
              </div>
            </form>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => openGlow('What should I focus on right now?')} className="rounded-full border border-[#e0d6ce] bg-white/45 px-3 py-2 text-[9px] text-[#766961]">What should I focus on?</button>
              <button type="button" onClick={() => openGlow('Replan the rest of today around my current capacity.')} className="rounded-full border border-[#e0d6ce] bg-white/45 px-3 py-2 text-[9px] text-[#766961]">Replan the rest of today</button>
              <button type="button" onClick={() => travel('/inbox')} className="rounded-full border border-[#e0d6ce] bg-white/45 px-3 py-2 text-[9px] text-[#766961]">Glow Inbox · {intelligence?.inboxCount ?? 0}</button>
            </div>
          </Surface>

          {(mode !== 'evening' && mode !== 'night') ? forwardLook : null}

          <Surface className="p-6 md:p-7">
            {sectionTitle('System entrances', 'World Pulse', 'Home synthesizes. The Worlds remain the places where deep work happens.')}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                ['Today', '/today', String(todayEvents.length) + ' events · ' + String(activeTasks.length) + ' open tasks', 'Immediate present'],
                ['Plan', '/planning', nextEvent ? 'Next · ' + formatClock(new Date(nextEvent.startAt)) : 'Calendar is open', 'Time becoming you'],
                ['Life', '/life', data?.wellness?.energy ? 'Energy · ' + data.wellness.energy : 'Life systems connected', 'Your inhabited world'],
                ['Brain', '/brain', String(data?.notes.length ?? 0) + ' notes · ' + String(intelligence?.inboxCount ?? 0) + ' inbox', 'Knowledge in motion'],
                ['Create', '/create', String((data?.goals ?? []).filter((goal) => goal.status !== 'complete').length) + ' active goals', 'Ideas into reality'],
              ].map(([label, href, status, cue]) => (
                <button key={label} type="button" onClick={() => travel(href)} className="group min-h-[154px] rounded-[21px] border border-[#e0d6ce] bg-white/53 p-4 text-left transition hover:-translate-y-0.5 hover:border-[#c9b6a8] hover:bg-white/82">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#eee6df] text-[#8a7062]">
                      {label === 'Today' ? <Clock3 size={14} /> : label === 'Plan' ? <CalendarDays size={14} /> : label === 'Life' ? <Sparkles size={14} /> : label === 'Brain' ? <BrainCircuit size={14} /> : <Target size={14} />}
                    </span>
                    <ArrowRight size={13} className="text-[#b7a69a] transition group-hover:translate-x-1" />
                  </div>
                  <p className="mt-5 font-serif text-[18px] text-[#352d29]">{label}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#a08a7c]">{cue}</p>
                  <p className="mt-3 text-[10px] leading-4 text-[#81756e]">{status}</p>
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Beauty', '/beauty'],
                ['Closet', '/closet'],
                ['Fitness', '/fitness'],
                ['Wellness', '/wellness'],
              ].map(([label, href]) => (
                <button key={label} type="button" onClick={() => travel(href)} className="rounded-[16px] border border-[#e4dbd4] bg-white/35 px-3 py-3 text-[10px] text-[#766960] transition hover:bg-white/72">
                  Life · {label}
                </button>
              ))}
            </div>
          </Surface>

          <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-1 text-[9px] uppercase tracking-[0.14em] text-[#a09187]">
            <span>Home V2 · Modern Heirloom Computing</span>
            <span>Progressive disclosure · live context · calm by default</span>
          </div>
        </div>
      </div>
    </div>
  );
}
