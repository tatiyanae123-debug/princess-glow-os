'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  GripVertical,
  Layers3,
  Mic2,
  MoonStar,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  SunMedium,
  Trash2,
  WandSparkles,
} from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { RoutineForm } from '@/components/routines/routine-form';
import { RoutineStepPlayer } from '@/components/routines/routine-step-player';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteRoutineAction, createRoutineStepAction, deleteRoutineStepAction } from '@/app/actions/routines';
import type { Routine, RoutineStep } from '@/lib/types';

type RoutineMode = 'full' | 'normal' | 'quick' | 'minimum';

const TIME_ICON: Record<string, typeof SunMedium> = {
  morning: SunMedium,
  afternoon: SunMedium,
  evening: MoonStar,
  night: MoonStar,
  anytime: RefreshCw,
};
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const FLOW = [
  { key: 'morning', label: 'Morning', time: '5 AM', icon: '🌅' },
  { key: 'afternoon', label: 'Midday', time: '10 AM', icon: '☀️' },
  { key: 'evening', label: 'Evening', time: '4 PM', icon: '🌸' },
  { key: 'night', label: 'Night', time: '8:30 PM', icon: '🌙' },
];

function stepDuration(step: RoutineStep) {
  return Math.max(1, step.durationMinutes ?? 5);
}

function timeBand(hour: number) {
  if (hour < 10) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 20.5) return 'evening';
  return 'night';
}

export function RoutinesExperience({ initialRoutines, initialSteps }: { initialRoutines: Routine[]; initialSteps: RoutineStep[] }) {
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [steps, setSteps] = useState<RoutineStep[]>(initialSteps);
  const [dialogRoutine, setDialogRoutine] = useState<Routine | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Routine | null>(null);
  const [playerMode, setPlayerMode] = useState<RoutineMode>('full');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [energy, setEnergy] = useState<'full' | 'normal' | 'quick' | 'minimum'>('normal');
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [temporaryOrder, setTemporaryOrder] = useState<Record<string, string[]>>({});
  const del = useServerAction((id: string) => deleteRoutineAction(id));
  const addStep = useServerAction(createRoutineStepAction);
  const removeStep = useServerAction((id: string) => deleteRoutineStepAction(id));

  const stepsByRoutine = useMemo(() => {
    const map = new Map<string, RoutineStep[]>();
    for (const step of steps) {
      const list = map.get(step.routineId) ?? [];
      list.push(step);
      map.set(step.routineId, list);
    }
    for (const [routineId, list] of map.entries()) {
      list.sort((a, b) => a.order - b.order);
      const order = temporaryOrder[routineId];
      if (order?.length) {
        list.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
      }
    }
    return map;
  }, [steps, temporaryOrder]);

  function durationFor(routine: Routine) {
    const routineSteps = stepsByRoutine.get(routine.id) ?? [];
    return routineSteps.reduce((sum, step) => sum + stepDuration(step), 0) || routineSteps.length * 5;
  }

  const now = new Date();
  const currentBand = timeBand(now.getHours() + now.getMinutes() / 60);
  const todayName = WEEKDAYS[now.getDay()];
  const todaysRoutines = routines.filter((routine) => !routine.daysOfWeek?.length || routine.daysOfWeek.includes(todayName));
  const rightNow = todaysRoutines.find((routine) => routine.timeOfDay === currentBand) ?? todaysRoutines[0] ?? routines[0] ?? null;
  const rightNowSteps = rightNow ? stepsByRoutine.get(rightNow.id) ?? [] : [];
  const featured = routines.slice(0, 6);
  const more = routines.slice(6);

  const stacks = useMemo(() => {
    const names = routines.map((routine) => routine.name.toLowerCase());
    const pick = (patterns: RegExp[]) => routines.filter((routine) => patterns.some((pattern) => pattern.test(routine.name.toLowerCase()))).slice(0, 7);
    const sunday = pick([/reset/, /laundry/, /meal/, /hair/, /beauty/, /planning/, /night/]);
    const workday = pick([/morning/, /work/, /getting ready/, /night/]);
    const wellness = pick([/wellness/, /fitness/, /recovery/, /walk/, /movement/]);
    return [
      { name: 'Sunday Reset', icon: '🏠', routines: sunday.length ? sunday : routines.slice(0, Math.min(5, routines.length)) },
      { name: 'Workday', icon: '✨', routines: workday.length ? workday : routines.slice(0, Math.min(4, routines.length)) },
      { name: 'Wellness', icon: '🌿', routines: wellness.length ? wellness : routines.slice(0, Math.min(4, routines.length)) },
    ].filter((stack) => stack.routines.length > 0 && names.length > 0);
  }, [routines]);

  function handleSaved(routine: Routine) {
    setRoutines((current) => current.some((item) => item.id === routine.id) ? current.map((item) => item.id === routine.id ? routine : item) : [routine, ...current]);
    setDialogRoutine(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setRoutines((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  function handleAddStep(routine: Routine) {
    if (!newStepTitle.trim()) return;
    const order = stepsByRoutine.get(routine.id)?.length ?? 0;
    addStep.run({ routineId: routine.id, title: newStepTitle.trim(), order }, (saved) => {
      setSteps((current) => [...current, saved]);
      setNewStepTitle('');
    });
  }

  function handleRemoveStep(step: RoutineStep) {
    removeStep.run(step.id, () => setSteps((current) => current.filter((item) => item.id !== step.id)));
  }

  function moveStep(routineId: string, stepId: string, direction: -1 | 1) {
    const list = stepsByRoutine.get(routineId) ?? [];
    const ids = list.map((item) => item.id);
    const index = ids.indexOf(stepId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setTemporaryOrder((current) => ({ ...current, [routineId]: ids }));
  }

  function startRoutine(routine: Routine, mode: RoutineMode = energy) {
    setPlayerMode(mode);
    setPlaying(routine);
  }

  function askGlow() {
    const value = assistantInput.trim().toLowerCase();
    if (!value) return;
    let mode: RoutineMode = energy;
    if (/exhaust|tired|minimum|bare minimum/.test(value)) mode = 'minimum';
    else if (/quick|15|20 minute/.test(value)) mode = 'quick';
    else if (/full|everything/.test(value)) mode = 'full';
    setEnergy(mode);
    const routine = rightNow;
    if (!routine) {
      setAssistantReply('Create your first routine and Glow will build a right-now plan from it.');
      return;
    }
    const list = stepsByRoutine.get(routine.id) ?? [];
    const take = mode === 'minimum' ? 3 : mode === 'quick' ? 5 : Math.min(7, list.length);
    const plan = list.slice(0, take).map((step, index) => `${index + 1}. ${step.title} · ${stepDuration(step)} min`).join('  •  ');
    setAssistantReply(`${routine.name} is the best match for right now. ${mode === 'minimum' ? 'I shortened it to the essentials.' : mode === 'quick' ? 'I made it a quick version.' : 'I kept the fuller flow.'} ${plan || 'Add steps to this routine so I can guide you through it.'}`);
  }

  const readiness = rightNowSteps.length ? [
    { label: 'Routine steps loaded', ok: true },
    { label: 'Time window matches now', ok: rightNow?.timeOfDay === currentBand || rightNow?.timeOfDay === 'anytime' },
    { label: 'Estimated time available', ok: durationFor(rightNow as Routine) <= 90 },
  ] : [];

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-[28px] border border-[#F1E7E3]">
        <EditableRoomImage slot="routines:hero" label="Routines hero" className="min-h-[290px] sm:min-h-[330px]">
          <div className="relative z-10 flex h-full items-end bg-[linear-gradient(0deg,rgba(30,22,22,.68),rgba(30,22,22,.06)_70%)] p-6 sm:p-8">
            <div className="grid w-full gap-5 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
              <div className="max-w-xl text-white">
                <p className="text-[9px] font-semibold uppercase tracking-[.2em] text-white/70">Right Now</p>
                <h1 className="glow-display mt-2 text-[38px] leading-none sm:text-[48px]">{rightNow ? rightNow.name : 'Routines'}</h1>
                <p className="mt-3 max-w-md text-[12.5px] leading-5 text-white/80">{rightNow ? `${durationFor(rightNow)} min · ${rightNowSteps.length} steps · ${currentBand} flow` : 'Build routines that Glow can actively guide, shorten, reorder, and adapt.'}</p>
                {rightNowSteps.length ? <p className="mt-2 text-[11px] text-white/75">Next: {rightNowSteps[0]?.title}{rightNowSteps[1] ? ` → ${rightNowSteps[1].title}` : ''}</p> : null}
                <div className="mt-5 flex flex-wrap gap-2">
                  {rightNow ? <button type="button" onClick={() => startRoutine(rightNow)} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[12px] font-semibold text-[#3b302c]"><Play size={14} />Start / Continue</button> : null}
                  <button type="button" onClick={() => setAssistantInput('What should I do right now?')} className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-3 text-[12px] font-medium text-white backdrop-blur"><Mic2 size={14} />Talk to Glow</button>
                  <button type="button" onClick={() => setEnergy((current) => current === 'full' ? 'normal' : current === 'normal' ? 'quick' : current === 'quick' ? 'minimum' : 'full')} className="rounded-full border border-white/35 bg-white/10 px-4 py-3 text-[12px] font-medium text-white backdrop-blur">Adjust Today · {energy}</button>
                </div>
              </div>
              <div className="rounded-[22px] border border-white/20 bg-white/12 p-4 text-white backdrop-blur-md">
                <div className="flex items-center gap-2"><Sparkles size={14} /><span className="text-[10px] font-semibold uppercase tracking-[.14em]">Glow says</span></div>
                <p className="mt-2 text-[12px] leading-5 text-white/85">{rightNow ? `You’re in your ${currentBand} window. Start with ${rightNowSteps[0]?.title ?? 'the first step'}, and I can shorten the rest if your energy changes.` : 'Create a routine and I’ll automatically surface the right one for the current moment.'}</p>
              </div>
            </div>
          </div>
        </EditableRoomImage>
      </section>

      <section className="rounded-[24px] border border-[#F1E7E3] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Today’s Flow</p><h2 className="glow-display mt-1 text-[22px] text-[#2B2420]">Daily Routine Timeline</h2></div><span className="rounded-full bg-[#fbe4e8] px-3 py-1.5 text-[10px] font-medium text-[#8c4e59]">You are here · {currentBand}</span></div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {FLOW.map((item) => {
            const active = item.key === currentBand;
            return <div key={item.key} className={`rounded-2xl border p-3 text-center ${active ? 'border-[#c9727e] bg-[#fff5f6]' : 'border-[#f0e7e2] bg-[#fcfaf8]'}`}><div className="text-[22px]">{item.icon}</div><p className="mt-1 text-[11px] font-semibold text-[#3d342f]">{item.label}</p><p className="text-[9.5px] text-[#9a8f87]">{item.time}</p>{active ? <p className="mt-2 text-[9px] font-bold uppercase tracking-[.1em] text-[#c9727e]">Now</p> : null}</div>;
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-[#F1E7E3] bg-[#fffaf8] p-4 sm:p-5">
        <div className="flex items-center gap-2"><WandSparkles size={15} className="text-[#c9727e]" /><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">What should I do?</p><h2 className="glow-display text-[21px] text-[#2B2420]">Ask Glow about your routine</h2></div></div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') askGlow(); }} placeholder="Try: It’s Wednesday night, what should I do?" className="min-w-0 flex-1 rounded-2xl border border-[#eaded8] bg-white px-4 py-3 text-[12px] text-[#3b332e]" /><button type="button" onClick={askGlow} className="rounded-2xl bg-[#2B2420] px-5 py-3 text-[12px] font-semibold text-white">Build my plan</button></div>
        {assistantReply ? <div aria-live="polite" className="mt-3 rounded-2xl border border-[#f0d9de] bg-white p-4 text-[11.5px] leading-5 text-[#6c5d58]">{assistantReply}{rightNow ? <button type="button" onClick={() => startRoutine(rightNow, energy)} className="mt-3 flex items-center gap-1.5 rounded-full bg-[#fbe4e8] px-3 py-2 text-[10.5px] font-semibold text-[#8a4b56]"><Play size={11} />Start this plan</button> : null}</div> : null}
      </section>

      <section>
        <div className="flex items-end justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Routine Stacks</p><h2 className="glow-display mt-1 text-[24px] text-[#2B2420]">Connected flows</h2></div><Layers3 size={17} className="text-[#c9727e]" /></div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {stacks.map((stack) => <div key={stack.name} className="rounded-[22px] border border-[#F1E7E3] bg-white p-4"><div className="flex items-center justify-between"><div><span className="text-[20px]">{stack.icon}</span><p className="mt-2 text-[13px] font-semibold text-[#2B2420]">{stack.name}</p></div><span className="text-[9.5px] text-[#9b9089]">{stack.routines.length} routines</span></div><div className="mt-4 space-y-1.5">{stack.routines.map((routine, index) => <div key={routine.id} className="flex items-center gap-2 text-[11px] text-[#5f554f]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fbe4e8] text-[9px] font-semibold text-[#a75f6b]">{index + 1}</span><span className="min-w-0 flex-1 truncate">{routine.name}</span>{index < stack.routines.length - 1 ? <ArrowDown size={10} className="text-[#c7bbb4]" /> : null}</div>)}</div>{stack.routines[0] ? <button type="button" onClick={() => startRoutine(stack.routines[0])} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#2B2420] px-3 py-2 text-[10.5px] font-medium text-white"><Play size={11} />Start stack</button> : null}</div>)}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">My Routines</p><h2 className="glow-display mt-1 text-[24px] text-[#2B2420]">Visual routine library</h2></div><button type="button" onClick={() => setDialogRoutine('new')} className="inline-flex items-center gap-1.5 rounded-full bg-[#c9727e] px-4 py-2.5 text-[11px] font-medium text-white"><Plus size={13} />Create routine</button></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((routine, cardIndex) => {
            const routineSteps = stepsByRoutine.get(routine.id) ?? [];
            const isOpen = expanded === routine.id;
            const Icon = TIME_ICON[routine.timeOfDay] ?? RefreshCw;
            const visual = ['🌅', '🌿', '🪞', '🎀', '🌙', '🏠'][cardIndex % 6];
            return <article key={routine.id} className="overflow-hidden rounded-[24px] border border-[#F1E7E3] bg-white"><div className="bg-[linear-gradient(135deg,#fff8f6,#f7ece9)] p-5"><div className="flex items-start justify-between gap-3"><div><div className="text-[28px]">{visual}</div><p className="mt-2 text-[14px] font-semibold text-[#2B2420]">{routine.name}</p><p className="mt-1 text-[10.5px] capitalize text-[#8d8179]">{routine.timeOfDay} · {routineSteps.length} steps · ~{durationFor(routine)} min</p></div><span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#c9727e]"><Icon size={15} /></span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#c9727e]" style={{ width: `${Math.min(92, 45 + cardIndex * 8)}%` }} /></div><p className="mt-2 text-[9.5px] text-[#9d9189]">Adaptive mode ready · image replaceable</p></div><div className="flex flex-wrap gap-2 p-4"><button type="button" onClick={() => startRoutine(routine)} className="inline-flex items-center gap-1.5 rounded-full bg-[#2B2420] px-3 py-2 text-[10.5px] font-medium text-white"><Play size={11} />Start</button><button type="button" onClick={() => setExpanded(isOpen ? null : routine.id)} className="rounded-full border border-[#eaded8] px-3 py-2 text-[10.5px] text-[#665b55]">{isOpen ? 'Hide steps' : 'Steps'}</button><button type="button" onClick={() => setDialogRoutine(routine)} className="rounded-full border border-[#eaded8] p-2 text-[#766a64]" aria-label="Edit routine"><Pencil size={12} /></button><button type="button" onClick={() => setDeleteTarget(routine)} className="rounded-full border border-[#eaded8] p-2 text-[#766a64]" aria-label="Delete routine"><Trash2 size={12} /></button></div>{isOpen ? <div className="border-t border-[#F1E7E3] bg-[#fdfaf8] p-4"><ol className="space-y-2">{routineSteps.map((step, index) => <li key={step.id} className="flex items-center gap-2 rounded-xl bg-white p-2.5"><GripVertical size={12} className="text-[#c0b5ae]" /><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fbe4e8] text-[9px] font-semibold text-[#a65d69]">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-[11.5px] text-[#3f3732]">{step.title}</p><p className="text-[9px] text-[#9b9089]">{stepDuration(step)} min</p></div><button type="button" onClick={() => moveStep(routine.id, step.id, -1)} className="rounded p-1 text-[#9b9089]" aria-label="Move step earlier">↑</button><button type="button" onClick={() => moveStep(routine.id, step.id, 1)} className="rounded p-1 text-[#9b9089]" aria-label="Move step later">↓</button><button type="button" onClick={() => handleRemoveStep(step)} className="rounded p-1 text-[#b8ada6]" aria-label="Remove step"><Trash2 size={10} /></button></li>)}</ol><div className="mt-3 flex gap-2"><input value={newStepTitle} onChange={(event) => setNewStepTitle(event.target.value)} placeholder="Add intelligent step" className="min-w-0 flex-1 rounded-xl border border-[#eaded8] bg-white px-3 py-2 text-[11px]" /><button type="button" onClick={() => handleAddStep(routine)} className="rounded-xl bg-[#2B2420] px-3 py-2 text-[10.5px] text-white">Add</button></div>{temporaryOrder[routine.id] ? <p className="mt-2 text-[9.5px] text-[#a06a73]">Reordered for today. Permanent ordering can be saved from the routine editor.</p> : null}</div> : null}</article>;
          })}
        </div>
        {more.length ? <div className="mt-3 flex flex-wrap gap-2">{more.map((routine) => <button key={routine.id} type="button" onClick={() => setExpanded(routine.id)} className="rounded-full border border-[#eaded8] bg-white px-3 py-2 text-[10.5px] text-[#665b55]">{routine.name}</button>)}</div> : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><Check size={14} className="text-[#c9727e]" /><div><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[#b66d78]">Routine Readiness</p><h2 className="glow-display text-[20px] text-[#2B2420]">Before you start</h2></div></div><div className="mt-4 space-y-2">{readiness.length ? readiness.map((item) => <div key={item.label} className="flex items-center justify-between rounded-xl bg-[#fcfaf8] px-3 py-2.5 text-[11px] text-[#5e544e]"><span>{item.label}</span><span className={item.ok ? 'text-[#6f8c6d]' : 'text-[#b07070]'}>{item.ok ? '✓ Ready' : '⚠ Check'}</span></div>) : <p className="text-[11px] text-[#90857e]">Add routine steps to unlock readiness checks.</p>}</div></div>
        <div className="rounded-[22px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#c9727e]" /><div><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[#b66d78]">Glow noticed</p><h2 className="glow-display text-[20px] text-[#2B2420]">Routine insights</h2></div></div><div className="mt-4 space-y-2 text-[11px] leading-5 text-[#675c56]"><p className="rounded-xl bg-[#fcfaf8] p-3">Your {currentBand} routines are surfaced first so you don’t have to hunt through the library.</p><p className="rounded-xl bg-[#fcfaf8] p-3">Quick and Minimum modes automatically reduce the current routine when time or energy is low.</p><p className="rounded-xl bg-[#fcfaf8] p-3">Temporary reordering keeps today flexible without changing the permanent routine.</p></div></div>
      </section>

      <section className="rounded-[24px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Routine Builder</p><h2 className="glow-display text-[22px] text-[#2B2420]">Build visually, not in a boring form</h2></div><button type="button" onClick={() => setDialogRoutine('new')} className="inline-flex items-center gap-1.5 rounded-full bg-[#fbe4e8] px-3 py-2 text-[10.5px] font-semibold text-[#8c4e59]"><Plus size={11} />New routine</button></div><div className="mt-4 flex flex-wrap items-center gap-2">{['Wake up', 'Water', 'Medication', 'Skincare', 'Breakfast', 'Calendar review', 'Top 3', 'Get dressed'].map((label, index) => <div key={label} className="flex items-center gap-2"><span className="rounded-xl border border-[#eaded8] bg-[#fcfaf8] px-3 py-2 text-[10.5px] text-[#5f554f]">{label}</span>{index < 7 ? <ChevronRight size={11} className="text-[#c5bab3]" /> : null}</div>)}</div><p className="mt-3 text-[10.5px] leading-5 text-[#958981]">Use Create Routine, then add, reorder, time, and guide each step. The Routine Player turns the saved structure into a one-step-at-a-time experience.</p></section>

      <Dialog open={dialogRoutine !== null} onClose={() => setDialogRoutine(null)} title={dialogRoutine === 'new' ? 'Add routine' : 'Edit routine'}>
        <RoutineForm routine={dialogRoutine === 'new' ? null : dialogRoutine} onSaved={handleSaved} onCancel={() => setDialogRoutine(null)} />
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this routine?" description={deleteTarget ? `“${deleteTarget.name}” will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
      {playing ? <RoutineStepPlayer routine={playing} steps={stepsByRoutine.get(playing.id) ?? []} initialMode={playerMode} onClose={() => setPlaying(null)} /> : null}
    </div>
  );
}
