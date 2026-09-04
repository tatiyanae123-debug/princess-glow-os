'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Mic, Send, X } from 'lucide-react';
import {
  glowPromptsForRoute,
  glowRiskForText,
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

  const currentRoom = glowWorldForRoute(pathname);
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
    try { window.sessionStorage.setItem('glow.presence.turns', JSON.stringify(turns.slice(-20))); } catch {}
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

  useEffect(() => {
    const openGlow = (event: Event) => {
      const detail = (event as CustomEvent<{ prefill?: string }>).detail;
      setOpen(true);
      setState('waking');
      setReceipt(null);
      if (detail?.prefill) setInput(detail.prefill);
      settle('waking', 260);
    };
    const quickAdd = () => openGlow(new CustomEvent('glow:open', { detail: { prefill: 'Create ' } }));
    const contextEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ label?: string; type?: string; id?: string }>).detail;
      if (!detail?.label) return;
      setSelectedContext({ label: detail.label, type: detail.type, id: detail.id, route: pathname, capturedAt: Date.now() });
    };
    const clearContext = () => setSelectedContext(null);
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
        setState('waking');
        settle('waking', 260);
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

  function addTurn(turn: Turn) { setTurns((current) => [...current, turn].slice(-20)); }

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
      settle('understanding', 420);
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
        addTurn({ role: 'glow', text: `Opening ${destination === '/today' ? 'Today' : destination.replace(/^\//, '').replace(/-/g, ' ')}.` });
        setInput('');
        setState('completing');
        router.push(destination);
        settle('completing', 900);
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
          history: turns.slice(-10),
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
        settle(completed ? 'completing' : 'speaking', completed ? 1500 : 1200);
      }
    } catch (error) {
      setState('error');
      addTurn({ role: 'glow', text: error instanceof Error ? error.message : 'Glow could not complete that request.' });
    } finally { setPending(false); }
  }

  function approve() { if (proposal && !pending) void run(proposal.text, true); }
  function cancelProposal() {
    setProposal(null);
    setState('resting');
    addTurn({ role: 'glow', text: 'Nothing changed.' });
  }

  if (pathname === '/sign-in' || pathname.startsWith('/api/')) return null;
  const hideCompactOnToday = pathname === '/today';

  return (
    <>
      {!hideCompactOnToday ? (
        <button
          type="button"
          onClick={() => { setOpen((value) => !value); setState('waking'); settle('waking', 260); }}
          aria-label="Open Glow"
          data-glow-state={state}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] right-4 z-[90] flex min-h-12 items-center gap-2 rounded-full border border-white/80 bg-[#f7f2ed]/95 px-3 py-2 text-left text-neutral-900 shadow-[0_10px_30px_rgba(82,70,62,.14)]"
        >
          <span className="relative h-7 w-7 rounded-full border border-white/80 bg-[radial-gradient(circle_at_32%_27%,#fff_0_18%,rgba(224,235,255,.8)_38%,rgba(242,210,255,.65)_60%,rgba(255,226,188,.7)_78%,rgba(255,255,255,.8)_100%)] shadow-[inset_-3px_-4px_8px_rgba(117,109,121,.12),0_5px_14px_rgba(88,74,66,.12)]" aria-hidden="true">
            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-[#f7f2ed] ${state === 'error' ? 'bg-rose-400' : state === 'awaiting-approval' ? 'bg-amber-300' : state === 'resting' ? 'bg-lime-200' : 'bg-sky-200'}`} />
          </span>
          <span className="text-xs font-semibold">Glow</span>
          <span className="hidden text-[10px] text-neutral-500 sm:inline">{STATE_LABEL[state]}</span>
        </button>
      ) : null}

      {open ? (
        <section className="fixed bottom-[calc(env(safe-area-inset-bottom)+24px)] right-3 z-[2147482000] flex max-h-[78vh] w-[min(460px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-white/80 bg-[#f8f4ef]/98 text-neutral-900 shadow-[0_28px_80px_rgba(70,58,51,.22)]" aria-label="Glow conversation">
          <header className="border-b border-neutral-200/70 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="h-9 w-9 shrink-0 rounded-full border border-white bg-[radial-gradient(circle_at_32%_27%,#fff_0_18%,rgba(224,235,255,.8)_38%,rgba(242,210,255,.65)_60%,rgba(255,226,188,.72)_78%,rgba(255,255,255,.8)_100%)] shadow-[inset_-3px_-4px_9px_rgba(117,109,121,.12),0_6px_16px_rgba(88,74,66,.12)]" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[.18em]">Glow · {STATE_LABEL[state]}</div>
                  <div className="mt-1 truncate text-xs text-neutral-500">{currentRoom} · {contextText}</div>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-neutral-200 bg-white/60" aria-label="Minimize Glow"><X size={16}/></button>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[9px] text-neutral-500">
              <span className={`rounded-full px-2 py-1 ${state === 'listening' ? 'bg-white text-neutral-900' : 'bg-white/35'}`}>Listen</span>
              <span className={`rounded-full px-2 py-1 ${state === 'understanding' ? 'bg-white text-neutral-900' : 'bg-white/35'}`}>Understand</span>
              <span className={`rounded-full px-2 py-1 ${state === 'speaking' || state === 'creating' ? 'bg-white text-neutral-900' : 'bg-white/35'}`}>Respond / Create</span>
              <span className={`rounded-full px-2 py-1 ${state === 'awaiting-approval' || state === 'acting' || state === 'completing' ? 'bg-white text-neutral-900' : 'bg-white/35'}`}>Approve / Act</span>
            </div>
          </header>

          <div className="border-b border-neutral-200/60 px-4 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {prompts.map((prompt) => (
                <button key={prompt} type="button" onClick={() => setInput(prompt)} className="min-h-9 shrink-0 rounded-full border border-white bg-white/55 px-3 text-xs text-neutral-700 shadow-sm">{prompt}</button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {turns.length === 0 ? (
              <div className="rounded-2xl border border-white/80 bg-white/45 px-3 py-3 text-sm text-neutral-600">
                Talk to Glow without leaving this room. Glow can listen, answer, search, guide, create a proposal, and act after approval. The current page, Glow world, selected object, and its original page travel with the conversation.
              </div>
            ) : null}
            {turns.map((turn, index) => (
              <div key={`${turn.role}-${index}`} className={`rounded-2xl px-3 py-2 text-sm ${turn.role === 'user' ? 'ml-8 bg-neutral-900 text-white' : 'mr-8 border border-white/80 bg-white/60 text-neutral-900'}`}>
                <p>{turn.text}</p>
                {turn.meta ? <p className="mt-1 text-[10px] opacity-60">{turn.meta}</p> : null}
              </div>
            ))}

            {receipt ? (
              <div className={`mr-8 rounded-2xl px-3 py-3 ${receipt.needsAttention ? 'border border-amber-200/80 bg-amber-50/75' : 'border border-emerald-200/70 bg-emerald-50/70'}`}>
                <div className={`text-[10px] font-semibold uppercase tracking-[.16em] ${receipt.needsAttention ? 'text-amber-800' : 'text-emerald-800'}`}>Action receipt · {receipt.status ?? 'completed'}</div>
                <div className="mt-1 text-sm text-neutral-800">{receipt.summary}</div>
                {receipt.completed?.length ? <div className="mt-2 text-[10px] text-emerald-800"><span className="font-semibold">Completed:</span> {receipt.completed.join(' · ')}</div> : null}
                {receipt.destinations.length ? <div className="mt-1 text-[10px] text-neutral-500">Completed in: {receipt.destinations.join(' · ')}</div> : null}
                {receipt.queued?.length ? <div className="mt-2 text-[10px] text-amber-800"><span className="font-semibold">Queued for review:</span> {receipt.queued.join(' · ')}</div> : null}
                {receipt.queuedDestinations?.length ? <div className="mt-1 text-[10px] text-neutral-500">Waiting in: {receipt.queuedDestinations.join(' · ')}</div> : null}
              </div>
            ) : null}
          </div>

          {proposal ? (
            <div className="border-t border-neutral-200/70 bg-white/35 px-4 py-3">
              <div className="text-xs font-semibold">Review before Glow acts</div>
              <div className="mt-1 text-[10px] text-neutral-500">Nothing changes until you approve.</div>
              {proposal.actions.length ? (
                <ul className="mt-2 space-y-2 text-xs text-neutral-700">
                  {proposal.actions.map((action, index) => (
                    <li key={`${action.type}-${index}`} className="rounded-xl border border-white/80 bg-white/55 px-3 py-2">
                      <div>• {action.title}</div>
                      <div className="mt-1 text-[10px] text-neutral-500">{action.type}{action.destinations.length ? ` · ${action.destinations.join(', ')}` : ''}{action.executor ? ` · ${action.executor === 'verified' ? 'verified executor' : 'review queue'}` : ''}</div>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={cancelProposal} className="min-h-11 rounded-xl border border-neutral-300 bg-white text-sm">Cancel</button>
                <button type="button" onClick={approve} disabled={pending} className="min-h-11 rounded-xl bg-neutral-900 text-sm font-semibold text-white disabled:opacity-50"><Check size={15} className="mr-1 inline"/>Approve</button>
              </div>
            </div>
          ) : null}

          <div className="border-t border-neutral-200/70 p-3">
            {selectedContext ? (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-white bg-white/45 px-3 py-2 text-[10px] text-neutral-600">
                <span className="truncate">Selected: {contextText}</span>
                <button type="button" onClick={() => setSelectedContext(null)} className="shrink-0 underline decoration-neutral-300 underline-offset-2">clear</button>
              </div>
            ) : null}
            <textarea rows={2} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void run(input); } }} placeholder="Talk to Glow…" className="w-full resize-none rounded-2xl border border-neutral-300 bg-white/70 px-3 py-2 text-sm outline-none"/>
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={startListening} className="grid h-11 w-11 place-items-center rounded-xl border border-neutral-300 bg-white/60" aria-label="Speak to Glow"><Mic size={17}/></button>
              <button type="button" onClick={() => void run(input)} disabled={!input.trim() || pending || Boolean(proposal)} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white disabled:opacity-40"><Send size={15}/>{pending ? STATE_LABEL[state] : 'Send'}</button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
