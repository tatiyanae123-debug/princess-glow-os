'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  CloudRain,
  Gauge,
  GripVertical,
  History,
  Link2,
  MapPin,
  Mic2,
  MoonStar,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Route,
  Sparkles,
  SunMedium,
  Trash2,
  Unlink,
  WandSparkles,
  Zap,
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
import {
  createRoutineStepRuleAction,
  createRoutineTriggerAction,
  linkRoutineStepAction,
  setRoutineChainAction,
  startRoutineRunAction,
  toggleRoutineStepRuleAction,
  toggleRoutineTriggerAction,
  unlinkRoutineStepAction,
  updateRoutineRunAction,
} from '@/app/actions/advanced-routines';
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
type LocationMode = 'anywhere' | 'home' | 'out' | 'work' | 'gym';
type EngineSnapshot = {
  activeRuns: RoutineRun[];
  history: RoutineRun[];
  stats: RoutineStepStat[];
  links: RoutineStepLink[];
  triggers: RoutineTrigger[];
  rules: RoutineStepRule[];
  chains: RoutineChain[];
};
type LiveContext = {
  status: 'idle' | 'loading' | 'ready' | 'unavailable';
  latitude?: number;
  longitude?: number;
  temperature?: number;
  precipitationProbability?: number;
  error?: string;
};

const TIME_ICON: Record<string, typeof SunMedium> = {
  morning: SunMedium,
  afternoon: SunMedium,
  evening: MoonStar,
  night: MoonStar,
  anytime: RefreshCw,
};
const WEEKDAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const FLOW = [
  { key: 'morning', label: 'Morning', time: '5 AM', icon: '🌅' },
  { key: 'afternoon', label: 'Midday', time: '10 AM', icon: '☀️' },
  { key: 'evening', label: 'Evening', time: '4 PM', icon: '🌸' },
  { key: 'night', label: 'Night', time: '8:30 PM', icon: '🌙' },
];
const TIME_OPTIONS = [5, 10, 20, 45, 90];

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

function estimateStepMinutes(step: RoutineStep, stats: RoutineStepStat[]) {
  const stat = stats.find((item) => item.stepId === step.id);
  if (stat && stat.sampleCount >= 2 && stat.averageSeconds > 0) return Math.max(1, Math.round(stat.averageSeconds / 60));
  return Math.max(1, step.durationMinutes ?? 5);
}

function fitSteps(list: RoutineStep[], mode: RoutineMode, availableMinutes: number, stats: RoutineStepStat[]) {
  if (!list.length) return [];
  const hardLimit = Math.min(modeLimit(mode), availableMinutes);
  if (!Number.isFinite(hardLimit)) return list;
  const essential = /med|medicine|brush|teeth|skincare|water|alarm|tomorrow|essential|shower/i;
  const ordered = [...list.filter((step) => essential.test(`${step.title} ${step.notes ?? ''}`)), ...list.filter((step) => !essential.test(`${step.title} ${step.notes ?? ''}`))];
  const picked: RoutineStep[] = [];
  let used = 0;
  for (const step of ordered) {
    const duration = estimateStepMinutes(step, stats);
    if (picked.length && used + duration > hardLimit) continue;
    picked.push(step);
    used += duration;
    if (used >= hardLimit) break;
  }
  return picked.length ? picked : list.slice(0, 1);
}

function minutesLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function parseTime(value: unknown) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function calendarTriggerMatches(trigger: RoutineTrigger, events: CalendarEvent[], now: Date) {
  const config = trigger.config ?? {};
  const keyword = String(config.keyword ?? '').trim().toLowerCase();
  const beforeMinutes = Math.max(1, Number(config.beforeMinutes ?? 60));
  const candidate = [...events].filter((event) => !event.allDay && event.startAt > now && (!keyword || `${event.title} ${event.location ?? ''}`.toLowerCase().includes(keyword))).sort((a,b) => a.startAt.getTime() - b.startAt.getTime())[0];
  if (!candidate) return false;
  const delta = (candidate.startAt.getTime() - now.getTime()) / 60000;
  return delta >= 0 && delta <= beforeMinutes;
}

function timeTriggerMatches(trigger: RoutineTrigger, now: Date) {
  const config = trigger.config ?? {};
  const parsed = parseTime(config.time);
  if (!parsed) return false;
  const days = Array.isArray(config.days) ? config.days.map(String) : [];
  if (days.length && !days.includes(WEEKDAYS[now.getDay()])) return false;
  const target = new Date(now);
  target.setHours(parsed.hour, parsed.minute, 0, 0);
  const windowMinutes = Math.max(1, Number(config.windowMinutes ?? 30));
  return Math.abs(now.getTime() - target.getTime()) <= windowMinutes * 60000;
}

function contextRuleResult(rule: RoutineStepRule, context: LiveContext, locationMode: LocationMode, events: CalendarEvent[], now: Date): boolean | null {
  const config = rule.config ?? {};
  if (rule.ruleType === 'location') {
    const mode = String(config.mode ?? 'anywhere').toLowerCase();
    return mode === 'anywhere' || mode === locationMode;
  }
  if (rule.ruleType === 'weather') {
    if (context.status !== 'ready') return null;
    const condition = String(config.condition ?? 'rain');
    const temp = context.temperature ?? 70;
    const precip = context.precipitationProbability ?? 0;
    if (condition === 'rain') return precip >= Number(config.threshold ?? 40);
    if (condition === 'dry') return precip < Number(config.threshold ?? 40);
    if (condition === 'cold') return temp <= Number(config.threshold ?? 50);
    if (condition === 'hot') return temp >= Number(config.threshold ?? 80);
    return true;
  }
  if (rule.ruleType === 'calendar') {
    const keyword = String(config.keyword ?? '').trim().toLowerCase();
    const withinMinutes = Math.max(1, Number(config.withinMinutes ?? 240));
    return events.some((event) => !event.allDay && event.startAt > now && (event.startAt.getTime() - now.getTime()) / 60000 <= withinMinutes && (!keyword || event.title.toLowerCase().includes(keyword)));
  }
  return true;
}

function triggerMatches(trigger: RoutineTrigger, context: LiveContext, locationMode: LocationMode, events: CalendarEvent[], now: Date) {
  if (!trigger.enabled) return false;
  if (trigger.triggerType === 'time') return timeTriggerMatches(trigger, now);
  if (trigger.triggerType === 'calendar' || trigger.triggerType === 'event') return calendarTriggerMatches(trigger, events, now);
  if (trigger.triggerType === 'location') return String(trigger.config?.mode ?? 'anywhere').toLowerCase() === locationMode;
  if (trigger.triggerType === 'weather') {
    if (context.status !== 'ready') return false;
    const condition = String(trigger.config?.condition ?? 'rain');
    const temp = context.temperature ?? 70;
    const precip = context.precipitationProbability ?? 0;
    if (condition === 'rain') return precip >= Number(trigger.config?.threshold ?? 40);
    if (condition === 'dry') return precip < Number(trigger.config?.threshold ?? 40);
    if (condition === 'cold') return temp <= Number(trigger.config?.threshold ?? 50);
    if (condition === 'hot') return temp >= Number(trigger.config?.threshold ?? 80);
  }
  return false;
}

export function RoutinesExperience({
  initialRoutines,
  initialSteps,
  initialEngine,
  calendarEvents,
  tasks,
  habits,
}: {
  initialRoutines: Routine[];
  initialSteps: RoutineStep[];
  initialEngine: EngineSnapshot;
  calendarEvents: CalendarEvent[];
  tasks: Task[];
  habits: Habit[];
}) {
  const router = useRouter();
  const [routines, setRoutines] = useState(initialRoutines);
  const [steps, setSteps] = useState(initialSteps);
  const [engine, setEngine] = useState(initialEngine);
  const [dialogRoutine, setDialogRoutine] = useState<Routine | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Routine | null>(null);
  const [activeRun, setActiveRun] = useState<RoutineRun | null>(null);
  const [playerMode, setPlayerMode] = useState<RoutineMode>('normal');
  const [newStepTitle, setNewStepTitle] = useState<Record<string, string>>({});
  const [energy, setEnergy] = useState<Energy>('normal');
  const [availableMinutes, setAvailableMinutes] = useState(20);
  const [locationMode, setLocationMode] = useState<LocationMode>('anywhere');
  const [liveContext, setLiveContext] = useState<LiveContext>({ status: 'idle' });
  const [travelMinutes, setTravelMinutes] = useState(30);
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [notice, setNotice] = useState('');
  const [now, setNow] = useState(() => new Date());
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<'task'|'habit'|'fitness'>('task');
  const [linkTarget, setLinkTarget] = useState('');
  const [ruleType, setRuleType] = useState<'location'|'weather'|'calendar'>('location');
  const [ruleValue, setRuleValue] = useState('home');
  const [triggerRoutineId, setTriggerRoutineId] = useState(initialRoutines[0]?.id ?? '');
  const [triggerType, setTriggerType] = useState<'time'|'calendar'|'weather'|'location'>('time');
  const [triggerValue, setTriggerValue] = useState('20:30');
  const [busy, startBusy] = useTransition();
  const [reordering, startReorder] = useTransition();
  const del = useServerAction((id: string) => deleteRoutineAction(id));
  const addStep = useServerAction(createRoutineStepAction);
  const removeStep = useServerAction((id: string) => deleteRoutineStepAction(id));

  useEffect(() => setRoutines(initialRoutines), [initialRoutines]);
  useEffect(() => setSteps(initialSteps), [initialSteps]);
  useEffect(() => setEngine(initialEngine), [initialEngine]);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 5200);
    return () => window.clearTimeout(id);
  }, [notice]);

  const stepsByRoutine = useMemo(() => {
    const map = new Map<string, RoutineStep[]>();
    for (const step of steps) {
      const list = map.get(step.routineId) ?? [];
      list.push(step);
      map.set(step.routineId, list);
    }
    for (const list of map.values()) list.sort((a,b) => a.order - b.order);
    return map;
  }, [steps]);

  function eligibleStepsFor(routine: Routine) {
    const list = stepsByRoutine.get(routine.id) ?? [];
    return list.filter((step) => {
      const rules = engine.rules.filter((rule) => rule.stepId === step.id && rule.enabled);
      return !rules.some((rule) => contextRuleResult(rule, liveContext, locationMode, calendarEvents, now) === false);
    });
  }

  function durationFor(routine: Routine) {
    return eligibleStepsFor(routine).reduce((sum, step) => sum + estimateStepMinutes(step, engine.stats), 0);
  }

  const currentBand = timeBand(now);
  const todayName = WEEKDAYS[now.getDay()];
  const adaptiveMode = modeFor(energy, availableMinutes);
  const activeRunByRoutine = new Map(engine.activeRuns.map((run) => [run.routineId, run]));
  const todayRoutines = routines.filter((routine) => !routine.daysOfWeek?.length || routine.daysOfWeek.includes(todayName));
  const matchedTriggerIds = new Set(engine.triggers.filter((trigger) => triggerMatches(trigger, liveContext, locationMode, calendarEvents, now)).map((trigger) => trigger.routineId));
  const rankedToday = [...todayRoutines].sort((a,b) => {
    const aActive = activeRunByRoutine.has(a.id) ? -3 : 0;
    const bActive = activeRunByRoutine.has(b.id) ? -3 : 0;
    if (aActive !== bActive) return aActive - bActive;
    const aTrigger = matchedTriggerIds.has(a.id) ? -2 : 0;
    const bTrigger = matchedTriggerIds.has(b.id) ? -2 : 0;
    if (aTrigger !== bTrigger) return aTrigger - bTrigger;
    const aBand = a.timeOfDay === currentBand ? 0 : a.timeOfDay === 'anytime' ? 1 : 2;
    const bBand = b.timeOfDay === currentBand ? 0 : b.timeOfDay === 'anytime' ? 1 : 2;
    if (aBand !== bBand) return aBand - bBand;
    return durationFor(a) - durationFor(b);
  });
  const rightNow = rankedToday[0] ?? routines[0] ?? null;
  const recommendedSteps = rightNow ? fitSteps(eligibleStepsFor(rightNow), adaptiveMode, availableMinutes, engine.stats) : [];
  const recommendedMinutes = recommendedSteps.reduce((sum, step) => sum + estimateStepMinutes(step, engine.stats), 0);
  const nextEvent = [...calendarEvents].filter((event) => !event.allDay && event.startAt > now).sort((a,b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null;
  const leaveBy = nextEvent ? new Date(nextEvent.startAt.getTime() - (nextEvent.location ? travelMinutes : 0) * 60000) : null;
  const startBy = nextEvent && rightNow ? new Date((leaveBy ?? nextEvent.startAt).getTime() - recommendedMinutes * 60000) : null;
  const matchedTriggers = engine.triggers.filter((trigger) => matchedTriggerIds.has(trigger.routineId));
  const recentHistory = engine.history.slice(0, 8);

  async function refreshLiveContext() {
    if (!navigator.geolocation) {
      setLiveContext({ status: 'unavailable', error: 'Geolocation is not supported by this browser.' });
      return;
    }
    setLiveContext({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation&temperature_unit=fahrenheit&timezone=auto`);
        if (!response.ok) throw new Error('Weather service unavailable');
        const data = await response.json() as { current?: { temperature_2m?: number; precipitation?: number } };
        setLiveContext({ status: 'ready', latitude, longitude, temperature: data.current?.temperature_2m, precipitationProbability: (data.current?.precipitation ?? 0) > 0 ? 100 : 0 });
        setNotice('Live location and weather context refreshed. Glow will evaluate conditional steps and triggers against it.');
      } catch {
        setLiveContext({ status: 'ready', latitude, longitude, error: 'Location is available, but live weather could not be loaded.' });
      }
    }, () => setLiveContext({ status: 'unavailable', error: 'Location permission was not granted. Manual Home/Out/Work/Gym context still works.' }), { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  }

  function handleSaved(routine: Routine) {
    setRoutines((current) => current.some((item) => item.id === routine.id) ? current.map((item) => item.id === routine.id ? routine : item) : [routine, ...current]);
    setDialogRoutine(null);
    setNotice('Routine saved.');
    router.refresh();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setRoutines((current) => current.filter((item) => item.id !== deleteTarget.id));
      setSteps((current) => current.filter((item) => item.routineId !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice('Routine deleted.');
      router.refresh();
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
      router.refresh();
    });
  }

  function handleRemoveStep(step: RoutineStep) {
    removeStep.run(step.id, () => {
      setSteps((current) => current.filter((item) => item.id !== step.id));
      setNotice('Step removed.');
      router.refresh();
    });
  }

  function moveStep(routineId: string, stepId: string, direction: -1 | 1) {
    if (reordering) return;
    const original = [...(stepsByRoutine.get(routineId) ?? [])];
    const index = original.findIndex((item) => item.id === stepId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= original.length) return;
    const reordered = [...original];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    const next = reordered.map((item, order) => ({ ...item, order }));
    setSteps((current) => current.map((item) => next.find((updated) => updated.id === item.id) ?? item));
    startReorder(async () => {
      const results = await Promise.all(next.map((item) => updateRoutineStepAction(item.id, { order: item.order })));
      if (results.some((result) => !result.data)) {
        setSteps((current) => current.map((item) => original.find((old) => old.id === item.id) ?? item));
        setNotice('Glow could not save the order. The previous order was restored.');
        return;
      }
      setNotice('Step order saved permanently.');
      router.refresh();
    });
  }

  function startRoutine(routine: Routine, requestedMode: RoutineMode = adaptiveMode) {
    const mode = requestedMode;
    const eligible = eligibleStepsFor(routine);
    const queue = fitSteps(eligible, mode, availableMinutes, engine.stats).map((step) => step.id);
    startBusy(async () => {
      const result = await startRoutineRunAction({ routineId: routine.id, mode, queueStepIds: queue, context: { locationMode, ...liveContext } });
      if (!result.data) {
        setNotice('Glow could not create the cross-device routine run.');
        return;
      }
      setActiveRun(result.data);
      setPlayerMode((result.data.mode as RoutineMode) ?? mode);
      setPlaying(routine);
      setEngine((current) => ({ ...current, activeRuns: [result.data!, ...current.activeRuns.filter((run) => run.id !== result.data!.id)] }));
    });
  }

  function continueRun(run: RoutineRun) {
    const routine = routines.find((item) => item.id === run.routineId);
    if (!routine) return;
    setActiveRun(run);
    setPlayerMode((run.mode as RoutineMode) ?? 'normal');
    setPlaying(routine);
  }

  function handleChain(routineId: string, run: RoutineRun) {
    const nextRoutine = routines.find((item) => item.id === routineId);
    if (!nextRoutine) {
      setNotice('The chained routine exists in history but is no longer available in the current library.');
      setPlaying(null);
      return;
    }
    const nextMode = (run.mode as RoutineMode) ?? adaptiveMode;
    const queue = fitSteps(eligibleStepsFor(nextRoutine), nextMode, availableMinutes, engine.stats).map((step) => step.id);
    startBusy(async () => {
      const adjusted = await updateRoutineRunAction(run.id, { queueStepIds: queue, currentIndex: 0, context: { locationMode, ...liveContext } });
      const nextRun = adjusted.data ?? run;
      setEngine((current) => ({ ...current, activeRuns: [nextRun, ...current.activeRuns.filter((item) => item.id !== nextRun.id && item.status === 'active')] }));
      setActiveRun(nextRun);
      setPlayerMode(nextMode);
      setPlaying(nextRoutine);
      setNotice(`Chain continued automatically into ${nextRoutine.name}.`);
    });
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
    const candidate = rankedToday[0];
    if (!candidate) {
      setAssistantReply('Create your first routine and Glow will build a right-now sequence from it.');
      return;
    }
    const chosen = fitSteps(eligibleStepsFor(candidate), mode, nextMinutes, engine.stats);
    const used = chosen.reduce((sum, step) => sum + estimateStepMinutes(step, engine.stats), 0);
    const triggered = matchedTriggerIds.has(candidate.id) ? ' A saved trigger also matches right now.' : '';
    const calendar = nextEvent && startBy ? ` Your next event is ${nextEvent.title}; start this routine by ${startBy.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}${nextEvent.location ? ` and leave by ${leaveBy?.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}` : ''}.` : '';
    setAssistantReply(`${candidate.name} is the strongest match. Use the ${mode} version: ${chosen.length} step${chosen.length === 1 ? '' : 's'}, about ${used} minutes.${triggered}${calendar}`);
  }

  function saveChain(sourceRoutineId: string, nextRoutineId: string) {
    startBusy(async () => {
      const result = await setRoutineChainAction(sourceRoutineId, nextRoutineId || null);
      if (result.data || !nextRoutineId) {
        setNotice(nextRoutineId ? 'Automatic next-routine chain saved.' : 'Routine chain removed.');
        router.refresh();
      }
    });
  }

  function addTrigger() {
    if (!triggerRoutineId || !triggerValue.trim()) return;
    const config: Record<string, unknown> = triggerType === 'time'
      ? { time: triggerValue.trim(), windowMinutes: 30 }
      : triggerType === 'calendar'
        ? { keyword: triggerValue.trim(), beforeMinutes: 60 }
        : triggerType === 'weather'
          ? { condition: triggerValue.trim(), threshold: triggerValue === 'cold' ? 50 : triggerValue === 'hot' ? 80 : 40 }
          : { mode: triggerValue.trim() };
    startBusy(async () => {
      const result = await createRoutineTriggerAction({ routineId: triggerRoutineId, triggerType, config });
      if (result.data) {
        setNotice('Trigger saved. It is evaluated in-app whenever Glow is open or context refreshes.');
        router.refresh();
      }
    });
  }

  function addLink(stepId: string) {
    if (!linkTarget.trim()) return;
    startBusy(async () => {
      const result = await linkRoutineStepAction({ stepId, targetType: linkType, targetId: linkTarget.trim(), metadata: linkType === 'fitness' ? { workoutType: linkTarget.trim() } : {} });
      if (result.data) {
        setNotice('One-source completion link saved. Completing this routine step will update the linked source.');
        setLinkTarget('');
        router.refresh();
      }
    });
  }

  function addRule(stepId: string) {
    if (!ruleValue.trim()) return;
    const config: Record<string, unknown> = ruleType === 'location'
      ? { mode: ruleValue.trim() }
      : ruleType === 'weather'
        ? { condition: ruleValue.trim(), threshold: ruleValue === 'cold' ? 50 : ruleValue === 'hot' ? 80 : 40 }
        : { keyword: ruleValue.trim(), withinMinutes: 240 };
    startBusy(async () => {
      const result = await createRoutineStepRuleAction({ stepId, ruleType, config });
      if (result.data) {
        setNotice('Conditional step rule saved. Unknown live context will not silently remove the step; Glow only hides it on a clear non-match.');
        router.refresh();
      }
    });
  }

  const heroRun = rightNow ? activeRunByRoutine.get(rightNow.id) : null;

  return (
    <div className="mx-auto max-w-[1380px] space-y-7 pb-28">
      {notice ? <div role="status" className="sticky top-3 z-[160] mx-auto w-fit max-w-[92vw] rounded-full border border-[#eaded8] bg-white/95 px-4 py-2.5 text-[11px] text-[#6e625b] shadow-lg backdrop-blur">{notice}</div> : null}

      <section className="relative overflow-hidden rounded-[32px] border border-[#F1E7E3]">
        <EditableRoomImage slot="routines:hero" label="Routines hero" className="min-h-[360px] sm:min-h-[400px]">
          <div className="relative z-10 flex h-full items-end bg-[linear-gradient(0deg,rgba(32,24,22,.75),rgba(32,24,22,.08)_72%)] p-6 sm:p-9">
            <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div className="max-w-2xl text-white">
                <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/70">Routines Right Now · {now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p>
                <h1 className="glow-display mt-2 text-[42px] leading-none sm:text-[56px]">{rightNow?.name ?? 'Your guided rhythm'}</h1>
                <p className="mt-3 max-w-xl text-[13px] leading-6 text-white/82">{rightNow ? `${heroRun ? 'Cross-device run active' : `${adaptiveMode} version`} · ${recommendedSteps.length} eligible steps · ~${recommendedMinutes} min` : 'Build routines that adapt to time, energy, Calendar, context, and your actual completion history.'}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {rightNow ? <button type="button" disabled={busy} onClick={() => heroRun ? continueRun(heroRun) : startRoutine(rightNow)} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[12px] font-semibold text-[#3b302c] disabled:opacity-50"><Play size={14}/>{heroRun ? 'Continue Saved Run' : 'Start Recommended'}</button> : null}
                  <button type="button" onClick={() => { setEnergy('low'); setAvailableMinutes(10); }} className="rounded-full border border-white/35 bg-white/10 px-4 py-3 text-[12px] text-white backdrop-blur">Quick Reset</button>
                  <button type="button" onClick={() => setAssistantInput('What should I do right now?')} className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-3 text-[12px] text-white backdrop-blur"><Mic2 size={14}/>Ask Glow</button>
                </div>
              </div>
              <div className="rounded-[24px] border border-white/20 bg-white/12 p-5 text-white backdrop-blur-xl">
                <div className="flex items-center gap-2"><Sparkles size={14}/><span className="text-[10px] font-semibold uppercase tracking-[.14em]">Glow engine</span></div>
                <p className="mt-3 text-[13px] leading-6 text-white/85">{heroRun ? `Run ${heroRun.id.slice(0,6)} is saved on the server at step ${heroRun.currentIndex + 1}.` : rightNow ? `${rightNow.name} is ranked using today, current time, saved triggers, energy, available time, learned step duration, and conditions.` : 'Create a routine to activate the engine.'}</p>
                {nextEvent && startBy ? <div className="mt-3 rounded-2xl bg-white/10 p-3 text-[11px] leading-5"><strong>Next event:</strong> {nextEvent.title}<br/>Start routine by {startBy.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}{nextEvent.location ? <> · Leave by {leaveBy?.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</> : null}</div> : null}
              </div>
            </div>
          </div>
        </EditableRoomImage>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-[#eee2dd] bg-white p-5"><div className="flex items-center gap-2 text-[#9d5e69]"><RefreshCw size={15}/><span className="text-[10px] font-semibold uppercase tracking-[.14em]">Cross-device</span></div><p className="glow-display mt-3 text-[24px] text-[#2B2420]">{engine.activeRuns.length} active</p><p className="mt-2 text-[11px] leading-5 text-[#81756e]">Runs live in Glow’s database, not only localStorage. Open Routines on another signed-in device to resume.</p></div>
        <div className="rounded-[24px] border border-[#eee2dd] bg-white p-5"><div className="flex items-center gap-2 text-[#8b7b56]"><Gauge size={15}/><span className="text-[10px] font-semibold uppercase tracking-[.14em]">Learned time</span></div><p className="glow-display mt-3 text-[24px] text-[#2B2420]">{engine.stats.reduce((sum,item) => sum + item.sampleCount,0)} samples</p><p className="mt-2 text-[11px] leading-5 text-[#81756e]">Glow learns from actual Done timestamps. Configured estimates remain the fallback until enough history exists.</p></div>
        <div className="rounded-[24px] border border-[#eee2dd] bg-white p-5"><div className="flex items-center gap-2 text-[#6d826a]"><CalendarClock size={15}/><span className="text-[10px] font-semibold uppercase tracking-[.14em]">Calendar timing</span></div><p className="glow-display mt-3 text-[22px] text-[#2B2420]">{startBy ? startBy.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : 'Clear'}</p><p className="mt-2 text-[11px] leading-5 text-[#81756e]">{nextEvent ? `Suggested routine start before ${nextEvent.title}. ${nextEvent.location ? `${travelMinutes}m travel is a user-set estimate, not live Maps traffic.` : 'No travel buffer because the event has no location.'}` : 'No future timed Calendar event is constraining the current routine.'}</p></div>
        <div className="rounded-[24px] border border-[#eee2dd] bg-white p-5"><div className="flex items-center gap-2 text-[#7b6d89]"><Zap size={15}/><span className="text-[10px] font-semibold uppercase tracking-[.14em]">Triggers</span></div><p className="glow-display mt-3 text-[24px] text-[#2B2420]">{matchedTriggers.length} ready</p><p className="mt-2 text-[11px] leading-5 text-[#81756e]">Persistent time, Calendar, weather, and location triggers are evaluated in-app. Background push alerts are not falsely claimed here.</p></div>
      </section>

      <section className="rounded-[26px] border border-[#eee2dd] bg-[#fffaf7] p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Adaptive context</p>
            <h2 className="glow-display mt-1 text-[25px] text-[#2B2420]">Tell Glow what today can hold</h2>
            <div className="mt-4"><p className="text-[10px] font-semibold text-[#6c6059]">Energy</p><div className="mt-2 flex flex-wrap gap-2">{(['high','normal','low','exhausted'] as Energy[]).map((item) => <button key={item} type="button" onClick={() => setEnergy(item)} className={`rounded-full px-3 py-2 text-[10.5px] capitalize ${energy === item ? 'bg-[#2B2420] text-white' : 'border border-[#eaded8] bg-white text-[#6f635c]'}`}>{item}</button>)}</div></div>
            <div className="mt-4"><p className="text-[10px] font-semibold text-[#6c6059]">I have</p><div className="mt-2 flex flex-wrap gap-2">{TIME_OPTIONS.map((value) => <button key={value} type="button" onClick={() => setAvailableMinutes(value)} className={`rounded-full px-3 py-2 text-[10.5px] ${availableMinutes === value ? 'bg-[#c9727e] text-white' : 'border border-[#eaded8] bg-white text-[#6f635c]'}`}>{value === 90 ? '45+ min' : `${value} min`}</button>)}</div></div>
            <div className="mt-4"><p className="text-[10px] font-semibold text-[#6c6059]">Where are you?</p><div className="mt-2 flex flex-wrap gap-2">{(['anywhere','home','out','work','gym'] as LocationMode[]).map((item) => <button key={item} type="button" onClick={() => setLocationMode(item)} className={`rounded-full px-3 py-2 text-[10.5px] capitalize ${locationMode === item ? 'bg-[#6f826d] text-white' : 'border border-[#eaded8] bg-white text-[#6f635c]'}`}>{item}</button>)}</div></div>
          </div>
          <div className="rounded-[22px] border border-[#eaded8] bg-white p-5">
            <div className="flex items-center gap-2"><MapPin size={14} className="text-[#6f826d]"/><h3 className="text-[13px] font-semibold text-[#332b27]">Live weather + location context</h3></div>
            <p className="mt-2 text-[11px] leading-5 text-[#81756e]">Glow only requests your device location when you press the button. Manual Home/Out/Work/Gym mode works without permission.</p>
            <button type="button" onClick={refreshLiveContext} disabled={liveContext.status === 'loading'} className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#eef3eb] px-4 py-2.5 text-[11px] font-semibold text-[#5f765d] disabled:opacity-50"><CloudRain size={13}/>{liveContext.status === 'loading' ? 'Refreshing…' : 'Refresh live context'}</button>
            {liveContext.status === 'ready' ? <div className="mt-3 rounded-2xl bg-[#faf7f3] p-3 text-[10.5px] leading-5 text-[#71665f]">{typeof liveContext.temperature === 'number' ? `${Math.round(liveContext.temperature)}°F` : 'Temperature unavailable'} · {liveContext.precipitationProbability ? 'precipitation detected now' : 'no current precipitation detected'}{liveContext.error ? ` · ${liveContext.error}` : ''}</div> : liveContext.error ? <p className="mt-3 text-[10.5px] text-[#9b646b]">{liveContext.error}</p> : null}
            {nextEvent?.location ? <div className="mt-4"><label className="text-[10px] font-semibold text-[#6c6059]" htmlFor="travel-estimate">Travel estimate for Calendar calculations</label><select id="travel-estimate" value={travelMinutes} onChange={(event) => setTravelMinutes(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-[#eaded8] bg-white px-3 py-2 text-[11px]">{[0,15,30,45,60].map((value) => <option key={value} value={value}>{value} min</option>)}</select></div> : null}
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-[#eee2dd] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Trigger Center</p><h2 className="glow-display mt-1 text-[25px] text-[#2B2420]">Routines that are ready because something changed</h2></div><span className="rounded-full bg-[#f5efe9] px-3 py-1.5 text-[9.5px] text-[#7d7068]">In-app evaluation · persistent config</span></div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{matchedTriggers.length ? matchedTriggers.map((trigger) => { const routine = routines.find((item) => item.id === trigger.routineId); return <div key={trigger.id} className="rounded-[20px] border border-[#eaded8] bg-[#fffaf8] p-4"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-[#fbe4e8] px-2.5 py-1 text-[9px] font-semibold uppercase text-[#9a5863]">{trigger.triggerType}</span><button type="button" onClick={() => startBusy(async () => { await toggleRoutineTriggerAction(trigger.id, false); router.refresh(); })} className="text-[9.5px] text-[#968980]">Disable</button></div><p className="mt-3 text-[13px] font-semibold text-[#332b27]">{routine?.name ?? 'Routine'}</p><p className="mt-1 text-[10.5px] text-[#81756e]">Trigger matches the current Glow context.</p>{routine ? <button type="button" onClick={() => startRoutine(routine)} className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#2B2420] px-3 py-2 text-[10.5px] text-white"><Play size={11}/>Start</button> : null}</div>; }) : <div className="rounded-[20px] border border-dashed border-[#e6d9d3] p-5 text-[11px] leading-5 text-[#897d76]">No saved trigger matches right now. Weather triggers need live context permission; location-mode triggers use the manual context above.</div>}</div>
        <div className="mt-5 grid gap-2 md:grid-cols-4"><select value={triggerRoutineId} onChange={(event) => setTriggerRoutineId(event.target.value)} className="rounded-xl border border-[#eaded8] bg-white px-3 py-2.5 text-[11px]"><option value="">Choose routine</option>{routines.map((routine) => <option key={routine.id} value={routine.id}>{routine.name}</option>)}</select><select value={triggerType} onChange={(event) => { const value = event.target.value as typeof triggerType; setTriggerType(value); setTriggerValue(value === 'time' ? '20:30' : value === 'weather' ? 'rain' : value === 'location' ? 'home' : 'appointment'); }} className="rounded-xl border border-[#eaded8] bg-white px-3 py-2.5 text-[11px]"><option value="time">Time</option><option value="calendar">Calendar</option><option value="weather">Weather</option><option value="location">Location mode</option></select>{triggerType === 'weather' ? <select value={triggerValue} onChange={(event) => setTriggerValue(event.target.value)} className="rounded-xl border border-[#eaded8] bg-white px-3 py-2.5 text-[11px]"><option value="rain">Rain</option><option value="dry">Dry</option><option value="cold">Cold</option><option value="hot">Hot</option></select> : triggerType === 'location' ? <select value={triggerValue} onChange={(event) => setTriggerValue(event.target.value)} className="rounded-xl border border-[#eaded8] bg-white px-3 py-2.5 text-[11px]"><option value="home">Home</option><option value="out">Out</option><option value="work">Work</option><option value="gym">Gym</option></select> : <input value={triggerValue} onChange={(event) => setTriggerValue(event.target.value)} placeholder={triggerType === 'time' ? '20:30' : 'Calendar keyword'} className="rounded-xl border border-[#eaded8] bg-white px-3 py-2.5 text-[11px]"/>}<button type="button" disabled={busy || !triggerRoutineId} onClick={addTrigger} className="rounded-xl bg-[#2B2420] px-4 py-2.5 text-[11px] font-semibold text-white disabled:opacity-40">Add trigger</button></div>
        {engine.triggers.length ? <div className="mt-4 flex flex-wrap gap-2">{engine.triggers.map((trigger) => <button key={trigger.id} type="button" onClick={() => startBusy(async () => { await toggleRoutineTriggerAction(trigger.id, !trigger.enabled); router.refresh(); })} className={`rounded-full border px-3 py-1.5 text-[9.5px] ${trigger.enabled ? 'border-[#d9e4d5] bg-[#f2f7ef] text-[#60745e]' : 'border-[#eaded8] text-[#998c84]'}`}>{trigger.triggerType} · {routines.find((r) => r.id === trigger.routineId)?.name ?? 'routine'} · {trigger.enabled ? 'on' : 'off'}</button>)}</div> : null}
      </section>

      <section className="rounded-[24px] border border-[#F1E7E3] bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Today’s Rhythm</p><h2 className="glow-display mt-1 text-[23px] text-[#2B2420]">Morning → Midday → Evening → Night</h2></div><span className="rounded-full bg-[#fbe4e8] px-3 py-1.5 text-[10px] font-medium text-[#8c4e59]">You are here · {currentBand}</span></div>
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">{FLOW.map((item) => { const active = item.key === currentBand; const count = todayRoutines.filter((routine) => routine.timeOfDay === item.key || routine.timeOfDay === 'anytime').length; return <div key={item.key} className={`rounded-2xl border p-3 text-center ${active ? 'border-[#c9727e] bg-[#fff5f6]' : 'border-[#f0e7e2] bg-[#fcfaf8]'}`}><div className="text-[22px]">{item.icon}</div><p className="mt-1 text-[11px] font-semibold text-[#3d342f]">{item.label}</p><p className="text-[9.5px] text-[#9a8f87]">{item.time} · {count} routine{count === 1 ? '' : 's'}</p>{active ? <p className="mt-2 text-[9px] font-bold uppercase tracking-[.1em] text-[#c9727e]">Now</p> : null}</div>; })}</div>
      </section>

      <section className="rounded-[24px] border border-[#F1E7E3] bg-[#fffaf8] p-4 sm:p-5">
        <div className="flex items-center gap-2"><WandSparkles size={15} className="text-[#c9727e]"/><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Routine intelligence</p><h2 className="glow-display text-[22px] text-[#2B2420]">Ask Glow what fits</h2></div></div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={assistantInput} onChange={(event) => setAssistantInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') askGlow(); }} placeholder="Try: I have 15 minutes before I leave and I’m tired" className="min-w-0 flex-1 rounded-2xl border border-[#eaded8] bg-white px-4 py-3 text-[12px] text-[#3b332e]"/><button type="button" onClick={askGlow} className="rounded-2xl bg-[#2B2420] px-5 py-3 text-[12px] font-semibold text-white">Build my plan</button></div>
        {assistantReply ? <div aria-live="polite" className="mt-3 rounded-2xl border border-[#f0d9de] bg-white p-4 text-[11.5px] leading-5 text-[#6c5d58]">{assistantReply}</div> : null}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.16em] text-[#b66d78]">Routine Library</p><h2 className="glow-display mt-1 text-[27px] text-[#2B2420]">Guided routines + real connections</h2></div><button type="button" onClick={() => setDialogRoutine('new')} className="inline-flex items-center gap-1.5 rounded-full bg-[#c9727e] px-4 py-2.5 text-[11px] font-medium text-white"><Plus size={13}/>Create routine</button></div>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">{routines.map((routine, cardIndex) => {
          const routineSteps = stepsByRoutine.get(routine.id) ?? [];
          const isOpen = expanded === routine.id;
          const Icon = TIME_ICON[routine.timeOfDay] ?? RefreshCw;
          const run = activeRunByRoutine.get(routine.id);
          const chain = engine.chains.find((item) => item.sourceRoutineId === routine.id && item.enabled);
          const learned = durationFor(routine);
          const completedRuns = engine.history.filter((item) => item.routineId === routine.id);
          return <article key={routine.id} className="overflow-hidden rounded-[26px] border border-[#F1E7E3] bg-white"><div className="bg-[linear-gradient(135deg,#fff9f6,#f4eee8)] p-5 sm:p-6"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[26px]">{['🌅','🌿','🪞','🎀','🌙','🏠'][cardIndex % 6]}</div><p className="mt-2 break-words text-[15px] font-semibold text-[#2B2420]">{routine.name}</p><p className="mt-1 text-[10.5px] capitalize text-[#8d8179]">{routine.timeOfDay} · {routineSteps.length} steps · learned/configured ~{learned} min</p></div><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#c9727e]"><Icon size={16}/></span></div><div className="mt-4 flex flex-wrap gap-2 text-[9.5px]">{run ? <span className="rounded-full bg-[#eef5eb] px-3 py-1.5 text-[#60755d]">Cross-device run active · step {run.currentIndex + 1}</span> : null}{matchedTriggerIds.has(routine.id) ? <span className="rounded-full bg-[#fbe4e8] px-3 py-1.5 text-[#965661]">Trigger ready</span> : null}{chain ? <span className="rounded-full bg-[#eeeaf4] px-3 py-1.5 text-[#70637f]">Then → {routines.find((item) => item.id === chain.nextRoutineId)?.name ?? 'next routine'}</span> : null}{completedRuns.length ? <span className="rounded-full bg-white px-3 py-1.5 text-[#7f736c]">{completedRuns.length} saved run{completedRuns.length === 1 ? '' : 's'} in recent history</span> : null}</div></div>
          <div className="flex flex-wrap gap-2 p-4"><button type="button" disabled={busy} onClick={() => run ? continueRun(run) : startRoutine(routine)} className="inline-flex items-center gap-1.5 rounded-full bg-[#2B2420] px-3 py-2 text-[10.5px] font-medium text-white disabled:opacity-50"><Play size={11}/>{run ? 'Continue' : 'Start'}</button><button type="button" onClick={() => setExpanded(isOpen ? null : routine.id)} className="inline-flex items-center gap-1 rounded-full border border-[#eaded8] px-3 py-2 text-[10.5px] text-[#665b55]">{isOpen ? 'Hide studio' : 'Open studio'}<ChevronDown size={11}/></button><button type="button" onClick={() => setDialogRoutine(routine)} className="rounded-full border border-[#eaded8] p-2 text-[#766a64]" aria-label="Edit routine"><Pencil size={12}/></button><button type="button" onClick={() => setDeleteTarget(routine)} className="rounded-full border border-[#eaded8] p-2 text-[#766a64]" aria-label="Delete routine"><Trash2 size={12}/></button></div>
          {isOpen ? <div className="border-t border-[#F1E7E3] bg-[#fdfaf8] p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[1.3fr_.7fr]"><div><p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9e626d]">Steps</p><ol className="mt-3 space-y-2">{routineSteps.map((step, index) => { const stat = engine.stats.find((item) => item.stepId === step.id); const links = engine.links.filter((item) => item.stepId === step.id); const rules = engine.rules.filter((item) => item.stepId === step.id); const advancedOpen = selectedStep === step.id; return <li key={step.id} className="rounded-2xl border border-[#eee4df] bg-white p-3"><div className="flex items-center gap-2"><GripVertical size={12} className="text-[#c0b5ae]"/><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fbe4e8] text-[9px] font-semibold text-[#a65d69]">{index + 1}</span><div className="min-w-0 flex-1"><p className="break-words text-[11.5px] text-[#3f3732]">{step.title}</p><p className="text-[9px] text-[#9b9089]">{stat?.sampleCount && stat.sampleCount >= 2 ? `learned ${Math.max(1,Math.round(stat.averageSeconds/60))}m from ${stat.sampleCount} runs` : `configured ${step.durationMinutes ?? 5}m`}{links.length ? ` · ${links.length} linked source${links.length === 1 ? '' : 's'}` : ''}{rules.length ? ` · ${rules.length} condition${rules.length === 1 ? '' : 's'}` : ''}</p></div><button type="button" disabled={reordering || index === 0} onClick={() => moveStep(routine.id, step.id, -1)} className="rounded p-1 text-[#9b9089] disabled:opacity-25" aria-label="Move step earlier">↑</button><button type="button" disabled={reordering || index === routineSteps.length - 1} onClick={() => moveStep(routine.id, step.id, 1)} className="rounded p-1 text-[#9b9089] disabled:opacity-25" aria-label="Move step later">↓</button><button type="button" onClick={() => setSelectedStep(advancedOpen ? null : step.id)} className="rounded p-1 text-[#8b7e77]" aria-label="Configure step"><Link2 size={11}/></button><button type="button" onClick={() => handleRemoveStep(step)} className="rounded p-1 text-[#b8ada6]" aria-label="Remove step"><Trash2 size={10}/></button></div>
              {advancedOpen ? <div className="mt-3 grid gap-3 border-t border-[#f0e7e2] pt-3 md:grid-cols-2"><div className="rounded-xl bg-[#faf7f3] p-3"><p className="text-[9.5px] font-semibold uppercase text-[#786b64]">One-source completion</p><div className="mt-2 flex gap-2"><select value={linkType} onChange={(event) => { const value = event.target.value as typeof linkType; setLinkType(value); setLinkTarget(''); }} className="min-w-0 flex-1 rounded-lg border border-[#e8ddd7] bg-white px-2 py-2 text-[10px]"><option value="task">Task</option><option value="habit">Habit</option><option value="fitness">Fitness log</option></select>{linkType === 'task' ? <select value={linkTarget} onChange={(event) => setLinkTarget(event.target.value)} className="min-w-0 flex-[1.5] rounded-lg border border-[#e8ddd7] bg-white px-2 py-2 text-[10px]"><option value="">Choose task</option>{tasks.filter((task) => task.status !== 'done').map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select> : linkType === 'habit' ? <select value={linkTarget} onChange={(event) => setLinkTarget(event.target.value)} className="min-w-0 flex-[1.5] rounded-lg border border-[#e8ddd7] bg-white px-2 py-2 text-[10px]"><option value="">Choose habit</option>{habits.map((habit) => <option key={habit.id} value={habit.id}>{habit.name}</option>)}</select> : <input value={linkTarget} onChange={(event) => setLinkTarget(event.target.value)} placeholder="Workout type" className="min-w-0 flex-[1.5] rounded-lg border border-[#e8ddd7] bg-white px-2 py-2 text-[10px]"/>}<button type="button" disabled={busy || !linkTarget} onClick={() => addLink(step.id)} className="rounded-lg bg-[#2B2420] px-2.5 text-[10px] text-white disabled:opacity-40">Link</button></div><div className="mt-2 flex flex-wrap gap-1.5">{links.map((link) => <button key={link.id} type="button" onClick={() => startBusy(async () => { await unlinkRoutineStepAction(link.id); router.refresh(); })} className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] text-[#6f635c]">{link.targetType}: {link.targetType === 'task' ? tasks.find((item) => item.id === link.targetId)?.title ?? 'task' : link.targetType === 'habit' ? habits.find((item) => item.id === link.targetId)?.name ?? 'habit' : String(link.metadata?.workoutType ?? link.targetId)} <Unlink size={9}/></button>)}</div></div>
                <div className="rounded-xl bg-[#faf7f3] p-3"><p className="text-[9.5px] font-semibold uppercase text-[#786b64]">Conditional step</p><div className="mt-2 flex gap-2"><select value={ruleType} onChange={(event) => { const value = event.target.value as typeof ruleType; setRuleType(value); setRuleValue(value === 'location' ? 'home' : value === 'weather' ? 'rain' : 'appointment'); }} className="min-w-0 flex-1 rounded-lg border border-[#e8ddd7] bg-white px-2 py-2 text-[10px]"><option value="location">Location</option><option value="weather">Weather</option><option value="calendar">Calendar</option></select>{ruleType === 'location' ? <select value={ruleValue} onChange={(event) => setRuleValue(event.target.value)} className="min-w-0 flex-[1.5] rounded-lg border border-[#e8ddd7] bg-white px-2 py-2 text-[10px]"><option value="home">Home</option><option value="out">Out</option><option value="work">Work</option><option value="gym">Gym</option></select> : ruleType === 'weather' ? <select value={ruleValue} onChange={(event) => setRuleValue(event.target.value)} className="min-w-0 flex-[1.5] rounded-lg border border-[#e8ddd7] bg-white px-2 py-2 text-[10px]"><option value="rain">Rain</option><option value="dry">Dry</option><option value="cold">Cold</option><option value="hot">Hot</option></select> : <input value={ruleValue} onChange={(event) => setRuleValue(event.target.value)} placeholder="Calendar keyword" className="min-w-0 flex-[1.5] rounded-lg border border-[#e8ddd7] bg-white px-2 py-2 text-[10px]"/>}<button type="button" disabled={busy || !ruleValue} onClick={() => addRule(step.id)} className="rounded-lg bg-[#6f826d] px-2.5 text-[10px] text-white disabled:opacity-40">Add</button></div><div className="mt-2 flex flex-wrap gap-1.5">{rules.map((rule) => <button key={rule.id} type="button" onClick={() => startBusy(async () => { await toggleRoutineStepRuleAction(rule.id, !rule.enabled); router.refresh(); })} className={`rounded-full px-2.5 py-1 text-[9px] ${rule.enabled ? 'bg-[#edf3ea] text-[#60745e]' : 'bg-white text-[#988b83]'}`}>{rule.ruleType} · {rule.enabled ? 'on' : 'off'}</button>)}</div></div></div> : null}
            </li>; })}</ol><div className="mt-3 flex gap-2"><input value={newStepTitle[routine.id] ?? ''} onChange={(event) => setNewStepTitle((current) => ({ ...current, [routine.id]: event.target.value }))} onKeyDown={(event) => { if (event.key === 'Enter') handleAddStep(routine); }} placeholder="Add routine step" className="min-w-0 flex-1 rounded-xl border border-[#eaded8] bg-white px-3 py-2 text-[11px]"/><button type="button" disabled={addStep.isPending || !(newStepTitle[routine.id] ?? '').trim()} onClick={() => handleAddStep(routine)} className="rounded-xl bg-[#2B2420] px-3 py-2 text-[10.5px] text-white disabled:opacity-40">Add</button></div></div>
            <div className="space-y-3"><div className="rounded-2xl border border-[#eee4df] bg-white p-4"><div className="flex items-center gap-2"><Route size={13} className="text-[#786a86]"/><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#786a86]">Automatic chain</p></div><p className="mt-2 text-[10.5px] leading-5 text-[#81756e]">When this routine is finished, Glow creates the next run on the server and the player opens it automatically.</p><select value={chain?.nextRoutineId ?? ''} onChange={(event) => saveChain(routine.id, event.target.value)} className="mt-3 w-full rounded-xl border border-[#eaded8] bg-white px-3 py-2 text-[10.5px]"><option value="">No next routine</option>{routines.filter((item) => item.id !== routine.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div className="rounded-2xl border border-[#eee4df] bg-white p-4"><div className="flex items-center gap-2"><History size={13} className="text-[#8e6b55]"/><p className="text-[10px] font-semibold uppercase tracking-[.13em] text-[#8e6b55]">Timing history</p></div>{completedRuns.length ? <div className="mt-3 space-y-2">{completedRuns.slice(0,4).map((history) => <div key={history.id} className="flex items-center justify-between rounded-xl bg-[#faf7f3] px-3 py-2 text-[9.5px] text-[#6f635c]"><span>{history.completedAt?.toLocaleDateString() ?? 'Completed'}</span><span>{minutesLabel(Math.max(1,Math.round(history.actualSeconds/60)))} · {history.mode}</span></div>)}</div> : <p className="mt-2 text-[10.5px] text-[#91857d]">No completed server runs yet.</p>}</div></div></div>
          </div> : null}</article>;
        })}</div>
      </section>

      <section className="rounded-[26px] border border-[#eee2dd] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><History size={15} className="text-[#9e626d]"/><div><p className="text-[9px] font-semibold uppercase tracking-[.15em] text-[#b66d78]">Cross-device History</p><h2 className="glow-display text-[23px] text-[#2B2420]">What Glow has actually learned</h2></div></div><div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-4">{recentHistory.length ? recentHistory.map((run) => <div key={run.id} className="rounded-2xl bg-[#faf7f3] p-4"><p className="text-[11px] font-semibold text-[#3f3732]">{routines.find((routine) => routine.id === run.routineId)?.name ?? 'Routine'}</p><p className="mt-1 text-[9.5px] text-[#8d8179]">{run.completedAt?.toLocaleString() ?? 'Completed'} · {run.mode}</p><p className="mt-2 text-[10.5px] text-[#645a54]">Actual tracked time: {minutesLabel(Math.max(1,Math.round(run.actualSeconds/60)))}</p></div>) : <p className="text-[11px] text-[#8d8179]">Complete a routine in the new player to begin real timing history.</p>}</div></section>

      <Dialog open={dialogRoutine !== null} onClose={() => setDialogRoutine(null)} title={dialogRoutine === 'new' ? 'Add routine' : 'Edit routine'}><RoutineForm routine={dialogRoutine === 'new' ? null : dialogRoutine} onSaved={handleSaved} onCancel={() => setDialogRoutine(null)}/></Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this routine?" description={deleteTarget ? `“${deleteTarget.name}” will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete}/>
      {playing ? <RoutineStepPlayer routine={playing} steps={stepsByRoutine.get(playing.id) ?? []} initialMode={playerMode} initialRun={activeRun?.routineId === playing.id ? activeRun : activeRunByRoutine.get(playing.id) ?? null} stats={engine.stats} rules={engine.rules} calendarEvents={calendarEvents} context={{ locationMode, latitude: liveContext.latitude, longitude: liveContext.longitude, temperature: liveContext.temperature, precipitationProbability: liveContext.precipitationProbability }} onClose={() => { setPlaying(null); setActiveRun(null); router.refresh(); }} onRunChanged={(run) => { setActiveRun(run); setEngine((current) => ({ ...current, activeRuns: [run, ...current.activeRuns.filter((item) => item.id !== run.id)] })); }} onChain={handleChain}/> : null}
    </div>
  );
}
