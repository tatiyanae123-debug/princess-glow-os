'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bandage,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Droplet,
  Expand,
  Hand,
  Heart,
  Leaf,
  Library,
  Maximize2,
  Moon,
  NotebookPen,
  Pause,
  Play,
  Plus,
  Repeat2,
  RotateCcw,
  Search,
  Settings,
  Sparkles,
  Star,
  Sun,
  Volume2,
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import type { GuaShaOwnedTool, GuaShaSavedStep } from '@/lib/beauty/gua-sha-studio-data';
import {
  selectSavedSteps,
  type GuaShaMovementStep,
  type GuaShaPressure,
  type GuaShaStudioView,
  type GuaShaZone,
} from './gua-sha-reference-model';
import styles from './gua-sha-reference-studio-v2.module.css';

export type { GuaShaStudioView } from './gua-sha-reference-model';

type Props = {
  view: GuaShaStudioView;
  savedRoutineSteps: GuaShaSavedStep[];
  ownedTools: GuaShaOwnedTool[];
  linkedSlipProducts: string[];
  userName?: string | null;
  userImage?: string | null;
};

type CareMode = 'quick' | 'normal' | 'low' | 'event';
type FollowMode = 'guided' | 'freestyle';
type ToolMode = 'tool' | 'hands';
type ReadinessKey = 'skinClean' | 'handsClean' | 'slip' | 'irritated' | 'broken' | 'procedure' | 'time';

type PersistedSession = {
  careMode: CareMode;
  concerns: string[];
  readiness: Record<ReadinessKey, boolean>;
  readinessTouched: ReadinessKey[];
  followMode: FollowMode;
  toolMode: ToolMode;
  mirror: boolean;
  voice: boolean;
  voiceSpeed: number;
  breathCue: boolean;
  durationByView: Partial<Record<Exclude<GuaShaStudioView, 'today'>, number>>;
  repsByView: Partial<Record<Exclude<GuaShaStudioView, 'today'>, number>>;
  stepByView: Partial<Record<Exclude<GuaShaStudioView, 'today'>, number>>;
  slipAppliedAt?: string | null;
};

const SESSION_KEY = 'glow.gua-sha.session.v3';
const VIEW_PATHS: Record<GuaShaStudioView, string> = {
  today: '/beauty/facial-massage',
  guided: '/beauty/facial-massage/guided',
  morning: '/beauty/facial-massage/morning',
  midday: '/beauty/facial-massage/midday',
  night: '/beauty/facial-massage/night',
};
const START_INDEX: Record<Exclude<GuaShaStudioView, 'today'>, number> = { guided: 1, morning: 2, midday: 0, night: 3 };
const DEFAULT_DURATION: Record<Exclude<GuaShaStudioView, 'today'>, number> = { guided: 10, morning: 12, midday: 3, night: 10 };

const OPEN_PORTRAIT = 'https://images.pexels.com/photos/3764480/pexels-photo-3764480.jpeg?cs=srgb&dl=pexels-olly-3764480.jpg&fm=jpg';
const CLOSED_PORTRAIT = 'https://images.pexels.com/photos/3764479/pexels-photo-3764479.jpeg?cs=srgb&dl=pexels-olly-3764479.jpg&fm=jpg';

const META: Record<GuaShaStudioView, { eyebrow: string; title: string; subtitle: string; tip: string }> = {
  today: { eyebrow: 'GUA SHA STUDIO', title: 'GUA SHA TODAY', subtitle: 'What does my face need?', tip: 'Small steps create lasting change.' },
  guided: { eyebrow: 'GUA SHA STUDIO', title: 'Guided Facial Movement', subtitle: 'Sculpt · Release · Renew', tip: 'Keep strokes slow, intentional, and connected.' },
  morning: { eyebrow: 'GUA SHA STUDIO', title: 'MORNING LIGHT GUA SHA', subtitle: 'Wake + refresh', tip: 'Morning Gua Sha helps reduce puffiness and sets a positive tone for your day.' },
  midday: { eyebrow: 'GUA SHA STUDIO', title: 'MIDDAY MINI RESET', subtitle: '2–3 minute release', tip: 'Small resets add up to a calmer, brighter you.' },
  night: { eyebrow: 'GUA SHA STUDIO', title: 'NIGHT FULL SCULPT', subtitle: 'Slow evening session', tip: 'Longer, slower strokes help your nervous system unwind.' },
};

const DEFAULT_READINESS: Record<ReadinessKey, boolean> = {
  skinClean: false,
  handsClean: false,
  slip: false,
  irritated: false,
  broken: false,
  procedure: false,
  time: false,
};

function travel(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
}

function openGlow(prompt: string) {
  document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill: prompt } }));
}

function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

function GlassOrb({ small = false }: { small?: boolean }) {
  return <span className={small ? styles.orbSmall : styles.orb} aria-hidden="true" />;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={`${styles.switch} ${checked ? styles.switchOn : ''}`}><span /></button>;
}

function PressureDots({ pressure, count = 9 }: { pressure: GuaShaPressure; count?: number }) {
  const active = pressure === 'Light' ? Math.min(4, count) : pressure === 'Medium' ? Math.ceil(count * .66) : count;
  return <span className={styles.pressureDots}>{Array.from({ length: count }, (_, index) => <i key={index} className={index < active ? styles.on : ''} />)}</span>;
}

function JadeTool() {
  return <span className={styles.jadeTool} aria-label="Gua Sha tool" />;
}

function MiniFace({ zone }: { zone: GuaShaZone }) {
  const fill = zone === 'Neck'
    ? <><path d="M48 104h24l6 28H42z" /><ellipse cx="60" cy="111" rx="13" ry="9" /></>
    : zone === 'Jaw'
      ? <><path d="M27 77c8 25 58 25 66 0-8 29-23 38-33 38S35 106 27 77z" /><ellipse cx="60" cy="88" rx="14" ry="8" /></>
      : zone === 'Eyes'
        ? <><ellipse cx="42" cy="57" rx="15" ry="7" /><ellipse cx="78" cy="57" rx="15" ry="7" /></>
        : zone === 'Forehead'
          ? <path d="M34 31c14-11 39-11 52 0l-5 19H39z" />
          : <><ellipse cx="37" cy="75" rx="16" ry="12" /><ellipse cx="83" cy="75" rx="16" ry="12" /></>;
  return <svg viewBox="0 0 120 145" className={styles.miniFace} aria-hidden="true"><path d="M60 13c-24 0-39 20-39 46 0 36 17 54 39 54s39-18 39-54C99 33 84 13 60 13Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".52" /><path d="M39 53c7-5 13-5 20 0M61 53c7-5 13-5 20 0M60 55v22m-7 7c5 4 9 4 14 0M43 94c10 7 24 7 34 0" fill="none" stroke="currentColor" strokeWidth="1" opacity=".42" strokeLinecap="round" /><path d="M45 114c-1 11-6 17-12 22m42-22c1 11 6 17 12 22" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".32" /><g className={styles.miniZone}>{fill}</g></svg>;
}

function MovementOverlay({ step, view, mirror, visible }: { step: GuaShaMovementStep | null; view: Exclude<GuaShaStudioView, 'today'>; mirror: boolean; visible: boolean }) {
  if (!step || !visible) return null;
  const context = view === 'guided' || view === 'night';
  const contextPaths = [
    'M45 20 C44 14 44 10 45 6', 'M50 20 V5', 'M55 20 C56 14 56 10 55 6',
    'M42 35 C36 34 31 32 28 29', 'M58 35 C64 34 69 32 72 29',
    'M43 49 C35 48 29 44 25 39', 'M57 49 C65 48 71 44 75 39',
    'M42 64 C34 62 28 57 24 51', 'M58 64 C66 62 72 57 76 51',
    'M46 73 C44 82 43 89 43 96', 'M50 72 V97', 'M54 73 C56 82 57 89 57 96',
  ];
  const zonePaths: Record<GuaShaZone, string[]> = {
    Cheeks: ['M48 47 C42 47 36 43 31 38', 'M52 47 C58 47 64 43 69 38', 'M47 52 C40 52 34 48 29 43', 'M53 52 C60 52 66 48 71 43'],
    Jaw: ['M46 63 C38 62 31 58 25 52', 'M54 63 C62 62 69 58 75 52'],
    Eyes: ['M46 40 C40 40 35 38 31 35', 'M54 40 C60 40 65 38 69 35'],
    Forehead: ['M44 28 C43 20 44 13 45 8', 'M50 28 V7', 'M56 28 C57 20 56 13 55 8'],
    Neck: ['M46 70 C45 80 45 89 45 97', 'M50 70 V98', 'M54 70 C55 80 55 89 55 97'],
  };
  const active = zonePaths[step.zone];
  return <svg className={styles.routeSvg} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ transform: mirror ? 'scaleX(-1)' : undefined }} aria-hidden="true"><defs><marker id={`arrow-${view}`} markerWidth="4" markerHeight="4" refX="3.1" refY="1.7" orient="auto"><path d="M0,0 L0,3.4 L3.5,1.7 z" fill="rgba(255,255,255,.95)" /></marker></defs>{context ? contextPaths.map((d, index) => <path key={`c-${index}`} d={d} className={`${styles.route} ${index % 2 ? styles.routeDashed : ''}`} markerEnd={`url(#arrow-${view})`} />) : null}{active.map((d, index) => <path key={`a-${index}`} d={d} className={`${styles.route} ${index % 2 ? styles.routeDashed : ''} ${view === 'night' && index === 0 ? styles.routeActive : ''}`} markerEnd={`url(#arrow-${view})`} />)}</svg>;
}

function DurationPanel({ duration, setDuration, morning = false }: { duration: number; setDuration: (value: number) => void; morning?: boolean }) {
  return <section className={styles.panel}><h2>Routine length</h2><div className={styles.durationValue}><Clock3 size={25} strokeWidth={1.2} /><strong>{duration}</strong><span>min ⌄</span></div><input type="range" min={5} max={20} value={duration} onChange={(event) => setDuration(Number(event.target.value))} /><div className={styles.rangeLabels}>{morning ? <><span>5</span><span>10</span><span>15</span><span>20+</span></> : <><span>5</span><span>10</span><span>20+</span></>}</div></section>;
}

function ModePanel({ toolMode, setToolMode, followMode, setFollowMode, morning = false }: { toolMode: ToolMode; setToolMode: (mode: ToolMode) => void; followMode: FollowMode; setFollowMode: (mode: FollowMode) => void; morning?: boolean }) {
  if (morning) return <section className={styles.panel}><h2>Mode</h2><div className={styles.modeGrid}><button type="button" className={followMode === 'guided' ? styles.active : ''} onClick={() => setFollowMode('guided')}><JadeTool /><span>Guided</span></button><button type="button" className={followMode === 'freestyle' ? styles.active : ''} onClick={() => setFollowMode('freestyle')}><Hand size={29} strokeWidth={1.2} /><span>Freestyle</span></button></div></section>;
  return <section className={styles.panel}><h2>Mode</h2><div className={styles.modeGrid}><button type="button" className={toolMode === 'tool' ? styles.active : ''} onClick={() => setToolMode('tool')}><JadeTool /><span>Tool mode</span></button><button type="button" className={toolMode === 'hands' ? styles.active : ''} onClick={() => setToolMode('hands')}><Hand size={29} strokeWidth={1.2} /><span>Hands only</span></button></div></section>;
}

function ProductCard({ product }: { product: string | null }) {
  return <div className={styles.productCard}><span className={styles.productBottle} /><span><strong>{product ?? 'Choose a slip product'}</strong><small>{product ? 'Calm · Glide · Nourish' : 'No linked product yet'}</small></span><ChevronDown size={14} /></div>;
}

function RoutineChooser({ onClose, onSelect }: { onClose: () => void; onSelect: (view: Exclude<GuaShaStudioView, 'today'>) => void }) {
  const cards: { view: Exclude<GuaShaStudioView, 'today'>; title: string; subtitle: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { view: 'guided', title: 'Guided Facial Movement', subtitle: 'Sculpt · Release · Renew', icon: Sparkles },
    { view: 'morning', title: 'Morning Light Gua Sha', subtitle: 'Wake + refresh', icon: Sun },
    { view: 'midday', title: 'Midday Mini Reset', subtitle: '2–3 minute desk-break release', icon: Zap },
    { view: 'night', title: 'Night Full Sculpt', subtitle: 'Slow evening session', icon: Moon },
  ];
  return <div className={styles.routineOverlay} role="dialog" aria-modal="true" aria-label="Gua Sha routines"><div className={styles.routineSheet}><header><div><h2>Gua Sha Routines</h2><p>Choose the ritual that fits your time and energy. Your current Gua Sha session state stays with you.</p></div><button type="button" onClick={onClose} aria-label="Close routines"><X size={18} /></button></header><div className={styles.routineCards}>{cards.map(({ view, title, subtitle, icon: Icon }) => <button key={view} type="button" className={styles.routineCard} onClick={() => onSelect(view)}><span><Icon size={21} /></span><span><strong>{title}</strong><small>{subtitle}</small></span><ChevronRight size={17} /></button>)}</div></div></div>;
}

export function GuaShaReferenceStudioV2({ view, savedRoutineSteps, ownedTools, linkedSlipProducts, userName, userImage }: Props) {
  const meta = META[view];
  const firstName = userName?.trim().split(/\s+/)[0] || 'You';
  const sessionView = view === 'today' ? null : view;
  const steps = useMemo(() => sessionView ? selectSavedSteps(sessionView, savedRoutineSteps) : [], [sessionView, savedRoutineSteps]);
  const [greeting, setGreeting] = useState('Hello');
  const [routineChooserOpen, setRoutineChooserOpen] = useState(false);
  const [careMode, setCareMode] = useState<CareMode>('quick');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [readiness, setReadiness] = useState<Record<ReadinessKey, boolean>>(DEFAULT_READINESS);
  const [readinessTouched, setReadinessTouched] = useState<ReadinessKey[]>([]);
  const [followMode, setFollowMode] = useState<FollowMode>('guided');
  const [toolMode, setToolMode] = useState<ToolMode>('tool');
  const [mirror, setMirror] = useState(true);
  const [voice, setVoice] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [breathCue, setBreathCue] = useState(true);
  const [duration, setDuration] = useState(view === 'today' ? 5 : DEFAULT_DURATION[view]);
  const [reps, setReps] = useState(6);
  const [stepIndex, setStepIndex] = useState(view === 'today' ? 0 : START_INDEX[view]);
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const [slipAppliedAt, setSlipAppliedAt] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const stageRef = useRef<HTMLElement | null>(null);

  const safeStepIndex = steps.length ? Math.min(stepIndex, steps.length - 1) : 0;
  const step = steps[safeStepIndex] ?? null;
  const baseTotal = useMemo(() => steps.reduce((sum, item) => sum + item.seconds, 0), [steps]);
  const effectiveSeconds = step ? Math.max(15, Math.round(step.seconds * ((duration * 60) / Math.max(1, baseTotal)))) : 60;
  const slipProducts = useMemo(() => Array.from(new Set([...(step?.products ?? []), ...linkedSlipProducts])).filter(Boolean), [step, linkedSlipProducts]);
  const slipProduct = slipProducts[0] ?? null;

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as PersistedSession;
        setCareMode(saved.careMode ?? 'quick');
        setConcerns(saved.concerns ?? []);
        setReadiness(saved.readiness ?? DEFAULT_READINESS);
        setReadinessTouched(saved.readinessTouched ?? []);
        setFollowMode(saved.followMode ?? 'guided');
        setToolMode(saved.toolMode ?? 'tool');
        setMirror(saved.mirror ?? true);
        setVoice(saved.voice ?? true);
        setVoiceSpeed(saved.voiceSpeed ?? 1);
        setBreathCue(saved.breathCue ?? true);
        if (view !== 'today') {
          setDuration(saved.durationByView?.[view] ?? DEFAULT_DURATION[view]);
          setReps(saved.repsByView?.[view] ?? 6);
          setStepIndex(saved.stepByView?.[view] ?? START_INDEX[view]);
        }
        setSlipAppliedAt(saved.slipAppliedAt ?? null);
      }
    } catch {}
    setHydrated(true);
  }, [view]);

  useEffect(() => {
    if (!hydrated) return;
    const persisted: PersistedSession = {
      careMode,
      concerns,
      readiness,
      readinessTouched,
      followMode,
      toolMode,
      mirror,
      voice,
      voiceSpeed,
      breathCue,
      durationByView: view === 'today' ? {} : { [view]: duration },
      repsByView: view === 'today' ? {} : { [view]: reps },
      stepByView: view === 'today' ? {} : { [view]: safeStepIndex },
      slipAppliedAt,
    };
    try {
      const previous = sessionStorage.getItem(SESSION_KEY);
      const previousState = previous ? JSON.parse(previous) as PersistedSession : null;
      persisted.durationByView = { ...(previousState?.durationByView ?? {}), ...persisted.durationByView };
      persisted.repsByView = { ...(previousState?.repsByView ?? {}), ...persisted.repsByView };
      persisted.stepByView = { ...(previousState?.stepByView ?? {}), ...persisted.stepByView };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(persisted));
    } catch {}
  }, [hydrated, view, careMode, concerns, readiness, readinessTouched, followMode, toolMode, mirror, voice, voiceSpeed, breathCue, duration, reps, safeStepIndex, slipAppliedAt]);

  useEffect(() => {
    if (!step) return;
    setRemaining(effectiveSeconds);
    setPlaying(false);
    setEnded(false);
  }, [step?.id, effectiveSeconds]);

  useEffect(() => {
    if (!playing || remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [playing, remaining]);

  useEffect(() => {
    if (!playing || !voice || followMode !== 'guided' || !step || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(`${step.name}. ${step.subtitle}. Use ${step.pressure.toLowerCase()} pressure.`);
    utterance.rate = voiceSpeed;
    utterance.pitch = .95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [playing, voice, voiceSpeed, followMode, step?.id]);

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('glow:context', { detail: {
      room: 'gua-sha-studio',
      view,
      careMode,
      readiness,
      readinessTouched,
      concerns,
      session: step ? { stepId: step.id, stepName: step.name, zone: step.zone, pressure: step.pressure, duration, reps, followMode, toolMode, mirror, voice } : null,
    }}));
  }, [view, careMode, readiness, readinessTouched, concerns, step, duration, reps, followMode, toolMode, mirror, voice]);

  const allReadinessAnswered = readinessTouched.length === 7;
  const ready = allReadinessAnswered && readiness.skinClean && readiness.handsClean && readiness.slip && readiness.time && !readiness.irritated && !readiness.broken && !readiness.procedure;
  const unsafe = readiness.irritated || readiness.broken || readiness.procedure;

  function toggleReadiness(key: ReadinessKey) {
    setReadiness((current) => ({ ...current, [key]: !current[key] }));
    setReadinessTouched((current) => current.includes(key) ? current : [...current, key]);
  }

  function toggleConcern(name: string) {
    setConcerns((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  }

  function persistBeforeTravel(nextView: Exclude<GuaShaStudioView, 'today'>) {
    try {
      const existing = sessionStorage.getItem(SESSION_KEY);
      const parsed = existing ? JSON.parse(existing) as PersistedSession : null;
      const next: PersistedSession = {
        careMode, concerns, readiness, readinessTouched, followMode, toolMode, mirror, voice, voiceSpeed, breathCue,
        durationByView: { ...(parsed?.durationByView ?? {}) },
        repsByView: { ...(parsed?.repsByView ?? {}) },
        stepByView: { ...(parsed?.stepByView ?? {}) },
        slipAppliedAt,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {}
    travel(VIEW_PATHS[nextView]);
  }

  async function expandStage() {
    try {
      if (stageRef.current?.requestFullscreen) await stageRef.current.requestFullscreen();
    } catch {}
  }

  function endSession() {
    setPlaying(false);
    setEnded(true);
    document.dispatchEvent(new CustomEvent('glow:action-receipt', { detail: {
      action: 'gua-sha-session-completed',
      view,
      routine: meta.title,
      stepId: step?.id ?? null,
      stepName: step?.name ?? null,
      concerns,
      careMode,
      duration,
      toolMode,
      slipProduct,
      slipAppliedAt,
      occurredAt: new Date().toISOString(),
    }}));
  }

  const energy = view === 'night' ? 'Calm' : careMode === 'low' ? 'Low energy' : 'Balanced';
  const sessionLabel = view === 'night' ? 'Night Full Sculpt' : view === 'morning' ? 'Morning Light Gua Sha' : view === 'midday' ? 'Midday Mini Reset' : view === 'guided' ? 'Guided Facial Movement' : 'Gua Sha Today';

  return <main className={styles.pageRoot}><section className={`${styles.studio} ${view === 'night' ? styles.night : ''}`} data-room-local-identity="gua-sha-studio" data-gua-sha-view={view}>
    <aside className={styles.localNav} aria-label="Gua Sha Studio instruments">
      <div className={styles.brandBlock}><strong>Glow OS⌄</strong><span>Gua Sha Studio</span><span>Living Beauty System</span></div>
      <nav className={styles.navList}>
        <button type="button" className={`${styles.navButton} ${styles.navActive}`} onClick={() => travel(VIEW_PATHS.today)}><span><Sparkles size={15} /></span><span>Gua Sha Studio</span></button>
        <button type="button" className={styles.navButton} onClick={() => setRoutineChooserOpen(true)}><span><Settings size={15} /></span><span>Routines</span></button>
        <button type="button" className={styles.navButton} onClick={() => travel('/beauty/skincare?view=device-library')}><span><Wrench size={15} /></span><span>Tools</span></button>
        <button type="button" className={styles.navButton} onClick={() => travel('/notes')}><span><NotebookPen size={15} /></span><span>Journal</span></button>
        <button type="button" className={styles.navButton} onClick={() => travel('/beauty/skincare?view=product-library')}><span><Library size={15} /></span><span>Library</span></button>
        <button type="button" className={styles.navButton} onClick={() => travel('/beauty/skincare?view=skin-timeline')}><span><BookOpen size={15} /></span><span>Progress</span></button>
        <button type="button" className={styles.navButton} onClick={() => travel('/settings')}><span><Settings size={15} /></span><span>Settings</span></button>
      </nav>
      <div className={styles.navBottom}><div className={styles.profileCard}>{userImage ? <img src={userImage} alt="" /> : <span className={styles.avatarFallback}>{firstName.slice(0, 1).toUpperCase()}</span>}<span>{greeting},</span><strong>{firstName}</strong><span className={styles.profileMeta}><small>{view === 'night' ? 'Tonight' : 'Today'}</small><b>{sessionLabel}</b></span><span className={styles.profileMeta}><small>Energy</small><b>{energy}</b></span></div><button type="button" className={styles.shaktiCard} onClick={() => openGlow(`Help me with ${sessionLabel}. Use my current Gua Sha session context.`)}><GlassOrb /><span><small>Shakti</small><strong>Listening</strong></span></button></div>
    </aside>

    <section className={styles.workArea}>
      <header className={styles.topbar}><div className={styles.titleBlock}><p>{meta.eyebrow}</p><h1>{meta.title}</h1><span>{meta.subtitle}</span></div><button type="button" className={styles.askGlow} onClick={() => openGlow(`I am in ${meta.title}. Help me decide what to do next using my current Glow context.`)}><Search size={14} /><span>Ask Glow…</span></button><GlassOrb /></header>
      {view === 'today' ? <TodayExperience firstName={firstName} readiness={readiness} readinessTouched={readinessTouched} toggleReadiness={toggleReadiness} concerns={concerns} toggleConcern={toggleConcern} careMode={careMode} setCareMode={setCareMode} ready={ready} unsafe={unsafe} onStart={persistBeforeTravel} stageRef={stageRef} onExpand={expandStage} /> : <SessionExperience view={view} steps={steps} step={step} stepIndex={safeStepIndex} setStepIndex={setStepIndex} duration={duration} setDuration={setDuration} reps={reps} setReps={setReps} followMode={followMode} setFollowMode={setFollowMode} toolMode={toolMode} setToolMode={setToolMode} mirror={mirror} setMirror={setMirror} voice={voice} setVoice={setVoice} voiceSpeed={voiceSpeed} setVoiceSpeed={setVoiceSpeed} breathCue={breathCue} setBreathCue={setBreathCue} playing={playing} setPlaying={setPlaying} remaining={remaining} effectiveSeconds={effectiveSeconds} slipProduct={slipProduct} slipAppliedAt={slipAppliedAt} setSlipAppliedAt={setSlipAppliedAt} ended={ended} endSession={endSession} stageRef={stageRef} onExpand={expandStage} />}
      <footer className={styles.footer}><div className={styles.tip}><GlassOrb small /><strong>Tip</strong><span>{meta.tip}</span></div><div className={styles.saveState}><Check size={12} /><span>All changes saved</span></div></footer>
    </section>
    {ended ? <div className={styles.explainReceipt}><Check size={13} />Session complete and available to Glow history.</div> : null}
    {routineChooserOpen ? <RoutineChooser onClose={() => setRoutineChooserOpen(false)} onSelect={(next) => { setRoutineChooserOpen(false); persistBeforeTravel(next); }} /> : null}
  </section></main>;
}

function TodayExperience({ readiness, readinessTouched, toggleReadiness, concerns, toggleConcern, careMode, setCareMode, ready, unsafe, onStart, stageRef, onExpand }: {
  firstName: string;
  readiness: Record<ReadinessKey, boolean>;
  readinessTouched: ReadinessKey[];
  toggleReadiness: (key: ReadinessKey) => void;
  concerns: string[];
  toggleConcern: (name: string) => void;
  careMode: CareMode;
  setCareMode: (mode: CareMode) => void;
  ready: boolean;
  unsafe: boolean;
  onStart: (view: Exclude<GuaShaStudioView, 'today'>) => void;
  stageRef: React.MutableRefObject<HTMLElement | null>;
  onExpand: () => void;
}) {
  const rows: { key: ReadinessKey; title: string; subtitle: string; icon: React.ComponentType<{ size?: number }>; risk?: boolean }[] = [
    { key: 'skinClean', title: 'Skin clean', subtitle: 'Free from makeup & SPF', icon: Sparkles },
    { key: 'handsClean', title: 'Hands clean', subtitle: 'Washed and dry', icon: Hand },
    { key: 'slip', title: 'Enough slip available', subtitle: 'Oil or serum ready', icon: Droplet },
    { key: 'irritated', title: 'Skin irritated', subtitle: 'Red, inflamed or reactive', icon: Sparkles, risk: true },
    { key: 'broken', title: 'Broken skin', subtitle: 'Cuts, acne or open areas', icon: Bandage, risk: true },
    { key: 'procedure', title: 'Recent procedure', subtitle: 'Facial, injectables, peel, etc.', icon: Plus, risk: true },
    { key: 'time', title: 'Time available', subtitle: 'Do you have a few quiet minutes?', icon: Clock3 },
  ];
  const concernRows = [
    ['Puffiness', Sparkles], ['Feeling fine', Circle], ['Jaw tension', Heart], ['Skin sensitive today', Leaf], ['Temple tension', Circle], ['Recently used strong skincare', Droplet], ['Scalp tension', Circle], ['Procedure recovery', Plus], ['Neck tightness', Expand], ['Just want relaxation', Leaf],
  ] as const;
  const modes: { id: CareMode; title: string; subtitle: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'quick', title: 'Quick', subtitle: '5 min', icon: Zap }, { id: 'normal', title: 'Normal', subtitle: '10–15 min', icon: Circle }, { id: 'low', title: 'Low Energy', subtitle: 'Gentle & short', icon: Moon }, { id: 'event', title: 'Event', subtitle: 'Depuff & glow', icon: Star },
  ];
  const hour = typeof window === 'undefined' ? 12 : new Date().getHours();
  let recommendedView: Exclude<GuaShaStudioView, 'today'> = 'guided';
  if (unsafe || careMode === 'low') recommendedView = 'midday';
  else if (careMode === 'event' || concerns.includes('Puffiness')) recommendedView = 'morning';
  else if (hour >= 18 && careMode !== 'quick') recommendedView = 'night';
  else if (hour >= 11 && hour < 17 && careMode === 'quick') recommendedView = 'midday';
  const recommendationTitle = unsafe ? 'Hands-only gentle version' : recommendedView === 'morning' ? 'Morning Light Gua Sha' : recommendedView === 'midday' ? '2–3 minute mini reset' : recommendedView === 'night' ? 'Night Full Sculpt' : '5-minute light massage';
  const recommendationZones = concerns.some((item) => /jaw|neck/i.test(item)) ? 'Jaw + cheeks + neck' : 'Jaw + cheeks + neck';
  const statusCopy = !readinessTouched.length ? 'Answer the quick readiness check to personalize today’s session.' : ready ? 'Everything looks good to go.' : unsafe ? 'A gentler or hands-only option is safer today.' : 'Finish the readiness check before starting.';

  return <div className={styles.workspace}>
    <aside className={styles.leftCol}><section className={styles.panel}><h2>Today’s Readiness</h2><p>A quick check before you begin</p><div className={styles.readinessRows}>{rows.map(({ key, title, subtitle, icon: Icon, risk }) => <div className={styles.readinessRow} key={key}><Icon size={18} color={risk && readiness[key] ? '#b77b71' : undefined} /><span><strong>{title}</strong><small>{subtitle}</small></span><Toggle checked={readiness[key]} onChange={() => toggleReadiness(key)} label={title} /></div>)}</div></section><section className={`${styles.panel} ${styles.readinessResult} ${ready ? '' : styles.warn}`}><span className={styles.readyCheck}>{ready ? <Check size={28} /> : <AlertTriangle size={23} />}</span><span><strong>{ready ? 'You’re ready' : unsafe ? 'Simplify today' : 'Check in first'}</strong><small>{statusCopy}</small></span></section></aside>
    <section className={styles.stage} ref={stageRef}><img className={styles.portrait} src={OPEN_PORTRAIT} alt="Editorial portrait used as the Gua Sha assessment canvas" /><div className={styles.portraitVeil} /><button type="button" className={styles.expand} onClick={onExpand} aria-label="Expand face assessment"><Maximize2 size={17} /></button><div className={styles.concernGrid}>{concernRows.map(([label, Icon]) => <button key={label} type="button" onClick={() => toggleConcern(label)} className={concerns.includes(label) ? styles.active : ''}><Icon size={14} /><span>{label}</span></button>)}</div><section className={styles.careSheet}><h2>Choose your care mode</h2><p>We’ll tailor the session to your energy and needs today.</p><div className={styles.careModes}>{modes.map(({ id, title, subtitle, icon: Icon }) => <button type="button" key={id} onClick={() => setCareMode(id)} className={careMode === id ? styles.active : ''}><Icon size={20} /><strong>{title}</strong><span>{subtitle}</span></button>)}</div><div className={styles.careSummary}><Sparkles size={14} /><span>{concerns.length ? `Today: ${concerns.join(' · ')}` : 'Nothing major. Smooth front. Relax jaw. Protect skin barrier.'}</span></div></section></section>
    <aside className={styles.rightCol}><section className={styles.panel}><h2>Recommended today</h2><p>Based on your answers</p><div className={styles.recommendBody}><div className={styles.miniFaceWrap}><MiniFace zone={concerns.some((item) => /jaw|neck/i.test(item)) ? 'Jaw' : 'Cheeks'} /></div><div><strong>{recommendationTitle}</strong><span>{recommendationZones}</span><ul className={styles.reasonList}><li><Check size={12} />Matches your selected care mode</li><li><Check size={12} />Keeps pressure light</li><li><Check size={12} />Adapts to today’s concerns</li><li><Check size={12} />Preserves your readiness state</li></ul></div></div><button type="button" className={styles.primaryAction} onClick={() => onStart(recommendedView)} disabled={!readinessTouched.length}><Play size={18} /><span>{unsafe ? 'Start gentle version' : 'Start guided'}</span><ChevronRight size={17} /></button></section><section className={styles.panel}><h2>Skip or simplify</h2><p>Safety first</p><div className={styles.warningBox}><AlertTriangle size={19} /><span><strong>If skin is irritated, keep tonight simple.</strong><small>Choose a gentle, hands-only version or focus on relaxation.</small></span></div><button type="button" className={styles.actionRow} onClick={() => onStart('midday')}><Hand size={17} /><span>Hands-only gentle version</span><ChevronRight size={15} /></button></section><section className={styles.panel}><h2>Session fit</h2><p>Your current status</p><div className={styles.fitRow}><Clock3 size={16} /><span>Time available</span><strong>{careMode === 'normal' ? '10–15 min' : careMode === 'event' ? '~ 10 min' : '~ 5 min'}</strong></div><div className={styles.fitRow}><Sparkles size={16} /><span>Intensity</span><strong>Light</strong></div><div className={styles.fitRow}><Heart size={16} /><span>Good match</span><strong>{ready ? 'Yes' : unsafe ? 'Simplify' : 'Pending'}</strong></div></section></aside>
  </div>;
}

function SessionExperience({ view, steps, step, stepIndex, setStepIndex, duration, setDuration, reps, setReps, followMode, setFollowMode, toolMode, setToolMode, mirror, setMirror, voice, setVoice, voiceSpeed, setVoiceSpeed, breathCue, setBreathCue, playing, setPlaying, remaining, effectiveSeconds, slipProduct, slipAppliedAt, setSlipAppliedAt, ended, endSession, stageRef, onExpand }: {
  view: Exclude<GuaShaStudioView, 'today'>;
  steps: GuaShaMovementStep[];
  step: GuaShaMovementStep | null;
  stepIndex: number;
  setStepIndex: (value: number) => void;
  duration: number;
  setDuration: (value: number) => void;
  reps: number;
  setReps: (value: number) => void;
  followMode: FollowMode;
  setFollowMode: (mode: FollowMode) => void;
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;
  mirror: boolean;
  setMirror: (value: boolean) => void;
  voice: boolean;
  setVoice: (value: boolean) => void;
  voiceSpeed: number;
  setVoiceSpeed: (value: number) => void;
  breathCue: boolean;
  setBreathCue: (value: boolean) => void;
  playing: boolean;
  setPlaying: (value: boolean) => void;
  remaining: number;
  effectiveSeconds: number;
  slipProduct: string | null;
  slipAppliedAt: string | null;
  setSlipAppliedAt: (value: string | null) => void;
  ended: boolean;
  endSession: () => void;
  stageRef: React.MutableRefObject<HTMLElement | null>;
  onExpand: () => void;
}) {
  const zone = step?.zone ?? 'Cheeks';
  const pressure = step?.pressure ?? 'Light';
  const visibleRoutes = followMode === 'guided';
  const displayedStep = view === 'night' ? Math.max(1, stepIndex) : stepIndex + 1;
  const portrait = view === 'midday' ? CLOSED_PORTRAIT : OPEN_PORTRAIT;
  const previous = () => setStepIndex(Math.max(0, stepIndex - 1));
  const next = () => setStepIndex(Math.min(Math.max(0, steps.length - 1), stepIndex + 1));

  return <div className={styles.workspace}>
    <aside className={styles.leftCol}>{view === 'guided' ? <><ModePanel toolMode={toolMode} setToolMode={setToolMode} followMode={followMode} setFollowMode={setFollowMode} /><DurationPanel duration={duration} setDuration={setDuration} /><section className={styles.panel}><h2>Follow along</h2><div className={styles.segmented}><button type="button" className={followMode === 'guided' ? styles.active : ''} onClick={() => setFollowMode('guided')}>Guided</button><button type="button" className={followMode === 'freestyle' ? styles.active : ''} onClick={() => setFollowMode('freestyle')}>Freestyle</button></div><div className={styles.settingRow}><Volume2 size={18} /><span>Voice over</span><Toggle checked={voice} onChange={() => setVoice(!voice)} label="Voice over" /></div><div className={styles.settingRow}><span /><span>Voice speed</span><strong>{voiceSpeed.toFixed(1)}x</strong></div><input type="range" min=".75" max="1.5" step=".25" value={voiceSpeed} onChange={(event) => setVoiceSpeed(Number(event.target.value))} /></section><section className={styles.panel}><div className={styles.settingRow}><span><Repeat2 size={18} /></span><span>Mirror mode</span><Toggle checked={mirror} onChange={() => setMirror(!mirror)} label="Mirror mode" /></div><div className={styles.mirrorPreview}><MiniFace zone="Cheeks" /><span>↔</span><MiniFace zone="Cheeks" /></div></section><section className={styles.panel}><h2>Repetitions</h2><div className={styles.repRow}><Repeat2 size={22} /><strong>{reps}</strong><span>reps</span><div><button type="button" onClick={() => setReps(Math.max(1, reps - 1))}>−</button><button type="button" onClick={() => setReps(Math.min(20, reps + 1))}>＋</button></div></div></section></> : null}
      {view === 'morning' ? <><DurationPanel duration={duration} setDuration={setDuration} morning /><ModePanel toolMode={toolMode} setToolMode={setToolMode} followMode={followMode} setFollowMode={setFollowMode} morning /><section className={styles.panel}><div className={styles.settingRow}><Volume2 size={18} /><span>Voice guidance<br /><small>Gentle & clear</small></span><Toggle checked={voice} onChange={() => setVoice(!voice)} label="Voice guidance" /></div></section><section className={styles.panel}><div className={styles.settingRow}><Repeat2 size={18} /><span>Mirror mode<br /><small>Mirror directions left ↔ right</small></span><Toggle checked={mirror} onChange={() => setMirror(!mirror)} label="Mirror mode" /></div><div className={styles.mirrorPreview}><MiniFace zone="Cheeks" /><span>↔</span><MiniFace zone="Cheeks" /></div></section><section className={styles.panel}><h2>Repetitions <small>(per side)</small></h2><div className={styles.repRow}><Repeat2 size={22} /><strong>{reps}</strong><span>reps</span><div><button type="button" onClick={() => setReps(Math.max(1, reps - 1))}>−</button><button type="button" onClick={() => setReps(Math.min(20, reps + 1))}>＋</button></div></div></section><section className={styles.panel}><Sun size={24} /><h2>A brighter you</h2><p>A quick daily ritual to reduce puffiness, release tension, and wake up your natural glow.</p></section></> : null}
      {view === 'midday' ? <><section className={styles.panel}><h2>Quick settings</h2><div className={styles.durationValue}><Clock3 size={24} /><strong>2–3</strong><span>min ⌄</span></div><div className={styles.segmented}><button type="button" className={followMode === 'guided' ? styles.active : ''} onClick={() => setFollowMode('guided')}>Guided</button><button type="button" className={followMode === 'freestyle' ? styles.active : ''} onClick={() => setFollowMode('freestyle')}>Off</button></div><div className={styles.settingRow}><Hand size={18} /><span>Use hands instead<br /><small>Same movements, no tool needed.</small></span><Toggle checked={toolMode === 'hands'} onChange={() => setToolMode(toolMode === 'hands' ? 'tool' : 'hands')} label="Use hands instead" /></div></section><section className={`${styles.panel} ${styles.resetPath}`}><h2>The reset path</h2>{steps.map((item, index) => <button type="button" key={item.id} onClick={() => setStepIndex(index)}><span className={styles.thumb} /><i>{index + 1}</i><span><strong>{item.name}</strong><small>{item.subtitle}</small><b>{item.seconds} sec</b></span></button>)}</section></> : null}
      {view === 'night' ? <><section className={`${styles.panel} ${styles.timeline}`}><h2>Evening session</h2><p>A longer, restorative routine</p>{steps.map((item, index) => <button type="button" key={item.id} className={index === stepIndex ? styles.active : ''} onClick={() => setStepIndex(index)}><i /><span><strong>{item.name}</strong><small>{item.subtitle}</small></span></button>)}</section><section className={styles.panel}><h2>Session settings</h2><div className={styles.settingRow}><Clock3 size={17} /><span>Duration</span><select aria-label="Night routine duration" value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={10}>10 min</option><option value={15}>15 min</option><option value={20}>20 min</option></select></div><div className={styles.settingRow}><Leaf size={17} /><span>Pressure</span><strong>{pressure}</strong></div><div className={styles.settingRow}><Volume2 size={17} /><span>Voice guidance</span><Toggle checked={voice} onChange={() => setVoice(!voice)} label="Voice guidance" /></div><div className={styles.settingRow}><Repeat2 size={17} /><span>Mirror mode</span><Toggle checked={mirror} onChange={() => setMirror(!mirror)} label="Mirror mode" /></div><div className={styles.settingRow}><Expand size={17} /><span>Breath cue</span><Toggle checked={breathCue} onChange={() => setBreathCue(!breathCue)} label="Breath cue" /></div></section></> : null}
    </aside>

    <section className={styles.stage} ref={stageRef}><img className={`${styles.portrait} ${view === 'midday' ? styles.portraitClosed : ''}`} src={portrait} alt="Photographic face used as the Gua Sha movement canvas" /><div className={styles.portraitVeil} /><div className={styles.stepBadge}><span>Step</span><strong>{step ? `${displayedStep} of ${steps.length}` : '— of —'}</strong></div><button type="button" className={styles.expand} onClick={onExpand} aria-label="Expand facial guide"><Maximize2 size={17} /></button><MovementOverlay step={step} view={view} mirror={mirror} visible={visibleRoutes} />
      {view === 'midday' ? <><div className={styles.floatingCue}><strong>{step?.name ?? 'Jaw release'}</strong><span>{step?.subtitle ?? 'With knuckles or tool, glide from jaw to ear.'}</span></div><div className={styles.miniTimer}><button type="button" onClick={previous}><ChevronLeft size={20} /></button><div className={styles.timerCore}><span className={styles.timerArc} style={{ '--progress': `${Math.max(0, Math.min(100, ((effectiveSeconds - remaining) / Math.max(1, effectiveSeconds)) * 100))}%` } as React.CSSProperties} /><strong>{formatClock(remaining)}</strong><span>{step?.name ?? 'Reset'}</span></div><button type="button" onClick={next}><ChevronRight size={20} /></button></div><div className={styles.miniTransport}><button type="button" onClick={() => { setPlaying(false); setStepIndex(0); }}><RotateCcw size={20} /><span>Restart</span></button><button type="button" className={styles.pauseAction} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={24} /> : <Play size={24} />}<span>{playing ? 'Pause' : 'Start'}</span></button><button type="button" onClick={endSession}><X size={20} /><span>End</span></button></div></> : null}
      {view === 'morning' ? <><div className={styles.morningFacts}><div className={styles.factTop}><span><small>Step {stepIndex + 1} of {steps.length}</small><strong>{step?.name ?? 'Cheek sweep'}</strong><small>{step?.subtitle ?? 'Upward and outward'}</small></span><span className={styles.liveClock}><Clock3 size={17} />{formatClock(remaining)}</span></div><div className={styles.factGrid}><span><b>Start point</b>{step?.startPoint ?? 'Side of nose'}</span><span><b>End point</b>{step?.endPoint ?? 'Cheekbone toward ear'}</span><span><b>Pressure</b>{pressure}</span><span><b>Repetitions</b>{reps} each side</span><span><b>Tool edge</b>{step?.toolEdge ?? 'Broad curved edge'}</span></div></div><Transport previous={previous} next={next} playing={playing} setPlaying={setPlaying} first={stepIndex === 0} last={stepIndex === steps.length - 1} /></> : null}
      {view === 'guided' || view === 'night' ? <><div className={styles.movementCard}><span><strong>{step?.name ?? 'Current movement'}</strong><small>{step?.subtitle ?? 'Move slowly and gently.'}</small></span><span className={styles.pressureSummary}><span>{view === 'night' ? 'Use light pressure' : 'Pressure'}</span><strong>{pressure}</strong><PressureDots pressure={pressure} /></span>{toolMode === 'tool' ? <JadeTool /> : <Hand size={31} strokeWidth={1.15} />}</div><Transport previous={previous} next={next} playing={playing} setPlaying={setPlaying} first={stepIndex === 0} last={stepIndex === steps.length - 1} /></> : null}
    </section>

    <aside className={styles.rightCol}>{view === 'guided' ? <><section className={styles.panel}><h2>Active zone</h2><MiniFace zone={zone} /></section><section className={styles.panel}><h2>Pressure guide</h2><div className={styles.rangeLabels}><span>Light</span><span>Medium</span><span>Firm</span></div><PressureDots pressure={pressure} /></section><section className={styles.panel}><h2>Tools & slip</h2><p>Recommended</p><ProductCard product={slipProduct} /><button type="button" className={styles.actionRow} onClick={() => setSlipAppliedAt(new Date().toISOString())}><Droplet size={16} /><span>Apply more slip</span><span>{slipAppliedAt ? '✓' : ''}</span></button><button type="button" className={styles.actionRow} onClick={() => travel('/beauty/skincare?view=product-library')}><Plus size={16} /><span>Add your own</span><ChevronRight size={14} /></button></section><section className={styles.panel}><h2>Today’s focus</h2><p>Release tension</p><strong>{zone === 'Jaw' ? 'Jaw · Cheeks · Eyes' : `${zone} · gentle movement`}</strong></section></> : null}
      {view === 'morning' ? <><section className={`${styles.panel} ${styles.sequence}`}><h2>Your morning sequence</h2>{steps.map((item, index) => <button type="button" key={item.id} className={index === stepIndex ? styles.active : ''} onClick={() => setStepIndex(index)}><i>{index + 1}</i><span><strong>{item.name}</strong><small>{item.subtitle}</small></span><em>~ {Math.max(1, Math.round(item.seconds / 60))} min</em></button>)}</section><section className={styles.panel}><h2>Today’s morning fit</h2><p>Active zone: {zone}</p><div className={styles.recommendBody}><MiniFace zone={zone} /><ul className={styles.reasonList}><li><Check size={12} />Depuffs and brightens</li><li><Check size={12} />Relaxes facial tension</li><li><Check size={12} />Boosts circulation</li><li><Check size={12} />Wakes up your glow</li></ul></div></section><section className={styles.panel}><h2>Slip check</h2><ProductCard product={slipProduct} /><div className={styles.benefitRow}><Check size={18} /><span><strong>{slipProduct ? 'Good slip — you’re ready' : 'Slip not verified'}</strong><small>{slipProduct ? 'Skin looks hydrated and smooth.' : 'Choose a known compatible product first.'}</small></span></div></section><section className={styles.panel}><Leaf size={24} /><strong>Best for:</strong><p>Puffiness, jaw tension, waking up the face.</p></section></> : null}
      {view === 'midday' ? <><section className={styles.panel}><Sun size={29} /><h2>Desk break reset</h2><p>A quick release to feel lighter, clearer, and more you.</p></section><section className={styles.panel}><h2>Best when</h2><div className={styles.careModes}><span>Midday tension</span><span>Screen fatigue</span><span>Jaw tightness</span><span>Quick refresh</span></div></section><section className={styles.panel}><h2>Helpful cues</h2><div className={styles.cueRow}><MiniFace zone="Jaw" /><span><strong>Unclench your jaw</strong><small>Let your teeth slightly part.</small></span></div><div className={styles.cueRow}><Expand size={25} /><span><strong>Shoulders back</strong><small>Soften and drop.</small></span></div><div className={styles.cueRow}><Heart size={24} /><span><strong>Take four slow breaths</strong><small>In through the nose, out longer.</small></span></div></section><section className={styles.panel}><h2>Tools & slip</h2><ProductCard product={slipProduct} /></section></> : null}
      {view === 'night' ? <><section className={styles.panel}><h2>Tonight’s slip</h2><p>Nourish. Protect. Glide.</p><ProductCard product={slipProduct} /><div className={styles.benefitRow}><Leaf size={18} /><span><strong>Great for tonight</strong><small>Supports repair and relaxation</small></span></div><div className={styles.benefitRow}><Droplet size={18} /><span><strong>Enough glide</strong><small>Keeps skin comfortable</small></span></div><div className={styles.benefitRow}><Sparkles size={18} /><span><strong>Works with your skincare</strong><small>Confirm compatibility with active ingredients</small></span></div><button type="button" className={styles.actionRow} onClick={() => setSlipAppliedAt(new Date().toISOString())}><Droplet size={18} /><span>Reapply slip</span><Plus size={18} /></button></section><NightSafety /><section className={styles.panel}><Moon size={34} /><h2>A calmer you</h2><p>Release the day.<br />Sculpt with care.<br />Rest in your glow.</p></section></> : null}</aside>
  </div>;
}

function Transport({ previous, next, playing, setPlaying, first, last }: { previous: () => void; next: () => void; playing: boolean; setPlaying: (value: boolean) => void; first: boolean; last: boolean }) {
  return <div className={styles.transport}><button type="button" onClick={previous} disabled={first}><ChevronLeft size={24} /></button><button type="button" className={styles.pauseAction} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={24} /> : <Play size={24} />}</button><button type="button" onClick={next} disabled={last}><ChevronRight size={24} /></button></div>;
}

function NightSafety() {
  const [calm, setCalm] = useState(false);
  const [broken, setBroken] = useState(false);
  const [compatible, setCompatible] = useState(false);
  return <section className={styles.panel}><h2>Evening safety</h2><p>Check in before you begin</p><div className={styles.safetyRow}><Leaf size={18} /><span><strong>Skin feels calm</strong><small>Not irritated or reactive</small></span><Toggle checked={calm} onChange={() => setCalm(!calm)} label="Skin feels calm" /></div><div className={styles.safetyRow}><Heart size={18} /><span><strong>No broken skin</strong><small>Cuts, acne or open areas</small></span><Toggle checked={broken} onChange={() => setBroken(!broken)} label="No broken skin" /></div><div className={styles.safetyRow}><Sparkles size={18} /><span><strong>Compatible with tonight’s skincare</strong><small>Active ingredients are skin-safe</small></span><Toggle checked={compatible} onChange={() => setCompatible(!compatible)} label="Compatible with tonight skincare" /></div></section>;
}
