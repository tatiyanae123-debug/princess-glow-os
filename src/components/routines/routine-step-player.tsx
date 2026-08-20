'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  ArrowLeft,
  Check,
  CircleHelp,
  Clock3,
  FastForward,
  Mic2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  SkipForward,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react';
import {
  completeRoutineRunAction,
  completeRoutineStepAction,
  skipRoutineStepAction,
  startRoutineRunAction,
  updateRoutineRunAction,
} from '@/app/actions/advanced-routines';
import type { CalendarEvent, Routine, RoutineRun, RoutineStep, RoutineStepRule, RoutineStepStat } from '@/lib/types';

type RoutineMode = 'full' | 'normal' | 'quick' | 'minimum';
type RoutineContext = {
  locationMode?: string;
  latitude?: number;
  longitude?: number;
  temperature?: number;
  precipitationProbability?: number;
};

type SpeechRecognitionEventLike = { results: ArrayLike<{ 0: { transcript: string } }> };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const MODE_LIMITS: Record<RoutineMode, number> = {
  full: Number.POSITIVE_INFINITY,
  normal: 40,
  quick: 20,
  minimum: 10,
};

function localDateKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function estimatedSeconds(step: RoutineStep, stats: RoutineStepStat[]) {
  const stat = stats.find((item) => item.stepId === step.id);
  if (stat && stat.sampleCount >= 2 && stat.averageSeconds > 0) return stat.averageSeconds;
  return Math.max(60, (step.durationMinutes ?? 5) * 60);
}

function filterStepsForMode(steps: RoutineStep[], mode: RoutineMode, stats: RoutineStepStat[]) {
  if (mode === 'full') return steps;
  const limit = MODE_LIMITS[mode] * 60;
  const essentialPattern = /med|medicine|brush|teeth|skincare|water|alarm|tomorrow|essential|shower/i;
  const essentials = steps.filter((step) => essentialPattern.test(`${step.title} ${step.notes ?? ''}`));
  const pool = [...essentials, ...steps.filter((step) => !essentials.includes(step))];
  const selected: RoutineStep[] = [];
  let seconds = 0;
  for (const step of pool) {
    const duration = estimatedSeconds(step, stats);
    if (selected.length > 0 && seconds + duration > limit) continue;
    selected.push(step);
    seconds += duration;
    if (seconds >= limit) break;
  }
  return selected.length ? selected : steps.slice(0, mode === 'minimum' ? 2 : mode === 'quick' ? 4 : 6);
}

function nextEvent(calendarEvents: CalendarEvent[]) {
  const now = Date.now();
  return [...calendarEvents]
    .filter((event) => !event.allDay && event.startAt.getTime() > now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null;
}

export function RoutineStepPlayer({
  routine,
  steps,
  initialMode = 'normal',
  initialRun,
  stats,
  rules,
  calendarEvents,
  context,
  onClose,
  onRunChanged,
  onChain,
}: {
  routine: Routine;
  steps: RoutineStep[];
  initialMode?: RoutineMode;
  initialRun?: RoutineRun | null;
  stats: RoutineStepStat[];
  rules: RoutineStepRule[];
  calendarEvents: CalendarEvent[];
  context: RoutineContext;
  onClose: () => void;
  onRunChanged?: (run: RoutineRun) => void;
  onChain?: (routineId: string, run: RoutineRun) => void;
}) {
  const defaultQueue = useMemo(() => filterStepsForMode(steps, initialMode, stats).map((item) => item.id), [initialMode, stats, steps]);
  const [run, setRun] = useState<RoutineRun | null>(initialRun ?? null);
  const [mode, setMode] = useState<RoutineMode>((initialRun?.mode as RoutineMode | undefined) ?? initialMode);
  const [queueIds, setQueueIds] = useState<string[]>(initialRun?.queueStepIds?.length ? initialRun.queueStepIds : defaultQueue);
  const [index, setIndex] = useState(initialRun?.currentIndex ?? 0);
  const [done, setDone] = useState<Set<string>>(new Set(initialRun?.completedStepIds ?? []));
  const [skipped, setSkipped] = useState<Set<string>>(new Set(initialRun?.skippedStepIds ?? []));
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [message, setMessage] = useState(initialRun ? 'Resumed from your saved Glow routine run. This progress is available across devices.' : '');
  const [speakMode, setSpeakMode] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [saving, startSaving] = useTransition();
  const [finishing, startFinishing] = useTransition();
  const touchStart = useRef<number | null>(null);
  const stepStartedAt = useRef(Date.now());
  const speechRef = useRef<SpeechRecognitionLike | null>(null);

  const stepMap = useMemo(() => new Map(steps.map((item) => [item.id, item])), [steps]);
  const queue = useMemo(() => queueIds.map((id) => stepMap.get(id)).filter((item): item is RoutineStep => Boolean(item)), [queueIds, stepMap]);
  const step = queue[index];
  const finished = queue.length > 0 && index >= queue.length;
  const progress = queue.length ? Math.min(index, queue.length) / queue.length : 0;
  const learnedTotalSeconds = queue.reduce((sum, item) => sum + estimatedSeconds(item, stats), 0);
  const upcoming = useMemo(() => nextEvent(calendarEvents), [calendarEvents]);
  const currentRules = step ? rules.filter((rule) => rule.stepId === step.id && rule.enabled) : [];

  useEffect(() => {
    if (run) return;
    let cancelled = false;
    startSaving(async () => {
      const result = await startRoutineRunAction({ routineId: routine.id, mode, queueStepIds: queueIds, context });
      if (cancelled || !result.data) return;
      setRun(result.data);
      setQueueIds(result.data.queueStepIds?.length ? result.data.queueStepIds : queueIds);
      setIndex(result.data.currentIndex ?? 0);
      setDone(new Set(result.data.completedStepIds ?? []));
      setSkipped(new Set(result.data.skippedStepIds ?? []));
      onRunChanged?.(result.data);
    });
    return () => { cancelled = true; };
  }, [context, mode, onRunChanged, queueIds, routine.id, run]);

  useEffect(() => {
    if (!step) return;
    setSecondsLeft(estimatedSeconds(step, stats));
    setTimerRunning(false);
    stepStartedAt.current = Date.now();
    if (speakMode && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const stat = stats.find((item) => item.stepId === step.id);
      const estimate = stat?.sampleCount && stat.sampleCount >= 2 ? `Glow usually sees this take about ${Math.max(1, Math.round(stat.averageSeconds / 60))} minutes.` : `This is estimated at about ${Math.max(1, Math.round(estimatedSeconds(step, stats) / 60))} minutes.`;
      const utterance = new SpeechSynthesisUtterance(`${step.title}. ${step.notes ?? estimate}`);
      utterance.rate = 0.96;
      window.speechSynthesis.speak(utterance);
    }
  }, [speakMode, stats, step]);

  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const id = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft, timerRunning]);

  useEffect(() => {
    if (secondsLeft !== 0 || !timerRunning) return;
    setTimerRunning(false);
    setMessage('Timer finished. Mark the step Done only when the action itself is finished.');
    if (speakMode && 'speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance('Time is up for this step.'));
  }, [secondsLeft, speakMode, timerRunning]);

  useEffect(() => () => {
    speechRef.current?.stop();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  function persistProgress(nextIndex: number, nextQueue: string[], nextDone: Set<string>, nextSkipped: Set<string>, nextMode = mode) {
    if (!run) return;
    startSaving(async () => {
      const result = await updateRoutineRunAction(run.id, {
        mode: nextMode,
        queueStepIds: nextQueue,
        completedStepIds: [...nextDone],
        skippedStepIds: [...nextSkipped],
        currentIndex: nextIndex,
        context,
      });
      if (result.data) {
        setRun(result.data);
        onRunChanged?.(result.data);
      } else if (result.error) setMessage(result.error);
    });
  }

  function changeMode(nextMode: RoutineMode) {
    if (nextMode === mode) return;
    if (index > 0 || done.size || skipped.size) {
      setMessage('To protect your timing history, version changes are locked after progress starts. Exit and start a new version if you want to restart.');
      return;
    }
    const nextQueue = filterStepsForMode(steps, nextMode, stats).map((item) => item.id);
    setMode(nextMode);
    setQueueIds(nextQueue);
    setIndex(0);
    persistProgress(0, nextQueue, new Set(), new Set(), nextMode);
    setMessage(`Switched to the ${nextMode} version. Glow saved the new sequence to this run.`);
  }

  function complete() {
    if (!step || saving) return;
    const elapsed = Math.max(1, Math.round((Date.now() - stepStartedAt.current) / 1000));
    const nextDone = new Set(done).add(step.id);
    const nextIndex = index + 1;
    startSaving(async () => {
      if (!run) {
        setMessage('Glow is still creating the cross-device run. Try Done again in a moment.');
        return;
      }
      const result = await completeRoutineStepAction({ runId: run.id, stepId: step.id, actualSeconds: elapsed, dateKey: localDateKey() });
      if (!result.data) {
        setMessage(result.error ?? 'Glow could not save this completion. The step stayed open.');
        return;
      }
      setDone(nextDone);
      setIndex(nextIndex);
      const progressResult = await updateRoutineRunAction(run.id, { completedStepIds: [...nextDone], skippedStepIds: [...skipped], currentIndex: nextIndex, queueStepIds: queueIds, context });
      if (progressResult.data) {
        setRun(progressResult.data);
        onRunChanged?.(progressResult.data);
      }
      const linked = result.data.linkedUpdates.length;
      setMessage(linked ? `Done. Glow also updated ${linked} linked source${linked === 1 ? '' : 's'} so you do not have to check it off twice.` : 'Done. Your actual time was added to Glow’s learned estimate.');
    });
  }

  function skip() {
    if (!step || saving || !run) return;
    const nextSkipped = new Set(skipped).add(step.id);
    const nextIndex = index + 1;
    setSkipped(nextSkipped);
    setIndex(nextIndex);
    startSaving(async () => {
      const result = await skipRoutineStepAction({ runId: run.id, stepId: step.id });
      if (!result.data) {
        setSkipped(skipped);
        setIndex(index);
        setMessage(result.error ?? 'Glow could not save the skip.');
        return;
      }
      persistProgress(nextIndex, queueIds, done, nextSkipped);
    });
  }

  function moveLater() {
    if (!step || queueIds.length < 2 || saving) return;
    const next = [...queueIds];
    const [moved] = next.splice(index, 1);
    if (moved) next.push(moved);
    setQueueIds(next);
    persistProgress(index, next, done, skipped);
    setMessage('Moved to the end of this run only. The permanent routine order did not change.');
  }

  function needHelp() {
    if (!step) return;
    setMessage(step.notes || `Do only the smallest version of “${step.title}” for ${Math.min(5, Math.max(1, Math.round(estimatedSeconds(step, stats) / 60)))} minutes, then reassess.`);
  }

  function addFiveMinutes() {
    setSecondsLeft((current) => current + 300);
    setMessage('Added 5 minutes to the timer.');
  }

  function speakCurrent() {
    if (!step || !('speechSynthesis' in window)) {
      setMessage('Spoken guidance is not available in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${step.title}. ${step.notes ?? `Glow estimates about ${Math.max(1, Math.round(estimatedSeconds(step, stats) / 60))} minutes.`}`));
  }

  function handleVoiceCommand(raw: string) {
    const command = raw.trim().toLowerCase();
    setMessage(`Heard: “${raw.trim()}”`);
    if (/^(done|complete|finished|step done)/.test(command)) complete();
    else if (/skip/.test(command)) skip();
    else if (/move.*later|later/.test(command)) moveLater();
    else if (/pause/.test(command)) setTimerRunning(false);
    else if (/resume|start timer|continue timer/.test(command)) setTimerRunning(true);
    else if (/add.*five|five more/.test(command)) addFiveMinutes();
    else if (/help|stuck|smaller/.test(command)) needHelp();
    else if (/read|what.*next|say.*step/.test(command)) speakCurrent();
    else if (/minimum|bare minimum/.test(command)) changeMode('minimum');
    else if (/quick/.test(command)) changeMode('quick');
    else if (/normal/.test(command)) changeMode('normal');
    else if (/full/.test(command)) changeMode('full');
    else setMessage(`Glow heard “${raw.trim()}” but it is not a routine command. Try “done,” “skip,” “pause,” “add five,” “move later,” “help,” or “quick version.”`);
  }

  function toggleVoiceCommands() {
    if (voiceListening) {
      speechRef.current?.stop();
      speechRef.current = null;
      setVoiceListening(false);
      return;
    }
    const browser = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const Recognition = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Recognition) {
      setMessage('Voice commands are not supported by this browser. Spoken step guidance still works if speech synthesis is available.');
      return;
    }
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      const transcript = last?.[0]?.transcript;
      if (transcript) handleVoiceCommand(transcript);
    };
    recognition.onerror = () => {
      setVoiceListening(false);
      setMessage('Voice command listening stopped because the browser reported a microphone/speech error.');
    };
    recognition.onend = () => setVoiceListening(false);
    recognition.start();
    speechRef.current = recognition;
    setVoiceListening(true);
    setMessage('Voice commands are listening. Say “done,” “skip,” “pause,” “add five,” “move later,” “help,” or “quick version.”');
  }

  function finishRoutine() {
    if (!run || finishing) return;
    startFinishing(async () => {
      const result = await completeRoutineRunAction(run.id);
      if (!result.data) {
        setMessage(result.error ?? 'Glow could not close this routine run.');
        return;
      }
      if (result.data.nextRun) {
        setMessage('Routine complete. Glow started the next linked routine automatically.');
        onChain?.(result.data.nextRun.routineId, result.data.nextRun);
      } else {
        setMessage('Routine complete. History and learned timing are saved across devices.');
        window.setTimeout(onClose, 650);
      }
    });
  }

  function previous() {
    if (index <= 0) return;
    const nextIndex = index - 1;
    setIndex(nextIndex);
    persistProgress(nextIndex, queueIds, done, skipped);
  }

  function onTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStart.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    touchStart.current = null;
    if (delta < -60) complete();
    if (delta > 60) previous();
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const stepStat = step ? stats.find((item) => item.stepId === step.id) : null;

  return (
    <div className="fixed inset-0 z-[180] overflow-y-auto bg-[radial-gradient(circle_at_top,#fff9f5,#f8f2ef_50%,#f1ece8)]" role="dialog" aria-modal="true" aria-label={`${routine.name} guided routine`}>
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-4 sm:px-8 sm:py-6">
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#b56573]">Cross-device Routine Player</p>
            <h1 className="glow-display mt-1 break-words text-[28px] text-[#2B2420] sm:text-[36px]">{routine.name}</h1>
            <p className="mt-1 text-[10.5px] leading-5 text-[#8f837b]">Run progress and completed-step history are saved to Glow’s database. Learned timing updates only from steps you actually mark Done.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Exit routine" className="shrink-0 rounded-full border border-[#eaded8] bg-white p-3 text-[#736861]"><X size={17} /></button>
        </header>

        <div className="mt-4 flex flex-wrap gap-2 text-[10.5px]">
          <span className="rounded-full bg-white px-3 py-1.5 text-[#71655e]">{run ? `Run saved · ${run.status}` : saving ? 'Creating saved run…' : 'Preparing run'}</span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[#71655e]">Learned estimate · {Math.max(1, Math.round(learnedTotalSeconds / 60))} min</span>
          {upcoming ? <span className="rounded-full bg-white px-3 py-1.5 text-[#71655e]">Next: {upcoming.title} · {upcoming.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span> : null}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(['full','normal','quick','minimum'] as RoutineMode[]).map((option) => <button key={option} type="button" onClick={() => changeMode(option)} className={`rounded-2xl border px-3 py-3 text-left ${mode === option ? 'border-[#c9727e] bg-[#fbe4e8] text-[#7c3d49]' : 'border-[#eaded8] bg-white text-[#746963]'}`}><span className="block text-[11px] font-semibold capitalize">{option}</span><span className="mt-0.5 block text-[9.5px] text-current/70">{option === 'full' ? 'Everything' : option === 'normal' ? 'up to 40 min' : option === 'quick' ? 'up to 20 min' : 'up to 10 min'}</span></button>)}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10.5px] text-[#796e68]">
          <span className="rounded-full bg-white px-3 py-1.5">{queue.length} steps</span>
          <span className="rounded-full bg-white px-3 py-1.5">{done.size} done · {skipped.size} skipped</span>
          <button type="button" onClick={() => setSpeakMode((current) => !current)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${speakMode ? 'bg-[#2B2420] text-white' : 'bg-white text-[#796e68]'}`}><Volume2 size={11}/>Guidance {speakMode ? 'on' : 'off'}</button>
          <button type="button" onClick={toggleVoiceCommands} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${voiceListening ? 'bg-[#8f5962] text-white' : 'bg-white text-[#796e68]'}`}><Mic2 size={11}/>Voice commands {voiceListening ? 'listening' : 'off'}</button>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eaded8]"><div className="h-full rounded-full bg-[#c9727e] transition-all duration-500" style={{ width: `${progress * 100}%` }} /></div>

        <main className="flex flex-1 items-center justify-center py-8" onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={onTouchEnd}>
          {!queue.length ? (
            <div className="max-w-lg rounded-[28px] border border-[#eaded8] bg-white p-8 text-center"><Sparkles className="mx-auto text-[#c9727e]" size={26}/><h2 className="glow-display mt-3 text-[24px] text-[#2B2420]">No eligible steps right now.</h2><p className="mt-2 text-[12px] leading-5 text-[#81756e]">The routine has no steps in this version/context. Exit and edit the routine or its conditions.</p></div>
          ) : finished ? (
            <div className="w-full max-w-xl rounded-[30px] border border-[#eaded8] bg-white p-8 text-center shadow-[0_24px_70px_rgba(83,59,50,.08)]"><Sparkles className="mx-auto text-[#c9727e]" size={28}/><h2 className="glow-display mt-3 text-[30px] text-[#2B2420]">Routine ready to close.</h2><p className="mt-2 text-[12px] leading-5 text-[#81756e]">{done.size} completed · {skipped.size} skipped. Finish saves the run to History and automatically opens the next routine if a chain is configured.</p><button type="button" onClick={finishRoutine} disabled={finishing} className="mt-6 rounded-full bg-[#2B2420] px-6 py-3 text-[12px] font-semibold text-white disabled:opacity-50">{finishing ? 'Saving…' : 'Finish Routine'}</button></div>
          ) : step ? (
            <div className="w-full max-w-xl rounded-[30px] border border-[#eaded8] bg-white p-6 shadow-[0_24px_70px_rgba(83,59,50,.08)] sm:p-9">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#c9727e]">Step {index + 1} of {queue.length}</p><h2 className="glow-display mt-2 break-words text-[30px] leading-tight text-[#2B2420] sm:text-[38px]">{step.title}</h2></div><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#fbe4e8] text-[#8b4b57]"><span className="text-[13px] font-semibold">{Math.round(progress * 100)}%</span></div></div>
              {step.notes ? <p className="mt-4 whitespace-pre-wrap break-words text-[13px] leading-6 text-[#655b55]">{step.notes}</p> : <p className="mt-4 text-[13px] leading-6 text-[#8a7e77]">Focus only on this step. Glow records the actual elapsed time when you mark it Done.</p>}

              <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-[#897d76]">
                {stepStat?.sampleCount ? <span className="rounded-full bg-[#f8f3ef] px-3 py-1.5">Learned from {stepStat.sampleCount} completion{stepStat.sampleCount === 1 ? '' : 's'} · avg {Math.max(1, Math.round(stepStat.averageSeconds / 60))} min</span> : <span className="rounded-full bg-[#f8f3ef] px-3 py-1.5">Using configured estimate · {Math.max(1, Math.round(estimatedSeconds(step, stats) / 60))} min</span>}
                {currentRules.map((rule) => <span key={rule.id} className="rounded-full bg-[#f0eee8] px-3 py-1.5 capitalize">{rule.ruleType} condition active</span>)}
              </div>

              <div className="mt-6 rounded-[22px] bg-[#faf5f2] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-[#4b413c]"><Clock3 size={15}/><span className="font-mono text-[24px] font-semibold">{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</span></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setTimerRunning((current) => !current)} className="rounded-full bg-white p-2.5 text-[#5c514b]" aria-label={timerRunning ? 'Pause timer' : 'Start timer'}>{timerRunning ? <Pause size={14}/> : <Play size={14}/>}</button><button type="button" onClick={addFiveMinutes} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[10.5px] text-[#5c514b]"><Plus size={11}/>5m</button><button type="button" onClick={() => setSecondsLeft(0)} className="rounded-full bg-white px-3 py-2 text-[10.5px] text-[#5c514b]">Finish timer</button></div></div></div>

              {message ? <div aria-live="polite" className="mt-4 rounded-2xl border border-[#f0d9de] bg-[#fff7f8] p-3 text-[11.5px] leading-5 text-[#73545b]">{message}</div> : null}

              <button type="button" disabled={saving} onClick={complete} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2B2420] px-5 py-4 text-[13px] font-semibold text-white disabled:opacity-50"><Check size={16}/>{saving ? 'Saving…' : 'Done'}</button>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><button type="button" onClick={skip} disabled={saving} className="flex items-center justify-center gap-1 rounded-xl border border-[#eaded8] px-3 py-2.5 text-[10.5px] text-[#625852]"><SkipForward size={12}/>Skip</button><button type="button" onClick={moveLater} disabled={saving} className="flex items-center justify-center gap-1 rounded-xl border border-[#eaded8] px-3 py-2.5 text-[10.5px] text-[#625852]"><FastForward size={12}/>Move later</button><button type="button" onClick={needHelp} className="flex items-center justify-center gap-1 rounded-xl border border-[#eaded8] px-3 py-2.5 text-[10.5px] text-[#625852]"><CircleHelp size={12}/>Need help</button><button type="button" onClick={() => setMessage('This step can be changed permanently from the Routine Studio. For this run, use Need Help or Move Later so history stays accurate.')} className="flex items-center justify-center gap-1 rounded-xl border border-[#eaded8] px-3 py-2.5 text-[10.5px] text-[#625852]"><RefreshCw size={12}/>Replace</button></div>
              <div className="mt-4 flex items-center justify-between text-[10px] text-[#9a8f88]"><button type="button" disabled={index === 0 || saving} onClick={previous} className="inline-flex items-center gap-1 disabled:opacity-30"><ArrowLeft size={11}/>Previous</button><button type="button" onClick={speakCurrent} className="inline-flex items-center gap-1"><Volume2 size={11}/>Read step</button></div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
