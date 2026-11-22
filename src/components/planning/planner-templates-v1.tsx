'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Archive, BarChart3, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { routePlannerCaptureAction, savePlannerTemplateAction } from '@/app/actions/planner-templates-v1';
import {
  emptyPlannerDocument,
  monthCalendarDays,
  movePlannerKey,
  plannerKeyForDate,
  plannerLabel,
  type PlannerDocumentData,
  type PlannerDocumentRecord,
  type PlannerRouteView,
  type PlannerValue,
  type PlannerView,
} from '@/lib/planning/planner-templates-v1';

type Props = {
  routeView: PlannerRouteView;
  initialDocuments: PlannerDocumentRecord[];
  initialKey?: string;
};

const plannerNav: Array<{ view: PlannerRouteView; label: string }> = [
  { view: 'today', label: 'Today' },
  { view: 'tomorrow', label: 'Tomorrow' },
  { view: 'week', label: 'Week Ahead' },
  { view: 'month', label: 'This Month' },
  { view: 'archive', label: 'Archive' },
  { view: 'insights', label: 'Insights' },
];

const card = 'rounded-[28px] border border-[#ECECEC] bg-white p-5 shadow-[0_18px_55px_rgba(40,32,35,0.045)] sm:p-6';
const inputClass = 'w-full rounded-2xl border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-3 text-[14px] text-[#1C1C1E] outline-none transition focus:border-[#B86F7D] focus:bg-white focus:ring-2 focus:ring-[#F8EFF1]';
const labelClass = 'mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6E6E73]';

export function PlannerTemplatesV1({ routeView, initialDocuments, initialKey }: Props) {
  if (routeView === 'archive') return <PlannerArchive documents={initialDocuments} />;
  if (routeView === 'insights') return <PlannerInsights documents={initialDocuments} />;
  return <PlannerEditor view={routeView} initialDocuments={initialDocuments} initialKey={initialKey} />;
}

function PlannerShell({ active, children }: { active: PlannerRouteView; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-8 text-[#1C1C1E] sm:px-7 lg:px-10 lg:pt-12">
      <header className="mb-8">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#B86F7D]">Plan · Planner Templates V1</div>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-[36px] leading-[1.05] tracking-[-0.035em] sm:text-[44px]">Your living planner</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-6 text-[#6E6E73]">
              Type naturally. Glow preserves what you wrote, autosaves it, and keeps each day, week, and month available to look back on.
            </p>
          </div>
          <nav aria-label="Planner views" className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-[#ECECEC] bg-[#FAFAFA] p-1">
            {plannerNav.map((item) => (
              <Link
                key={item.view}
                href={`/planning/planner/${item.view}`}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] font-medium transition ${active === item.view ? 'bg-white text-[#1C1C1E] shadow-sm' : 'text-[#6E6E73] hover:text-[#1C1C1E]'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}

function PlannerEditor({ view, initialDocuments, initialKey }: { view: PlannerView; initialDocuments: PlannerDocumentRecord[]; initialKey?: string }) {
  const [periodKey, setPeriodKey] = useState(() => initialKey || plannerKeyForDate(view));
  const initialForKey = useMemo(
    () => initialDocuments.find((doc) => doc.view === view && doc.periodKey === periodKey)?.data ?? emptyPlannerDocument(view, periodKey),
    [initialDocuments, periodKey, view],
  );
  const [data, setData] = useState<PlannerDocumentData>(initialForKey);
  const [revision, setRevision] = useState(0);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'error'>('saved');
  const [routeMessage, setRouteMessage] = useState('');
  const [isRouting, startRouting] = useTransition();
  const activeSave = useRef(0);

  useEffect(() => {
    const next = initialDocuments.find((doc) => doc.view === view && doc.periodKey === periodKey)?.data ?? emptyPlannerDocument(view, periodKey);
    setData(next);
    setRevision(0);
    setSaveState('saved');
    setRouteMessage('');
  }, [initialDocuments, periodKey, view]);

  useEffect(() => {
    if (!revision) return;
    const saveNumber = ++activeSave.current;
    setSaveState('saving');
    const timer = window.setTimeout(() => {
      void savePlannerTemplateAction({ view, periodKey, data }).then((result) => {
        if (saveNumber !== activeSave.current) return;
        setSaveState(result.ok ? 'saved' : 'error');
      }).catch(() => {
        if (saveNumber === activeSave.current) setSaveState('error');
      });
    }, 850);
    return () => window.clearTimeout(timer);
  }, [data, periodKey, revision, view]);

  function setValue(key: string, value: PlannerValue) {
    setData((current) => ({ ...current, periodKey, values: { ...current.values, [key]: value } }));
    setRevision((value) => value + 1);
  }

  function text(key: string) {
    const value = data.values[key];
    return typeof value === 'string' ? value : '';
  }

  function checked(key: string) {
    return data.values[key] === true;
  }

  function changePeriod(delta: number) {
    setPeriodKey((key) => movePlannerKey(view, key, delta));
  }

  function routeCapture() {
    const capture = text('inbox').trim();
    if (!capture) {
      setRouteMessage('Add something to the capture box first.');
      return;
    }
    startRouting(async () => {
      const result = await routePlannerCaptureAction({ view, periodKey, text: capture });
      setRouteMessage(result.message);
    });
  }

  const bindings = { text, checked, setValue };

  return (
    <PlannerShell active={view}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-[#ECECEC] bg-[#FAFAFA] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <button aria-label="Previous period" onClick={() => changePeriod(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"><ChevronLeft size={17} /></button>
          <div className="min-w-[210px] px-2 text-center">
            <div className="text-[13px] font-semibold">{plannerLabel(view, periodKey)}</div>
            <div className="mt-0.5 text-[11px] text-[#6E6E73]">{periodKey}</div>
          </div>
          <button aria-label="Next period" onClick={() => changePeriod(1)} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm"><ChevronRight size={17} /></button>
        </div>
        <div aria-live="polite" className={`text-[12px] ${saveState === 'error' ? 'text-red-700' : 'text-[#6E6E73]'}`}>
          {saveState === 'saving' ? 'Saving…' : saveState === 'error' ? 'Autosave needs attention' : 'All changes saved'}
        </div>
      </div>

      {view === 'today' && <TodayPlanner {...bindings} routeCapture={routeCapture} routeMessage={routeMessage} isRouting={isRouting} />}
      {view === 'tomorrow' && <TomorrowPlanner {...bindings} />}
      {view === 'week' && <WeekPlanner {...bindings} />}
      {view === 'month' && <MonthPlanner {...bindings} periodKey={periodKey} />}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[#ECECEC] pt-5 text-[12px] text-[#6E6E73]">
        <span>Your original planner entry stays attached to this period. Glow routes actions through review instead of silently rewriting your words.</span>
        <Link href="/planning/planner/archive" className="font-semibold text-[#B86F7D]">Look back in Archive →</Link>
      </div>
    </PlannerShell>
  );
}

type Bindings = {
  text: (key: string) => string;
  checked: (key: string) => boolean;
  setValue: (key: string, value: PlannerValue) => void;
};

function Section({ title, hint, children, className = '' }: { title: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`${card} ${className}`}>
      <div className="mb-5">
        <h2 className="text-[17px] font-semibold tracking-[-0.01em]">{title}</h2>
        {hint ? <p className="mt-1 text-[12px] leading-5 text-[#6E6E73]">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function TextField({ id, label, value, onChange, placeholder = '', multiline = false }: { id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <label htmlFor={id} className="block">
      <span className={labelClass}>{label}</span>
      {multiline
        ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className={`${inputClass} resize-y leading-6`} />
        : <input id={id} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClass} />}
    </label>
  );
}

function SelectField({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label htmlFor={id} className="block">
      <span className={labelClass}>{label}</span>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass}>
        <option value="">Choose…</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function CheckLine({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#ECECEC] bg-[#FAFAFA] px-4 py-3 text-[13px]">
      <input id={id} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#B86F7D]" />
      <span>{label}</span>
    </label>
  );
}

function PriorityRows({ prefix, count, bindings }: { prefix: string; count: number; bindings: Bindings }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, index) => {
        const key = `${prefix}${index + 1}`;
        return (
          <div key={key} className="flex items-center gap-3">
            <button type="button" aria-label={`Mark priority ${index + 1} complete`} onClick={() => bindings.setValue(`${key}Done`, !bindings.checked(`${key}Done`))} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${bindings.checked(`${key}Done`) ? 'border-[#B86F7D] bg-[#F8EFF1] text-[#B86F7D]' : 'border-[#E2E2E2] bg-white text-transparent'}`}><Check size={16} /></button>
            <input value={bindings.text(key)} onChange={(event) => bindings.setValue(key, event.target.value)} placeholder={`${index + 1}.`} className={inputClass} />
          </div>
        );
      })}
    </div>
  );
}

function Energy({ value, onChange, label = 'Energy' }: { value: string; onChange: (value: string) => void; label?: string }) {
  return <SelectField id={`${label}-energy`} label={label} value={value} onChange={onChange} options={['Recovery', 'Low', 'Normal', 'High']} />;
}

function TodayPlanner(bindings: Bindings & { routeCapture: () => void; routeMessage: string; isRouting: boolean }) {
  const lifeAreas = ['Physical', 'Mental', 'Work', 'Home', 'Finance', 'Relationships', 'Personal'];
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Section title="Today" hint="Your three priorities, focus, and actual energy." className="xl:col-span-7">
        <div className="grid gap-5 md:grid-cols-[1.5fr_.7fr]">
          <TextField id="today-focus" label="Today’s focus" value={bindings.text('focus')} onChange={(value) => bindings.setValue('focus', value)} placeholder="What matters most today?" />
          <Energy label="Energy today" value={bindings.text('energy')} onChange={(value) => bindings.setValue('energy', value)} />
        </div>
        <div className="mt-6"><span className={labelClass}>Top 3 priorities</span><PriorityRows prefix="priority" count={3} bindings={bindings} /></div>
      </Section>

      <Section title="Capture Inbox" hint="Write it exactly as it comes to you. Your raw text autosaves first." className="xl:col-span-5">
        <TextField id="capture-inbox" label="Brain dump / capture" value={bindings.text('inbox')} onChange={(value) => bindings.setValue('inbox', value)} multiline placeholder="Anything on your mind…" />
        <button type="button" onClick={bindings.routeCapture} disabled={bindings.isRouting} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1C1C1E] px-5 text-[13px] font-semibold text-white disabled:opacity-50"><Sparkles size={15} /> {bindings.isRouting ? 'Glow is reading…' : 'Route with Glow'}</button>
        {bindings.routeMessage ? <p aria-live="polite" className="mt-3 text-[12px] leading-5 text-[#6E6E73]">{bindings.routeMessage}</p> : null}
      </Section>

      <Section title="Actionable Plan" hint="Keep the plan concrete: task, next action, when, and calendar." className="xl:col-span-12"><Matrix columns={['Task', 'Next action', 'When', 'Calendar']} rows={4} prefix="actionPlan" bindings={bindings} /></Section>
      <Section title="Follow-up / Waiting On" className="xl:col-span-5"><Matrix columns={['What', 'Follow up']} rows={4} prefix="waiting" bindings={bindings} /></Section>
      <Section title="Notes" className="xl:col-span-4"><TextField id="today-notes" label="Notes" value={bindings.text('notes')} onChange={(value) => bindings.setValue('notes', value)} multiline /></Section>
      <Section title="Life areas touched today" className="xl:col-span-3"><div className="space-y-2">{lifeAreas.map((area) => { const key = `life:${area}`; return <CheckLine key={key} id={key} label={area} checked={bindings.checked(key)} onChange={(value) => bindings.setValue(key, value)} />; })}</div></Section>
    </div>
  );
}

function TomorrowPlanner(bindings: Bindings) {
  const windows = ['Morning', 'Between', 'Evening', 'Night'];
  const prep = ['Clothes', 'Bag', 'Food', 'Charging', 'Alarm', 'Calendar', 'Beauty', 'Other'];
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Section title="Before Tomorrow" hint="Close today without carrying everything forward by default." className="xl:col-span-6"><TextField id="loose-ends" label="Loose ends from today" value={bindings.text('looseEnds')} onChange={(value) => bindings.setValue('looseEnds', value)} multiline placeholder="Tomorrow / later / drop…" /></Section>
      <Section title="What I’m leaving here" className="xl:col-span-6"><TextField id="leave-here" label="Reflection only" value={bindings.text('leaveHere')} onChange={(value) => bindings.setValue('leaveHere', value)} multiline /></Section>
      <Section title="Tomorrow" hint="Set the direction before filling the day." className="xl:col-span-7">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="tomorrow-focus" label="Main focus" value={bindings.text('focus')} onChange={(value) => bindings.setValue('focus', value)} />
          <TextField id="tomorrow-feel" label="How I want tomorrow to feel" value={bindings.text('feel')} onChange={(value) => bindings.setValue('feel', value)} />
          <Energy label="Expected energy" value={bindings.text('energy')} onChange={(value) => bindings.setValue('energy', value)} />
        </div>
        <div className="mt-6"><span className={labelClass}>Top 3 non-negotiables</span><PriorityRows prefix="nonNegotiable" count={3} bindings={bindings} /></div>
      </Section>
      <Section title="First Move" hint="The first visible action when tomorrow begins." className="xl:col-span-5"><TextField id="first-move" label="First move" value={bindings.text('firstMove')} onChange={(value) => bindings.setValue('firstMove', value)} multiline /></Section>
      <Section title="Shape the Day" hint="Fixed commitments stay separate from flexible plans." className="xl:col-span-12">
        <div className="overflow-x-auto"><div className="min-w-[720px] space-y-2">
          <div className="grid grid-cols-[140px_1fr_1fr] gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6E6E73]"><span>Window</span><span>Fixed</span><span>Plan</span></div>
          {windows.map((windowName) => { const key = windowName.toLowerCase(); return <div key={key} className="grid grid-cols-[140px_1fr_1fr] gap-2"><div className="flex items-center rounded-2xl bg-[#FAFAFA] px-4 text-[13px] font-semibold">{windowName}</div><input value={bindings.text(`${key}Fixed`)} onChange={(event) => bindings.setValue(`${key}Fixed`, event.target.value)} className={inputClass} /><input value={bindings.text(`${key}Plan`)} onChange={(event) => bindings.setValue(`${key}Plan`, event.target.value)} className={inputClass} /></div>; })}
        </div></div>
      </Section>
      <Section title="Set Tomorrow Up" className="xl:col-span-6"><div className="grid gap-2 sm:grid-cols-2">{prep.map((item) => <CheckLine key={item} id={`prep:${item}`} label={item} checked={bindings.checked(`prep:${item}`)} onChange={(value) => bindings.setValue(`prep:${item}`, value)} />)}</div></Section>
      <Section title="Not for Tomorrow" hint="Intentional overflow, not a forgotten pile." className="xl:col-span-6"><TextField id="not-tomorrow" label="Move out of tomorrow" value={bindings.text('notForTomorrow')} onChange={(value) => bindings.setValue('notForTomorrow', value)} multiline /></Section>
    </div>
  );
}

function WeekPlanner(bindings: Bindings) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Section title="Week Ahead" className="xl:col-span-7">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="week-feel" label="How I want this week to feel" value={bindings.text('feel')} onChange={(value) => bindings.setValue('feel', value)} />
          <TextField id="week-focus" label="Main focus" value={bindings.text('focus')} onChange={(value) => bindings.setValue('focus', value)} />
          <SelectField id="priority-mode" label="Priority mode" value={bindings.text('priorityMode')} onChange={(value) => bindings.setValue('priorityMode', value)} options={['Top 1', 'Top 3', 'Ranked 6', 'Recovery']} />
        </div>
        <div className="mt-6"><span className={labelClass}>3 weekly drivers</span><PriorityRows prefix="driver" count={3} bindings={bindings} /></div>
      </Section>
      <Section title="Capacity Check" hint="Protect open space before the week fills itself." className="xl:col-span-5"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><TextField id="heavy-days" label="Heavy days" value={bindings.text('heavyDays')} onChange={(value) => bindings.setValue('heavyDays', value)} /><TextField id="protected-recovery" label="Protected recovery" value={bindings.text('protectedRecovery')} onChange={(value) => bindings.setValue('protectedRecovery', value)} /><TextField id="open-space" label="Open space" value={bindings.text('openSpace')} onChange={(value) => bindings.setValue('openSpace', value)} /><TextField id="move-first" label="If overloaded, move this first" value={bindings.text('moveFirst')} onChange={(value) => bindings.setValue('moveFirst', value)} /></div></Section>
      <Section title="Week at a Glance" hint="Anchors and fixed commitments first, flexible focus second." className="xl:col-span-12">
        <div className="overflow-x-auto"><div className="min-w-[980px] space-y-2">
          <div className="grid grid-cols-[130px_1fr_1fr_1fr_160px] gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6E6E73]"><span>Day</span><span>Anchor</span><span>Fixed</span><span>Focus</span><span>Energy</span></div>
          {days.map((day) => { const key = day.toLowerCase(); return <div key={key} className="grid grid-cols-[130px_1fr_1fr_1fr_160px] gap-2"><div className="flex items-center rounded-2xl bg-[#FAFAFA] px-4 text-[13px] font-semibold">{day}</div><input value={bindings.text(`${key}Anchor`)} onChange={(event) => bindings.setValue(`${key}Anchor`, event.target.value)} className={inputClass} /><input value={bindings.text(`${key}Fixed`)} onChange={(event) => bindings.setValue(`${key}Fixed`, event.target.value)} className={inputClass} /><input value={bindings.text(`${key}Focus`)} onChange={(event) => bindings.setValue(`${key}Focus`, event.target.value)} className={inputClass} /><select value={bindings.text(`${key}Energy`)} onChange={(event) => bindings.setValue(`${key}Energy`, event.target.value)} className={inputClass}><option value="">Energy…</option><option>Recovery</option><option>Low</option><option>Normal</option><option>High</option></select></div>; })}
        </div></div>
      </Section>
      <Section title="Weekly Task Bank" hint="Unscheduled until you decide where it fits." className="xl:col-span-8"><Matrix columns={['Task', 'Next action', 'Best day', 'Calendar']} rows={6} prefix="weekTask" bindings={bindings} /></Section>
      <Section title="Overflow / Not This Week" className="xl:col-span-4"><TextField id="week-overflow" label="Keep out of this week" value={bindings.text('overflow')} onChange={(value) => bindings.setValue('overflow', value)} multiline /></Section>
      <Section title="Appointments" className="xl:col-span-4"><TextField id="appointments" label="Appointments" value={bindings.text('appointments')} onChange={(value) => bindings.setValue('appointments', value)} multiline /></Section>
      <Section title="Needs Prep" className="xl:col-span-4"><TextField id="needs-prep" label="Prep before it happens" value={bindings.text('needsPrep')} onChange={(value) => bindings.setValue('needsPrep', value)} multiline /></Section>
      <Section title="Do Not Forget" className="xl:col-span-4"><TextField id="do-not-forget" label="Remember" value={bindings.text('doNotForget')} onChange={(value) => bindings.setValue('doNotForget', value)} multiline /></Section>
      <Section title="Monday’s First Move" className="xl:col-span-12"><TextField id="monday-first" label="First move" value={bindings.text('firstMove')} onChange={(value) => bindings.setValue('firstMove', value)} /></Section>
    </div>
  );
}

function MonthPlanner(bindings: Bindings & { periodKey: string }) {
  const days = monthCalendarDays(bindings.periodKey);
  const attention = ['Health + Energy', 'Home', 'Money', 'People', 'Work + Career', 'Creative + Personal'];
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Section title="This Month" className="xl:col-span-7"><div className="grid gap-4 md:grid-cols-2"><TextField id="month-feel" label="How I want this month to feel" value={bindings.text('feel')} onChange={(value) => bindings.setValue('feel', value)} /><TextField id="month-focus" label="Main focus" value={bindings.text('focus')} onChange={(value) => bindings.setValue('focus', value)} /><TextField id="month-more" label="More of" value={bindings.text('more')} onChange={(value) => bindings.setValue('more', value)} /><TextField id="month-less" label="Less of" value={bindings.text('less')} onChange={(value) => bindings.setValue('less', value)} /><TextField id="month-protect" label="Protect" value={bindings.text('protect')} onChange={(value) => bindings.setValue('protect', value)} /></div></Section>
      <Section title="3 Monthly Drivers" hint="Must move · want to build · want to experience." className="xl:col-span-5">{['Must move', 'Want to build', 'Want to experience'].map((label, index) => { const key = `driver${index + 1}`; return <div key={key} className="mb-3 last:mb-0"><span className={labelClass}>{label}</span><div className="flex items-center gap-3"><button type="button" aria-label={`Mark ${label} complete`} onClick={() => bindings.setValue(`${key}Done`, !bindings.checked(`${key}Done`))} className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border ${bindings.checked(`${key}Done`) ? 'border-[#B86F7D] bg-[#F8EFF1] text-[#B86F7D]' : 'border-[#E2E2E2] bg-white text-transparent'}`}><Check size={16} /></button><input value={bindings.text(key)} onChange={(event) => bindings.setValue(key, event.target.value)} className={inputClass} /></div></div>; })}</Section>
      <Section title="Month Calendar" hint="A calm month view. Add a short note to any date." className="xl:col-span-12">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6E6E73]">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => <div key={day} className="py-2">{day}</div>)}</div>
        <div className="grid grid-cols-7 gap-1">{days.map((day, index) => day ? <label key={day.key} className="min-h-[98px] rounded-2xl border border-[#ECECEC] bg-[#FAFAFA] p-2 sm:min-h-[120px]"><span className="text-[11px] font-semibold text-[#6E6E73]">{day.day}</span><textarea aria-label={`Calendar note for ${day.key}`} value={bindings.text(`calendar:${day.key}`)} onChange={(event) => bindings.setValue(`calendar:${day.key}`, event.target.value)} className="mt-1 h-[62px] w-full resize-none bg-transparent text-[11px] leading-4 outline-none sm:h-[80px]" /></label> : <div key={`blank-${index}`} />)}</div>
      </Section>
      <Section title="What Needs Attention" className="xl:col-span-7"><div className="grid gap-3 sm:grid-cols-2">{attention.map((area) => <TextField key={area} id={`attention-${area}`} label={area} value={bindings.text(`attention:${area}`)} onChange={(value) => bindings.setValue(`attention:${area}`, value)} />)}</div></Section>
      <Section title="Important Dates" className="xl:col-span-5"><Matrix columns={['Date', 'What']} rows={5} prefix="importantDate" bindings={bindings} /></Section>
      <Section title="Active Projects" className="xl:col-span-6"><Matrix columns={['Project', 'Monthly milestone']} rows={4} prefix="project" bindings={bindings} /></Section>
      <Section title="Month Support" className="xl:col-span-6"><div className="grid gap-4 sm:grid-cols-2"><TextField id="money" label="Money at a glance" value={bindings.text('money')} onChange={(value) => bindings.setValue('money', value)} /><TextField id="maintenance" label="Maintenance" value={bindings.text('maintenance')} onChange={(value) => bindings.setValue('maintenance', value)} /><TextField id="prep-ahead" label="Prep ahead" value={bindings.text('prepAhead')} onChange={(value) => bindings.setValue('prepAhead', value)} /><TextField id="first-week" label="First week needs" value={bindings.text('firstWeekNeeds')} onChange={(value) => bindings.setValue('firstWeekNeeds', value)} /></div></Section>
    </div>
  );
}

function Matrix({ columns, rows, prefix, bindings }: { columns: string[]; rows: number; prefix: string; bindings: Bindings }) {
  return (
    <div className="overflow-x-auto"><div className="min-w-[640px] space-y-2">
      <div className="grid gap-2 px-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6E6E73]" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>{columns.map((column) => <span key={column}>{column}</span>)}</div>
      {Array.from({ length: rows }, (_, row) => <div key={row} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>{columns.map((_, column) => { const key = `${prefix}:${row}:${column}`; return <input key={key} value={bindings.text(key)} onChange={(event) => bindings.setValue(key, event.target.value)} className={inputClass} />; })}</div>)}
    </div></div>
  );
}

function PlannerArchive({ documents }: { documents: PlannerDocumentRecord[] }) {
  const sorted = [...documents].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return (
    <PlannerShell active="archive">
      <section className={card}>
        <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#F8EFF1] text-[#B86F7D]"><Archive size={18} /></span><div><h2 className="text-[18px] font-semibold">Planning Archive</h2><p className="text-[12px] text-[#6E6E73]">Every saved day, week, and month remains attached to its original period.</p></div></div>
        {sorted.length ? <div className="divide-y divide-[#ECECEC]">{sorted.map((doc) => <Link key={doc.id} href={`/planning/planner/${doc.view}?key=${encodeURIComponent(doc.periodKey)}`} className="flex items-center justify-between gap-4 py-4 transition hover:opacity-70"><div><div className="text-[13px] font-semibold capitalize">{doc.view === 'week' ? 'Week Ahead' : doc.view === 'month' ? 'This Month' : doc.view}</div><div className="mt-1 text-[12px] text-[#6E6E73]">{plannerLabel(doc.view, doc.periodKey)}{doc.focus ? ` · ${doc.focus}` : ''}</div></div><div className="text-right text-[11px] text-[#6E6E73]"><div>{doc.progress}% complete</div><div className="mt-1">Updated {new Date(doc.updatedAt).toLocaleDateString()}</div></div></Link>)}</div> : <div className="rounded-3xl bg-[#FAFAFA] p-8 text-center"><p className="font-serif text-[25px]">Your archive starts with your first autosave.</p><Link href="/planning/planner/today" className="mt-4 inline-flex rounded-full bg-[#1C1C1E] px-5 py-3 text-[12px] font-semibold text-white">Open Today</Link></div>}
      </section>
    </PlannerShell>
  );
}

function PlannerInsights({ documents }: { documents: PlannerDocumentRecord[] }) {
  const metrics = useMemo(() => {
    const completed = documents.reduce((sum, doc) => sum + (doc.progress >= 100 ? 1 : 0), 0);
    const withFocus = documents.filter((doc) => Boolean(doc.focus?.trim())).length;
    const energy: Record<string, number> = {};
    for (const doc of documents) { const value = doc.data.values.energy; if (typeof value === 'string' && value) energy[value] = (energy[value] ?? 0) + 1; }
    const mostUsedEnergy = Object.entries(energy).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const overflowMentions = documents.filter((doc) => { const value = doc.data.values.overflow ?? doc.data.values.notForTomorrow; return typeof value === 'string' && value.trim().length > 0; }).length;
    return { completed, withFocus, mostUsedEnergy, overflowMentions };
  }, [documents]);

  const insights = [
    `${documents.length} planning ${documents.length === 1 ? 'record is' : 'records are'} available to learn from.`,
    `${metrics.withFocus} ${metrics.withFocus === 1 ? 'record has' : 'records have'} a written focus.`,
    metrics.mostUsedEnergy ? `${metrics.mostUsedEnergy} is your most frequently recorded energy state so far.` : 'Energy patterns will appear after you begin recording energy.',
    metrics.overflowMentions ? `You intentionally used overflow or “not for tomorrow” on ${metrics.overflowMentions} ${metrics.overflowMentions === 1 ? 'record' : 'records'}.` : 'No overflow pattern is visible yet.',
  ];

  return (
    <PlannerShell active="insights"><div className="grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
      <Section title="What your planning history says" hint="Factual patterns from saved planner records. No scorecard and no invented conclusions."><div className="space-y-3">{insights.map((insight) => <div key={insight} className="rounded-2xl bg-[#FAFAFA] px-4 py-4 text-[13px] leading-6">{insight}</div>)}</div></Section>
      <Section title="History signal"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-full bg-[#F8EFF1] text-[#B86F7D]"><BarChart3 size={20} /></span><div><div className="font-serif text-[30px]">{metrics.completed}</div><div className="text-[12px] text-[#6E6E73]">fully completed priority sets</div></div></div><p className="mt-5 text-[12px] leading-5 text-[#6E6E73]">Insights only summarize what you actually saved. Glow can use the same history as context without rewriting old records.</p></Section>
    </div></PlannerShell>
  );
}
