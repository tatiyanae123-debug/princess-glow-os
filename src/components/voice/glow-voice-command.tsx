'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Mic, Send, ShieldCheck, Trash2, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { GlowOrb } from '@/components/glow-orb';

type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> };
type RecognitionError = { error: string };
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: RecognitionEvent) => void) | null; onend: (() => void) | null; onerror: ((event: RecognitionError) => void) | null };
type RecognitionCtor = new () => Recognition;
type Risk = 'low' | 'medium' | 'high';
type Orchestration = { headline: string; message: string; nextAction: { label: string; href: string }; secondary: Array<{ label: string; href: string }> };
type ChatMessage = { id: string; role: 'user' | 'assistant'; content: string };

const CHAT_KEY = 'glow-os:conversation:v1';

const NAV: Record<string, string> = {
  today: '/today', dashboard: '/dashboard', home: '/dashboard', tasks: '/tasks', planner: '/planning', calendar: '/calendar', planning: '/planning', routines: '/routines', habits: '/habits', fitness: '/fitness', 'workout plan': '/fitness/plan', workout: '/fitness/plan', wellness: '/wellness', food: '/food', nutrition: '/food', beauty: '/beauty', 'beauty lab': '/beauty/lab', hair: '/hair', finance: '/finance', 'financial brain': '/finance/brain', goals: '/goals', projects: '/projects', 'creative studio': '/creative-studio', work: '/work', career: '/work', notes: '/notes', settings: '/settings', world: '/world', travel: '/travel', 'all rooms': '/all-rooms', gmail: '/gmail', import: '/import', reminders: '/reminders', notices: '/notices', connections: '/connections', memory: '/memory', concierge: '/concierge', brain: '/brain', glow: '/brain', 'glow cards': '/glow-cards', cards: '/glow-cards',
};

function commandRisk(text: string): Risk {
  const value = text.toLowerCase();
  if (/delete|remove all|erase|cancel appointment|cancel event|clear all|archive all|send email|purchase|pay bill|transfer|external account/.test(value)) return 'high';
  if (/move|reschedule|change|edit|update|replace|bulk|everything|all unfinished|budget|financial/.test(value)) return 'medium';
  return 'low';
}

function navigationTarget(text: string) {
  const value = text.toLowerCase().replace(/[^a-z ]/g, ' ').trim();
  const entries = Object.entries(NAV).sort((a, b) => b[0].length - a[0].length);
  const exact = entries.find(([label]) => value === label);
  if (exact) return exact[1];
  if (!/^(open|go to|show me|take me to|navigate to)\b/.test(value)) return null;
  return entries.find(([label]) => value.includes(label))?.[1] ?? null;
}

function wantsNext(text: string) {
  return /what should i do|what do i do|what now|what('?s| is) next|what should i be doing|tell me what to do|how should i spend (?:my )?(?:morning|day|evening|night)|what needs my attention|then what|after that|what next/.test(text.toLowerCase());
}

function wantsMemory(text: string) {
  return /^\s*(remember(?: that)?|save this(?: as a memory)?|keep this in memory|don['’]?t forget(?: that)?)\b/i.test(text);
}

function shouldReviewAction(text: string, risk: Risk) {
  return risk !== 'low' && /calendar|event|appointment|schedule|reschedule|remind|reminder|workout|email|pay|purchase|transfer|account/i.test(text);
}

function personalRoute(text: string) {
  const value = text.toLowerCase();
  if (/good morning|just woke up|morning brief|plan my day/.test(value)) return '/briefings/morning';
  if (/today.?s habits|my habits|what are my habits/.test(value)) return '/habits';
  if (/start my morning routine|morning routine|morning ritual/.test(value) && !/card|image|visual/.test(value)) return '/routines?routine=morning-ritual&focus=1';
  if (/sunday reset/.test(value) && !/card|image|visual/.test(value)) return '/routines?routine=sunday-reset';
  if (/today.?s workout|what.?s my workout|workout today|2026 workout|fitness plan/.test(value) && !/card|image|visual/.test(value)) return '/fitness/plan';
  if (/morning.*(card|image|visual)|(?:card|image|visual).*morning/.test(value)) return '/glow-cards?kind=morning';
  if (/sunday.*(card|image|visual)|(?:card|image|visual).*sunday/.test(value)) return '/glow-cards?kind=sunday';
  if (/workout.*(card|image|visual)|(?:card|image|visual).*workout/.test(value)) return '/glow-cards?kind=workout';
  if (/week.*(card|image|visual|schedule)|(?:card|image|visual).*week/.test(value)) return '/glow-cards?kind=week';
  if (/midday.*(card|image|visual)/.test(value)) return '/glow-cards?kind=midday';
  if (/night.*(card|image|visual)|evening.*(card|image|visual)/.test(value)) return '/glow-cards?kind=night';
  return null;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GlowVoiceCommand() {
  const pathname = usePathname();
  const router = useRouter();
  const recognitionRef = useRef<Recognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);
  const [orchestration, setOrchestration] = useState<Orchestration | null>(null);
  const [reviewHref, setReviewHref] = useState<string | null>(null);
  const [answerHref, setAnswerHref] = useState<string | null>(null);
  const [speakReplies, setSpeakReplies] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const risk = commandRisk(text);
  const orbState = listening ? 'listening' : pending ? 'thinking' : messages.at(-1)?.role === 'assistant' ? 'speaking' : 'idle';

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CHAT_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setMessages(parsed.slice(-30));
    } catch { /* ignore storage errors */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-30))); } catch { /* ignore */ }
    window.setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 30);
  }, [messages]);

  useEffect(() => {
    const openGlow = () => setOpen(true);
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setOpen(true); }
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('glow:voice-open', openGlow);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('glow:voice-open', openGlow);
      document.removeEventListener('keydown', key);
      window.speechSynthesis?.cancel();
    };
  }, []);

  function speak(message: string) {
    if (!speakReplies || typeof window === 'undefined' || !('speechSynthesis' in window) || !message.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.replace(/\s+/g, ' ').trim());
    utterance.rate = 0.96;
    utterance.pitch = 1.02;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((voice) => /samantha|ava|serena|female/i.test(voice.name) && /^en/i.test(voice.lang)) ?? voices.find((voice) => /^en/i.test(voice.lang));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  function addAssistant(message: string, shouldSpeak = true) {
    setMessages((current) => [...current, { id: makeId(), role: 'assistant' as const, content: message }].slice(-30));
    if (shouldSpeak) speak(message);
  }

  function addUser(message: string) {
    setMessages((current) => [...current, { id: makeId(), role: 'user' as const, content: message }].slice(-30));
  }

  function clearConversation() {
    setMessages([]);
    setOrchestration(null);
    setReviewHref(null);
    setAnswerHref(null);
    window.speechSynthesis?.cancel();
    try { window.localStorage.removeItem(CHAT_KEY); } catch { /* ignore */ }
  }

  function startListening() {
    setOrchestration(null); setReviewHref(null); setAnswerHref(null);
    const browser = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const Ctor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Ctor) { addAssistant('Voice recognition is not available in this browser. Type your question instead.'); return; }
    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(' ').trim();
      setListening(false);
      if (transcript) window.setTimeout(() => void runCommand(transcript), 0);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => { setListening(false); addAssistant(`I couldn't hear that clearly. ${event.error}. Try again or type it.`); };
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  function stopListening() { recognitionRef.current?.stop(); setListening(false); }

  async function askGlow(command: string, history: ChatMessage[]) {
    setPending(true);
    try {
      const response = await fetch('/api/glow/ask', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ text: command, history: history.slice(-12).map(({ role, content }) => ({ role, content })) }),
      });
      const payload = await response.json() as { ok?: boolean; message?: string; headline?: string; nextAction?: { label: string; href: string }; secondary?: Array<{ label: string; href: string }>; href?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.message || 'Glow could not answer that yet.');
      if (payload.headline && payload.nextAction) setOrchestration({ headline: payload.headline, message: payload.message || '', nextAction: payload.nextAction, secondary: payload.secondary || [] });
      setAnswerHref(payload.href || null);
      addAssistant(payload.message || 'I’m here.');
    } catch (error) {
      addAssistant(error instanceof Error ? error.message : 'Glow could not answer that yet.');
    } finally { setPending(false); }
  }

  async function runCommand(commandOverride?: string) {
    const command = (commandOverride ?? text).trim();
    if (!command || pending) return;
    const historyBefore = messages;
    addUser(command);
    setText('');
    setOrchestration(null); setReviewHref(null); setAnswerHref(null);
    const lower = command.toLowerCase();
    const commandLevelRisk = commandRisk(command);

    if (wantsMemory(command)) {
      setPending(true);
      try {
        const response = await fetch('/api/glow/memory', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ text: command }) });
        const payload = await response.json() as { ok?: boolean; message?: string };
        if (!response.ok || !payload.ok) throw new Error(payload.message || 'Glow could not save that memory.');
        addAssistant(payload.message || 'Saved to Memory.'); router.refresh();
      } catch (error) { addAssistant(error instanceof Error ? error.message : 'Glow could not save that memory.'); }
      finally { setPending(false); }
      return;
    }

    if (wantsNext(command)) {
      setPending(true);
      try {
        const response = await fetch('/api/glow/orchestrate', { credentials: 'same-origin' });
        const payload = await response.json() as { ok?: boolean; message?: string; headline?: string; nextAction?: { label: string; href: string }; secondary?: Array<{ label: string; href: string }> };
        if (!response.ok || !payload.ok || !payload.headline || !payload.nextAction) throw new Error(payload.message || 'Glow could not choose the next move.');
        const result: Orchestration = { headline: payload.headline, message: payload.message || '', nextAction: payload.nextAction, secondary: payload.secondary || [] };
        setOrchestration(result); addAssistant(`${result.headline}. ${result.message}`);
      } catch (error) { addAssistant(error instanceof Error ? error.message : 'Glow could not choose the next move.'); }
      finally { setPending(false); }
      return;
    }

    if (shouldReviewAction(command, commandLevelRisk)) {
      setPending(true);
      try {
        const response = await fetch('/api/glow/action-proposal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ text: command, risk: commandLevelRisk, sourceRoute: pathname }) });
        const payload = await response.json() as { ok?: boolean; message?: string; href?: string };
        if (!response.ok || !payload.ok) throw new Error(payload.message || 'Glow could not prepare that change.');
        setReviewHref(payload.href || '/concierge'); addAssistant(payload.message || 'Prepared for review.'); router.refresh();
      } catch (error) { addAssistant(error instanceof Error ? error.message : 'Glow could not prepare that change.'); }
      finally { setPending(false); }
      return;
    }

    const personal = personalRoute(command);
    if (personal && /^(open|show|start|take me|go to)/i.test(command)) { addAssistant('Got it. Opening that for you.'); router.push(personal); return; }
    const destination = navigationTarget(command);
    if (destination) { addAssistant('Opening it now.'); router.push(destination); return; }
    if (/^(new task|add a task|add task)$/.test(lower)) { document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: { module: 'task' } })); addAssistant('Opening a new task.'); return; }
    if (/^(new event|add event|add an event)$/.test(lower)) { document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: { module: 'event' } })); addAssistant('Opening a new event.'); return; }
    if (/plan tomorrow/.test(lower) && /^(open|show|go|take)/.test(lower)) { addAssistant('Opening tomorrow’s plan.'); router.push('/planning?view=tomorrow'); return; }

    await askGlow(command, historyBefore);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center bg-[#1b1520]/20 px-3 pt-[max(5vh,env(safe-area-inset-top))] backdrop-blur-[8px]" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="flex h-[min(860px,90vh)] w-full max-w-[720px] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/95 shadow-[0_34px_110px_rgba(75,58,91,.24)] backdrop-blur-2xl">
        <div className="relative overflow-hidden border-b border-[#EFEAF1] px-5 py-5 sm:px-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_30%_0%,rgba(231,239,255,.75),transparent_40%),radial-gradient(circle_at_72%_10%,rgba(251,225,240,.7),transparent_38%),radial-gradient(circle_at_50%_10%,rgba(238,229,255,.65),transparent_45%)]" />
          <div className="relative flex items-start gap-4">
            <GlowOrb state={orbState} size={64} className="mt-1" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#8E8096]">Glow conversation</p>
              <h2 className="glow-display mt-1 text-[30px] leading-tight text-[#1C1C1E]">Talk to me naturally.</h2>
              <p className="mt-1.5 max-w-[500px] text-[12px] leading-5 text-[#6E6E73]">Glow keeps the thread, writes every reply here, and can speak back. Follow-ups like “why?”, “what next?”, or “tell me more” stay in the same conversation.</p>
            </div>
            <div className="flex gap-1">
              <button type="button" onClick={clearConversation} aria-label="Clear conversation" className="rounded-full p-2 text-[#8B858C] hover:bg-white/70"><Trash2 size={16} /></button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close Glow" className="rounded-full p-2 text-[#77777B] hover:bg-white/70"><X size={18} /></button>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#fff_0%,#fcf9fc_100%)] px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="mx-auto mt-6 max-w-[520px] rounded-[22px] border border-[#EEE8F0] bg-white px-5 py-5 text-center shadow-sm">
              <p className="text-[13px] font-medium text-[#39343A]">Start anywhere.</p>
              <p className="mt-2 text-[12px] leading-5 text-[#7A737D]">“It’s Wednesday night, what should I do?” · “Why that?” · “What should I do after?” · “Tell me my full night routine.”</p>
            </div>
          ) : messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[86%] rounded-[20px] px-4 py-3 text-[13px] leading-5 shadow-sm ${message.role === 'user' ? 'bg-[#29242B] text-white' : 'border border-[#ECE6EE] bg-white text-[#433D45]'}`}>
                {message.content}
              </div>
            </div>
          ))}
          {pending ? <div className="flex justify-start"><div className="flex items-center gap-2 rounded-[18px] border border-[#ECE6EE] bg-white px-4 py-3 text-[12px] text-[#77707A]"><GlowOrb state="thinking" size={24} /> Glow is thinking…</div></div> : null}
        </div>

        {(orchestration || reviewHref || answerHref) ? (
          <div className="border-t border-[#F0EBF1] bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-wrap gap-2">
              {orchestration ? <>
                <button type="button" onClick={() => router.push(orchestration.nextAction.href)} className="rounded-full bg-[#1C1C1E] px-4 py-2.5 text-[11px] text-white">{orchestration.nextAction.label}</button>
                {orchestration.secondary.map((action) => <button type="button" key={action.href} onClick={() => router.push(action.href)} className="rounded-full border border-[#E6E0E7] bg-white px-4 py-2.5 text-[11px]">{action.label}</button>)}
              </> : null}
              {reviewHref ? <button type="button" onClick={() => router.push(reviewHref)} className="rounded-full bg-[#1C1C1E] px-4 py-2.5 text-[11px] text-white">Review action</button> : null}
              {answerHref ? <button type="button" onClick={() => router.push(answerHref)} className="rounded-full border border-[#E6E0E7] bg-white px-4 py-2.5 text-[11px]">Open related page</button> : null}
            </div>
          </div>
        ) : null}

        <div className="border-t border-[#EEE9EF] bg-white p-4 sm:p-5">
          <div className="rounded-[20px] border border-[#E4E0E6] bg-[#FCFBFC] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.9)] focus-within:border-[#C9B6D0] focus-within:ring-4 focus-within:ring-[#EFE8F3]/60">
            <textarea value={text} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void runCommand(); } }} rows={2} placeholder="Say anything or keep the conversation going…" className="w-full resize-none bg-transparent px-3 py-2 text-[14px] leading-6 text-[#1C1C1E] outline-none placeholder:text-[#AAA4AC]" />
            <div className="flex items-center gap-2 px-1 pb-1">
              <button type="button" onClick={listening ? stopListening : startListening} className="glow-command-chip"><Mic size={14} />{listening ? 'Listening…' : 'Speak'}</button>
              <button type="button" onClick={() => setSpeakReplies((value) => !value)} className="glow-command-chip">{speakReplies ? <Volume2 size={14} /> : <VolumeX size={14} />}{speakReplies ? 'Voice on' : 'Voice off'}</button>
              {text ? <div className={`ml-auto hidden items-center gap-1.5 text-[10px] sm:flex ${risk === 'high' ? 'text-amber-800' : risk === 'medium' ? 'text-[#7A6254]' : 'text-[#53705A]'}`}>{risk === 'high' ? <AlertTriangle size={12} /> : risk === 'medium' ? <ShieldCheck size={12} /> : <CheckCircle2 size={12} />}{risk === 'high' ? 'Confirm first' : risk === 'medium' ? 'Review first' : 'Ready'}</div> : null}
              <button type="button" disabled={!text.trim() || pending} onClick={() => void runCommand()} className="ml-auto inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#1C1C1E] px-4 text-[12px] font-semibold text-white disabled:opacity-35 sm:ml-0"><Send size={13} />Send</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
