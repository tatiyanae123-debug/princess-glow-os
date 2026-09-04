'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Mic, Send, X } from 'lucide-react';
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
type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> };
type RecognitionError = { error: string };
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecognitionError) => void) | null;
};
type RecognitionCtor = new () => Recognition;

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

export function GlowPresence() {
  const pathname = usePathname();
  const router = useRouter();
  const recognitionRef = useRef<Recognition | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<GlowState>('resting');
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [proposal, setProposal] = useState<PendingProposal | null>(null);
  const [selectedContext, setSelectedContext] = useState<SelectedContext | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const currentWorld = glowWorldForRoute(pathname);
  const currentRole = glowRoleForRoute(pathname);
  const prompts = useMemo(() => glowPromptsForRoute(pathname), [pathname]);
  const contextText = selectedContext
    ? `${selectedContext.type ? `${selectedContext.type} · ` : ''}${selectedContext.label}${selectedContext.route !== pathname ? ` · from ${selectedContext.route}` : ''}`
    : pathname;

  useEffect(() => {
    try {
      const savedTurns = window.sessionStorage.getItem('glow.presence.turns');
      const savedContext = window.sessionStorage.getItem('glow.presence.context');
      if (savedTurns) setTurns(JSON.parse(savedTurns) as Turn[]);
      if (savedContext) setSelectedContext(JSON.parse(savedContext) as SelectedContext);
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

  useEffect(() => () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    recognitionRef.current?.stop();
  }, []);

  function settle(nextFrom: GlowState | GlowState[], delay = 1100) {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
    const allowed = Array.isArray(nextFrom) ? nextFrom : [nextFrom];
    settleTimerRef.current = window.setTimeout(() => {
      setState((current) => allowed.includes(current) ? 'resting' : current);
    }, delay);
  }

  function wake(prefill?: string) {
    setOpen(true);
    setState('waking');
    setReceipt(null);
    if (prefill) setInput(prefill);
    settle('waking', 320);
  }

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
  }, [pathname]);

  function addTurn(turn: Turn) {
    setTurns((current) => [...current, turn].slice(-24));
  }

  function clearSessionMemory() {
    setTurns([]);
    setSelectedContext(null);
    setProposal(null);
    setReceipt(null);
    setInput('');
    setState('resting');
    try {
      window.sessionStorage.removeItem('glow.presence.turns');
      window.sessionStorage.removeItem('glow.presence.context');
    } catch {}
  }

  function startListening() {
    const browser = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const Ctor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Ctor) {
      setState('error');
      addTurn({ role: 'glow', text: 'Voice recognition is not available in this browser. Type to Glow instead.' });
      return;
    }
    recognitionRef.current?.stop();
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const spoken = Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(' ').trim();
      setInput(spoken);
      setState('understanding');
      settle('understanding', 520);
    };
    recognition.onend = () => setState((current) => current === 'listening' ? 'resting' : current);
    recognition.onerror = (event) => {
      setState('error');
      addTurn({ role: 'glow', text: `Glow could not hear that clearly (${event.error}).` });
    };
    recognitionRef.current = recognition;
    setState('listening');
    recognition.start();
  }

  async function run(text: string, approved = false) {
    const command = text.trim();
    if (!command || pending) return;
    setReceipt(null);

    if (!approved) {
      const destination = navigationTarget(command);
      if (destination) {
        addTurn({ role: 'user', text: command });
        addTurn({ role: 'glow', text: `Moving with you toward ${destination === '/today' ? 'Today' : destination.replace(/^\//, '').replace(/-/g, ' ')}.` });
        setInput('');
        setState('completing');
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
        setProposal({ text: command, actions: payload.actions ?? [], responseForm: payload.responseForm });
        setState('awaiting-approval');
        addTurn({ role: 'glow', text: payload.message || 'Glow has a proposed change ready for your approval.', meta: 'Approval required' });
      } else {
        setProposal(null);
        setInput('');
        const completed = payload.mode === 'completed';
        setState(completed ? 'completing' : 'speaking');
        const responseMeta = payload.responseForm ? payload.responseForm.replace('-', ' ') : undefined;
        addTurn({ role: 'glow', text: payload.message || 'Done.', meta: payload.receipt?.summary ? `Receipt · ${payload.receipt.summary}` : responseMeta });
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
      addTurn({ role: 'glow', text: error instanceof Error ? error.message : 'Glow could not complete that request.' });
    } finally {
      setPending(false);
    }
  }

  function approve() {
    if (proposal && !pending) void run(proposal.text, true);
  }

  function cancelProposal() {
    setProposal(null);
    setState('resting');
    addTurn({ role: 'glow', text: 'Nothing changed.' });
  }

  if (pathname === '/sign-in' || pathname.startsWith('/api/')) return null;

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
                Glow is with you in this room. Speak naturally. Glow uses the current room, selected object, recent conversation, active work, and available system context before asking you to repeat yourself.
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
            <textarea rows={2} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void run(input); } }} placeholder="Talk to Glow…" className="w-full resize-none rounded-[20px] border border-white/70 bg-white/42 px-3 py-2 text-[12px] outline-none shadow-[inset_0_1px_0_rgba(255,255,255,.75)]"/>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={startListening} className="grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-white/38" aria-label="Speak to Glow"><Mic size={16}/></button>
              <button type="button" onClick={() => void run(input)} disabled={!input.trim() || pending || Boolean(proposal)} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 text-[12px] font-semibold text-white disabled:opacity-40"><Send size={14}/>{pending ? STATE_LABEL[state] : 'Send'}</button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-1">
              <button type="button" className="glow-memory-link" onClick={() => router.push('/settings/intelligence')}>Memory & intelligence controls</button>
              <button type="button" className="glow-memory-link" onClick={clearSessionMemory}>Clear this session</button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
