'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  Hand,
  Pause,
  Play,
  Repeat2,
  Settings,
  ShieldCheck,
  Sparkles,
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

function FaceMap({ zone, mirror }: { zone: Zone; mirror: boolean }) {
  const highlight = {
    Jaw: { cx: 310, cy: 515, rx: 145, ry: 68 },
    Cheeks: { cx: 310, cy: 395, rx: 165, ry: 82 },
    Eyes: { cx: 310, cy: 300, rx: 145, ry: 48 },
    Forehead: { cx: 310, cy: 205, rx: 132, ry: 72 },
    Neck: { cx: 310, cy: 625, rx: 82, ry: 88 },
  }[zone];

  return (
    <svg
      viewBox="0 0 620 760"
      className={`${styles.faceMap} ${mirror ? styles.mirrored : ''}`}
      role="img"
      aria-label="Illustrated Black woman with warm brown skin and dark wavy hair, with a user-controlled facial movement map"
    >
      <defs>
        <linearGradient id="skinWarm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9a6952" />
          <stop offset=".5" stopColor="#7f503f" />
          <stop offset="1" stopColor="#6b4235" />
        </linearGradient>
        <linearGradient id="skinLight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b37d62" stopOpacity=".55" />
          <stop offset=".55" stopColor="#fff" stopOpacity=".07" />
          <stop offset="1" stopColor="#6c4034" stopOpacity=".3" />
        </linearGradient>
        <radialGradient id="stageGlow">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".92" />
          <stop offset=".55" stopColor="#eef6f0" stopOpacity=".38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <marker id="massageArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,.92)" />
        </marker>
      </defs>

      <ellipse cx="310" cy="385" rx="280" ry="330" fill="url(#stageGlow)" />

      <g aria-hidden="true" fill="#221a1b">
        <ellipse cx="310" cy="225" rx="185" ry="178" />
        <ellipse cx="176" cy="295" rx="65" ry="158" />
        <ellipse cx="444" cy="295" rx="65" ry="158" />
        <circle cx="168" cy="145" r="56" />
        <circle cx="224" cy="112" r="58" />
        <circle cx="291" cy="98" r="61" />
        <circle cx="358" cy="102" r="62" />
        <circle cx="420" cy="128" r="58" />
        <circle cx="458" cy="180" r="55" />
        <circle cx="154" cy="205" r="50" />
      </g>

      <g aria-hidden="true" fill="none" stroke="#493538" strokeWidth="15" strokeLinecap="round" opacity=".9">
        <path d="M145 190 C112 255 125 335 153 390 C180 444 145 502 166 548" />
        <path d="M475 193 C509 255 493 338 468 391 C441 448 477 500 456 551" />
        <path d="M169 121 C205 76 253 83 279 112 C305 78 352 78 379 110 C411 82 454 108 464 147" />
      </g>

      <path d="M229 545 C226 600 216 635 199 664 L421 664 C404 635 394 600 391 545 Z" fill="url(#skinWarm)" />
      <path d="M75 760 C105 668 182 636 241 624 C278 616 342 616 379 624 C438 636 515 668 545 760 Z" fill="url(#skinWarm)" />

      <ellipse cx="310" cy="347" rx="155" ry="230" fill="url(#skinWarm)" />
      <ellipse cx="310" cy="347" rx="155" ry="230" fill="url(#skinLight)" opacity=".58" />
      <ellipse cx="158" cy="362" rx="25" ry="47" fill="#7b4b3d" />
      <ellipse cx="462" cy="362" rx="25" ry="47" fill="#7b4b3d" />

      <g aria-hidden="true" fill="none" stroke="#2d2021" strokeLinecap="round">
        <path d="M220 278 C248 258 276 262 291 274" strokeWidth="9" />
        <path d="M329 274 C345 262 374 258 401 278" strokeWidth="9" />
        <path d="M221 315 C245 328 270 329 290 314" strokeWidth="5" />
        <path d="M330 314 C350 329 375 328 399 315" strokeWidth="5" />
        <path d="M310 330 C303 377 298 410 315 420" strokeWidth="4" opacity=".72" />
        <path d="M291 429 C304 438 319 438 331 429" strokeWidth="3" opacity=".45" />
      </g>

      <g aria-hidden="true">
        <path d="M262 472 C285 457 337 457 359 472 C337 496 285 497 262 472 Z" fill="#7e3f45" />
        <path d="M274 471 C293 466 326 466 347 471" fill="none" stroke="#c98d8c" strokeWidth="3" opacity=".6" />
      </g>

      <ellipse cx={highlight.cx} cy={highlight.cy} rx={highlight.rx} ry={highlight.ry} className={styles.zoneGlow} />

      <g className={styles.routeLines} fill="none" strokeLinecap="round" markerEnd="url(#massageArrow)" aria-hidden="true">
        <path d="M219 436 C187 420 165 394 151 363" />
        <path d="M401 436 C433 420 455 394 469 363" />
        <path d="M230 387 C192 376 171 354 158 332" />
        <path d="M390 387 C428 376 449 354 462 332" />
        <path d="M240 321 C206 309 191 293 180 270" />
        <path d="M380 321 C414 309 429 293 440 270" />
        <path d="M260 250 C248 219 247 189 252 164" />
        <path d="M310 243 C310 207 310 181 310 150" />
        <path d="M360 250 C372 219 373 189 368 164" />
        <path d="M267 513 C236 530 211 540 180 546" />
        <path d="M353 513 C384 530 409 540 440 546" />
        <path d="M277 600 C269 626 267 648 268 674" />
        <path d="M343 600 C351 626 353 648 352 674" />
      </g>
    </svg>
  );
}

export function FacialMassageStudio({ savedRoutineSteps, ownedTools }: FacialMassageStudioProps) {
  const hasGuidedRoutine = savedRoutineSteps.length > 0;
  const [mode, setMode] = useState<'tool' | 'hands'>('tool');
  const [guided, setGuided] = useState(hasGuidedRoutine);
  const [duration, setDuration] = useState(10);
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [playing, setPlaying] = useState(false);
  const [mirror, setMirror] = useState(true);
  const [reps, setReps] = useState(6);
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
  const unresolvedTools = ownedTools.filter((tool) => tool.status === 'needs-confirmation' || tool.status === 'needs-identification').length;

  const pressureCue = useMemo(() => {
    const note = activeStep?.notes?.toLowerCase() ?? '';
    if (/very light|gentle/.test(note)) return 'Gentle pressure is written in this saved step.';
    if (/light/.test(note)) return 'Light pressure is written in this saved step.';
    return 'No pressure instruction is assumed. Follow your saved or verified instructions.';
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

  return (
    <section className={styles.studio} data-room-local-identity="gua-sha-studio">
      <header className={styles.heading}>
        <div>
          <Link href="/beauty" className={styles.backLink}><ArrowLeft size={14} /> Beauty</Link>
          <p className={styles.eyebrow}>GUA SHA STUDIO</p>
          <h1>Guided Facial Movement</h1>
          <p className={styles.subtitle}>A calm movement workspace built from your saved routine and your real owned tools.</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/beauty/facial-massage?focus=1" className={styles.focusButton}><Sparkles size={15} /> Focus session</Link>
          <span className={styles.truthBadge}><ShieldCheck size={14} /> No invented protocol</span>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.leftRail} aria-label="Facial massage session controls">
          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Mode</span><Hand size={16} /></div>
            <div className={styles.segmented}>
              <button type="button" onClick={() => setMode('tool')} className={mode === 'tool' ? styles.activeSegment : ''}>Tool mode</button>
              <button type="button" onClick={() => setMode('hands')} className={mode === 'hands' ? styles.activeSegment : ''}>Hands only</button>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Routine length</span><Clock3 size={16} /></div>
            <div className={styles.durationValue}><strong>{duration}</strong><span>min</span></div>
            <input
              className={styles.range}
              type="range"
              min="5"
              max="20"
              step="5"
              value={duration}
              onChange={(event) => changeDuration(Number(event.target.value))}
              aria-label="Routine length in minutes"
            />
            <div className={styles.rangeLabels}><span>5</span><span>10</span><span>15</span><span>20</span></div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Follow along</span><BookOpen size={16} /></div>
            <div className={styles.segmented}>
              <button
                type="button"
                disabled={!hasGuidedRoutine}
                onClick={() => hasGuidedRoutine && setGuided(true)}
                className={guided && hasGuidedRoutine ? styles.activeSegment : ''}
              >Guided</button>
              <button type="button" onClick={() => setGuided(false)} className={!guided ? styles.activeSegment : ''}>Freestyle</button>
            </div>
            {!hasGuidedRoutine ? <p className={styles.helper}>No saved facial-massage sequence yet. Glow does not invent one.</p> : null}
          </section>

          <section className={styles.panel}>
            <div className={styles.switchRow}>
              <div><span>Mirror mode</span><small>Flip the illustrated reference</small></div>
              <button type="button" role="switch" aria-checked={mirror} className={`${styles.switch} ${mirror ? styles.switchOn : ''}`} onClick={() => setMirror((value) => !value)}><span /></button>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Repetitions</span><Repeat2 size={16} /></div>
            <div className={styles.repetitionRow}>
              <strong>{reps}</strong><span>reps</span>
              <button type="button" onClick={() => setReps((value) => Math.max(1, value - 1))} aria-label="Decrease repetitions">−</button>
              <button type="button" onClick={() => setReps((value) => Math.min(20, value + 1))} aria-label="Increase repetitions">+</button>
            </div>
          </section>
        </aside>

        <section className={styles.centerStage} aria-label="Guided facial movement reference">
          <div className={styles.stageTopline}>
            <span>{guided && hasGuidedRoutine ? `Step ${stepIndex + 1} of ${savedRoutineSteps.length}` : 'Freestyle workspace'}</span>
            <span>{zone}</span>
          </div>

          <div className={styles.portraitWrap}>
            <FaceMap zone={zone} mirror={mirror} />
            <div className={styles.modelLabel}>Illustrated reference model · Black woman · warm brown skin · dark wavy hair</div>
          </div>

          <div className={styles.stepCard}>
            <div>
              <span className={styles.stepKicker}>{guided && hasGuidedRoutine ? 'Saved routine step' : 'Current workspace'}</span>
              <strong>{activeStep?.name ?? `Freestyle · ${zone}`}</strong>
              <p>{activeStep?.notes ?? 'Choose a zone and follow your own established routine or verified instructions. The map does not prescribe a technique.'}</p>
              {activeStep?.products?.length ? <small>Linked in your saved step: {activeStep.products.join(' · ')}</small> : null}
            </div>
            <div className={styles.toolToken} aria-label={selectedTool ? `Selected tool ${selectedTool.name}` : 'Hands only'}>
              <span className={styles.toolShape} />
              <small>{selectedTool ? selectedTool.name.split(' ').slice(0, 4).join(' ') : 'Hands only'}</small>
            </div>
          </div>

          <div className={styles.transport}>
            <button type="button" onClick={previousStep} disabled={!guided || !hasGuidedRoutine || stepIndex === 0} aria-label="Previous saved step"><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => setPlaying((value) => !value)} className={styles.playButton} aria-label={playing ? 'Pause session timer' : 'Start session timer'}>
              {playing ? <Pause size={21} /> : <Play size={21} />}
            </button>
            <span className={styles.timeReadout}>{formatTime(remainingSeconds)}</span>
            <button type="button" onClick={nextStep} disabled={!guided || !hasGuidedRoutine || stepIndex === savedRoutineSteps.length - 1} aria-label="Next saved step"><ChevronRight size={20} /></button>
          </div>
        </section>

        <aside className={styles.rightRail} aria-label="Facial massage context">
          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Active zone</span><Sparkles size={16} /></div>
            <div className={styles.zoneGrid}>
              {ZONES.map((item) => <button type="button" key={item} onClick={() => setZone(item)} className={zone === item ? styles.zoneActive : ''}>{item}</button>)}
            </div>
            <p className={styles.helper}>Zone selection is yours. Glow does not infer what area needs treatment.</p>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Pressure guide</span><ShieldCheck size={16} /></div>
            <div className={styles.pressureTrack}><span className={styles.pressureActive} /><span /><span /><span /><span /></div>
            <p className={styles.helper}>{pressureCue}</p>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Tools + slip</span><Droplets size={16} /></div>
            {mode === 'tool' ? (
              ownedTools.length ? <>
                <select className={styles.select} value={selectedToolIndex} onChange={(event) => setSelectedToolIndex(Number(event.target.value))} aria-label="Choose an owned facial massage tool">
                  {ownedTools.map((tool, index) => <option value={index} key={`${tool.name}-${index}`}>{tool.name}</option>)}
                </select>
                {selectedTool ? <div className={styles.toolMeta}><span>{STATUS_LABEL[selectedTool.status]}</span><span>{selectedTool.quantity > 1 ? `${selectedTool.quantity} physical units` : '1 physical unit'}</span></div> : null}
              </> : <p className={styles.helper}>No owned facial-massage tool record is available yet.</p>
            ) : <p className={styles.helper}>Hands-only mode selected.</p>}
            <div className={styles.slipNotice}><strong>Slip product</strong><span>Nothing is auto-selected. Use only a product already established as appropriate for your routine.</span></div>
            <Link href="/beauty/skincare?view=product-library" className={styles.textLink}>Review Product Library</Link>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}><span>Inventory memory</span><Settings size={16} /></div>
            <div className={styles.inventoryMetrics}>
              <div><strong>{ownedTools.length}</strong><span>massage-tool identities</span></div>
              <div><strong>{unresolvedTools}</strong><span>need confirmation</span></div>
            </div>
            <p className={styles.helper}>Duplicates stay quantity-linked. Unclear tools remain unresolved until the exact identity is readable.</p>
            <Link href="/beauty/skincare?view=device-library" className={styles.textLink}>Open Device Library</Link>
          </section>
        </aside>
      </div>

      <footer className={styles.orbitBar} aria-label="Nearby Beauty spaces">
        <span>Orbit nearby</span>
        <Link href="/routines">Routines</Link>
        <Link href="/beauty/skincare">Skincare</Link>
        <Link href="/beauty/skincare?view=product-result-log">Result log</Link>
        <Link href="/beauty/skincare?view=skin-timeline">Progress</Link>
        <Link href="/settings">Settings</Link>
      </footer>
    </section>
  );
}
