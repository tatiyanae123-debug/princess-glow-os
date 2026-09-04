'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Check, Mic, Send, X } from 'lucide-react';

type ShaktiState =
  | 'resting'
  | 'waking'
  | 'listening'
  | 'understanding'
  | 'speaking'
  | 'creating'
  | 'awaiting-approval'
  | 'acting'
  | 'completing'
  | 'error';

type Turn = { role: 'user' | 'shakti'; text: string; meta?: string };
type ProposalAction = { title: string; type: string; destinations: string[]; confidence: number };
type PendingProposal = { text: string; actions: ProposalAction[] };
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

type ShaktiResponse = {
  ok?: boolean;
  mode?: 'answer' | 'proposal' | 'completed';
  message?: string;
  requiresConfirmation?: boolean;
  actions?: ProposalAction[];
  receipt?: { summary?: string; destinations?: string[] };
};

const STATE_LABEL: Record<ShaktiState, string> = {
  resting: 'available',
  waking: 'waking',
  listening: 'listening',
  understanding: 'understanding',
  speaking: 'speaking',
  creating: 'creating',
  'awaiting-approval': 'waiting for approval',
  acting: 'acting',
  completing: 'complete',
  error: 'needs attention',
};

const NAV: Record<string, string> = {
  today: '/today',
  plan: '/planning',
  planner: '/planning',
  calendar: '/calendar',
  tasks: '/tasks',
  reminders: '/reminders',
  routines: '/routines',
  habits: '/habits',
  goals: '/goals',
  projects: '/projects',
  life: '/world',
  body: '/wellness',
  wellness: '/wellness',
  fitness: '/fitness',
  beauty: '/beauty',
  hair: '/hair',
  food: '/food',
  grocery: '/food',
  groceries: '/food',
  home: '/home',
  money: '/finance',
  finance: '/finance',
  work: '/work',
  travel: '/world',
  brain: '/brain',
  notes: '/notes',
  memory: '/brain',
  ideas: '/brain',
  create: '/inbox',
  inbox: '/inbox',
  import: '/import',
  search: '/search',
  settings: '/settings',
};

function navigationTarget(text: string) {
  const value = text.toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
  const entries = Object.entries(NAV).sort((a, b) => b[0].length - a[0].length);
  const exact = entries.find(([label]) => value === label);
  if (exact) return exact[1];
  if (!/^(open|go to|show me|take me to|pull up|navigate to)\b/.test(value)) return null;
  return entries.find(([label]) => value.includes(label))?.[1] ?? null;
}

function riskFor(text: string) {
  const value = text.toLowerCase();
  if (/\b(delete|erase|remove all|cancel|pay|purchase|transfer|send email|external account|clear all|archive all)\b/.test(value)) return 'high';
  if (/\b(move|reschedule|change|edit|update|replace|reorganize|everything|all unfinished)\b/.test(value)) return 'medium';
  if (/\b(add|create|save|file|log|remind|schedule|make a task|make a note)\b/.test(value)) return 'low';
  return 'read';
}

function creationLike(text: string) {
  return /\b(create|make|draft|write|build|turn .* into|visual card|image|plan with me)\b/i.test(text);
}

export function ShaktiPresence() {
  const pathname = usePathname();
  const router = useRouter();
  const recognitionRef = useRef<Recognition | null>(null);
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<ShaktiState>('resting');
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [proposal, setProposal] = useState<PendingProposal | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('');

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem('glow.shakti.turns');
      if (saved) setTurns(JSON.parse(saved) as Turn[]);
    } catch {
      // Session continuity is optional; Shakti still works without storage.
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem('glow.shakti.turns', JSON.stringify(turns.slice(-16)));
    } catch {
      // Ignore private-browsing/session storage failures.
    }
  }, [turns]);

  useEffect(() => {
    const openShakti = (event: Event) => {
      const detail = (event as CustomEvent<{ prefill?: string }>).detail;
      setOpen(true);
      setState('waking');
      if (detail?.prefill) setInput(detail.prefill);
      window.setTimeout(() => setState((current) => current === 'waking' ? 'resting' : current), 180);
    };
    const quickAdd = () => {
      setOpen(true);
      setState('waking');
      setInput('Create ');
    };
    const contextEvent = (event: Event) => {
      const detail = (event as CustomEvent<{ label?: string; type?: string; id?: string }>).detail;
      const next = [detail?.type, detail?.label, detail?.id].filter(Boolean).join(' · ');
      if (next) setSelectedContext(next);
    };
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('shakti:open', openShakti as EventListener);
    document.addEventListener('glow:voice-open', openShakti as EventListener);
    document.addEventListener('glow:quick-add', quickAdd);
    document.addEventListener('shakti:context', contextEvent as EventListener);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('shakti:open', openShakti as EventListener);
      document.removeEventListener('glow:voice-open', openShakti as EventListener);
      document.removeEventListener('glow:quick-add', quickAdd);
      document.removeEventListener('shakti:context', contextEvent as EventListener);
      document.removeEventListener('keydown', key);
    };
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem('shakti:auto-open') === '1') {
        window.sessionStorage.removeItem('shakti:auto-open');
        setOpen(true);
      }
    } catch {
      // No-op.
    }
  }, [pathname]);

  function addTurn(turn: Turn) {
    setTurns((current) => [...current, turn].slice(-16));
  }

  function startListening() {
    const browser = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const Ctor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Ctor) {
      setState('error');
      addTurn({ role: 'shakti', text: 'Voice recognition is not available in this browser. You can type to me instead.' });
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
      setState('resting');
    };
    recognition.onend = () => setState((current) => current === 'listening' ? 'resting' : current);
    recognition.onerror = (event) => {
      setState('error');
      addTurn({ role: 'shakti', text: `I could not hear that clearly (${event.error}).` });
    };
    recognitionRef.current = recognition;
    setState('listening');
    recognition.start();
  }

  async function run(text: string, approved = false) {
    const command = text.trim();
    if (!command || pending) return;

    if (!approved) {
      const destination = navigationTarget(command);
      if (destination) {
        addTurn({ role: 'user', text: command });
        addTurn({ role: 'shakti', text: `Opening ${destination === '/today' ? 'Today' : destination.replace(/^\//, '').replace(/-/g, ' ')}.` });
        setInput('');
        setState('completing');
        router.push(destination);
        return;
      }
      addTurn({ role: 'user', text: command });
    }

    setPending(true);
    setState(approved ? 'acting' : creationLike(command) ? 'creating' : 'understanding');
    try {
      const response = await fetch('/api/shakti/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          text: command,
          sourceRoute: pathname,
          selectedContext,
          approved,
          risk: riskFor(command),
          history: turns.slice(-6),
        }),
      });
      const payload = await response.json() as ShaktiResponse;
      if (!response.ok || !payload.ok) throw new Error(payload.message || 'Shakti could not complete that request.');

      if (payload.requiresConfirmation && !approved) {
        setProposal({ text: command, actions: payload.actions ?? [] });
        setState('awaiting-approval');
        addTurn({ role: 'shakti', text: payload.message || 'I have a proposed change ready for your approval.', meta: 'Approval required' });
      } else {
        setProposal(null);
        setInput('');
        setState(payload.mode === 'completed' ? 'completing' : 'speaking');
        addTurn({
          role: 'shakti',
          text: payload.message || 'Done.',
          meta: payload.receipt?.summary ? `Receipt · ${payload.receipt.summary}` : undefined,
        });
        if (approved) router.refresh();
      }
    } catch (error) {
      setState('error');
      addTurn({ role: 'shakti', text: error instanceof Error ? error.message : 'Shakti could not complete that request.' });
    } finally {
      setPending(false);
    }
  }

  function approve() {
    if (!proposal || pending) return;
    void run(proposal.text, true);
  }

  function cancelProposal() {
    setProposal(null);
    setState('resting');
    addTurn({ role: 'shakti', text: 'Nothing changed.' });
  }

  if (pathname === '/sign-in' || pathname.startsWith('/api/')) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open Shakti"
        data-shakti-state={state}
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] right-4 z-[90] flex min-h-12 items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-2 text-left text-neutral-900 shadow-md"
      >
        <span className="h-3 w-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,1),0_0_18px_rgba(203,184,255,.7)] ring-1 ring-neutral-300" aria-hidden="true" />
        <span className="text-xs font-semibold">Shakti</span>
        <span className="hidden text-[10px] text-neutral-500 sm:inline">{STATE_LABEL[state]}</span>
      </button>

      {open ? (
        <section className="fixed bottom-[calc(env(safe-area-inset-bottom)+132px)] right-3 z-[91] flex max-h-[70vh] w-[min(430px,calc(100vw-24px))] flex-col overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-xl" aria-label="Shakti conversation">
          <header className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[.18em]">Shakti · {STATE_LABEL[state]}</div>
              <div className="mt-1 text-xs text-neutral-500">Context: {selectedContext || pathname}</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200" aria-label="Close Shakti"><X size={16} /></button>
          </header>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {turns.length === 0 ? <p className="text-sm text-neutral-600">Ask, speak, search, create, plan, or request a change. I keep the current room as context.</p> : null}
            {turns.map((turn, index) => (
              <div key={`${turn.role}-${index}`} className={`rounded-xl px-3 py-2 text-sm ${turn.role === 'user' ? 'ml-8 bg-neutral-900 text-white' : 'mr-8 bg-neutral-100 text-neutral-900'}`}>
                <p>{turn.text}</p>
                {turn.meta ? <p className="mt-1 text-[10px] opacity-65">{turn.meta}</p> : null}
              </div>
            ))}
          </div>

          {proposal ? (
            <div className="border-t border-neutral-200 px-4 py-3">
              <div className="text-xs font-semibold">Review before Shakti acts</div>
              {proposal.actions.length ? <ul className="mt-2 space-y-1 text-xs text-neutral-600">{proposal.actions.map((action, index) => <li key={`${action.type}-${index}`}>• {action.title}</li>)}</ul> : null}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button type="button" onClick={cancelProposal} className="min-h-11 rounded-xl border border-neutral-300 bg-white text-sm">Cancel</button>
                <button type="button" onClick={approve} disabled={pending} className="min-h-11 rounded-xl bg-neutral-900 text-sm font-semibold text-white disabled:opacity-50"><Check size={15} className="mr-1 inline" />Approve</button>
              </div>
            </div>
          ) : null}

          <div className="border-t border-neutral-200 p-3">
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void run(input);
                }
              }}
              placeholder="Talk to Shakti…"
              className="w-full resize-none rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500"
            />
            <div className="mt-2 grid grid-cols-[44px_1fr] gap-2">
              <button type="button" onClick={startListening} className="grid min-h-11 place-items-center rounded-xl border border-neutral-300" aria-label="Speak to Shakti"><Mic size={16} /></button>
              <button type="button" onClick={() => void run(input)} disabled={!input.trim() || pending || Boolean(proposal)} className="min-h-11 rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white disabled:opacity-40"><Send size={15} className="mr-1 inline" />{pending ? 'Working…' : 'Send'}</button>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
