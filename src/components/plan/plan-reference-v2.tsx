'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Droplets,
  FileText,
  FolderOpen,
  Heart,
  Image as ImageIcon,
  Leaf,
  Link2,
  List,
  Moon,
  MoreHorizontal,
  Mountain,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Sun,
  Target,
  TimerReset,
  Users,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { approvePlanScenarioAction, savePlanObjectSettingAction } from '@/app/actions/plan-reference';
import { PlanInstrumentChrome, type PlanHorizon, type PlanMode } from './plan-instrument-chrome';
import styles from './plan-reference-v2.module.css';

const DAY = 86_400_000;

type JsonMap = Record<string, unknown>;
export type PlanSettingSnapshot = Record<string, JsonMap>;

function horizonLabel(horizon: PlanHorizon) {
  if (horizon === 'today') return 'TODAY';
  if (horizon === 'week') return 'THIS WEEK';
  if (horizon === 'two-weeks') return 'NEXT 2 WEEKS';
  if (horizon === 'month') return 'THIS MONTH';
  return 'NEXT 3 MONTHS';
}

function openGlow(context: Record<string, string> = {}) {
  document.dispatchEvent(new CustomEvent('glow:open', { detail: { context } }));
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : '';
}
function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
function asBoolean(value: unknown) {
  return typeof value === 'boolean' ? value : null;
}
function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}
function asObjectArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is JsonMap => Boolean(item) && typeof item === 'object' && !Array.isArray(item)) : [];
}
function shortDate(value: string | null | undefined) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function timeLabel(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function frequencyLabel(value: string, targetCount = 1) {
  const readable = value.replace(/_/g, ' ');
  if (value === 'daily') return 'Daily';
  if (value === 'weekly') return targetCount > 1 ? `${targetCount}× / week` : 'Weekly';
  if (value === 'weekdays') return 'Weekdays';
  if (value === 'weekends') return 'Weekends';
  return readable.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function saveHistoryState(canUndo: boolean, canRedo: boolean, receipt?: string) {
  document.dispatchEvent(new CustomEvent('glow:plan-history-state', { detail: { canUndo, canRedo, receipt } }));
}

// HABITS
export type PlanHabitHistoryPoint = {
  date: string;
  count: number;
  target: number;
};
export type PlanHabitV2 = {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  targetCount: number;
  rhythm: number;
  streak: number;
  icon: string | null;
  color: string | null;
  history: PlanHabitHistoryPoint[];
};

function habitVisual(habit: PlanHabitV2) {
  const explicit = (habit.icon ?? '').toLowerCase();
  const name = habit.name.toLowerCase();
  if (/water|hydrate|drink|drop/.test(explicit + name)) return { Icon: Droplets, tone: 'blue', word: 'Daytime Energy' };
  if (/read|book|learn/.test(explicit + name)) return { Icon: BookOpen, tone: 'green', word: 'Quiet Growth' };
  if (/meditat|sleep|evening|moon|wind/.test(explicit + name)) return { Icon: Moon, tone: 'violet', word: 'Evening Balance' };
  if (/journal|write|reflect/.test(explicit + name)) return { Icon: BookOpen, tone: 'lavender', word: 'Inner Clarity' };
  if (/kind|love|connect|relationship|heart/.test(explicit + name)) return { Icon: Heart, tone: 'pink', word: 'A Kinder Tomorrow' };
  if (/walk|move|run|fitness|gym|sun|morning/.test(explicit + name)) return { Icon: Sun, tone: 'peach', word: 'Morning Clarity' };
  return { Icon: Sparkles, tone: 'pearl', word: 'Your Rhythm' };
}

function habitState(point: PlanHabitHistoryPoint | undefined) {
  if (!point) return 'planned';
  if (point.count >= point.target && point.target > 0) return 'completed';
  if (point.count > 0) return 'partial';
  return 'planned';
}

export function PlanHabitsV2({ habits, settings }: { habits: PlanHabitV2[]; settings: PlanSettingSnapshot }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const [selectedId, setSelectedId] = useState(habits[0]?.id ?? '');
  const selected = habits.find((habit) => habit.id === selectedId) ?? habits[0] ?? null;
  const selectedSettings = selected ? settings[`plan:habit:${selected.id}`] ?? {} : {};
  const visible = habits.slice(0, 6);
  const overflow = habits.slice(6);
  const overall = habits.length ? Math.round(habits.reduce((sum, habit) => sum + habit.rhythm, 0) / habits.length) : 0;
  const onTrack = habits.filter((habit) => habit.rhythm >= 70).length;

  const weekDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today.getTime() - (6 - index) * DAY);
      return date.toISOString().slice(0, 10);
    });
  }, []);

  const frequencyMix = useMemo(() => {
    const counts = new Map<string, number>();
    habits.forEach((habit) => {
      const key = frequencyLabel(habit.frequency, habit.targetCount);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries());
  }, [habits]);

  const selectedVisual = selected ? habitVisual(selected) : { Icon: Sparkles, tone: 'pearl', word: '' };
  const SelectedIcon = selectedVisual.Icon;
  const minMinutes = asNumber(selectedSettings.minimumMinutes);
  const idealMinutes = asNumber(selectedSettings.idealMinutes);
  const timeWindow = asString(selectedSettings.timeWindow);
  const context = asString(selectedSettings.context);
  const recoveryRule = asString(selectedSettings.recoveryRule);
  const flexible = asBoolean(selectedSettings.flexibleTarget);
  const showStreak = asBoolean(selectedSettings.showStreak);

  async function togglePreference(name: 'flexibleTarget' | 'showStreak', value: boolean) {
    if (!selected) return;
    await savePlanObjectSettingAction({ key: `plan:habit:${selected.id}`, patch: { [name]: value }, label: selected.name });
  }

  return (
    <PlanInstrumentChrome title="PLAN · HABITS" subtitle="Small rhythms. A brighter you. Consistency grows a kinder future." activeInstrument="Habits" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)} rightReceipt="Rhythm is live">
      <section className={styles.stage} aria-label="Habits rhythm constellation">
        <div className={styles.habitsWorld}>
          <div className={styles.habitField}>
            <p className={`${styles.poem} ${styles.poemLeft}`}>Habits are seeds<br/>of the life you want.</p>
            <p className={`${styles.poem} ${styles.poemRight}`}>Not perfect days,<br/>but a steady rhythm.</p>
            <div className={styles.habitOrbitLines} aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i}/>)}</div>
            <div className={styles.microPearls} aria-hidden="true">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties}/>)}</div>
            <div className={styles.habitCore}>
              <span className={styles.coreLeaf}><Leaf/></span>
              <strong>My Habits</strong>
              <small>{habits.length} habit{habits.length === 1 ? '' : 's'}</small>
            </div>
            {visible.map((habit, index) => {
              const visual = habitVisual(habit);
              const Icon = visual.Icon;
              const lastSeven = weekDates.map((date) => habit.history.find((point) => point.date === date));
              return (
                <button key={habit.id} type="button" className={styles.habitSatellite} data-pos={index} data-tone={visual.tone} aria-pressed={selected?.id === habit.id} onClick={() => setSelectedId(habit.id)}>
                  <span className={styles.habitLabel}>
                    <span className={styles.habitChip}><Icon/></span>
                    <span><strong>{habit.name}</strong><small>{frequencyLabel(habit.frequency, habit.targetCount)}</small></span>
                    <ChevronRight/>
                    <span className={styles.rhythmDots}>{lastSeven.map((point, dot) => <i key={dot} data-state={habitState(point)}/>)}</span>
                  </span>
                  <span className={styles.habitOrb}><Icon/></span>
                  <em>{visual.word}</em>
                </button>
              );
            })}
            {overflow.length ? (
              <button className={styles.moreHabits} type="button" onClick={() => openGlow({ room: 'Plan · Habits', intent: `Show all ${habits.length} habits` })}>+{overflow.length} more</button>
            ) : null}
          </div>

          <aside className={styles.habitInspector}>
            <div className={styles.inspectorHeading}>
              <span className={styles.inspectorOrb} data-tone={selectedVisual.tone}><SelectedIcon/></span>
              <span><small>HABIT DETAILS</small><strong>{selected?.name ?? 'No habit selected'}</strong><em>{selected?.description ?? 'Select a habit to inspect its rhythm.'}</em></span>
              <button type="button" onClick={() => selected && openGlow({ room: 'Plan · Habits', habit: selected.name, intent: 'Edit habit details' })}>Edit</button>
            </div>
            <Detail label="Frequency" value={selected ? frequencyLabel(selected.frequency, selected.targetCount) : '—'}/>
            <Detail label="Minimum version" value={minMinutes !== null ? `${minMinutes} minutes` : 'Not set'}/>
            <Detail label="Ideal version" value={idealMinutes !== null ? `${idealMinutes} minutes` : 'Not set'}/>
            <Detail label="Time window" value={timeWindow || 'Not set'}/>
            <Detail label="Context" value={context || 'Not set'}/>
            <ToggleDetail label="Flexible target" sub="Counts within range" value={flexible ?? false} configured={flexible !== null} onChange={(value) => void togglePreference('flexibleTarget', value)}/>
            <Detail label="Recovery rule" value={recoveryRule || 'Not configured'}/>
            <ToggleDetail label="Show streak" sub="A gentle indicator" value={showStreak ?? false} configured={showStreak !== null} onChange={(value) => void togglePreference('showStreak', value)}/>
            <div className={styles.softQuote}><Leaf/><span>Progress grows<br/><i>even when life flexes.</i></span></div>
          </aside>

          <div className={styles.habitMetrics}>
            <article className={styles.metricPanel}>
              <header><strong>RHYTHM VIEW</strong><span><i data-state="completed"/>Completed <i data-state="partial"/>Partial <i data-state="planned"/>Planned <i data-state="rest"/>Rest</span></header>
              <HabitHistoryChart habits={habits} dates={weekDates}/>
            </article>
            <article className={styles.metricPanel}>
              <header><strong>HABIT BALANCE</strong></header>
              <div className={styles.balanceBody}><div className={styles.balanceRing}><span>{habits.length}<small>habits</small></span></div><div>{frequencyMix.length ? frequencyMix.map(([label, count], index) => <p key={label}><i data-i={index}/><span>{label}</span><b>{count}</b></p>) : <p>No habits yet.</p>}</div></div>
              <footer>A balanced rhythm creates a brighter you.</footer>
            </article>
            <article className={styles.metricPanel}>
              <header><strong>INSIGHTS</strong><span className={styles.weekSelect}>This Week⌄</span></header>
              <Insight icon={<TimerReset/>} value={`${overall}%`} title="Overall rhythm" spark={habits.map((habit) => habit.rhythm)}/>
              <Insight icon={<Leaf/>} value={`${onTrack}/${habits.length}`} title="Habits on track" spark={habits.map((habit) => Math.min(100, habit.rhythm + 8))}/>
              <Insight icon={<Moon/>} value={`${Math.max(0, ...habits.map((habit) => habit.streak))}d`} title="Longest current streak" spark={habits.map((habit) => habit.streak * 9)}/>
            </article>
          </div>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className={styles.detail}><span>{label}</span><b>{value}</b><ChevronRight/></div>;
}
function ToggleDetail({ label, sub, value, configured, onChange }: { label: string; sub: string; value: boolean; configured: boolean; onChange: (value: boolean) => void }) {
  return <div className={styles.detailToggle}><span><b>{label}</b><small>{configured ? sub : 'Not configured'}</small></span><button type="button" aria-pressed={value} onClick={() => onChange(!value)}><i/></button></div>;
}
function HabitHistoryChart({ habits, dates }: { habits: PlanHabitV2[]; dates: string[] }) {
  const lines = habits.slice(0, 4).map((habit, lineIndex) => {
    const points = dates.map((date, index) => {
      const point = habit.history.find((item) => item.date === date);
      const ratio = point?.target ? Math.min(1, point.count / point.target) : 0;
      return `${index * 16.66},${78 - ratio * 50 - lineIndex * 3}`;
    }).join(' ');
    return <polyline key={habit.id} points={points}/>;
  });
  return <div className={styles.historyChart}><svg viewBox="0 0 100 90" preserveAspectRatio="none">{lines}</svg><div className={styles.dayLabels}>{dates.map((date) => <span key={date}>{new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' })}</span>)}</div></div>;
}
function Insight({ icon, value, title, spark }: { icon: React.ReactNode; value: string; title: string; spark: number[] }) {
  const values = spark.length ? spark : [0, 0, 0, 0];
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => `${(index / Math.max(1, values.length - 1)) * 100},${32 - (value / max) * 25}`).join(' ');
  return <div className={styles.insight}><span className={styles.insightIcon}>{icon}</span><b>{value}</b><span>{title}</span><svg viewBox="0 0 100 35" preserveAspectRatio="none"><polyline points={points}/></svg></div>;
}

// ROUTINES
export type PlanRoutineStepV2 = { id: string; title: string; notes: string | null; durationMinutes: number | null; order: number };
export type PlanRoutineV2 = { id: string; name: string; description: string | null; timeOfDay: string; steps: PlanRoutineStepV2[] };
type RoutineVariant = 'full' | 'quick' | 'low';

function stepIcon(title: string) {
  const text = title.toLowerCase();
  if (/breath|settle|pause|ground/.test(text)) return Sun;
  if (/journal|write|note/.test(text)) return BookOpen;
  if (/move|walk|stretch|workout|exercise/.test(text)) return Zap;
  if (/plan|calendar|day/.test(text)) return CalendarDays;
  if (/eat|nourish|water|drink/.test(text)) return Droplets;
  if (/gratitude|kind|love/.test(text)) return Heart;
  if (/close|sleep|wind/.test(text)) return Moon;
  return Sparkles;
}

export function PlanRoutinesV2({ routines, settings }: { routines: PlanRoutineV2[]; settings: PlanSettingSnapshot }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const [routineId, setRoutineId] = useState(routines[0]?.id ?? '');
  const routine = routines.find((item) => item.id === routineId) ?? routines[0] ?? null;
  const routineSettings = routine ? settings[`plan:routine:${routine.id}`] ?? {} : {};
  const quickIds = asStringArray(routineSettings.quickStepIds);
  const lowIds = asStringArray(routineSettings.lowStepIds);
  const [variant, setVariant] = useState<RoutineVariant>('full');
  const [activeStep, setActiveStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [receipt, setReceipt] = useState('Routine ready');

  const fullSteps = routine?.steps ?? [];
  const variantSteps = useMemo(() => {
    if (variant === 'full') return fullSteps;
    const ids = variant === 'quick' ? quickIds : lowIds;
    if (!ids.length) return fullSteps;
    return fullSteps.filter((step) => ids.includes(step.id));
  }, [variant, fullSteps, quickIds, lowIds]);
  const current = variantSteps[activeStep] ?? null;
  const total = variantSteps.reduce((sum, step) => sum + (step.durationMinutes ?? 0), 0);
  const variantConfigured = variant === 'full' || (variant === 'quick' ? quickIds.length > 0 : lowIds.length > 0);

  useEffect(() => {
    setActiveStep(0);
    setRunning(false);
    setSkipped([]);
  }, [routineId, variant]);

  useEffect(() => {
    setRemaining((current?.durationMinutes ?? 0) * 60);
    setRunning(false);
  }, [current?.id, current?.durationMinutes]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const id = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running, remaining]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      if (activeStep < variantSteps.length - 1) setActiveStep((value) => value + 1);
      setReceipt('Step completed');
    }
  }, [remaining, running, activeStep, variantSteps.length]);

  function selectVariant(next: RoutineVariant) {
    setVariant(next);
    if (next !== 'full' && !(next === 'quick' ? quickIds.length : lowIds.length)) {
      setReceipt(`${next === 'quick' ? 'Quick' : 'Low-energy'} version is not configured · showing Full safely`);
    } else setReceipt(`${next === 'full' ? 'Full' : next === 'quick' ? 'Quick' : 'Low-energy'} version selected`);
  }

  function skipCurrent() {
    if (!current) return;
    setSkipped((items) => [...items, current.id]);
    setRunning(false);
    setActiveStep((value) => Math.min(variantSteps.length - 1, value + 1));
    setReceipt('Step skipped · remaining path adjusted');
    saveHistoryState(true, false, 'Plan adjusted');
  }

  useEffect(() => {
    const undo = () => {
      if (!skipped.length) return;
      const restored = skipped[skipped.length - 1];
      const index = variantSteps.findIndex((step) => step.id === restored);
      setSkipped((items) => items.slice(0, -1));
      if (index >= 0) setActiveStep(index);
      setReceipt('Skip undone');
      saveHistoryState(skipped.length > 1, true, 'Skip undone');
    };
    const redo = () => skipCurrent();
    document.addEventListener('glow:plan-undo', undo);
    document.addEventListener('glow:plan-redo', redo);
    return () => { document.removeEventListener('glow:plan-undo', undo); document.removeEventListener('glow:plan-redo', redo); };
  }, [skipped, variantSteps, current?.id]);

  const materials = current ? asStringArray((routineSettings.materialsByStep as JsonMap | undefined)?.[current.id]) : [];
  const audio = current ? asString((routineSettings.audioByStep as JsonMap | undefined)?.[current.id]) : '';
  const support = current ? asStringArray((routineSettings.supportsByStep as JsonMap | undefined)?.[current.id]) : [];
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;

  return (
    <PlanInstrumentChrome title="PLAN · ROUTINES" subtitle="Guided sequences for a calmer, brighter you. Different days call for different energy." activeInstrument="Routines" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)} rightReceipt={receipt}>
      <section className={styles.stage} aria-label="Routine conductor">
        <div className={styles.routineWorld}>
          <div className={styles.variantRow}>
            <VariantCard selected={variant === 'full'} title="Full version" subtitle="A complete reset" meta={`${fullSteps.length} steps · ${fullSteps.reduce((s, step) => s + (step.durationMinutes ?? 0), 0) || '—'} min`} onClick={() => selectVariant('full')} configured/>
            <VariantCard selected={variant === 'quick'} title="Quick version" subtitle="Core essentials" meta={quickIds.length ? `${quickIds.length} saved steps` : 'Not configured'} onClick={() => selectVariant('quick')} configured={quickIds.length > 0}/>
            <VariantCard selected={variant === 'low'} title="Low-energy version" subtitle="Gentle and kind" meta={lowIds.length ? `${lowIds.length} saved steps` : 'Not configured'} onClick={() => selectVariant('low')} configured={lowIds.length > 0}/>
            <div className={styles.routineAdapt}>Routines adapt to your<br/>time, energy, and day.<br/>Skip, pause, or switch anytime<br/>— Glow keeps the same routine.</div>
          </div>

          <div className={styles.routineIdentity}>
            <span><Sun/></span><div><small>{variant.toUpperCase()} VERSION</small><h2>{routine?.name ?? 'Your routine'}</h2><p>{routine?.description ?? 'Choose a routine and follow the flow.'}</p></div>
            {routines.length > 1 ? <label className={styles.routinePicker}>Switch routine<select value={routineId} onChange={(event) => setRoutineId(event.target.value)}>{routines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label> : null}
          </div>

          <div className={styles.routineOrbit}>
            <div className={styles.routineArc} aria-hidden="true"/>
            <div className={styles.routinePearls} aria-hidden="true">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties}/>)}</div>
            <div className={styles.stepInspector} style={{ '--step': Math.max(0, activeStep), '--count': Math.max(1, variantSteps.length) } as React.CSSProperties}>
              <span>{activeStep + 1}</span><div><strong>{current?.title ?? 'No step selected'}</strong><small>{current?.durationMinutes ? `${current.durationMinutes} min` : 'No duration set'}</small>{support.includes('spoken-guidance') ? <em>≋ Spoken guidance</em> : null}</div><button type="button" onClick={() => setRunning(true)} disabled={!current}><Play/></button>
            </div>
            <div className={styles.stepTrack}>
              {variantSteps.slice(0, 10).map((step, index) => {
                const Icon = stepIcon(step.title);
                const complete = index < activeStep && !skipped.includes(step.id);
                return <button key={step.id} type="button" className={styles.routineStep} data-state={skipped.includes(step.id) ? 'skipped' : index === activeStep ? 'active' : complete ? 'complete' : 'future'} onClick={() => setActiveStep(index)}><span><Icon/>{complete ? <Check className={styles.stepCheck}/> : null}</span><b>{index + 1}</b><strong>{step.title}</strong><small>{step.durationMinutes ? `${step.durationMinutes} min` : 'No time set'}</small></button>;
              })}
            </div>
            <div className={styles.brighterPearl}><span/><p>A brighter you<br/>— step by step</p></div>
            {!variantConfigured && variant !== 'full' ? <button className={styles.configureVariant} type="button" onClick={() => routine && openGlow({ room: 'Plan · Routines', routine: routine.name, intent: `Configure my ${variant} version` })}>Configure this version</button> : null}
          </div>

          <div className={styles.routinePanels}>
            <article><header>Now playing <span>♫</span></header><div className={styles.albumArt}><span/></div><strong>{audio || 'No audio linked'}</strong><small>{audio ? current?.title : 'This step can run silently.'}</small><div className={styles.mediaControls}><ChevronLeft/><button type="button" onClick={() => setRunning((value) => !value)}>{running ? <Pause/> : <Play/>}</button><ChevronRight/></div><input aria-label="Volume" type="range" min="0" max="100" defaultValue="45"/></article>
            <article><header>Step details</header><strong>{current?.title ?? 'Select a step'}</strong><small>{current?.durationMinutes ? `${current.durationMinutes} min` : 'No duration saved'}</small><p>{current?.notes ?? 'No step notes saved.'}</p><div className={styles.supportChips}>{support.map((item) => <span key={item}>{item.replace(/-/g, ' ')}</span>)}</div></article>
            <article className={styles.timerPanel}><header>Timer</header><div className={styles.liveTimer} style={{ '--progress': current?.durationMinutes ? `${Math.max(0, Math.min(100, 100 - (remaining / (current.durationMinutes * 60 || 1)) * 100))}%` : '0%' } as React.CSSProperties}><span>{current ? `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}` : '—'}</span><small>{current?.durationMinutes ? `/ ${current.durationMinutes}:00` : ''}</small></div><div><button type="button" onClick={() => setRunning((value) => !value)} disabled={!current}>{running ? <Pause/> : <Play/>}<small>{running ? 'Pause' : 'Start'}</small></button><button type="button" onClick={skipCurrent} disabled={!current}><ChevronRight/><small>Skip</small></button></div></article>
            <article><header>Materials <span>Optional</span></header>{materials.length ? <ul className={styles.materialList}>{materials.map((item) => <li key={item}><span className={styles.materialObject}/>{item}</li>)}</ul> : <p className={styles.empty}>No materials are linked to this step.</p>}</article>
            <article><header>If you skip… <Sparkles/></header><p>Glow keeps this one routine object, records the skipped state, and advances the remaining path without creating a duplicate.</p><div className={styles.skipDiagram}><i/><i data-skip={skipped.length > 0}/><i/><i/></div>{skipped.length ? <span className={styles.planAdjusted}><Check/> Step skipped<br/>Plan adjusted</span> : null}<button type="button" onClick={() => setReceipt('Skip behavior understood')}>Got it</button></article>
          </div>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}

function VariantCard({ selected, title, subtitle, meta, onClick, configured }: { selected: boolean; title: string; subtitle: string; meta: string; onClick: () => void; configured: boolean }) {
  return <button type="button" className={styles.variantCard} data-selected={selected} data-configured={configured} onClick={onClick}><span className={styles.variantPearl}/><span><strong>{title}</strong><small>{subtitle}</small><em>{meta}</em></span>{selected ? <Sparkles className={styles.variantStar}/> : null}</button>;
}

// GOALS
export type PlanGoalV2 = { id: string; title: string; description: string | null; category: string; status: string; targetDate: string | null; progress: number };
export type PlanGoalProject = { id: string; title: string; progress: number; status: string };
export type PlanGoalRoutine = { id: string; name: string };
export type PlanGoalHabit = { id: string; name: string; rhythm: number };

function categoryIcon(category: string) {
  const value = category.toLowerCase();
  if (/health|well/.test(value)) return Leaf;
  if (/finance|money/.test(value)) return Target;
  if (/career|work|creative/.test(value)) return Sparkles;
  if (/relationship/.test(value)) return Heart;
  return Mountain;
}

export function PlanGoalsV2({ goals, projects, routines, habits, settings }: { goals: PlanGoalV2[]; projects: PlanGoalProject[]; routines: PlanGoalRoutine[]; habits: PlanGoalHabit[]; settings: PlanSettingSnapshot }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('three-months');
  const activeGoals = goals.filter((goal) => goal.status !== 'abandoned');
  const [selectedId, setSelectedId] = useState(activeGoals[0]?.id ?? '');
  const selected = goals.find((goal) => goal.id === selectedId) ?? activeGoals[0] ?? null;
  const meta = selected ? settings[`plan:goal:${selected.id}`] ?? {} : {};
  const projectIds = asStringArray(meta.projectIds);
  const routineIds = asStringArray(meta.routineIds);
  const habitIds = asStringArray(meta.habitIds);
  const milestones = asObjectArray(meta.milestones);
  const linkedProjects = projects.filter((item) => projectIds.includes(item.id));
  const linkedRoutines = routines.filter((item) => routineIds.includes(item.id));
  const linkedHabits = habits.filter((item) => habitIds.includes(item.id));
  const emotionalReason = asString(meta.emotionalReason);
  const flexibility = asString(meta.flexibility);
  const reviewFrequency = asString(meta.reviewFrequency);
  const privateInspiration = asString(meta.privateInspiration);
  const evidence = asObjectArray(meta.evidence);

  const positions = [[18, 35, 1.2], [45, 24, .82], [67, 29, .7], [87, 31, .66], [58, 48, .58], [34, 50, .54]];

  return (
    <PlanInstrumentChrome title="PLAN · GOALS" subtitle="Distant tomorrows, made closer. Set your horizons and see the path unfold." activeInstrument="Goals" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)} rightReceipt="Goal graph live">
      <section className={styles.stage} aria-label="Goal horizons">
        <div className={styles.goalsWorld}>
          <div className={styles.goalLandscape}>
            <div className={styles.goalMist}/><div className={styles.goalWater}/><div className={styles.goalPathLine}/>
            <button className={styles.todayGoalPearl} type="button" onClick={() => openGlow({ room: 'Plan · Goals', intent: 'What can I do today to move my goals?' })}><span/>TODAY</button>
            {activeGoals.slice(0, 6).map((goal, index) => {
              const [left, top, scale] = positions[index] ?? positions[5];
              const Icon = categoryIcon(goal.category);
              return <button key={goal.id} type="button" className={styles.goalMountain} data-selected={selected?.id === goal.id} style={{ left: `${left}%`, top: `${top}%`, '--scale': scale } as React.CSSProperties} onClick={() => setSelectedId(goal.id)}><span className={styles.crystal}><i/><i/><i/><i/><i/><span className={styles.peakPearl}/><span className={styles.peakBeam}/></span><span className={styles.mountainLabel}><strong>{goal.title.toUpperCase()}</strong><small><Icon/>{goal.category.replace(/_/g, ' ')}</small></span><span className={styles.goalPercent}>{Math.round(goal.progress)}% closer <ChevronRight/></span></button>;
            })}
            {selected ? <GoalConnections goal={selected} projects={linkedProjects} routines={linkedRoutines} habits={linkedHabits} milestones={milestones}/> : null}
            <blockquote>“Progress turns distant<br/>possibilities into familiar places.”</blockquote>
          </div>

          <div className={styles.goalInspectorRow}>
            <article className={styles.goalSummary}><header><span className={styles.goalSummaryIcon}><Leaf/></span><div><strong>{selected?.title ?? 'No goal selected'}</strong><p>{selected?.description ?? 'Choose a direction worth moving toward.'}</p></div><MoreHorizontal/></header><div className={styles.goalProgressText}><strong>{selected ? `${Math.round(selected.progress)}% closer` : '—'}</strong><span>Target date<br/><b>{shortDate(selected?.targetDate)}</b></span></div><div className={styles.goalProgressBar}><i style={{ width: `${Math.max(0, Math.min(100, selected?.progress ?? 0))}%` }}/></div></article>
            <article className={styles.goalFields}>
              <GoalField label="Emotional reason" value={emotionalReason || 'Not recorded'} icon={<Heart/>}/>
              <GoalField label="Target date" value={shortDate(selected?.targetDate)} icon={<CalendarDays/>}/>
              <GoalField label="Evidence of progress" value={evidence.length ? `${evidence.length} linked evidence item${evidence.length === 1 ? '' : 's'}` : 'No evidence linked'} icon={<Target/>}/>
              <GoalField label="Life area" value={selected?.category?.replace(/_/g, ' ') || '—'} icon={<Leaf/>}/>
              <GoalField label="Flexibility" value={flexibility || 'Not configured'} icon={<RotateCcw/>}/>
              <GoalField label="Review frequency" value={reviewFrequency || 'Not configured'} icon={<Clock3/>}/>
              <GoalField label="Private inspiration" value={privateInspiration || 'Not recorded'} icon={<Sparkles/>} wide/>
            </article>
            <article className={styles.goalContributors}><header><span>Projects <b>{linkedProjects.length}</b></span><span>Milestones <b>{milestones.length}</b></span><span>Routines <b>{linkedRoutines.length}</b></span><span>Habits <b>{linkedHabits.length}</b></span></header><div className={styles.contributorList}>{linkedProjects.map((project) => <div key={project.id}><i style={{ '--p': `${project.progress}%` } as React.CSSProperties}/><span><strong>{project.title}</strong><small>{project.status.replace(/_/g, ' ')}</small></span><b>{Math.round(project.progress)}%</b></div>)}{linkedRoutines.map((routine) => <div key={routine.id}><i/><span><strong>{routine.name}</strong><small>Routine</small></span></div>)}{linkedHabits.map((habit) => <div key={habit.id}><i style={{ '--p': `${habit.rhythm}%` } as React.CSSProperties}/><span><strong>{habit.name}</strong><small>Habit rhythm</small></span><b>{habit.rhythm}%</b></div>)}{!linkedProjects.length && !linkedRoutines.length && !linkedHabits.length ? <p>No verified contributing objects are linked yet.</p> : null}</div><button type="button" onClick={() => selected && openGlow({ room: 'Plan · Goals', goal: selected.title, intent: 'Link a supporting project, routine, or habit' })}><Plus/> Link shared object</button></article>
          </div>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}

function GoalConnections({ goal, projects, routines, habits, milestones }: { goal: PlanGoalV2; projects: PlanGoalProject[]; routines: PlanGoalRoutine[]; habits: PlanGoalHabit[]; milestones: JsonMap[] }) {
  const nodes: { id: string; label: string; sub: string; tone: string }[] = [
    ...projects.map((item) => ({ id: `p-${item.id}`, label: item.title, sub: `Project · ${Math.round(item.progress)}%`, tone: 'violet' })),
    ...routines.map((item) => ({ id: `r-${item.id}`, label: item.name, sub: 'Routine', tone: 'mint' })),
    ...habits.map((item) => ({ id: `h-${item.id}`, label: item.name, sub: `Habit · ${item.rhythm}% rhythm`, tone: 'green' })),
    ...milestones.map((item, index) => ({ id: `m-${index}`, label: asString(item.title) || 'Milestone', sub: 'Milestone', tone: 'blue' })),
  ].slice(0, 7);
  return <div className={styles.goalConnections} aria-label={`Connected life for ${goal.title}`}>{nodes.map((node, index) => <span key={node.id} data-pos={index} data-tone={node.tone}><i/><b>{node.label}</b><small>{node.sub}</small></span>)}</div>;
}
function GoalField({ label, value, icon, wide }: { label: string; value: string; icon: React.ReactNode; wide?: boolean }) {
  return <div className={styles.goalField} data-wide={wide}><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>;
}

// PROJECTS
export type PlanProjectV2 = {
  id: string;
  title: string;
  area: string;
  status: string;
  priority: string;
  progress: number;
  deadline: string | null;
  nextAction: string | null;
  notes: string | null;
  milestones: unknown[];
  relatedTaskIds: string[];
  activity: unknown[];
};
export type PlanProjectTask = { id: string; title: string; status: string; dueDate: string | null; priority: string };
export type PlanProjectMemory = { id: string; title: string; summary: string | null; category: string; source: string; sourceDate: string | null; relatedProjectId: string | null };
type ProjectView = 'list' | 'board' | 'timeline' | 'gallery';
const PROJECT_STAGES = ['Discover', 'Define', 'Design', 'Build', 'Launch'];

export function PlanProjectsV2({ projects, tasks, memories, settings }: { projects: PlanProjectV2[]; tasks: PlanProjectTask[]; memories: PlanProjectMemory[]; settings: PlanSettingSnapshot }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('month');
  const [selectedId, setSelectedId] = useState(projects.find((project) => project.status === 'active')?.id ?? projects[0]?.id ?? '');
  const [view, setView] = useState<ProjectView>('timeline');
  const [saving, startSaving] = useTransition();
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0] ?? null;
  const meta = selected ? settings[`plan:project:${selected.id}`] ?? {} : {};
  const currentStage = asString(meta.currentStage);
  const stageStates = (meta.stageStates && typeof meta.stageStates === 'object' && !Array.isArray(meta.stageStates)) ? meta.stageStates as JsonMap : {};
  const projectTasks = selected ? tasks.filter((task) => selected.relatedTaskIds.includes(task.id)) : [];
  const projectMemories = selected ? memories.filter((memory) => memory.relatedProjectId === selected.id) : [];
  const notes = projectMemories.filter((memory) => /note|decision|meeting/i.test(memory.category));
  const files = asObjectArray(meta.files);
  const inspiration = asObjectArray(meta.inspiration);
  const blockers = asObjectArray(meta.blockers);
  const people = asObjectArray(meta.people);
  const decisions = [
    ...asObjectArray(meta.decisions),
    ...projectMemories.filter((memory) => /decision/i.test(memory.category)).map((memory) => ({ title: memory.title, date: memory.sourceDate, actor: memory.source })),
    ...selected?.activity && Array.isArray(selected.activity) ? selected.activity.filter((item): item is JsonMap => Boolean(item) && typeof item === 'object' && !Array.isArray(item) && /decision/i.test(asString((item as JsonMap).type))) : [],
  ].slice(0, 6);
  const automations = (meta.automation && typeof meta.automation === 'object' && !Array.isArray(meta.automation)) ? meta.automation as JsonMap : {};
  const archiveWhenComplete = asBoolean(meta.archiveWhenComplete) ?? false;
  const days = selected?.deadline ? Math.ceil((new Date(selected.deadline).getTime() - Date.now()) / DAY) : null;

  function updateAutomation(key: string, value: boolean) {
    if (!selected) return;
    startSaving(async () => {
      await savePlanObjectSettingAction({ key: `plan:project:${selected.id}`, patch: { automation: { ...automations, [key]: value } }, label: selected.title });
    });
  }

  return (
    <PlanInstrumentChrome title="PLAN · PROJECTS" subtitle="Turn ideas into impact. Organize, align, and move things forward." activeInstrument="Projects" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)} rightReceipt={saving ? 'Saving…' : 'Project live'}>
      <section className={styles.stage} aria-label="Project world">
        <div className={styles.projectsWorld}>
          <div className={styles.projectViewSwitch}>{(['list', 'board', 'timeline', 'gallery'] as ProjectView[]).map((item) => <button key={item} type="button" aria-pressed={view === item} onClick={() => setView(item)}>{item === 'list' ? <List/> : item === 'board' ? <FolderOpen/> : item === 'timeline' ? <TimerReset/> : <ImageIcon/>}{item[0].toUpperCase() + item.slice(1)}</button>)}<MoreHorizontal/></div>
          <div className={styles.projectHero}>
            <span className={styles.projectBadge}><FolderOpen/></span><div className={styles.projectHeroCopy}><small>PROJECT</small><h2>{selected?.title ?? 'No project selected'}</h2><p>{asString(meta.description) || selected?.notes || 'No project description recorded.'}</p><div><span>● {selected?.area ?? '—'}</span><span><CalendarDays/> {shortDate(asString(meta.startDate) || null)} → {shortDate(selected?.deadline)}</span><span className={styles.onTrack}>{asString(meta.healthState) || 'Health not assessed'}</span></div></div><blockquote>{asString(meta.poeticNote) || 'See the arc.\nShape the day.\nAlign the becoming.'}</blockquote><MoreHorizontal/>
            <div className={styles.projectStages}>{PROJECT_STAGES.map((stage, index) => { const state = asString(stageStates[stage]) || (stage === currentStage ? 'in_progress' : 'not_set'); return <button key={stage} type="button" data-state={state} onClick={() => selected && savePlanObjectSettingAction({ key: `plan:project:${selected.id}`, patch: { currentStage: stage, stageStates: { ...stageStates, [stage]: 'in_progress' } }, label: selected.title })}><i>{index + 1}</i><span><b>{stage}</b><small>{state.replace(/_/g, ' ')}</small></span></button>; })}</div>
          </div>

          {projects.length > 1 ? <label className={styles.projectSelect}>Project<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label> : null}

          <div className={styles.projectMain} data-view={view}>
            <div className={styles.projectOrbitField}><div className={styles.projectOrbitRings}/><div className={styles.projectMiniPearls}>{Array.from({ length: 22 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties}/>)}</div><div className={styles.projectDome}><span className={styles.miniCity}>{Array.from({ length: 8 }, (_, i) => <i key={i}/>)}</span><strong>{selected?.title ?? 'Project'}</strong><small>{selected ? `${selected.area} · ${currentStage || 'Stage not set'}` : ''}</small></div>
              <ProjectPane className="actions" title="Next Actions" icon={<Zap/>}>{projectTasks.length ? projectTasks.slice(0, 4).map((task) => <p key={task.id}><Circle/><span>{task.title}<small>{task.dueDate ? shortDate(task.dueDate) : 'No due date'}</small></span></p>) : selected?.nextAction ? <p><Circle/><span>{selected.nextAction}</span></p> : <p className={styles.empty}>No linked next actions.</p>}<button type="button" onClick={() => selected && openGlow({ room: 'Plan · Projects', project: selected.title, intent: 'Add a next action' })}><Plus/> Add next action</button></ProjectPane>
              <ProjectPane className="notes" title="Notes" icon={<FileText/>}>{notes.length ? notes.slice(0, 3).map((note) => <p key={note.id}><span>• {note.title}<small>{note.summary ?? ''}</small></span></p>) : selected?.notes ? <p>{selected.notes}</p> : <p className={styles.empty}>No linked notes.</p>}<button type="button" onClick={() => selected && openGlow({ room: 'Plan · Projects', project: selected.title, intent: 'Add a project note' })}><Plus/> Add a note</button></ProjectPane>
              <ProjectPane className="files" title="Files" icon={<FolderOpen/>}>{files.length ? files.slice(0, 4).map((file, index) => <p key={index}><FileText/><span>{asString(file.title) || 'Linked file'}<small>{[asString(file.type), asString(file.size), asString(file.source)].filter(Boolean).join(' · ')}</small></span></p>) : <p className={styles.empty}>No verified project files are linked.</p>}<button type="button" onClick={() => selected && openGlow({ room: 'Plan · Projects', project: selected.title, intent: 'Link a file from my resources' })}><Plus/> Add or link files</button></ProjectPane>
              <ProjectPane className="inspiration" title="Inspiration" icon={<ImageIcon/>}>{inspiration.length ? <div className={styles.inspirationGrid}>{inspiration.slice(0, 3).map((item, index) => asString(item.url) ? <img key={index} src={asString(item.url)} alt={asString(item.alt) || 'Project inspiration'}/> : null)}</div> : <p className={styles.empty}>No inspiration images linked.</p>}<button type="button" onClick={() => selected && openGlow({ room: 'Plan · Projects', project: selected.title, intent: 'Link inspiration' })}><Plus/> Add inspiration</button></ProjectPane>
              <ProjectPane className="blockers" title="Blockers" icon={<Target/>}>{blockers.length ? blockers.slice(0, 4).map((blocker, index) => <p key={index}><Circle/><span>{asString(blocker.title) || 'Blocker'}<small data-severity={asString(blocker.severity)}>{asString(blocker.severity) || 'Severity not set'}</small></span></p>) : <p className={styles.empty}>No explicit blockers recorded.</p>}<button type="button" onClick={() => selected && openGlow({ room: 'Plan · Projects', project: selected.title, intent: 'Add a blocker' })}><Plus/> Add blocker</button></ProjectPane>
            </div>

            {view === 'board' ? <div className={styles.projectBoard}>{PROJECT_STAGES.map((stage) => <article key={stage}><header>{stage}</header>{projectTasks.filter((task) => asString((meta.taskStages as JsonMap | undefined)?.[task.id]) === stage).map((task) => <div key={task.id}>{task.title}</div>)}<button type="button" onClick={() => openGlow({ room: 'Plan · Projects', project: selected?.title ?? '', stage })}><Plus/> Add</button></article>)}</div> : null}
            {view === 'list' ? <div className={styles.projectListView}><article><h3>Actions</h3>{projectTasks.map((task) => <p key={task.id}><Circle/> {task.title}<span>{task.status.replace(/_/g, ' ')}</span></p>)}</article><article><h3>Notes & decisions</h3>{[...notes, ...decisions.map((item, index) => ({ id: `d-${index}`, title: asString(item.title), summary: asString(item.summary), category: 'decision', source: asString(item.actor), sourceDate: asString(item.date), relatedProjectId: selected?.id ?? null }))].map((item) => <p key={item.id}>{item.title}<small>{item.summary}</small></p>)}</article></div> : null}
            {view === 'gallery' ? <div className={styles.galleryView}>{inspiration.length ? inspiration.map((item, index) => <figure key={index}>{asString(item.url) ? <img src={asString(item.url)} alt={asString(item.alt) || 'Project inspiration'}/> : <div/>}<figcaption>{asString(item.title) || 'Inspiration'}</figcaption></figure>) : <p>No linked inspiration yet.</p>}</div> : null}
          </div>

          <aside className={styles.projectRail}>
            <article><header><CalendarDays/> Deadline</header><strong>{shortDate(selected?.deadline)}</strong><small>{days === null ? 'No deadline stored' : days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}</small><div className={styles.deadlineRing} style={{ '--p': `${Math.max(0, Math.min(100, selected?.progress ?? 0))}%` } as React.CSSProperties}><span>{Math.round(selected?.progress ?? 0)}%</span></div></article>
            <article><header><Users/> People</header>{people.length ? <div className={styles.peopleRow}>{people.slice(0, 5).map((person, index) => <span key={index}>{asString(person.photo) ? <img src={asString(person.photo)} alt=""/> : asString(person.name).slice(0, 1).toUpperCase()}</span>)}</div> : <p>No collaborators linked.</p>}<button type="button" onClick={() => selected && openGlow({ room: 'Plan · Projects', project: selected.title, intent: 'Manage project people' })}>Manage <ChevronRight/></button></article>
            <article><header><Zap/> Automation</header><AutomationToggle label="Summarize weekly" value={asBoolean(automations.summarizeWeekly) ?? false} onChange={(value) => updateAutomation('summarizeWeekly', value)}/><AutomationToggle label="Update status from tasks" value={asBoolean(automations.updateFromTasks) ?? false} onChange={(value) => updateAutomation('updateFromTasks', value)}/><AutomationToggle label="Tag blockers" value={asBoolean(automations.tagBlockers) ?? false} onChange={(value) => updateAutomation('tagBlockers', value)}/><button type="button" onClick={() => selected && openGlow({ room: 'Plan · Projects', project: selected.title, intent: 'Manage verified automations' })}>Manage automation <ChevronRight/></button></article>
            <article><header><FolderOpen/> Archive</header><p>Move to archive when complete</p><AutomationToggle label="" value={archiveWhenComplete} onChange={(value) => selected && startSaving(async () => { await savePlanObjectSettingAction({ key: `plan:project:${selected.id}`, patch: { archiveWhenComplete: value }, label: selected.title }); })}/></article>
          </aside>

          <div className={styles.projectBottom}>
            <article className={styles.gantt}><header>Project Timeline</header><ProjectTimeline project={selected} milestones={selected?.milestones ?? []}/></article>
            <article className={styles.decisions}><header>Recent Decisions <button type="button" onClick={() => openGlow({ room: 'Plan · Projects', project: selected?.title ?? '', intent: 'Show all project decisions' })}>View all <ChevronRight/></button></header>{decisions.length ? decisions.slice(0, 3).map((decision, index) => <p key={index}><Check/><span><strong>{asString(decision.title) || 'Decision'}</strong><small>{shortDate(asString(decision.date) || null)}{asString(decision.actor) ? ` · ${asString(decision.actor)}` : ''}</small></span></p>) : <p className={styles.empty}>No recorded decisions with provenance.</p>}</article>
          </div>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}

function ProjectPane({ className, title, icon, children }: { className: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <article className={`${styles.projectPane} ${styles[className] ?? ''}`}><header>{icon}{title}</header>{children}</article>;
}
function AutomationToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className={styles.automationToggle}><span>{label}</span><button type="button" aria-pressed={value} onClick={() => onChange(!value)}><i/></button></div>;
}
function ProjectTimeline({ project, milestones }: { project: PlanProjectV2 | null; milestones: unknown[] }) {
  const rows = asObjectArray(milestones).filter((item) => asString(item.startAt) || asString(item.endAt) || asString(item.date));
  if (!project || !rows.length) return <div className={styles.timelineEmpty}>No dated phase or milestone ranges are recorded. Glow will not invent them.</div>;
  const dates = rows.flatMap((item) => [asString(item.startAt), asString(item.endAt), asString(item.date)].filter(Boolean).map((value) => new Date(value).getTime())).filter(Number.isFinite);
  const min = Math.min(...dates); const max = Math.max(...dates, min + DAY);
  return <div className={styles.timelineReal}><div className={styles.monthScale}><span>{new Date(min).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span><span>{new Date(max).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span></div>{rows.slice(0, 5).map((item, index) => { const start = new Date(asString(item.startAt) || asString(item.date)).getTime(); const end = new Date(asString(item.endAt) || asString(item.date)).getTime(); const left = ((start - min) / (max - min || 1)) * 100; const width = Math.max(3, ((end - start) / (max - min || 1)) * 100); return <p key={index}><span>{asString(item.title) || `Milestone ${index + 1}`}</span><i style={{ left: `${left}%`, width: `${width}%` }}/></p>; })}<b className={styles.todayLine} style={{ left: `${((Date.now() - min) / (max - min || 1)) * 100}%` }}/></div>;
}

// PLANNING STUDIO
export type PlanStudioEventV2 = { id: string; title: string; startAt: string; endAt: string | null; allDay: boolean; source?: string | null };
export type PlanPlanningItemV2 = { id: string; title: string; level: string; focus: string | null; progress: number; startsAt: string | null; endsAt: string | null };
type StudioMode = 'Day' | 'Week' | 'Month' | 'Scenarios' | 'Guided' | 'Auto Draft' | 'Manual';
type StudioDraft = { id: string; title: string; startAt: string; endAt: string; status: 'draft' | 'tentative'; sourceType: 'idea' | 'scenario' | 'manual'; originEventId?: string };

function startOfWeek(date = new Date()) { const start = new Date(date); const offset = (start.getDay() + 6) % 7; start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - offset); return start; }
function dayIndexFor(date: Date, weekStart: Date) { return Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - weekStart.getTime()) / DAY); }
function collide(start: Date, end: Date, events: { startAt: string; endAt: string | null }[]) { return events.some((event) => { const a = new Date(event.startAt); const b = event.endAt ? new Date(event.endAt) : new Date(a.getTime() + 60 * 60_000); return start < b && end > a; }); }

export function PlanPlanningStudioV2({ events, planning }: { events: PlanStudioEventV2[]; planning: PlanPlanningItemV2[] }) {
  const params = useSearchParams();
  const initialPlanMode: PlanMode = params.get('mode') === 'reflect' ? 'reflect' : 'plan';
  const [horizon, setHorizon] = useState<PlanHorizon>('week');
  const [anchor, setAnchor] = useState(() => startOfWeek());
  const [mode, setMode] = useState<StudioMode>('Week');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<StudioDraft[]>([]);
  const [scenarioName, setScenarioName] = useState('Current possibilities');
  const [receipt, setReceipt] = useState('Simulation only');
  const [question, setQuestion] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDay, setManualDay] = useState(0);
  const [manualHour, setManualHour] = useState(15);
  const [isPending, startTransition] = useTransition();
  const undoRef = useRef<StudioDraft[][]>([]);
  const redoRef = useRef<StudioDraft[][]>([]);

  const weekStart = startOfWeek(anchor);
  const weekEnd = new Date(weekStart.getTime() + 6 * DAY);
  const days = Array.from({ length: 7 }, (_, index) => new Date(weekStart.getTime() + index * DAY));
  const weekEvents = events.filter((event) => { const date = new Date(event.startAt); return date >= weekStart && date < new Date(weekStart.getTime() + 7 * DAY); });

  function snapshot(next: StudioDraft[], message: string) {
    undoRef.current.push(drafts);
    redoRef.current = [];
    setDrafts(next);
    setReceipt(message);
    saveHistoryState(true, false, message);
  }

  useEffect(() => {
    const undo = () => {
      const previous = undoRef.current.pop();
      if (!previous) return;
      redoRef.current.push(drafts);
      setDrafts(previous);
      setReceipt('Studio change undone');
      saveHistoryState(undoRef.current.length > 0, true, 'Studio change undone');
    };
    const redo = () => {
      const next = redoRef.current.pop();
      if (!next) return;
      undoRef.current.push(drafts);
      setDrafts(next);
      setReceipt('Studio change restored');
      saveHistoryState(true, redoRef.current.length > 0, 'Studio change restored');
    };
    document.addEventListener('glow:plan-undo', undo);
    document.addEventListener('glow:plan-redo', redo);
    return () => { document.removeEventListener('glow:plan-undo', undo); document.removeEventListener('glow:plan-redo', redo); };
  }, [drafts]);

  function createAutoDraft() {
    const proposals: StudioDraft[] = [];
    const occupied = [...weekEvents, ...drafts];
    const candidates = planning.slice(0, 8);
    candidates.forEach((item, index) => {
      let placed: StudioDraft | null = null;
      for (let day = 0; day < 7 && !placed; day += 1) {
        for (let hour = 9; hour <= 17 && !placed; hour += 2) {
          const start = new Date(weekStart.getTime() + day * DAY); start.setHours(hour, 0, 0, 0);
          const end = new Date(start.getTime() + 60 * 60_000);
          if (!collide(start, end, [...occupied, ...proposals])) placed = { id: `auto-${item.id}-${index}`, title: item.title, startAt: start.toISOString(), endAt: end.toISOString(), status: 'tentative', sourceType: 'scenario' };
        }
      }
      if (placed) proposals.push(placed);
    });
    snapshot([...drafts, ...proposals], proposals.length ? `Auto Draft proposed ${proposals.length} block${proposals.length === 1 ? '' : 's'}` : 'No safe openings found');
    setMode('Auto Draft');
    setScenarioName('Auto Draft');
  }

  function simulateMoveToFriday() {
    const selected = weekEvents.find((event) => event.id === selectedEventId);
    if (!selected) { setReceipt('Select a committed event first'); return; }
    const original = new Date(selected.startAt); const start = new Date(weekStart.getTime() + 4 * DAY); start.setHours(original.getHours(), original.getMinutes(), 0, 0);
    const duration = selected.endAt ? Math.max(30 * 60_000, new Date(selected.endAt).getTime() - original.getTime()) : 60 * 60_000;
    const end = new Date(start.getTime() + duration);
    snapshot([...drafts.filter((draft) => draft.originEventId !== selected.id), { id: `move-${selected.id}`, title: selected.title, startAt: start.toISOString(), endAt: end.toISOString(), status: 'tentative', sourceType: 'scenario', originEventId: selected.id }], `Proposed moving ${selected.title} to Friday`);
    setScenarioName(`Move ${selected.title}`);
    setMode('Scenarios');
  }

  function addManual() {
    const title = manualTitle.trim();
    if (!title) return;
    const start = new Date(weekStart.getTime() + manualDay * DAY); start.setHours(manualHour, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60_000);
    snapshot([...drafts, { id: `manual-${Date.now()}`, title, startAt: start.toISOString(), endAt: end.toISOString(), status: 'draft', sourceType: 'manual' }], `Drafted ${title}`);
    setManualTitle(''); setMode('Manual'); setScenarioName('Manual draft');
  }

  function approve() {
    if (!drafts.length) { setReceipt('Nothing to approve'); return; }
    const additions = drafts.filter((draft) => !draft.originEventId);
    if (!additions.length) { setReceipt('Moved committed events require source-calendar approval; no duplicate was created'); return; }
    startTransition(async () => {
      const result = await approvePlanScenarioAction({ scenarioId: `${Date.now()}`, name: scenarioName, events: additions });
      if ('error' in result && result.error) { setReceipt(result.error); return; }
      setDrafts((current) => current.filter((draft) => draft.originEventId));
      setReceipt(`${additions.length} approved block${additions.length === 1 ? '' : 's'} added to Calendar`);
      saveHistoryState(false, false, 'Approved to Calendar');
    });
  }

  const committedCounts = days.map((day) => weekEvents.filter((event) => dayIndexFor(new Date(event.startAt), weekStart) === dayIndexFor(day, weekStart)).length);
  const draftCounts = days.map((day) => drafts.filter((event) => dayIndexFor(new Date(event.startAt), weekStart) === dayIndexFor(day, weekStart)).length);

  return (
    <PlanInstrumentChrome title="PLAN · PLANNING STUDIO" subtitle="Explore possibilities. Arrange. Refine. Nothing becomes real until you approve." activeInstrument="Calendar" horizon={horizon} onHorizonChange={setHorizon} centerLabel={`${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`} rightReceipt={isPending ? 'Approving…' : receipt} initialMode={initialPlanMode} onPreviousPeriod={() => setAnchor(new Date(anchor.getTime() - 7 * DAY))} onNextPeriod={() => setAnchor(new Date(anchor.getTime() + 7 * DAY))} onCenterPeriod={() => setAnchor(startOfWeek())} footerActionLabel={drafts.length ? 'Approve & Add to Calendar' : undefined} onFooterAction={drafts.length ? approve : undefined}>
      <section className={styles.stage} aria-label="Planning Studio">
        <div className={styles.studioWorld}>
          <div className={styles.studioModes}>{(['Day', 'Week', 'Month', 'Scenarios', 'Guided', 'Auto Draft', 'Manual'] as StudioMode[]).map((item) => <button key={item} type="button" aria-pressed={mode === item} onClick={() => item === 'Auto Draft' ? createAutoDraft() : setMode(item)}><span>{item === 'Day' ? <CalendarDays/> : item === 'Week' ? <CalendarDays/> : item === 'Month' ? <CalendarDays/> : item === 'Scenarios' ? <Link2/> : item === 'Guided' ? <Target/> : item === 'Auto Draft' ? <WandSparkles/> : <FileText/>}</span><b>{item}</b><small>{item === 'Day' ? 'Plan today' : item === 'Week' ? 'Map the week' : item === 'Month' ? 'See the big picture' : item === 'Scenarios' ? 'Compare paths' : item === 'Guided' ? 'Get suggestions' : item === 'Auto Draft' ? 'Let Glow propose' : 'Arrange freely'}</small></button>)}</div>

          <div className={styles.studioBoard} data-mode={mode}>
            <div className={styles.boardHeader}><button type="button" onClick={() => setAnchor(new Date(anchor.getTime() - 7 * DAY))}><ChevronLeft/></button><strong>{weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong><button type="button" onClick={() => setAnchor(new Date(anchor.getTime() + 7 * DAY))}><ChevronRight/></button><span>This Week <CalendarDays/></span></div>
            {mode === 'Month' ? <StudioMonth events={events} anchor={anchor}/> : mode === 'Day' ? <StudioDay events={weekEvents} drafts={drafts} day={new Date()} onSelect={setSelectedEventId}/> : <StudioWeek events={weekEvents} drafts={drafts} days={days} weekStart={weekStart} selectedEventId={selectedEventId} onSelect={setSelectedEventId}/>} 
            <div className={styles.boardPearls} aria-hidden="true">{Array.from({ length: 26 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties}/>)}</div>
          </div>

          <aside className={styles.studioAsk}><div>What if I moved<br/>this to Friday?</div><span/><button type="button" onClick={simulateMoveToFriday}>Simulate selected event</button></aside>

          <div className={styles.studioLower}>
            <article className={styles.ideasPool}><header>Ideas Pool <b>{planning.length}</b></header>{planning.length ? planning.slice(0, 5).map((item) => <button key={item.id} type="button" onClick={() => { setManualTitle(item.title); setMode('Manual'); }}><i/><span>{item.title}<small>{item.startsAt ? 'Scheduled planning object' : 'Unscheduled possibility'}</small></span></button>) : <p>No saved planning ideas.</p>}<button type="button" onClick={() => setMode('Manual')}><Plus/> Add idea</button></article>
            <ScenarioCard title="Scenario A" subtitle="Current commitments" note={`${weekEvents.length} committed events`} counts={committedCounts} active={scenarioName === 'Current possibilities'} onClick={() => { setScenarioName('Current possibilities'); setMode('Scenarios'); }}/>
            <ScenarioCard title="Scenario B" subtitle="Focused proposal" note={`${drafts.length} simulated blocks`} counts={draftCounts.map((count, i) => count + Math.round(committedCounts[i] * .6))} active={scenarioName === 'Focused proposal'} onClick={() => { createAutoDraft(); setScenarioName('Focused proposal'); }}/>
            <ScenarioCard title="Scenario C" subtitle="Balanced view" note="Compare load before approval" counts={committedCounts.map((count, i) => Math.max(0, count - (i % 2)))} active={scenarioName === 'Balanced view'} onClick={() => { setScenarioName('Balanced view'); setMode('Scenarios'); }}/>
            <button className={styles.createScenario} type="button" onClick={() => { setScenarioName(`Scenario ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`); setMode('Manual'); }}><Plus/> Create scenario</button>
          </div>

          <div className={styles.studioTools}>
            <article><header><Target/> Guided Planning <span>3/5</span></header><p>What would make this week feel successful?</p><div><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Share your thoughts…"/><button type="button" onClick={() => question.trim() && openGlow({ room: 'Plan · Planning Studio', intent: question.trim() })}><ChevronRight/></button></div></article>
            <article><header><WandSparkles/> Auto Draft</header><p>Glow can create a draft from your real commitments and saved planning ideas. It stays tentative until approval.</p><button type="button" onClick={createAutoDraft}><Sparkles/> Generate draft</button></article>
            <article><header><Target/> Comparison <MoreHorizontal/></header><p>Compare committed load and simulated load side by side.</p><ComparisonChart committed={committedCounts} draft={draftCounts}/><button type="button" onClick={() => setMode('Scenarios')}>Open comparison</button></article>
            <article className={styles.studioStatus}><div>{receipt.includes('moved') || receipt.includes('Proposed') ? <><Check/><span><strong>Event move proposed</strong><small>{receipt}</small></span></> : <><Sparkles/><span><strong>Simulation state</strong><small>{receipt}</small></span></>}</div><p><i data-state="committed"/>Committed <small>Will happen</small></p><p><i data-state="draft"/>Draft <small>Needs review</small></p><p><i data-state="tentative"/>Tentative <small>Possible</small></p></article>
          </div>

          {mode === 'Manual' ? <div className={styles.manualComposer}><input value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} placeholder="Draft block title"/><select value={manualDay} onChange={(event) => setManualDay(Number(event.target.value))}>{days.map((day, index) => <option value={index} key={day.toISOString()}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</option>)}</select><select value={manualHour} onChange={(event) => setManualHour(Number(event.target.value))}>{Array.from({ length: 12 }, (_, i) => i + 7).map((hour) => <option key={hour} value={hour}>{new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric' })}</option>)}</select><button type="button" onClick={addManual}><Plus/> Add tentative block</button></div> : null}
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}

function StudioWeek({ events, drafts, days, weekStart, selectedEventId, onSelect }: { events: PlanStudioEventV2[]; drafts: StudioDraft[]; days: Date[]; weekStart: Date; selectedEventId: string | null; onSelect: (id: string) => void }) {
  return <div className={styles.weekPlanner}><div className={styles.timeAxis}>{[6, 9, 12, 15, 18, 21].map((hour) => <span key={hour} style={{ top: `${((hour - 6) / 15) * 100}%` }}>{new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', { hour: 'numeric' })}</span>)}</div>{days.map((day, index) => <div className={styles.plannerDay} key={day.toISOString()}><header>{day.toLocaleDateString('en-US', { weekday: 'short' })}<small>{day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></header>{events.filter((event) => dayIndexFor(new Date(event.startAt), weekStart) === index).map((event) => <StudioBlock key={event.id} event={event} state="committed" selected={selectedEventId === event.id} onClick={() => onSelect(event.id)}/>) }{drafts.filter((event) => dayIndexFor(new Date(event.startAt), weekStart) === index).map((event) => <StudioBlock key={event.id} event={event} state={event.status} selected={false} onClick={() => undefined}/>)}</div>)}</div>;
}
function StudioBlock({ event, state, selected, onClick }: { event: { title: string; startAt: string; endAt: string | null }; state: 'committed' | 'draft' | 'tentative'; selected: boolean; onClick: () => void }) {
  const start = new Date(event.startAt); const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + 60 * 60_000);
  const top = Math.max(0, Math.min(94, ((start.getHours() + start.getMinutes() / 60 - 6) / 15) * 100));
  const height = Math.max(7, Math.min(30, ((end.getTime() - start.getTime()) / 3600000 / 15) * 100));
  return <button type="button" className={styles.studioBlock} data-state={state} data-selected={selected} style={{ top: `${top}%`, height: `${height}%` }} onClick={onClick}><strong>{event.title}</strong><small>{timeLabel(event.startAt)}{state !== 'committed' ? ` · ${state}` : ''}</small></button>;
}
function StudioDay({ events, drafts, day, onSelect }: { events: PlanStudioEventV2[]; drafts: StudioDraft[]; day: Date; onSelect: (id: string) => void }) {
  const dateKey = day.toDateString();
  return <div className={styles.dayPlanner}><div className={styles.dayTimeline}>{Array.from({ length: 16 }, (_, i) => <span key={i}><b>{new Date(2000, 0, 1, i + 6).toLocaleTimeString('en-US', { hour: 'numeric' })}</b></span>)}</div><div>{events.filter((event) => new Date(event.startAt).toDateString() === dateKey).map((event) => <StudioBlock key={event.id} event={event} state="committed" selected={false} onClick={() => onSelect(event.id)}/>)}{drafts.filter((event) => new Date(event.startAt).toDateString() === dateKey).map((event) => <StudioBlock key={event.id} event={event} state={event.status} selected={false} onClick={() => undefined}/>)}</div></div>;
}
function StudioMonth({ events, anchor }: { events: PlanStudioEventV2[]; anchor: Date }) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1); const offset = first.getDay(); const start = new Date(first.getTime() - offset * DAY); const days = Array.from({ length: 42 }, (_, i) => new Date(start.getTime() + i * DAY));
  return <div className={styles.studioMonth}><header>{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}</header><div>{days.map((day) => { const count = events.filter((event) => new Date(event.startAt).toDateString() === day.toDateString()).length; return <span key={day.toISOString()} data-outside={day.getMonth() !== anchor.getMonth()}><b>{day.getDate()}</b>{count ? <i>{count}</i> : null}</span>; })}</div></div>;
}
function ScenarioCard({ title, subtitle, note, counts, active, onClick }: { title: string; subtitle: string; note: string; counts: number[]; active: boolean; onClick: () => void }) {
  const max = Math.max(1, ...counts); const points = counts.map((value, index) => `${(index / 6) * 100},${30 - (value / max) * 24}`).join(' ');
  return <button type="button" className={styles.scenarioCard} data-active={active} onClick={onClick}><small>{title}</small><strong>{subtitle}</strong><span>{note}</span><svg viewBox="0 0 100 34" preserveAspectRatio="none"><polyline points={points}/></svg><em>View</em></button>;
}
function ComparisonChart({ committed, draft }: { committed: number[]; draft: number[] }) {
  const max = Math.max(1, ...committed, ...draft); const a = committed.map((value, i) => `${(i / 6) * 100},${25 - (value / max) * 20}`).join(' '); const b = draft.map((value, i) => `${(i / 6) * 100},${25 - (value / max) * 20}`).join(' ');
  return <svg className={styles.comparisonChart} viewBox="0 0 100 28" preserveAspectRatio="none"><polyline points={a}/><polyline points={b}/></svg>;
}
