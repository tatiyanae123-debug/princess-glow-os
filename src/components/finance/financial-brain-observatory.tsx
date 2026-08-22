'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Brain, Eye, EyeOff, Orbit } from 'lucide-react';
import type { FinanceEntry } from '@/lib/types';

type FinanceGoal = {
  id: string;
  name: string;
  goalType: string;
  targetCents: number;
  currentCents: number;
  targetDate: Date | string | null;
  notes: string | null;
};

type Tab = 'now' | 'signals' | 'decisions' | 'scenarios' | 'patterns' | 'goals' | 'forecast' | 'risk' | 'opportunities' | 'reviews' | 'memory';
type Lens = 'All' | 'Cash' | 'Spending' | 'Savings' | 'Goals' | 'Future' | 'Risk' | 'Opportunity';
type Confidence = 'High' | 'Medium' | 'Low';
type SignalKind = 'Needs attention' | 'Worth reviewing' | 'Healthy' | 'Watching' | 'Opportunity';
type SignalDomain = 'Cash' | 'Spending' | 'Savings' | 'Goals' | 'Future' | 'Risk' | 'Opportunity';
type Signal = { title: string; detail: string; kind: SignalKind; confidence: Confidence; evidence: string[]; domains: SignalDomain[] };
type SavedDecision = { date: string; decision: string; why: string; expected: string; actual?: string };
type MemoryState = { privacy: boolean; months: 3 | 6 | 12; lens: Lens; scenarioAmount: number; decisions: SavedDecision[]; notes: string[] };

const STORAGE_KEY = 'glow:financial-brain:v3';
const LEGACY_KEYS = ['glow:financial-brain:v2', 'glow:financial-brain:v1'];
const TZ = 'America/New_York';
const TABS: Tab[] = ['now', 'signals', 'decisions', 'scenarios', 'patterns', 'goals', 'forecast', 'risk', 'opportunities', 'reviews', 'memory'];
const LENSES: Lens[] = ['All', 'Cash', 'Spending', 'Savings', 'Goals', 'Future', 'Risk', 'Opportunity'];
const DEFAULTS: MemoryState = { privacy: false, months: 6, lens: 'All', scenarioAmount: 500, decisions: [], notes: [] };
const LENS_TABS: Record<Lens, Tab> = { All: 'now', Cash: 'now', Spending: 'patterns', Savings: 'goals', Goals: 'goals', Future: 'forecast', Risk: 'risk', Opportunity: 'opportunities' };
const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const lower = (s?: string | null) => (s ?? '').trim().toLowerCase();
const monthKey = (s: string) => s.slice(0, 7);
const isRecurringCandidate = (e: FinanceEntry) => /subscription|rent|mortgage|insurance|phone|internet|utility|utilities|membership|bill/.test(`${lower(e.title)} ${lower(e.category)} ${lower(e.notes)}`);

function zonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const read = (type: 'year' | 'month' | 'day') => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { year: read('year'), month: read('month'), day: read('day') };
}

function addMonthKey(key: string, delta: number) {
  const [year, month] = key.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1 + delta, 1, 12));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function daysInMonthKey(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0, 12)).getUTCDate();
}

function openGlow(prompt: string) {
  window.dispatchEvent(new CustomEvent('glow:open-conversation', { detail: { prompt } }));
}

function normalizeMemory(value: unknown): MemoryState {
  if (!value || typeof value !== 'object') return DEFAULTS;
  const raw = value as Partial<MemoryState>;
  const months: 3 | 6 | 12 = raw.months === 3 || raw.months === 12 ? raw.months : 6;
  const lens = LENSES.includes(raw.lens as Lens) ? (raw.lens as Lens) : 'All';
  const decisions = Array.isArray(raw.decisions)
    ? raw.decisions.filter((d): d is SavedDecision => Boolean(d && typeof d === 'object' && typeof (d as SavedDecision).decision === 'string')).slice(-30)
    : [];
  const notes = Array.isArray(raw.notes) ? raw.notes.filter((n): n is string => typeof n === 'string').slice(-50) : [];
  const scenarioAmount = typeof raw.scenarioAmount === 'number' && Number.isFinite(raw.scenarioAmount) ? Math.max(0, Math.min(1_000_000, raw.scenarioAmount)) : 500;
  return { privacy: Boolean(raw.privacy), months, lens, decisions, notes, scenarioAmount };
}

function dateLabel(iso: string) {
  return new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric' }).format(new Date(iso));
}

export function FinancialBrainObservatory({ entries, goals, generatedAt }: { entries: FinanceEntry[]; goals: FinanceGoal[]; generatedAt: string }) {
  const now = useMemo(() => new Date(generatedAt), [generatedAt]);
  const nowParts = useMemo(() => zonedParts(now), [now]);
  const currentKey = `${nowParts.year}-${String(nowParts.month).padStart(2, '0')}`;
  const previousKey = addMonthKey(currentKey, -1);
  const [tab, setTab] = useState<Tab>('now');
  const [memory, setMemory] = useState<MemoryState>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [evidence, setEvidence] = useState<Signal | null>(null);

  useEffect(() => {
    try {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) {
        setMemory(normalizeMemory(JSON.parse(current)));
      } else {
        for (const key of LEGACY_KEYS) {
          const legacy = localStorage.getItem(key);
          if (legacy) { setMemory(normalizeMemory(JSON.parse(legacy))); break; }
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch {}
  }, [memory, hydrated]);

  const display = (n: number) => memory.privacy ? '••••' : money(n);
  const current = entries.filter((e) => monthKey(e.entryDate) === currentKey);
  const previous = entries.filter((e) => monthKey(e.entryDate) === previousKey);
  const sum = (list: FinanceEntry[], type: FinanceEntry['type']) => list.filter((e) => e.type === type).reduce((s, e) => s + Number(e.amount), 0);
  const income = sum(current, 'income');
  const spent = sum(current, 'expense');
  const saved = sum(current, 'saving');
  const invested = sum(current, 'investment');
  const position = income - spent - saved - invested;
  const prevIncome = sum(previous, 'income');
  const prevSpent = sum(previous, 'expense');
  const prevSaved = sum(previous, 'saving');

  const historyStart = addMonthKey(currentKey, -(memory.months - 1));
  const history = entries.filter((e) => monthKey(e.entryDate) >= historyStart && monthKey(e.entryDate) <= currentKey);
  const historyMonths = [...new Set(history.map((e) => monthKey(e.entryDate)))].sort();
  const completedHistoryMonths = historyMonths.filter((key) => key !== currentKey);
  const completedExpenseMonths = completedHistoryMonths.map((key) => sum(history.filter((e) => monthKey(e.entryDate) === key), 'expense'));
  const completedSavingsMonths = completedHistoryMonths.map((key) => sum(history.filter((e) => monthKey(e.entryDate) === key), 'saving'));
  const expenseAvg = completedExpenseMonths.length ? completedExpenseMonths.reduce((a, b) => a + b, 0) / completedExpenseMonths.length : 0;
  const savingsAvg = completedSavingsMonths.length ? completedSavingsMonths.reduce((a, b) => a + b, 0) / completedSavingsMonths.length : 0;
  const historyConfidence: Confidence = completedHistoryMonths.length >= 6 ? 'High' : completedHistoryMonths.length >= 2 ? 'Medium' : 'Low';

  const currentCats = current.filter((e) => e.type === 'expense').reduce<Map<string, { amount: number; count: number; largest: number }>>((map, e) => {
    const bucket = map.get(e.category) ?? { amount: 0, count: 0, largest: 0 };
    const amount = Number(e.amount);
    bucket.amount += amount;
    bucket.count += 1;
    bucket.largest = Math.max(bucket.largest, amount);
    map.set(e.category, bucket);
    return map;
  }, new Map());
  const previousCats = previous.filter((e) => e.type === 'expense').reduce<Map<string, number>>((map, e) => map.set(e.category, (map.get(e.category) ?? 0) + Number(e.amount)), new Map());
  const categoryChanges = [...new Set([...currentCats.keys(), ...previousCats.keys()])]
    .map((category) => ({ category, current: currentCats.get(category)?.amount ?? 0, previous: previousCats.get(category) ?? 0, change: (currentCats.get(category)?.amount ?? 0) - (previousCats.get(category) ?? 0) }))
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  const largestRise = categoryChanges.find((x) => x.change > 0);
  const largestDrop = categoryChanges.find((x) => x.change < 0);

  const recurringCandidateGroups = entries.filter((e) => e.type === 'expense' && isRecurringCandidate(e)).sort((a, b) => b.entryDate.localeCompare(a.entryDate)).reduce<Map<string, FinanceEntry[]>>((map, e) => {
    const key = `${lower(e.title)}|${lower(e.category)}`;
    map.set(key, [...(map.get(key) ?? []), e]);
    return map;
  }, new Map());
  const recurring = [...recurringCandidateGroups.values()].filter((group) => group.length >= 2).map((group) => ({ latest: group[0], previous: group[1], count: group.length }));
  const possibleRecurringSingles = [...recurringCandidateGroups.values()].filter((group) => group.length === 1).length;
  const recurringTotal = recurring.reduce((sumValue, group) => sumValue + Number(group.latest.amount), 0);
  const recurringChanges = recurring.filter((group) => Number(group.latest.amount) !== Number(group.previous.amount));
  const small = current.filter((e) => e.type === 'expense' && Number(e.amount) < 15);
  const smallTotal = small.reduce((s, e) => s + Number(e.amount), 0);

  const currentExpenseCount = current.filter((e) => e.type === 'expense').length;
  const previousExpenseCount = previous.filter((e) => e.type === 'expense').length;
  const spendChange = prevSpent > 0 ? ((spent - prevSpent) / prevSpent) * 100 : null;
  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : null;
  const savingsChange = prevSaved > 0 ? ((saved - prevSaved) / prevSaved) * 100 : null;
  const savingsProgress = goals.length ? Math.round(goals.reduce((s, g) => s + Math.min(1, g.targetCents > 0 ? g.currentCents / g.targetCents : 0), 0) / goals.length * 100) : null;
  const state = position < 0 ? 'Needs adjustment' : position < 250 ? 'Tight' : position > 1000 ? 'Comfortable' : 'Stable';
  const risk = position < 0 ? 'Needs attention' : income > 0 && recurringTotal / income > 0.45 ? 'Elevated' : spendChange !== null && spendChange > 25 ? 'Moderate' : 'Low';
  const comparisonConfidence: Confidence = currentExpenseCount >= 8 && previousExpenseCount >= 8 ? 'High' : currentExpenseCount >= 3 && previousExpenseCount >= 3 ? 'Medium' : 'Low';

  const signals: Signal[] = [
    spendChange === null
      ? { title: 'Spending comparison is still forming', detail: 'A useful prior-month expense baseline is not available yet.', kind: 'Watching', confidence: 'Low', evidence: [`${currentExpenseCount} current-month expense records`, `${previousExpenseCount} prior-month expense records`], domains: ['Spending', 'Cash'] }
      : { title: `Recorded spending is ${Math.abs(spendChange).toFixed(0)}% ${spendChange >= 0 ? 'higher' : 'lower'} than last month`, detail: spendChange > 0 && largestRise ? `${largestRise.category} is the largest upward category driver.` : spendChange < 0 && largestDrop ? `${largestDrop.category} is the largest downward category driver.` : 'The movement is spread across categories.', kind: spendChange > 20 ? 'Needs attention' : spendChange > 5 ? 'Worth reviewing' : spendChange < 0 ? 'Healthy' : 'Watching', confidence: comparisonConfidence, evidence: [`This month: ${money(spent)}`, `Last month: ${money(prevSpent)}`, `${currentExpenseCount} vs ${previousExpenseCount} expense records`], domains: ['Spending', 'Cash', 'Risk'] },
    recurringChanges.length
      ? { title: `${recurringChanges.length} repeated recurring-looking cost${recurringChanges.length === 1 ? ' has' : 's have'} changed`, detail: 'The latest amount differs from an earlier matching Finance entry.', kind: 'Worth reviewing', confidence: 'Medium', evidence: recurringChanges.slice(0, 5).map((g) => `${g.latest.title}: ${money(Number(g.previous.amount))} → ${money(Number(g.latest.amount))}`), domains: ['Spending', 'Risk', 'Opportunity'] }
      : recurring.length
        ? { title: 'No repeated recurring price change is detected', detail: 'Repeated recurring-looking records are stable where a prior match exists.', kind: 'Healthy', confidence: recurring.length >= 3 ? 'Medium' : 'Low', evidence: [`${recurring.length} repeated recurring-looking pattern${recurring.length === 1 ? '' : 's'} detected`], domains: ['Spending', 'Risk'] }
        : { title: 'Recurring-cost history is still forming', detail: 'Glow requires at least two matching entries before it calls something a recurring pattern.', kind: 'Watching', confidence: 'Low', evidence: [`${possibleRecurringSingles} one-off recurring-looking candidate${possibleRecurringSingles === 1 ? '' : 's'} not counted as recurring`], domains: ['Spending', 'Risk'] },
    goals.length
      ? { title: `Finance Goals average ${savingsProgress}% funded`, detail: 'This is average recorded progress, not a recommendation about which goal should come first.', kind: (savingsProgress ?? 0) >= 70 ? 'Healthy' : (savingsProgress ?? 0) >= 35 ? 'Worth reviewing' : 'Opportunity', confidence: 'High', evidence: [`${goals.length} Finance Goal${goals.length === 1 ? '' : 's'} recorded`], domains: ['Goals', 'Savings', 'Opportunity'] }
      : { title: 'No Finance Goals are recorded yet', detail: 'Goal intelligence becomes stronger after at least one target exists.', kind: 'Opportunity', confidence: 'High', evidence: ['Finance Goals: 0'], domains: ['Goals', 'Savings', 'Opportunity'] },
    small.length >= 6
      ? { title: 'Small-spending cluster detected', detail: `${small.length} purchases under $15 total ${money(smallTotal)} this month.`, kind: 'Worth reviewing', confidence: 'High', evidence: small.slice(0, 5).map((e) => `${e.entryDate} · ${e.title} · ${money(Number(e.amount))}`), domains: ['Spending', 'Opportunity'] }
      : { title: 'Small purchases are not a major signal right now', detail: `${small.length} recorded purchases under $15 this month.`, kind: 'Healthy', confidence: 'High', evidence: [`Under-$15 total: ${money(smallTotal)}`], domains: ['Spending'] },
  ];
  const lensSignals = memory.lens === 'All' ? signals : signals.filter((signal) => signal.domains.includes(memory.lens as SignalDomain));
  const rankedSignals = [...(lensSignals.length ? lensSignals : signals)].sort((a, b) => signalRank(a.kind) - signalRank(b.kind));

  const monthDays = daysInMonthKey(currentKey);
  const elapsed = Math.max(1, nowParts.day);
  const projectedSpend = spent / elapsed * monthDays;
  const projectedPosition = income - projectedSpend - saved - invested;
  const scenarioAfter = position - memory.scenarioAmount;

  const ask = (text: string) => openGlow(`${text} Use only my recorded Glow Finance data. Structure the answer as ANSWER, WHY, IMPACT, NEXT MOVE. Clearly label estimates, missing data, and confidence.`);
  const rememberDecision = (decision: string, why: string, expected: string) => setMemory((m) => ({ ...m, decisions: [...m.decisions, { date: generatedAt, decision, why, expected }].slice(-30) }));
  const addNote = (note: string) => setMemory((m) => ({ ...m, notes: [...m.notes, `${dateLabel(generatedAt)} · ${note}`].slice(-50) }));
  const chooseLens = (lens: Lens) => { setMemory((m) => ({ ...m, lens })); setTab(LENS_TABS[lens]); };

  return <div className="min-h-screen overflow-hidden rounded-[40px] bg-[radial-gradient(circle_at_18%_7%,rgba(146,151,181,.23),transparent_26%),radial-gradient(circle_at_79%_16%,rgba(220,194,144,.13),transparent_25%),radial-gradient(circle_at_53%_88%,rgba(124,157,145,.17),transparent_30%),linear-gradient(155deg,#171922_0%,#20232d_42%,#181b24_100%)] p-3 text-[#F5F2E9] sm:p-6">
    <header className="rounded-[34px] border border-white/10 bg-white/[.055] p-5 shadow-[0_34px_110px_rgba(0,0,0,.28)] backdrop-blur-2xl sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="text-[10px] uppercase tracking-[.34em] text-[#C9C2B3]">Financial Brain · Midnight Observatory</div><h1 className="mt-2 glow-display text-4xl sm:text-5xl">Understand your money, not just the numbers.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[#B9BBC4]">What changed, why it changed, how certain Glow is, what it affects, and which decision matters next.</p></div>
        <div className="flex gap-2"><button type="button" aria-pressed={memory.privacy} onClick={() => setMemory((m) => ({ ...m, privacy: !m.privacy }))} className="rounded-full border border-white/15 bg-white/[.06] px-4 py-2 text-xs">{memory.privacy ? <Eye className="mr-2 inline h-4 w-4"/> : <EyeOff className="mr-2 inline h-4 w-4"/>}{memory.privacy ? 'Show' : 'Hide'} amounts</button><Link href="/finance" className="rounded-full border border-white/15 bg-white/[.06] px-4 py-2 text-xs">Finance</Link></div>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">{TABS.map((item) => <button type="button" aria-pressed={tab === item} key={item} onClick={() => setTab(item)} className={`shrink-0 rounded-full px-4 py-2 text-[10px] capitalize ${tab === item ? 'bg-[#EEE7D6] text-[#252730]' : 'border border-white/10 bg-white/[.04] text-[#C6C7CC]'}`}>{item}</button>)}</div>
    </header>

    <div className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <Panel title="What matters now"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Recorded position" value={display(position)}/><Metric label="Money state" value={state}/><Metric label="Risk heuristic" value={risk}/><Metric label="History" value={`${completedHistoryMonths.length} completed month${completedHistoryMonths.length === 1 ? '' : 's'}`}/></div><div className="mt-5 rounded-[24px] border border-[#D1BD8C]/15 bg-[#D1BD8C]/[.055] p-4"><div className="text-[9px] uppercase tracking-[.2em] text-[#D5C59D]">Top signal · {memory.lens} lens</div><div className="mt-2 text-lg">{rankedSignals[0]?.title}</div><div className="mt-1 text-xs text-[#B7B8BF]">{rankedSignals[0]?.detail}</div><button type="button" onClick={() => rankedSignals[0] && setEvidence(rankedSignals[0])} className="mt-3 text-[11px] text-[#E3D6B5]">Show me why →</button></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => ask('What should I pay attention to financially right now?')} className="rounded-full bg-[#EEE7D6] px-4 py-2 text-xs font-medium text-[#242630]">What should I pay attention to?</button>{['What changed?','What looks unusual?','What can I improve?','What can I safely ignore?','What decision should I make?'].map((q) => <button type="button" key={q} onClick={() => ask(q)} className="rounded-full border border-white/12 bg-white/[.04] px-4 py-2 text-xs">{q}</button>)}</div></Panel>
      <Panel title="Money constellation"><div className="flex items-center gap-2 text-xs text-[#AAAEB8]"><Orbit className="h-4 w-4 text-[#D6C79F]"/>Current position connects to recorded money domains. Node glow is visual emphasis, not a score.</div><Constellation center={display(position)} income={income} spending={spent} savings={saved} goals={goals.length} recurring={recurring.length}/></Panel>
    </div>

    <section className="mt-4 rounded-[28px] border border-white/10 bg-white/[.045] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-[9px] uppercase tracking-[.22em] text-[#AAA79F]">Analysis controls</div><div className="mt-1 text-xs text-[#C7C8CD]">History changes calculations. Focus Lens changes the active intelligence area and top-signal emphasis.</div></div><div className="flex flex-wrap gap-2">{([3,6,12] as const).map((n) => <button type="button" aria-pressed={memory.months === n} key={n} onClick={() => setMemory((m) => ({ ...m, months: n }))} className={`rounded-full px-3 py-1.5 text-[10px] ${memory.months === n ? 'bg-[#D9D0B8] text-[#23252D]' : 'border border-white/10'}`}>{n} months</button>)}{LENSES.map((lens) => <button type="button" aria-pressed={memory.lens === lens} key={lens} onClick={() => chooseLens(lens)} className={`rounded-full px-3 py-1.5 text-[10px] ${memory.lens === lens ? 'bg-[#8FA89C]/55' : 'border border-white/10'}`}>{lens}</button>)}</div></div></section>

    {tab === 'now' ? <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><Panel title="Since last month"><ChangeRow label="Income" current={income} previous={prevIncome} hidden={memory.privacy}/><ChangeRow label="Spending" current={spent} previous={prevSpent} hidden={memory.privacy}/><ChangeRow label="Savings" current={saved} previous={prevSaved} hidden={memory.privacy}/><div className="mt-4 rounded-[20px] bg-white/[.04] p-4 text-sm text-[#C1C2C8]">{spendChange === null ? 'More prior-month data is needed to explain spending movement confidently.' : spendChange < 0 ? 'Recorded spending is lower than last month.' : largestRise ? `${largestRise.category} is the strongest upward category driver at +${display(largestRise.change)}.` : 'Spending changed without one dominant category.'}</div></Panel><Panel title="Safe to ignore">{signals.filter((s) => s.kind === 'Healthy').length ? signals.filter((s) => s.kind === 'Healthy').map((s) => <SignalCard key={s.title} signal={s} onEvidence={() => setEvidence(s)}/>) : <p className="text-sm text-[#B9BBC2]">No signal can be confidently marked safe to ignore yet.</p>}</Panel></div> : null}

    {tab === 'signals' ? <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_.8fr]"><Panel title={`Signal center · ${memory.lens}`}><div className="space-y-3">{rankedSignals.map((s, i) => <div key={s.title} className="rounded-[22px] border border-white/8 bg-white/[.04] p-4"><div className="text-[9px] uppercase tracking-[.16em] text-[#CBBD9F]">#{i + 1} · {s.kind} · {s.confidence} confidence</div><div className="mt-1 text-sm font-medium">{s.title}</div><div className="mt-1 text-xs text-[#B7B8BF]">{s.detail}</div><button type="button" onClick={() => setEvidence(s)} className="mt-3 text-[11px] text-[#DECFA8]">Show evidence</button></div>)}</div></Panel><Panel title="Change drivers"><div className="space-y-2">{categoryChanges.length ? categoryChanges.slice(0, 8).map((c) => <div key={c.category} className="flex items-center justify-between rounded-[18px] bg-white/[.04] p-3"><div><div className="text-sm capitalize">{c.category}</div><div className="text-[10px] text-[#9FA0A8]">{memory.privacy ? '••••' : `${money(c.previous)} → ${money(c.current)}`}</div></div><div className={c.change > 0 ? 'text-xs text-[#D8B792]' : 'text-xs text-[#A9C6B5]'}>{c.change >= 0 ? '+' : ''}{memory.privacy ? '••••' : money(c.change)}</div></div>) : <p className="text-sm text-[#AAAAB1]">No comparable categories yet.</p>}</div><Link href="/finance#finance-manager" className="mt-4 inline-flex items-center gap-1 text-[11px] text-[#DECFA8]">Show transactions <ArrowRight className="h-3 w-3"/></Link></Panel></div> : null}

    {tab === 'decisions' ? <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel title="Decision queue"><Decision title="Review recurring costs" detail={recurring.length ? `${recurring.length} repeated recurring-looking patterns · ${display(recurringTotal)} latest recorded total` : 'No repeated recurring-looking pattern is established yet.'} onDecide={() => rememberDecision('Review recurring costs','Repeated recurring-looking costs deserve a value check.','Keep only costs that still feel worthwhile.')}/><Decision title="Increase savings?" detail={`Current savings ${display(saved)} · completed-history average ${display(savingsAvg)}`} onDecide={() => rememberDecision('Review savings contribution','Compare current savings with completed recorded months.','Choose a contribution that does not rely on unrecorded income.')}/><Decision title="Delay a purchase?" detail="Use Scenario Lab to compare buy now, wait, and save-first." onDecide={() => setTab('scenarios')}/></Panel><Panel title="Decision memory">{memory.decisions.length ? memory.decisions.slice().reverse().slice(0, 8).map((d, i) => <div key={`${d.date}-${i}`} className="mb-2 rounded-[18px] bg-white/[.04] p-3"><div className="text-[9px] text-[#A7A5A0]">{dateLabel(d.date)}</div><div className="mt-1 text-sm">{d.decision}</div><div className="mt-1 text-xs text-[#ADAEB5]">Why: {d.why}</div><div className="mt-1 text-xs text-[#ADAEB5]">Expected: {d.expected}</div></div>) : <p className="text-sm text-[#AAAAB1]">No Financial Brain decisions saved yet.</p>}</Panel></div> : null}

    {tab === 'scenarios' ? <div className="mt-4"><Panel title="Scenario Lab"><div className="grid gap-4 lg:grid-cols-[.7fr_1.3fr]"><div><label className="text-[10px] uppercase tracking-[.18em] text-[#B4B0A7]">Scenario amount</label><input type="number" min={0} max={1000000} value={memory.scenarioAmount} onChange={(e) => { const next = Math.max(0, Math.min(1_000_000, Number(e.target.value) || 0)); setMemory((m) => ({ ...m, scenarioAmount: next })); }} className="mt-2 w-full rounded-[18px] border border-white/10 bg-white/[.06] px-4 py-3 text-lg outline-none"/><p className="mt-2 text-xs text-[#9FA0A8]">Uses current recorded position only. It is not a live bank-balance forecast.</p></div><div className="grid gap-3 md:grid-cols-3"><Path title="Buy now" value={display(scenarioAfter)} detail={scenarioAfter < 0 ? 'Recorded position would turn negative' : 'Recorded position would remain positive'}/><Path title="Wait" value={display(position)} detail="No ledger change is assumed until a future event is recorded"/><Path title="Save first" value={memory.scenarioAmount > 0 ? `${money(memory.scenarioAmount / 4)}/wk × 4` : '$0'} detail="Illustrative four-week path, not a scheduled transfer"/></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => ask(`What happens if I spend ${money(memory.scenarioAmount)}? Compare buy now, wait, and save-first.`)} className="rounded-full bg-[#EEE7D6] px-4 py-2 text-xs text-[#242630]">Ask Financial Brain</button><button type="button" onClick={() => rememberDecision(`Scenario: ${money(memory.scenarioAmount)} purchase`,'Compared buy-now, wait, and save-first paths.','Reassess after the next recorded income or savings change.')} className="rounded-full border border-white/12 px-4 py-2 text-xs">Save scenario decision</button></div></Panel></div> : null}

    {tab === 'patterns' ? <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel title="Category fingerprints">{[...currentCats.entries()].sort((a,b) => b[1].amount - a[1].amount).slice(0,8).map(([category,bucket]) => { const records = history.filter((e) => e.type === 'expense' && e.category === category).map((e) => Number(e.amount)); const lo = records.length ? Math.min(...records) : 0; const hi = records.length ? Math.max(...records) : 0; return <div key={category} className="mb-2 rounded-[20px] bg-white/[.04] p-4"><div className="flex justify-between"><span className="capitalize">{category}</span><span>{display(bucket.amount)}</span></div><div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-[#A8A9B0]"><span>{bucket.count} purchase{bucket.count === 1 ? '' : 's'}</span><span>largest {display(bucket.largest)}</span><span>{records.length} lens records</span></div><div className="mt-2 text-xs text-[#B9BBC1]">Recorded transaction range: {display(lo)}–{display(hi)}. This is not a budget range.</div></div>; })}</Panel><Panel title="Income reliability"><IncomeReliability entries={history.filter((e) => e.type === 'income')} hidden={memory.privacy}/><p className="mt-4 text-[10px] leading-4 text-[#92949C]">Reliability labels use recurrence and amount variation in recorded entries only. They do not guarantee future income.</p></Panel></div> : null}

    {tab === 'goals' ? <div className="mt-4"><Panel title="Savings Goal Brain"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{goals.length ? goals.map((goal) => <GoalCard key={goal.id} goal={goal} currentMonthKey={currentKey} savingsAvg={savingsAvg} hidden={memory.privacy}/>) : <p className="text-sm text-[#AAAAB1]">No Finance Goals recorded yet. Use the goal form below the observatory.</p>}</div>{goals.length > 1 ? <div className="mt-5 rounded-[22px] border border-[#D4B47D]/15 bg-[#D4B47D]/[.05] p-4 text-sm text-[#C7C5BF]">Glow will not claim your goals compete for a specific monthly amount until dedicated contribution plans exist.</div> : null}</Panel></div> : null}

    {tab === 'forecast' ? <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_.9fr]"><Panel title="Month-end pace outlook"><div className="grid gap-3 sm:grid-cols-3"><Metric label="Current recorded position" value={display(position)}/><Metric label="Projected month spending" value={display(projectedSpend)}/><Metric label="Projected recorded position" value={display(projectedPosition)}/></div><div className="mt-4 rounded-[20px] bg-white/[.04] p-4 text-xs leading-5 text-[#B8BAC1]">Estimate extends only this month’s observed spending pace through the end of the current New York calendar month. It holds current recorded income, savings and investments constant. Unknown bills, future purchases, bank changes and unrecorded income are excluded.</div></Panel><Panel title="What could change this?"><Sensitivity label="Income $200 lower" value={display(projectedPosition - 200)}/><Sensitivity label="Spending $100 lower" value={display(projectedPosition + 100)}/><Sensitivity label={`Purchase ${money(memory.scenarioAmount)}`} value={display(projectedPosition - memory.scenarioAmount)}/><div className="mt-3 text-[10px] text-[#989AA2]">History confidence: {historyConfidence}. Based on {completedHistoryMonths.length} completed recorded month{completedHistoryMonths.length === 1 ? '' : 's'} in the selected history window.</div></Panel></div> : null}

    {tab === 'risk' ? <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel title="Financial stability map"><Stability label="Cash flow" value={position >= 0 ? 'Stable' : 'Under pressure'} detail={`${display(position)} recorded position`}/><Stability label="Buffer heuristic" value={position > 1000 ? 'Strong' : position > 250 ? 'Moderate' : 'Thin'} detail="Uses recorded position, not live bank cash"/><Stability label="Savings" value={saved >= savingsAvg && saved > 0 ? 'Building' : saved > 0 ? 'Present' : 'Not recorded'} detail={`${display(saved)} this month`}/><Stability label="Repeated-cost load" value={income > 0 && recurringTotal / income > .45 ? 'High' : income > 0 && recurring.length ? 'Moderate' : 'Unknown'} detail={recurring.length ? `${display(recurringTotal)} latest total across repeated recurring-looking patterns` : 'No repeated recurring-looking pattern established'}/></Panel><Panel title="Pressure + unknowns"><Metric label="Current risk heuristic" value={risk}/><ul className="mt-4 space-y-2 text-xs text-[#B8BAC0]"><li>• No live account balance is available.</li><li>• No dedicated future-bills table is available.</li><li>• Recurring patterns require at least two matching records.</li><li>• Future income is not assumed.</li><li>• Risk labels are decision-support heuristics, not financial-health scores.</li></ul></Panel></div> : null}

    {tab === 'opportunities' ? <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel title="Opportunities"><Opportunity title="Review recurring costs" value={recurring.length ? `${display(recurringTotal)} latest repeated-pattern total` : 'Need repeated records'} detail="Financial impact only. Usage/value is unknown unless you tell Glow."/><Opportunity title="Capture under-spend if it remains" value={expenseAvg > 0 && projectedSpend < expenseAvg ? display(expenseAvg - projectedSpend) : 'Not currently indicated'} detail="Projected month spending compared with completed months in the selected history window."/><Opportunity title="Strengthen savings pace" value={savingsAvg ? `${display(savingsAvg)} completed-month average` : 'Need more savings history'} detail="Compare current savings with completed recorded months before changing contributions."/><Opportunity title="Review small-spend cluster" value={small.length >= 6 ? display(smallTotal) : 'No major cluster'} detail={`${small.length} purchases under $15 this month.`}/></Panel><Panel title="Working well">{signals.filter((s) => s.kind === 'Healthy').length ? signals.filter((s) => s.kind === 'Healthy').map((s) => <SignalCard key={s.title} signal={s} onEvidence={() => setEvidence(s)}/>) : <p className="text-sm text-[#AAAAB1]">Glow does not have enough stable evidence to call out a strength yet.</p>}</Panel></div> : null}

    {tab === 'reviews' ? <div className="mt-4 grid gap-4 lg:grid-cols-2"><Panel title="Month story"><div className="text-lg">{new Intl.DateTimeFormat('en-US',{month:'long',timeZone:TZ}).format(now)} money story</div><div className="mt-4 space-y-2 text-sm leading-6 text-[#BEC0C6]"><p>{incomeChange === null ? 'Income comparison needs a prior-month baseline.' : `Recorded income is ${Math.abs(incomeChange).toFixed(0)}% ${incomeChange >= 0 ? 'higher' : 'lower'} than last month.`}</p><p>{spendChange === null ? 'Spending comparison needs more history.' : `Recorded spending is ${Math.abs(spendChange).toFixed(0)}% ${spendChange >= 0 ? 'higher' : 'lower'} than last month.`}</p><p>{savingsChange === null ? 'Savings comparison needs a prior-month baseline.' : `Recorded savings are ${Math.abs(savingsChange).toFixed(0)}% ${savingsChange >= 0 ? 'higher' : 'lower'} than last month.`}</p>{largestRise ? <p>Largest upward category movement: <span className="capitalize">{largestRise.category}</span> {display(largestRise.change)}.</p> : null}{largestDrop ? <p>Largest downward category movement: <span className="capitalize">{largestDrop.category}</span> {display(Math.abs(largestDrop.change))}.</p> : null}</div></Panel><Panel title="Weekly / monthly ritual"><div className="space-y-2">{['Review new transactions','Review strongest signal','Check repeated recurring-cost changes','Review Finance Goals','Run one scenario','Save one decision or context note'].map((item,i) => <div key={item} className="flex gap-3 rounded-[18px] bg-white/[.04] p-3 text-sm"><span className="text-[#CDBD96]">{i+1}</span><span>{item}</span></div>)}</div><button type="button" onClick={() => addNote('Completed Financial Brain review')} className="mt-4 rounded-full bg-[#EEE7D6] px-4 py-2 text-xs text-[#242630]">Complete review</button></Panel></div> : null}

    {tab === 'memory' ? <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_.8fr]"><Panel title="Money Memory"><div className="space-y-2">{[...memory.notes, ...memory.decisions.map((d) => `${dateLabel(d.date)} · ${d.decision} — ${d.why}`)].length ? [...memory.notes, ...memory.decisions.map((d) => `${dateLabel(d.date)} · ${d.decision} — ${d.why}`)].slice().reverse().slice(0,20).map((item,i) => <div key={`${item}-${i}`} className="rounded-[18px] bg-white/[.04] p-3 text-sm text-[#C0C1C7]">{item}</div>) : <p className="text-sm text-[#AAAAB1]">No Financial Brain memory yet.</p>}</div></Panel><Panel title="Add context"><p className="text-xs leading-5 text-[#AAAAB1]">Context stays as local Financial Brain memory on this browser and does not alter the server-backed ledger.</p><div className="mt-4 flex flex-wrap gap-2">{['Started low-spend period','Unexpected expense happened','A savings goal became priority','Delayed a purchase','Income situation changed'].map((item) => <button type="button" key={item} onClick={() => addNote(item)} className="rounded-full border border-white/12 px-3 py-2 text-xs">{item}</button>)}</div></Panel></div> : null}

    <section className="mt-4 rounded-[30px] border border-white/10 bg-white/[.055] p-5"><div className="flex items-center gap-2"><Brain className="h-4 w-4 text-[#D5C49A]"/><div className="text-[10px] uppercase tracking-[.22em] text-[#C8BEA8]">Ask Financial Brain</div></div><div className="mt-4 flex flex-wrap gap-2">{['Why is this month tighter?','What can I cut without affecting my priorities?','Which goal should I fund first?','What happens if I spend $500?','How do I make next month easier?'].map((q) => <button type="button" key={q} onClick={() => ask(q)} className="rounded-full border border-white/12 bg-white/[.04] px-4 py-2 text-xs">{q}</button>)}</div><p className="mt-3 text-[10px] text-[#8F9199]">Questions open the universal Glow conversation so follow-ups can continue naturally. Financial Brain requests recorded Finance evidence and explicit uncertainty.</p></section>

    {evidence ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-3 sm:items-center" onMouseDown={(event) => { if (event.target === event.currentTarget) setEvidence(null); }}><div role="dialog" aria-modal="true" aria-label="Financial evidence" className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-[30px] border border-white/15 bg-[#20232D] p-5 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><div className="text-[9px] uppercase tracking-[.18em] text-[#CDBD98]">Evidence · {evidence.confidence} confidence</div><div className="mt-2 text-xl">{evidence.title}</div><div className="mt-1 text-sm text-[#B4B5BC]">{evidence.detail}</div></div><button type="button" onClick={() => setEvidence(null)} className="rounded-full border border-white/10 px-3 py-1.5 text-xs">Close</button></div><div className="mt-5 space-y-2">{evidence.evidence.map((item,i) => <div key={`${item}-${i}`} className="rounded-[18px] bg-white/[.045] p-3 text-sm text-[#C7C8CD]">{item}</div>)}</div><div className="mt-4 flex flex-wrap gap-2"><Link href="/finance#finance-manager" className="rounded-full bg-[#EEE7D6] px-4 py-2 text-xs text-[#242630]">See Finance records</Link><button type="button" onClick={() => ask(`Explain this Financial Brain signal: ${evidence.title}. Evidence: ${evidence.evidence.join('; ')}`)} className="rounded-full border border-white/12 px-4 py-2 text-xs">Ask about this</button></div></div></div> : null}
  </div>;
}

function signalRank(kind: SignalKind) {
  return ({ 'Needs attention': 0, 'Worth reviewing': 1, Opportunity: 2, Watching: 3, Healthy: 4 } as const)[kind];
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[30px] border border-white/10 bg-white/[.055] p-5 backdrop-blur-xl"><div className="mb-4 text-[10px] uppercase tracking-[.22em] text-[#C8BEA8]">{title}</div>{children}</section>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[20px] border border-white/8 bg-white/[.045] p-4"><div className="text-[9px] uppercase tracking-[.16em] text-[#9FA0A8]">{label}</div><div className="mt-2 text-lg font-medium">{value}</div></div>;
}

function SignalCard({ signal, onEvidence }: { signal: Signal; onEvidence: () => void }) {
  return <div className="mb-2 rounded-[20px] bg-white/[.04] p-4"><div className="text-[9px] uppercase tracking-[.16em] text-[#C5B790]">{signal.kind} · {signal.confidence}</div><div className="mt-1 text-sm">{signal.title}</div><div className="mt-1 text-xs text-[#ADAEB5]">{signal.detail}</div><button type="button" onClick={onEvidence} className="mt-2 text-[10px] text-[#DECFA8]">Show why</button></div>;
}

function ChangeRow({ label, current, previous, hidden }: { label: string; current: number; previous: number; hidden: boolean }) {
  const change = current - previous;
  return <div className="mb-2 grid gap-2 rounded-[18px] bg-white/[.04] p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-3"><span className="text-sm">{label}</span><span className="text-xs text-[#AAAAB1]">{hidden ? '••••' : money(previous)} → {hidden ? '••••' : money(current)}</span><span className={change >= 0 ? 'text-xs text-[#D6B78F]' : 'text-xs text-[#A7C2B2]'}>{change >= 0 ? '+' : ''}{hidden ? '••••' : money(change)}</span></div>;
}

function Decision({ title, detail, onDecide }: { title: string; detail: string; onDecide: () => void }) {
  return <div className="mb-3 rounded-[20px] bg-white/[.04] p-4"><div className="text-sm font-medium">{title}</div><div className="mt-1 text-xs text-[#ADAEB5]">{detail}</div><button type="button" onClick={onDecide} className="mt-3 rounded-full border border-white/12 px-3 py-1.5 text-[10px]">Decide now</button></div>;
}

function Path({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[.045] p-4"><div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[#D1BC8B]/60 to-[#8EAA9C]/20"/><div className="text-[9px] uppercase tracking-[.18em] text-[#C9B98E]">{title}</div><div className="mt-3 text-2xl">{value}</div><div className="mt-2 text-xs leading-5 text-[#AAAAB1]">{detail}</div></div>;
}

function Sensitivity({ label, value }: { label: string; value: string }) {
  return <div className="mb-2 flex items-center justify-between gap-4 rounded-[18px] bg-white/[.04] p-3"><span className="text-xs text-[#B5B6BD]">{label}</span><span className="text-sm">{value}</span></div>;
}

function Stability({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="mb-2 grid grid-cols-[1fr_auto] gap-3 rounded-[20px] bg-white/[.04] p-4"><div><div className="text-[9px] uppercase tracking-[.16em] text-[#9FA0A8]">{label}</div><div className="mt-1 text-xs text-[#ADAEB5]">{detail}</div></div><div className="text-sm">{value}</div></div>;
}

function Opportunity({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="mb-2 rounded-[20px] border border-[#91AD9E]/12 bg-[#91AD9E]/[.055] p-4"><div className="text-[9px] uppercase tracking-[.16em] text-[#A8C0B3]">Opportunity</div><div className="mt-1 text-sm">{title}</div><div className="mt-2 text-lg">{value}</div><div className="mt-1 text-xs text-[#AEB0B6]">{detail}</div></div>;
}

function GoalCard({ goal, currentMonthKey, savingsAvg, hidden }: { goal: FinanceGoal; currentMonthKey: string; savingsAvg: number; hidden: boolean }) {
  const target = goal.targetCents / 100;
  const current = goal.currentCents / 100;
  const remaining = Math.max(0, target - current);
  const pct = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0;
  const targetKey = goal.targetDate ? (typeof goal.targetDate === 'string' ? goal.targetDate.slice(0, 7) : `${goal.targetDate.getUTCFullYear()}-${String(goal.targetDate.getUTCMonth() + 1).padStart(2, '0')}`) : null;
  const months = targetKey ? monthDistance(currentMonthKey, targetKey) : null;
  const required = months !== null && months > 0 ? remaining / months : null;
  const pastDue = targetKey !== null && months !== null && months <= 0 && remaining > 0;
  return <div className="rounded-[22px] bg-white/[.04] p-4"><div className="flex justify-between gap-3"><div className="font-medium">{goal.name}</div><div>{pct}%</div></div><div className="mt-2 text-xs text-[#ADAEB5]">{hidden ? '••••' : money(current)} of {hidden ? '••••' : money(target)}</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#9CB5A8]" style={{ width: `${pct}%` }}/></div><div className="mt-3 space-y-1 text-[10px] text-[#9FA0A8]">{pastDue ? <div>Target date is current/past while money remains.</div> : null}{required !== null ? <div>Required average pace: {hidden ? '••••' : money(required)}/month</div> : null}<div>Completed-month savings average: {hidden ? '••••' : money(savingsAvg)}/month</div>{required !== null && savingsAvg > 0 ? <div>{required > savingsAvg ? `Gap: ${hidden ? '••••' : money(required - savingsAvg)}/month` : 'Recent recorded savings pace meets or exceeds this illustrative pace.'}</div> : null}{required !== null && savingsAvg === 0 ? <div>Not enough completed savings history to compare pace.</div> : null}</div></div>;
}

function monthDistance(fromKey: string, toKey: string) {
  const [fromYear, fromMonth] = fromKey.split('-').map(Number);
  const [toYear, toMonth] = toKey.split('-').map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth);
}

function IncomeReliability({ entries, hidden }: { entries: FinanceEntry[]; hidden: boolean }) {
  const groups = [...entries.reduce<Map<string, FinanceEntry[]>>((map, e) => { const key = lower(e.title) || 'income'; map.set(key, [...(map.get(key) ?? []), e]); return map; }, new Map()).entries()];
  if (!groups.length) return <p className="text-sm text-[#AAAAB1]">No income history in this lens.</p>;
  return <div className="space-y-2">{groups.slice(0,8).map(([key,list]) => {
    const values = list.map((e) => Number(e.amount));
    const avg = values.reduce((s,v) => s + v, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const variation = avg > 0 ? (max - min) / avg : 1;
    const label = list.length >= 4 && variation < .15 ? 'Consistent' : list.length >= 3 ? 'Variable' : list.length === 2 ? 'Occasional' : 'Unknown';
    const confidence: Confidence = list.length >= 6 ? 'High' : list.length >= 3 ? 'Medium' : 'Low';
    return <div key={key} className="rounded-[20px] bg-white/[.04] p-4"><div className="flex justify-between gap-3"><div>{list[0].title}</div><div className="text-xs">{label}</div></div><div className="mt-2 text-[10px] text-[#A7A8AF]">Average {hidden ? '••••' : money(avg)} · range {hidden ? '••••' : `${money(min)}–${money(max)}`} · {list.length} records · {confidence} confidence</div></div>;
  })}</div>;
}

function Constellation({ center, income, spending, savings, goals, recurring }: { center: string; income: number; spending: number; savings: number; goals: number; recurring: number }) {
  const nodes = [
    { name: 'Income', value: income, x: 18, y: 22 },
    { name: 'Spending', value: spending, x: 76, y: 24 },
    { name: 'Savings', value: savings, x: 20, y: 72 },
    { name: 'Goals', value: goals * 100, x: 74, y: 73 },
    { name: 'Recurring', value: recurring * 100, x: 50, y: 12 },
  ];
  return <div className="relative mt-4 h-64 overflow-hidden rounded-[26px] border border-white/10 bg-[#11131A]/45"><div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#D5C69E]/25 bg-[#D5C69E]/10 px-5 py-4 text-center shadow-[0_0_50px_rgba(211,196,154,.12)]"><div className="text-[8px] uppercase tracking-[.18em] text-[#C9B98D]">Current position</div><div className="mt-1 text-sm">{center}</div></div>{nodes.map((node) => <div key={node.name} className="absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[.055] px-3 py-2 text-center" style={{ left: `${node.x}%`, top: `${node.y}%`, boxShadow: `0 0 ${Math.min(42, 14 + Math.log10(Math.max(1, node.value)) * 7)}px rgba(161,187,177,.12)` }}><div className="text-[8px] text-[#AEB0B8]">{node.name}</div></div>)}<svg aria-hidden="true" className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">{nodes.map((node) => <line key={node.name} x1="50" y1="50" x2={node.x} y2={node.y} stroke="rgba(210,201,177,.16)" strokeWidth=".45"/>)}</svg></div>;
}
