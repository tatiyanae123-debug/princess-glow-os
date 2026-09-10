'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Droplets,
  Dumbbell,
  Headphones,
  Heart,
  NotebookPen,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Sun,
  Volume2,
} from 'lucide-react';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import styles from './plan-reference-rooms.module.css';

type Version = 'full' | 'quick' | 'low';

export type PlanRoutineStep = {
  id: string;
  title: string;
  notes: string | null;
  durationMinutes: number | null;
  order: number;
};

export type PlanRoutineItem = {
  id: string;
  name: string;
  description: string | null;
  timeOfDay: string;
  steps: PlanRoutineStep[];
};

const VERSIONS: Record<Version, { title: string; subtitle: string }> = {
  full: { title: 'Full version', subtitle: 'A complete reset' },
  quick: { title: 'Quick version', subtitle: 'Core essentials' },
  low: { title: 'Low-energy version', subtitle: 'Gentle and kind' },
};

function horizonLabel(horizon: PlanHorizon) {
  if (horizon === 'today') return 'TODAY';
  if (horizon === 'week') return 'THIS WEEK';
  if (horizon === 'two-weeks') return 'NEXT 2 WEEKS';
  if (horizon === 'month') return 'THIS MONTH';
  return 'NEXT 3 MONTHS';
}

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function scoreStep(step: PlanRoutineStep) {
  const text = normalized(`${step.title} ${step.notes ?? ''}`);
  let score = 0;
  if (/hydrate|water|med|medicine|medication|hygiene|clean|wash|brush|eat|breakfast|nourish|plan|prepare|dress|sleep|settle|breath/.test(text)) score += 5;
  if (/essential|must|minimum|core|important/.test(text)) score += 4;
  if (/optional|extra|bonus|journal|gratitude|reflection|stretch|music/.test(text)) score -= 1;
  if ((step.durationMinutes ?? 0) <= 5) score += 2;
  return score;
}

function projectedSteps(steps: PlanRoutineStep[], version: Version) {
  const ordered = [...steps].sort((a, b) => a.order - b.order);
  if (version === 'full') return ordered;
  const count = Math.max(1, version === 'quick' ? Math.ceil(ordered.length * .65) : Math.ceil(ordered.length * .48));
  return [...ordered]
    .map((step, index) => ({ step, index, score: scoreStep(step) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, count)
    .sort((a, b) => a.index - b.index)
    .map(({ step }) => step);
}

function totalMinutes(steps: PlanRoutineStep[]) {
  return steps.reduce((sum, step) => sum + (step.durationMinutes ?? 0), 0);
}

function fmt(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function StepIcon({ step }: { step: PlanRoutineStep }) {
  const text = normalized(step.title);
  const Icon = /journal|write|note/.test(text) ? NotebookPen
    : /move|workout|exercise|stretch/.test(text) ? Dumbbell
    : /plan|calendar|schedule/.test(text) ? Clock3
    : /water|hydrate/.test(text) ? Droplets
    : /gratitude|kind|heart/.test(text) ? Heart
    : /read/.test(text) ? BookOpen
    : /breath|audio|meditat/.test(text) ? Headphones
    : Sparkles;
  return <Icon size={18} strokeWidth={1.35} />;
}

function materialsFor(step: PlanRoutineStep | null) {
  if (!step) return [];
  const text = normalized(`${step.title} ${step.notes ?? ''}`);
  const items: { label: string; icon: typeof Droplets }[] = [];
  if (/hydrate|water|drink|nourish/.test(text)) items.push({ label: 'Water', icon: Droplets });
  if (/journal|write|plan|reflect|gratitude|note/.test(text)) items.push({ label: 'Journal or notes app', icon: NotebookPen });
  if (/move|workout|stretch|yoga/.test(text)) items.push({ label: 'Movement space', icon: Dumbbell });
  if (/breath|meditat|focus|settle/.test(text)) items.push({ label: 'Comfortable space', icon: Heart });
  if (!items.length) items.push({ label: 'Only what this step needs', icon: Sparkles });
  return items.slice(0, 4);
}

export function PlanRoutinesReferenceV4({ routines }: { routines: PlanRoutineItem[] }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const [routineId, setRoutineId] = useState(routines[0]?.id ?? '');
  const [version, setVersion] = useState<Version>('full');
  const [activeStep, setActiveStep] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const routine = routines.find((item) => item.id === routineId) ?? routines[0] ?? null;
  const fullSteps = useMemo(() => routine?.steps ?? [], [routine]);
  const steps = useMemo(() => projectedSteps(fullSteps, version), [fullSteps, version]);
  const current = steps[activeStep] ?? null;
  const initialSeconds = Math.max(0, (current?.durationMinutes ?? 0) * 60);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setActiveStep(0);
    setRunning(false);
    setSkipped([]);
  }, [routineId, version]);

  useEffect(() => {
    setSeconds(Math.max(0, (current?.durationMinutes ?? 0) * 60));
    setRunning(false);
  }, [current?.id, current?.durationMinutes]);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  useEffect(() => {
    if (running && seconds === 0 && activeStep < steps.length - 1) {
      setRunning(false);
      setActiveStep((value) => value + 1);
    }
  }, [seconds, running, activeStep, steps.length]);

  const handleSkip = () => {
    if (!current) return;
    setSkipped((items) => items.includes(current.id) ? items : [...items, current.id]);
    setRunning(false);
    setActiveStep((value) => Math.min(steps.length - 1, value + 1));
  };

  const shown = steps.slice(0, 8);
  const materials = materialsFor(current);
  const progress = initialSeconds > 0 ? Math.max(0, Math.min(100, ((initialSeconds - seconds) / initialSeconds) * 100)) : 0;

  return (
    <PlanInstrumentChrome
      title="PLAN · ROUTINES"
      subtitle="Guided sequences for a calmer, brighter you. Different days call for different energy. Choose a routine, follow the flow, or let Glow adapt with you."
      activeInstrument="Routines"
      horizon={horizon}
      onHorizonChange={setHorizon}
      centerLabel={horizonLabel(horizon)}
    >
      <section className={styles.stage} aria-label="Adaptive routine conductor">
        <div className={styles.routineWorld} data-routine-v4>
          <div className={styles.routineVariants}>
            {(Object.keys(VERSIONS) as Version[]).map((key) => {
              const projected = projectedSteps(fullSteps, key);
              return (
                <button
                  key={key}
                  type="button"
                  className={`${styles.variant} ${styles.glass} ${version === key ? styles.active : ''}`}
                  onClick={() => setVersion(key)}
                  aria-pressed={version === key}
                >
                  <span className={`${styles.variantOrb} ${styles.pearl}`}><Sparkles size={18} /></span>
                  <span>
                    <strong>{VERSIONS[key].title}</strong>
                    <span>{VERSIONS[key].subtitle}</span>
                    <span>{projected.length} steps · {totalMinutes(projected) || '—'} min</span>
                  </span>
                </button>
              );
            })}
            <div className={`${styles.variantNote} ${styles.glass}`}>
              Routines adapt to your time, energy, and day. Quick and low-energy views are projections of the same living Routine Object, never duplicates.
            </div>
          </div>

          <div className={styles.routineTitle}>
            <small>{version === 'full' ? 'FULL VERSION' : version === 'quick' ? 'QUICK VERSION' : 'LOW-ENERGY VERSION'}</small>
            <h2><Sun size={24} strokeWidth={1.25} /> {routine?.name ?? 'Your routine'}</h2>
            <p>{routine?.description ?? 'Choose a routine and follow the flow.'}</p>
          </div>

          <div className="routine-switch-v4">
            <button type="button" className="routine-switch-trigger-v4" onClick={() => setMenuOpen((value) => !value)}>
              Switch routine <ChevronDown size={13} />
            </button>
            {menuOpen && routines.length > 1 ? (
              <div className="routine-switch-menu-v4">
                {routines.map((item) => (
                  <button key={item.id} type="button" onClick={() => { setRoutineId(item.id); setMenuOpen(false); }} aria-current={item.id === routine?.id ? 'true' : undefined}>
                    {item.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.routinePath}>
            <span className="routine-orbit-v4 orbit-a" aria-hidden="true" />
            <span className="routine-orbit-v4 orbit-b" aria-hidden="true" />
            <span className="routine-orbit-v4 orbit-c" aria-hidden="true" />
            <span className="routine-orb-caption-v4">A brighter you<br />— step by step</span>
            <span className="routine-orb-hero-v4" aria-hidden="true" />
            {current ? (
              <div className={`${styles.activeStepCard} ${styles.glass}`}>
                <span className={`${styles.inspectorIcon} ${styles.pearl}`}>{activeStep + 1}</span>
                <span><b>{current.title}</b><span>{current.durationMinutes ? `${current.durationMinutes} min` : 'No duration set'}</span><span className="spoken-guidance-v4"><Headphones size={10} /> Spoken guidance</span></span>
                <button className={styles.play} type="button" onClick={() => setRunning((value) => !value)} aria-label={running ? 'Pause step' : 'Start step'}>{running ? <Pause size={15} /> : <Play size={15} />}</button>
              </div>
            ) : null}
            {shown.map((step, index) => {
              const positions = [6, 20, 34, 47, 60, 72, 83, 94];
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`${styles.step} ${index === activeStep ? styles.active : ''} ${skipped.includes(step.id) ? 'step-skipped-v4' : ''}`}
                  style={{ left: `${positions[index] ?? 94}%`, top: `${[60,48,62,52,63,47,56,44][index] ?? 54}px` }}
                  onClick={() => setActiveStep(index)}
                >
                  <span className={`${styles.stepOrb} ${styles.pearl}`}>{index < activeStep && !skipped.includes(step.id) ? <Check size={18} /> : <StepIcon step={step} />}</span>
                  <strong>{index + 1}. {step.title}</strong>
                  <small>{step.durationMinutes ? `${step.durationMinutes} min` : 'No time set'}</small>
                </button>
              );
            })}
            {!steps.length ? <p className={styles.empty} style={{ position: 'absolute', left: 20, top: 78 }}>This routine has no saved steps yet.</p> : null}
          </div>

          <div className={styles.routineBottom}>
            <div className={`${styles.routinePanel} ${styles.glass} now-playing-v4`}>
              <h3>NOW PLAYING</h3>
              <div className="routine-cover-v4"><Sun size={26} /></div>
              <strong>{current?.title ?? 'No active step'}</strong>
              <p className={styles.empty}>Morning Light · Focus</p>
              <div className="player-controls-v4"><button type="button" onClick={() => setActiveStep((v) => Math.max(0, v - 1))}>‹</button><button type="button" onClick={() => setRunning((v) => !v)}>{running ? <Pause size={13} /> : <Play size={13} />}</button><button type="button" onClick={() => setActiveStep((v) => Math.min(steps.length - 1, v + 1))}>›</button></div>
              <div className="volume-v4"><Volume2 size={11} /><span><i /></span></div>
            </div>

            <div className={`${styles.routinePanel} ${styles.glass}`}>
              <h3>STEP DETAILS</h3>
              <strong>{current?.title ?? 'Select a step'}</strong>
              <p className={styles.empty}>{current?.notes ?? 'No step notes saved.'}</p>
              <span className="detail-chip-v4"><Headphones size={10} /> Spoken guidance</span>
              <span className="detail-chip-v4">♪ Soft music</span>
            </div>

            <div className={`${styles.routinePanel} ${styles.glass}`}>
              <h3>TIMER</h3>
              <div className={styles.timer} style={{ background: `conic-gradient(#8a8dea 0 ${progress}%, rgba(170,165,197,.16) ${progress}% 100%)` }}><b>{current?.durationMinutes ? fmt(seconds) : '—'}</b></div>
              <div className="timer-actions-v4"><button type="button" onClick={() => setRunning((v) => !v)}>{running ? <Pause size={13} /> : <Play size={13} />}<span>{running ? 'Pause' : 'Start'}</span></button><button type="button" onClick={handleSkip}><SkipForward size={13} /><span>Skip</span></button></div>
            </div>

            <div className={`${styles.routinePanel} ${styles.glass}`}>
              <h3>MATERIALS <span className="optional-v4">Optional</span></h3>
              <div className={styles.materials}>{materials.map(({ label, icon: Icon }) => <span key={label} className="material-row-v4"><Icon size={14} /> {label}</span>)}</div>
            </div>

            <div className={`${styles.routinePanel} ${styles.glass}`}>
              <h3>IF YOU SKIP… <Sparkles size={12} /></h3>
              <p className={styles.empty}>Glow keeps this same routine object and adapts the remaining path. Nothing is duplicated.</p>
              <div className={styles.skipMap}><i /><i /><i /></div>
              {skipped.length ? <div className="skip-receipt-v4"><Check size={11} /> Step skipped · plan adjusted</div> : null}
            </div>
          </div>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}
