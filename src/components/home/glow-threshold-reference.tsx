'use client';

import {
  ArrowRight,
  Bell,
  BrainCircuit,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  Dumbbell,
  Heart,
  Home as HomeIcon,
  Inbox,
  Lightbulb,
  ListChecks,
  Mic2,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Undo2,
  UserRound,
  WalletCards,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { universalIntakeAction } from '@/app/actions/universal-intake';
import { updateTaskAction } from '@/app/actions/tasks';
import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import { useServerAction } from '@/lib/hooks/use-server-action';

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
type SystemTab = 'tasks' | 'reminders' | 'habits' | 'routines';

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

const HERO_IMAGE =
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200';
const ROUTINE_IMAGES = [
  'https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1034662/pexels-photo-1034662.jpeg?auto=compress&cs=tinysrgb&w=500',
];
const LIFE_IMAGES = [
  'https://images.pexels.com/photos/1084199/pexels-photo-1084199.jpeg?auto=compress&cs=tinysrgb&w=500',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=500',
];

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
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
  if (mode === 'morning') return 'Good morning';
  if (mode === 'day') return 'Good afternoon';
  if (mode === 'evening') return 'Good evening';
  return 'Good night';
}

function greetingFor(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Welcome';
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
      result.push({ id: 'open-' + String(cursor.getTime()), kind: 'open', title: 'Open time', start: new Date(cursor), end: new Date(start) });
    }
    result.push({ id: 'event-' + item.event.id, kind: 'event', title: item.event.title, start, end, event: item.event });
    if (end > cursor) cursor = end;
  }
  if (dayEnd.getTime() - cursor.getTime() >= 45 * 60_000) {
    result.push({ id: 'open-' + String(cursor.getTime()), kind: 'open', title: 'Open time', start: new Date(cursor), end: dayEnd });
  }
  return result;
}

function Glass({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        'relative overflow-hidden rounded-[18px] border border-white/75 bg-[rgba(255,253,250,.67)] shadow-[0_10px_28px_rgba(68,52,44,.055),inset_0_1px_0_rgba(255,255,255,.92)] backdrop-blur-[18px] ' +
        className
      }
    >
      {children}
    </section>
  );
}

function MicroTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#866f63]">{children}</p>;
}

function MiniIcon({ kind, size = 11, className = '' }: { kind: string; size?: number; className?: string }) {
  if (kind === 'month') return <CalendarRange size={size} className={className} />;
  if (kind === 'week') return <CalendarDays size={size} className={className} />;
  if (kind === 'tomorrow') return <Moon size={size} className={className} />;
  if (kind === 'tasks') return <ListChecks size={size} className={className} />;
  if (kind === 'mind') return <Heart size={size} className={className} />;
  if (kind === 'finance') return <WalletCards size={size} className={className} />;
  if (kind === 'body') return <Dumbbell size={size} className={className} />;
  if (kind === 'relationships') return <UserRound size={size} className={className} />;
  if (kind === 'creativity') return <Sparkles size={size} className={className} />;
  if (kind === 'home') return <HomeIcon size={size} className={className} />;
  if (kind === 'unfinished') return <Inbox size={size} className={className} />;
  if (kind === 'waiting') return <Clock3 size={size} className={className} />;
  if (kind === 'someday') return <Target size={size} className={className} />;
  return <Lightbulb size={size} className={className} />;
}

export function GlowThresholdReference({ intelligence }: { intelligence?: HomeIntelligence }) {
  const personal = usePersonalContext();
  const data = personal.status === 'ready' ? personal.data : null;
  const [now, setNow] = useState<Date | null>(null);
  const [capture, setCapture] = useState('');
  const [systemTab, setSystemTab] = useState<SystemTab>('tasks');
  const [weather, setWeather] = useState<WeatherState>(null);
  const [weatherStatus, setWeatherStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const taskUpdate = useServerAction((payload: { id: string; data: { status: 'done' } }) =>
    updateTaskAction(payload.id, payload.data),
  );

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem('glow:weather-enabled') === 'yes') requestWeather();
  }, []);

  const clock = now ?? new Date(0);
  const mode = now ? modeFor(now) : 'day';
  const firstName = data?.user.name?.trim().split(/\s+/)[0] ?? '';
  const initials = data?.user.name
    ? data.user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
    : 'G';

  const todayEvents = useMemo(
    () => [...(data?.todayEvents ?? [])].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()),
    [data?.todayEvents],
  );

  const activeTasks = useMemo(
    () =>
      [...(data?.tasks ?? [])]
        .filter((task) => task.status !== 'done' && task.status !== 'cancelled' && !completedTaskIds.has(task.id))
        .sort((a, b) => taskScore(b, clock) - taskScore(a, clock)),
    [data?.tasks, clock, completedTaskIds],
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

  const eventMinutesLeft =
    currentEvent && now ? Math.max(0, Math.round((eventEnd(currentEvent).getTime() - now.getTime()) / 60_000)) : null;

  const engineAction = intelligence?.primary ?? null;
  const nowTitle = currentEvent?.title ?? engineAction?.title ?? data?.activeTask?.title ?? 'Open space';
  const nowHref = currentEvent
    ? '/today?room=meeting&event=' + encodeURIComponent(currentEvent.id)
    : engineAction?.href ?? (data?.activeTask ? '/tasks?task=' + encodeURIComponent(data.activeTask.id) : '/today?room=what-now');

  const recommendedAction = engineAction
    ? { title: engineAction.title, detail: engineAction.reason, href: engineAction.href }
    : activeTasks[0]
      ? { title: activeTasks[0].title, detail: dueLabel(activeTasks[0], clock), href: '/tasks?task=' + encodeURIComponent(activeTasks[0].id) }
      : nextEvent
        ? { title: 'Prepare for ' + nextEvent.title, detail: formatClock(new Date(nextEvent.startAt)), href: '/calendar?event=' + encodeURIComponent(nextEvent.id) }
        : { title: 'Protect the open space', detail: 'Nothing urgent is asking for intervention.', href: '/today' };

  const todayThree = activeTasks.slice(0, 6);
  const flow = now ? buildFlow(todayEvents, now) : [];
  const routineWindow = (data?.routines ?? [])
    .filter((routine) => {
      if (mode === 'morning') return routine.timeOfDay === 'morning' || routine.timeOfDay === 'anytime';
      if (mode === 'day') return routine.timeOfDay === 'afternoon' || routine.timeOfDay === 'anytime';
      if (mode === 'evening') return routine.timeOfDay === 'evening' || routine.timeOfDay === 'anytime';
      return routine.timeOfDay === 'night' || routine.timeOfDay === 'anytime';
    })
    .slice(0, 4);

  const activeGoals = (data?.goals ?? []).filter((goal) => goal.status !== 'complete').slice(0, 3);
  const futureUndated = activeTasks.filter((task) => !task.dueDate).length;
  const pendingTasks = activeTasks.filter((task) => task.status === 'pending').length;

  const attentionCount =
    (data?.sourceStatus.googleCalendar && data.sourceStatus.googleCalendar !== 'connected' ? 1 : 0) +
    (intelligence?.maintenance?.filter((item) => item.urgency === 'urgent').length ?? 0) +
    (intelligence?.systemHealth?.filter((item) => item.status !== 'stable').length ?? 0);

  const summary =
    todayEvents.length || activeTasks.length
      ? String(todayEvents.length) + ' calendar item' + (todayEvents.length === 1 ? '' : 's') + ' · ' +
        String(activeTasks.length) + ' open task' + (activeTasks.length === 1 ? '' : 's')
      : 'A calm start. Nothing urgent is crowding the day.';

  const systemItems = useMemo(() => {
    if (systemTab === 'tasks') {
      return activeTasks.slice(0, 5).map((task) => ({
        id: task.id,
        label: task.title,
        meta: dueLabel(task, clock),
        href: '/tasks?task=' + encodeURIComponent(task.id),
        task,
      }));
    }
    if (systemTab === 'habits') {
      return (data?.habits ?? []).slice(0, 5).map((habit) => ({
        id: habit.id,
        label: habit.name,
        meta: habit.frequency,
        href: '/habits',
        task: null,
      }));
    }
    if (systemTab === 'routines') {
      return (data?.routines ?? []).slice(0, 5).map((routine) => ({
        id: routine.id,
        label: routine.name,
        meta: routine.timeOfDay,
        href: '/routines?routine=' + encodeURIComponent(routine.id),
        task: null,
      }));
    }
    return [];
  }, [systemTab, activeTasks, clock, data?.habits, data?.routines]);

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

  function completeTask(task: PersonalTask) {
    if (taskUpdate.isPending) return;
    taskUpdate.run({ id: task.id, data: { status: 'done' } }, () => {
      setCompletedTaskIds((current) => {
        const next = new Set(current);
        next.add(task.id);
        return next;
      });
    });
  }

  const energyLabel = data?.wellness?.energy ?? 'Not checked in';
  const dayFlow = flow.length ? flow.slice(0, 7) : [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#ebe4db] text-[#302925] md:pl-[76px]">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.98),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(244,229,215,.88),transparent_34%),linear-gradient(135deg,#eee7de_0%,#e8dfd5_52%,#ddd6ce_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.28)_1px,transparent_1px)] [background-size:100%_18px]" />

      <main className="mx-auto w-full max-w-[1500px] px-2 py-3 sm:px-3 lg:px-4">
        <div className="rounded-[26px] border border-white/80 bg-[rgba(249,246,242,.53)] p-3 shadow-[0_28px_90px_rgba(74,55,45,.12),inset_0_1px_0_rgba(255,255,255,.95)] backdrop-blur-[26px] sm:p-4">
          <header className="mb-3 flex min-h-[54px] items-center justify-between gap-4 border-b border-white/70 px-1 pb-3">
            <div className="flex min-w-0 items-center gap-3">
              <Crown size={23} strokeWidth={1.2} className="shrink-0 text-[#9a816f]" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <h1 className="font-serif text-[24px] leading-none tracking-[-0.035em] text-[#27211e]">Princess Glow OS</h1>
                  <p className="hidden text-[8px] uppercase tracking-[0.24em] text-[#9b8b80] md:block">A more aligned you. A brighter tomorrow.</p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-[10px] font-medium text-[#413832]">{now ? formatDate(now) : 'Today'}</p>
                <p className="mt-0.5 text-[9px] italic text-[#8c7c72]">{modeLabel(mode)}</p>
              </div>
              <button type="button" onClick={() => travel('/search')} className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/45 text-[#514640]" aria-label="Search">
                <Search size={15} />
              </button>
              <button type="button" onClick={() => travel('/notifications')} className="relative grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/45 text-[#514640]" aria-label="Notifications">
                <Bell size={15} />
                {attentionCount ? <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#b07078]" /> : null}
              </button>
              <button type="button" onClick={() => travel('/settings')} className="flex items-center gap-2 rounded-full border border-white/70 bg-white/46 p-1.5 pr-3 text-left">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(145deg,#eadfd4,#c9bbb2)] text-[10px] font-semibold text-white">{initials}</span>
                <span className="hidden sm:block">
                  <span className="block text-[9px] font-medium text-[#4b403a]">Same you.</span>
                  <span className="block text-[8px] text-[#8f8076]">Bigger dreams. ♡</span>
                </span>
              </button>
            </div>
          </header>

          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_230px]">
            <div className="space-y-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_118px_118px_118px]">
                <Glass className="min-h-[150px] p-5">
                  <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'linear-gradient(90deg,rgba(255,252,248,.97) 0%,rgba(255,252,248,.84) 45%,rgba(255,252,248,.28) 100%),url(' + HERO_IMAGE + ')', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div className="relative z-10 max-w-[62%]">
                    <h2 className="font-serif text-[31px] leading-[1.02] tracking-[-0.04em] text-[#2d2723]">
                      {greetingFor(clock)}{firstName ? ', ' + firstName : ''} 🌷
                    </h2>
                    <p className="mt-1.5 text-[11px] text-[#796d65]">{summary}</p>
                    <p className="mt-4 font-serif text-[13px] italic leading-5 text-[#675a52]">“Progress, not perfection, creates a beautiful life.”</p>
                  </div>
                </Glass>

                <button type="button" onClick={requestWeather} className="rounded-[18px] border border-white/75 bg-white/58 p-3 text-center shadow-[0_8px_25px_rgba(70,50,40,.04)] backdrop-blur-xl">
                  <Sun size={25} strokeWidth={1.4} className="mx-auto text-[#d3a548]" />
                  <p className="mt-2 font-serif text-[23px] leading-none text-[#322a26]">{weather ? String(weather.temperature) + '°' : weatherStatus === 'loading' ? '…' : '—'}</p>
                  <p className="mt-1 text-[8px] leading-3 text-[#81736b]">{weather ? weatherText(weather.code) : weatherStatus === 'error' ? 'Unavailable' : 'Enable weather'}</p>
                </button>

                <button type="button" onClick={() => travel('/wellness')} className="rounded-[18px] border border-white/75 bg-white/58 p-3 text-center shadow-[0_8px_25px_rgba(70,50,40,.04)] backdrop-blur-xl">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border-[5px] border-[#dce9e2] bg-white/50">
                    <Zap size={17} className="text-[#668f80]" />
                  </div>
                  <p className="mt-1 font-serif text-[14px] text-[#342d29]">Energy</p>
                  <p className="mt-0.5 line-clamp-2 text-[8px] text-[#81736b]">{energyLabel}</p>
                </button>

                <button type="button" onClick={() => openGlow('Open Shakti with the exact context of my Home dashboard.')} className="rounded-[18px] border border-white/75 bg-white/58 p-3 text-center shadow-[0_8px_25px_rgba(70,50,40,.04)] backdrop-blur-xl">
                  <span className="mx-auto block h-12 w-12 rounded-full bg-[radial-gradient(circle_at_40%_32%,#fff_0%,#fff_18%,#eadff1_38%,#d9ecf1_54%,#f2e4e7_67%,transparent_73%)] shadow-[0_0_24px_rgba(194,185,224,.72)]" />
                  <p className="mt-1 font-serif text-[14px] text-[#342d29]">Shakti</p>
                  <p className="mt-0.5 text-[8px] text-[#81736b]">Present for you</p>
                </button>
              </div>

              <div className="grid gap-3 lg:grid-cols-[1.02fr_1.03fr_.95fr]">
                <Glass className="p-4">
                  <div className="flex items-center justify-between">
                    <MicroTitle>● &nbsp; Now</MicroTitle>
                    <span className="text-[9px] text-[#8b7d74]">{eventMinutesLeft !== null ? formatDuration(eventMinutesLeft) : intelligence?.availableMinutes ? formatDuration(intelligence.availableMinutes) : ''}</span>
                  </div>
                  <button type="button" onClick={() => travel(nowHref)} className="mt-3 block w-full text-left">
                    <p className="line-clamp-2 font-serif text-[20px] leading-tight text-[#342c28]">{nowTitle}</p>
                  </button>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {engineAction ? <span className="rounded-full border border-[#eadfd6] bg-white/55 px-2 py-1 text-[8px] text-[#7e6c61]">{engineAction.energyCost} energy</span> : null}
                    {engineAction?.estimatedMinutes ? <span className="rounded-full border border-[#eadfd6] bg-white/55 px-2 py-1 text-[8px] text-[#7e6c61]">~ {engineAction.estimatedMinutes} min</span> : null}
                    {currentEvent ? <span className="rounded-full border border-[#eadfd6] bg-white/55 px-2 py-1 text-[8px] text-[#7e6c61]">Scheduled</span> : null}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => travel(nowHref)} className="rounded-full bg-[#302a27] px-3 py-2 text-[9px] font-medium text-white">▶ Start focus</button>
                    <button type="button" onClick={() => travel(nextEvent ? '/calendar?event=' + encodeURIComponent(nextEvent.id) : recommendedAction.href)} className="rounded-full border border-white/80 bg-white/55 px-3 py-2 text-[9px] text-[#514640]">See next</button>
                  </div>
                </Glass>

                <Glass className="p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-[20px] leading-none text-[#332b27]">What now?</h3>
                    <span className="text-[8px] text-[#95867d]">{todayThree.length} open</span>
                    <button type="button" onClick={() => travel('/tasks')} className="ml-auto grid h-7 w-7 place-items-center rounded-full hover:bg-white/55" aria-label="Add or open tasks"><Plus size={14} /></button>
                  </div>
                  <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-[#e9e0d8]">
                    <div className="h-full bg-[#6f7b73]" style={{ width: todayThree.length ? Math.min(100, (completedTaskIds.size / Math.max(todayThree.length + completedTaskIds.size, 1)) * 100) + '%' : '0%' }} />
                  </div>
                  <div className="mt-2 space-y-1">
                    {todayThree.length ? todayThree.slice(0, 5).map((task) => (
                      <div key={task.id} className="group flex items-center gap-2 rounded-[8px] px-1 py-1 hover:bg-white/45">
                        <button type="button" onClick={() => completeTask(task)} disabled={taskUpdate.isPending} className="grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border border-[#9d938d] bg-white/50" aria-label={'Complete ' + task.title}>
                          <Check size={10} className="opacity-0 group-hover:opacity-35" />
                        </button>
                        <button type="button" onClick={() => travel('/tasks?task=' + encodeURIComponent(task.id))} className="min-w-0 flex-1 truncate text-left text-[10px] text-[#433a35]">{task.title}</button>
                        <span className="shrink-0 text-[8px] text-[#92857d]">{task.dueDate ? dueLabel(task, clock) : ''}</span>
                      </div>
                    )) : <p className="py-5 text-center text-[9px] italic text-[#91847c]">No open task is asking for attention.</p>}
                  </div>
                </Glass>

                <Glass className="p-4">
                  <h3 className="font-serif text-[20px] leading-none text-[#332b27]">Planning Studio</h3>
                  <p className="mt-1 text-[8px] italic text-[#91827a]">Explore. Adjust. Create your best day.</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[
                      ['This Month', '/calendar?view=month', 'month'],
                      ['Week Ahead', '/calendar?view=week', 'week'],
                      ['Tomorrow', '/tomorrow', 'tomorrow'],
                      ['Tasks & To-Dos', '/tasks', 'tasks'],
                    ].map(([label, href, kind]) => (
                      <button key={label} type="button" onClick={() => travel(href)} className="flex min-h-[48px] items-center gap-2 rounded-[12px] border border-white/75 bg-white/52 px-3 text-left text-[9px] text-[#4d433d] transition hover:bg-white/82">
                        <MiniIcon kind={kind} size={14} className="text-[#8d7769]" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </Glass>
              </div>

              <Glass className="p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-serif text-[19px] text-[#332b27]">Your Day in Flow</h3>
                    <span className="text-[8px] text-[#94867d]">5 AM – 11 PM</span>
                  </div>
                  <div className="flex rounded-full border border-white/75 bg-white/45 p-0.5 text-[8px]">
                    <button type="button" className="rounded-full bg-white px-2.5 py-1 text-[#4a403a]">Day</button>
                    <button type="button" onClick={() => travel('/calendar?view=week')} className="rounded-full px-2.5 py-1 text-[#8d7d74]">Week</button>
                    <button type="button" onClick={() => travel('/calendar?view=month')} className="rounded-full px-2.5 py-1 text-[#8d7d74]">Month</button>
                  </div>
                </div>
                <div className="flex items-stretch gap-1.5 overflow-x-auto pb-1">
                  <button type="button" onClick={() => travel('/calendar')} className="grid h-[54px] w-7 shrink-0 place-items-center rounded-full bg-white/48 text-[#8e7d73]"><ChevronLeft size={13} /></button>
                  {dayFlow.length ? dayFlow.map((item, index) => {
                    const isCurrent = now ? item.start <= now && item.end > now : false;
                    const backgrounds = ['#f8efd9', '#e4edf8', '#f7e8dd', '#e4f0e9', '#eee7f7', '#f6e3e7', '#e6ebf6'];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => travel(item.kind === 'event' && item.event ? '/calendar?event=' + encodeURIComponent(item.event.id) : '/today?room=what-now')}
                        className="relative min-w-[120px] flex-1 rounded-[10px] border border-white/70 px-3 py-2 text-left"
                        style={{ backgroundColor: backgrounds[index % backgrounds.length] }}
                      >
                        {isCurrent ? <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[7px] font-semibold uppercase tracking-[.12em] text-[#59749d]">Now</span> : null}
                        <p className="truncate text-[9px] font-medium text-[#403833]">{item.title}</p>
                        <p className="mt-1 text-[7px] text-[#81766f]">{formatClock(item.start)} · {formatDuration(Math.round((item.end.getTime() - item.start.getTime()) / 60_000))}</p>
                      </button>
                    );
                  }) : (
                    <button type="button" onClick={() => travel('/calendar')} className="min-w-[220px] flex-1 rounded-[10px] border border-dashed border-[#dacfc7] bg-white/32 px-3 py-2 text-left">
                      <p className="text-[9px] font-medium text-[#574c45]">Open day</p>
                      <p className="mt-1 text-[7px] text-[#91847c]">No timed calendar items are loaded.</p>
                    </button>
                  )}
                  <button type="button" onClick={() => travel('/calendar')} className="grid h-[54px] w-7 shrink-0 place-items-center rounded-full bg-white/48 text-[#8e7d73]"><ChevronRight size={13} /></button>
                </div>
              </Glass>

              <div className="grid gap-3 xl:grid-cols-[.96fr_.92fr_.83fr_1.15fr]">
                <Glass className="p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[16px] text-[#332b27]">Today Systems</h3>
                    <span className="text-[8px] text-[#8b7d74]">{systemItems.length}</span>
                  </div>
                  <div className="mt-2 flex gap-1 overflow-x-auto">
                    {(['tasks', 'reminders', 'habits', 'routines'] as SystemTab[]).map((tab) => (
                      <button key={tab} type="button" onClick={() => setSystemTab(tab)} className={systemTab === tab ? 'rounded-full bg-white px-2 py-1 text-[7px] capitalize text-[#4a403a] shadow-sm' : 'rounded-full px-2 py-1 text-[7px] capitalize text-[#908178]'}>
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 space-y-0.5">
                    {systemItems.length ? systemItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 py-1">
                        {item.task ? (
                          <button type="button" onClick={() => completeTask(item.task as PersonalTask)} className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[4px] border border-[#aaa09a]" aria-label={'Complete ' + item.label} />
                        ) : <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b9a79b]" />}
                        <button type="button" onClick={() => travel(item.href)} className="min-w-0 flex-1 truncate text-left text-[8.5px] text-[#4b413b]">{item.label}</button>
                        <span className="shrink-0 text-[7px] text-[#a09289]">{item.meta}</span>
                      </div>
                    )) : (
                      <button type="button" onClick={() => travel(systemTab === 'reminders' ? '/reminders' : '/' + systemTab)} className="w-full rounded-[10px] border border-dashed border-[#ddd2ca] bg-white/26 p-3 text-left text-[8px] italic text-[#91847c]">
                        {systemTab === 'reminders' ? 'No reminder data is loaded here. Open Reminders.' : 'Nothing is loaded in this view.'}
                      </button>
                    )}
                  </div>
                </Glass>

                <Glass className="p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[16px] text-[#332b27]">Important Inbox</h3>
                    {intelligence?.inboxCount ? <span className="rounded-full bg-[#f4e1e3] px-2 py-0.5 text-[7px] text-[#9d626b]">{intelligence.inboxCount} new</span> : null}
                  </div>
                  <div className="mt-2 space-y-2">
                    {intelligence?.inboxCount ? (
                      <button type="button" onClick={() => travel('/inbox')} className="flex w-full items-center gap-2 rounded-[10px] bg-white/42 p-2 text-left">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#eee4df]"><Inbox size={12} className="text-[#8a7468]" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[8.5px] font-medium text-[#4a403a]">Glow Inbox</span>
                          <span className="block text-[7px] text-[#978980]">{intelligence.inboxCount} item{intelligence.inboxCount === 1 ? '' : 's'} waiting</span>
                        </span>
                        <ChevronRight size={11} className="text-[#ad9d93]" />
                      </button>
                    ) : (
                      <p className="rounded-[10px] border border-dashed border-[#ddd3cb] bg-white/26 p-3 text-[8px] italic leading-4 text-[#91847c]">Nothing is waiting in your Glow inbox.</p>
                    )}
                    {attentionCount ? (
                      <button type="button" onClick={() => travel('/notifications')} className="flex w-full items-center justify-between rounded-[10px] bg-[#f5ede6]/70 px-2.5 py-2 text-[8px] text-[#755f53]">
                        <span>{attentionCount} system signal{attentionCount === 1 ? '' : 's'} in Attention</span>
                        <ArrowRight size={10} />
                      </button>
                    ) : null}
                  </div>
                </Glass>

                <Glass className="p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[16px] text-[#332b27]">People to Contact</h3>
                    <UserRound size={13} className="text-[#9d887b]" />
                  </div>
                  <div className="mt-3">
                    <p className="rounded-[10px] border border-dashed border-[#ddd3cb] bg-white/26 p-3 text-center text-[8px] italic leading-4 text-[#91847c]">No contact follow-up source is connected to Home yet.</p>
                    <button type="button" onClick={() => openGlow('Who do I need to follow up with based only on information Glow actually has?')} className="mt-2 w-full rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-[8px] text-[#75665d]">Ask Shakti</button>
                  </div>
                </Glass>

                <Glass className="p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[16px] text-[#332b27]">Routine Hub</h3>
                    <button type="button" onClick={() => travel('/routines')} className="text-[7px] text-[#7e6e65]">See all →</button>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {routineWindow.length ? routineWindow.map((routine, index) => (
                      <button key={routine.id} type="button" onClick={() => travel('/routines?routine=' + encodeURIComponent(routine.id))} className="min-w-0 text-left">
                        <div className="relative h-[55px] overflow-hidden rounded-[9px] border border-white/75 bg-[#eee6df] bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.16),rgba(246,240,235,.34)),url(' + ROUTINE_IMAGES[index % ROUTINE_IMAGES.length] + ')' }}>
                          <MoreHorizontal size={12} className="absolute right-1 top-1 rounded-full bg-white/65 p-0.5 text-[#64574f]" />
                        </div>
                        <p className="mt-1 truncate text-[7.5px] font-medium text-[#514640]">{routine.name}</p>
                        <p className="truncate text-[6.5px] text-[#9c8d84]">{routine.timeOfDay}</p>
                      </button>
                    )) : (
                      <button type="button" onClick={() => travel('/routines')} className="col-span-4 rounded-[10px] border border-dashed border-[#ddd3cb] bg-white/26 p-3 text-[8px] italic text-[#91847c]">No routine fits this current daypart.</button>
                    )}
                  </div>
                </Glass>
              </div>

              <div className="grid gap-3 xl:grid-cols-[1.08fr_1.03fr_1.15fr_.9fr]">
                <Glass className="p-3.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-[16px] text-[#332b27]">Brain Web</h3>
                    <span className="text-[7px] text-[#998b82]">Ideas. Notes. Everything connects.</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5 text-[7px]">
                    {[
                      ['Goals', '/goals', String(data?.goals.length ?? 0)],
                      ['Projects', '/projects', '→'],
                      ['Ideas', '/brain', String(data?.notes.length ?? 0)],
                      ['Memory', '/brain', String(data?.notes.filter((note) => note.pinned).length ?? 0)],
                      ['You', '/brain', '●'],
                      ['Learning', '/brain', '→'],
                    ].map(([label, href, value]) => (
                      <button key={label} type="button" onClick={() => travel(href)} className={label === 'You' ? 'rounded-full bg-[radial-gradient(circle,#fff,#e8def2_58%,#dce9ed)] px-2 py-2 text-[#554b61] shadow-[0_0_16px_rgba(197,188,224,.45)]' : 'rounded-full border border-white/75 bg-white/46 px-2 py-2 text-[#6e625a]'}>
                        {label} <span className="ml-0.5 text-[#9f8f85]">{value}</span>
                      </button>
                    ))}
                  </div>
                </Glass>

                <Glass className="p-3.5">
                  <h3 className="font-serif text-[16px] text-[#332b27]">Moving Forward</h3>
                  <div className="mt-2 space-y-1.5">
                    {activeGoals.length ? activeGoals.map((goal) => (
                      <button key={goal.id} type="button" onClick={() => travel('/goals?goal=' + encodeURIComponent(goal.id))} className="flex w-full items-center gap-2 rounded-[9px] bg-white/38 px-2 py-2 text-left">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[8px] bg-[#ebe7f5] text-[#8270a2]"><Target size={11} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[8px] font-medium text-[#4a403a]">{goal.title}</span>
                          <span className="block text-[6.5px] text-[#998b82]">{Math.round(goal.progress)}% · {goal.category}</span>
                        </span>
                        <ChevronRight size={10} className="text-[#b3a49a]" />
                      </button>
                    )) : <p className="rounded-[9px] border border-dashed border-[#ddd3cb] p-3 text-[8px] italic text-[#91847c]">No active goals are loaded.</p>}
                  </div>
                </Glass>

                <Glass className="p-3.5">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-serif text-[16px] text-[#332b27]">Life Pulse</h3>
                    <span className="text-[7px] text-[#998b82]">All parts of you, in balance.</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    {[
                      ['Mind', data?.wellness?.mood ?? 'No signal', 'mind'],
                      ['Finances', 'No signal', 'finance'],
                      ['Body', data?.wellness?.energy ?? 'No signal', 'body'],
                      ['Relationships', 'No signal', 'relationships'],
                      ['Creativity', activeGoals.some((goal) => /creative|design|content|brand/i.test(goal.category + ' ' + goal.title)) ? 'In motion' : 'No signal', 'creativity'],
                      ['Home', 'No signal', 'home'],
                    ].map(([label, value, kind]) => (
                      <button key={label} type="button" onClick={() => travel(label === 'Finances' ? '/finance' : label === 'Body' ? '/wellness' : label === 'Home' ? '/life' : '/brain')} className="flex items-center gap-2 rounded-[9px] bg-white/38 px-2 py-2 text-left">
                        <MiniIcon kind={kind} size={11} className="text-[#6f9488]" />
                        <span>
                          <span className="block text-[7.5px] font-medium text-[#4a403a]">{label}</span>
                          <span className="block max-w-[75px] truncate text-[6.5px] text-[#998b82]">{value}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </Glass>

                <Glass className="p-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-[16px] text-[#332b27]">Catch Up</h3>
                    <MoreHorizontal size={13} className="text-[#9d8d83]" />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {[
                      ['Unfinished', String(activeTasks.length), 'unfinished'],
                      ['Waiting', String(pendingTasks), 'waiting'],
                      ['Someday', String(futureUndated), 'someday'],
                      ['Ideas', String(data?.notes.length ?? 0), 'ideas'],
                    ].map(([label, value, kind]) => (
                      <button key={label} type="button" onClick={() => travel(label === 'Ideas' ? '/brain' : '/tasks')} className="rounded-[9px] border border-white/70 bg-white/42 px-1 py-2 text-center">
                        <MiniIcon kind={kind} size={12} className="mx-auto text-[#9b8476]" />
                        <p className="mt-1 text-[6.5px] text-[#7e7067]">{label}</p>
                        <p className="mt-0.5 font-serif text-[18px] leading-none text-[#3a312c]">{value}</p>
                      </button>
                    ))}
                  </div>
                </Glass>
              </div>

              <div className="grid gap-2 sm:grid-cols-[1fr_1.1fr_auto_auto_auto]">
                <button type="button" onClick={() => travel('/search')} className="flex min-h-10 items-center gap-2 rounded-full border border-white/75 bg-white/50 px-4 text-left text-[9px] text-[#8c7e75]"><Search size={13} /> Search your life…</button>
                <form action={universalIntakeAction} className="flex min-h-10 items-center gap-2 rounded-full border border-white/75 bg-white/50 px-3">
                  <input type="hidden" name="sourceRoute" value="/home" />
                  <Plus size={13} className="shrink-0 text-[#8c7e75]" />
                  <input name="text" value={capture} onChange={(event) => setCapture(event.target.value)} placeholder="Capture anything…" className="min-w-0 flex-1 bg-transparent text-[9px] text-[#4c423c] outline-none placeholder:text-[#9c8e85]" />
                  <button type="button" onClick={openVoice} className="grid h-7 w-7 place-items-center rounded-full text-[#85766d]" aria-label="Use voice"><Mic2 size={12} /></button>
                  <button type="submit" className="rounded-full bg-[#efe6df] px-2.5 py-1.5 text-[8px] text-[#695a51]">Save</button>
                </form>
                <button type="button" onClick={() => travel('/notifications')} className="flex min-h-10 items-center gap-2 rounded-full border border-white/75 bg-white/50 px-4 text-[9px] text-[#685b53]">
                  <span className={attentionCount ? 'h-2 w-2 rounded-full bg-[#bd7a72]' : 'h-2 w-2 rounded-full bg-[#63a779]'} />
                  {attentionCount ? String(attentionCount) + ' need attention' : 'Reality stable'}
                </button>
                <button type="button" onClick={() => window.history.back()} className="flex min-h-10 items-center gap-2 rounded-full border border-white/75 bg-white/50 px-4 text-[9px] text-[#685b53]"><Undo2 size={12} /> Undo</button>
                <button type="button" onClick={() => travel('/settings')} className="flex min-h-10 items-center gap-2 rounded-full border border-white/75 bg-white/50 px-4 text-[9px] text-[#685b53]"><Settings size={12} /> Settings</button>
              </div>
            </div>

            <aside className="space-y-3">
              <Glass className="p-3.5">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#a28d7f]" />
                  <div>
                    <h3 className="font-serif text-[17px] text-[#332b27]">Vision & You</h3>
                    <p className="text-[7px] italic text-[#94867d]">Same you. Brighter possibilities.</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[12px] border border-white/70 bg-white/38 p-2.5">
                  <MicroTitle>Current You → Proposed You</MicroTitle>
                  <div className="mt-2 space-y-1.5">
                    {[
                      [currentEvent?.title ?? nowTitle, recommendedAction.title],
                      [nextEvent ? nextEvent.title : 'Open time', activeTasks[1]?.title ?? 'No second proposal'],
                      [routineWindow[0]?.name ?? 'No routine active', activeTasks[2]?.title ?? 'No third proposal'],
                    ].map(([current, proposed], index) => (
                      <div key={String(current) + String(index)} className="grid grid-cols-2 gap-1.5">
                        <div className="rounded-[8px] bg-[#f2ece7] px-2 py-1.5 text-[7px] text-[#62554d]">{current}</div>
                        <div className="rounded-[8px] bg-[#eee9f4] px-2 py-1.5 text-[7px] text-[#62554d]">{proposed}</div>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => openGlow('Show proposed changes for today using only my real current Glow state. Do not apply anything until I confirm.')} className="mt-2.5 w-full rounded-full bg-[#c6b3a4] px-3 py-2 text-[8px] font-medium text-white">Explore proposed changes →</button>
                </div>
              </Glass>

              <Glass className="p-3.5">
                <div className="flex items-center gap-2">
                  <Target size={13} className="text-[#9b877a]" />
                  <div>
                    <h3 className="font-serif text-[17px] text-[#332b27]">Life Areas</h3>
                    <p className="text-[7px] italic text-[#94867d]">All parts of your life, in rhythm.</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    ['Routine World', '/routines', LIFE_IMAGES[0], String(data?.routines.length ?? 0) + ' routines'],
                    ['Personal House', '/life', LIFE_IMAGES[1], 'Life systems'],
                  ].map(([label, href, image, meta]) => (
                    <button key={String(label)} type="button" onClick={() => travel(String(href))} className="grid w-full grid-cols-[58px_1fr_auto] items-center gap-2 overflow-hidden rounded-[11px] border border-white/70 bg-white/42 text-left">
                      <span className="h-[58px] bg-cover bg-center" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.12),rgba(255,255,255,.22)),url(' + image + ')' }} />
                      <span className="min-w-0">
                        <span className="block font-serif text-[12px] text-[#463c36]">{label}</span>
                        <span className="block text-[6.5px] text-[#988a81]">{meta}</span>
                      </span>
                      <ChevronRight size={11} className="mr-2 text-[#aa9b92]" />
                    </button>
                  ))}
                </div>
              </Glass>

              <button type="button" onClick={() => openGlow('Open Shakti with the exact context of what I am viewing on Home right now.')} className="w-full rounded-[18px] border border-white/75 bg-[rgba(255,253,250,.67)] p-3.5 text-left shadow-[0_10px_28px_rgba(68,52,44,.055)] backdrop-blur-[18px]">
                <div className="flex items-center gap-3">
                  <span className="h-11 w-11 shrink-0 rounded-full bg-[radial-gradient(circle_at_40%_32%,#fff_0%,#fff_18%,#eadff1_38%,#d9ecf1_54%,#f2e4e7_67%,transparent_73%)] shadow-[0_0_22px_rgba(194,185,224,.7)]" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-[15px] text-[#342d29]">Shakti Support</span>
                    <span className="block text-[7px] italic text-[#94867d]">Deeper support. More you.</span>
                  </span>
                  <ChevronRight size={12} className="text-[#9c8c82]" />
                </div>
              </button>

              <Glass className="p-4 text-center">
                <p className="font-serif text-[13px] italic leading-5 text-[#6e6057]">“A balanced life is a beautiful life. ♡”</p>
              </Glass>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
