'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Mic, Send, Square, Volume2, VolumeX, X } from 'lucide-react';
import { GlowAuraMark } from '@/components/glow/glow-aura-mark';
import {
  glowPromptsForRoute,
  glowRiskForText,
  glowRoleForRoute,
  glowWorldForRoute,
  type GlowResponseForm,
  type GlowState,
} from '@/lib/intelligence/glow-operating-model';

type Turn = { role: 'user' | 'glow'; text: string; meta?: string };
type ProposalAction = {
  title: string;
  type: string;
  destinations: string[];
  confidence: number;
  executor?: 'verified' | 'review-queue';
};
type PendingProposal = { text: string; actions: ProposalAction[]; responseForm?: GlowResponseForm };
type Receipt = {
  summary: string;
  status?: 'completed' | 'partially-completed' | 'queued';
  completed?: string[];
  queued?: string[];
  destinations: string[];
  queuedDestinations?: string[];
  needsAttention?: boolean;
};
type SelectedContext = { label: string; type?: string; id?: string; route: string; capturedAt: number };
type GlowResponse = {
  ok?: boolean;
  mode?: 'answer' | 'proposal' | 'completed';
  responseForm?: GlowResponseForm;
  message?: string;
  requiresConfirmation?: boolean;
  actions?: ProposalAction[];
  receipt?: {
    summary?: string;
    status?: 'completed' | 'partially-completed' | 'queued';
    completed?: string[];
    queued?: string[];
    destinations?: string[];
    queuedDestinations?: string[];
    needsAttention?: boolean;
  };
};

type TranscriptionResponse = { ok?: boolean; text?: string; message?: string };

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

const STATE_LABEL: Record<GlowState, string> = {
  resting: 'available',
  waking: 'waking',
  listening: 'listening',
  understanding: 'understanding',
  speaking: 'speaking',
  creating: 'creating',
  'awaiting-approval': 'waiting for approval',
  acting: 'taking action',
  completing: 'complete',
  error: 'needs attention',
};

const NAV: Record<string, string> = {
  today: '/today', plan: '/planning', planner: '/planning', calendar: '/calendar', tasks: '/tasks', reminders: '/reminders', routines: '/routines', habits: '/habits', goals: '/goals', projects: '/projects',
  life: '/world', body: '/wellness', wellness: '/wellness', fitness: '/fitness', beauty: '/beauty', hair: '/hair', food: '/food', grocery: '/food', groceries: '/food', home: '/home', money: '/finance', finance: '/finance', work: '/work', travel: '/world',
  brain: '/brain', notes: '/notes', memory: '/memory', ideas: '/brain', timeline: '/timeline', create: '/inbox', inbox: '/inbox', import: '/import', search: '/search', settings: '/settings',
};

function navigationTarget(text: string) {
  const value = text.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  const entries = Object.entries(NAV).sort((a, b) => b[0].length - a[0].length);
  const exact = entries.find(([label]) => value === label);
  if (exact) return exact[1];
  if (!/^(open|go to|show me|take me to|pull up|navigate to)\b/.test(value)) return null;
  return entries.find(([label]) => value.includes(label))?.[1] ?? null;
}

function creationLike(text: string) {
  return /\b(create|make|draft|write|build|turn .* into|visual card|image|plan with me)\b/i.test(text);
}

function recordingMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  const choices = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
  return choices.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

function extensionForMime(mime: string) {
  if (mime.includes('mp4')) return 'm4a';
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('ogg')) return 'ogg';
  return 'webm';
}

export function GlowPresence() {
  const pathname = usePathname();
  const router = useRouter();
  const settleTimerRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<GlowState>('resting');
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [proposal, setProposal] = useState<PendingProposal | null>(null);
  const [selectedContext, setSelectedContext] = useState<SelectedContext | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState('');

  const currentWorld = glowWorldForRoute(pathname);
  const currentRole = glowRoleForRoute(pathname);
  const prompts = useMemo(() => glowPromptsForRoute(pathname), [pathname]);
  const contextText = selectedContext
    ? `${selectedContext.type ? `${selectedContext.type} · ` : ''}${selectedContext.label}${selectedContext.route !== pathname ? ` · from ${selectedContext.route}` : ''}`
    : pathname;

  const settle = useCallback((nextFrom: GlowState | GlowState[], delay = 1100) => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    const allowed = Array.isArray(nextFrom) ? nextFrom : [nextFrom];
    settleTimerRef.current = window.setTimeout(() => {
      setState((current) => allowed.includes(current) ? 'resting' : current);
    }, delay);
  }, []);

  const wake = useCallback((prefill?: string) => {
    setOpen(true);
    setState('waking');
    setReceipt(null);
    if (prefill) setInput(prefill);
    settle('waking', 320);
  }, [settle]);

  useEffect(() => {
    try {
      const savedTurns = window.sessionStorage.getItem('glow.presence.turns');
      const savedContext = window.sessionStorage.getItem('glow.presence.context');
      const savedVoiceReplies = window.localStorage.getItem('glow.voice.replies');
      if (savedTurns) setTurns(JSON.parse(savedTurns) as Turn[]);
      if (savedContext) setSelectedContext(JSON.parse(savedContext) as SelectedContext);
      if (savedVoiceReplies !== null) setVoiceReplies(savedVoiceReplies !== 'off');
    } catch {}
  }, []);

  useEffect(() => {
    try { window.sessionStorage.setItem('glow.presence.turns', JSON.stringify(turns.slice(-24))); } catch {}
  }, [turns]);

  useEffect(() => {
    try {
      if (selectedContext) window.sessionStorage.setItem('glow.presence.context', JSON.stringify(selectedContext));
      else window.sessionStorage.removeItem('glow.presence.context');
    } catch {}
  }, [selectedContext]);

  useEffect(() => {
    try { window.localStorage.setItem('glow.voice.replies', voiceReplies ? 'on' : 'off'); } catch {}
  }, [voiceReplies]);

  useEffect(() => () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    try { audioSourceRef.current?.stop(); } catch {}
    void audioContextRef.current?.close();
  }, []);

  useEffect(() => {
    const openGlow = (event: Event) => {
      const detail = (event as CustomEvent<{ prefill?: string }>).detail;
      wake(detail?.prefill);
    };
    const quickAdd = () => wake('Create ');
    const contextEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ label?: string; type?: string; id?: string }>).detail;
      if (!detail?.label) return;
      setSelectedContext({ label: detail.label, type: detail.type, id: detail.id, route: pathname, capturedAt: Date.now() });
    };
    const clearContext = () => setSelectedContext(null);
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        wake();
      }
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('glow:open', openGlow as EventListener);
    document.addEventListener('glow:voice-open', openGlow as EventListener);
    document.addEventListener('glow:quick-add', quickAdd);
    document.addEventListener('glow:context', contextEvent as EventListener);
    document.addEventListener('glow:clear-context', clearContext);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('glow:open', openGlow as EventListener);
      document.removeEventListener('glow:voice-open', openGlow as EventListener);
      document.removeEventListener('glow:quick-add', quickAdd);
      document.removeEventListener('glow:context', contextEvent as EventListener);
      document.removeEventListener('glow:clear-context', clearContext);
      document.removeEventListener('keydown', key);
    };
  }, [pathname, wake]);

  function addTurn(turn: Turn) {
    setTurns((current) => [...current, turn].slice(-24));
  }

  function clearSessionMemory() {
    setTurns([]);
    setSelectedContext(null);
    setProposal(null);
    setReceipt(null);
    setInput('');
    setVoiceStatus('');
    setState('resting');
    try {
      window.sessionStorage.removeItem('glow.presence.turns');
      window.sessionStorage.removeItem('glow.presence.context');
    } catch {}
  }

  async function ensureAudioContext() {
    const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!Ctor) return null;
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new Ctor();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }

  function stopSpeaking() {
    try { audioSourceRef.current?.stop(); } catch {}
    audioSourceRef.current = null;
    setVoiceStatus('');
  }

  async function speak(text: string) {
    if (!voiceReplies || !text.trim()) return;
    try {
      const context = await ensureAudioContext();
      if (!context) throw new Error('Audio playback is not available on this device.');
      stopSpeaking();
      setVoiceStatus('Glow is speaking…');
      const response = await fetch('/api/glow/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(payload?.message || 'Voice reply could not be generated.');
      }
      const buffer = await response.arrayBuffer();
      const decoded = await context.decodeAudioData(buffer.slice(0));
      const source = context.createBufferSource();
      source.buffer = decoded;
      source.connect(context.destination);
      source.onended = () => {
        if (audioSourceRef.current === source) audioSourceRef.current = null;
        setVoiceStatus('');
      };
      audioSourceRef.current = source;
      source.start();
    } catch (error) {
      setVoiceStatus(error instanceof Error ? error.message : 'Glow could not play the voice reply.');
    }
  }

  function stopListening() {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  }

  async function startListening() {
    if (mediaRecorderRef.current?.state === 'recording') {
      stopListening();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setState('error');
      const message = 'This browser cannot record microphone audio. Open Glow OS in Safari or another current browser and allow microphone access.';
      setVoiceStatus(message);
      addTurn({ role: 'glow', text: message });
      return;
    }

    try {
      await ensureAudioContext();
      stopSpeaking();
      setOpen(true);
      setVoiceStatus('Requesting microphone…');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const mimeType = recordingMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setState('error');
        setVoiceStatus('Glow lost access to the microphone. Tap the mic and try again.');
      };

      recorder.onstop = async () => {
        if (recordingTimeoutRef.current) {
          window.clearTimeout(recordingTimeoutRef.current);
          recordingTimeoutRef.current = null;
        }
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type });
        audioChunksRef.current = [];
        if (!blob.size) {
          setState('error');
          setVoiceStatus('I did not receive any audio. Tap the microphone and try again.');
          return;
        }

        setState('understanding');
        setVoiceStatus('Understanding what you said…');
        try {
          const formData = new FormData();
          formData.append('audio', blob, `glow-voice.${extensionForMime(type)}`);
          const response = await fetch('/api/glow/transcribe', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData,
          });
          const payload = await response.json() as TranscriptionResponse;
          if (!response.ok || !payload.ok || !payload.text?.trim()) {
            throw new Error(payload.message || 'Glow could not understand that recording.');
          }
          const spoken = payload.text.trim();
          setInput(spoken);
          setVoiceStatus('');
          await run(spoken);
        } catch (error) {
          setState('error');
          const message = error instanceof Error ? error.message : 'Glow could not understand that recording.';
          setVoiceStatus(message);
          addTurn({ role: 'glow', text: message });
        }
      };

      recorder.start(250);
      setState('listening');
      setVoiceStatus('Listening… tap the microphone again when you are finished.');
      recordingTimeoutRef.current = window.setTimeout(() => stopListening(), 45000);
    } catch (error) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setState('error');
      const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
      const message = denied
        ? 'Microphone access is blocked. Allow microphone access for Glow OS in Safari, then tap the mic again.'
        : error instanceof Error ? error.message : 'Glow could not start the microphone.';
      setVoiceStatus(message);
      addTurn({ role: 'glow', text: message });
    }
  }

  async function run(text: string, approved = false) {
    const command = text.trim();
    if (!command || pending) return;
    setReceipt(null);

    if (!approved) {
      const destination = navigationTarget(command);
      if (destination) {
        const reply = `Moving with you toward ${destination === '/today' ? 'Today' : destination.replace(/^\//, '').replace(/-/g, ' ')}.`;
        addTurn({ role: 'user', text: command });
        addTurn({ role: 'glow', text: reply });
        setInput('');
        setState('completing');
        void speak(reply);
        router.push(destination);
        settle('completing', 1100);
        return;
      }
      addTurn({ role: 'user', text: command });
    }

    setPending(true);
    setState(approved ? 'acting' : creationLike(command) ? 'creating' : 'understanding');

    try {
      const response = await fetch('/api/glow/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          text: command,
          sourceRoute: pathname,
          selectedContext: selectedContext ? JSON.stringify(selectedContext) : '',
          approved,
          risk: glowRiskForText(command),
          history: turns.slice(-12),
        }),
      });
      const payload = await response.json() as GlowResponse;
      if (!response.ok || !payload.ok) throw new Error(payload.message || 'Glow could not complete that request.');

      if (payload.requiresConfirmation && !approved) {
        const message = payload.message || 'I have a proposed change ready for your approval.';
        setProposal({ text: command, actions: payload.actions ?? [], responseForm: payload.responseForm });
        setState('awaiting-approval');
        addTurn({ role: 'glow', text: message, meta: 'Approval required' });
        void speak(message);
      } else {
        setProposal(null);
        setInput('');
        const completed = payload.mode === 'completed';
        const message = payload.message || 'Done.';
        setState(completed ? 'completing' : 'speaking');
        const responseMeta = payload.responseForm ? payload.responseForm.replace('-', ' ') : undefined;
        addTurn({ role: 'glow', text: message, meta: payload.receipt?.summary ? `Receipt · ${payload.receipt.summary}` : responseMeta });
        void speak(message);
        if (payload.receipt?.summary) {
          setReceipt({
            summary: payload.receipt.summary,
            status: payload.receipt.status,
            completed: payload.receipt.completed ?? [],
            queued: payload.receipt.queued ?? [],
            destinations: payload.receipt.destinations ?? [],
            queuedDestinations: payload.receipt.queuedDestinations ?? [],
            needsAttention: payload.receipt.needsAttention,
          });
        }
        if (approved) router.refresh();
        settle(completed ? 'completing' : 'speaking', completed ? 1600 : 1350);
      }
    } catch (error) {
      setState('error');
      const message = error instanceof Error ? error.message : 'Glow could not complete that request.';
      addTurn({ role: 'glow', text: message });
      void speak(message);
    } finally {
      setPending(false);
    }
  }

  function approve() {
    if (proposal && !pending) {
      void ensureAudioContext();
      void run(proposal.text, true);
    }
  }

  function cancelProposal() {
    setProposal(null);
    setState('resting');
    const message = 'Nothing changed.';
    addTurn({ role: 'glow', text: message });
    void speak(message);
  }

  function toggleVoiceReplies() {
    if (voiceReplies) stopSpeaking();
    else void ensureAudioContext();
    setVoiceReplies((current) => !current);
  }

  if (pathname === '/sign-in' || pathname.startsWith('/api/')) return null;

  const recording = state === 'listening' && mediaRecorderRef.current?.state === 'recording';

  return (
    <>
      <button
        type="button"
        onClick={() => open ? setOpen(false) : wake()}
        aria-label="Open Glow"
        aria-expanded={open}
        data-glow-state={state}
        data-glow-world={currentWorld.toLowerCase()}
        className="glow-presence-trigger"
      >
        <GlowAuraMark state={state} world={currentWorld} size="compact" />
        <span className="glow-presence-trigger__copy">
          <span className="glow-presence-trigger__name">Glow</span>
          <span className="glow-presence-trigger__state">{STATE_LABEL[state]}</span>
        </span>
      </button>

      {open ? (
        <section className="glow-unfolded-surface" aria-label="Glow conversation" data-glow-state={state} data-glow-world={currentWorld.toLowerCase()}>
          <header className="glow-unfolded-header">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <GlowAuraMark state={state} world={currentWorld} size="expanded" />
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[.2em]">Glow · {STATE_LABEL[state]}</div>
                  <div className="mt-1 text-[11px] text-neutral-500">{currentWorld} · {currentRole}</div>
                  <div className="mt-1 max-w-[290px] truncate text-[10px] text-neutral-400">Context · {contextText}</div>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/70 bg-white/35" aria-label="Minimize Glow"><X size={15}/></button>
            </div>
            <div className="glow-unfolded-orbit-labels" aria-label="Glow state path">
              <span data-active={state === 'listening'}>Listen</span>
              <span data-active={state === 'understanding'}>Understand</span>
              <span data-active={state === 'speaking' || state === 'creating'}>Respond / Create</span>
              <span data-active={state === 'awaiting-approval' || state === 'acting' || state === 'completing'}>Approve / Act</span>
            </div>
          </header>

          <div className="border-b border-neutral-200/40 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {prompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => setInput(prompt)} className="min-h-9 shrink-0 rounded-full border border-white/65 bg-white/35 px-3 text-[11px] text-neutral-700 shadow-[inset_0_1px_0_rgba(255,255,255,.7)]">{prompt}</button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {turns.length === 0 ? (
              <div className="rounded-[20px] border border-white/60 bg-white/26 px-3 py-3 text-[12px] leading-5 text-neutral-600 shadow-[inset_0_1px_0_rgba(255,255,255,.7)]">
                Glow is with you in this room. Tap the microphone, speak naturally, then tap it again when you are done. Glow will understand you, answer, and speak back out loud.
              </div>
            ) : null}

            {turns.map((turn, index) => (
              <div key={`${turn.role}-${index}`} className={`rounded-[19px] px-3 py-2 text-[12px] leading-5 ${turn.role === 'user' ? 'ml-8 bg-neutral-900/92 text-white' : 'mr-8 border border-white/60 bg-white/38 text-neutral-900'}`}>
                <p>{turn.text}</p>
                {turn.meta ? <p className="mt-1 text-[9px] opacity-55">{turn.meta}</p> : null}
              </div>
            ))}

            {receipt ? (
              <div className={`mr-8 rounded-[20px] px-3 py-3 ${receipt.needsAttention ? 'border border-amber-200/70 bg-amber-50/55' : 'border border-emerald-200/60 bg-emerald-50/45'}`}>
                <div className={`text-[9px] font-semibold uppercase tracking-[.16em] ${receipt.needsAttention ? 'text-amber-800' : 'text-emerald-800'}`}>Action receipt · {receipt.status ?? 'completed'}</div>
                <div className="mt-1 text-[12px] text-neutral-800">{receipt.summary}</div>
                {receipt.completed?.length ? <div className="mt-2 text-[9px] text-emerald-800"><span className="font-semibold">Completed:</span> {receipt.completed.join(' · ')}</div> : null}
                {receipt.destinations.length ? <div className="mt-1 text-[9px] text-neutral-500">Completed in: {receipt.destinations.join(' · ')}</div> : null}
                {receipt.queued?.length ? <div className="mt-2 text-[9px] text-amber-800"><span className="font-semibold">Queued for review:</span> {receipt.queued.join(' · ')}</div> : null}
                {receipt.queuedDestinations?.length ? <div className="mt-1 text-[9px] text-neutral-500">Waiting in: {receipt.queuedDestinations.join(' · ')}</div> : null}
              </div>
            ) : null}
          </div>

          {proposal ? (
            <div className="border-t border-neutral-200/50 bg-white/22 px-4 py-3">
              <div className="text-[11px] font-semibold">Review before Glow acts</div>
              <div className="mt-1 text-[9px] text-neutral-500">Nothing changes until you approve.</div>
              {proposal.actions.length ? (
                <ul className="mt-2 space-y-2 text-[11px] text-neutral-700">
                  {proposal.actions.map((action, index) => (
                    <li key={`${action.type}-${index}`} className="rounded-[16px] border border-white/65 bg-white/32 px-3 py-2">
                      <div>• {action.title}</div>
                      <div className="mt-1 text-[9px] text-neutral-500">{action.type}{action.destinations.length ? ` · ${action.destinations.join(', ')}` : ''}{action.executor ? ` · ${action.executor === 'verified' ? 'verified executor' : 'review queue'}` : ''}</div>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={cancelProposal} className="min-h-11 rounded-full border border-neutral-300/70 bg-white/45 text-[12px]">Cancel</button>
                <button type="button" onClick={approve} disabled={pending} className="min-h-11 rounded-full bg-neutral-900 text-[12px] font-semibold text-white disabled:opacity-50"><Check size={14} className="mr-1 inline"/>Approve</button>
              </div>
            </div>
          ) : null}

          <div className="border-t border-neutral-200/50 p-3">
            {selectedContext ? (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-[16px] border border-white/60 bg-white/28 px-3 py-2 text-[9px] text-neutral-600">
                <span className="truncate">Selected · {contextText}</span>
                <button type="button" onClick={() => setSelectedContext(null)} className="shrink-0 underline decoration-neutral-300 underline-offset-2">clear</button>
              </div>
            ) : null}
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void ensureAudioContext();
                  void run(input);
                }
              }}
              placeholder="Talk to Glow…"
              className="w-full resize-none rounded-[20px] border border-white/70 bg-white/42 px-3 py-2 text-[12px] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.75)]"
            />
            {voiceStatus ? <div role="status" className="mt-2 rounded-[14px] border border-white/55 bg-white/26 px-3 py-2 text-[10px] leading-4 text-neutral-600">{voiceStatus}</div> : null}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void startListening()}
                aria-label={recording ? 'Stop recording and ask Glow' : 'Speak to Glow'}
                aria-pressed={recording}
                className={`grid h-11 w-11 place-items-center rounded-full border transition ${recording ? 'border-neutral-900 bg-neutral-900 text-white shadow-[0_0_0_6px_rgba(255,255,255,.48),0_0_28px_rgba(154,182,255,.25)]' : 'border-white/70 bg-white/38 text-neutral-800'}`}
              >
                {recording ? <Square size={14} fill="currentColor"/> : <Mic size={16}/>} 
              </button>
              <button
                type="button"
                onClick={() => { void ensureAudioContext(); void run(input); }}
                disabled={!input.trim() || pending || Boolean(proposal) || recording}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 text-[12px] font-semibold text-white disabled:opacity-40"
              >
                <Send size={14}/>{pending ? STATE_LABEL[state] : 'Send'}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <button type="button" className="glow-memory-link inline-flex items-center gap-1.5" onClick={toggleVoiceReplies}>
                {voiceReplies ? <Volume2 size={12}/> : <VolumeX size={12}/>} {voiceReplies ? 'Voice replies on' : 'Voice replies off'}
              </button>
              <button type="button" className="glow-memory-link" onClick={() => router.push('/settings/intelligence')}>Memory & intelligence</button>
              <button type="button" className="glow-memory-link" onClick={clearSessionMemory}>Clear session</button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
