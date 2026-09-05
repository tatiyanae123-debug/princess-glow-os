'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  Hand,
  Library,
  Maximize2,
  NotebookPen,
  Pause,
  Play,
  Repeat2,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Wrench,
} from 'lucide-react';
import styles from './facial-massage-studio.module.css';

type RoutineStep = {
  id: string;
  name: string;
  notes: string | null;
  products: string[];
  stepOrder: number;
};

type ToolRecord = {
  name: string;
  status: 'confirmed' | 'backup' | 'needs-confirmation' | 'needs-identification';
  quantity: number;
  notes: string | null;
};

type FacialMassageStudioProps = {
  savedRoutineSteps: RoutineStep[];
  ownedTools: ToolRecord[];
  userName?: string | null;
};

const ZONES = ['Jaw', 'Cheeks', 'Eyes', 'Forehead', 'Neck'] as const;
type Zone = (typeof ZONES)[number];

const STATUS_LABEL: Record<ToolRecord['status'], string> = {
  confirmed: 'Confirmed',
  backup: 'Duplicate / backup',
  'needs-confirmation': 'Needs confirmation',
  'needs-identification': 'Needs identification',
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function GlassOrb({ small = false }: { small?: boolean }) {
  return <span className={small ? styles.orbSmall : styles.orb} aria-hidden="true" />;
}

function MiniFace({ zone }: { zone: Zone }) {
  const zoneY = { Jaw: 89, Cheeks: 70, Eyes: 53, Forehead: 34, Neck: 112 }[zone];
  const zoneRx = zone === 'Neck' ? 14 : zone === 'Jaw' ? 30 : 26;
  const zoneRy = zone === 'Neck' ? 14 : 10;
  return (
    <svg viewBox="0 0 120 145" className={styles.miniFace} aria-hidden="true">
      <path d="M60 13c-24 0-39 20-39 46 0 36 17 54 39 54s39-18 39-54C99 33 84 13 60 13Z" fill="none" stroke="currentColor" strokeWidth="1.2" opacity=".54" />
      <path d="M39 53c7-5 13-5 20 0M61 53c7-5 13-5 20 0M60 55v22m-7 7c5 4 9 4 14 0M43 94c10 7 24 7 34 0" fill="none" stroke="currentColor" strokeWidth="1" opacity=".45" strokeLinecap="round" />
      <path d="M45 114c-1 11-6 17-12 22m42-22c1 11 6 17 12 22" fill="none" stroke="currentColor" strokeWidth="1.1" opacity=".35" />
      <ellipse cx="60" cy={zoneY} rx={zoneRx} ry={zoneRy} className={styles.miniZone} />
    </svg>
  );
}

function MirrorPreview() {
  return (
    <div className={styles.mirrorPreview} aria-hidden="true">
      <MiniFace zone="Cheeks" />
      <span>↔</span>
      <MiniFace zone="Cheeks" />
    </div>
  );
}

function FaceMap({ mirror }: { mirror: boolean }) {
  return (
    <svg
      viewBox="0 0 620 760"
      className={`${styles.faceMap} ${mirror ? styles.mirrored : ''}`}
      role="img"
      aria-label="Black woman with warm brown skin and natural dark wavy hair with facial movement paths"
    >
      <defs>
        <linearGradient id="skinWarm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c99578" />
          <stop offset=".34" stopColor="#a96f56" />
          <stop offset=".7" stopColor="#8f5948" />
          <stop offset="1" stopColor="#764638" />
        </linearGradient>
        <radialGradient id="skinLight" cx="42%" cy="30%" r="65%">
          <stop offset="0" stopColor="#fff3e9" stopOpacity=".62" />
          <stop offset=".38" stopColor="#efc2a5" stopOpacity=".22" />
          <stop offset="1" stopColor="#4e281f" stopOpacity=".12" />
        </radialGradient>
        <linearGradient id="hairWave" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#342525" />
          <stop offset=".45" stopColor="#201718" />
          <stop offset="1" stopColor="#493236" />
        </linearGradient>
        <linearGradient id="lip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bf7f78" />
          <stop offset="1" stopColor="#8d5659" />
        </linearGradient>
        <radialGradient id="portraitGlow" cx="50%" cy="37%" r="62%">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".98" />
          <stop offset=".62" stopColor="#f7f1ea" stopOpacity=".7" />
          <stop offset="1" stopColor="#f0ece8" stopOpacity=".08" />
        </radialGradient>
        <filter id="portraitSoft"><feGaussianBlur stdDeviation="1.1" /></filter>
        <marker id="massageArrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6.5,3 z" fill="rgba(255,255,255,.96)" />
        </marker>
      </defs>

      <ellipse cx="310" cy="366" rx="280" ry="342" fill="url(#portraitGlow)" />

      <g aria-hidden="true" fill="url(#hairWave)">
        <ellipse cx="310" cy="216" rx="174" ry="176" />
        <ellipse cx="181" cy="275" rx="54" ry="145" />
        <ellipse cx="440" cy="275" rx="54" ry="145" />
      </g>

      <g aria-hidden="true" fill="none" stroke="#4c3638" strokeWidth="14" strokeLinecap="round" opacity=".82">
        <path d="M158 167 C131 202 148 243 132 280 C116 317 144 350 130 392 C116 433 153 454 140 502" />
        <path d="M188 111 C157 146 178 181 160 211 C145 238 160 272 148 302" />
        <path d="M229 91 C196 125 220 159 200 190 C186 212 197 242 180 270" />
        <path d="M277 83 C245 116 269 148 246 178 C226 205 242 231 224 257" />
        <path d="M326 81 C296 112 319 147 295 174 C278 194 292 222 276 244" />
        <path d="M372 89 C345 117 363 150 344 177 C328 200 340 226 329 248" />
        <path d="M416 111 C391 139 405 170 390 196 C377 219 389 243 379 267" />
        <path d="M457 161 C430 190 445 224 430 251 C416 278 431 310 420 339" />
        <path d="M465 249 C493 288 472 326 487 359 C501 391 468 425 482 472 C493 506 467 525 470 554" />
      </g>
      <g aria-hidden="true" fill="none" stroke="#7d5b5d" strokeWidth="4" strokeLinecap="round" opacity=".36">
        <path d="M169 151 C202 111 241 102 279 120" />
        <path d="M238 112 C276 83 319 89 345 119" />
        <path d="M330 113 C366 89 406 101 433 135" />
        <path d="M143 269 C164 232 170 198 158 174" />
        <path d="M474 269 C453 232 447 198 460 174" />
      </g>

      <path d="M230 550 C230 599 216 635 198 667 L422 667 C404 635 390 599 390 550 Z" fill="url(#skinWarm)" />
      <path d="M73 760 C100 677 177 641 239 628 C278 619 342 619 381 628 C443 641 520 677 547 760 Z" fill="url(#skinWarm)" />
      <ellipse cx="310" cy="350" rx="148" ry="224" fill="url(#skinWarm)" />
      <ellipse cx="310" cy="350" rx="148" ry="224" fill="url(#skinLight)" />
      <ellipse cx="166" cy="361" rx="24" ry="44" fill="#945e4b" />
      <ellipse cx="454" cy="361" rx="24" ry="44" fill="#945e4b" />

      <g aria-hidden="true" fill="none" strokeLinecap="round">
        <path d="M219 278 C244 259 272 258 294 274" stroke="#382729" strokeWidth="8" />
        <path d="M326 274 C349 258 377 259 401 278" stroke="#382729" strokeWidth="8" />
        <path d="M221 317 C245 328 269 328 290 315" stroke="#382b2b" strokeWidth="3.8" />
        <path d="M330 315 C351 328 375 328 399 317" stroke="#382b2b" strokeWidth="3.8" />
        <path d="M234 314 C250 307 270 307 286 313" stroke="#2e2223" strokeWidth="1.2" opacity=".42" />
        <path d="M334 313 C350 307 370 307 386 314" stroke="#2e2223" strokeWidth="1.2" opacity=".42" />
        <path d="M309 323 C301 371 298 404 316 421" stroke="#5e3d33" strokeWidth="3.2" opacity=".48" />
        <path d="M292 433 C303 441 318 441 329 433" stroke="#5e3d33" strokeWidth="2" opacity=".35" />
      </g>

      <g aria-hidden="true">
        <path d="M263 477 C286 458 334 458 357 477 C339 497 282 498 263 477 Z" fill="url(#lip)" />
        <path d="M275 477 C294 469 325 469 345 477" fill="none" stroke="#e3aaa2" strokeWidth="2.2" opacity=".65" />
        <ellipse cx="246" cy="392" rx="30" ry="18" fill="#edb69d" opacity=".13" filter="url(#portraitSoft)" />
        <ellipse cx="374" cy="392" rx="30" ry="18" fill="#edb69d" opacity=".13" filter="url(#portraitSoft)" />
      </g>

      <g className={styles.routeLines} fill="none" strokeLinecap="round" markerEnd="url(#massageArrow)" aria-hidden="true">
        <path d="M211 438 C181 426 156 401 143 371" />
        <path d="M409 438 C439 426 464 401 477 371" />
        <path d="M218 402 C182 391 160 370 146 346" />
        <path d="M402 402 C438 391 460 370 474 346" />
        <path d="M228 361 C192 351 169 332 153 309" />
        <path d="M392 361 C428 351 451 332 467 309" />
        <path d="M238 321 C204 312 188 295 177 273" />
        <path d="M382 321 C416 312 432 295 443 273" />
        <path d="M247 287 C220 274 204 257 197 237" />
        <path d="M373 287 C400 274 416 257 423 237" />
        <path d="M246 251 C239 216 242 185 249 159" />
        <path d="M283 246 C278 211 281 179 286 151" />
        <path d="M310 243 C310 207 310 176 310 146" />
        <path d="M337 246 C342 211 339 179 334 151" />
        <path d="M374 251 C381 216 378 185 371 159" />
        <path d="M269 507 C236 523 211 533 181 539" />
        <path d="M351 507 C384 523 409 533 439 539" />
        <path d="M283 554 C269 575 252 591 231 601" />
        <path d="M337 554 C351 575 368 591 389 601" />
        <path d="M275 600 C268 625 267 651 269 678" />
        <path d="M345 600 C352 625 353 651 351 678" />
      </g>
    </svg>
  );
}

export function FacialMassageStudio({ savedRoutineSteps, ownedTools, userName }: FacialMassageStudioProps) {
  const hasGuidedRoutine = savedRoutineSteps.length > 0;
  const [mode, setMode] = useState<'tool' | 'hands'>('tool');
  const [guided, setGuided] = useState(hasGuidedRoutine);
  const [duration, setDuration] = useState(10);
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [playing, setPlaying] = useState(false);
  const [mirror, setMirror] = useState(true);
  const [reps, setReps] = useState(6);
  const [voiceOver, setVoiceOver] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [stepIndex, setStepIndex] = useState(0);
  const [zone, setZone] = useState<Zone>('Cheeks');
  const [selectedToolIndex, setSelectedToolIndex] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          setPlaying(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const activeStep = guided && hasGuidedRoutine ? savedRoutineSteps[stepIndex] : null;
  const selectedTool = mode === 'tool' ? ownedTools[selectedToolIndex] ?? null : null;
  const firstName = userName?.trim().split(/\s+/)[0] || 'You';
  const linkedSlip = activeStep?.products?.[0] ?? null;

  const pressure = useMemo(() => {
    const note = activeStep?.notes?.toLowerCase() ?? '';
    if (/firm/.test(note)) return 2;
    if (/medium|moderate/.test(note)) return 1;
    if (/very light|gentle|light/.test(note)) return 0;
    return null;
  }, [activeStep]);

  function changeDuration(value: number) {
    setDuration(value);
    setRemainingSeconds(value * 60);
    setPlaying(false);
  }

  function previousStep() {
    if (!guided || !hasGuidedRoutine) return;
    setStepIndex((current) => Math.max(0, current - 1));
  }

  function nextStep() {
    if (!guided || !hasGuidedRoutine) return;
    setStepIndex((current) => Math.min(savedRoutineSteps.length - 1, current + 1));
  }

  const nav = [
    { label: 'Gua Sha Studio', href: '/beauty/facial-massage', icon: Sparkles, active: true },
    { label: 'Routines', href: '/routines', icon: Settings },
    { label: 'Tools', href: '/beauty/skincare?view=device-library', icon: Wrench },
    { label: 'Journal', href: '/notes', icon: NotebookPen },
    { label: 'Library', href: '/beauty/skincare?view=product-library', icon: Library },
    { label: 'Progress', href: '/beauty/skincare?view=skin-timeline', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: SlidersHorizontal },
  ];

  return (
    <main className={styles.pageRoot}>
      <section className={styles.studio} data-room-local-identity="gua-sha-studio">
        <aside className={styles.localNav} aria-label="Gua Sha Studio navigation">
          <div className={styles.brandBlock}>
            <Link href="/" className={styles.brand}>Glow OS⌄</Link>
            <span>Batch 1</span>
            <span>Subpages Round 2</span>
          </div>

          <nav className={styles.navList}>
            {nav.map(({ label, href, icon: Icon, active }) => (
              <Link key={label} href={href} className={`${styles.navItem} ${active ? styles.navActive : ''}`}>
                {active ? <GlassOrb small /> : <span className={styles.navIcon}><Icon size={15} /></span>}
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className={styles.navBottom}>
            <div className={styles.userCard}>
              <div className={styles.initial}>{firstName.slice(0, 1).toUpperCase()}</div>
              <span>Good morning,</span>
              <strong>{firstName}</strong>
              <div className={styles.userStat}><span>Today</span><b>{hasGuidedRoutine ? 'Routine ready' : 'No guided routine'}</b></div>
              <div className={styles.userStat}><span>Energy</span><b>Not logged</b></div>
            </div>
            <div className={styles.shaktiCard}><GlassOrb /><div><span>Shakti</span><strong>Listening</strong></div></div>
          </div>
        </aside>

        <section className={styles.workArea}>
          <header className={styles.topbar}>
            <div className={styles.titleBlock}>
              <p>GUA SHA STUDIO</p>
              <h1>Guided Facial Movement</h1>
              <span>Sculpt · Release · Renew</span>
            </div>
            <Link href="/ask-glow" className={styles.askGlow}><Search size={14} /><span>Ask Glow…</span></Link>
            <GlassOrb />
          </header>

          <div className={styles.workspace}>
            <aside className={styles.leftControls} aria-label="Facial massage session controls">
              <section className={styles.panel}>
                <div className={styles.panelTitle}>Mode</div>
                <div className={styles.modeGrid}>
                  <button type="button" onClick={() => setMode('tool')} className={mode === 'tool' ? styles.modeActive : ''}>
                    <span className={styles.guaShape} />
                    <span>Tool mode</span>
                  </button>
                  <button type="button" onClick={() => setMode('hands')} className={mode === 'hands' ? styles.modeActive : ''}>
                    <Hand size={26} strokeWidth={1.35} />
                    <span>Hands only</span>
                  </button>
                </div>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelTitle}>Routine length</div>
                <div className={styles.durationRow}><Clock3 size={24} strokeWidth={1.2} /><strong>{duration}</strong><span>min⌄</span></div>
                <input className={styles.range} type="range" min="5" max="20" step="5" value={duration} onChange={(event) => changeDuration(Number(event.target.value))} aria-label="Routine length in minutes" />
                <div className={styles.rangeLabels}><span>5</span><span>10</span><span>20+</span></div>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelTitle}>Follow along</div>
                <div className={styles.segmented}>
                  <button type="button" disabled={!hasGuidedRoutine} onClick={() => hasGuidedRoutine && setGuided(true)} className={guided && hasGuidedRoutine ? styles.activeSegment : ''}>Guided</button>
                  <button type="button" onClick={() => setGuided(false)} className={!guided ? styles.activeSegment : ''}>Freestyle</button>
                </div>
                <div className={styles.voiceRow}><span>Voice over</span><button type="button" role="switch" aria-checked={voiceOver} className={`${styles.switch} ${voiceOver ? styles.switchOn : ''}`} onClick={() => setVoiceOver((value) => !value)}><span /></button></div>
                <div className={styles.voiceSpeed}><div><span>Voice speed</span><b>{voiceSpeed.toFixed(1)}x</b></div><input type="range" min=".75" max="1.5" step=".25" value={voiceSpeed} onChange={(event) => setVoiceSpeed(Number(event.target.value))} /></div>
              </section>

              <section className={styles.panel}>
                <div className={styles.voiceRow}><div><span>Mirror mode</span><small>Mirror directions left ↔ right</small></div><button type="button" role="switch" aria-checked={mirror} className={`${styles.switch} ${mirror ? styles.switchOn : ''}`} onClick={() => setMirror((value) => !value)}><span /></button></div>
                <MirrorPreview />
              </section>

              <section className={styles.panel}>
                <div className={styles.panelTitle}>Repetitions</div>
                <div className={styles.repetitionRow}><Repeat2 size={21} strokeWidth={1.2} /><strong>{reps}</strong><span>reps</span><div><button type="button" onClick={() => setReps((value) => Math.max(1, value - 1))}>−</button><button type="button" onClick={() => setReps((value) => Math.min(20, value + 1))}>＋</button></div></div>
              </section>
            </aside>

            <section className={styles.centerStage} aria-label="Guided facial movement reference">
              <div className={styles.stepBadge}><span>Step</span><strong>{guided && hasGuidedRoutine ? `${stepIndex + 1} of ${savedRoutineSteps.length}` : '— of —'}</strong></div>
              <button type="button" className={styles.expandButton} aria-label="Expand facial guide"><Maximize2 size={17} /></button>
              <div className={styles.portraitWrap}><FaceMap mirror={mirror} /></div>

              <div className={styles.stepCard}>
                <div className={styles.stepIdentity}><span className={styles.stepIcon}><Sparkles size={14} /></span><div><strong>{activeStep?.name ?? `Freestyle · ${zone}`}</strong><span>{activeStep?.notes ?? 'No saved direction yet'}</span></div></div>
                <div className={styles.pressureSummary}><span>Pressure</span><strong>{pressure === 0 ? 'Light' : pressure === 1 ? 'Medium' : pressure === 2 ? 'Firm' : 'Not set'}</strong><div>{Array.from({ length: 4 }, (_, i) => <i key={i} className={pressure !== null && i <= pressure ? styles.dotActive : ''} />)}</div></div>
                <span className={styles.toolShape} aria-hidden="true" />
              </div>

              <div className={styles.transport}>
                <button type="button" onClick={previousStep} disabled={!guided || !hasGuidedRoutine || stepIndex === 0} aria-label="Previous saved step"><ChevronLeft size={23} /></button>
                <button type="button" onClick={() => setPlaying((value) => !value)} className={styles.playButton} aria-label={playing ? 'Pause session timer' : 'Start session timer'}>{playing ? <Pause size={24} /> : <Play size={24} />}</button>
                <button type="button" onClick={nextStep} disabled={!guided || !hasGuidedRoutine || stepIndex === savedRoutineSteps.length - 1} aria-label="Next saved step"><ChevronRight size={23} /></button>
              </div>
              <span className={styles.timerReadout}>{formatTime(remainingSeconds)}</span>
            </section>

            <aside className={styles.rightControls} aria-label="Facial massage context">
              <section className={`${styles.panel} ${styles.zonePanel}`}>
                <div className={styles.panelTitle}>Active zone</div>
                <button type="button" className={styles.zoneVisual} onClick={() => setZone(ZONES[(ZONES.indexOf(zone) + 1) % ZONES.length])} aria-label={`Current active zone ${zone}. Tap to cycle zones.`}><MiniFace zone={zone} /></button>
              </section>

              <section className={styles.panel}>
                <div className={styles.panelTitle}>Pressure guide</div>
                <div className={styles.pressureLabels}><span>Light</span><span>Medium</span><span>Firm</span></div>
                <div className={styles.pressureDots}>{Array.from({ length: 9 }, (_, i) => <i key={i} className={pressure !== null && i <= pressure * 3 + 2 ? styles.pressureDotActive : ''} />)}</div>
                {pressure === null ? <small className={styles.truthLine}>No pressure instruction saved.</small> : null}
              </section>

              <section className={`${styles.panel} ${styles.toolPanel}`}>
                <div className={styles.panelTitle}>Tools & slip</div>
                <span className={styles.recommended}>Recommended</span>
                {mode === 'tool' ? ownedTools.length ? (
                  <>
                    <select className={styles.select} value={selectedToolIndex} onChange={(event) => setSelectedToolIndex(Number(event.target.value))} aria-label="Choose an owned facial massage tool">
                      {ownedTools.map((tool, index) => <option value={index} key={`${tool.name}-${index}`}>{tool.name}</option>)}
                    </select>
                    {selectedTool ? <div className={styles.toolMeta}><span>{STATUS_LABEL[selectedTool.status]}</span><span>{selectedTool.quantity > 1 ? `${selectedTool.quantity} units` : '1 unit'}</span></div> : null}
                  </>
                ) : <p className={styles.truthLine}>No owned facial-massage tool record yet.</p> : <p className={styles.truthLine}>Hands-only mode selected.</p>}

                <div className={styles.slipCard}>
                  <Droplets size={16} />
                  <div><strong>{linkedSlip ?? 'Slip not selected'}</strong><span>{linkedSlip ? 'Linked from the saved step' : 'Choose only a product already established as appropriate'}</span></div>
                </div>
                <Link href="/beauty/skincare?view=product-library" className={styles.actionRow}><Droplets size={15} /><span>Apply / review slip</span></Link>
                <Link href="/beauty/skincare?view=product-library" className={styles.actionRow}><span>＋</span><span>Add your own</span></Link>
              </section>

              <section className={`${styles.panel} ${styles.focusPanel}`}>
                <div><div className={styles.panelTitle}>Today&apos;s focus</div><strong>{activeStep ? activeStep.name : 'Current focus'}</strong><span>{zone} · {hasGuidedRoutine ? 'Saved routine' : 'User-selected zone'}</span></div>
                <div className={styles.blossom} aria-hidden="true"><i /><i /><i /><i /><i /><b /></div>
              </section>
            </aside>
          </div>

          <footer className={styles.bottomLine}>
            <div className={styles.tip}><GlassOrb small /><strong>Tip</strong><span>Keep strokes slow, intentional, and connected.</span></div>
            <div className={styles.saveState}>✓ <span>All changes saved</span></div>
          </footer>
        </section>
      </section>
    </main>
  );
}
