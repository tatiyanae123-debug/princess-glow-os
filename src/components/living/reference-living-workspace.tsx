'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Dumbbell,
  Heart,
  Home,
  Inbox,
  Lightbulb,
  ListChecks,
  Mail,
  Search,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type {
  PersonalContextData,
  PersonalEvent,
  PersonalGoal,
  PersonalHabit,
  PersonalNote,
  PersonalRoutine,
  PersonalTask,
} from '@/lib/personal-context/types';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { updateTaskAction } from '@/app/actions/tasks';

export type LivingWorkspaceId =
  | 'what-now'
  | 'planning-studio'
  | 'day-flow'
  | 'today-systems'
  | 'important-inbox'
  | 'people-to-contact'
  | 'brain-web'
  | 'moving-forward'
  | 'life-pulse'
  | 'catch-up'
  | 'personal-house'
  | 'midday-reset'
  | 'vision-you';

type GlowContact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  organization: string | null;
};

const ART = {
  bath: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=82',
  room: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=82',
  table: 'https://images.unsplash.com/photo-1615874694520-474822394e73?auto=format&fit=crop&w=1400&q=82',
  calm: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=82',
  desk: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1400&q=82',
  flowers: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1400&q=82',
};

const meta: Record<LivingWorkspaceId, { title: string; subtitle: string }> = {
  'what-now': { title: 'What now?', subtitle: 'Based on your time, energy and priorities.' },
  'planning-studio': { title: 'Planning Studio', subtitle: 'Explore. Adjust. Create your best day.' },
  'day-flow': { title: 'Your Day in Flow', subtitle: 'A balanced day. A brighter you.' },
  'today-systems': { title: 'Today Systems', subtitle: 'All the pieces. One flow.' },
  'important-inbox': { title: 'Important Inbox', subtitle: 'What matters, in order.' },
  'people-to-contact': { title: 'People to Contact', subtitle: 'Nurture your relationships.' },
  'brain-web': { title: 'Brain Web', subtitle: 'Ideas. People. Projects. Everything connects.' },
  'moving-forward': { title: 'Moving Forward', subtitle: 'Progress today. A bigger tomorrow.' },
  'life-pulse': { title: 'Life Pulse', subtitle: 'All parts of you, in balance.' },
  'catch-up': { title: 'Catch Up', subtitle: 'Clear the noise. Move forward.' },
  'personal-house': { title: 'Personal House', subtitle: 'A home that supports your glow.' },
  'midday-reset': { title: 'Prepare for Midday Reset', subtitle: 'Reset. Recenter. Keep going.' },
  'vision-you': { title: 'Vision & You', subtitle: 'Same you. Brighter possibilities.' },
};

function formatTime(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDate(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function priorityRank(priority: PersonalTask['priority']) {
  return { urgent: 4, high: 3, medium: 2, low: 1 }[priority];
}

function useSessionChoice<T extends string>(key: string, initial: T, allowed: readonly T[]) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const saved = window.sessionStorage.getItem(key);
    if (saved && (allowed as readonly string[]).includes(saved)) setValue(saved as T);
  }, [key, allowed]);

  useEffect(() => {
    window.sessionStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}

function estimateMinutes(task: PersonalTask) {
  const text = (task.title + ' ' + (task.description ?? '')).toLowerCase();
  const explicit = text.match(/(\d{1,3})\s*(?:min|mins|minutes)/);
  if (explicit) return Math.max(5, Math.min(180, Number(explicit[1])));
  if (/email|call|reply|book|order|schedule|confirm/.test(text)) return 10;
  if (/clean|reset|workout|study|write|design|research|plan/.test(text)) return 30;
  return 20;
}

function Shell({
  workspace,
  children,
  userName,
}: {
  workspace: LivingWorkspaceId;
  children: React.ReactNode;
  userName?: string | null;
}) {
  const router = useRouter();
  const current = meta[workspace];
  const firstName = userName?.trim().split(/\s+/)[0] || '';

  function backHome() {
    router.push('/home');
  }

  return (
    <div data-living-workspace={workspace} className="min-h-screen overflow-x-hidden bg-[#ebe5de] text-[#322a26]">
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_18%_4%,rgba(255,255,255,.98),transparent_35%),linear-gradient(135deg,#eee7df,#e9e1d8_58%,#ded7cf)]" />
      <div className="mx-auto min-h-screen w-full max-w-[1360px] px-2 py-2 sm:px-3 md:px-4">
        <div className="relative overflow-hidden rounded-[25px] border border-white/90 bg-[rgba(252,250,247,.64)] shadow-[0_24px_75px_rgba(74,58,49,.10),inset_0_1px_0_rgba(255,255,255,.98)] backdrop-blur-[28px]">
          <div className="grid min-h-[780px] md:grid-cols-[44px_minmax(0,1fr)]">
            <nav className="hidden border-r border-white/70 bg-white/24 py-3 md:flex md:flex-col md:items-center">
              <button onClick={backHome} className="mb-2 grid h-7 w-7 place-items-center rounded-full bg-white/72 text-[#8c776b] shadow-sm" aria-label="Dashboard"><Home size={12} /></button>
              <div className="flex flex-col gap-1.5">
                <Link href="/living/day-flow" className="grid h-7 w-7 place-items-center rounded-full text-[#9a8b82] hover:bg-white/55" aria-label="Day flow"><CalendarDays size={11} /></Link>
                <Link href="/living/today-systems" className="grid h-7 w-7 place-items-center rounded-full text-[#9a8b82] hover:bg-white/55" aria-label="Today systems"><ListChecks size={11} /></Link>
                <Link href="/living/important-inbox" className="grid h-7 w-7 place-items-center rounded-full text-[#9a8b82] hover:bg-white/55" aria-label="Important inbox"><Inbox size={11} /></Link>
                <Link href="/living/people-to-contact" className="grid h-7 w-7 place-items-center rounded-full text-[#9a8b82] hover:bg-white/55" aria-label="People"><UserRound size={11} /></Link>
                <Link href="/living/brain-web" className="grid h-7 w-7 place-items-center rounded-full text-[#9a8b82] hover:bg-white/55" aria-label="Brain web"><Lightbulb size={11} /></Link>
              </div>
              <div className="mt-auto flex flex-col gap-1.5">
                <Link href="/search" className="grid h-7 w-7 place-items-center rounded-full text-[#9a8b82] hover:bg-white/55" aria-label="Search"><Search size={11} /></Link>
                <Link href="/settings" className="grid h-7 w-7 place-items-center rounded-full text-[#9a8b82] hover:bg-white/55" aria-label="Settings"><span className="text-[12px]">⚙</span></Link>
                <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:open', { detail: { context: { room: current.title } } }))} className="grid h-7 w-7 place-items-center rounded-full bg-[radial-gradient(circle,#fff,#eee6f6_58%,#dbecef)] text-[#8d7ea2] shadow-[0_0_14px_rgba(194,185,224,.45)]" aria-label="Ask Shakti"><Sparkles size={11} /></button>
              </div>
            </nav>

            <main className="min-w-0 p-3 sm:p-4 md:p-5">
              <header className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <button type="button" onClick={backHome} className="mb-2 inline-flex items-center gap-1 text-[8px] text-[#8f8178] hover:text-[#5f5149]">
                    <ArrowLeft size={10} /> Dashboard / {current.title}
                  </button>
                  <h1 className="font-serif text-[29px] leading-none text-[#302824] sm:text-[34px]">{current.title}</h1>
                  <p className="mt-1.5 text-[9px] italic text-[#92847a]">{current.subtitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button type="button" onClick={() => window.history.back()} className="grid h-7 w-7 place-items-center rounded-full border border-white/75 bg-white/46 text-[10px] text-[#8e8178]" aria-label="Back">↩</button>
                  <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:open', { detail: { context: { room: current.title } } }))} className="grid h-7 w-7 place-items-center rounded-full border border-white/75 bg-white/46 text-[#8c7ca1]" aria-label="Ask Shakti"><Sparkles size={10} /></button>
                  <Link href="/settings" className="grid h-7 w-7 place-items-center rounded-full border border-white/75 bg-white/46 text-[11px] text-[#8e8178]" aria-label="Settings">⋮</Link>
                  <div className="ml-1 hidden text-right sm:block">
                    <p className="text-[8px] font-medium text-[#61534c]">{firstName || 'Glow OS'}</p>
                    <p className="text-[7px] text-[#a09289]">Living system</p>
                  </div>
                </div>
              </header>

              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={'rounded-[18px] border border-white/78 bg-[rgba(255,253,250,.67)] shadow-[0_9px_26px_rgba(68,52,44,.05),inset_0_1px_0_rgba(255,255,255,.94)] backdrop-blur-[20px] ' + className}>{children}</section>;
}

function EmptyRows({ count = 4, label = 'Open slot' }: { count?: number; label?: string }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex items-center gap-2 rounded-[9px] bg-white/36 px-2 py-2">
          <span className="h-3.5 w-3.5 rounded-[4px] border border-[#cdbfb7] bg-white/45" />
          <span className="text-[8px] italic text-[#9c9088]">{index === 0 ? label : 'Open slot'}</span>
        </div>
      ))}
    </div>
  );
}

function TaskRows({
  tasks,
  onToggle,
  limit = 6,
}: {
  tasks: PersonalTask[];
  onToggle: (task: PersonalTask) => void;
  limit?: number;
}) {
  if (!tasks.length) return <EmptyRows count={Math.min(limit, 5)} label="Nothing needs attention here" />;
  return (
    <div className="space-y-1">
      {tasks.slice(0, limit).map((task) => (
        <button key={task.id} type="button" onClick={() => onToggle(task)} className="flex w-full items-center gap-2 rounded-[9px] bg-white/42 px-2.5 py-2 text-left hover:bg-white/70">
          <span className={'grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border ' + (task.status === 'done' ? 'border-[#6f9b8b] bg-[#6f9b8b] text-white' : 'border-[#c8bbb3] bg-white/55')}>
            {task.status === 'done' ? <Check size={10} /> : null}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[8.5px] font-medium text-[#4b4039]">{task.title}</span>
            <span className="block text-[7px] text-[#9a8c83]">{task.dueDate ? formatDate(task.dueDate) : task.priority}</span>
          </span>
          <ChevronRight size={11} className="text-[#b0a39a]" />
        </button>
      ))}
    </div>
  );
}

function ImagePanel({ src, children, className = '' }: { src: string; children?: React.ReactNode; className?: string }) {
  return (
    <div className={'relative overflow-hidden rounded-[16px] border border-white/75 bg-cover bg-center ' + className} style={{ backgroundImage: 'linear-gradient(90deg,rgba(255,252,248,.92),rgba(255,252,248,.25)),url(' + src + ')' }}>
      {children}
    </div>
  );
}

function useContacts(enabled: boolean) {
  const [contacts, setContacts] = useState<GlowContact[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unavailable'>('idle');

  useEffect(() => {
    if (!enabled) return;
    let live = true;
    setStatus('loading');
    fetch('/api/contacts', { cache: 'no-store' })
      .then(async (response) => {
        const payload = (await response.json()) as { ok?: boolean; contacts?: GlowContact[] };
        if (!live) return;
        if (response.ok && payload.ok) {
          setContacts(payload.contacts ?? []);
          setStatus('ready');
        } else {
          setStatus('unavailable');
        }
      })
      .catch(() => {
        if (live) setStatus('unavailable');
      });
    return () => {
      live = false;
    };
  }, [enabled]);

  return { contacts, status };
}

function WhatNow({
  data,
  startTask,
}: {
  data: PersonalContextData;
  startTask: (task: PersonalTask) => void;
}) {
  const open = data.tasks
    .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
    .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority));
  const focus = data.activeTask ?? open[0] ?? null;
  const alternates = open.filter((task) => task.id !== focus?.id).slice(0, 4);

  return (
    <div className="space-y-4">
      <Glass className="p-4">
        <p className="text-[8px] uppercase tracking-[.18em] text-[#8f7669]">Your next best move</p>
        <div className="mt-3 grid gap-3 md:grid-cols-[.72fr_1.28fr]">
          <div className="rounded-[15px] border border-white/75 bg-white/52 p-4">
            <h2 className="font-serif text-[25px] leading-tight text-[#342b27]">{focus?.title ?? 'Your priority list is clear'}</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {focus ? <><span className="rounded-full bg-[#f2e8de] px-2 py-1 text-[7px] text-[#80695e]">~{estimateMinutes(focus)} min</span><span className="rounded-full bg-[#e6eee9] px-2 py-1 text-[7px] text-[#65796f]">{focus.priority} priority</span></> : null}
            </div>
            <button type="button" onClick={() => focus ? startTask(focus) : window.location.assign('/tasks')} className="mt-4 rounded-full bg-[#302a27] px-5 py-2.5 text-[8px] font-medium text-white">{focus ? (focus.status === 'in_progress' ? 'Continue' : 'Start now') : 'Open tasks'}</button>
            <div className="mt-4 space-y-1 text-[7px] text-[#8d8077]">
              <p>✓ Uses your real current task state</p>
              <p>✓ Keeps object identity intact</p>
              <p>✓ Updates persist through Glow</p>
            </div>
          </div>
          <ImagePanel src={ART.desk} className="min-h-[270px] p-5">
            <div className="absolute bottom-4 right-4 rounded-full border border-white/70 bg-white/50 px-3 py-1.5 text-[7px] text-[#6f6159]">Focused workspace</div>
          </ImagePanel>
        </div>
      </Glass>

      <div>
        <p className="mb-2 text-[8px] uppercase tracking-[.18em] text-[#8f7669]">Other options</p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {alternates.length ? alternates.map((task,index) => (
            <Link key={task.id} href={'/tasks?task=' + encodeURIComponent(task.id)} className="rounded-[14px] border border-white/78 bg-[rgba(255,253,250,.66)] p-3 shadow-[0_8px_22px_rgba(68,52,44,.045)] backdrop-blur">
              <div className="mb-3 grid h-7 w-7 place-items-center rounded-[9px]" style={{ backgroundColor: ['#efe7dd','#e5efec','#e7eaf5','#f0e5ea'][index % 4] }}><ArrowRight size={11} className="text-[#88786f]" /></div>
              <p className="line-clamp-2 text-[8px] font-medium text-[#51453f]">{task.title}</p>
              <p className="mt-2 text-[7px] text-[#9a8c83]">~{estimateMinutes(task)} min · {task.priority}</p>
            </Link>
          )) : Array.from({ length: 4 }, (_, index) => <div key={index} className="rounded-[14px] border border-dashed border-[#ddd1c9] bg-white/26 p-3 text-[8px] italic text-[#9b8d84]">Open option</div>)}
        </div>
      </div>
    </div>
  );
}

function PlanningStudio({ data }: { data: PersonalContextData }) {
  const planningScopes = ['Today', 'This Week', 'This Month', 'Custom'] as const;
  const [scope, setScope] = useSessionChoice('glow:living:planning-scope', 'Today', planningScopes);
  const now = new Date();
  const startToday = new Date(now); startToday.setHours(0,0,0,0);
  const endToday = new Date(startToday); endToday.setDate(endToday.getDate() + 1);
  const endWeek = new Date(startToday); endWeek.setDate(endWeek.getDate() + 7);
  const endMonth = new Date(startToday.getFullYear(), startToday.getMonth() + 1, 1);
  const scopedEvents = data.events.filter((event) => {
    const start = new Date(event.startAt);
    if (scope === 'Today') return start >= startToday && start < endToday;
    if (scope === 'This Week') return start >= startToday && start < endWeek;
    if (scope === 'This Month') return start >= startToday && start < endMonth;
    return start >= startToday;
  });
  const scopedTasks = data.tasks.filter((task) => {
    if (task.status === 'done' || task.status === 'cancelled') return false;
    if (!task.dueDate) return scope === 'Custom';
    const due = new Date(task.dueDate);
    if (scope === 'Today') return due >= startToday && due < endToday;
    if (scope === 'This Week') return due >= startToday && due < endWeek;
    if (scope === 'This Month') return due >= startToday && due < endMonth;
    return due >= startToday;
  });
  const items = [...scopedEvents.map((event) => ({ id: event.id, title: event.title, time: formatTime(event.startAt), type: 'event' as const, startsAt: event.startAt })), ...scopedTasks.map((task) => ({ id: task.id, title: task.title, time: task.dueDate ? formatTime(task.dueDate) : '', type: 'task' as const, startsAt: task.dueDate ?? '' }))].sort((a,b)=>new Date(a.startsAt || 0).getTime()-new Date(b.startsAt || 0).getTime()).slice(0, 8);
  const goals = data.goals.filter((goal) => goal.status !== 'done').slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{planningScopes.map((item) => <button key={item} type="button" onClick={() => setScope(item)} className={'rounded-full px-3 py-1.5 text-[8px] ' + (scope === item ? 'bg-[#e9ded6] text-[#59483f]' : 'bg-white/45 text-[#8f8177]')}>{item}</button>)}</div>
      <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <Glass className="p-4">
          <p className="mb-3 text-[8px] uppercase tracking-[.16em] text-[#8d786c]">{scope}</p>
          <div className="grid grid-cols-[45px_1fr] gap-2">
            <div className="space-y-4 pt-1 text-[7px] tabular-nums text-[#a09289]">{['6 AM','9 AM','12 PM','3 PM','6 PM','9 PM'].map((time) => <p key={time}>{time}</p>)}</div>
            <div className="space-y-2">
              {items.length ? items.map((item, index) => <Link key={item.type + item.id} href={item.type === 'event' ? '/calendar?event=' + encodeURIComponent(item.id) : '/tasks?task=' + encodeURIComponent(item.id)} className="block rounded-[10px] border border-white/75 px-3 py-2" style={{ backgroundColor: ['#e8eef7','#f5e9e0','#e7f1ea','#eee7f6'][index % 4] }}><span className="text-[8px] font-medium text-[#514740]">{item.title}</span><span className="float-right text-[7px] text-[#9a8d84]">{item.time}</span></Link>) : <EmptyRows count={6} label="No scheduled objects loaded" />}
            </div>
          </div>
        </Glass>
        <div className="space-y-4">
          <Glass className="p-4">
            <p className="text-[8px] uppercase tracking-[.16em] text-[#8d786c]">Focus for this week</p>
            <div className="mt-3 space-y-2">{goals.length ? goals.map((goal) => <Link key={goal.id} href={'/goals?goal=' + encodeURIComponent(goal.id)} className="flex items-center gap-2 text-[8px] text-[#5a4e47]"><Circle size={10} className="text-[#a68f82]" />{goal.title}</Link>) : <p className="text-[8px] italic text-[#9c8f87]">No active goals loaded.</p>}</div>
          </Glass>
          <Glass className="p-4">
            <p className="text-[8px] uppercase tracking-[.16em] text-[#8d786c]">Open time</p>
            <p className="mt-2 font-serif text-[28px] text-[#3a312d]">{Math.max(0, 8 - data.todayEvents.length)} hrs</p>
            <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:open', { detail: { context: { room: 'Planning Studio', intent: 'Suggest a useful plan based only on my real Glow data' } } }))} className="mt-3 w-full rounded-full bg-[#d8c2b1] px-3 py-2 text-[8px] text-white">Find ideas</button>
          </Glass>
        </div>
      </div>
    </div>
  );
}

function DayFlow({ data }: { data: PersonalContextData }) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const [dateKey, setDateKey] = useState(todayKey);

  useEffect(() => {
    const saved = window.sessionStorage.getItem('glow:living:day-flow-date');
    if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) setDateKey(saved);
  }, []);

  useEffect(() => {
    window.sessionStorage.setItem('glow:living:day-flow-date', dateKey);
  }, [dateKey]);

  function shiftDay(amount: number) {
    const date = new Date(dateKey + 'T12:00:00');
    date.setDate(date.getDate() + amount);
    setDateKey(date.toISOString().slice(0, 10));
  }

  const selectedDate = new Date(dateKey + 'T12:00:00');
  const events = data.events
    .filter((event) => new Date(event.startAt).toISOString().slice(0, 10) === dateKey)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const selectedTasks = data.tasks.filter((task) => task.dueDate && new Date(task.dueDate).toISOString().slice(0,10) === dateKey);
  const scoreSignals = [
    dateKey === todayKey && Boolean(data.wellness?.energy),
    dateKey === todayKey && Boolean(data.wellness?.mood),
    events.length > 0,
    selectedTasks.some((task) => task.status === 'done'),
  ];
  const observed = scoreSignals.filter(Boolean).length;
  const coverage = observed ? Math.round((observed / scoreSignals.length) * 100) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
      <Glass className="p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => shiftDay(-1)} className="grid h-7 w-7 place-items-center rounded-full bg-white/48 text-[#8c7f76]" aria-label="Previous day">‹</button>
            <button type="button" onClick={() => setDateKey(todayKey)} className="rounded-full bg-white/55 px-3 py-1.5 text-[7px] text-[#6f625a]">Today</button>
            <button type="button" onClick={() => shiftDay(1)} className="grid h-7 w-7 place-items-center rounded-full bg-white/48 text-[#8c7f76]" aria-label="Next day">›</button>
          </div>
          <p className="text-[7px] text-[#94867d]">{selectedDate.toLocaleDateString([], { weekday:'short', month:'short', day:'numeric', year:'numeric' })}</p>
        </div>
        <div className="grid grid-cols-[44px_1fr] gap-3">
          <div className="space-y-9 pt-1 text-[7px] text-[#9d8f86]">{['6 AM','9 AM','12 PM','3 PM','6 PM','9 PM'].map((time) => <p key={time}>{time}</p>)}</div>
          <div className="space-y-2">{events.length ? events.map((event, index) => <Link href={'/calendar?event=' + encodeURIComponent(event.id)} key={event.id} className="block rounded-[11px] border border-white/78 px-3 py-2.5" style={{ backgroundColor: ['#f4e8d7','#e3ecf7','#f2e3dd','#e2efe8','#eee6f6','#e7edf8'][index % 6] }}><div className="flex items-center justify-between gap-3"><span className="text-[8.5px] font-medium text-[#4e433d]">{event.title}</span><span className="text-[7px] text-[#92857c]">{formatTime(event.startAt)}</span></div><p className="mt-1 text-[7px] text-[#94877f]">{event.location || 'Scheduled event'}</p></Link>) : ['Morning','Between','Evening','Night'].map((part, index) => <div key={part} className="rounded-[11px] border border-white/75 px-3 py-2.5" style={{ backgroundColor: ['#f5edd8','#e6edf7','#f3e5df','#e4efe9'][index] }}><p className="text-[8.5px] font-medium text-[#4e433d]">{part}</p><p className="mt-1 text-[7px] text-[#95877f]">Open time</p></div>)}</div>
        </div>
      </Glass>
      <div className="space-y-4">
        <Glass className="p-4">
          <p className="text-[8px] uppercase tracking-[.16em] text-[#8d786c]">Day insights</p>
          <div className="mt-3 grid h-20 w-20 place-items-center rounded-full bg-[conic-gradient(#6e9a89_0_var(--p),#e7eee9_var(--p)_100%)] p-[7px]" style={{ '--p': coverage + '%' } as React.CSSProperties}><div className="grid h-full w-full place-items-center rounded-full bg-white/85 font-serif text-[20px] text-[#587769]">{coverage ? coverage + '%' : '—'}</div></div>
          <div className="mt-4 space-y-2 text-[8px] text-[#5f534c]"><p>Events · {events.length}</p><p>Tasks due · {selectedTasks.length}</p><p>Completed · {selectedTasks.filter((task)=>task.status === 'done').length}</p><p>Open space · {Math.max(0, 8 - events.length)} hrs</p></div>
        </Glass>
        <ImagePanel src={ART.calm} className="min-h-[145px] p-4"><p className="absolute bottom-3 left-3 max-w-[65%] font-serif text-[11px] italic text-[#695c54]">{dateKey === todayKey && data.wellness?.notes ? data.wellness.notes : 'Your real day, arranged in one calm view.'}</p></ImagePanel>
      </div>
    </div>
  );
}

function TodaySystems({ data, toggleTask }: { data: PersonalContextData; toggleTask: (task: PersonalTask) => void }) {
  const openTasks = data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  return (
    <div className="grid gap-4 lg:grid-cols-[1.42fr_.58fr]">
      <Glass className="p-4">
        <div className="grid gap-4">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-[#7d6d64]">Tasks</p>
              <span className="text-[7px] text-[#9b8e85]">{openTasks.length} open</span>
            </div>
            <TaskRows tasks={openTasks} onToggle={toggleTask} limit={5} />
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-[#7d6d64]">Routines</p>
              <span className="text-[7px] text-[#9b8e85]">{data.routines.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {data.routines.length ? data.routines.slice(0, 4).map((routine) => (
                <Link key={routine.id} href={'/routines?routine=' + encodeURIComponent(routine.id)} className="flex items-center gap-2 rounded-[9px] bg-white/42 px-2.5 py-2 text-[8px] text-[#51463f]">
                  <span className="h-3.5 w-3.5 rounded-[4px] border border-[#c7b9b1] bg-white/55" />
                  <span className="truncate">{routine.name}</span>
                </Link>
              )) : <><div className="rounded-[9px] border border-dashed border-[#ddd1c9] p-2 text-[7px] italic text-[#9b8d84]">No routines loaded</div><div className="rounded-[9px] border border-dashed border-[#ddd1c9] p-2 text-[7px] italic text-[#9b8d84]">Open slot</div></>}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-[#7d6d64]">Habits</p>
              <span className="text-[7px] text-[#9b8e85]">{data.habits.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.habits.length ? data.habits.slice(0, 6).map((habit) => (
                <Link key={habit.id} href="/habits" className="rounded-[9px] bg-white/44 px-2.5 py-2 text-[7px] text-[#62564f]">{habit.name}</Link>
              )) : ['Open habit','Open habit','Open habit','Open habit'].map((label,index)=><span key={index} className="rounded-[9px] border border-dashed border-[#ddd1c9] px-2.5 py-2 text-[7px] italic text-[#9b8d84]">{label}</span>)}
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[8px] font-semibold uppercase tracking-[.16em] text-[#7d6d64]">Reminders</p>
              <span className="text-[7px] text-[#9b8e85]">source aware</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Link href="/reminders" className="rounded-[9px] bg-white/42 px-2.5 py-2 text-[7px] text-[#62564f]">Open Reminders</Link>
              <div className="rounded-[9px] border border-dashed border-[#ddd1c9] px-2.5 py-2 text-[7px] italic text-[#9b8d84]">No reminder details loaded here</div>
            </div>
          </section>
        </div>
      </Glass>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <ImagePanel src={ART.flowers} className="min-h-[260px]" />
        <ImagePanel src={ART.table} className="min-h-[210px]"><p className="absolute bottom-4 right-4 max-w-[72%] text-right font-serif text-[10px] italic text-[#6d5f56]">Your systems support the life you are building.</p></ImagePanel>
      </div>
    </div>
  );
}

function ImportantInbox({ data }: { data: PersonalContextData }) {
  const inboxTabs = ['All', 'Captures', 'Tasks', 'Connections'] as const;
  const [tab, setTab] = useSessionChoice('glow:living:important-inbox-tab', 'All', inboxTabs);
  const notes = [...data.notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const signals = [
    ...(data.sourceStatus.googleCalendar !== 'connected' ? [{ id: 'calendar', title: 'Calendar connection needs attention', detail: data.sourceStatus.googleCalendar, type: 'Connection' }] : []),
    ...data.tasks.filter((task) => task.priority === 'urgent' || task.priority === 'high').slice(0, 4).map((task) => ({ id: task.id, title: task.title, detail: task.dueDate ? formatDate(task.dueDate) : task.priority, type: 'Task' })),
    ...notes.slice(0, 4).map((note) => ({ id: note.id, title: note.title, detail: formatDate(note.updatedAt), type: 'Capture' })),
  ];
  const visibleSignals = tab === 'All' ? signals : signals.filter((item) => item.type === tab.slice(0, -1) || (tab === 'Connections' && item.type === 'Connection'));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <Glass className="p-4">
        <div className="mb-3 flex flex-wrap gap-2">{inboxTabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={'rounded-full px-3 py-1.5 text-[7px] ' + (tab === item ? 'bg-[#eee3dc] text-[#5c4b43]' : 'bg-white/50 text-[#887a71]')}>{item}</button>)}</div>
        <div className="space-y-1.5">{visibleSignals.length ? visibleSignals.map((item) => <Link key={item.type + item.id} href={item.type === 'Task' ? '/tasks?task=' + encodeURIComponent(item.id) : item.type === 'Connection' ? '/connections' : '/brain'} className="flex items-center gap-3 rounded-[11px] bg-white/42 px-3 py-2.5"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#eee6df] text-[#8e776b]">{item.type === 'Task' ? <ListChecks size={13} /> : item.type === 'Connection' ? <Bell size={13} /> : <Inbox size={13} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-[8.5px] font-medium text-[#4d423b]">{item.title}</span><span className="block text-[7px] text-[#9c8e85]">{item.detail}</span></span><span className="rounded-full bg-[#f3e6e8] px-2 py-1 text-[6.5px] text-[#a27079]">{item.type}</span></Link>) : <EmptyRows count={7} label="Nothing important is waiting" />}</div>
      </Glass>
      <Glass className="p-4">
        <p className="text-[8px] uppercase tracking-[.16em] text-[#8d786c]">Suggested next</p>
        <div className="mt-3 space-y-2">{visibleSignals.slice(0, 3).map((item) => <div key={item.type + item.id} className="rounded-[11px] bg-[#f6f0eb] p-3"><p className="text-[8px] font-medium text-[#51463f]">{item.title}</p><p className="mt-1 text-[7px] text-[#94877f]">Open the real source to act.</p></div>)}</div>
        <ImagePanel src={ART.room} className="mt-4 min-h-[170px]"><p className="absolute bottom-3 left-3 font-serif text-[10px] italic text-[#6d5f56]">Handle what is actually waiting.</p></ImagePanel>
      </Glass>
    </div>
  );
}

function PeopleToContact({ contacts, status }: { contacts: GlowContact[]; status: 'idle' | 'loading' | 'ready' | 'unavailable' }) {
  const contactTabs = ['All', 'Work', 'Personal'] as const;
  const [tab, setTab] = useSessionChoice('glow:living:people-tab', 'All', contactTabs);
  const visible = contacts
    .filter((contact) => tab === 'All' || (tab === 'Work' ? Boolean(contact.organization) : !contact.organization))
    .slice(0, 8);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <Glass className="p-4">
        <div className="mb-3 flex flex-wrap gap-2">{contactTabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={'rounded-full px-3 py-1.5 text-[7px] ' + (tab === item ? 'bg-[#eee3dc] text-[#5c4b43]' : 'bg-white/48 text-[#8a7c73]')}>{item}</button>)}</div>
        <div className="space-y-1.5">{visible.length ? visible.map((contact) => <a key={contact.id} href={contact.email ? 'mailto:' + contact.email : contact.phone ? 'tel:' + contact.phone : '#'} className="flex items-center gap-3 rounded-[11px] bg-white/42 px-3 py-2"><span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[#ebe3dc] text-[8px] font-medium text-[#78685f]">{contact.photoUrl ? <img src={contact.photoUrl} alt="" className="h-full w-full object-cover" /> : contact.name.split(/\s+/).map((part) => part[0]).slice(0,2).join('')}</span><span className="min-w-0 flex-1"><span className="block truncate text-[8.5px] font-medium text-[#4d423b]">{contact.name}</span><span className="block truncate text-[7px] text-[#9b8d84]">{contact.organization || contact.email || contact.phone || 'Contact'}</span></span><span className="text-[7px] text-[#a09188]">Open</span></a>) : <EmptyRows count={7} label={status === 'loading' ? 'Loading real contacts…' : 'No contact source is available'} />}</div>
      </Glass>
      <div className="space-y-4">
        <Glass className="p-4"><p className="text-[8px] uppercase tracking-[.16em] text-[#8d786c]">Relationship focus</p><p className="mt-2 text-[9px] leading-4 text-[#706159]">{visible.length ? visible.length + ' real contacts are available in this view.' : 'Connect or load contacts to build follow-up context.'}</p></Glass>
        <ImagePanel src={ART.flowers} className="min-h-[250px]"><p className="absolute bottom-4 left-4 max-w-[70%] font-serif text-[11px] italic text-[#665850]">The right people make life lighter.</p></ImagePanel>
      </div>
    </div>
  );
}

function BrainWeb({ data }: { data: PersonalContextData }) {
  const [query, setQuery] = useState('');
  const nodes = [
    ...data.goals.slice(0, 2).map((goal) => ({ id: 'g' + goal.id, label: goal.title, href: '/goals?goal=' + encodeURIComponent(goal.id), kind: 'Goal' })),
    ...data.notes.slice(0, 3).map((note) => ({ id: 'n' + note.id, label: note.title, href: '/brain', kind: 'Idea' })),
    ...data.routines.slice(0, 2).map((routine) => ({ id: 'r' + routine.id, label: routine.name, href: '/routines?routine=' + encodeURIComponent(routine.id), kind: 'Routine' })),
    ...data.habits.slice(0, 1).map((habit) => ({ id: 'h' + habit.id, label: habit.name, href: '/habits', kind: 'Habit' })),
  ].filter((node) => !query || node.label.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  const positions = ['left-[12%] top-[18%]','right-[12%] top-[18%]','left-[4%] top-[45%]','right-[4%] top-[45%]','left-[13%] bottom-[12%]','right-[13%] bottom-[12%]','left-[36%] bottom-[4%]','right-[35%] top-[5%]'];

  return (
    <Glass className="relative overflow-hidden p-4">
      <div className="absolute right-0 top-0 h-24 w-44 bg-cover bg-center opacity-45" style={{ backgroundImage: 'linear-gradient(90deg,rgba(255,253,250,1),rgba(255,253,250,.05)),url(' + ART.room + ')' }} />
      <label className="relative z-10 flex items-center gap-2 rounded-full border border-white/75 bg-white/56 px-3 py-2"><Search size={12} className="text-[#998a81]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your brain…" className="w-full bg-transparent text-[8px] outline-none placeholder:text-[#aa9d95]" /></label>
      <div className="relative z-10 mt-3 flex flex-wrap gap-2">{['Ideas','Projects','Goals','People','Notes','Learning','Inspiration','Resources'].map((item,index) => <Link key={item} href={item === 'Goals' ? '/goals' : item === 'Projects' ? '/projects' : item === 'People' ? '/living/people-to-contact' : '/brain'} className="rounded-[10px] border border-white/70 bg-white/52 px-3 py-1.5 text-[7px] text-[#85776e]"><span className="mr-1 text-[#8b84b4]">{['◉','◇','○','□','▣','△','⌁','▤'][index]}</span>{item}</Link>)}</div>
      <div className="relative mt-4 h-[455px] overflow-hidden rounded-[17px] bg-[radial-gradient(circle_at_center,rgba(239,231,248,.78),rgba(247,250,249,.34)_43%,rgba(255,255,255,.12)_72%)]">
        <div className="absolute left-1/2 top-1/2 h-px w-[68%] -translate-x-1/2 bg-[#ded5e6]/75" />
        <div className="absolute left-1/2 top-[17%] h-[66%] w-px -translate-x-1/2 bg-[#ded5e6]/75" />
        <div className="absolute left-[17%] top-[24%] h-px w-[66%] rotate-[24deg] bg-[#e1d9e8]/65" />
        <div className="absolute left-[17%] top-[68%] h-px w-[66%] -rotate-[24deg] bg-[#e1d9e8]/65" />
        {nodes.length ? nodes.map((node, index) => <Link key={node.id} href={node.href} className={'absolute max-w-[155px] rounded-full border border-white/82 bg-white/70 px-3 py-2 text-center text-[7px] text-[#5f5350] shadow-[0_6px_18px_rgba(75,60,52,.06)] backdrop-blur ' + positions[index % positions.length]}><span className="block truncate">{node.label}</span><span className="text-[6px] text-[#9f8f88]">{node.kind}</span></Link>) : Array.from({length:6},(_,index)=><span key={index} className={'absolute rounded-full border border-dashed border-[#ddd2e5] bg-white/34 px-4 py-2 text-[7px] italic text-[#a2949c] ' + positions[index]}>Open connection</span>)}
        <Link href="/brain" className="absolute left-1/2 top-1/2 grid h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/90 bg-[radial-gradient(circle,#fff,#f0e9f8_50%,#dcebed_78%)] font-serif text-[13px] text-[#554b61] shadow-[0_0_28px_rgba(197,188,224,.62)]">You</Link>
        <p className="absolute bottom-3 right-4 max-w-[180px] text-right font-serif text-[10px] italic leading-4 text-[#6f6159]">{nodes.length ? 'A more curious you, a brighter tomorrow.' : 'Your graph will grow from real Glow objects.'}</p>
      </div>
    </Glass>
  );
}

function MovingForward({ data }: { data: PersonalContextData }) {
  const goals = data.goals.filter((goal) => goal.status !== 'done');
  const categories = Array.from(new Set(goals.map((goal) => goal.category))).slice(0, 5);
  const movingTabs = ['All', ...categories] as string[];
  const [category, setCategory] = useSessionChoice('glow:living:moving-forward-category', 'All', movingTabs);
  const visibleGoals = category === 'All' ? goals : goals.filter((goal) => goal.category === category);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{movingTabs.map((item) => <button type="button" onClick={() => setCategory(item)} key={item} className={'rounded-full px-3 py-1.5 text-[7px] ' + (category === item ? 'bg-[#eee3dc] text-[#5c4b43]' : 'bg-white/48 text-[#887a71]')}>{item}</button>)}</div>
      <Glass className="p-4">
        <div className="space-y-2">{visibleGoals.length ? visibleGoals.slice(0, 8).map((goal, index) => <Link key={goal.id} href={'/goals?goal=' + encodeURIComponent(goal.id)} className="grid grid-cols-[34px_1fr_120px] items-center gap-3 rounded-[12px] bg-white/44 px-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-[9px]" style={{ backgroundColor: ['#e5edf9','#eee8f7','#f7eadf','#e5f0eb'][index % 4] }}><Target size={13} className="text-[#7c879d]" /></span><span className="min-w-0"><span className="block truncate text-[8.5px] font-medium text-[#4d423b]">{goal.title}</span><span className="block truncate text-[7px] text-[#9b8d84]">{goal.category} · {goal.targetDate ? formatDate(goal.targetDate) : 'No target date'}</span></span><span><span className="block text-right text-[7px] text-[#8c7c73]">{goal.progress}%</span><span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#ece7e2]"><span className="block h-full rounded-full bg-[#7c9db2]" style={{ width: Math.max(0, Math.min(100, goal.progress)) + '%' }} /></span></span></Link>) : <EmptyRows count={6} label="No active goals loaded" />}</div>
      </Glass>
      <ImagePanel src={ART.room} className="min-h-[155px]"><p className="absolute bottom-4 right-4 max-w-[42%] text-right font-serif text-[11px] italic text-[#665850]">{visibleGoals.length ? 'Progress is being drawn from your real goals.' : 'No goals match this view yet.'}</p></ImagePanel>
    </div>
  );
}

function LifePulse({ data }: { data: PersonalContextData }) {
  const signals = [
    { label: 'Mind', value: data.wellness?.mood || 'No signal', icon: Heart, href: '/brain' },
    { label: 'Body', value: data.wellness?.energy || 'No signal', icon: Dumbbell, href: '/wellness' },
    { label: 'Finances', value: 'No connected signal', icon: Target, href: '/finance' },
    { label: 'Relationships', value: 'No connected signal', icon: UserRound, href: '/relationships' },
    { label: 'Creativity', value: data.notes.length ? data.notes.length + ' notes' : 'No signal', icon: Sparkles, href: '/brain' },
    { label: 'Home', value: data.tasks.some((task) => /home|clean|room|laundry/i.test(task.title)) ? 'Tasks present' : 'No signal', icon: Home, href: '/life/home' },
  ];
  const observed = signals.filter((item) => item.value !== 'No signal' && item.value !== 'No connected signal').length;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <Glass className="p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{signals.map(({ label, value, icon: Icon, href }, index) => <Link href={href} key={label} className="rounded-[13px] border border-white/75 bg-white/44 p-4 transition hover:bg-white/65"><Icon size={15} className={['text-[#c8798b]','text-[#72a48e]','text-[#6e91b2]','text-[#c68199]','text-[#8a7fc2]','text-[#6da29c]'][index]} /><p className="mt-3 text-[8px] font-medium text-[#51463f]">{label}</p><p className="mt-1 text-[7px] text-[#978980]">{value}</p></Link>)}</div>
      </Glass>
      <div className="space-y-4">
        <Glass className="p-4">
          <p className="text-[8px] uppercase tracking-[.16em] text-[#8d786c]">Overall</p>
          <div className="mt-4 grid h-24 w-24 place-items-center rounded-full border-[8px] border-[#dceae4] bg-white/55 font-serif text-[22px] text-[#5f8175]">{observed ? observed + '/6' : '—'}</div>
          <p className="mt-3 text-[7px] text-[#8b7c73]">{observed ? observed + ' life areas have current observable signals.' : 'No broad life-area signal is available yet.'}</p>
        </Glass>
        <ImagePanel src={ART.calm} className="min-h-[130px]"><p className="absolute bottom-3 right-3 max-w-[70%] text-right font-serif text-[10px] italic leading-4 text-[#6b5c54]">{data.wellness?.notes || 'A balanced view comes from real signals, not invented scores.'}</p></ImagePanel>
      </div>
    </div>
  );
}

function CatchUp({ data, toggleTask }: { data: PersonalContextData; toggleTask: (task: PersonalTask) => void }) {
  const open = data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const waiting = open.filter((task) => task.status === 'pending');
  const someday = open.filter((task) => !task.dueDate);
  const ideas = data.notes;
  const catchTabs = ['Unfinished','Waiting','Someday','Ideas'] as const;
  const [tab, setTab] = useSessionChoice('glow:living:catch-up-tab', 'Unfinished', catchTabs);
  const visibleTasks = tab === 'Waiting' ? waiting : tab === 'Someday' ? someday : open;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
      <Glass className="p-4">
        <div className="mb-3 grid grid-cols-4 gap-2">{[['Unfinished',open.length],['Waiting',waiting.length],['Someday',someday.length],['Ideas',ideas.length]].map(([label,value]) => <button type="button" key={String(label)} onClick={() => setTab(label as typeof tab)} className={'rounded-[11px] px-2 py-2 text-center ' + (tab === label ? 'bg-[#eee3dc]' : 'bg-white/44')}><p className="text-[6.5px] text-[#8f8178]">{label}</p><p className="mt-1 font-serif text-[18px] text-[#3f3631]">{value}</p></button>)}</div>
        {tab === 'Ideas' ? (
          <div className="space-y-1.5">{ideas.length ? ideas.slice(0,7).map((note) => <Link key={note.id} href="/brain" className="flex items-center gap-2 rounded-[9px] bg-white/42 px-3 py-2"><Lightbulb size={11} className="text-[#72a79e]" /><span className="min-w-0 flex-1 truncate text-[8px] text-[#51463f]">{note.title}</span><span className="text-[7px] text-[#9b8d84]">{formatDate(note.updatedAt)}</span></Link>) : <EmptyRows count={6} label="No ideas loaded" />}</div>
        ) : <TaskRows tasks={visibleTasks} onToggle={toggleTask} limit={7} />}
      </Glass>
      <ImagePanel src={ART.room} className="min-h-[430px]"><p className="absolute bottom-5 right-4 max-w-[72%] text-right font-serif text-[11px] italic text-[#675a52]">A clearer mind creates a lighter day.</p></ImagePanel>
    </div>
  );
}

function PersonalHouse({ data, toggleTask }: { data: PersonalContextData; toggleTask: (task: PersonalTask) => void }) {
  const houseTabs = ['Spaces', 'Tasks', 'Routines', 'Maintenance', 'Shopping'] as const;
  const [tab, setTab] = useSessionChoice('glow:living:personal-house-tab', 'Spaces', houseTabs);
  const homeTasks = data.tasks.filter((task) => /home|clean|room|bath|kitchen|bed|closet|laundry|trash|tidy/i.test(task.title + ' ' + (task.description ?? '')));
  const homeRoutines = data.routines.filter((routine) => /home|clean|room|reset|laundry/i.test(routine.name + ' ' + (routine.description ?? '')));
  const roomWords = ['Living room','Bedroom','Kitchen','Bathroom','Closet','Office'];
  const discovered = roomWords.filter((room) => {
    const needle = room.toLowerCase().replace(' room','');
    return homeTasks.some((task) => (task.title + ' ' + (task.description ?? '')).toLowerCase().includes(needle)) || homeRoutines.some((routine) => (routine.name + ' ' + (routine.description ?? '')).toLowerCase().includes(needle));
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">{houseTabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} className={'rounded-full px-3 py-1.5 text-[8px] ' + (tab === item ? 'bg-[#eee4dd] text-[#5d4d45]' : 'bg-white/44 text-[#92847b]')}>{item}</button>)}</div>
      <div className="grid gap-4 lg:grid-cols-[1.32fr_.68fr]">
        <Glass className="p-4">
          {tab === 'Spaces' ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{Array.from({ length: 6 }, (_, index) => discovered[index] ? <Link href={'/life/home?space=' + encodeURIComponent(discovered[index])} key={index} className="overflow-hidden rounded-[12px] border border-white/75 bg-white/42"><div className="h-28 bg-cover bg-center" style={{ backgroundImage: 'url(' + [ART.room,ART.bath,ART.table,ART.bath,ART.room,ART.desk][index] + ')' }} /><p className="px-2 py-2 text-[8px] font-medium text-[#51463f]">{discovered[index]}</p></Link> : <div key={index} className="overflow-hidden rounded-[12px] border border-dashed border-[#ddd1c9] bg-white/32"><div className="h-28 bg-cover bg-center opacity-55" style={{ backgroundImage: 'url(' + [ART.room,ART.bath,ART.table,ART.bath,ART.room,ART.desk][index] + ')' }} /><p className="px-2 py-2 text-[8px] italic text-[#9b8d84]">Open space</p></div>)}</div> : null}
          {tab === 'Tasks' ? <TaskRows tasks={homeTasks} onToggle={toggleTask} limit={8} /> : null}
          {tab === 'Routines' ? <div className="space-y-2">{homeRoutines.length ? homeRoutines.map((routine) => <Link key={routine.id} href={'/routines?routine=' + encodeURIComponent(routine.id)} className="block rounded-[10px] bg-white/42 px-3 py-2 text-[8px] text-[#51463f]">{routine.name}</Link>) : <EmptyRows count={6} label="No home routines loaded" />}</div> : null}
          {tab === 'Maintenance' || tab === 'Shopping' ? <EmptyRows count={6} label={'No ' + tab.toLowerCase() + ' objects are loaded here'} /> : null}
        </Glass>
        <Glass className="p-4"><p className="text-[8px] uppercase tracking-[.16em] text-[#8d786c]">Home tasks</p><div className="mt-3 space-y-2">{homeTasks.slice(0, 6).map((task) => <Link key={task.id} href={'/tasks?task=' + encodeURIComponent(task.id)} className="block rounded-[9px] bg-white/42 px-3 py-2 text-[8px] text-[#51463f]">{task.title}</Link>)}{!homeTasks.length ? <p className="text-[8px] italic text-[#998b83]">No home-specific tasks loaded.</p> : null}</div><ImagePanel src={ART.flowers} className="mt-4 min-h-[170px]" /></Glass>
      </div>
    </div>
  );
}

function MiddayReset({ data }: { data: PersonalContextData }) {
  const routine = data.routines.find((item) => /midday.*reset|reset.*midday/i.test(item.name + ' ' + (item.description ?? ''))) ?? data.routines.find((item) => /reset/i.test(item.name));
  const task = data.tasks.find((item) => /midday.*reset|reset.*midday/i.test(item.title + ' ' + (item.description ?? '')));
  const sourceText = routine?.description || task?.description || '';
  const steps = sourceText.split(/\n|•|\d+\./).map((value) => value.trim()).filter(Boolean).slice(0, 6);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <Glass className="p-4">
        <div className="flex items-center justify-between"><div><p className="text-[8px] uppercase tracking-[.16em] text-[#8d786c]">{routine ? 'Routine' : task ? 'Task' : 'Reset'}</p><h2 className="mt-1 font-serif text-[22px] text-[#342b27]">{routine?.name || task?.title || 'No Midday Reset object is loaded'}</h2></div>{task ? <span className="rounded-full bg-[#f1e8df] px-3 py-1.5 text-[7px] text-[#806d61]">~{estimateMinutes(task)} min</span> : null}</div>
        <div className="mt-4 space-y-2">{steps.length ? steps.map((step, index) => <div key={index} className="flex items-center gap-3 rounded-[10px] bg-white/42 px-3 py-2.5"><span className="grid h-6 w-6 place-items-center rounded-full border border-[#d7c9c1] text-[7px] text-[#87766c]">{index + 1}</span><span className="text-[8px] text-[#51463f]">{step}</span></div>) : <EmptyRows count={6} label="No routine steps are stored yet" />}</div>
        <Link href={routine ? '/routines?routine=' + encodeURIComponent(routine.id) : '/routines'} className="mt-4 inline-flex rounded-full bg-[#302a27] px-5 py-2.5 text-[8px] font-medium text-white">{routine ? 'Start Routine' : 'Open Routines'}</Link>
      </Glass>
      <div className="space-y-4">
        <ImagePanel src={ART.table} className="min-h-[330px]"><p className="absolute bottom-5 right-5 font-serif text-[12px] italic text-[#675a52]">You’ve got this.</p></ImagePanel>
        <Glass className="grid grid-cols-5 gap-2 p-3">{['Items','Playlist','Duration','Adapt','Notes'].map((item) => <button key={item} type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:open', { detail: { context: { room: 'Midday Reset', intent: item } } }))} className="rounded-[9px] bg-white/42 px-2 py-2 text-[7px] text-[#74665d]">{item}</button>)}</Glass>
      </div>
    </div>
  );
}

function VisionYou({ data }: { data: PersonalContextData }) {
  const openTasks = data.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const activeGoals = data.goals.filter((goal) => goal.status !== 'done');
  const currentRows = [
    ['Focus', data.activeTask?.title || openTasks[0]?.title || 'Open time'],
    ['Energy', data.wellness?.energy || 'Not checked in'],
    ['Mood', data.wellness?.mood || 'No signal'],
    ['Goals', activeGoals.length ? activeGoals.length + ' active' : 'No active goals'],
    ['Today', data.todayEvents.length ? data.todayEvents.length + ' scheduled' : 'Open'],
  ];
  const shifts = [
    activeGoals[0] ? 'Move ' + activeGoals[0].title + ' forward' : openTasks[0] ? 'Finish one open priority' : 'Protect open time',
    data.wellness?.energy ? 'Plan around ' + data.wellness.energy + ' energy' : 'Check in before adding more',
    activeGoals[0]?.targetDate ? 'Keep ' + formatDate(activeGoals[0].targetDate) + ' visible' : 'Choose a direction when ready',
    data.todayEvents.length > 3 ? 'Protect breathing room around commitments' : 'Use open space intentionally',
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[.82fr_1.18fr_.78fr]">
      <Glass className="p-4">
        <div className="flex items-center justify-between"><p className="text-[8px] uppercase tracking-[.17em] text-[#8d786c]">Current You</p><span className="text-[7px] text-[#a09289]">real state</span></div>
        <div className="mt-3 space-y-2.5">
          {currentRows.map(([label,value],index) => (
            <div key={label}>
              <div className="flex items-center justify-between gap-2 text-[7px]"><span className="text-[#6b5c54]">{label}</span><span className="max-w-[58%] truncate text-[#978981]">{value}</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#eee7e2]"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#9fb7ca,#d8c7ea)]" style={{ width: (28 + index * 11) + '%' }} /></div>
            </div>
          ))}
        </div>
      </Glass>

      <ImagePanel src={ART.calm} className="min-h-[400px] p-5">
        <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 rounded-[16px] border border-white/70 bg-white/58 p-5 text-center backdrop-blur-md">
          <p className="text-[8px] uppercase tracking-[.22em] text-[#8d786c]">A brighter you is already possible.</p>
          <p className="mt-2 font-serif text-[13px] italic text-[#62564f]">Current state → proposed direction</p>
          <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:open', { detail: { context: { room: 'Vision & You', intent: 'Simulate a realistic next version of my day using only my real Glow data. Do not change anything until I approve.' } } }))} className="mt-4 rounded-full bg-[#342d29] px-5 py-2.5 text-[8px] text-white">Simulate This Life</button>
        </div>
      </ImagePanel>

      <Glass className="p-4">
        <p className="text-[8px] uppercase tracking-[.17em] text-[#8d786c]">Potential shifts</p>
        <div className="mt-3 space-y-2">
          {shifts.map((shift,index) => <div key={shift} className="flex items-start gap-2 rounded-[10px] bg-white/42 px-3 py-2.5"><span className="mt-0.5 text-[#9a86b0]">{index + 1}</span><p className="text-[8px] leading-4 text-[#5b4e47]">{shift}</p></div>)}
        </div>
        <p className="mt-4 font-serif text-[10px] italic leading-4 text-[#74655d]">Proposals stay separate from reality until you approve them.</p>
      </Glass>
    </div>
  );
}

function WorkspaceContent({
  workspace,
  data,
  contacts,
  contactsStatus,
  toggleTask,
  startTask,
}: {
  workspace: LivingWorkspaceId;
  data: PersonalContextData;
  contacts: GlowContact[];
  contactsStatus: 'idle' | 'loading' | 'ready' | 'unavailable';
  toggleTask: (task: PersonalTask) => void;
  startTask: (task: PersonalTask) => void;
}) {
  if (workspace === 'what-now') return <WhatNow data={data} startTask={startTask} />;
  if (workspace === 'planning-studio') return <PlanningStudio data={data} />;
  if (workspace === 'day-flow') return <DayFlow data={data} />;
  if (workspace === 'today-systems') return <TodaySystems data={data} toggleTask={toggleTask} />;
  if (workspace === 'important-inbox') return <ImportantInbox data={data} />;
  if (workspace === 'people-to-contact') return <PeopleToContact contacts={contacts} status={contactsStatus} />;
  if (workspace === 'brain-web') return <BrainWeb data={data} />;
  if (workspace === 'moving-forward') return <MovingForward data={data} />;
  if (workspace === 'life-pulse') return <LifePulse data={data} />;
  if (workspace === 'catch-up') return <CatchUp data={data} toggleTask={toggleTask} />;
  if (workspace === 'personal-house') return <PersonalHouse data={data} toggleTask={toggleTask} />;
  if (workspace === 'midday-reset') return <MiddayReset data={data} />;
  return <VisionYou data={data} />;
}

export function ReferenceLivingWorkspace({
  workspace,
  userName,
}: {
  workspace: LivingWorkspaceId;
  userName?: string | null;
}) {
  const state = usePersonalContext();
  const data = state.status === 'ready' ? state.data : null;
  const updateTask = useServerAction((payload: { id: string; status: PersonalTask['status'] }) =>
    updateTaskAction(payload.id, {
      status: payload.status,
      completedAt: payload.status === 'done' ? new Date() : undefined,
    }),
  );
  const { contacts, status: contactsStatus } = useContacts(workspace === 'people-to-contact');

  function toggleTask(task: PersonalTask) {
    updateTask.run({ id: task.id, status: task.status === 'done' ? 'pending' : 'done' }, () => {
      window.sessionStorage.removeItem('glow:personal-context:v1');
      window.location.reload();
    });
  }

  function startTask(task: PersonalTask) {
    if (task.status === 'in_progress') {
      window.location.assign('/tasks?task=' + encodeURIComponent(task.id));
      return;
    }
    updateTask.run({ id: task.id, status: 'in_progress' }, () => {
      window.sessionStorage.removeItem('glow:personal-context:v1');
      window.location.assign('/tasks?task=' + encodeURIComponent(task.id));
    });
  }

  return (
    <Shell workspace={workspace} userName={data?.user.name || userName}>
      {data ? <WorkspaceContent workspace={workspace} data={data} contacts={contacts} contactsStatus={contactsStatus} toggleTask={toggleTask} startTask={startTask} /> : <Glass className="p-5"><p className="text-[9px] italic text-[#998b82]">Glow is loading your real information.</p></Glass>}
    </Shell>
  );
}
