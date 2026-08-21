'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Droplets,
  FlaskConical,
  Heart,
  ListChecks,
  Mic2,
  Package,
  Play,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TimerReset,
  WandSparkles,
  X,
} from 'lucide-react';
import {
  abandonBeautyRitualAction,
  completeBeautyMaintenanceAction,
  completeBeautyRitualAction,
  createBeautyMaintenanceAction,
  dismissBeautyObservationAction,
  logBeautyTreatmentAction,
  recordBeautyStepAction,
  saveBeautyObservationAction,
  startBeautyRitualAction,
} from '@/app/actions/advanced-beauty';
import { BeautyRoutineManager } from '@/components/beauty/beauty-routine-manager';
import type { BeautyRoutine } from '@/lib/types';

type BeautyMode = 'full' | 'standard' | 'quick' | 'minimum';
type Surface = 'ritual' | 'studio';
type BeautyProduct = {
  id: string;
  name: string;
  category: string;
  openedAt: Date | null;
  expiresAt: Date | null;
  routinePosition: string | null;
  reaction: string | null;
  repurchase: string | null;
  usageFrequency: string | null;
  photoUrl: string | null;
};
type EventLite = { id: string; title: string; startAt: Date; location: string | null };
type RitualRun = {
  id: string;
  ritualKey: string;
  title: string;
  mode: string;
  status: string;
  queueRoutineIds: string[];
  completedRoutineIds: string[];
  skippedRoutineIds: string[];
  currentIndex: number;
  actualSeconds: number;
  context: Record<string, unknown>;
  startedAt: Date;
  lastActivityAt: Date;
  completedAt: Date | null;
};
type StepLog = { id: string; runId: string; routineId: string | null; stepName: string; status: string; actualSeconds: number; completedAt: Date };
type TreatmentLog = { id: string; treatmentKey: string; treatmentName: string; area: string; productId: string | null; response: string | null; notes: string | null; occurredAt: Date };
type MaintenanceItem = { id: string; title: string; category: string; cadenceDays: number | null; nextDueAt: Date | null; lastCompletedAt: Date | null; notes: string | null; source: string; archived: boolean };
type Observation = { id: string; kind: string; subject: string; confidence: string; body: string; evidence: Record<string, unknown>; status: string; createdAt: Date };
type Intelligence = { activeRuns: RitualRun[]; recentRuns: RitualRun[]; stepLogs: StepLog[]; treatmentLogs: TreatmentLog[]; maintenance: MaintenanceItem[]; observations: Observation[] };

type Context = {
  makeup: boolean;
  showered: boolean;
  goingOutside: boolean;
  hairWash: boolean;
  straightenedHair: boolean;
};

const MODE_META: Record<BeautyMode, { label: string; minutes: number; description: string }> = {
  full: { label: 'Full', minutes: 35, description: 'Core care + optional sculpting and polish.' },
  standard: { label: 'Standard', minutes: 20, description: 'Core face, body and oral care.' },
  quick: { label: 'Quick', minutes: 10, description: 'Essentials for a shorter window.' },
  minimum: { label: 'Minimum', minutes: 5, description: 'Protect consistency without all-or-nothing pressure.' },
};

const SYSTEMS = [
  { key: 'face', title: 'Face', subtitle: 'Skincare · Gua Sha · Face Yoga · treatments', href: '/skincare', tone: 'from-[#fff9f2] to-[#f2e7da]' },
  { key: 'body', title: 'Body', subtitle: 'Moisture · exfoliation · shaving · SPF', href: '/beauty/lab', tone: 'from-[#fbf4ec] to-[#eaded0]' },
  { key: 'hair', title: 'Hair', subtitle: 'Daily maintenance · wash day · scalp care', href: '/hair', tone: 'from-[#f4e7dc] to-[#dfc7b7]' },
  { key: 'shower', title: 'Shower', subtitle: 'Daily shower · Everything Shower', href: '/routines', tone: 'from-[#edf4f1] to-[#dce8e3]' },
  { key: 'oral', title: 'Oral', subtitle: 'Morning · night', href: '/routines', tone: 'from-[#faf9f3] to-[#eee9dc]' },
  { key: 'makeup', title: 'Polish', subtitle: 'Makeup · fragrance · final appearance', href: '/makeup', tone: 'from-[#f9eeee] to-[#ead6d8]' },
  { key: 'sculpt', title: 'Structure', subtitle: 'Posture · drainage · neck/chest work', href: '/beauty/gua-sha', tone: 'from-[#eff4ea] to-[#dce6d3]' },
  { key: 'fragrance', title: 'Fragrance', subtitle: 'Daily · evening · signature', href: '/beauty/lab', tone: 'from-[#f6f0f7] to-[#e6dbea]' },
];

const STRONG_TREATMENT = /retinoid|retinol|tretinoin|aha|bha|glycolic|acid treatment/i;
const OPTIONAL = /gua sha|face yoga|mask|lymph|sculpt|massage|fragrance/i;
const CONDITIONAL = /vitamin c|double cleanse|spf|sunscreen|shave|heat protect|hair wash/i;
const BODY = /body|lotion|oil|deodorant|shav|exfoliat|scrub/i;
const ORAL = /teeth|tooth|floss|mouth|oral|tongue/i;
const HAIR = /hair|scalp|wig|bonnet|heat protect/i;

function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function estimatedMinutes(step: BeautyRoutine) {
  const text = normalize(`${step.name} ${step.notes ?? ''}`);
  if (/everything shower/.test(text)) return 30;
  if (/shower/.test(text)) return 10;
  if (/mask|treatment/.test(text)) return 8;
  if (/makeup/.test(text)) return 15;
  if (/hair/.test(text)) return 10;
  if (/gua sha|face yoga|lymph/.test(text)) return 5;
  return 3;
}
function stepKind(step: BeautyRoutine) {
  const text = `${step.name} ${step.notes ?? ''}`;
  if (STRONG_TREATMENT.test(text) || /treatment|mask|exfoliat/i.test(text)) return 'Treatment';
  if (OPTIONAL.test(text)) return 'Optional';
  if (CONDITIONAL.test(text)) return 'Conditional';
  return 'Essential';
}
function systemFor(step: BeautyRoutine) {
  const text = `${step.name} ${step.notes ?? ''}`;
  if (HAIR.test(text)) return 'Hair';
  if (ORAL.test(text)) return 'Oral';
  if (BODY.test(text)) return 'Body';
  if (/makeup|brow|mascara|blush|lip|fragrance/i.test(text)) return 'Polish';
  if (/gua sha|face yoga|lymph|posture|neck|jaw/i.test(text)) return 'Structure';
  return 'Face';
}
function appliesToContext(step: BeautyRoutine, context: Context) {
  const text = `${step.name} ${step.notes ?? ''}`.toLowerCase();
  if (/double cleanse/.test(text) && !context.makeup) return false;
  if (/spf|sunscreen/.test(text) && !context.goingOutside && /optional|if going outside/.test(text)) return false;
  if (/shower/.test(text) && context.showered && !/post.?shower/.test(text)) return false;
  if (/wash hair|shampoo|conditioner/.test(text) && !context.hairWash) return false;
  if (/mist|water refresh|aloe/.test(text) && context.straightenedHair) return false;
  return true;
}
function modeSteps(steps: BeautyRoutine[], mode: BeautyMode) {
  if (mode === 'full') return steps;
  const essential = steps.filter((step) => stepKind(step) === 'Essential' || stepKind(step) === 'Conditional');
  if (mode === 'standard') return essential.length ? essential : steps.slice(0, 8);
  const highPriority = essential.filter((step) => /clean|moist|spf|sunscreen|teeth|oral|deodorant|hair|lip/i.test(step.name));
  if (mode === 'quick') return (highPriority.length ? highPriority : essential).slice(0, 6);
  return (highPriority.length ? highPriority : essential).slice(0, 3);
}
function dateKey(date: Date) { return new Date(date).toLocaleDateString('en-CA'); }
function humanDuration(seconds: number) { const min = Math.max(1, Math.round(seconds / 60)); return min < 60 ? `${min}m` : `${Math.floor(min / 60)}h ${min % 60}m`; }

export function BeautyIntelligenceStudio({ routines, products, upcomingAppointments, intelligence }: { routines: BeautyRoutine[]; products: BeautyProduct[]; upcomingAppointments: EventLite[]; intelligence: Intelligence }) {
  const [surface, setSurface] = useState<Surface>('ritual');
  const [mode, setMode] = useState<BeautyMode>('standard');
  const [context, setContext] = useState<Context>({ makeup: true, showered: false, goingOutside: true, hairWash: false, straightenedHair: false });
  const [now, setNow] = useState(() => new Date());
  const [activeRuns, setActiveRuns] = useState(intelligence.activeRuns);
  const [history, setHistory] = useState(intelligence.recentRuns);
  const [maintenance, setMaintenance] = useState(intelligence.maintenance);
  const [observations, setObservations] = useState(intelligence.observations);
  const [playerRun, setPlayerRun] = useState<RitualRun | null>(null);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [stepStartedAt, setStepStartedAt] = useState(() => Date.now());
  const [seconds, setSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [notice, setNotice] = useState('');
  const [treatmentFeedback, setTreatmentFeedback] = useState<{ routine: BeautyRoutine; response: 'comfortable' | 'neutral' | 'irritating' } | null>(null);
  const [maintenanceTitle, setMaintenanceTitle] = useState('');
  const [maintenanceCategory, setMaintenanceCategory] = useState('tools');
  const [maintenanceCadence, setMaintenanceCadence] = useState(7);
  const [observationText, setObservationText] = useState('');
  const [readyMinutes, setReadyMinutes] = useState(45);
  const [look, setLook] = useState('Everyday');
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(id);
  }, [notice]);

  const isEvening = now.getHours() >= 15;
  const base = useMemo(() => {
    const list = routines.filter((routine) => isEvening ? routine.timeOfDay === 'evening' || routine.timeOfDay === 'night' : routine.timeOfDay === 'morning');
    return (list.length ? list : routines).filter((routine) => appliesToContext(routine, context)).sort((a, b) => a.stepOrder - b.stepOrder);
  }, [context, isEvening, routines]);
  const currentPlan = useMemo(() => modeSteps(base, mode), [base, mode]);
  const planMinutes = currentPlan.reduce((sum, step) => sum + estimatedMinutes(step), 0);
  const activeKey = isEvening ? 'pm-beauty' : 'am-beauty';
  const savedRun = activeRuns.find((run) => run.ritualKey === activeKey) ?? null;
  const playerQueue = playerRun ? playerRun.queueRoutineIds.map((id) => routines.find((routine) => routine.id === id)).filter((routine): routine is BeautyRoutine => Boolean(routine)) : [];
  const currentStep = playerQueue[playerIndex] ?? null;
  const nextEvent = upcomingAppointments[0] ?? null;
  const eventMinutes = nextEvent ? Math.max(0, Math.floor((new Date(nextEvent.startAt).getTime() - now.getTime()) / 60000)) : null;
  const getReadyStart = nextEvent ? new Date(new Date(nextEvent.startAt).getTime() - readyMinutes * 60000) : null;
  const treatmentsToday = intelligence.treatmentLogs.filter((log) => dateKey(new Date(log.occurredAt)) === dateKey(now));
  const strongPlan = currentPlan.filter((step) => STRONG_TREATMENT.test(`${step.name} ${step.notes ?? ''}`));
  const strongToday = treatmentsToday.filter((log) => STRONG_TREATMENT.test(log.treatmentName));
  const productAttention = products.filter((product) => (product.expiresAt && new Date(product.expiresAt).getTime() <= now.getTime() + 45 * 86400000) || product.repurchase === 'yes').slice(0, 8);
  const dueMaintenance = maintenance.filter((item) => !item.nextDueAt || new Date(item.nextDueAt).getTime() <= now.getTime() + 7 * 86400000).slice(0, 8);
  const weekRuns = history.filter((run) => new Date(run.startedAt).getTime() >= now.getTime() - 7 * 86400000);
  const completedWeek = weekRuns.filter((run) => run.status === 'completed');
  const amCount = completedWeek.filter((run) => run.ritualKey.includes('am')).length;
  const pmCount = completedWeek.filter((run) => run.ritualKey.includes('pm')).length;
  const faceYogaCount = intelligence.stepLogs.filter((log) => /face yoga/i.test(log.stepName) && log.status === 'completed').length;

  async function beginPlan(requestedMode: BeautyMode = mode) {
    const steps = modeSteps(base, requestedMode);
    if (!steps.length) { setNotice('Add Beauty routine steps first.'); return; }
    startTransition(async () => {
      const result = await startBeautyRitualAction({ ritualKey: activeKey, title: isEvening ? 'Night Beauty' : 'Morning Beauty', mode: requestedMode, queueRoutineIds: steps.map((step) => step.id), context });
      if (!result.data) { setNotice(result.error ?? 'Glow could not start Beauty.'); return; }
      const run = result.data as RitualRun;
      setActiveRuns((current) => [run, ...current.filter((item) => item.id !== run.id && item.ritualKey !== run.ritualKey)]);
      setPlayerRun(run);
      setPlayerIndex(Math.min(run.currentIndex, Math.max(0, run.queueRoutineIds.length - 1)));
      setStepStartedAt(Date.now());
      setSeconds(0);
      setTimerRunning(false);
    });
  }

  function openSaved(run: RitualRun) {
    setPlayerRun(run);
    setPlayerIndex(Math.min(run.currentIndex, Math.max(0, run.queueRoutineIds.length - 1)));
    setStepStartedAt(Date.now());
    setSeconds(0);
    setTimerRunning(false);
  }

  async function handleStep(status: 'completed' | 'skipped') {
    if (!playerRun || !currentStep || pending) return;
    const actualSeconds = Math.max(seconds, Math.round((Date.now() - stepStartedAt) / 1000));
    startTransition(async () => {
      const result = await recordBeautyStepAction({ runId: playerRun.id, routineId: currentStep.id, status, actualSeconds });
      if (!result.data) { setNotice(result.error ?? 'Glow could not save the step.'); return; }
      const run = result.data as RitualRun;
      setPlayerRun(run);
      setActiveRuns((current) => [run, ...current.filter((item) => item.id !== run.id)]);
      const wasTreatment = stepKind(currentStep) === 'Treatment';
      if (status === 'completed' && wasTreatment) setTreatmentFeedback({ routine: currentStep, response: 'neutral' });
      const next = Math.min(run.currentIndex, run.queueRoutineIds.length);
      if (next >= run.queueRoutineIds.length) {
        const finished = await completeBeautyRitualAction(run.id);
        if (finished.data) {
          const completed = finished.data as RitualRun;
          setActiveRuns((current) => current.filter((item) => item.id !== completed.id));
          setHistory((current) => [completed, ...current.filter((item) => item.id !== completed.id)]);
        }
      } else {
        setPlayerIndex(next);
        setStepStartedAt(Date.now());
        setSeconds(0);
        setTimerRunning(false);
      }
    });
  }

  async function closePlayer() {
    setPlayerRun(null);
    setSeconds(0);
    setTimerRunning(false);
  }

  async function abandonPlayer() {
    if (!playerRun) return;
    const result = await abandonBeautyRitualAction(playerRun.id);
    if (result.data) setActiveRuns((current) => current.filter((item) => item.id !== playerRun.id));
    setPlayerRun(null);
  }

  async function saveTreatmentFeedback() {
    if (!treatmentFeedback) return;
    const routine = treatmentFeedback.routine;
    const result = await logBeautyTreatmentAction({ treatmentKey: normalize(routine.name), treatmentName: routine.name, area: systemFor(routine).toLowerCase(), response: treatmentFeedback.response, notes: routine.notes ?? undefined });
    setNotice(result.data ? 'Treatment response saved separately from routine completion.' : result.error ?? 'Could not save treatment response.');
    setTreatmentFeedback(null);
  }

  async function addMaintenance() {
    if (!maintenanceTitle.trim()) return;
    const result = await createBeautyMaintenanceAction({ title: maintenanceTitle.trim(), category: maintenanceCategory, cadenceDays: maintenanceCadence, nextDueAt: new Date() });
    if (result.data) {
      setMaintenance((current) => [...current, result.data as MaintenanceItem]);
      setMaintenanceTitle('');
      setNotice('Beauty maintenance added.');
    } else setNotice(result.error ?? 'Could not add maintenance.');
  }

  async function completeMaintenance(id: string) {
    const result = await completeBeautyMaintenanceAction(id);
    if (result.data) setMaintenance((current) => current.map((item) => item.id === id ? result.data as MaintenanceItem : item));
    else setNotice(result.error ?? 'Could not update maintenance.');
  }

  async function addObservation() {
    if (!observationText.trim()) return;
    const result = await saveBeautyObservationAction({ kind: 'user_note', subject: 'Beauty check-in', confidence: 'user_note', body: observationText.trim(), evidence: { source: 'beauty-studio' } });
    if (result.data) {
      setObservations((current) => [result.data as Observation, ...current]);
      setObservationText('');
      setNotice('Beauty note saved as your observation, not an AI diagnosis.');
    } else setNotice(result.error ?? 'Could not save Beauty note.');
  }

  function speak(text: string) {
    window.dispatchEvent(new CustomEvent('glow:speak', { detail: { text } }));
  }

  if (surface === 'studio') {
    return <div className="space-y-5">
      <div className="sticky top-2 z-30 mx-auto flex w-fit items-center gap-1 rounded-full border border-white/75 bg-white/90 p-1 shadow-lg backdrop-blur-xl">
        <button type="button" onClick={() => setSurface('ritual')} className="rounded-full px-4 py-2 text-xs font-semibold text-[#6c5e66]">Ritual Mode</button>
        <button type="button" disabled aria-current="page" className="rounded-full bg-[#4b3d46] px-4 py-2 text-xs font-semibold text-white">Studio Mode</button>
      </div>
      <section className="rounded-[30px] border border-[#eadfe7] bg-[linear-gradient(135deg,#fffaf7,#f4e9ed)] p-5 sm:p-7">
        <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a47f91]">Beauty Studio</p>
        <h1 className="mt-2 font-serif text-4xl text-[#463a42]">Manage the system behind the ritual.</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#786b72]">Products, schedule, maintenance, treatment history, routine editing and observations live here. Execution stays in Ritual Mode.</p>
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><div className="flex items-center gap-2"><Package size={16}/><h2 className="font-serif text-2xl">Product Library</h2></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{products.slice(0, 12).map((product) => <div key={product.id} className="rounded-2xl bg-[#faf6f5] p-3"><p className="text-sm font-semibold">{product.name}</p><p className="mt-1 text-[10px] text-[#92838b]">{product.category}{product.openedAt ? ` · opened ${new Date(product.openedAt).toLocaleDateString()}` : ''}</p>{product.reaction ? <p className="mt-2 text-[11px] leading-4 text-[#756970]">Your note: {product.reaction}</p> : null}</div>)}</div><Link href="/beauty/lab" className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs"><FlaskConical size={13}/>Open Beauty Lab</Link></section>
        <section className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><div className="flex items-center gap-2"><ListChecks size={16}/><h2 className="font-serif text-2xl">Maintenance Center</h2></div><div className="mt-4 space-y-2">{maintenance.slice(0, 8).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-[#faf6f5] p-3"><div><p className="text-sm font-semibold">{item.title}</p><p className="text-[10px] text-[#958790]">{item.nextDueAt ? `Due ${new Date(item.nextDueAt).toLocaleDateString()}` : 'No due date'}{item.cadenceDays ? ` · every ${item.cadenceDays}d` : ''}</p></div><button type="button" onClick={() => completeMaintenance(item.id)} className="rounded-full bg-[#4b3d46] px-3 py-2 text-[10px] text-white">Done</button></div>)}</div><div className="mt-4 grid gap-2 sm:grid-cols-[1fr_110px_90px_auto]"><input value={maintenanceTitle} onChange={(event) => setMaintenanceTitle(event.target.value)} placeholder="Wash makeup brushes" className="rounded-xl border border-[#e8dde2] px-3 py-2 text-xs"/><select value={maintenanceCategory} onChange={(event) => setMaintenanceCategory(event.target.value)} className="rounded-xl border border-[#e8dde2] px-2 py-2 text-xs"><option>tools</option><option>hair</option><option>body</option><option>face</option><option>nails</option></select><input type="number" min={1} max={3650} value={maintenanceCadence} onChange={(event) => setMaintenanceCadence(Math.max(1, Number(event.target.value) || 1))} className="rounded-xl border border-[#e8dde2] px-2 py-2 text-xs" aria-label="Cadence in days"/><button type="button" disabled={!maintenanceTitle.trim()} onClick={addMaintenance} className="rounded-xl bg-[#4b3d46] px-3 py-2 text-xs text-white disabled:opacity-40"><Plus size={14}/></button></div></section>
      </div>
      <section className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a47f91]">Your observations</p><div className="mt-3 flex gap-2"><input value={observationText} onChange={(event) => setObservationText(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') addObservation(); }} placeholder="Example: This moisturizer felt comfortable tonight." className="min-w-0 flex-1 rounded-2xl border border-[#e8dde2] px-4 py-3 text-xs"/><button type="button" disabled={!observationText.trim()} onClick={addObservation} className="rounded-2xl bg-[#4b3d46] px-4 py-3 text-xs text-white disabled:opacity-40">Save</button></div><div className="mt-4 grid gap-2 md:grid-cols-2">{observations.slice(0, 6).map((item) => <div key={item.id} className="rounded-2xl bg-[#faf6f5] p-4"><div className="flex justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.12em] text-[#9c8a94]">{item.confidence.replaceAll('_',' ')}</p><p className="mt-1 text-sm font-semibold">{item.subject}</p></div><button type="button" onClick={async () => { const result = await dismissBeautyObservationAction(item.id); if (result.data) setObservations((current) => current.filter((obs) => obs.id !== item.id)); }} className="text-[10px] text-[#998b93]">Dismiss</button></div><p className="mt-2 text-xs leading-5 text-[#756970]">{item.body}</p></div>)}</div></section>
      <section><p className="mb-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#a47f91]">Routine Editor</p><BeautyRoutineManager initialRoutines={routines}/></section>
    </div>;
  }

  return <div className="relative min-h-screen space-y-6 pb-28 text-[#463a42]">
    {notice ? <div role="status" className="sticky top-3 z-[170] mx-auto w-fit max-w-[92vw] rounded-full border border-[#eadfe7] bg-white/95 px-4 py-2 text-[11px] shadow-lg">{notice}</div> : null}
    <section className="relative overflow-hidden rounded-[34px] border border-white/80 bg-[radial-gradient(circle_at_15%_15%,#fff7dd,transparent_31%),radial-gradient(circle_at_90%_20%,#f0dfe5,transparent_31%),linear-gradient(135deg,#fffaf5,#f3ece8)] p-5 shadow-[0_24px_80px_rgba(91,66,79,.10)] sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#a1788d]">Glow Beauty Intelligence + Ritual Studio</p><h1 className="mt-2 font-serif text-4xl leading-none sm:text-6xl">Beauty Right Now</h1><p className="mt-3 text-sm text-[#796b72]">{now.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})} · Maintain → Treat → Prepare → Track → Learn</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={!currentPlan.length || pending} onClick={() => savedRun ? openSaved(savedRun) : beginPlan(mode)} className="inline-flex items-center gap-2 rounded-full bg-[#4b3d46] px-5 py-3 text-xs font-semibold text-white disabled:opacity-40"><Play size={14}/>{savedRun ? 'Continue Beauty' : 'Start Beauty'}</button><button type="button" onClick={() => { setMode('quick'); beginPlan('quick'); }} disabled={!base.length || pending} className="rounded-full border border-white/80 bg-white/75 px-4 py-3 text-xs">Quick Care</button><button type="button" onClick={() => document.getElementById('get-ready')?.scrollIntoView({behavior:'smooth'})} className="rounded-full border border-white/80 bg-white/75 px-4 py-3 text-xs">Get Ready</button><Link href="/concierge" className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-4 py-3 text-xs"><Sparkles size={13}/>Ask Glow</Link></div></div>
        <div className="rounded-[26px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a1788d]">Your beauty focus</p><h2 className="mt-2 font-serif text-2xl">{isEvening ? 'Close the day gently.' : 'Polished, protected, ready.'}</h2><div className="mt-4 space-y-2 text-xs">{['Face','Body','Oral'].map((system) => { const count=currentPlan.filter((step)=>systemFor(step)===system).length; return <div key={system} className="flex justify-between rounded-xl bg-white/75 px-3 py-2"><span>{system}</span><span>{count ? `${count} planned` : 'No step due'}</span></div>; })}<div className="flex justify-between rounded-xl bg-[#f4ecf4] px-3 py-2"><span>Tonight’s treatments</span><span>{strongPlan.length ? `${strongPlan.length} strong step${strongPlan.length===1?'':'s'}` : 'Keep simple'}</span></div></div><button type="button" onClick={() => setSurface('studio')} className="mt-4 w-full rounded-full border border-[#e8dde2] bg-white px-4 py-2.5 text-xs font-semibold">Open Studio Mode</button></div>
      </div>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <article className="rounded-[30px] border border-[#eee2e6] bg-white/90 p-5 sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a47f91]">Today’s Beauty Plan</p><h2 className="mt-1 font-serif text-3xl">{isEvening ? 'Tonight' : 'Morning'}</h2></div><div className="flex flex-wrap gap-1.5">{(Object.keys(MODE_META) as BeautyMode[]).map((item) => <button key={item} type="button" onClick={() => setMode(item)} className={`rounded-full px-3 py-1.5 text-[10px] ${mode===item?'bg-[#4b3d46] text-white':'bg-[#f7f2f0]'}`}>{MODE_META[item].label}</button>)}</div></div><p className="mt-2 text-xs text-[#867780]">{MODE_META[mode].description} · ~{planMinutes} min</p><div className="mt-5 grid gap-3 md:grid-cols-3">{['Face','Body','Oral'].map((system) => { const steps=currentPlan.filter((step)=>systemFor(step)===system); return <div key={system} className="rounded-2xl bg-[#faf6f4] p-4"><p className="font-serif text-xl">{system}</p><p className="mt-1 text-[10px] text-[#968790]">{steps.length} step{steps.length===1?'':'s'}</p><div className="mt-3 space-y-1.5">{steps.slice(0,4).map((step)=><div key={step.id} className="flex gap-2 text-[11px]"><span className="text-[#b4899e]">•</span><span className="min-w-0 flex-1 truncate">{step.name}</span><span className="text-[#9b8d94]">{stepKind(step)}</span></div>)}</div></div>; })}</div>
        <div className="mt-5 grid gap-3 border-t border-[#f0e6e9] pt-5 sm:grid-cols-2 lg:grid-cols-5">{[
          ['Wore makeup',context.makeup,(value:boolean)=>setContext((current)=>({...current,makeup:value}))],
          ['Already showered',context.showered,(value:boolean)=>setContext((current)=>({...current,showered:value}))],
          ['Going outside',context.goingOutside,(value:boolean)=>setContext((current)=>({...current,goingOutside:value}))],
          ['Hair wash day',context.hairWash,(value:boolean)=>setContext((current)=>({...current,hairWash:value}))],
          ['Straightened hair',context.straightenedHair,(value:boolean)=>setContext((current)=>({...current,straightenedHair:value}))],
        ].map(([label,value,setter]) => <button key={String(label)} type="button" onClick={()=> (setter as (v:boolean)=>void)(!value)} className={`rounded-2xl border px-3 py-3 text-left text-[10.5px] ${value?'border-[#cbaaba] bg-[#fff4f6]':'border-[#ece2e5] bg-white'}`}><span className="block font-semibold">{label as string}</span><span className="mt-1 block text-[#958890]">{value?'Yes':'No'}</span></button>)}</div>
      </article>

      <aside className="rounded-[30px] border border-[#e3e8d9] bg-[linear-gradient(145deg,#fbfdf7,#edf3e5)] p-5 sm:p-6"><div className="flex items-center gap-2"><ShieldCheck size={17} className="text-[#718264]"/><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#718264]">Beauty Compatibility Guard</p></div><h2 className="mt-2 font-serif text-2xl">Keep treatment load intentional.</h2>{strongPlan.length + strongToday.length > 1 ? <div className="mt-4 rounded-2xl bg-white/75 p-4 text-xs leading-5"><strong>Source rule:</strong> your Beauty system says not to stack multiple strong treatments on the same night. Glow found {strongPlan.length + strongToday.length} strong-treatment signals across tonight’s plan/logs. Review before continuing.</div> : <div className="mt-4 rounded-2xl bg-white/75 p-4 text-xs leading-5">No multi-treatment conflict is visible in the current saved plan/logs. This is source-rule checking, not medical advice.</div>}<div className="mt-4 space-y-2">{strongPlan.map((step)=><div key={step.id} className="rounded-xl bg-white/70 px-3 py-2 text-xs">{step.name} · scheduled in plan</div>)}</div></aside>
    </section>

    {savedRun ? <section className="rounded-[26px] border border-[#dfd2e3] bg-[#f7f0f8] p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#8f7491]">Where was I?</p><div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-serif text-2xl">Resume {savedRun.title}</p><p className="mt-1 text-xs text-[#88788a]">{savedRun.completedRoutineIds.length}/{savedRun.queueRoutineIds.length} completed · last activity {new Date(savedRun.lastActivityAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</p></div><button type="button" onClick={()=>openSaved(savedRun)} className="rounded-full bg-[#4b3d46] px-5 py-2.5 text-xs text-white">Continue</button></div></section> : null}

    <section id="get-ready" className="rounded-[30px] border border-[#eadfe7] bg-[linear-gradient(135deg,#fffaf8,#f2e7eb)] p-5 sm:p-7"><div className="grid gap-5 lg:grid-cols-[1fr_.7fr]"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a47f91]">Get Ready With Glow</p><h2 className="mt-2 font-serif text-3xl">Build the getting-ready window.</h2><div className="mt-4 flex flex-wrap gap-2">{[20,30,45,60,90].map((value)=><button key={value} type="button" onClick={()=>setReadyMinutes(value)} className={`rounded-full px-3 py-2 text-[10px] ${readyMinutes===value?'bg-[#4b3d46] text-white':'bg-white'}`}>{value}m</button>)}</div><div className="mt-4 flex flex-wrap gap-2">{['Everyday','Work','Interview','Dinner','Date','Event','Photo'].map((value)=><button key={value} type="button" onClick={()=>setLook(value)} className={`rounded-full border px-3 py-2 text-[10px] ${look===value?'border-[#c89cad] bg-[#fff1f5]':'border-[#eadfe7] bg-white'}`}>{value}</button>)}</div><div className="mt-5 grid gap-2 sm:grid-cols-4">{[['Beauty',Math.round(readyMinutes*.4)],['Hair',Math.round(readyMinutes*.3)],['Makeup',Math.round(readyMinutes*.22)],['Buffer',Math.max(2,Math.round(readyMinutes*.08))]].map(([label,value])=><div key={String(label)} className="rounded-2xl bg-white/75 p-3"><p className="text-xs font-semibold">{label}</p><p className="mt-1 text-[10px] text-[#91838b]">~{value}m</p></div>)}</div></div><aside className="rounded-[24px] bg-white/75 p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#9b8791]">Calendar-aware prep</p>{nextEvent ? <><p className="mt-2 font-serif text-xl">{nextEvent.title}</p><p className="mt-1 text-xs text-[#8e7e86]">{new Date(nextEvent.startAt).toLocaleString()}</p><p className="mt-3 text-xs">Start getting ready by <strong>{getReadyStart?.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</strong> for a {readyMinutes}-minute plan.</p></> : <p className="mt-3 text-xs leading-5 text-[#8e7e86]">No upcoming Beauty-related Calendar event is constraining this plan.</p>}<div className="mt-4 flex gap-2"><button type="button" onClick={()=>beginPlan(readyMinutes<=10?'minimum':readyMinutes<=20?'quick':'standard')} disabled={!base.length || pending} className="flex-1 rounded-full bg-[#4b3d46] px-4 py-2.5 text-xs text-white disabled:opacity-40">Start {look} prep</button><Link href="/hair" className="rounded-full border border-[#eadfe7] px-4 py-2.5 text-xs">Hair →</Link></div></aside></div></section>

    <section><div className="mb-3"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a47f91]">Your Beauty Systems</p><h2 className="mt-1 font-serif text-3xl">A calm command center, not a wall of steps.</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{SYSTEMS.map((system)=><Link key={system.key} href={system.href} className={`group rounded-[24px] border border-white/80 bg-gradient-to-br ${system.tone} p-5 shadow-sm transition hover:-translate-y-0.5`}><Sparkles size={15} className="text-[#997688]"/><p className="mt-5 font-serif text-2xl">{system.title}</p><p className="mt-2 text-[10.5px] leading-4 text-[#877980]">{system.subtitle}</p><span className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold">Open <ArrowRight size={11}/></span></Link>)}</div></section>

    <section className="grid gap-4 lg:grid-cols-3">
      <article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><div className="flex items-center gap-2"><Package size={15}/><h2 className="font-serif text-2xl">Product Attention</h2></div><p className="mt-2 text-[10px] leading-4 text-[#93858d]">Only expiry/repurchase facts Glow actually has are shown. Quantity is not guessed.</p><div className="mt-4 space-y-2">{productAttention.length ? productAttention.map((product)=><div key={product.id} className="rounded-2xl bg-[#faf6f4] p-3"><p className="text-xs font-semibold">{product.name}</p><p className="mt-1 text-[10px] text-[#958790]">{product.expiresAt && new Date(product.expiresAt).getTime() <= now.getTime()+45*86400000 ? `Expiry review · ${new Date(product.expiresAt).toLocaleDateString()}` : 'Marked for repurchase'}</p></div>) : <p className="text-xs text-[#93858d]">No expiry/repurchase attention currently recorded.</p>}</div><Link href="/beauty/lab" className="mt-4 inline-flex items-center gap-2 text-[10px] font-semibold">Manage products <ArrowRight size={11}/></Link></article>
      <article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><div className="flex items-center gap-2"><CalendarDays size={15}/><h2 className="font-serif text-2xl">This Week</h2></div><div className="mt-4 grid grid-cols-7 gap-1">{Array.from({length:7},(_,i)=>{const day=new Date(now);day.setDate(now.getDate()-6+i);const key=dateKey(day);const done=completedWeek.some((run)=>run.completedAt&&dateKey(new Date(run.completedAt))===key);return <div key={key} className={`rounded-xl p-2 text-center ${done?'bg-[#f0e7f1]':'bg-[#faf6f4]'}`}><p className="text-[9px]">{day.toLocaleDateString(undefined,{weekday:'narrow'})}</p><p className="mt-1 text-[10px]">{done?'✓':'·'}</p></div>})}</div><div className="mt-4 space-y-2 text-xs"><div className="flex justify-between"><span>AM care</span><span>{amCount}/7 recorded</span></div><div className="flex justify-between"><span>PM care</span><span>{pmCount}/7 recorded</span></div><div className="flex justify-between"><span>Treatments</span><span>{intelligence.treatmentLogs.filter((log)=>new Date(log.occurredAt).getTime()>=now.getTime()-7*86400000).length} logged</span></div><div className="flex justify-between"><span>Face Yoga</span><span>{faceYogaCount} sessions</span></div></div></article>
      <article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><div className="flex items-center gap-2"><Heart size={15}/><h2 className="font-serif text-2xl">Beauty Compass</h2></div><div className="mt-4 space-y-2">{['Health first','Consistency','Polished, not overdone'].map((item)=><div key={item} className="rounded-2xl bg-[#faf6f4] px-4 py-3 text-xs">{item}</div>)}</div><p className="mt-4 text-xs italic leading-5 text-[#8c7e85]">Beauty is built through consistency, not perfection.</p></article>
    </section>

    <section className="grid gap-4 lg:grid-cols-2"><article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a47f91]">Beauty Attention</p><div className="mt-4 space-y-2">{dueMaintenance.length ? dueMaintenance.map((item)=><button key={item.id} type="button" onClick={()=>completeMaintenance(item.id)} className="flex w-full items-center justify-between rounded-2xl bg-[#faf6f4] p-3 text-left"><div><p className="text-xs font-semibold">{item.title}</p><p className="text-[10px] text-[#958790]">{item.nextDueAt ? `Due ${new Date(item.nextDueAt).toLocaleDateString()}` : 'Needs a schedule'}</p></div><Check size={14}/></button>) : <p className="text-xs text-[#93858d]">No saved maintenance is due this week.</p>}</div><button type="button" onClick={()=>setSurface('studio')} className="mt-4 text-[10px] font-semibold">Manage maintenance →</button></article><article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a47f91]">Glow Noticed</p>{observations[0] ? <div className="mt-4 rounded-2xl bg-[#faf6f4] p-4"><p className="text-[10px] uppercase text-[#94858d]">{observations[0].confidence.replaceAll('_',' ')}</p><p className="mt-1 text-sm font-semibold">{observations[0].subject}</p><p className="mt-2 text-xs leading-5 text-[#776a71]">{observations[0].body}</p></div> : <p className="mt-4 text-xs leading-5 text-[#93858d]">Glow has not invented a pattern. Add observations in Studio Mode or build enough real completion history first.</p>}<button type="button" onClick={()=>setSurface('studio')} className="mt-4 text-[10px] font-semibold">Open evidence + notes →</button></article></section>

    <section className="rounded-[30px] border border-[#eee2e6] bg-white p-5 sm:p-6"><div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a47f91]">Recent Beauty</p><h2 className="mt-1 font-serif text-2xl">Routine history ≠ treatment history.</h2></div><Link href="/beauty/lab" className="text-[10px] font-semibold">Beauty Lab →</Link></div><div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">{history.filter((run)=>run.status==='completed').slice(0,4).map((run)=><div key={run.id} className="rounded-2xl bg-[#faf6f4] p-4"><p className="text-xs font-semibold">{run.title}</p><p className="mt-1 text-[10px] text-[#958790]">{run.completedAt ? new Date(run.completedAt).toLocaleString() : ''} · {humanDuration(run.actualSeconds)}</p></div>)}{intelligence.treatmentLogs.slice(0,4).map((log)=><div key={log.id} className="rounded-2xl bg-[#f3eff5] p-4"><p className="text-[9px] uppercase tracking-[.1em] text-[#8f7894]">Treatment</p><p className="mt-1 text-xs font-semibold">{log.treatmentName}</p><p className="mt-1 text-[10px] text-[#958790]">{new Date(log.occurredAt).toLocaleString()}{log.response ? ` · ${log.response}` : ''}</p></div>)}</div></section>

    <div className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-24px)] max-w-xl items-center justify-around rounded-full border border-white/80 bg-white/92 px-2 py-2 shadow-[0_16px_60px_rgba(80,58,72,.18)] backdrop-blur-xl"><button type="button" disabled={!currentPlan.length || pending} onClick={()=>savedRun?openSaved(savedRun):beginPlan(mode)} className="rounded-full bg-[#4b3d46] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Start Beauty</button><button type="button" disabled={!base.length || pending} onClick={()=>beginPlan('quick')} className="rounded-full px-4 py-2 text-xs font-semibold">Quick Care</button><button type="button" onClick={()=>document.getElementById('get-ready')?.scrollIntoView({behavior:'smooth'})} className="rounded-full px-4 py-2 text-xs font-semibold">Get Ready</button><Link href="/concierge" className="rounded-full px-4 py-2 text-xs font-semibold">Ask Glow</Link></div>

    {playerRun ? <div className="fixed inset-0 z-[180] overflow-y-auto bg-[linear-gradient(145deg,#fffaf5,#f2e8eb)]" role="dialog" aria-modal="true" aria-label="Beauty ritual player"><div className="sticky top-0 z-10 border-b border-white/80 bg-white/80 px-4 py-3 backdrop-blur-xl"><div className="mx-auto flex max-w-4xl items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#a47f91]">Ritual Mode</p><p className="font-serif text-xl">{playerRun.title}</p></div><div className="flex gap-2"><button type="button" onClick={closePlayer} className="rounded-full border border-[#eadfe7] bg-white px-3 py-2 text-[10px]">Keep active</button><button type="button" onClick={abandonPlayer} className="rounded-full border border-[#eadfe7] bg-white p-2" aria-label="Abandon and close Beauty ritual"><X size={15}/></button></div></div></div>{currentStep ? <div className="mx-auto grid max-w-4xl gap-5 px-4 py-8 lg:grid-cols-[1fr_250px]"><section className="rounded-[32px] border border-white/80 bg-white/85 p-6 shadow-xl sm:p-9"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#a47f91]">{systemFor(currentStep)} · {stepKind(currentStep)} · {playerIndex+1}/{playerQueue.length}</p><h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">{currentStep.name}</h2>{currentStep.notes ? <p className="mt-4 text-sm leading-6 text-[#746870]">{currentStep.notes}</p> : null}<div className="mt-5 flex flex-wrap gap-2">{(currentStep.products??[]).map((product)=><span key={product} className="rounded-full bg-[#f8eff2] px-3 py-1.5 text-[10px]">Use · {product}</span>)}{!(currentStep.products??[]).length ? <span className="rounded-full bg-[#f7f3f0] px-3 py-1.5 text-[10px]">No product linked to this saved step</span> : null}</div><div className="mt-7 grid gap-2 sm:grid-cols-2"><button type="button" disabled={pending} onClick={()=>handleStep('completed')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#4b3d46] px-4 py-3 text-xs font-semibold text-white disabled:opacity-50"><Check size={14}/>Done</button><button type="button" disabled={pending} onClick={()=>handleStep('skipped')} className="rounded-2xl border border-[#eadfe7] bg-white px-4 py-3 text-xs disabled:opacity-50">Skip intentionally</button><button type="button" onClick={()=>speak(`${currentStep.name}. ${currentStep.notes ?? ''}`)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadfe7] bg-white px-4 py-3 text-xs"><Mic2 size={14}/>Read aloud</button><Link href="/beauty/lab" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#eadfe7] bg-white px-4 py-3 text-xs"><Package size={14}/>Products</Link></div><div className="mt-6 flex items-center justify-between text-[10px] text-[#94868e]"><button type="button" disabled={playerIndex===0} onClick={()=>{setPlayerIndex((value)=>Math.max(0,value-1));setStepStartedAt(Date.now());setSeconds(0)}} className="inline-flex items-center gap-1 disabled:opacity-30"><ChevronLeft size={12}/>Previous</button><span>Next: {playerQueue[playerIndex+1]?.name ?? 'Finish ritual'}</span><button type="button" disabled={playerIndex>=playerQueue.length-1} onClick={()=>{setPlayerIndex((value)=>Math.min(playerQueue.length-1,value+1));setStepStartedAt(Date.now());setSeconds(0)}} className="inline-flex items-center gap-1 disabled:opacity-30">Preview next<ChevronRight size={12}/></button></div></section><aside className="space-y-3"><div className="rounded-[24px] border border-white/80 bg-white/80 p-5"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.12em] text-[#91838b]">Step timer</p><Clock3 size={14}/></div><p className="mt-2 font-serif text-4xl">{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</p><button type="button" onClick={()=>setTimerRunning((value)=>!value)} className="mt-3 rounded-full bg-[#f7eef1] px-4 py-2 text-[10px]">{timerRunning?'Pause':'Start'}</button><button type="button" onClick={()=>{setSeconds(0);setTimerRunning(false);setStepStartedAt(Date.now())}} className="ml-2 rounded-full border border-[#eadfe7] px-3 py-2 text-[10px]"><TimerReset size={11}/></button></div><div className="rounded-[24px] border border-white/80 bg-white/80 p-5"><p className="text-[10px] uppercase tracking-[.12em] text-[#91838b]">Why this step?</p><p className="mt-2 text-[11px] leading-5 text-[#756970]">Glow preserves your saved Beauty order and source-derived context rules. It does not treat routine order as medical advice.</p></div></aside></div> : <div className="mx-auto max-w-2xl px-4 py-20 text-center"><Sparkles className="mx-auto"/><h2 className="mt-4 font-serif text-4xl">Ritual complete.</h2><p className="mt-2 text-sm text-[#82747b]">Your routine completion is stored separately from any treatment response.</p><button type="button" onClick={closePlayer} className="mt-6 rounded-full bg-[#4b3d46] px-5 py-3 text-xs text-white">Return to Beauty</button></div>}</div> : null}

    {treatmentFeedback ? <div className="fixed inset-0 z-[190] flex items-end justify-center bg-black/20 p-4 sm:items-center"><div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#a47f91]">Treatment note</p><h2 className="mt-2 font-serif text-2xl">How was {treatmentFeedback.routine.name}?</h2><div className="mt-4 grid grid-cols-3 gap-2">{(['comfortable','neutral','irritating'] as const).map((value)=><button key={value} type="button" onClick={()=>setTreatmentFeedback((current)=>current?{...current,response:value}:null)} className={`rounded-2xl border px-2 py-3 text-[10px] capitalize ${treatmentFeedback.response===value?'border-[#c99dad] bg-[#fff1f5]':'border-[#eadfe7]'}`}>{value}</button>)}</div><div className="mt-5 flex gap-2"><button type="button" onClick={()=>setTreatmentFeedback(null)} className="flex-1 rounded-full border border-[#eadfe7] px-4 py-2.5 text-xs">Skip note</button><button type="button" onClick={saveTreatmentFeedback} className="flex-1 rounded-full bg-[#4b3d46] px-4 py-2.5 text-xs text-white">Save response</button></div></div></div> : null}
  </div>;
}
