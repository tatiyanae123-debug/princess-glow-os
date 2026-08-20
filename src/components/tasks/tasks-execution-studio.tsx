'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  Circle,
  Clock3,
  Columns3,
  Gauge,
  ListTodo,
  Mic,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  TimerReset,
  WandSparkles,
  X,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { createTaskAction, updateTaskAction } from '@/app/actions/tasks';
import { createCalendarEventAction } from '@/app/actions/calendar-events';
import type { CalendarEvent, Task } from '@/lib/types';

type Energy = 'High' | 'Normal' | 'Low' | 'Exhausted';
type ContextMode = 'Anywhere' | 'Home' | 'Out' | 'Work' | 'Gym' | 'Computer' | 'Phone';
type ViewMode = 'Today' | 'Week' | 'Kanban' | 'Projects';
type Version = 'Full' | 'Quick' | 'Minimum';
type Props = {
  initialTasks: Task[];
  blockedTaskIds: Record<string, string[]>;
  calendarEvents: CalendarEvent[];
  modeName: string;
};

const PRIORITY_SCORE: Record<Task['priority'], number> = { urgent: 4, high: 3, medium: 2, low: 1 };
const TIME_OPTIONS = [5, 15, 30, 45, 60] as const;
const ENERGY_OPTIONS: Energy[] = ['High', 'Normal', 'Low', 'Exhausted'];
const CONTEXT_OPTIONS: ContextMode[] = ['Anywhere', 'Home', 'Out', 'Work', 'Gym', 'Computer', 'Phone'];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function tomorrowAt(hour = 18) {
  const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(hour, 0, 0, 0); return d;
}
function nextSaturday() {
  const d = new Date(); const add = (6 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + add); d.setHours(12, 0, 0, 0); return d;
}
function fmtTime(date: Date) { return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function fmtDate(date: Date) { return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
function estimateMinutes(task: Task) {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  if (/email|reply|text|confirm|order|refill|call/.test(text)) return 10;
  if (/laundry|shower|beauty|makeup|hair|clean|tidy/.test(text)) return 25;
  if (/workout|gym|run|pilates/.test(text)) return 35;
  if (/plan|research|interview|application|organize|project/.test(text)) return 45;
  return 20;
}
function versionMinutes(task: Task, version: Version) {
  const full = estimateMinutes(task);
  if (version === 'Quick') return Math.max(5, Math.round(full * 0.55 / 5) * 5);
  if (version === 'Minimum') return Math.max(5, Math.round(full * 0.25 / 5) * 5);
  return full;
}
function inferredContext(task: Task): ContextMode {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  if (/call|text|phone/.test(text)) return 'Phone';
  if (/email|research|application|computer|online|draft/.test(text)) return 'Computer';
  if (/grocery|return|pickup|pick up|store|errand/.test(text)) return 'Out';
  if (/gym|workout|pilates|run/.test(text)) return 'Gym';
  if (/laundry|clean|closet|bedroom|kitchen|home/.test(text)) return 'Home';
  if (/work|office|shift/.test(text)) return 'Work';
  return 'Anywhere';
}
function inferredEnergy(task: Task): Energy {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  if (/research|planning|plan |application|interview|project|write|design/.test(text)) return 'High';
  if (/clean|workout|organize|laundry/.test(text)) return 'Normal';
  if (/email|reply|call|order|confirm|refill|text/.test(text)) return 'Low';
  return 'Normal';
}
function importanceLabel(task: Task) {
  if (task.priority === 'urgent') return 'Do soon';
  if (task.priority === 'high') return 'Important';
  if (task.priority === 'medium') return 'Worth doing';
  return 'Can wait';
}
function isVague(task: Task) {
  const words = task.title.trim().split(/\s+/).length;
  return words <= 2 && /stuff|things|work|job|home|clean|plan|organize|research/i.test(task.title);
}
function category(task: Task) {
  const text = `${task.title} ${task.description ?? ''}`.toLowerCase();
  if (/glow|website|page|app|design/.test(text)) return 'Glow OS';
  if (/interview|job|career|resume|application|work/.test(text)) return 'Career';
  if (/beauty|hair|makeup|skin|shampoo/.test(text)) return 'Beauty';
  if (/grocery|meal|food|cook/.test(text)) return 'Food';
  if (/clean|laundry|closet|room|home/.test(text)) return 'Home';
  if (/workout|gym|fitness|run/.test(text)) return 'Fitness';
  return 'Life Admin';
}
function taskSteps(task: Task) {
  const text = task.title.toLowerCase();
  if (/closet|room|clean|organize/.test(text)) return ['Clear the obvious surface', 'Make one keep / move / laundry pile', 'Put away the easiest group', 'Finish one small zone', 'Stop or schedule the remainder'];
  if (/interview|application|job/.test(text)) return ['Open the relevant notes or application', 'Identify the single next deliverable', 'Complete the smallest required section', 'Review once', 'Send or schedule the next step'];
  if (/email|follow.?up|reply/.test(text)) return ['Open the draft', 'Write the one-sentence purpose', 'Add the essential detail', 'Review once', 'Send'];
  return ['Open what you need', 'Do the smallest concrete first step', 'Continue until the useful minimum is complete', 'Review the result', 'Choose the next step'];
}
function freeMinutesUntilNext(events: CalendarEvent[], now: Date) {
  const future = events.filter(e => !e.allDay && sameDay(e.startAt, now) && e.startAt.getTime() > now.getTime()).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const current = events.find(e => !e.allDay && sameDay(e.startAt, now) && e.startAt.getTime() <= now.getTime() && (e.endAt?.getTime() ?? e.startAt.getTime() + 60 * 60_000) > now.getTime());
  if (current) return 0;
  const next = future[0];
  if (next) return Math.max(0, Math.floor((next.startAt.getTime() - now.getTime()) / 60_000));
  const end = new Date(now); end.setHours(23, 0, 0, 0);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 60_000));
}
function scoreTask(task: Task, now: Date, energy: Energy, context: ContextMode, timeFit: number, blocked: boolean) {
  if (blocked) return -999;
  const est = estimateMinutes(task);
  let score = PRIORITY_SCORE[task.priority] * 20;
  if (task.dueDate) {
    const delta = task.dueDate.getTime() - now.getTime();
    if (delta < 0) score += 35;
    else if (delta < 24 * 60 * 60_000) score += 25;
    else if (delta < 3 * 24 * 60 * 60_000) score += 10;
  }
  if (est <= timeFit) score += 20; else score -= 15;
  const inferred = inferredEnergy(task);
  if (energy === 'Exhausted') score += inferred === 'Low' ? 25 : inferred === 'High' ? -25 : -5;
  if (energy === 'Low') score += inferred === 'Low' ? 18 : inferred === 'High' ? -15 : 2;
  if (energy === 'High') score += inferred === 'High' ? 10 : 0;
  const taskContext = inferredContext(task);
  if (context !== 'Anywhere') score += taskContext === context || taskContext === 'Anywhere' ? 15 : -20;
  if (task.status === 'in_progress') score += 30;
  return score;
}

export function TasksExecutionStudio({ initialTasks, blockedTaskIds, calendarEvents, modeName }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [energy, setEnergy] = useState<Energy>(modeName.toLowerCase().includes('low') ? 'Low' : 'Normal');
  const [context, setContext] = useState<ContextMode>('Anywhere');
  const [timeFit, setTimeFit] = useState<number>(30);
  const [view, setView] = useState<ViewMode>('Today');
  const [selected, setSelected] = useState<Task | null>(null);
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [version, setVersion] = useState<Version>('Full');
  const [executionTask, setExecutionTask] = useState<Task | null>(null);
  const [executionSeconds, setExecutionSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [executionStep, setExecutionStep] = useState(0);
  const [fixOpen, setFixOpen] = useState(false);
  const [easierOpen, setEasierOpen] = useState(false);
  const [breakdownTask, setBreakdownTask] = useState<Task | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [notice, setNotice] = useState('');
  const [asking, setAsking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!running || !executionTask) return;
    const id = window.setInterval(() => setExecutionSeconds(s => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, executionTask]);
  useEffect(() => {
    if (executionTask && executionSeconds === 0) setRunning(false);
  }, [executionSeconds, executionTask]);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 3600);
    return () => window.clearTimeout(id);
  }, [notice]);

  const openTasks = useMemo(() => tasks.filter(t => !t.archived && t.status !== 'done' && t.status !== 'cancelled'), [tasks]);
  const scored = useMemo(() => [...openTasks].sort((a, b) => scoreTask(b, now, energy, context, timeFit, Boolean(blockedTaskIds[b.id])) - scoreTask(a, now, energy, context, timeFit, Boolean(blockedTaskIds[a.id]))), [openTasks, now, energy, context, timeFit, blockedTaskIds]);
  const doNext = scored[0] ?? null;
  const todayTasks = useMemo(() => openTasks.filter(t => !t.dueDate || sameDay(t.dueDate, now)), [openTasks, now]);
  const overdue = useMemo(() => openTasks.filter(t => t.dueDate && t.dueDate.getTime() < now.getTime() && !sameDay(t.dueDate, now)), [openTasks, now]);
  const waiting = useMemo(() => openTasks.filter(t => Boolean(blockedTaskIds[t.id]?.length)), [openTasks, blockedTaskIds]);
  const nowLane = scored.filter(t => !blockedTaskIds[t.id] && (t.status === 'in_progress' || (t.dueDate && sameDay(t.dueDate, now)))).slice(0, 2);
  const nextLane = scored.filter(t => !blockedTaskIds[t.id] && !nowLane.some(x => x.id === t.id)).slice(0, 4);
  const flexibleLane = scored.filter(t => !blockedTaskIds[t.id] && !t.dueDate && !nowLane.some(x => x.id === t.id) && !nextLane.some(x => x.id === t.id)).slice(0, 5);
  const notToday = openTasks.filter(t => t.dueDate && t.dueDate > now && !sameDay(t.dueDate, now)).slice(0, 6);
  const inbox = openTasks.filter(t => !t.dueDate && (isVague(t) || !t.description)).slice(0, 6);
  const availableMinutes = freeMinutesUntilNext(calendarEvents, now);
  const plannedMinutes = todayTasks.filter(t => !blockedTaskIds[t.id]).reduce((sum, t) => sum + estimateMinutes(t), 0);
  const overBy = Math.max(0, plannedMinutes - availableMinutes);
  const fitting = scored.filter(t => !blockedTaskIds[t.id] && estimateMinutes(t) <= timeFit).slice(0, 6);
  const grouped = useMemo(() => {
    const map = new Map<string, Task[]>();
    openTasks.forEach(t => { const key = category(t); map.set(key, [...(map.get(key) ?? []), t]); });
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [openTasks]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => { const d = new Date(now); const offset = (d.getDay() === 0 ? -6 : 1 - d.getDay()) + i; d.setDate(d.getDate() + offset); d.setHours(0, 0, 0, 0); return d; }), [now]);
  const weekLoads = weekDays.map(day => openTasks.filter(t => t.dueDate && sameDay(t.dueDate, day)).reduce((sum, t) => sum + estimateMinutes(t), 0));
  const maxWeekLoad = Math.max(...weekLoads, 1);

  function updateLocal(task: Task) {
    setTasks(current => current.map(t => t.id === task.id ? task : t));
    if (selected?.id === task.id) setSelected(task);
    if (executionTask?.id === task.id) setExecutionTask(task);
  }
  function patchTask(task: Task, patch: Parameters<typeof updateTaskAction>[1], success: string) {
    startTransition(async () => {
      const result = await updateTaskAction(task.id, patch);
      if (result.data) { updateLocal(result.data); setNotice(success); }
      else setNotice('That change did not save. Nothing else was changed.');
    });
  }
  function markDone(task: Task) {
    patchTask(task, { status: 'done', completedAt: new Date() }, `${task.title} is done.`);
    if (executionTask?.id === task.id) { setRunning(false); setExecutionTask(null); }
  }
  function moveTask(task: Task, date: Date) { patchTask(task, { dueDate: date }, `${task.title} moved to ${date.toLocaleDateString('en-US', { weekday: 'long' })}.`); }
  function startTask(task: Task, selectedVersion: Version = version) {
    const mins = versionMinutes(task, selectedVersion);
    setExecutionTask(task); setExecutionSeconds(mins * 60); setExecutionStep(0); setRunning(true);
    if (task.status !== 'in_progress') patchTask(task, { status: 'in_progress' }, `${task.title} started.`);
  }
  function scheduleTask(task: Task, when?: Date) {
    const start = when ?? new Date(now.getTime() + 15 * 60_000);
    const end = new Date(start.getTime() + estimateMinutes(task) * 60_000);
    startTransition(async () => {
      const result = await createCalendarEventAction({ title: task.title, description: `Calendar work block created from task ${task.id}.`, startAt: start, endAt: end, allDay: false, color: '#e8d9dd' });
      setNotice(result.data ? `Calendar block created for ${task.title}. The task remains your source of truth.` : 'The calendar block could not be created.');
    });
  }
  async function askGlow(text = question) {
    const q = text.trim(); if (!q) return;
    setAsking(true); setAnswer('');
    try {
      const r = await fetch('/api/glow/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: `${q}\nTask context: ${openTasks.slice(0, 10).map(t => `${t.title} (${t.priority}${t.dueDate ? `, due ${t.dueDate.toISOString()}` : ''})`).join('; ')}`, history: [] }) });
      const data = await r.json(); setAnswer(data.message ?? 'Glow could not answer yet.');
    } catch { setAnswer('Glow could not answer yet. Your tasks were not changed.'); }
    finally { setAsking(false); }
  }
  function createFollowUp(task: Task) {
    startTransition(async () => {
      const result = await createTaskAction({ title: `Follow up: ${task.title}`, status: 'pending', priority: task.priority === 'urgent' ? 'high' : task.priority, dueDate: tomorrowAt(10) });
      if (result.data) { setTasks(current => [result.data, ...current]); setNotice('Follow-up created for tomorrow.'); }
    });
  }
  function applyFix() {
    const candidates = scored.filter(t => !blockedTaskIds[t.id] && t.priority !== 'urgent' && t.priority !== 'high').slice().reverse();
    const toMove: Task[] = []; let saved = 0;
    for (const t of candidates) { if (saved >= overBy) break; toMove.push(t); saved += estimateMinutes(t); }
    toMove.forEach(t => moveTask(t, tomorrowAt())); setFixOpen(false);
  }
  function applyEasier() {
    const keep = scored.filter(t => t.priority === 'urgent' || t.priority === 'high').slice(0, 3);
    const move = todayTasks.filter(t => !keep.some(k => k.id === t.id) && !blockedTaskIds[t.id]).slice(0, 4);
    move.forEach(t => moveTask(t, tomorrowAt())); setEnergy('Low'); setTimeFit(15); setEasierOpen(false);
  }

  const TaskCard = ({ task, compact = false }: { task: Task; compact?: boolean }) => {
    const blocked = blockedTaskIds[task.id]; const est = estimateMinutes(task);
    return <button type="button" onClick={() => { setSelected(task); setVersion('Full'); }} className={`w-full rounded-[20px] border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${blocked ? 'border-[#ded9e5] bg-[#f6f3f8]' : task.priority === 'urgent' || task.priority === 'high' ? 'border-[#ead5d8] bg-[#fff8f7]' : 'border-[#e8e3d9] bg-[#fffdf9]'}`}>
      <div className="flex items-start gap-3"><span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${blocked ? 'bg-[#aaa0b6]' : task.priority === 'urgent' ? 'bg-[#c87a84]' : task.priority === 'high' ? 'bg-[#d4a086]' : 'bg-[#aebc9e]'}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[#423c37]">{task.title}</p>{isVague(task) ? <span className="rounded-full bg-[#f4eadf] px-2 py-0.5 text-[9px] text-[#987057]">Needs clarity</span> : null}{blocked ? <span className="rounded-full bg-[#ede9f1] px-2 py-0.5 text-[9px] text-[#756a80]">Waiting</span> : null}</div><div className="mt-2 flex flex-wrap gap-2 text-[10px] text-[#8c837b]"><span>{importanceLabel(task)}</span><span>·</span><span>~{est}m Glow estimate</span>{task.dueDate ? <><span>·</span><span>{sameDay(task.dueDate, now) ? `Due ${fmtTime(task.dueDate)}` : task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span></> : null}</div>{!compact && blocked ? <p className="mt-2 text-[10px] text-[#81768b]">Waiting on {blocked.join(', ')}</p> : null}</div><ArrowRight size={14} className="mt-1 shrink-0 text-[#aaa198]" /></div>
    </button>;
  };

  return <div className="mx-auto max-w-[1380px] space-y-6 pb-24">
    <section className="relative overflow-hidden rounded-[38px] border border-[#e8e2d8] bg-[radial-gradient(circle_at_88%_8%,rgba(220,232,211,.82),transparent_27%),radial-gradient(circle_at_62%_0%,rgba(249,226,218,.8),transparent_30%),linear-gradient(135deg,#fffdf8,#f7f4ed)] p-6 shadow-[0_30px_100px_rgba(76,63,52,.08)] sm:p-9">
      <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#9a8d7e]">Tasks · Personal Execution Studio</p>
      <div className="mt-3 grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div><h1 className="font-serif text-5xl tracking-[-.04em] text-[#302c28] sm:text-6xl">What matters now.</h1><p className="mt-3 text-sm text-[#a66d75]">{fmtDate(now)} · {fmtTime(now)}</p><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#6a625c]">{openTasks.length ? `${openTasks.length} active task${openTasks.length === 1 ? '' : 's'} are open.` : 'Nothing active is demanding your attention.'} Glow is ranking them by importance, timing, fit, energy, context, and blockers.</p><div className="mt-6 flex flex-wrap gap-2"><button type="button" disabled={!doNext || isPending} onClick={() => doNext && startTask(doNext)} className="rounded-full bg-[#39352f] px-5 py-3 text-sm text-white disabled:opacity-40">Start Next</button><button type="button" onClick={() => setEasierOpen(true)} className="rounded-full border border-[#ddd6cc] bg-white/75 px-5 py-3 text-sm">Make Today Easier</button><button type="button" onClick={() => setFixOpen(true)} className="rounded-full border border-[#ddd6cc] bg-white/75 px-5 py-3 text-sm">Fix My Tasks</button><button type="button" onClick={() => askGlow('What should I do next from my current tasks?')} className="rounded-full border border-[#ddd6cc] bg-white/75 px-5 py-3 text-sm">Ask Glow</button></div></div><div className="rounded-[28px] border border-white/80 bg-white/68 p-5 backdrop-blur-xl"><p className="text-[10px] uppercase tracking-[.15em] text-[#9c938a]">Best next action</p><p className="mt-2 font-serif text-2xl text-[#3c3732]">{doNext?.title ?? 'Nothing urgent'}</p>{doNext ? <><p className="mt-2 text-xs text-[#766e67]">~{estimateMinutes(doNext)} min · {importanceLabel(doNext)}</p><p className="mt-3 text-xs leading-5 text-[#7d756d]">Why now: {doNext.dueDate && sameDay(doNext.dueDate, now) ? 'due today · ' : ''}{estimateMinutes(doNext) <= availableMinutes ? `fits inside the current ${availableMinutes}m calendar opening` : `larger than the current ${availableMinutes}m calendar opening`} · inferred {inferredEnergy(doNext).toLowerCase()} energy.</p></> : <p className="mt-2 text-xs text-[#817970]">You can keep the remaining time light.</p>}</div></div>
    </section>

    <section className="grid gap-4 xl:grid-cols-[1fr_360px]"><div className="rounded-[28px] border border-[#e9e3da] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-center gap-5"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">What fits right now?</p><div className="mt-2 flex flex-wrap gap-1.5">{TIME_OPTIONS.map(m => <button key={m} type="button" onClick={() => setTimeFit(m)} className={`rounded-full px-3 py-1.5 text-xs ${timeFit === m ? 'bg-[#3e3934] text-white' : 'bg-[#f7f4ef] text-[#766f68]'}`}>{m === 60 ? '1h+' : `${m}m`}</button>)}</div></div><div><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Energy</p><div className="mt-2 flex flex-wrap gap-1.5">{ENERGY_OPTIONS.map(item => <button key={item} type="button" onClick={() => setEnergy(item)} className={`rounded-full px-3 py-1.5 text-xs ${energy === item ? 'bg-[#a86d75] text-white' : 'bg-[#f8f3f1] text-[#766f68]'}`}>{item}</button>)}</div></div></div><div className="mt-5 border-t border-[#eee8df] pt-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Where are you?</p><div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">{CONTEXT_OPTIONS.map(item => <button key={item} type="button" onClick={() => setContext(item)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs ${context === item ? 'bg-[#e8efe2] text-[#58634f]' : 'bg-[#faf8f4] text-[#817970]'}`}>{item}</button>)}</div></div></div><div className="rounded-[28px] border border-[#e9e3da] bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Today’s capacity</p><p className="mt-1 font-serif text-2xl">{overBy ? `${overBy}m over` : 'Fits for now'}</p></div><Gauge size={18} className="text-[#9d7a72]" /></div><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-[15px] bg-[#faf7f2] p-3"><span className="text-[#948b82]">Calendar opening</span><p className="mt-1 font-medium">{availableMinutes}m</p></div><div className="rounded-[15px] bg-[#faf7f2] p-3"><span className="text-[#948b82]">Task estimate</span><p className="mt-1 font-medium">{plannedMinutes}m</p></div></div><p className="mt-3 text-[10px] leading-5 text-[#91887f]">Task time is a Glow estimate from task wording. Calendar opening uses your fixed events today.</p><button type="button" onClick={() => setFixOpen(true)} className="mt-4 w-full rounded-full bg-[#f0ebe4] py-2.5 text-xs font-medium">Fix My Tasks</button></div></section>

    <section className="rounded-[28px] border border-[#e9e3da] bg-white p-4 sm:p-5"><div className="flex gap-1 overflow-x-auto rounded-full bg-[#faf7f2] p-1">{(['Today','Week','Kanban','Projects'] as ViewMode[]).map(item => <button key={item} type="button" onClick={() => setView(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs ${view === item ? 'bg-white text-[#a3616c] shadow-sm' : 'text-[#817970]'}`}>{item}</button>)}</div></section>

    {view === 'Today' ? <>
      <section className="grid gap-5 xl:grid-cols-4">{[
        ['NOW', nowLane, 'What makes sense right now'], ['NEXT', nextLane, 'Worth doing after Now'], ['FLEXIBLE', flexibleLane, 'Useful work that can move'], ['WAITING', waiting, 'Blocked until something changes'],
      ].map(([label, items, subtitle]) => <div key={String(label)} className="rounded-[28px] border border-[#e9e3da] bg-white p-4"><p className="text-[10px] font-semibold tracking-[.16em] text-[#9a9188]">{String(label)}</p><p className="mt-1 text-xs text-[#8c837b]">{String(subtitle)}</p><div className="mt-4 space-y-2">{(items as Task[]).map(task => <TaskCard key={task.id} task={task} compact />)}{!(items as Task[]).length ? <p className="rounded-[16px] bg-[#faf8f4] p-4 text-xs text-[#948b83]">Nothing here right now.</p> : null}</div></div>)}</section>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-[28px] border border-[#e9e3da] bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Worth doing today</p><h2 className="mt-1 font-serif text-3xl">Tasks that fit your current settings.</h2></div><Clock3 size={17} className="text-[#a88a7d]" /></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{fitting.map(task => <TaskCard key={task.id} task={task} />)}{!fitting.length ? <p className="text-xs text-[#91887f]">No open task fits all selected constraints. Increase time, change context, or lower the energy requirement.</p> : null}</div><button type="button" disabled={!fitting.length} onClick={() => fitting[0] && startTask(fitting[0])} className="mt-5 rounded-full bg-[#3e3934] px-4 py-2.5 text-xs text-white disabled:opacity-40">Start {timeFit}-Minute Sprint</button></div><div className="space-y-5"><div className="rounded-[28px] border border-[#e9e3da] bg-[#f7f3f8] p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#8d8296]">Safe to leave for later</p><h2 className="mt-1 font-serif text-2xl">Not Today</h2><p className="mt-2 text-xs leading-5 text-[#7c7284]">Glow knows about these. They do not need your attention right now.</p><div className="mt-4 space-y-2">{notToday.map(t => <TaskCard key={t.id} task={t} compact />)}{!notToday.length ? <p className="text-xs text-[#8d8296]">Nothing is intentionally parked later.</p> : null}</div></div><div className="rounded-[28px] border border-[#e9e3da] bg-white p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Inbox · Needs clarity</p><div className="mt-4 space-y-2">{inbox.map(task => <div key={task.id} className="rounded-[16px] bg-[#faf7f2] p-3"><p className="text-xs font-medium">{task.title}</p><p className="mt-1 text-[10px] text-[#91887f]">Glow suggests reviewing the date, outcome, or type before it becomes clutter.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => setSelected(task)} className="text-[10px] text-[#9c626c]">Triage</button><button type="button" onClick={() => moveTask(task, tomorrowAt())} className="text-[10px] text-[#7b746c]">Tomorrow</button></div></div>)}{!inbox.length ? <p className="text-xs text-[#91887f]">Inbox is clear.</p> : null}</div></div></section>

      {overdue.length ? <section className="rounded-[28px] border border-[#ead9d9] bg-[#fff9f8] p-5 sm:p-6"><p className="text-[10px] uppercase tracking-[.14em] text-[#a17679]">{overdue.length} task{overdue.length === 1 ? '' : 's'} need a decision</p><p className="mt-2 text-sm text-[#665d58]">Overdue is treated as a decision queue, not a guilt pile.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{overdue.map(task => <div key={task.id} className="rounded-[18px] bg-white p-4"><p className="text-sm font-medium">{task.title}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => moveTask(task, new Date())} className="rounded-full bg-[#3e3934] px-3 py-1.5 text-[10px] text-white">Do Today</button><button type="button" onClick={() => moveTask(task, tomorrowAt())} className="rounded-full border border-[#e4ddd5] px-3 py-1.5 text-[10px]">Move</button><button type="button" onClick={() => setBreakdownTask(task)} className="rounded-full border border-[#e4ddd5] px-3 py-1.5 text-[10px]">Break Down</button><button type="button" onClick={() => patchTask(task, { archived: true }, `${task.title} archived.`)} className="rounded-full border border-[#e4ddd5] px-3 py-1.5 text-[10px]">Archive</button></div></div>)}</div></section> : null}
    </> : null}

    {view === 'Week' ? <section className="rounded-[30px] border border-[#e9e3da] bg-white p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Weekly workload map</p><div className="mt-5 grid gap-3 sm:grid-cols-7">{weekDays.map((day, i) => <button key={day.toISOString()} type="button" onClick={() => setNotice(`${day.toLocaleDateString('en-US',{weekday:'long'})}: ~${weekLoads[i]} task minutes estimated.`)} className="rounded-[18px] bg-[#faf8f4] p-4 text-left"><p className="text-[10px] uppercase text-[#948b82]">{day.toLocaleDateString('en-US',{weekday:'short'})}</p><p className="mt-1 font-serif text-xl">{weekLoads[i]}m</p><div className="mt-4 h-20 rounded-full bg-[#eee8e1] p-1"><div className="mt-auto w-full rounded-full bg-[#b0a79e]" style={{height:`${Math.max(8,(weekLoads[i]/maxWeekLoad)*100)}%`}} /></div></button>)}</div><p className="mt-4 text-[10px] text-[#91887f]">Workload uses Glow duration estimates for tasks with due dates.</p><button type="button" onClick={() => setFixOpen(true)} className="mt-4 rounded-full bg-[#3e3934] px-4 py-2.5 text-xs text-white">Rebalance Tasks</button></section> : null}

    {view === 'Kanban' ? <section className="overflow-x-auto rounded-[30px] border border-[#e9e3da] bg-white p-5"><div className="grid min-w-[920px] grid-cols-5 gap-4">{[
      ['Inbox', inbox], ['Ready', openTasks.filter(t => t.status === 'pending' && !blockedTaskIds[t.id] && !inbox.some(i => i.id === t.id)).slice(0, 8)], ['Doing', openTasks.filter(t => t.status === 'in_progress')], ['Waiting', waiting], ['Done', tasks.filter(t => t.status === 'done').slice(0, 8)],
    ].map(([label, items]) => <div key={String(label)} className="rounded-[20px] bg-[#faf8f4] p-3"><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#958c84]">{String(label)}</p><div className="mt-3 space-y-2">{(items as Task[]).map(t => <TaskCard key={t.id} task={t} compact />)}</div></div>)}</div><p className="mt-4 text-[10px] text-[#91887f]">Board reflects real task states. Dragging is not enabled until task-status validation can be preserved reliably on touch devices.</p></section> : null}

    {view === 'Projects' ? <section className="rounded-[30px] border border-[#e9e3da] bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Larger context</p><h2 className="mt-1 font-serif text-3xl">Project-like groups</h2></div><Columns3 size={18} /></div><p className="mt-2 text-xs text-[#8b827a]">These groups are inferred from task wording because the current task table does not yet store a native project relationship.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{grouped.map(([name, items]) => <div key={name} className="rounded-[22px] border border-[#ebe5dc] bg-[#fcfbf7] p-5"><p className="font-serif text-2xl">{name}</p><p className="mt-1 text-xs text-[#91887f]">{items.length} active · next: {items.sort((a,b)=>PRIORITY_SCORE[b.priority]-PRIORITY_SCORE[a.priority])[0]?.title}</p><div className="mt-4 space-y-2">{items.slice(0,3).map(t => <button key={t.id} type="button" onClick={() => setSelected(t)} className="block w-full truncate rounded-full bg-white px-3 py-2 text-left text-[10px]">{t.title}</button>)}</div></div>)}</div></section> : null}

    <section className="grid gap-5 lg:grid-cols-[1fr_.9fr]"><div className="rounded-[28px] border border-[#e9e3da] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#a66f78]"/><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Glow noticed</p></div><p className="mt-3 text-sm leading-6 text-[#655e58]">{overdue.length ? `${overdue.length} task${overdue.length === 1 ? '' : 's'} have been left past their due date. A clearer next step or smaller version may help.` : inbox.some(isVague) ? 'At least one open task is vague enough that it may be hard to start. Clarifying the finish line will make the list lighter.' : blockedTaskIds[doNext?.id ?? ''] ? 'Your highest-ranked task is blocked, so Glow moved actionable work ahead of it.' : 'Your active list has no strong avoidance signal from the data currently stored.'}</p>{overdue[0] ? <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setBreakdownTask(overdue[0])} className="rounded-full bg-[#f2ece5] px-3 py-2 text-[10px]">Break It Down</button><button type="button" onClick={() => scheduleTask(overdue[0])} className="rounded-full border border-[#e5ded5] px-3 py-2 text-[10px]">Schedule Focus Time</button></div> : null}</div><div className="rounded-[28px] border border-[#e9e3da] bg-white p-5 sm:p-6"><p className="text-[10px] uppercase tracking-[.14em] text-[#978e85]">Ask Glow</p><div className="mt-3 flex gap-2"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') askGlow(); }} placeholder="What am I avoiding? What fits before 6?" className="min-w-0 flex-1 rounded-full border border-[#e6dfd6] px-4 py-3 text-xs outline-none"/><button type="button" disabled={asking || !question.trim()} onClick={() => askGlow()} className="rounded-full bg-[#a86b75] px-4 text-xs text-white disabled:opacity-40">{asking ? 'Thinking…' : 'Ask'}</button><button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:voice-open'))} aria-label="Speak to Glow" className="rounded-full border border-[#e6dfd6] p-3"><Mic size={14}/></button></div>{answer ? <p className="mt-4 text-xs leading-6 text-[#756d66]">{answer}</p> : null}</div></section>

    <button type="button" onClick={() => setCommandOpen(true)} aria-label="Open Task command palette" className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#3b3732] text-white shadow-xl sm:bottom-8"><Plus size={19}/></button>

    {notice ? <div role="status" className="fixed bottom-24 left-1/2 z-[190] max-w-[88vw] -translate-x-1/2 rounded-full border border-[#e5ddd5] bg-white px-4 py-2.5 text-center text-[11px] text-[#6e655e] shadow-xl sm:bottom-7">{notice}</div> : null}

    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? 'Task'}>{selected ? <div className="space-y-5"><div className="rounded-[22px] border border-[#e9e3da] bg-[#fffdf9] p-5"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#f4ece8] px-2.5 py-1 text-[9px] text-[#96636b]">{importanceLabel(selected)}</span><span className="rounded-full bg-[#eef2e9] px-2.5 py-1 text-[9px] text-[#63705a]">~{estimateMinutes(selected)}m Glow estimate</span><span className="rounded-full bg-[#f1eef4] px-2.5 py-1 text-[9px] text-[#746c7d]">{inferredContext(selected)} inferred</span></div><h3 className="mt-4 font-serif text-3xl">{selected.title}</h3>{selected.description ? <p className="mt-3 text-xs leading-6 text-[#756e67]">{selected.description}</p> : null}{blockedTaskIds[selected.id]?.length ? <p className="mt-3 rounded-[14px] bg-[#f3eff5] p-3 text-xs text-[#766c7f]">Waiting on {blockedTaskIds[selected.id].join(', ')}</p> : null}</div><div><p className="text-[10px] uppercase tracking-[.14em] text-[#958c84]">Version</p><div className="mt-2 grid grid-cols-3 gap-2">{(['Full','Quick','Minimum'] as Version[]).map(v => <button key={v} type="button" onClick={() => setVersion(v)} className={`rounded-[16px] border p-3 text-left ${version === v ? 'border-[#b87882] bg-[#fff7f7]' : 'border-[#e7e0d8]'}`}><p className="text-xs font-medium">{v}</p><p className="mt-1 text-[10px] text-[#8d847c]">~{versionMinutes(selected,v)}m</p></button>)}</div></div><div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(blockedTaskIds[selected.id]) || isPending} onClick={() => startTask(selected, version)} className="rounded-full bg-[#3d3934] px-4 py-2.5 text-xs text-white disabled:opacity-40">Start Focus</button><button type="button" onClick={() => setBreakdownTask(selected)} className="rounded-full border border-[#e4ddd5] px-4 py-2.5 text-xs">Break It Down</button><button type="button" onClick={() => moveTask(selected, tomorrowAt())} className="rounded-full border border-[#e4ddd5] px-4 py-2.5 text-xs">Tomorrow</button><button type="button" onClick={() => scheduleTask(selected)} className="rounded-full border border-[#e4ddd5] px-4 py-2.5 text-xs">Calendar Block</button><button type="button" onClick={() => setEditing(selected)} className="rounded-full border border-[#e4ddd5] px-4 py-2.5 text-xs">More Details</button><button type="button" onClick={() => markDone(selected)} className="rounded-full bg-[#edf2e8] px-4 py-2.5 text-xs text-[#5e6956]">Done</button></div><div className="grid gap-2 sm:grid-cols-3"><button type="button" onClick={() => patchTask(selected,{priority:'high'},'Marked important.')} className="rounded-[15px] bg-[#faf7f2] p-3 text-left text-[10px]">Importance<br/><b>Important</b></button><button type="button" onClick={() => moveTask(selected,nextSaturday())} className="rounded-[15px] bg-[#faf7f2] p-3 text-left text-[10px]">Date<br/><b>Weekend</b></button><button type="button" onClick={() => patchTask(selected,{dueDate:undefined},'Due date cleared.')} className="rounded-[15px] bg-[#faf7f2] p-3 text-left text-[10px]">Date<br/><b>No date</b></button></div></div> : null}</Dialog>

    <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add task' : 'Edit task'}>{editing ? <TaskForm task={editing === 'new' ? undefined : editing} onSaved={task => { setTasks(current => { const exists = current.some(t => t.id === task.id); return exists ? current.map(t => t.id === task.id ? task : t) : [task, ...current]; }); setEditing(null); }} onCancel={() => setEditing(null)} /> : null}</Dialog>

    <Dialog open={Boolean(breakdownTask)} onClose={() => setBreakdownTask(null)} title="Break It Down">{breakdownTask ? <div className="space-y-4"><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-xs text-[#8d847c]">{breakdownTask.title}</p><ol className="mt-3 space-y-2">{taskSteps(breakdownTask).map((step,i) => <li key={step} className="flex gap-3 text-sm"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px]">{i+1}</span><span>{step}</span></li>)}</ol></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => { startTask(breakdownTask,'Minimum'); setBreakdownTask(null); }} className="rounded-full bg-[#3e3934] px-4 py-2.5 text-xs text-white">Start Step 1</button><button type="button" onClick={() => { setTimeFit(15); startTask(breakdownTask,'Quick'); setBreakdownTask(null); }} className="rounded-full border border-[#e2dbd2] px-4 py-2.5 text-xs">Do 15-Min Version</button><button type="button" onClick={() => { scheduleTask(breakdownTask, tomorrowAt(17)); setBreakdownTask(null); }} className="rounded-full border border-[#e2dbd2] px-4 py-2.5 text-xs">Schedule the Rest</button></div><p className="text-[10px] leading-5 text-[#91887f]">These steps are generated from task wording. The original task remains the parent source of truth.</p></div> : null}</Dialog>

    <Dialog open={fixOpen} onClose={() => setFixOpen(false)} title="Fix My Tasks"><div className="space-y-4"><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#958c84]">Capacity</p><p className="mt-2 font-serif text-3xl">{overBy ? `${overBy}m over` : 'Fits right now'}</p></div><p className="text-sm leading-6 text-[#6f6760]">Glow will protect urgent/high-importance work and move lower-priority flexible tasks to tomorrow until the estimated task load better matches the current calendar opening.</p><button type="button" disabled={!overBy || isPending} onClick={applyFix} className="w-full rounded-full bg-[#3d3934] py-3 text-sm text-white disabled:opacity-40">Apply Fix</button><p className="text-[10px] leading-5 text-[#91887f]">This changes task due dates. It does not silently move fixed calendar events.</p></div></Dialog>

    <Dialog open={easierOpen} onClose={() => setEasierOpen(false)} title="Make Today Easier"><div className="space-y-4"><p className="text-sm leading-6 text-[#6f6760]">This is more aggressive than Fix My Tasks. Glow keeps up to three urgent/high-priority actions, moves lower-priority work to tomorrow, and switches this page to Low Energy + 15-minute filtering.</p><div className="grid grid-cols-2 gap-3"><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[10px] text-[#958c84]">Before</p><p className="mt-1 font-serif text-2xl">{todayTasks.length} actions</p></div><div className="rounded-[18px] bg-[#eef2e9] p-4"><p className="text-[10px] text-[#75806d]">After</p><p className="mt-1 font-serif text-2xl">{Math.min(3,todayTasks.filter(t => t.priority === 'urgent' || t.priority === 'high').length)} core actions</p></div></div><button type="button" disabled={isPending} onClick={applyEasier} className="w-full rounded-full bg-[#a66d75] py-3 text-sm text-white disabled:opacity-40">Apply Easier Day</button></div></Dialog>

    <Dialog open={commandOpen} onClose={() => setCommandOpen(false)} title="Task commands"><div className="grid gap-2 sm:grid-cols-2">{[
      ['Add task',()=>setEditing('new')],['Speak task',()=>document.dispatchEvent(new CustomEvent('glow:voice-open'))],['Add reminder',()=>window.location.assign('/reminders')],['Create batch',()=>fitting[0]&&startTask(fitting[0])],['Start focus',()=>doNext&&startTask(doNext)],['Find something to do',()=>setView('Today')],['Triage inbox',()=>inbox[0]&&setSelected(inbox[0])],['Ask Glow',()=>askGlow('Help me simplify and prioritize my tasks today.')],
    ].map(([label,handler]) => <button key={String(label)} type="button" onClick={() => { (handler as ()=>void)(); setCommandOpen(false); }} className="rounded-[16px] border border-[#e7e0d8] bg-[#faf7f2] p-4 text-left text-sm">{String(label)}</button>)}</div></Dialog>

    {executionTask ? <div className="fixed inset-0 z-[220] overflow-y-auto bg-[radial-gradient(circle_at_top,#f4eee5,#fbfaf6_48%,#eeeae5)] p-5 sm:p-10"><button type="button" onClick={() => { setRunning(false); setExecutionTask(null); }} aria-label="Close execution mode" className="fixed right-5 top-5 rounded-full bg-white/80 p-3 shadow"><X size={17}/></button><div className="mx-auto flex min-h-[85vh] max-w-3xl flex-col justify-center"><p className="text-center text-[10px] uppercase tracking-[.2em] text-[#988f86]">Execution Mode · {version}</p><h2 className="mt-4 text-center font-serif text-4xl sm:text-6xl">{executionTask.title}</h2><p className="mt-6 text-center font-serif text-6xl tabular-nums text-[#514a44]">{String(Math.floor(executionSeconds/60)).padStart(2,'0')}:{String(executionSeconds%60).padStart(2,'0')}</p><div className="mx-auto mt-8 w-full max-w-xl rounded-[26px] border border-white/90 bg-white/70 p-6 text-center shadow-sm"><p className="text-[10px] uppercase tracking-[.14em] text-[#958c84]">Current step</p><p className="mt-3 text-xl">{taskSteps(executionTask)[executionStep]}</p></div><div className="mt-8 flex flex-wrap justify-center gap-2"><button type="button" onClick={() => markDone(executionTask)} className="rounded-full bg-[#3d3934] px-5 py-3 text-sm text-white"><Check size={14} className="mr-1 inline"/>Done</button><button type="button" onClick={() => setRunning(v => !v)} className="rounded-full border border-[#ddd5cc] bg-white px-5 py-3 text-sm">{running ? <Pause size={14} className="mr-1 inline"/> : <Play size={14} className="mr-1 inline"/>}{running ? 'Pause' : 'Resume'}</button><button type="button" onClick={() => setExecutionStep(i => Math.min(taskSteps(executionTask).length-1,i+1))} className="rounded-full border border-[#ddd5cc] bg-white px-5 py-3 text-sm">Skip Step</button><button type="button" onClick={() => askGlow(`I am working on ${executionTask.title}. Help me with the current step: ${taskSteps(executionTask)[executionStep]}`)} className="rounded-full border border-[#ddd5cc] bg-white px-5 py-3 text-sm">Ask Glow</button><button type="button" onClick={() => { setRunning(false); setExecutionStep(0); setNotice('Make it smaller: only do the first concrete step right now.'); }} className="rounded-full border border-[#ddd5cc] bg-white px-5 py-3 text-sm">I’m Stuck</button></div><div className="mt-7 flex justify-center gap-2"><button type="button" disabled={executionStep===0} onClick={()=>setExecutionStep(i=>Math.max(0,i-1))} className="text-xs text-[#817970] disabled:opacity-30">Previous step</button><span className="text-xs text-[#aaa198]">·</span><button type="button" disabled={executionStep>=taskSteps(executionTask).length-1} onClick={()=>setExecutionStep(i=>Math.min(taskSteps(executionTask).length-1,i+1))} className="text-xs text-[#817970] disabled:opacity-30">Next step</button></div></div></div> : null}
  </div>;
}
