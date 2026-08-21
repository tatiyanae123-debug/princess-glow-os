'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  HeartPulse,
  Layers3,
  Library,
  MoonStar,
  Play,
  Settings2,
  Sparkles,
  SunMedium,
  WandSparkles,
} from 'lucide-react';
import { RoutineStepPlayer } from '@/components/routines/routine-step-player';
import { RoutinesExperience } from '@/components/routines/routines-experience';
import {
  DAILY_ANCHORS,
  LONG_CYCLE_MATCH,
  MAINTENANCE_GROUPS,
  PREP_FOR_MORNING,
  SOURCE_RULES,
  WEEKDAY_EXTRAS,
  WEEKLY_MATCH,
  stepFitsHairContext,
  type HairContext,
} from '@/lib/routines/routine-source-blueprint';
import type {
  CalendarEvent,
  Habit,
  Routine,
  RoutineChain,
  RoutineRun,
  RoutineStep,
  RoutineStepLink,
  RoutineStepRule,
  RoutineStepStat,
  RoutineTrigger,
  Task,
} from '@/lib/types';

type RoutineMode = 'full' | 'normal' | 'quick' | 'minimum';
type Energy = 'high' | 'normal' | 'low' | 'exhausted';
type EngineSnapshot = {
  activeRuns: RoutineRun[];
  history: RoutineRun[];
  stats: RoutineStepStat[];
  links: RoutineStepLink[];
  triggers: RoutineTrigger[];
  rules: RoutineStepRule[];
  chains: RoutineChain[];
};

type Props = {
  initialRoutines: Routine[];
  initialSteps: RoutineStep[];
  initialEngine: EngineSnapshot;
  calendarEvents: CalendarEvent[];
  tasks: Task[];
  habits: Habit[];
};

const MODE_LABEL: Record<RoutineMode, string> = { full: 'Full', normal: 'Standard', quick: 'Quick', minimum: 'Minimum' };
const TIME_OPTIONS = [10, 20, 35, 60, 120];

function localDayName(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: 'long' }).toLowerCase();
}

function timeBand(date: Date) {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < 10) return 'morning';
  if (hour < 16) return 'midday';
  if (hour < 20.5) return 'evening';
  return 'night';
}

function learnedMinutes(step: RoutineStep, stats: RoutineStepStat[]) {
  const stat = stats.find((item) => item.stepId === step.id);
  if (stat && stat.sampleCount >= 2 && stat.averageSeconds > 0) return Math.max(1, Math.round(stat.averageSeconds / 60));
  return Math.max(1, step.durationMinutes ?? 5);
}

function routineMinutes(routine: Routine, stepsByRoutine: Map<string, RoutineStep[]>, stats: RoutineStepStat[]) {
  return (stepsByRoutine.get(routine.id) ?? []).reduce((sum, step) => sum + learnedMinutes(step, stats), 0);
}

function elapsedLabel(date: Date) {
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m ago`;
}

function adaptiveMode(energy: Energy, minutes: number): RoutineMode {
  if (energy === 'exhausted' || minutes <= 12) return 'minimum';
  if (energy === 'low' || minutes <= 35) return 'quick';
  if (energy === 'high' && minutes >= 60) return 'full';
  return 'normal';
}

function modeEstimate(fullMinutes: number, mode: RoutineMode) {
  if (mode === 'minimum') return Math.min(fullMinutes, 12);
  if (mode === 'quick') return Math.min(fullMinutes, 35);
  if (mode === 'normal') return Math.min(fullMinutes, 70);
  return fullMinutes;
}

function findAnchorRoutine(routines: Routine[], key: string) {
  const blueprint = DAILY_ANCHORS.find((item) => item.key === key);
  if (!blueprint) return null;
  const direct = routines.find((routine) => blueprint.routineMatch.test(routine.name) && !routine.archived);
  if (direct) return direct;
  if (key === 'midday') return routines.find((routine) => routine.timeOfDay === 'afternoon' && /reset/i.test(routine.name)) ?? null;
  return routines.find((routine) => routine.timeOfDay === key && !routine.archived) ?? null;
}

function sectionForStep(step: RoutineStep, routine: Routine) {
  const blueprint = DAILY_ANCHORS.find((item) => item.routineMatch.test(routine.name));
  if (!blueprint) return 'Steps';
  const text = `${step.title} ${step.notes ?? ''}`;
  return blueprint.chapters.find((chapter) => chapter.match.test(text))?.title ?? 'Other';
}

function classifyLibrary(routine: Routine) {
  const text = `${routine.name} ${routine.description ?? ''}`;
  if (LONG_CYCLE_MATCH.test(text)) return 'Long-cycle';
  if (WEEKLY_MATCH.test(text) || routine.daysOfWeek?.length === 1) return 'This week';
  const anchor = DAILY_ANCHORS.find((item) => item.routineMatch.test(routine.name));
  if (anchor) return 'Daily rhythm';
  const maintenance = MAINTENANCE_GROUPS.find((group) => group.match.test(text));
  return maintenance ? maintenance.label : 'Other';
}

export function RoutineIntelligenceStudio(props: Props) {
  const { initialRoutines, initialSteps, initialEngine, calendarEvents, tasks, habits } = props;
  const router = useRouter();
  const [engine, setEngine] = useState(initialEngine);
  const [now, setNow] = useState(() => new Date());
  const [energy, setEnergy] = useState<Energy>('normal');
  const [availableMinutes, setAvailableMinutes] = useState(35);
  const [hairContext, setHairContext] = useState<HairContext>('u-part');
  const [playing, setPlaying] = useState<Routine | null>(null);
  const [playerMode, setPlayerMode] = useState<RoutineMode>('normal');
  const [expandedAnchor, setExpandedAnchor] = useState<string | null>(null);
  const [surface, setSurface] = useState<'studio' | 'advanced'>('studio');
  const [libraryOpen, setLibraryOpen] = useState(false);

  useEffect(() => setEngine(initialEngine), [initialEngine]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const routines = useMemo(() => initialRoutines.filter((routine) => !routine.archived), [initialRoutines]);
  const stepsByRoutine = useMemo(() => {
    const map = new Map<string, RoutineStep[]>();
    for (const step of initialSteps) {
      const list = map.get(step.routineId) ?? [];
      list.push(step);
      map.set(step.routineId, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [initialSteps]);

  const activeByRoutine = useMemo(() => new Map(engine.activeRuns.map((run) => [run.routineId, run])), [engine.activeRuns]);
  const todayName = localDayName(now);
  const currentBand = timeBand(now);
  const suggestedMode = adaptiveMode(energy, availableMinutes);
  const anchors = DAILY_ANCHORS.map((blueprint) => ({ blueprint, routine: findAnchorRoutine(routines, blueprint.key) }));
  const currentAnchor = anchors.find((item) => item.blueprint.key === currentBand && item.routine) ?? anchors.find((item) => item.routine) ?? null;
  const currentRoutine = currentAnchor?.routine ?? null;
  const currentFullMinutes = currentRoutine ? routineMinutes(currentRoutine, stepsByRoutine, engine.stats) : 0;
  const upcomingEvent = [...calendarEvents]
    .filter((event) => !event.allDay && event.startAt > now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null;
  const minutesUntilEvent = upcomingEvent ? Math.max(0, Math.floor((upcomingEvent.startAt.getTime() - now.getTime()) / 60000)) : null;
  const calendarFitMinutes = minutesUntilEvent == null ? availableMinutes : Math.min(availableMinutes, minutesUntilEvent);
  const calendarMode = adaptiveMode(energy, calendarFitMinutes);
  const recommendedMode = currentRoutine ? (modeEstimate(currentFullMinutes, suggestedMode) <= calendarFitMinutes ? suggestedMode : calendarMode) : suggestedMode;
  const weekdayExtras = WEEKDAY_EXTRAS[now.getDay()];

  const weeklyRoutines = routines.filter((routine) => classifyLibrary(routine) === 'This week');
  const longCycleRoutines = routines.filter((routine) => classifyLibrary(routine) === 'Long-cycle');
  const maintenanceRoutines = routines.filter((routine) => !['Daily rhythm', 'This week', 'Long-cycle'].includes(classifyLibrary(routine)));
  const sundayReset = routines.find((routine) => /sunday reset/i.test(routine.name));

  const friction = useMemo(() => {
    if (!currentRoutine) return [];
    return (stepsByRoutine.get(currentRoutine.id) ?? []).map((step) => {
      const planned = Math.max(1, step.durationMinutes ?? 5);
      const learned = learnedMinutes(step, engine.stats);
      const stat = engine.stats.find((item) => item.stepId === step.id);
      return { step, planned, learned, delta: learned - planned, samples: stat?.sampleCount ?? 0 };
    }).filter((item) => item.samples >= 2 && item.delta >= 2).sort((a, b) => b.delta - a.delta).slice(0, 4);
  }, [currentRoutine, engine.stats, stepsByRoutine]);

  function startRoutine(routine: Routine, mode: RoutineMode) {
    setPlaying(routine);
    setPlayerMode(mode);
  }

  function runChanged(run: RoutineRun) {
    setEngine((current) => {
      const activeRuns = run.status === 'active'
        ? [run, ...current.activeRuns.filter((item) => item.id !== run.id && item.routineId !== run.routineId)]
        : current.activeRuns.filter((item) => item.id !== run.id);
      const history = run.status === 'completed'
        ? [run, ...current.history.filter((item) => item.id !== run.id)]
        : current.history;
      return { ...current, activeRuns, history };
    });
  }

  if (surface === 'advanced') {
    return (
      <div className="space-y-4">
        <div className="sticky top-2 z-30 mx-auto flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/90 p-1 shadow-lg backdrop-blur-xl">
          <button type="button" onClick={() => setSurface('studio')} className="rounded-full px-4 py-2 text-xs font-semibold text-[#5f5360]">Routine Studio</button>
          <button type="button" className="rounded-full bg-[#4f4054] px-4 py-2 text-xs font-semibold text-white">Planning + Advanced</button>
        </div>
        <RoutinesExperience {...props} initialEngine={engine} />
      </div>
    );
  }

  const playerSteps = playing
    ? (stepsByRoutine.get(playing.id) ?? []).filter((step) => stepFitsHairContext(step.title, step.notes, hairContext))
    : [];
  const playerRun = playing ? activeByRoutine.get(playing.id) ?? null : null;

  return (
    <div className="relative min-h-screen overflow-hidden rounded-[34px] bg-[#f8f4ee] px-3 pb-28 pt-4 text-[#443a44] sm:px-5 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_15%_10%,rgba(255,247,218,.9),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(226,235,216,.75),transparent_32%),radial-gradient(circle_at_75%_85%,rgba(226,213,238,.7),transparent_34%)]" />
      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/65 p-5 shadow-[0_22px_70px_rgba(79,64,84,.09)] backdrop-blur-xl sm:p-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#9a8795]">Routine Intelligence + Execution Studio</p>
            <h1 className="mt-2 font-serif text-4xl leading-none text-[#4d404d] sm:text-5xl">Your rhythm</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#756875]">Routine → Chapter → Step → Detail → Rule → Variant. The source stays rich; the screen only shows what matters now.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSurface('advanced')} className="inline-flex items-center gap-2 rounded-full border border-[#e9dfe5] bg-white px-4 py-2 text-xs font-semibold"><Settings2 size={14} /> Planning + Advanced</button>
            <button type="button" onClick={() => setLibraryOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-full bg-[#4f4054] px-4 py-2 text-xs font-semibold text-white"><Library size={14} /> Routine Library</button>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <article className="rounded-[30px] border border-white/80 bg-white/78 p-5 shadow-[0_18px_60px_rgba(78,64,78,.09)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#a28b98]">Routine Right Now</p>
                <p className="mt-1 text-sm text-[#7b6c77]">{now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} · {now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              </div>
              {upcomingEvent ? <div className="rounded-full bg-[#f6f1ec] px-3 py-2 text-[11px] text-[#746773]">Next calendar · {upcomingEvent.title} · {minutesUntilEvent}m</div> : null}
            </div>

            {currentRoutine ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <p className="text-xs font-semibold text-[#8f7b88]">Best routine for this moment</p>
                  <h2 className="mt-1 font-serif text-3xl text-[#4d404d]">{currentRoutine.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#746672]">{currentAnchor?.blueprint.purpose ?? currentRoutine.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full bg-[#f7f1e8] px-3 py-1.5">{MODE_LABEL[recommendedMode]} suggested</span>
                    <span className="rounded-full bg-[#eef3e8] px-3 py-1.5">~{modeEstimate(currentFullMinutes, recommendedMode)} min</span>
                    {activeByRoutine.has(currentRoutine.id) ? <span className="rounded-full bg-[#eee7f5] px-3 py-1.5">Resume saved run</span> : null}
                  </div>
                </div>
                <button type="button" onClick={() => startRoutine(currentRoutine, recommendedMode)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4f4054] px-6 py-3 text-sm font-semibold text-white shadow-lg"><Play size={16} /> {activeByRoutine.has(currentRoutine.id) ? 'Continue' : `Start ${MODE_LABEL[recommendedMode]}`}</button>
              </div>
            ) : <p className="mt-5 text-sm text-[#756875]">No daily anchor routine exists for this time window yet. Open Planning + Advanced to create or map one.</p>}

            <div className="mt-6 grid gap-4 border-t border-[#eee5e9] pt-5 md:grid-cols-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9e8a97]">Energy</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{(['high','normal','low','exhausted'] as Energy[]).map((value) => <button key={value} type="button" onClick={() => setEnergy(value)} className={`rounded-full px-3 py-1.5 text-[11px] capitalize ${energy === value ? 'bg-[#594a5b] text-white' : 'bg-[#f4efec]'}`}>{value}</button>)}</div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9e8a97]">I have</p>
                <div className="mt-2 flex flex-wrap gap-1.5">{TIME_OPTIONS.map((value) => <button key={value} type="button" onClick={() => setAvailableMinutes(value)} className={`rounded-full px-3 py-1.5 text-[11px] ${availableMinutes === value ? 'bg-[#594a5b] text-white' : 'bg-[#f4efec]'}`}>{value >= 120 ? '2h+' : `${value}m`}</button>)}</div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9e8a97]">Hair today</p>
                <select value={hairContext} onChange={(event) => setHairContext(event.target.value as HairContext)} className="mt-2 w-full rounded-2xl border border-[#e7dce2] bg-white px-3 py-2 text-xs outline-none">
                  <option value="u-part">U-Part Wig</option><option value="natural">Natural</option><option value="straightened">Straightened</option><option value="braids">Braids</option><option value="other">Other</option>
                </select>
              </div>
            </div>
          </article>

          <aside className="rounded-[30px] border border-white/80 bg-[#fffdf8]/85 p-5 shadow-[0_18px_60px_rgba(78,64,78,.08)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a18d94]">Today’s Extras</p>
            <h3 className="mt-2 font-serif text-2xl">{weekdayExtras.theme}</h3>
            <div className="mt-4 space-y-2">{weekdayExtras.items.map((item) => <div key={item} className="flex gap-3 rounded-2xl bg-white/80 px-3 py-2.5 text-sm"><Sparkles size={15} className="mt-0.5 shrink-0 text-[#a88da2]" /><span>{item}</span></div>)}</div>
            <p className="mt-4 text-[11px] leading-5 text-[#8b7a86]">Source-derived weekday additions. They stay visible without becoming separate noisy Calendar events.</p>
          </aside>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a08c97]">Today</p><h2 className="font-serif text-3xl">Four daily anchors</h2></div><p className="hidden text-xs text-[#8d7e88] sm:block">The current time window is emphasized automatically.</p></div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {anchors.map(({ blueprint, routine }) => {
              const steps = routine ? stepsByRoutine.get(routine.id) ?? [] : [];
              const run = routine ? activeByRoutine.get(routine.id) : null;
              const complete = run?.completedStepIds?.length ?? 0;
              const progress = steps.length ? Math.min(100, Math.round((complete / steps.length) * 100)) : 0;
              const isCurrent = blueprint.key === currentBand;
              return (
                <article key={blueprint.key} className={`overflow-hidden rounded-[28px] border p-4 shadow-sm transition ${isCurrent ? 'border-[#cbb8ca] bg-white shadow-[0_16px_44px_rgba(89,74,91,.13)]' : 'border-white/80 bg-white/70'}`}>
                  <div className={`-mx-4 -mt-4 mb-4 h-16 bg-gradient-to-br ${blueprint.tone}`} />
                  <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9c8895]">{blueprint.verb}</p><h3 className="mt-1 font-serif text-2xl">{blueprint.label}</h3></div>{blueprint.key === 'night' ? <MoonStar size={20} /> : <SunMedium size={20} />}</div>
                  <p className="mt-2 text-[11px] text-[#887985]">{blueprint.timeLabel}</p>
                  {routine ? <><div className="mt-4 flex items-center justify-between text-xs"><span>{steps.length} steps · ~{routineMinutes(routine, stepsByRoutine, engine.stats)}m</span><span>{run ? `${complete}/${steps.length}` : 'Ready'}</span></div><div className="mt-2 h-1 overflow-hidden rounded-full bg-[#ece5e8]"><div className="h-full rounded-full bg-[#8e7a8d]" style={{ width: `${progress}%` }} /></div><div className="mt-4 flex gap-2"><button type="button" onClick={() => startRoutine(routine, adaptiveMode(energy, availableMinutes))} className="flex-1 rounded-full bg-[#594a5b] px-3 py-2 text-xs font-semibold text-white">{run ? 'Continue' : 'Start'}</button><button type="button" onClick={() => setExpandedAnchor(expandedAnchor === routine.id ? null : routine.id)} className="rounded-full border border-[#e6dce1] bg-white px-3 py-2" aria-label={`Show ${blueprint.label} chapters`}><ChevronDown size={14} /></button></div></> : <p className="mt-4 text-xs text-[#8e8089]">No matching master routine yet.</p>}
                  {routine && expandedAnchor === routine.id ? <div className="mt-4 space-y-2 border-t border-[#eee5e9] pt-4">{blueprint.chapters.map((chapter) => { const chapterSteps = steps.filter((step) => sectionForStep(step, routine) === chapter.title); if (!chapterSteps.length) return null; return <div key={chapter.title} className="rounded-2xl bg-[#faf7f4] p-3"><div className="flex items-center justify-between"><p className="text-xs font-semibold">{chapter.title}</p><span className="text-[10px] text-[#9b8994]">{chapterSteps.length} steps</span></div><p className="mt-1 text-[10px] leading-4 text-[#8a7a85]">{chapter.description}</p></div>; })}</div> : null}
                </article>
              );
            })}
          </div>
        </section>

        {engine.activeRuns.length ? <section className="rounded-[28px] border border-[#e5dbe4] bg-[#f4eef7] p-5"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8c768d]">Where was I?</p><div className="mt-3 grid gap-3 md:grid-cols-2">{engine.activeRuns.slice(0, 4).map((run) => { const routine = routines.find((item) => item.id === run.routineId); if (!routine) return null; return <button key={run.id} type="button" onClick={() => startRoutine(routine, (run.mode as RoutineMode) || 'normal')} className="flex items-center justify-between rounded-2xl bg-white p-4 text-left"><div><p className="font-semibold">Resume {routine.name}</p><p className="mt-1 text-xs text-[#8a7985]">{run.completedStepIds.length}/{run.queueStepIds.length} complete · {elapsedLabel(run.lastActivityAt)}</p></div><ChevronRight size={18} /></button>; })}</div></section> : null}

        {now.getDay() === 0 && sundayReset ? <section className="rounded-[32px] border border-[#ead9cb] bg-gradient-to-br from-[#fffaf2] to-[#f3e8dc] p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#a38775]">Sunday Reset Mode</p><h2 className="mt-1 font-serif text-3xl">Reset body, home, appearance + life</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#7c6d65]">Treat this as a reset operating session, not a 40-item checklist. Use running/waiting steps as opportunities to move another category forward.</p></div><button type="button" onClick={() => startRoutine(sundayReset, 'full')} className="rounded-full bg-[#67554b] px-5 py-3 text-sm font-semibold text-white">Start Reset Day</button></div><div className="mt-5 grid gap-3 sm:grid-cols-4">{['Home','Beauty','Body','Planning'].map((label) => <div key={label} className="rounded-2xl bg-white/70 p-4"><p className="text-xs font-semibold">{label}</p><p className="mt-2 text-[11px] text-[#8d7a70]">Grouped inside the reset instead of competing as separate cards.</p></div>)}</div><div className="mt-4 rounded-2xl bg-white/70 p-4 text-sm"><span className="font-semibold">Parallel-step idea:</span> while laundry or a hair treatment runs, use the waiting window for bathroom cleaning, grocery planning, or tomorrow prep.</div></section> : null}

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[28px] border border-white/80 bg-white/75 p-5">
            <div className="flex items-center gap-2"><HeartPulse size={18} /><h2 className="font-serif text-2xl">Routine Doctor</h2></div>
            {friction.length ? <><p className="mt-2 text-sm text-[#776975]">The largest learned overruns inside {currentRoutine?.name}:</p><div className="mt-4 space-y-2">{friction.map((item) => <div key={item.step.id} className="flex items-center justify-between rounded-2xl bg-[#faf6f4] px-4 py-3"><div><p className="text-sm font-semibold">{item.step.title}</p><p className="text-[11px] text-[#95828f]">planned {item.planned}m · learned {item.learned}m · {item.samples} samples</p></div><span className="rounded-full bg-[#f3e5e7] px-2.5 py-1 text-[11px] text-[#8f656e]">+{item.delta}m</span></div>)}</div></> : <p className="mt-3 text-sm leading-6 text-[#7c6f79]">Glow needs at least two real timing samples per step before it calls something friction. No fake pattern is shown before that.</p>}
          </article>

          <article className="rounded-[28px] border border-white/80 bg-white/75 p-5">
            <div className="flex items-center gap-2"><WandSparkles size={18} /><h2 className="font-serif text-2xl">Prepare Morning</h2></div>
            <p className="mt-2 text-sm text-[#786a75]">Make tomorrow’s first routine easier tonight.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">{PREP_FOR_MORNING.map((item) => <div key={item} className="flex items-center gap-2 rounded-2xl bg-[#faf7f3] px-3 py-2.5 text-sm"><Check size={14} className="text-[#8b9b78]" />{item}</div>)}</div>
            <p className="mt-4 text-[11px] leading-5 text-[#91818b]">These are preparation prompts from the source routine architecture. They do not mark tomorrow’s execution steps complete.</p>
          </article>
        </section>

        <section className="rounded-[28px] border border-white/80 bg-white/75 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b8794]">Rules + prerequisites</p><h2 className="font-serif text-2xl">The routine should understand order</h2></div><BookOpen size={20} /></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{SOURCE_RULES.map((rule) => <div key={rule} className="rounded-2xl border border-[#eee5e9] bg-[#fbf8f6] px-3 py-3 text-xs leading-5">{rule}</div>)}</div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <LibrarySection title="This week" icon={<CalendarDays size={17} />} routines={weeklyRoutines} stepsByRoutine={stepsByRoutine} stats={engine.stats} onStart={startRoutine} />
          <LibrarySection title="Maintenance systems" icon={<Layers3 size={17} />} routines={maintenanceRoutines} stepsByRoutine={stepsByRoutine} stats={engine.stats} onStart={startRoutine} />
          <LibrarySection title="Long-cycle" icon={<Clock3 size={17} />} routines={longCycleRoutines} stepsByRoutine={stepsByRoutine} stats={engine.stats} onStart={startRoutine} />
        </section>

        {libraryOpen ? <section className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-xl"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9b8794]">Routine Library</p><h2 className="font-serif text-3xl">All systems, without the wall of cards</h2></div><button type="button" onClick={() => setLibraryOpen(false)} className="rounded-full border px-3 py-2 text-xs">Close</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{['Daily rhythm','This week','Hair','Skin','Body','Home','Planning','Wellness','Long-cycle','Other'].map((group) => { const list = routines.filter((routine) => classifyLibrary(routine) === group); if (!list.length) return null; return <div key={group} className="rounded-2xl bg-[#faf7f4] p-4"><p className="font-serif text-xl">{group}</p><div className="mt-3 space-y-2">{list.slice(0, 10).map((routine) => <button key={routine.id} type="button" onClick={() => startRoutine(routine, 'normal')} className="flex w-full items-center justify-between rounded-xl bg-white px-3 py-2 text-left text-xs"><span>{routine.name}</span><ArrowRight size={13} /></button>)}</div></div>; })}</div></section> : null}
      </div>

      <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-24px)] max-w-xl items-center justify-around rounded-full border border-white/75 bg-white/92 px-2 py-2 shadow-[0_16px_60px_rgba(75,61,76,.18)] backdrop-blur-xl">
        <button type="button" disabled={!currentRoutine} onClick={() => currentRoutine && startRoutine(currentRoutine, recommendedMode)} className="rounded-full bg-[#554657] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Do Next</button>
        <button type="button" disabled={!currentRoutine} onClick={() => currentRoutine && startRoutine(currentRoutine, 'quick')} className="rounded-full px-4 py-2 text-xs font-semibold">Quick Version</button>
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('glow:speak', { detail: { text: currentRoutine ? `${currentRoutine.name}. ${currentAnchor?.blueprint.purpose ?? ''}` : 'Your routines are organized and safe.' } }))} className="rounded-full px-4 py-2 text-xs font-semibold">Speak</button>
        <button type="button" onClick={() => router.push('/concierge')} className="rounded-full px-4 py-2 text-xs font-semibold">Ask Glow</button>
      </div>

      {playing ? <div className="fixed inset-0 z-[180] bg-[#f7f2ec]"><RoutineStepPlayer routine={playing} steps={playerSteps} initialMode={playerMode} initialRun={playerRun} stats={engine.stats} rules={engine.rules} calendarEvents={calendarEvents} context={{ locationMode: 'anywhere', hairContext }} onClose={() => { setPlaying(null); router.refresh(); }} onRunChanged={runChanged} onChain={(routineId) => { const next = routines.find((routine) => routine.id === routineId); if (next) { setPlaying(next); setPlayerMode('normal'); } }} /></div> : null}
    </div>
  );
}

function LibrarySection({ title, icon, routines, stepsByRoutine, stats, onStart }: { title: string; icon: React.ReactNode; routines: Routine[]; stepsByRoutine: Map<string, RoutineStep[]>; stats: RoutineStepStat[]; onStart: (routine: Routine, mode: RoutineMode) => void }) {
  return <article className="rounded-[28px] border border-white/80 bg-white/75 p-5"><div className="flex items-center gap-2">{icon}<h2 className="font-serif text-2xl">{title}</h2></div><div className="mt-4 space-y-2">{routines.length ? routines.slice(0, 7).map((routine) => <button key={routine.id} type="button" onClick={() => onStart(routine, 'normal')} className="group flex w-full items-center justify-between rounded-2xl bg-[#faf7f4] px-3 py-3 text-left"><div><p className="text-sm font-semibold">{routine.name}</p><p className="mt-1 text-[10px] text-[#95828f]">{(stepsByRoutine.get(routine.id) ?? []).length} steps · ~{routineMinutes(routine, stepsByRoutine, stats)}m</p></div><ChevronRight size={16} className="transition group-hover:translate-x-0.5" /></button>) : <p className="text-sm text-[#8e7f89]">No routines in this layer yet.</p>}</div></article>;
}
