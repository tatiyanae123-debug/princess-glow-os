'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import type { Routine, RoutineStep } from '@/lib/types';

type RoutineMode = 'full' | 'normal' | 'quick' | 'minimum';
type SavedSession = {
  mode: RoutineMode;
  queueIds: string[];
  index: number;
  doneIds: string[];
  skippedIds: string[];
  savedAt: number;
};

const MODE_LIMITS: Record<RoutineMode, number> = {
  full: Number.POSITIVE_INFINITY,
  normal: 40,
  quick: 20,
  minimum: 10,
};

function stepDuration(step: RoutineStep) {
  return Math.max(1, step.durationMinutes ?? 5);
}

function filterStepsForMode(steps: RoutineStep[], mode: RoutineMode) {
  if (mode === 'full') return steps;
  const limit = MODE_LIMITS[mode];
  const essentialPattern = /med|medicine|brush|teeth|skincare|water|alarm|tomorrow|essential|shower/i;
  const essentials = steps.filter((step) => essentialPattern.test(`${step.title} ${step.notes ?? ''}`));
  const pool = [...essentials, ...steps.filter((step) => !essentials.includes(step))];
  const selected: RoutineStep[] = [];
  let minutes = 0;
  for (const step of pool) {
    const duration = stepDuration(step);
    if (selected.length > 0 && minutes + duration > limit) continue;
    selected.push(step);
    minutes += duration;
    if (minutes >= limit) break;
  }
  return selected.length ? selected : steps.slice(0, mode === 'minimum' ? 2 : mode === 'quick' ? 4 : 6);
}

export function RoutineStepPlayer({ routine, steps, initialMode = 'full', onClose }: {
  routine: Routine;
  steps: RoutineStep[];
  initialMode?: RoutineMode;
  onClose: () => void;
}) {
  const storageKey = `glow-routine-session:${routine.id}`;
  const [mode, setMode] = useState<RoutineMode>(initialMode);
  const [queueIds, setQueueIds] = useState<string[]>(() => filterStepsForMode(steps, initialMode).map((item) => item.id));
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [speakMode, setSpeakMode] = useState(false);
  const [restored, setRestored] = useState(false);
  const touchStart = useRef<number | null>(null);
  const hydrated = useRef(false);

  const stepMap = useMemo(() => new Map(steps.map((item) => [item.id, item])), [steps]);
  const queue = useMemo(() => queueIds.map((id) => stepMap.get(id)).filter((item): item is RoutineStep => Boolean(item)), [queueIds, stepMap]);
  const step = queue[index];
  const finished = queue.length > 0 && index >= queue.length;
  const totalMinutes = queue.reduce((sum, item) => sum + stepDuration(item), 0);
  const progress = queue.length ? Math.min(index, queue.length) / queue.length : 0;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return;
      const saved = JSON.parse(raw) as SavedSession;
      const validIds = new Set(steps.map((item) => item.id));
      const restoredQueue = saved.queueIds.filter((id) => validIds.has(id));
      if (!restoredQueue.length || saved.index >= restoredQueue.length) {
        window.localStorage.removeItem(storageKey);
        return;
      }
      setMode(saved.mode);
      setQueueIds(restoredQueue);
      setIndex(Math.max(0, Math.min(saved.index, restoredQueue.length - 1)));
      setDone(new Set(saved.doneIds.filter((id) => validIds.has(id))));
      setSkipped(new Set(saved.skippedIds.filter((id) => validIds.has(id))));
      setRestored(true);
    } catch {
      try { window.localStorage.removeItem(storageKey); } catch { /* ignore */ }
    } finally {
      hydrated.current = true;
    }
  }, [steps, storageKey]);

  useEffect(() => {
    if (!hydrated.current || finished || !queueIds.length) return;
    const payload: SavedSession = {
      mode,
      queueIds,
      index,
      doneIds: [...done],
      skippedIds: [...skipped],
      savedAt: Date.now(),
    };
    try { window.localStorage.setItem(storageKey, JSON.stringify(payload)); } catch { /* device storage may be unavailable */ }
  }, [done, finished, index, mode, queueIds, skipped, storageKey]);

  useEffect(() => {
    if (!step) return;
    setSecondsLeft(stepDuration(step) * 60);
    setTimerRunning(false);
    setMessage('');
    if (speakMode && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${step.title}. ${step.notes ?? `This should take about ${stepDuration(step)} minutes.`}`);
      utterance.rate = 0.96;
      window.speechSynthesis.speak(utterance);
    }
  }, [step, speakMode]);

  useEffect(() => {
    if (!timerRunning || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning, secondsLeft]);

  useEffect(() => {
    if (secondsLeft !== 0 || !timerRunning) return;
    setTimerRunning(false);
    setMessage('Timer finished. Mark the step Done when you are actually finished, or add time if you need it.');
    if (speakMode && 'speechSynthesis' in window) {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance('Time is up for this step.'));
    }
  }, [secondsLeft, speakMode, timerRunning]);

  useEffect(() => {
    if (!finished) return;
    try { window.localStorage.removeItem(storageKey); } catch { /* ignore */ }
  }, [finished, storageKey]);

  function changeMode(nextMode: RoutineMode) {
    if (nextMode === mode) return;
    setMode(nextMode);
    setQueueIds(filterStepsForMode(steps, nextMode).map((item) => item.id));
    setIndex(0);
    setDone(new Set());
    setSkipped(new Set());
    setRestored(false);
    setMessage(`Switched to the ${nextMode} version. This run restarted so the sequence and progress stay accurate.`);
  }

  function complete() {
    if (!step) return;
    setDone((current) => new Set(current).add(step.id));
    setIndex((value) => value + 1);
  }

  function skip() {
    if (!step) return;
    setSkipped((current) => new Set(current).add(step.id));
    setIndex((value) => value + 1);
  }

  function moveLater() {
    if (!step || queueIds.length < 2) return;
    setQueueIds((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      if (moved) next.push(moved);
      return next;
    });
    setMessage('Moved to the end of this routine. Your next step is ready.');
  }

  function replaceStep() {
    setMessage('Glow is treating this as a lighter-step request for this run. Use Need Help for the smallest version, or edit the permanent step after the routine.');
  }

  function needHelp() {
    if (!step) return;
    setMessage(step.notes || `Start with the smallest version of “${step.title}”. Give it ${Math.min(stepDuration(step), 5)} focused minutes, then decide whether to continue.`);
  }

  function addFiveMinutes() {
    setSecondsLeft((current) => current + 5 * 60);
    setMessage('Added 5 minutes.');
  }

  function speakCurrent() {
    if (!step || !('speechSynthesis' in window)) {
      setMessage('Spoken guidance is not available in this browser.');
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${step.title}. ${step.notes ?? `About ${stepDuration(step)} minutes.`}`));
  }

  function onTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStart.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    touchStart.current = null;
    if (delta < -60) complete();
    if (delta > 60 && index > 0) setIndex((value) => Math.max(0, value - 1));
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className="fixed inset-0 z-[180] overflow-y-auto bg-[radial-gradient(circle_at_top,#fff8f5,#f8f2ef_50%,#f3efeb)]" role="dialog" aria-modal="true" aria-label={`${routine.name} guided routine`}>
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col px-4 py-4 sm:px-8 sm:py-6">
        <header className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#b56573]">Routine Player</p>
            <h1 className="glow-display mt-1 truncate text-[26px] text-[#2B2420] sm:text-[34px]">{routine.name}</h1>
            <p className="mt-1 text-[10px] text-[#8f837b]">Progress saves on this device when you leave before finishing.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Exit routine" className="shrink-0 rounded-full border border-[#eaded8] bg-white p-3 text-[#736861]"><X size={17} /></button>
        </header>

        {restored ? <div role="status" className="mt-4 rounded-2xl border border-[#e7ddd7] bg-white/80 px-4 py-3 text-[11px] text-[#6c6059]">Resumed your saved {mode} routine at step {index + 1}. The timer restarts for the current step so Glow never shows a stale countdown.</div> : null}

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(['full', 'normal', 'quick', 'minimum'] as RoutineMode[]).map((option) => (
            <button key={option} type="button" onClick={() => changeMode(option)} className={`rounded-2xl border px-3 py-3 text-left transition ${mode === option ? 'border-[#c9727e] bg-[#fbe4e8] text-[#7c3d49]' : 'border-[#eaded8] bg-white text-[#746963]'}`}>
              <span className="block text-[11px] font-semibold capitalize">{option}</span>
              <span className="mt-0.5 block text-[9.5px] text-current/70">{option === 'full' ? 'Everything' : option === 'normal' ? 'up to 40 min' : option === 'quick' ? 'up to 20 min' : 'up to 10 min'}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10.5px] text-[#796e68]">
          <span className="rounded-full bg-white px-3 py-1.5">{queue.length} steps</span>
          <span className="rounded-full bg-white px-3 py-1.5">~{totalMinutes} min</span>
          <span className="rounded-full bg-white px-3 py-1.5">{done.size} done · {skipped.size} skipped</span>
          <button type="button" onClick={() => setSpeakMode((current) => !current)} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${speakMode ? 'bg-[#2B2420] text-white' : 'bg-white text-[#796e68]'}`}><Mic2 size={11} />Speak mode {speakMode ? 'on' : 'off'}</button>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#eaded8]"><div className="h-full rounded-full bg-[#c9727e] transition-all duration-500" style={{ width: `${progress * 100}%` }} /></div>

        <main className="flex flex-1 items-center justify-center py-8" onTouchStart={(event) => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={onTouchEnd}>
          {queue.length === 0 ? (
            <div className="max-w-lg rounded-[28px] border border-[#eaded8] bg-white p-8 text-center"><Sparkles className="mx-auto text-[#c9727e]" size={26} /><h2 className="glow-display mt-3 text-[24px] text-[#2B2420]">This routine needs steps.</h2><p className="mt-2 text-[12px] leading-5 text-[#81756e]">Exit the player and add steps in the visual routine builder.</p></div>
          ) : finished ? (
            <div className="max-w-lg rounded-[28px] border border-[#eaded8] bg-white p-8 text-center"><Sparkles className="mx-auto text-[#c9727e]" size={28} /><h2 className="glow-display mt-3 text-[30px] text-[#2B2420]">Routine complete.</h2><p className="mt-2 text-[12px] text-[#81756e]">You completed {done.size} of {queue.length} steps and skipped {skipped.size}. Saved resume progress has been cleared.</p><button type="button" onClick={onClose} className="mt-6 rounded-full bg-[#2B2420] px-6 py-3 text-[12px] font-medium text-white">Return to Routines</button></div>
          ) : step ? (
            <div className="w-full max-w-xl rounded-[30px] border border-[#eaded8] bg-white p-6 shadow-[0_24px_70px_rgba(83,59,50,.08)] sm:p-9">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#c9727e]">Step {index + 1} of {queue.length}</p><h2 className="glow-display mt-2 break-words text-[30px] leading-tight text-[#2B2420] sm:text-[38px]">{step.title}</h2></div><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#fbe4e8] text-[#8b4b57]"><span className="text-[13px] font-semibold">{Math.round(progress * 100)}%</span></div></div>
              {step.notes ? <p className="mt-4 whitespace-pre-wrap break-words text-[13px] leading-6 text-[#655b55]">{step.notes}</p> : <p className="mt-4 text-[13px] leading-6 text-[#8a7e77]">Focus only on this step. Swipe left when it is done or use the controls below.</p>}

              <div className="mt-6 rounded-[22px] bg-[#faf5f2] p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-[#4b413c]"><Clock3 size={15} /><span className="font-mono text-[22px] font-semibold">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span></div><div className="flex flex-wrap gap-2"><button type="button" disabled={secondsLeft === 0} onClick={() => setTimerRunning((current) => !current)} className="rounded-full bg-white p-2.5 text-[#5c514b] disabled:opacity-35" aria-label={timerRunning ? 'Pause timer' : 'Start timer'}>{timerRunning ? <Pause size={14} /> : <Play size={14} />}</button><button type="button" onClick={addFiveMinutes} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[10.5px] text-[#5c514b]"><Plus size={11} />5m</button><button type="button" onClick={() => { setTimerRunning(false); setSecondsLeft(0); setMessage('Timer ended early. Mark Done only when the step itself is finished.'); }} className="rounded-full bg-white px-3 py-2 text-[10.5px] text-[#5c514b]">Finish timer</button></div></div></div>

              {message ? <div aria-live="polite" className="mt-4 rounded-2xl border border-[#f0d9de] bg-[#fff7f8] p-3 text-[11.5px] leading-5 text-[#73545b]">{message}</div> : null}
              <button type="button" onClick={complete} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2B2420] px-5 py-4 text-[13px] font-semibold text-white"><Check size={16} />Done</button>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><button type="button" onClick={skip} className="flex items-center justify-center gap-1 rounded-xl border border-[#eaded8] px-3 py-2.5 text-[10.5px] text-[#625852]"><SkipForward size={12} />Skip</button><button type="button" disabled={queueIds.length < 2} onClick={moveLater} className="flex items-center justify-center gap-1 rounded-xl border border-[#eaded8] px-3 py-2.5 text-[10.5px] text-[#625852] disabled:opacity-35"><FastForward size={12} />Move later</button><button type="button" onClick={needHelp} className="flex items-center justify-center gap-1 rounded-xl border border-[#eaded8] px-3 py-2.5 text-[10.5px] text-[#625852]"><CircleHelp size={12} />Need help</button><button type="button" onClick={replaceStep} className="flex items-center justify-center gap-1 rounded-xl border border-[#eaded8] px-3 py-2.5 text-[10.5px] text-[#625852]"><RefreshCw size={12} />Replace</button></div>
              <div className="mt-4 flex items-center justify-between text-[10px] text-[#9a8f88]"><button type="button" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))} className="inline-flex items-center gap-1 disabled:opacity-30"><ArrowLeft size={11} />Previous</button><button type="button" onClick={speakCurrent} className="inline-flex items-center gap-1"><Volume2 size={11} />Read this step</button></div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
