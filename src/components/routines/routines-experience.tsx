'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  ArrowDown,
  Check,
  ChevronRight,
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
import {
  createRoutineStepAction,
  deleteRoutineAction,
  deleteRoutineStepAction,
  updateRoutineStepAction,
} from '@/app/actions/routines';
import type { Routine, RoutineStep } from '@/lib/types';

type RoutineMode = 'full' | 'normal' | 'quick' | 'minimum';
type Energy = 'high' | 'normal' | 'low' | 'exhausted';

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
const TIME_OPTIONS = [5, 10, 20, 45, 90];

function stepDuration(step: RoutineStep) {
  return Math.max(1, step.durationMinutes ?? 5);
}

function timeBand(date: Date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < 10) return 'morning';
  if (hour < 16) return 'afternoon';
  if (hour < 20.5) return 'evening';
  return 'night';
}

function modeFor(energy: Energy, minutes: number): RoutineMode {
  if (energy === 'exhausted' || minutes <= 10) return 'minimum';
  if (energy === 'low' || minutes <= 20) return 'quick';
  if (energy === 'high' && minutes >= 45) return 'full';
  return 'normal';
}

function modeLimit(mode: RoutineMode) {
  if (mode === 'minimum') return 10;
  if (mode === 'quick') return 20;
  if (mode === 'normal') return 40;
  return Number.POSITIVE_INFINITY;
}

function fitSteps(list: RoutineStep[], mode: RoutineMode, availableMinutes: number) {
  if (!list.length) return [];
  const hardLimit = Math.min(modeLimit(mode), availableMinutes);
  if (!Number.isFinite(hardLimit)) return list;
  const essential = /med|medicine|brush|teeth|skincare|water|alarm|tomorrow|essential|shower/i;
  const ordered = [...list.filter((step) => essential.test(`${step.title} ${step.notes ?? ''}`)), ...list.filter((step) => !essential.test(`${step.title} ${step.notes ?? ''}`))];
  const picked: RoutineStep[] = [];
  let used = 0;
  for (const step of ordered) {
    const duration = stepDuration(step);
    if (picked.length && used + duration > hardLimit) continue;
    picked.push(step);
    used += duration;
    if (used >= hardLimit) break;
  }
  return picked.length ? picked : list.slice(0, 1);
}

export function RoutinesExperience({ initialRoutines, initialSteps }: { initialRoutines: Routine[]; initialSteps: RoutineStep[] }) {
  const [routines, setRoutines] = useState(initialRoutines);
  const [steps, setSteps] = useState(initialSteps);
  const [dialogRoutine, setDialogRoutine] = useState<Routine | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Routine | null>(null);
  const [playerMode, setPlayerMode] = useState<RoutineMode>('normal');
  const [newStepTitle, setNewStepTitle] = useState<Record<string, string>>({});
  const [energy, setEnergy] = useState<Energy>('normal');
  const [availableMinutes, setAvailableMinutes] = useState(20);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [reordering, startReorder] = useTransition();
  const del = useServerAction((id: string) => deleteRoutineAction(id));
  const addStep = useServerAction(createRoutineStepAction);
  const removeStep = useServerAction((id: string) => deleteRoutineStepAction(id));

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(id);
  }, [notice]);

  const stepsByRoutine = useMemo(() => {
    const map = new Map<string, RoutineStep[]>();
    for (const step of steps) {
      const list = map.get(step.routineId) ?? [];
      list.push(step);
      map.set(step.routineId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [steps]);

  function durationFor(routine: Routine) {
    return (stepsByRoutine.get(routine.id) ?? []).reduce((sum, step) => sum + stepDuration(step), 0);
  }

  const currentBand = timeBand(now);
  const todayName = WEEKDAYS[now.getDay()];
  const todayRoutines = routines.filter((routine) => !routine.daysOfWeek?.length || routine.daysOfWeek.includes(todayName));
  const adaptiveMode = modeFor(energy, availableMinutes);
  const rankedToday = [...todayRoutines].sort((a, b) => {
    const aBand = a.timeOfDay === currentBand ? 0 : a.timeOfDay === 'anytime' ? 1 : 2;
    const bBand = b.timeOfDay === currentBand ? 0 : b.timeOfDay === 'anytime' ? 1 : 2;
    if (aBand !== bBand) return aBand - bBand;
    return durationFor(a) - durationFor(b);
  });
  const rightNow = rankedToday[0] ?? routines[0] ?? null;
  const rightNowSteps = rightNow ? stepsByRoutine.get(rightNow.id) ?? [] : [];
  const recommendedSteps = fitSteps(rightNowSteps, adaptiveMode, availableMinutes);
  const recommendedMinutes = recommendedSteps.reduce((sum, step) => sum + stepDuration(step), 0);

  const stacks = useMemo(() => {
    const pick = (patterns: RegExp[]) => routines.filter((routine) => patterns.some((pattern) => pattern.test(routine.name.toLowerCase()))).slice(0, 6);
    return [
      { name: 'Sunday Reset', icon: '🏠', routines: pick([/reset/, /laundry/, /meal/, /hair/, /beauty/, /planning/]) },
      { name: 'Getting Ready', icon: '🪞', routines: pick([/getting ready/, /morning/, /beauty/, /hair/, /work/]) },
      { name: 'Wellness', icon: '🌿', routines: pick([/wellness/, /fitness/, /recovery/, /walk/, /movement/]) },
    ].filter((stack) => stack.routines.length);
  }, [routines]);

  function handleSaved(routine: Routine) {
    setRoutines((current) => current.some((item) => item.id === routine.id) ? current.map((item) => item.id === routine.id ? routine : item) : [routine, ...current]);
    setDialogRoutine(null);
    setNotice('Routine saved. Connected Glow surfaces are refreshing.');
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setRoutines((current) => current.filter((item) => item.id !== deleteTarget.id));
      setSteps((current) => current.filter((item) => item.routineId !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice('Routine deleted.');
    });
  }

  function handleAddStep(routine: Routine) {
    const title = (newStepTitle[routine.id] ?? '').trim();
    if (!title || addStep.isPending) return;
    const order = stepsByRoutine.get(routine.id)?.length ?? 0;
    addStep.run({ routineId: routine.id, title, order }, (saved) => {
      setSteps((current) => [...current, saved]);
      setNewStepTitle((current) => ({ ...current, [routine.id]: '' }));
      setNotice('Step added.');
    });
  }

  function handleRemoveStep(step: RoutineStep) {
    removeStep.run(step.id, () => {
      setSteps((current) => current.filter((item) => item.id !== step.id).map((item) => item.routineId === step.routineId && item.order > step.order ? { ...item, order: item.order - 1 } : item));
      setNotice('Step removed.');
    });
  }

  function moveStep(routineId: string, stepId: string, direction: -1 | 1) {
    if (reordering) return;
    const list = [...(stepsByRoutine.get(routineId) ?? [])];
    const index = list.findIndex((item) => item.id === stepId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    const next = list.map((item, order) => ({ ...item, order }));
    setSteps((current) => current.map((item) => next.find((updated) => updated.id === item.id) ?? item));
    startReorder(async () => {
      const results = await Promise.all(next.map((item) => updateRoutineStepAction(item.id, { order: item.order })));
      if (results.some((result) => !result.data)) {
        setSteps((current) => current.map((item) => {
          const original = (stepsByRoutine.get(routineId) ?? []).find((old) => old.id === item.id);
          return original ?? item;
        }));
        setNotice('Glow could not save the new step order. The previous order was restored.');
        return;
      }
      setNotice('Step order saved permanently.');
    });
  }

  function startRoutine(routine: Routine, mode: RoutineMode = adaptiveMode) {
    setPlayerMode(mode);
    setPlaying(routine);
  }

  function askGlow() {
    const value = assistantInput.trim().toLowerCase();
    if (!value) return;
    let nextEnergy = energy;
    let nextMinutes = availableMinutes;
    if (/exhaust|bare minimum|no energy/.test(value)) nextEnergy = 'exhausted';
    else if (/tired|low energy/.test(value)) nextEnergy = 'low';
    else if (/high energy|lots of energy/.test(value)) nextEnergy = 'high';
    const minuteMatch = value.match(/(5|10|15|20|30|45|60|90)\s*(?:min|minute)/);
    if (minuteMatch) nextMinutes = Math.max(5, Number(minuteMatch[1]));
    setEnergy(nextEnergy);
    setAvailableMinutes(nextMinutes);
    const mode = modeFor(nextEnergy, nextMinutes);
    if (!rightNow) {
      setAssistantReply('Create your first routine and Glow will build a right-now sequence from it.');
      return;
    }
    const chosen = fitSteps(rightNowSteps, mode, nextMinutes);
    const used = chosen.reduce((sum, step) => sum + stepDuration(step), 0);
    const plan = chosen.slice(0, 6).map((step, index) => `${index + 1}. ${step.title}`).join(' · ');
    setAssistantReply(`${rightNow.name} is the strongest match for this ${currentBand} window. I’d use the ${mode} version: ${chosen.length} step${chosen.length === 1 ? '' : 's'}, about ${used} min. ${plan || 'Add steps so Glow can guide the routine.'}`);
  }

  return <div className="mx-auto max-w-[1380px] space-y-7 pb-24">
    <section className="relative overflow-hidden rounded-[32px] border border-[#F1E7E3]">
      <EditableRoomImage slot="routines:hero" label="Routines hero" className="min-h-[340px] sm:min-h-[380px]">
        <div className="relative z-10 flex h-full items-end bg-[linear-gradient(0deg,rgba(32,24,22,.72),rgba(32,24,22,.08)_72%)] p-6 sm:p-9">
          <div className="grid w-full gap-6 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div className="max-w-2xl text-white"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/70">Routines Right Now · {now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p><h1 className="glow-display mt-2 text-[42px] leading-none sm:text-[54px]">{rightNow?.name ?? 'Your guided rhythm'}</h1><p className="mt-3 max-w-xl text-[13px] leading-6 text-white/82">{rightNow ? `${adaptiveMode} version · ${recommendedSteps.length} recommended steps · ~${recommendedMinutes} min` : 'Build routines that adapt to the time, your energy, and how much space you actually have.'}</p>{recommendedSteps.length ? <p className="mt-2 text-[11px] text-white/75">Start with {recommendedSteps[0]?.title}{recommendedSteps[1] ? ` → then ${recommendedSteps[1].title}` : ''}</p> : null}<div className="mt-5 flex flex-wrap gap-2">{rightNow ? <button type="button" onClick={() => startRoutine(rightNow)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[12px] font-semibold text-[#3b302c]"><Play size={14}/>Start Recommended</button> : null}<button type="button" onClick={() => { setEnergy('low'); setAvailableMinutes(10); }} className="rounded-full border border-white/35 bg-white/10 px-4 py-3 text-[12px] text-white backdrop-blur">Quick Reset</button><button type="button" onClick={() => setAssistantInput('I am tired. What routine should I do right now?')} className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-3 text-[12px] text-white backdrop-blur"><Mic2 size={14}/>Ask Glow</button></div></div>
            <div className="rounded-[24px] border border-white/20 bg-white/12 p-5 text-white backdrop-blur-xl"><div className="flex items-center gap-2"><Sparkles size={14}/><span className="text-[10px] font-semibold uppercase tracking-[.14em]">What fits now</span></div><p className="mt-3 text-[13px] leading-6 text-white/85">{rightNow ? `${rightNow.name} matches ${rightNow.timeOfDay === currentBand ? 'this time window' : rightNow.timeOfDay === 'anytime' ? 'an anytime window' : 'today'}. Glow is using ${energy} energy and ${availableMinutes} available minutes to choose the version.` : 'Create a routine to unlock adaptive guidance.'}</p></div>
          </div>
        </div>
      </EditableRoomImage>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
      <div className="rounded-[28px] border border-[#F1E7E3] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">How much capacity do you have?</p><div className="mt-4"><p className="text-xs text-[#766b64]">Energy</p><div className="mt-2 flex flex-wrap gap-2">{(['high','normal','low','exhausted'] as Energy[]).map((option) => <button key={option} type="button" onClick={() => setEnergy(option)} className={`rounded-full px-3 py-2 text-[10.5px] capitalize ${energy===option?'bg-[#2B2420] text-white':'bg-[#f8f3ef] text-[#6f655e]'}`}>{option}</button>)}</div></div><div className="mt-5"><p className="text-xs text-[#766b64]">I have</p><div className="mt-2 flex flex-wrap gap-2">{TIME_OPTIONS.map((minutes) => <button key={minutes} type="button" onClick={() => setAvailableMinutes(minutes)} className={`rounded-full px-3 py-2 text-[10.5px] ${availableMinutes===minutes?'bg-[#fbe4e8] font-semibold text-[#8b4d58]':'bg-[#f8f3ef] text-[#6f655e]'}`}>{minutes >= 90 ? '45+ min' : `${minutes} min`}</button>)}</div></div><p className="mt-4 rounded-2xl bg-[#fcfaf8] p-3 text-[11px] leading-5 text-[#70655e]">Glow currently recommends the <b>{adaptiveMode}</b> version. These are planning controls, not stored health facts.</p></div>
      <div className="rounded-[28px] border border-[#F1E7E3] bg-[#fffaf8] p-5"><div className="flex items-center gap-2"><WandSparkles size={15} className="text-[#c9727e]"/><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Ask Glow</p><h2 className="glow-display text-[22px] text-[#2B2420]">Make the routine fit real life</h2></div></div><div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={assistantInput} onChange={(event)=>setAssistantInput(event.target.value)} onKeyDown={(event)=>{if(event.key==='Enter')askGlow();}} placeholder="I’m tired and have 15 minutes" className="min-w-0 flex-1 rounded-2xl border border-[#eaded8] bg-white px-4 py-3 text-[12px]"/><button type="button" onClick={askGlow} className="rounded-2xl bg-[#2B2420] px-5 py-3 text-[12px] font-semibold text-white">Build my plan</button></div>{assistantReply ? <div aria-live="polite" className="mt-3 rounded-2xl border border-[#f0d9de] bg-white p-4 text-[11.5px] leading-5 text-[#6c5d58]">{assistantReply}{rightNow ? <button type="button" onClick={()=>startRoutine(rightNow,adaptiveMode)} className="mt-3 flex items-center gap-1.5 rounded-full bg-[#fbe4e8] px-3 py-2 text-[10.5px] font-semibold text-[#8a4b56]"><Play size={11}/>Start this plan</button> : null}</div> : null}</div>
    </section>

    <section className="rounded-[28px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Today’s Rhythm</p><h2 className="glow-display mt-1 text-[24px] text-[#2B2420]">Morning → Midday → Evening → Night</h2></div><span className="rounded-full bg-[#fbe4e8] px-3 py-1.5 text-[10px] font-medium text-[#8c4e59]">Now · {currentBand}</span></div><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{FLOW.map((item)=>{const active=item.key===currentBand;const matching=todayRoutines.filter((routine)=>routine.timeOfDay===item.key);return <div key={item.key} className={`rounded-2xl border p-4 ${active?'border-[#c9727e] bg-[#fff5f6]':'border-[#f0e7e2] bg-[#fcfaf8]'}`}><div className="text-[22px]">{item.icon}</div><p className="mt-2 text-[12px] font-semibold text-[#3d342f]">{item.label}</p><p className="text-[9.5px] text-[#9a8f87]">{item.time} · {matching.length} routine{matching.length===1?'':'s'}</p>{active?<p className="mt-2 text-[9px] font-bold uppercase tracking-[.1em] text-[#c9727e]">You are here</p>:null}</div>;})}</div></section>

    {stacks.length ? <section><div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Routine Stacks</p><h2 className="glow-display mt-1 text-[25px] text-[#2B2420]">Connected flows</h2></div><Layers3 size={18} className="text-[#c9727e]"/></div><div className="mt-3 grid gap-3 lg:grid-cols-3">{stacks.map((stack)=><article key={stack.name} className="rounded-[24px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center justify-between"><div><span className="text-[22px]">{stack.icon}</span><p className="mt-2 text-[14px] font-semibold">{stack.name}</p></div><span className="text-[10px] text-[#9b9089]">{stack.routines.length} routines</span></div><div className="mt-4 space-y-2">{stack.routines.map((routine,index)=><div key={routine.id} className="flex items-center gap-2 text-[11px]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fbe4e8] text-[9px] text-[#a75f6b]">{index+1}</span><span className="min-w-0 flex-1 truncate">{routine.name}</span>{index<stack.routines.length-1?<ArrowDown size={10} className="text-[#c7bbb4]"/>:null}</div>)}</div>{stack.routines[0]?<button type="button" onClick={()=>startRoutine(stack.routines[0])} className="mt-4 rounded-full bg-[#2B2420] px-3 py-2 text-[10.5px] text-white">Start first routine</button>:null}<p className="mt-2 text-[9.5px] text-[#9b9089]">Stack chaining is not automatic yet, so this starts the first routine honestly.</p></article>)}</div></section> : null}

    <section><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">My Routines</p><h2 className="glow-display mt-1 text-[26px] text-[#2B2420]">Your routine library</h2></div><button type="button" onClick={()=>setDialogRoutine('new')} className="inline-flex items-center gap-1.5 rounded-full bg-[#c9727e] px-4 py-2.5 text-[11px] font-medium text-white"><Plus size={13}/>Create routine</button></div><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{routines.map((routine,cardIndex)=>{const list=stepsByRoutine.get(routine.id)??[];const isOpen=expanded===routine.id;const Icon=TIME_ICON[routine.timeOfDay]??RefreshCw;const visual=['🌅','🌿','🪞','🎀','🌙','🏠'][cardIndex%6];return <article key={routine.id} className="overflow-hidden rounded-[24px] border border-[#F1E7E3] bg-white"><div className="bg-[linear-gradient(135deg,#fff8f6,#f7ece9)] p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[28px]">{visual}</div><p className="mt-2 break-words text-[14px] font-semibold">{routine.name}</p><p className="mt-1 text-[10.5px] capitalize text-[#8d8179]">{routine.timeOfDay} · {list.length} steps · ~{durationFor(routine)} min</p></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#c9727e]"><Icon size={15}/></span></div><p className="mt-3 text-[9.5px] text-[#9d9189]">Full / Normal / Quick / Minimum · progress resumes on this device</p></div><div className="flex flex-wrap gap-2 p-4"><button type="button" onClick={()=>startRoutine(routine)} className="inline-flex items-center gap-1.5 rounded-full bg-[#2B2420] px-3 py-2 text-[10.5px] text-white"><Play size={11}/>Start / Resume</button><button type="button" onClick={()=>setExpanded(isOpen?null:routine.id)} className="rounded-full border border-[#eaded8] px-3 py-2 text-[10.5px]">{isOpen?'Hide steps':'Steps'}</button><button type="button" onClick={()=>setDialogRoutine(routine)} aria-label={`Edit ${routine.name}`} className="rounded-full border border-[#eaded8] p-2"><Pencil size={12}/></button><button type="button" onClick={()=>setDeleteTarget(routine)} aria-label={`Delete ${routine.name}`} className="rounded-full border border-[#eaded8] p-2"><Trash2 size={12}/></button></div>{isOpen?<div className="border-t border-[#F1E7E3] bg-[#fdfaf8] p-4"><ol className="space-y-2">{list.length?list.map((step,index)=><li key={step.id} className="flex items-center gap-2 rounded-xl bg-white p-2.5"><GripVertical size={12} className="shrink-0 text-[#c0b5ae]"/><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fbe4e8] text-[9px] text-[#a65d69]">{index+1}</span><div className="min-w-0 flex-1"><p className="break-words text-[11.5px]">{step.title}</p><p className="text-[9px] text-[#9b9089]">{stepDuration(step)} min</p></div><button type="button" disabled={reordering||index===0} onClick={()=>moveStep(routine.id,step.id,-1)} className="rounded p-1 text-[#9b9089] disabled:opacity-25" aria-label="Move step earlier">↑</button><button type="button" disabled={reordering||index===list.length-1} onClick={()=>moveStep(routine.id,step.id,1)} className="rounded p-1 text-[#9b9089] disabled:opacity-25" aria-label="Move step later">↓</button><button type="button" disabled={removeStep.isPending} onClick={()=>handleRemoveStep(step)} className="rounded p-1 text-[#b8ada6] disabled:opacity-30" aria-label="Remove step"><Trash2 size={10}/></button></li>):<li className="rounded-xl border border-dashed p-4 text-center text-[10.5px] text-[#998e86]">No steps yet.</li>}</ol><div className="mt-3 flex gap-2"><input value={newStepTitle[routine.id]??''} onChange={(event)=>setNewStepTitle((current)=>({...current,[routine.id]:event.target.value}))} onKeyDown={(event)=>{if(event.key==='Enter')handleAddStep(routine);}} placeholder="Add a step" className="min-w-0 flex-1 rounded-xl border border-[#eaded8] bg-white px-3 py-2 text-[11px]"/><button type="button" disabled={addStep.isPending||!(newStepTitle[routine.id]??'').trim()} onClick={()=>handleAddStep(routine)} className="rounded-xl bg-[#2B2420] px-3 py-2 text-[10.5px] text-white disabled:opacity-35">Add</button></div><p className="mt-2 text-[9.5px] text-[#9b9089]">Arrow changes save permanently. The player can still move a step later for one run without rewriting the routine.</p></div>:null}</article>;})}</div>{!routines.length?<div className="mt-4 rounded-[24px] border border-dashed p-8 text-center"><Sparkles size={22} className="mx-auto text-[#c9727e]"/><p className="mt-3 font-serif text-2xl">Build your first rhythm.</p><button type="button" onClick={()=>setDialogRoutine('new')} className="mt-4 rounded-full bg-[#2B2420] px-4 py-2.5 text-xs text-white">Create routine</button></div>:null}</section>

    <section className="grid gap-4 lg:grid-cols-2"><div className="rounded-[24px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><Check size={14} className="text-[#c9727e]"/><h2 className="glow-display text-[21px]">Before you start</h2></div><div className="mt-4 space-y-2">{[['Steps loaded',rightNowSteps.length>0],['Time window matches',Boolean(rightNow&&(rightNow.timeOfDay===currentBand||rightNow.timeOfDay==='anytime'))],['Fits selected capacity',recommendedMinutes<=availableMinutes]].map(([label,ok])=><div key={String(label)} className="flex items-center justify-between rounded-xl bg-[#fcfaf8] px-3 py-2.5 text-[11px]"><span>{String(label)}</span><span className={ok?'text-[#6f8c6d]':'text-[#b07070]'}>{ok?'✓ Ready':'⚠ Check'}</span></div>)}</div></div><div className="rounded-[24px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#c9727e]"/><h2 className="glow-display text-[21px]">Glow noticed</h2></div><div className="mt-4 space-y-2 text-[11px] leading-5 text-[#675c56]"><p className="rounded-xl bg-[#fcfaf8] p-3">The current time window is {currentBand}, so matching routines are ranked first.</p><p className="rounded-xl bg-[#fcfaf8] p-3">Low energy or a short time budget automatically recommends Quick or Minimum instead of pushing the full version.</p><p className="rounded-xl bg-[#fcfaf8] p-3">Routine progress is device-local for now. It is not yet a cross-device learned completion history.</p></div></div></section>

    <section className="rounded-[24px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Routine Builder</p><h2 className="glow-display text-[23px]">Build visually, then let Glow guide it</h2></div><button type="button" onClick={()=>setDialogRoutine('new')} className="inline-flex items-center gap-1.5 rounded-full bg-[#fbe4e8] px-3 py-2 text-[10.5px] font-semibold text-[#8c4e59]"><Plus size={11}/>New routine</button></div><div className="mt-4 flex flex-wrap items-center gap-2">{['Wake up','Water','Skincare','Breakfast','Calendar review','Top 3','Get dressed'].map((label,index)=><div key={label} className="flex items-center gap-2"><span className="rounded-xl border border-[#eaded8] bg-[#fcfaf8] px-3 py-2 text-[10.5px]">{label}</span>{index<6?<ChevronRight size={11} className="text-[#c5bab3]"/>:null}</div>)}</div></section>

    <Dialog open={dialogRoutine!==null} onClose={()=>setDialogRoutine(null)} title={dialogRoutine==='new'?'Add routine':'Edit routine'}><RoutineForm routine={dialogRoutine==='new'?null:dialogRoutine} onSaved={handleSaved} onCancel={()=>setDialogRoutine(null)}/></Dialog>
    <ConfirmDialog open={deleteTarget!==null} title="Delete this routine?" description={deleteTarget?`“${deleteTarget.name}” will be removed.`:undefined} pending={del.isPending} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDelete}/>
    {playing?<RoutineStepPlayer routine={playing} steps={stepsByRoutine.get(playing.id)??[]} initialMode={playerMode} onClose={()=>setPlaying(null)}/>:null}
    {notice?<div role="status" className="fixed bottom-24 left-1/2 z-[240] max-w-[90vw] -translate-x-1/2 rounded-full border bg-white px-4 py-2.5 text-center text-[10px] shadow-xl sm:bottom-7">{notice}</div>:null}
  </div>;
}
