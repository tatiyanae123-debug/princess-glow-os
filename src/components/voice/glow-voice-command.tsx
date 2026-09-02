'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Check, Clock3, Mic, Shield, Sparkles, Square, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> };
type RecognitionError = { error: string };
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: RecognitionEvent) => void) | null; onend: (() => void) | null; onerror: ((event: RecognitionError) => void) | null };
type RecognitionCtor = new () => Recognition;
type Risk = 'low' | 'medium' | 'high';
type AuraState = 'waking' | 'listening' | 'understanding' | 'acting' | 'complete' | 'protecting' | 'error';

const NAV: Record<string, string> = { today: '/dashboard', dashboard: '/dashboard', tasks: '/tasks', planner: '/planning', calendar: '/calendar', planning: '/planning', routines: '/routines', habits: '/habits', fitness: '/fitness', wellness: '/wellness', food: '/food', nutrition: '/food', beauty: '/beauty', 'beauty lab': '/beauty/lab', hair: '/hair', finance: '/finance', 'financial brain': '/finance/brain', goals: '/goals', projects: '/projects', notes: '/notes', settings: '/settings', world: '/world', glow: '/brain' };
const SUGGESTIONS = [
  { label: 'Protect what matters', icon: Shield, command: 'Protect what matters and simplify the rest of today' },
  { label: 'Move what can wait', icon: Clock3, command: 'Move everything that can wait until tomorrow' },
  { label: 'Show me the new plan', icon: Sparkles, command: 'Show me the best plan for the rest of today' },
];

function commandRisk(text: string): Risk { const value = text.toLowerCase(); if (/delete|remove all|erase|cancel appointment|cancel event|clear all|archive all|send email|purchase|pay bill|transfer|external account/.test(value)) return 'high'; if (/move|reschedule|change|edit|update|replace|bulk|everything|all unfinished|budget|financial|simplify the rest/.test(value)) return 'medium'; return 'low'; }
function navigationTarget(text: string) { const value = text.toLowerCase().replace(/[^a-z ]/g, ' ').trim(); const entries = Object.entries(NAV).sort((a, b) => b[0].length - a[0].length); const exact = entries.find(([label]) => value === label); if (exact) return exact[1]; if (!/^(open|go to|show me|take me to|navigate to)\b/.test(value)) return null; return entries.find(([label]) => value.includes(label))?.[1] ?? null; }

export function GlowVoiceCommand() {
  const pathname = usePathname(); const router = useRouter();
  const recognitionRef = useRef<Recognition | null>(null); const wakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null); const textRef = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState(false); const [text, setText] = useState(''); const [status, setStatus] = useState('I’m here. Tell me what you need.');
  const [auraState, setAuraState] = useState<AuraState>('waking'); const [reviewing, setReviewing] = useState(false); const [pending, setPending] = useState(false);
  const risk = commandRisk(text);

  const close = useCallback(() => { recognitionRef.current?.stop(); recognitionRef.current = null; if (wakeTimer.current) clearTimeout(wakeTimer.current); setOpen(false); setPending(false); setReviewing(false); }, []);
  const awaken = useCallback(() => { if (wakeTimer.current) clearTimeout(wakeTimer.current); setOpen(true); setText(''); setStatus('Glow is arriving…'); setAuraState('waking'); setReviewing(false); wakeTimer.current = setTimeout(() => { setAuraState('listening'); setStatus('I’m here. Tell me what you need.'); textRef.current?.focus(); }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 40 : 900); }, []);

  useEffect(() => { const key = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); awaken(); } if (event.key === 'Escape' && open) close(); }; document.addEventListener('glow:voice-open', awaken); document.addEventListener('keydown', key); return () => { document.removeEventListener('glow:voice-open', awaken); document.removeEventListener('keydown', key); }; }, [awaken, close, open]);
  useEffect(() => { if (!open) return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [open]);

  function startListening() {
    setReviewing(false); const browser = window as Window & { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }; const Ctor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Ctor) { setAuraState('protecting'); setStatus('Voice is not available in this browser. You can type to me instead.'); textRef.current?.focus(); return; }
    const recognition = new Ctor(); recognition.continuous = false; recognition.interimResults = false; recognition.lang = 'en-US';
    recognition.onresult = (event) => { const words = Array.from(event.results).map((result) => result[0]?.transcript ?? '').join(' ').trim(); setText(words); setAuraState('understanding'); setStatus('I heard you. I’m understanding what should happen next.'); };
    recognition.onend = () => { recognitionRef.current = null; setAuraState((current) => current === 'listening' ? 'understanding' : current); };
    recognition.onerror = (event) => { recognitionRef.current = null; setAuraState('protecting'); setStatus(event.error === 'not-allowed' ? 'Microphone access is off. Type to me, or allow microphone access in your browser settings.' : 'I could not hear that clearly. Try again or type your request.'); };
    recognitionRef.current = recognition; setAuraState('listening'); setStatus('Listening…'); recognition.start();
  }
  function stopListening() { recognitionRef.current?.stop(); recognitionRef.current = null; setAuraState(text.trim() ? 'understanding' : 'listening'); setStatus(text.trim() ? 'I’m understanding your request.' : 'Listening paused. Type or tap the microphone when you are ready.'); }

  async function executeCommand(command: string) {
    const lower = command.toLowerCase(); const destination = navigationTarget(command); setPending(true); setAuraState('acting'); setStatus('Glow is carrying this through…');
    try {
      if (destination) { await new Promise((resolve) => setTimeout(resolve, 420)); router.push(destination); close(); return; }
      if (/^(new task|add a task|add task)$/.test(lower)) { document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: { module: 'task' } })); close(); return; }
      if (/^(new event|add event|add an event)$/.test(lower)) { document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: { module: 'event' } })); close(); return; }
      if (/plan tomorrow/.test(lower)) { await new Promise((resolve) => setTimeout(resolve, 420)); router.push('/planning?view=tomorrow'); close(); return; }
      if (/search/.test(lower) && /doctor|note|notes/.test(lower)) { await new Promise((resolve) => setTimeout(resolve, 420)); router.push(`/brain?mode=search&q=${encodeURIComponent(command)}`); close(); return; }
      const response = await fetch('/api/voice/command', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ text: command, sourceRoute: pathname, risk }) }); const payload = await response.json() as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.message || 'I could not complete that yet.');
      setAuraState('complete'); setStatus(payload.message || 'Done. I kept everything else in place.'); setText(''); setReviewing(false); router.refresh();
    } catch (error) { setAuraState('error'); setStatus(error instanceof Error ? error.message : 'I could not complete that. Nothing was changed. Please try again.'); }
    finally { setPending(false); }
  }

  function submit() { const command = text.trim(); if (!command || pending) return; if (risk !== 'low' && !reviewing) { setReviewing(true); setAuraState('understanding'); setStatus('I prepared this, but nothing changes until you approve.'); return; } void executeCommand(command); }
  function chooseSuggestion(command: string) { setText(command); setReviewing(false); setAuraState('understanding'); setStatus('I’m shaping a safe next step. Review it when you are ready.'); textRef.current?.focus(); }

  if (!open) return null;
  return <div className="living-glow" data-aura-state={auraState} role="dialog" aria-modal="true" aria-labelledby="living-glow-title">
    <button type="button" className="living-glow__backdrop" onClick={close} aria-label="Close Ask Glow" />
    <picture className="living-glow__art"><source media="(min-width: 760px) and (orientation: landscape)" srcSet="/glow/aura/living-aura-wide-v1.webp" /><img src="/glow/aura/living-aura-portrait-v1.webp" alt="" /></picture>
    <div className="living-glow__beam" aria-hidden="true" /><div className="living-glow__ripple" aria-hidden="true" />
    <button type="button" className="living-glow__close" onClick={close} aria-label="Close Ask Glow"><X /></button>
    <section className="living-glow__conversation">
      <header><p><span id="living-glow-title">Glow</span> · {auraState === 'acting' ? 'taking action' : auraState}</p><span className="living-glow__status" role="status" aria-live="polite">{status}</span></header>
      <label className="living-glow__input"><span className="sr-only">Ask Glow anything</span><textarea ref={textRef} value={text} onChange={(event) => { setText(event.target.value); setReviewing(false); setAuraState('listening'); }} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); submit(); } }} rows={2} placeholder="Tell me what you need…" /><button type="button" onClick={recognitionRef.current ? stopListening : startListening} aria-label={recognitionRef.current ? 'Pause listening' : 'Speak to Glow'}>{recognitionRef.current ? <Square /> : <Mic />}</button></label>
      <div className="living-glow__suggestions" aria-label="Suggested actions">{SUGGESTIONS.map(({ label, icon: Icon, command }) => <button type="button" key={label} onClick={() => chooseSuggestion(command)}><Icon /><span>{label}</span></button>)}</div>
      {reviewing ? <div className="living-glow__review"><Shield /><span><strong>Ready for your approval.</strong> Glow will only apply the request shown above. Everything else stays where it is.</span></div> : null}
      {auraState === 'complete' ? <div className="living-glow__review is-complete"><Check /><span><strong>Your change is complete.</strong> You can ask for something else or return to your day.</span></div> : null}
      <p className="living-glow__safety"><Shield /> Nothing meaningful changes until you approve.</p>
      <button type="button" className="living-glow__primary" disabled={!text.trim() || pending} onClick={submit}><span>{pending ? 'Glow is working…' : reviewing ? 'Approve changes' : risk === 'low' ? 'Continue with Glow' : 'Review proposed changes'}</span><ArrowRight /></button>
    </section>
  </div>;
}
