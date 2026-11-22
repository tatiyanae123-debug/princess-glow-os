'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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
  Wrench,
  X,
  Zap,
} from 'lucide-react';
import type { GuaShaOwnedTool, GuaShaSavedStep } from '@/lib/beauty/gua-sha-studio-data';
import {
  selectSavedSteps,
  VIEW_META,
  type GuaShaMovementStep,
  type GuaShaPressure,
  type GuaShaStudioView,
  type GuaShaZone,
} from './gua-sha-reference-model';
import styles from './gua-sha-reference-studio.module.css';

export type { GuaShaStudioView } from './gua-sha-reference-model';

type Props = {
  view: GuaShaStudioView;
  savedRoutineSteps: GuaShaSavedStep[];
  ownedTools: GuaShaOwnedTool[];
  linkedSlipProducts: string[];
  userName?: string | null;
};

type CareMode = 'quick' | 'normal' | 'low' | 'event';
type ReadinessKey = 'skinClean' | 'handsClean' | 'slip' | 'irritated' | 'broken' | 'procedure' | 'time';

const VIEW_PATHS: Record<GuaShaStudioView, string> = {
  today: '/beauty/facial-massage',
  guided: '/beauty/facial-massage/guided',
  morning: '/beauty/facial-massage/morning',
  midday: '/beauty/facial-massage/midday',
  night: '/beauty/facial-massage/night',
};

const START_INDEX: Record<Exclude<GuaShaStudioView, 'today'>, number> = { guided: 1, morning: 2, midday: 0, night: 3 };
const DEFAULT_DURATION: Record<Exclude<GuaShaStudioView, 'today'>, number> = { guided: 10, morning: 12, midday: 3, night: 10 };

function formatClock(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, '0')}`;
}

function GlassOrb({ small = false }: { small?: boolean }) {
  return <span className={small ? styles.orbSmall : styles.orb} aria-hidden="true" />;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={`${styles.switch} ${checked ? styles.switchOn : ''}`}>
      <span />
    </button>
  );
}

function PressureDots({ pressure, count = 5 }: { pressure: GuaShaPressure; count?: number }) {
  const active = pressure === 'Light' ? 1 : pressure === 'Medium' ? Math.ceil(count / 2) : count;
  return <span className={styles.pressureDots}>{Array.from({ length: count }, (_, index) => <i key={index} className={index < active ? styles.pressureDotOn : ''} />)}</span>;
}

function ToolShape() {
  return <span className={styles.toolShape} aria-hidden="true" />;
}

function MiniFace({ zone }: { zone: GuaShaZone }) {
  const fill = zone === 'Neck'
    ? <><path d="M48 104h24l6 28H42z" /><ellipse cx="60" cy="111" rx="13" ry="9" /></>
    : zone === 'Jaw'
      ? <path d="M28 79c8 23 55 23 64 0-8 28-23 36-32 36S36 107 28 79z" />
      : zone === 'Eyes'
        ? <><ellipse cx="42" cy="57" rx="15" ry="7" /><ellipse cx="78" cy="57" rx="15" ry="7" /></>
        : zone === 'Forehead'
          ? <path d="M34 31c14-11 39-11 52 0l-5 19H39z" />
          : <><ellipse cx="37" cy="75" rx="16" ry="12" /><ellipse cx="83" cy="75" rx="16" ry="12" /></>;
  return (
    <svg viewBox="0 0 120 145" className={styles.miniFace} aria-hidden="true">
      <path d="M60 13c-24 0-39 20-39 46 0 36 17 54 39 54s39-18 39-54C99 33 84 13 60 13Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".52" />
      <path d="M39 53c7-5 13-5 20 0M61 53c7-5 13-5 20 0M60 55v22m-7 7c5 4 9 4 14 0M43 94c10 7 24 7 34 0" fill="none" stroke="currentColor" strokeWidth="1" opacity=".42" strokeLinecap="round" />
      <path d="M45 114c-1 11-6 17-12 22m42-22c1 11 6 17 12 22" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".32" />
      <g className={styles.miniZone}>{fill}</g>
    </svg>
  );
}

function Portrait({ zone, mirror, showRoutes = true, activeGlow = false, eyesClosed = false }: { zone: GuaShaZone; mirror: boolean; showRoutes?: boolean; activeGlow?: boolean; eyesClosed?: boolean }) {
  return (
    <svg viewBox="0 0 620 760" className={`${styles.faceMap} ${mirror ? styles.mirrored : ''}`} role="img" aria-label="Warm editorial face guide with Gua Sha movement paths">
      <defs>
        <linearGradient id="gsSkin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9aa8e"/><stop offset=".34" stopColor="#bd8567"/><stop offset=".72" stopColor="#9e6652"/><stop offset="1" stopColor="#7c4b3f"/></linearGradient>
        <radialGradient id="gsSkinLight" cx="42%" cy="30%" r="65%"><stop offset="0" stopColor="#fff5ed" stopOpacity=".72"/><stop offset=".4" stopColor="#efc5aa" stopOpacity=".22"/><stop offset="1" stopColor="#533127" stopOpacity=".1"/></radialGradient>
        <linearGradient id="gsHair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5b4035"/><stop offset=".42" stopColor="#30231f"/><stop offset="1" stopColor="#6a493a"/></linearGradient>
        <linearGradient id="gsLip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d59b91"/><stop offset="1" stopColor="#9f6b69"/></linearGradient>
        <radialGradient id="gsGlow" cx="50%" cy="38%" r="67%"><stop offset="0" stopColor="#fff" stopOpacity=".98"/><stop offset=".67" stopColor="#faf4ed" stopOpacity=".68"/><stop offset="1" stopColor="#eee8e2" stopOpacity=".12"/></radialGradient>
        <marker id="gsArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,.97)"/></marker>
        <filter id="gsSoft"><feGaussianBlur stdDeviation="1.2"/></filter>
        <filter id="gsActive"><feGaussianBlur stdDeviation="3.8"/></filter>
      </defs>
      <ellipse cx="310" cy="370" rx="282" ry="344" fill="url(#gsGlow)" />
      <g fill="url(#gsHair)"><ellipse cx="310" cy="205" rx="180" ry="176"/><ellipse cx="179" cy="282" rx="55" ry="150"/><ellipse cx="441" cy="282" rx="55" ry="150"/></g>
      <g fill="none" stroke="#6d4d42" strokeWidth="13" strokeLinecap="round" opacity=".72">
        <path d="M158 167C130 207 150 244 132 284C116 322 146 352 130 396C116 438 154 456 141 510"/><path d="M188 111C156 148 179 182 160 214C145 240 160 274 148 306"/><path d="M229 91C196 127 221 159 201 192C186 214 198 244 180 273"/><path d="M279 82C246 116 270 149 247 178C227 206 243 233 224 259"/><path d="M327 81C297 113 320 147 296 175C279 196 293 224 277 247"/><path d="M374 90C346 118 364 151 345 178C329 201 341 228 330 250"/><path d="M418 113C392 141 407 172 391 198C378 221 390 246 380 270"/><path d="M458 163C431 192 446 227 431 254C417 281 432 313 421 343"/><path d="M466 251C494 291 473 329 488 363C502 396 469 430 483 477C494 512 468 531 471 558"/>
      </g>
      <path d="M230 550C230 599 216 635 198 667H422C404 635 390 599 390 550Z" fill="url(#gsSkin)"/>
      <path d="M72 760C101 678 177 642 239 629C279 620 341 620 381 629C443 642 519 678 548 760Z" fill="url(#gsSkin)"/>
      <ellipse cx="310" cy="350" rx="148" ry="224" fill="url(#gsSkin)"/><ellipse cx="310" cy="350" rx="148" ry="224" fill="url(#gsSkinLight)"/><ellipse cx="166" cy="361" rx="24" ry="44" fill="#a26d59"/><ellipse cx="454" cy="361" rx="24" ry="44" fill="#a26d59"/>
      <g fill="none" strokeLinecap="round"><path d="M219 278C244 259 272 258 294 274" stroke="#3f2c29" strokeWidth="8"/><path d="M326 274C349 258 377 259 401 278" stroke="#3f2c29" strokeWidth="8"/>
        {eyesClosed ? <><path d="M221 318C246 331 270 330 290 316" stroke="#4c3430" strokeWidth="3.8"/><path d="M330 316C351 330 375 331 399 318" stroke="#4c3430" strokeWidth="3.8"/></> : <><ellipse cx="257" cy="318" rx="29" ry="10" fill="#f1e6dd" stroke="#4c3430" strokeWidth="3"/><ellipse cx="363" cy="318" rx="29" ry="10" fill="#f1e6dd" stroke="#4c3430" strokeWidth="3"/><circle cx="257" cy="318" r="6" fill="#49352e"/><circle cx="363" cy="318" r="6" fill="#49352e"/></>}
        <path d="M309 323C301 371 298 404 316 421" stroke="#6d493d" strokeWidth="3.2" opacity=".5"/><path d="M292 433C303 441 318 441 329 433" stroke="#6d493d" strokeWidth="2" opacity=".35"/></g>
      <path d="M263 477C286 458 334 458 357 477C339 497 282 498 263 477Z" fill="url(#gsLip)"/><path d="M275 477C294 469 325 469 345 477" fill="none" stroke="#f1bdb4" strokeWidth="2" opacity=".7"/><ellipse cx="246" cy="392" rx="31" ry="18" fill="#f0b69d" opacity=".13" filter="url(#gsSoft)"/><ellipse cx="374" cy="392" rx="31" ry="18" fill="#f0b69d" opacity=".13" filter="url(#gsSoft)"/>
      {showRoutes ? <MovementRoutes zone={zone} activeGlow={activeGlow} /> : null}
    </svg>
  );
}

function MovementRoutes({ zone, activeGlow }: { zone: GuaShaZone; activeGlow: boolean }) {
  const common = { fill:'none', stroke:'rgba(255,255,255,.96)', strokeWidth:2.25, strokeLinecap:'round' as const, markerEnd:'url(#gsArrow)' };
  const paths: Record<GuaShaZone, string[]> = {
    Cheeks: ['M286 396C247 391 213 371 185 342','M334 396C373 391 407 371 435 342','M287 430C246 426 211 404 181 374','M333 430C374 426 409 404 439 374'],
    Jaw: ['M276 474C231 467 194 446 162 412','M344 474C389 467 426 446 458 412'],
    Eyes: ['M276 350C241 349 213 338 192 319','M344 350C379 349 407 338 428 319'],
    Forehead: ['M260 280C255 242 256 205 264 171','M310 276V160','M360 280C365 242 364 205 356 171'],
    Neck: ['M276 560C273 608 271 648 272 695','M310 558V700','M344 560C347 608 349 648 348 695'],
  };
  return <g>{paths[zone].map((d,index)=><path key={d} d={d} {...common} strokeDasharray={index % 2 ? '2 6' : undefined} className={index===0 && activeGlow ? styles.activeRoute : undefined} />)}</g>;
}

function Blossom() {
  return <div className={styles.blossom} aria-hidden="true"><i/><i/><i/><i/><i/><b/></div>;
}

function ToolSlip({ products, tools, selectedToolIndex, setSelectedToolIndex, compact = false }: { products: string[]; tools: GuaShaOwnedTool[]; selectedToolIndex: number; setSelectedToolIndex: (value:number)=>void; compact?: boolean }) {
  const selected = tools[selectedToolIndex] ?? null;
  const slip = products[0] ?? null;
  return (
    <div className={`${styles.toolSlip} ${compact ? styles.toolSlipCompact : ''}`}>
      {selected ? <div className={styles.toolRecord}><ToolShape/><div><strong>{selected.name}</strong><span>{selected.status === 'confirmed' ? 'Owned · confirmed' : selected.status.replaceAll('-', ' ')}</span></div><ChevronDown size={13}/></div> : <div className={styles.truthRow}><Wrench size={15}/><span>No confirmed Gua Sha tool selected.</span></div>}
      <div className={styles.slipRecord}><Droplet size={16}/><div><strong>{slip ?? 'No slip product linked'}</strong><span>{slip ? 'Linked from your saved Gua Sha routine' : 'Glow will not invent a product recommendation.'}</span></div></div>
      {tools.length > 1 ? <select value={selectedToolIndex} onChange={(event)=>setSelectedToolIndex(Number(event.target.value))} aria-label="Choose owned Gua Sha tool">{tools.map((tool,index)=><option value={index} key={`${tool.name}-${index}`}>{tool.name}</option>)}</select> : null}
    </div>
  );
}

export function GuaShaReferenceStudio({ view, savedRoutineSteps, ownedTools, linkedSlipProducts, userName }: Props) {
  const meta = VIEW_META[view];
  const firstName = userName?.trim().split(/\s+/)[0] || 'You';
  const [greeting, setGreeting] = useState('Hello');
  const [careMode, setCareMode] = useState<CareMode>('quick');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [readiness, setReadiness] = useState<Record<ReadinessKey, boolean>>({ skinClean:true, handsClean:true, slip:true, irritated:false, broken:false, procedure:false, time:true });
  const [mode, setMode] = useState<'tool'|'hands'>('tool');
  const [guided, setGuided] = useState(true);
  const [mirror, setMirror] = useState(true);
  const [voice, setVoice] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [duration, setDuration] = useState(view === 'today' ? 5 : DEFAULT_DURATION[view]);
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(view === 'today' ? 0 : START_INDEX[view]);
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(view === 'today' ? 300 : 60);
  const [reps, setReps] = useState(6);
  const [ended, setEnded] = useState(false);

  const sessionView = view === 'today' ? null : view;
  const steps = useMemo(() => sessionView ? selectSavedSteps(sessionView, savedRoutineSteps) : [], [sessionView, savedRoutineSteps]);
  const safeStepIndex = steps.length ? Math.min(stepIndex, steps.length - 1) : 0;
  const step = steps[safeStepIndex] ?? null;
  const slipProducts = useMemo(() => {
    const fromStep = step?.products ?? [];
    return Array.from(new Set([...fromStep, ...linkedSlipProducts])).filter(Boolean);
  }, [step, linkedSlipProducts]);

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  useEffect(() => {
    if (!step) return;
    setRemaining(view === 'midday' ? step.seconds : Math.max(30, step.seconds));
    setReps(step.repetitions);
    setPlaying(false);
  }, [step?.id, view]);

  useEffect(() => {
    if (!playing || remaining <= 0) return;
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [playing, remaining]);

  useEffect(() => {
    document.dispatchEvent(new CustomEvent('glow:context', { detail: {
      room: 'gua-sha-studio',
      view,
      careMode,
      readiness,
      concerns,
      step: step ? { id: step.id, name: step.name, zone: step.zone, pressure: step.pressure, source: step.source } : null,
      toolMode: mode,
      mirror,
      voice,
      duration,
    }}));
  }, [view, careMode, readiness, concerns, step, mode, mirror, voice, duration]);

  function openGlow(prompt: string) {
    document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill: prompt } }));
  }

  function toggleConcern(name: string) {
    setConcerns((current) => current.includes(name) ? current.filter((item)=>item!==name) : [...current, name]);
  }

  function toggleReadiness(key: ReadinessKey) {
    setReadiness((current)=>({ ...current, [key]: !current[key] }));
  }

  function previous() { if (steps.length) setStepIndex((value)=>Math.max(0, value - 1)); }
  function next() { if (steps.length) setStepIndex((value)=>Math.min(steps.length - 1, value + 1)); }
  function restart() { if (step) { setRemaining(step.seconds); setPlaying(false); setEnded(false); } }
  function endSession() {
    setPlaying(false);
    setEnded(true);
    document.dispatchEvent(new CustomEvent('glow:action-receipt', { detail: {
      action: 'gua-sha-session-ended',
      view,
      stepId: step?.id ?? null,
      stepName: step?.name ?? null,
      source: step?.source ?? null,
      occurredAt: new Date().toISOString(),
    }}));
  }

  const ready = readiness.skinClean && readiness.handsClean && readiness.slip && readiness.time && !readiness.irritated && !readiness.broken && !readiness.procedure;
  const sessionLabel = view === 'night' ? 'Night Full Sculpt' : view === 'morning' ? 'Morning Light' : view === 'midday' ? 'Mini reset' : view === 'guided' ? 'Guided session' : 'Studio check-in';
  const profileMode = view === 'night' ? 'Calm' : careMode === 'low' ? 'Low energy' : careMode === 'event' ? 'Event' : 'Balanced';

  return (
    <main className={styles.pageRoot}>
      <section className={`${styles.studio} ${view === 'night' ? styles.nightStudio : ''}`} data-room-local-identity="gua-sha-studio" data-gua-sha-view={view}>
        <aside className={styles.localNav} aria-label="Gua Sha Studio local instruments">
          <div className={styles.brandBlock}><Link href="/" className={styles.brand}>Glow OS⌄</Link><span>Gua Sha Studio</span><span>Living Beauty System</span></div>
          <nav className={styles.navList}>
            <Link href={VIEW_PATHS.today} className={styles.navActive}><span className={styles.activeNavOrb}><Sparkles size={15}/></span><span>Gua Sha Studio</span></Link>
            <Link href="/routines"><span><Settings size={15}/></span><span>Routines</span></Link>
            <Link href="/beauty/skincare?view=device-library"><span><Wrench size={15}/></span><span>Tools</span></Link>
            <Link href="/notes"><span><NotebookPen size={15}/></span><span>Journal</span></Link>
            <Link href="/beauty/skincare?view=product-library"><span><Library size={15}/></span><span>Library</span></Link>
            <Link href="/beauty/skincare?view=skin-timeline"><span><BookOpen size={15}/></span><span>Progress</span></Link>
            <Link href="/settings"><span><Settings size={15}/></span><span>Settings</span></Link>
          </nav>
          <div className={styles.navBottom}>
            <div className={styles.profileCard}><div className={styles.avatar}>{firstName.slice(0,1).toUpperCase()}</div><span>{greeting},</span><strong>{firstName}</strong><div><small>{view === 'night' ? 'Tonight' : 'Today'}</small><b>{sessionLabel}</b></div><div><small>Mode</small><b>{profileMode}</b></div></div>
            <button type="button" className={styles.shaktiCard} onClick={()=>openGlow(`Help me with ${sessionLabel} in Gua Sha Studio.`)}><GlassOrb/><span><small>Shakti</small><strong>Listening</strong></span></button>
          </div>
        </aside>

        <section className={styles.workArea}>
          <header className={styles.topbar}>
            <div className={styles.titleBlock}><p>{meta.eyebrow}</p><h1>{meta.title}</h1><span>{meta.subtitle}</span></div>
            <button type="button" className={styles.askGlow} onClick={()=>openGlow(`I am in ${meta.title}. Help me decide what to do next using my real Glow context.`)}><Search size={14}/><span>Ask Glow…</span></button><GlassOrb/>
          </header>

          {view === 'today' ? (
            <TodayExperience
              readiness={readiness}
              toggleReadiness={toggleReadiness}
              concerns={concerns}
              toggleConcern={toggleConcern}
              careMode={careMode}
              setCareMode={setCareMode}
              ready={ready}
              slipProducts={slipProducts}
            />
          ) : (
            <SessionExperience
              view={view}
              steps={steps}
              step={step}
              stepIndex={safeStepIndex}
              setStepIndex={setStepIndex}
              mode={mode}
              setMode={setMode}
              guided={guided}
              setGuided={setGuided}
              mirror={mirror}
              setMirror={setMirror}
              voice={voice}
              setVoice={setVoice}
              voiceSpeed={voiceSpeed}
              setVoiceSpeed={setVoiceSpeed}
              duration={duration}
              setDuration={setDuration}
              reps={reps}
              setReps={setReps}
              playing={playing}
              setPlaying={setPlaying}
              remaining={remaining}
              previous={previous}
              next={next}
              restart={restart}
              endSession={endSession}
              ended={ended}
              tools={ownedTools}
              selectedToolIndex={selectedToolIndex}
              setSelectedToolIndex={setSelectedToolIndex}
              slipProducts={slipProducts}
            />
          )}

          <footer className={styles.bottomLine}>
            <div className={styles.tip}><GlassOrb small/><strong>Tip</strong><span>{meta.tip}</span></div>
            <nav className={styles.viewDock} aria-label="Gua Sha experiences">{(['today','guided','morning','midday','night'] as GuaShaStudioView[]).map((item)=><Link key={item} href={VIEW_PATHS[item]} className={item===view ? styles.viewDockActive : ''}>{item === 'today' ? 'Today' : item === 'guided' ? 'Guided' : item === 'morning' ? 'Morning' : item === 'midday' ? 'Midday' : 'Night'}</Link>)}</nav>
            <div className={styles.saveState}><Check size={12}/><span>{ended ? 'Session ended' : 'Live session state'}</span></div>
          </footer>
        </section>
      </section>
    </main>
  );
}

function TodayExperience({ readiness, toggleReadiness, concerns, toggleConcern, careMode, setCareMode, ready, slipProducts }: {
  readiness: Record<ReadinessKey,boolean>;
  toggleReadiness: (key:ReadinessKey)=>void;
  concerns: string[];
  toggleConcern: (name:string)=>void;
  careMode: CareMode;
  setCareMode: (mode:CareMode)=>void;
  ready: boolean;
  slipProducts: string[];
}) {
  const rows: { key:ReadinessKey; title:string; subtitle:string; icon: React.ComponentType<{size?:number;strokeWidth?:number}>; positive:boolean }[] = [
    { key:'skinClean', title:'Skin clean', subtitle:'Free from makeup & SPF', icon:Sparkles, positive:true },
    { key:'handsClean', title:'Hands clean', subtitle:'Washed and dry', icon:Hand, positive:true },
    { key:'slip', title:'Enough slip available', subtitle:slipProducts[0] ? `Linked: ${slipProducts[0]}` : 'Oil or serum ready', icon:Droplet, positive:true },
    { key:'irritated', title:'Skin irritated', subtitle:'Red, inflamed or reactive', icon:Sparkles, positive:false },
    { key:'broken', title:'Broken skin', subtitle:'Cuts, acne or open areas', icon:Bandage, positive:false },
    { key:'procedure', title:'Recent procedure', subtitle:'Facial, injectables, peel, etc.', icon:Plus, positive:false },
    { key:'time', title:'Time available', subtitle:'Do you have a few quiet minutes?', icon:Clock3, positive:true },
  ];
  const concernRows = [
    ['Puffiness', Sparkles], ['Feeling fine', Circle], ['Jaw tension', Heart], ['Skin sensitive today', Leaf], ['Temple tension', Circle], ['Recently used strong skincare', Droplet], ['Scalp tension', Circle], ['Procedure recovery', Plus], ['Neck tightness', Expand], ['Just want relaxation', Leaf],
  ] as const;
  const modes: { id:CareMode; title:string; subtitle:string; icon: React.ComponentType<{size?:number}> }[] = [
    { id:'quick', title:'Quick', subtitle:'5 min', icon:Zap }, { id:'normal', title:'Normal', subtitle:'10–15 min', icon:Circle }, { id:'low', title:'Low Energy', subtitle:'Gentle & short', icon:Moon }, { id:'event', title:'Event', subtitle:'Depuff & glow', icon:Star },
  ];
  const time = careMode === 'quick' ? '~ 5 min' : careMode === 'normal' ? '10–15 min' : careMode === 'low' ? '~ 5–8 min' : '~ 10 min';
  return (
    <div className={styles.todayWorkspace}>
      <aside className={styles.todayReadiness}>
        <section className={`${styles.panel} ${styles.readinessPanel}`}><h2>Today&apos;s Readiness</h2><p>A quick check before you begin</p><div className={styles.readinessRows}>{rows.map(({key,title,subtitle,icon:Icon,positive})=>{
          const checked = readiness[key];
          return <div className={styles.readinessRow} key={key}><span className={`${styles.readinessIcon} ${!positive && checked ? styles.warningIcon : ''}`}><Icon size={18} strokeWidth={1.25}/></span><span><strong>{title}</strong><small>{subtitle}</small></span><Toggle checked={checked} onChange={()=>toggleReadiness(key)} label={title}/></div>;
        })}</div></section>
        <section className={`${styles.panel} ${ready ? styles.readyPanel : styles.notReadyPanel}`}><span className={styles.readyCheck}>{ready ? <Check size={28}/> : <AlertTriangle size={24}/>}</span><div><strong>{ready ? 'You’re ready' : 'Simplify today'}</strong><span>{ready ? 'Everything selected looks good to go.' : 'One or more readiness answers suggest a gentler option.'}</span></div></section>
      </aside>

      <section className={styles.todayStage}>
        <button type="button" className={styles.expandButton} aria-label="Expand face assessment"><Maximize2 size={17}/></button>
        <div className={styles.portraitWrap}><Portrait zone="Cheeks" mirror={false} showRoutes={false}/></div>
        <div className={styles.concernGrid}>{concernRows.map(([label,Icon])=><button key={label} type="button" onClick={()=>toggleConcern(label)} className={concerns.includes(label) ? styles.concernActive : ''}><Icon size={14}/><span>{label}</span></button>)}</div>
        <span className={styles.concernHint}>Select anything that applies · Glow uses this as today&apos;s context.</span>
        <section className={styles.careModeSheet}><h2>Choose your care mode</h2><p>We&apos;ll tailor the session to your energy and needs today.</p><div className={styles.careModes}>{modes.map(({id,title,subtitle,icon:Icon})=><button type="button" key={id} onClick={()=>setCareMode(id)} className={careMode===id ? styles.careModeActive : ''}><Icon size={20}/><strong>{title}</strong><span>{subtitle}</span></button>)}</div><div className={styles.careSummary}><Sparkles size={14}/><span>{concerns.length ? `Context selected: ${concerns.join(' · ')}` : 'Nothing major selected. Keep the front of the routine smooth, gentle, and barrier-aware.'}</span></div></section>
      </section>

      <aside className={styles.todayRight}>
        <section className={`${styles.panel} ${styles.recommendPanel}`}><h2>Recommended today</h2><p>Based on your answers</p><div className={styles.recommendBody}><MiniFace zone={concerns.some((item)=>/jaw|neck/i.test(item)) ? 'Jaw' : 'Cheeks'}/><div><strong>{ready ? '5-minute light massage' : 'Gentle hands-only reset'}</strong><span>{ready ? 'Jaw + cheeks + neck' : 'Relaxation + very light touch'}</span><ul><li><Check size={12}/>Matches the selected time</li><li><Check size={12}/>Keeps pressure light</li><li><Check size={12}/>Can adapt to your chosen concerns</li><li><Check size={12}/>Uses the same guided session engine</li></ul></div></div><Link className={styles.primaryAction} href={ready ? VIEW_PATHS.guided : VIEW_PATHS.midday}><Play size={18}/><span>{ready ? 'Start guided' : 'Start gentle version'}</span><ChevronRight size={17}/></Link></section>
        <section className={`${styles.panel} ${styles.simplifyPanel}`}><h2>Skip or simplify</h2><p>Safety first</p><div className={styles.warningBox}><AlertTriangle size={19}/><span><strong>If skin feels irritated, keep the session simple.</strong><small>Choose a gentle hands-only version or focus on relaxation instead of stronger pressure.</small></span></div><Link href={VIEW_PATHS.midday} className={styles.actionRow}><Hand size={17}/><span>Hands-only gentle version</span><ChevronRight size={15}/></Link></section>
        <section className={`${styles.panel} ${styles.fitPanel}`}><h2>Session fit</h2><p>Your current status</p><div className={styles.fitRow}><Clock3 size={16}/><span>Time available</span><strong>{time}</strong></div><div className={styles.fitRow}><Sparkles size={16}/><span>Intensity</span><strong>Light</strong><PressureDots pressure="Light" count={4}/></div><div className={styles.fitRow}><Heart size={16}/><span>Good match</span><strong>{ready ? 'Yes' : 'Simplify'}</strong></div></section>
      </aside>
    </div>
  );
}

function SessionExperience({ view, steps, step, stepIndex, setStepIndex, mode, setMode, guided, setGuided, mirror, setMirror, voice, setVoice, voiceSpeed, setVoiceSpeed, duration, setDuration, reps, setReps, playing, setPlaying, remaining, previous, next, restart, endSession, ended, tools, selectedToolIndex, setSelectedToolIndex, slipProducts }: {
  view: Exclude<GuaShaStudioView,'today'>;
  steps:GuaShaMovementStep[];
  step:GuaShaMovementStep|null;
  stepIndex:number;
  setStepIndex:(value:number)=>void;
  mode:'tool'|'hands'; setMode:(value:'tool'|'hands')=>void;
  guided:boolean; setGuided:(value:boolean)=>void;
  mirror:boolean; setMirror:(value:boolean)=>void;
  voice:boolean; setVoice:(value:boolean)=>void;
  voiceSpeed:number; setVoiceSpeed:(value:number)=>void;
  duration:number; setDuration:(value:number)=>void;
  reps:number; setReps:(value:number)=>void;
  playing:boolean; setPlaying:(value:boolean)=>void;
  remaining:number;
  previous:()=>void; next:()=>void; restart:()=>void; endSession:()=>void; ended:boolean;
  tools:GuaShaOwnedTool[]; selectedToolIndex:number; setSelectedToolIndex:(value:number)=>void; slipProducts:string[];
}) {
  const zone = step?.zone ?? 'Cheeks';
  const pressure = step?.pressure ?? 'Light';
  const eyesClosed = view === 'midday';
  return (
    <div className={styles.sessionWorkspace}>
      <aside className={styles.sessionLeft}>
        {view === 'guided' ? <GuidedLeft mode={mode} setMode={setMode} guided={guided} setGuided={setGuided} mirror={mirror} setMirror={setMirror} voice={voice} setVoice={setVoice} voiceSpeed={voiceSpeed} setVoiceSpeed={setVoiceSpeed} duration={duration} setDuration={setDuration} reps={reps} setReps={setReps}/> : null}
        {view === 'morning' ? <MorningLeft mode={mode} setMode={setMode} mirror={mirror} setMirror={setMirror} voice={voice} setVoice={setVoice} duration={duration} setDuration={setDuration} reps={reps} setReps={setReps}/> : null}
        {view === 'midday' ? <MiddayLeft mode={mode} setMode={setMode} steps={steps} stepIndex={stepIndex} setStepIndex={setStepIndex}/> : null}
        {view === 'night' ? <NightLeft steps={steps} stepIndex={stepIndex} setStepIndex={setStepIndex} duration={duration} setDuration={setDuration} mirror={mirror} setMirror={setMirror} voice={voice} setVoice={setVoice} pressure={pressure}/> : null}
      </aside>

      <section className={`${styles.sessionStage} ${view === 'night' ? styles.sessionStageNight : ''}`}>
        <div className={styles.stepBadge}><span>Step</span><strong>{step ? `${stepIndex + 1} of ${steps.length}` : '— of —'}</strong></div>
        <button type="button" className={styles.expandButton} aria-label="Expand facial guide"><Maximize2 size={17}/></button>
        <div className={styles.portraitWrap}><Portrait zone={zone} mirror={mirror} showRoutes activeGlow={view==='night'} eyesClosed={eyesClosed}/></div>
        {view === 'midday' ? <div className={styles.floatingCue}><strong>{step?.name ?? 'Jaw release'}</strong><span>{step?.subtitle ?? 'Move slowly and gently.'}</span></div> : null}

        {view === 'midday' ? (
          <div className={styles.miniTimer}><button type="button" onClick={previous}><ChevronLeft size={20}/></button><div className={styles.timerRing} style={{'--progress': `${step ? Math.max(0, Math.min(100, ((step.seconds-remaining)/step.seconds)*100)) : 0}%`} as React.CSSProperties}><strong>{formatClock(remaining)}</strong><span>{step?.name ?? 'Reset'}</span></div><button type="button" onClick={next}><ChevronRight size={20}/></button></div>
        ) : (
          <div className={styles.movementCard}><div className={styles.movementIdentity}><span className={styles.movementIcon}><Sparkles size={15}/></span><div><strong>{step?.name ?? 'No saved step'}</strong><span>{step?.subtitle ?? 'Glow will not invent a saved direction.'}</span></div></div>{view === 'morning' ? <div className={styles.movementFacts}><span><b>Start point</b>{step?.startPoint}</span><span><b>End point</b>{step?.endPoint}</span><span><b>Pressure</b>{pressure}</span><span><b>Repetitions</b>{reps} each side</span><span><b>Tool edge</b>{step?.toolEdge}</span></div> : <><div className={styles.pressureSummary}><span>{view==='night'?'Use light pressure':'Pressure'}</span><strong>{pressure}</strong><PressureDots pressure={pressure}/></div>{mode==='tool'?<ToolShape/>:<Hand size={31} strokeWidth={1.15}/>}</>}</div>
        )}

        {view === 'midday' ? <div className={styles.miniTransport}><button type="button" onClick={restart}><RotateCcw size={20}/><span>Restart</span></button><button type="button" className={styles.pauseAction} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={24}/>:<Play size={24}/>}<span>{playing?'Pause':'Start'}</span></button><button type="button" onClick={endSession}><X size={20}/><span>End</span></button></div> : <div className={styles.transport}><button type="button" onClick={previous} disabled={stepIndex===0}><ChevronLeft size={24}/></button><button type="button" className={styles.pauseAction} onClick={()=>setPlaying(!playing)}>{playing?<Pause size={24}/>:<Play size={24}/>}</button><button type="button" onClick={next} disabled={stepIndex===steps.length-1}><ChevronRight size={24}/></button></div>}
        {ended ? <div className={styles.endedReceipt}><Check size={13}/>Session ended. Glow received the action event for history handling.</div> : null}
      </section>

      <aside className={styles.sessionRight}>
        {view === 'guided' ? <GuidedRight zone={zone} pressure={pressure} slipProducts={slipProducts} tools={tools} selectedToolIndex={selectedToolIndex} setSelectedToolIndex={setSelectedToolIndex} step={step}/> : null}
        {view === 'morning' ? <MorningRight steps={steps} stepIndex={stepIndex} setStepIndex={setStepIndex} zone={zone} slipProducts={slipProducts} tools={tools} selectedToolIndex={selectedToolIndex} setSelectedToolIndex={setSelectedToolIndex}/> : null}
        {view === 'midday' ? <MiddayRight slipProducts={slipProducts} tools={tools} selectedToolIndex={selectedToolIndex} setSelectedToolIndex={setSelectedToolIndex}/> : null}
        {view === 'night' ? <NightRight slipProducts={slipProducts} tools={tools} selectedToolIndex={selectedToolIndex} setSelectedToolIndex={setSelectedToolIndex}/> : null}
      </aside>
    </div>
  );
}

function ModePanel({ mode, setMode, labels = ['Tool mode','Hands only'] }: { mode:'tool'|'hands'; setMode:(value:'tool'|'hands')=>void; labels?:[string,string] }) {
  return <section className={styles.panel}><h2>Mode</h2><div className={styles.modeGrid}><button type="button" className={mode==='tool'?styles.modeActive:''} onClick={()=>setMode('tool')}><ToolShape/><span>{labels[0]}</span></button><button type="button" className={mode==='hands'?styles.modeActive:''} onClick={()=>setMode('hands')}><Hand size={29} strokeWidth={1.2}/><span>{labels[1]}</span></button></div></section>;
}

function DurationPanel({ duration, setDuration, min=5, max=20 }: { duration:number; setDuration:(value:number)=>void; min?:number; max?:number }) {
  return <section className={styles.panel}><h2>Routine length</h2><div className={styles.durationValue}><Clock3 size={25} strokeWidth={1.2}/><strong>{duration}</strong><span>min⌄</span></div><input type="range" min={min} max={max} value={duration} onChange={(event)=>setDuration(Number(event.target.value))}/><div className={styles.rangeLabels}><span>{min}</span><span>{Math.round((min+max)/2)}</span><span>{max}+</span></div></section>;
}

function GuidedLeft({mode,setMode,guided,setGuided,mirror,setMirror,voice,setVoice,voiceSpeed,setVoiceSpeed,duration,setDuration,reps,setReps}:{mode:'tool'|'hands';setMode:(v:'tool'|'hands')=>void;guided:boolean;setGuided:(v:boolean)=>void;mirror:boolean;setMirror:(v:boolean)=>void;voice:boolean;setVoice:(v:boolean)=>void;voiceSpeed:number;setVoiceSpeed:(v:number)=>void;duration:number;setDuration:(v:number)=>void;reps:number;setReps:(v:number)=>void}) {
  return <><ModePanel mode={mode} setMode={setMode}/><DurationPanel duration={duration} setDuration={setDuration}/><section className={styles.panel}><h2>Follow along</h2><div className={styles.segmented}><button className={guided?styles.segmentActive:''} onClick={()=>setGuided(true)}>Guided</button><button className={!guided?styles.segmentActive:''} onClick={()=>setGuided(false)}>Freestyle</button></div><div className={styles.settingLine}><span>Voice over</span><Toggle checked={voice} onChange={()=>setVoice(!voice)} label="Voice over"/></div><div className={styles.speedLine}><span>Voice speed</span><b>{voiceSpeed.toFixed(1)}x</b></div><input type="range" min=".75" max="1.5" step=".25" value={voiceSpeed} onChange={(event)=>setVoiceSpeed(Number(event.target.value))}/></section><section className={styles.panel}><div className={styles.settingLine}><span><b>Mirror mode</b><small>Mirror directions left ↔ right</small></span><Toggle checked={mirror} onChange={()=>setMirror(!mirror)} label="Mirror mode"/></div><div className={styles.mirrorPreview}><MiniFace zone="Cheeks"/><span>↔</span><MiniFace zone="Cheeks"/></div></section><section className={styles.panel}><h2>Repetitions</h2><div className={styles.repRow}><Repeat2 size={22}/><strong>{reps}</strong><span>reps</span><div><button onClick={()=>setReps(Math.max(1,reps-1))}>−</button><button onClick={()=>setReps(Math.min(20,reps+1))}>＋</button></div></div></section></>;
}

function MorningLeft({mode,setMode,mirror,setMirror,voice,setVoice,duration,setDuration,reps,setReps}:{mode:'tool'|'hands';setMode:(v:'tool'|'hands')=>void;mirror:boolean;setMirror:(v:boolean)=>void;voice:boolean;setVoice:(v:boolean)=>void;duration:number;setDuration:(v:number)=>void;reps:number;setReps:(v:number)=>void}) {
  return <><DurationPanel duration={duration} setDuration={setDuration}/><ModePanel mode={mode} setMode={setMode} labels={['Guided','Freestyle']}/><section className={styles.panel}><div className={styles.settingLine}><span><b>Voice guidance</b><small>Gentle & clear</small></span><Toggle checked={voice} onChange={()=>setVoice(!voice)} label="Voice guidance"/></div></section><section className={styles.panel}><div className={styles.settingLine}><span><b>Mirror mode</b><small>Mirror directions left ↔ right</small></span><Toggle checked={mirror} onChange={()=>setMirror(!mirror)} label="Mirror mode"/></div><div className={styles.mirrorPreview}><MiniFace zone="Cheeks"/><span>↔</span><MiniFace zone="Cheeks"/></div></section><section className={styles.panel}><h2>Repetitions <small>(per side)</small></h2><div className={styles.repRow}><Repeat2 size={22}/><strong>{reps}</strong><span>reps</span><div><button onClick={()=>setReps(Math.max(1,reps-1))}>−</button><button onClick={()=>setReps(Math.min(20,reps+1))}>＋</button></div></div></section><section className={`${styles.panel} ${styles.brighterCard}`}><Sun size={24}/><div><strong>A brighter you</strong><span>A quick daily ritual to release tension and move through the morning with care.</span></div><Leaf size={40}/></section></>;
}

function MiddayLeft({mode,setMode,steps,stepIndex,setStepIndex}:{mode:'tool'|'hands';setMode:(v:'tool'|'hands')=>void;steps:GuaShaMovementStep[];stepIndex:number;setStepIndex:(v:number)=>void}) {
  return <><section className={styles.panel}><h2>Quick settings</h2><div className={styles.quickLength}><Clock3 size={24}/><span><small>Routine length</small><strong>2–3 <b>min⌄</b></strong></span></div><div className={styles.segmented}><button className={styles.segmentActive}>Guided</button><button>Off</button></div><div className={styles.settingLine}><span><b>Use hands instead</b><small>Same movements, no tool needed.</small></span><Toggle checked={mode==='hands'} onChange={()=>setMode(mode==='hands'?'tool':'hands')} label="Use hands instead"/></div></section><section className={`${styles.panel} ${styles.resetPath}`}><h2>The reset path</h2>{steps.map((item,index)=><button type="button" key={item.id} className={index===stepIndex?styles.pathActive:''} onClick={()=>setStepIndex(index)}><span className={styles.pathThumb}><MiniFace zone={item.zone}/></span><i>{index+1}</i><span><strong>{item.name}</strong><small>{item.subtitle}</small><b>{item.seconds} sec</b></span></button>)}</section></>;
}

function NightLeft({steps,stepIndex,setStepIndex,duration,setDuration,mirror,setMirror,voice,setVoice,pressure}:{steps:GuaShaMovementStep[];stepIndex:number;setStepIndex:(v:number)=>void;duration:number;setDuration:(v:number)=>void;mirror:boolean;setMirror:(v:boolean)=>void;voice:boolean;setVoice:(v:boolean)=>void;pressure:GuaShaPressure}) {
  return <><section className={`${styles.panel} ${styles.nightTimeline}`}><h2>Evening session</h2><p>A longer, restorative routine</p>{steps.map((item,index)=><button key={item.id} onClick={()=>setStepIndex(index)} className={index===stepIndex?styles.timelineActive:''}><i/><span><strong>{item.name}</strong><small>{item.subtitle}</small></span></button>)}</section><section className={styles.panel}><h2>Session settings</h2><div className={styles.settingRow}><Clock3 size={17}/><span>Duration</span><strong>{duration} min</strong><ChevronDown size={14}/></div><div className={styles.settingRow}><Leaf size={17}/><span>Pressure</span><strong>{pressure}</strong><PressureDots pressure={pressure}/></div><div className={styles.settingRow}><Sparkles size={17}/><span>Voice guidance</span><strong>{voice?'On':'Off'}</strong><Toggle checked={voice} onChange={()=>setVoice(!voice)} label="Voice guidance"/></div><div className={styles.settingRow}><HeadphonesIcon/><span>Mirror mode</span><strong>{mirror?'On':'Off'}</strong><Toggle checked={mirror} onChange={()=>setMirror(!mirror)} label="Mirror mode"/></div><div className={styles.settingRow}><Expand size={17}/><span>Breath cue</span><strong>On</strong><Toggle checked onChange={()=>{}} label="Breath cue"/></div></section></>;
}

function HeadphonesIcon(){return <span className={styles.headphonesIcon} aria-hidden="true">◡</span>}

function GuidedRight({zone,pressure,slipProducts,tools,selectedToolIndex,setSelectedToolIndex,step}:{zone:GuaShaZone;pressure:GuaShaPressure;slipProducts:string[];tools:GuaShaOwnedTool[];selectedToolIndex:number;setSelectedToolIndex:(v:number)=>void;step:GuaShaMovementStep|null}) {
  return <><section className={`${styles.panel} ${styles.activeZonePanel}`}><h2>Active zone</h2><MiniFace zone={zone}/></section><section className={styles.panel}><h2>Pressure guide</h2><div className={styles.pressureLabels}><span>Light</span><span>Medium</span><span>Firm</span></div><PressureDots pressure={pressure} count={9}/></section><section className={styles.panel}><h2>Tools & slip</h2><p>Recommended from known context</p><ToolSlip products={slipProducts} tools={tools} selectedToolIndex={selectedToolIndex} setSelectedToolIndex={setSelectedToolIndex}/><Link href="/beauty/skincare?view=product-library" className={styles.actionRow}><Droplet size={16}/><span>Apply / review slip</span></Link><Link href="/beauty/skincare?view=product-library" className={styles.actionRow}><Plus size={16}/><span>Add your own</span></Link></section><section className={`${styles.panel} ${styles.focusPanel}`}><div><h2>Today&apos;s focus</h2><strong>{step?.name ?? 'Current movement'}</strong><span>{zone} · {step?.source==='saved'?'Saved routine':'Glow guidance'}</span></div><Blossom/></section></>;
}

function MorningRight({steps,stepIndex,setStepIndex,zone,slipProducts,tools,selectedToolIndex,setSelectedToolIndex}:{steps:GuaShaMovementStep[];stepIndex:number;setStepIndex:(v:number)=>void;zone:GuaShaZone;slipProducts:string[];tools:GuaShaOwnedTool[];selectedToolIndex:number;setSelectedToolIndex:(v:number)=>void}) {
  return <><section className={`${styles.panel} ${styles.morningSequence}`}><h2>Your morning sequence</h2>{steps.map((item,index)=><button key={item.id} className={index===stepIndex?styles.sequenceActive:''} onClick={()=>setStepIndex(index)}><i>{index+1}</i><span><strong>{item.name}</strong><small>{item.subtitle}</small></span><em>~ {Math.max(1,Math.round(item.seconds/60))} min</em></button>)}</section><section className={`${styles.panel} ${styles.morningFit}`}><h2>Today&apos;s morning fit</h2><p>Active zone: {zone}</p><div><MiniFace zone={zone}/><ul><li><Check size={12}/>Keeps pressure gentle</li><li><Check size={12}/>Supports a calm facial routine</li><li><Check size={12}/>Uses your selected step order</li><li><Check size={12}/>Can be mirrored</li></ul></div></section><section className={styles.panel}><h2>Slip check</h2><ToolSlip products={slipProducts} tools={tools} selectedToolIndex={selectedToolIndex} setSelectedToolIndex={setSelectedToolIndex} compact/><div className={styles.goodSlip}><Check size={16}/><span><strong>{slipProducts[0]?'Slip linked':'Slip not verified'}</strong><small>{slipProducts[0]?'A saved product is connected to this routine.':'Choose a known compatible product before relying on a product-specific claim.'}</small></span></div></section><section className={`${styles.panel} ${styles.bestFor}`}><Leaf size={24}/><span><strong>Best for:</strong><small>A gentle morning reset, facial tension, and a slower start.</small></span><Blossom/></section></>;
}

function MiddayRight({slipProducts,tools,selectedToolIndex,setSelectedToolIndex}:{slipProducts:string[];tools:GuaShaOwnedTool[];selectedToolIndex:number;setSelectedToolIndex:(v:number)=>void}) {
  return <><section className={`${styles.panel} ${styles.deskReset}`}><Sun size={29}/><h2>Desk break reset</h2><span/><p>A quick release to feel lighter, clearer, and more you.</p></section><section className={styles.panel}><h2>Best when</h2><div className={styles.triggerChips}><span><Zap size={15}/>Midday tension</span><span><Expand size={15}/>Screen fatigue</span><span><Heart size={15}/>Jaw tightness</span><span><Leaf size={15}/>Quick refresh</span></div></section><section className={styles.panel}><h2>Helpful cues</h2><div className={styles.cueRow}><MiniFace zone="Jaw"/><span><strong>Unclench your jaw</strong><small>Let your teeth slightly part.</small></span></div><div className={styles.cueRow}><Expand size={25}/><span><strong>Shoulders back</strong><small>Soften and drop.</small></span></div><div className={styles.cueRow}><Heart size={24}/><span><strong>Take four slow breaths</strong><small>In through the nose, out longer.</small></span></div></section><section className={styles.panel}><h2>Tools & slip</h2><ToolSlip products={slipProducts} tools={tools} selectedToolIndex={selectedToolIndex} setSelectedToolIndex={setSelectedToolIndex} compact/></section></>;
}

function NightRight({slipProducts,tools,selectedToolIndex,setSelectedToolIndex}:{slipProducts:string[];tools:GuaShaOwnedTool[];selectedToolIndex:number;setSelectedToolIndex:(v:number)=>void}) {
  const [calm,setCalm]=useState(true); const [broken,setBroken]=useState(true); const [compatible,setCompatible]=useState(true);
  return <><section className={styles.panel}><h2>Tonight&apos;s slip</h2><p>Nourish. Protect. Glide.</p><ToolSlip products={slipProducts} tools={tools} selectedToolIndex={selectedToolIndex} setSelectedToolIndex={setSelectedToolIndex}/><div className={styles.benefitRow}><Leaf size={18}/><span><strong>Great for tonight</strong><small>{slipProducts[0]?'Uses a product already linked to your routine.':'No product-specific benefit is claimed without linked data.'}</small></span></div><div className={styles.benefitRow}><Droplet size={18}/><span><strong>Enough glide</strong><small>Reapply if the tool begins to drag.</small></span></div><div className={styles.benefitRow}><Sparkles size={18}/><span><strong>Works with your skincare</strong><small>Confirm compatibility when active ingredients or procedures are involved.</small></span></div><Link href="/beauty/skincare?view=product-library" className={styles.reapply}><Droplet size={18}/>Reapply / review slip<Plus size={18}/></Link></section><section className={styles.panel}><h2>Evening safety</h2><p>Check in before you begin</p><div className={styles.safetyRow}><Leaf size={18}/><span><strong>Skin feels calm</strong><small>Not irritated or reactive</small></span><Toggle checked={calm} onChange={()=>setCalm(!calm)} label="Skin feels calm"/></div><div className={styles.safetyRow}><Heart size={18}/><span><strong>No broken skin</strong><small>Cuts, acne or open areas</small></span><Toggle checked={broken} onChange={()=>setBroken(!broken)} label="No broken skin"/></div><div className={styles.safetyRow}><Sparkles size={18}/><span><strong>Compatible with tonight&apos;s skincare</strong><small>Confirm when active ingredients are involved</small></span><Toggle checked={compatible} onChange={()=>setCompatible(!compatible)} label="Compatible with tonight skincare"/></div></section><section className={`${styles.panel} ${styles.calmCard}`}><Moon size={34}/><span><strong>A calmer you</strong><small>Release the day.<br/>Sculpt with care.<br/>Rest in your glow.</small></span><Blossom/></section></>;
}
