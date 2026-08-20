import Link from 'next/link';
import { CalendarDays, CheckCircle2, Circle, Droplets, MoonStar, Sparkles } from 'lucide-react';
import { closeEveningAction, moveTaskToTomorrowAction, saveEveningReflectionAction } from '@/app/actions/evening-debrief';
import type { CalendarEvent, Habit, HabitLog, Note, Routine, Task, WellnessEntry, FinanceEntry } from '@/lib/types';

type MedicationLite = { id: string; name: string; active: boolean };
type BriefingLite = { id: string; kind: string; periodKey: string; generatedAt: Date; content: unknown };
type FocusSessionLite = { id: string; title: string; startedAt: Date; actualMinutes: number | null; completed: boolean };

type Props = {
  modeSlug: string;
  modeName: string;
  tasks: Task[];
  events: CalendarEvent[];
  habits: Habit[];
  habitLogs: HabitLog[];
  routines: Routine[];
  wellnessEntries: WellnessEntry[];
  financeEntries: FinanceEntry[];
  medications: MedicationLite[];
  supplements: MedicationLite[];
  notes: Note[];
  briefings: BriefingLite[];
  focusSessions: FocusSessionLite[];
};

const HERO = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=85';
const PREVIEW = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
const dateKey = (d: Date) => d.toISOString().slice(0, 10);
const sameDay = (value: Date, target: Date) => value.toDateString() === target.toDateString();

const MODE_DEBRIEF:Record<string,{hero:string;completed:string;attention:string;wentWell:string;difficult:string;proud:string;different:string}>={
  'deep-work':{hero:'Close a high-capacity day with clarity. Keep the wins, release the rest, and protect tomorrow.',completed:'What You Accomplished',attention:'What Still Matters',wentWell:'What worked especially well?',difficult:'Where did your energy go?',proud:'What are you proud of?',different:'What will make tomorrow even cleaner?'},
  normal:{hero:'Reflect, release, and reset. Carry forward only what still matters.',completed:'What You Completed',attention:'What Needs Attention',wentWell:'What went well?',difficult:'What felt difficult?',proud:'What are you proud of?',different:'What will you change tomorrow?'},
  'low-energy':{hero:'Review the day by capacity, not by volume. Notice what helped and move the rest without pressure.',completed:'What You Managed Today',attention:'What Can Be Made Easier',wentWell:'What felt manageable?',difficult:'What took too much energy?',proud:'What did you protect or complete?',different:'What should be lighter tomorrow?'},
  sick:{hero:'This was a recovery day, not a productivity test. Notice what helped and prepare a gentler tomorrow.',completed:'Care + Essentials Completed',attention:'Only What Must Carry Forward',wentWell:'Did anything help today?',difficult:'What felt hardest on your body or mind?',proud:'What care did you give yourself?',different:'What should tomorrow feel like?'},
};

export function EveningDebriefBatch1(props: Props) {
  const now = new Date();
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const todayKey = dateKey(now);
  const mode=MODE_DEBRIEF[props.modeSlug]??MODE_DEBRIEF.normal;
  const isRecovery=props.modeSlug==='sick';
  const isLow=props.modeSlug==='low-energy';
  const completed = props.tasks.filter((task) => task.status === 'done' && task.completedAt && sameDay(task.completedAt, now));
  const open = props.tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const attention = isRecovery ? open.filter(task=>task.priority==='urgent').slice(0,2) : open.filter((task) => (task.dueDate && task.dueDate <= now) || task.priority === 'urgent' || task.priority === 'high').slice(0,isLow?2:4);
  const carry = open.slice(0,isRecovery?2:isLow?3:4);
  const eventsToday = props.events.filter((event) => sameDay(event.startAt, now));
  const tomorrowItems = props.events.filter((event) => sameDay(event.startAt, tomorrow)).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0, 4);
  const loggedHabitIds = new Set(props.habitLogs.filter((log) => log.loggedDate === todayKey && log.count > 0).map((log) => log.habitId));
  const habitsDone = props.habits.filter((habit) => loggedHabitIds.has(habit.id)).length;
  const focusMinutes = props.focusSessions.filter((item) => sameDay(item.startedAt, now)).reduce((sum,item)=>sum+(item.actualMinutes??0),0);
  const wellness = props.wellnessEntries.find((entry) => sameDay(new Date(entry.entryDate), now)) ?? props.wellnessEntries[0] ?? null;
  const sleep = wellness?.sleepHours != null ? `${wellness.sleepHours}h` : '—';
  const hydration = wellness?.waterGlasses != null ? `${wellness.waterGlasses}` : '—';
  const mood = wellness?.mood ? wellness.mood : '—';
  const latestReflection = props.notes.find((note) => note.tags?.includes('evening-reflection'));
  const alreadyClosed = props.briefings.some((briefing) => briefing.kind === 'evening' && briefing.periodKey === todayKey);

  const stats = isRecovery ? [
    ['Events', String(eventsToday.length), CalendarDays],
    ['Care Done', String(completed.length), CheckCircle2],
    ['Water', hydration, Droplets],
    ['Mood', mood, Sparkles],
  ] as const : [
    ['Events', String(eventsToday.length), CalendarDays],
    ['Tasks Done', String(completed.length), CheckCircle2],
    ['Habits', `${habitsDone}/${props.habits.length || 0}`, Sparkles],
    ['Focus', focusMinutes ? `${Math.floor(focusMinutes/60)}h ${focusMinutes%60}m` : '—', MoonStar],
    ['Water', hydration, Droplets],
    ['Mood', mood, Sparkles],
  ] as const;

  return <div className="batch1-evening-reference space-y-3">
    <section className="relative min-h-[186px] overflow-hidden rounded-[15px] border border-[#ece3df] bg-[#eee4e1] shadow-[0_10px_30px_rgba(58,43,38,.05)]">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`linear-gradient(90deg,rgba(255,255,255,.97) 0%,rgba(255,255,255,.82) 43%,rgba(255,245,244,.18) 72%),url(${HERO})`}}/>
      <div className="relative z-10 max-w-[580px] p-6 sm:p-7">
        <p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#a66a76]">Evening Debrief · {props.modeName}</p>
        <h1 className="glow-display mt-2 text-[38px] leading-none tracking-[-.03em] text-[#28211e]">Evening Debrief</h1>
        <p className="mt-2 text-[10px] font-medium text-[#b65f70]">{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
        <p className="mt-2 max-w-[520px] text-[11px] leading-5 text-[#6c625c]">{mode.hero}</p>
      </div>
      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <Link href="/notes" className="rounded-full border border-white/80 bg-white/85 px-3 py-2 text-[9px] text-[#665d58]">Share</Link>
        <form action={closeEveningAction}><button className="rounded-[6px] bg-[#a94761] px-4 py-2 text-[9px] font-medium text-white">{alreadyClosed?'Day Closed':'Close Day'}</button></form>
      </div>
    </section>

    <section className="rounded-[12px] border border-[#ece3df] bg-white p-4 shadow-[0_6px_22px_rgba(65,46,39,.035)]">
      <h2 className="glow-display text-[16px]">{isRecovery?'Recovery at a Glance':'Today at a Glance'}</h2>
      <div className={`mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-[9px] border border-[#eee6e2] bg-[#eee6e2] ${isRecovery?'sm:grid-cols-4':'sm:grid-cols-6'}`}>{stats.map(([label,value,Icon])=><div key={label} className="bg-white px-3 py-3 text-center"><Icon size={13} className="mx-auto text-[#9e756d]"/><p className="glow-display mt-2 text-[16px] capitalize">{value}</p><p className="mt-1 text-[7.5px] text-[#9c918a]">{label}</p></div>)}</div>
    </section>

    <div className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-[12px] border border-[#ece3df] bg-white p-4 shadow-[0_6px_20px_rgba(65,46,39,.03)]"><div className="flex items-center justify-between"><h2 className="glow-display text-[16px]">{mode.completed}</h2>{!isRecovery?<Link href="/tasks?view=done" className="text-[8px] text-[#b45d70]">View all</Link>:null}</div><div className="mt-3 space-y-2">{completed.length?completed.slice(0,isRecovery?3:5).map(task=><Link key={task.id} href={`/tasks?taskId=${encodeURIComponent(task.id)}&view=done`} className="flex items-center gap-2 text-[9px] text-[#3e3733]"><CheckCircle2 size={12} className="text-[#72866c]"/><span className="truncate">{task.title}</span></Link>):<p className="py-5 text-[9px] leading-4 text-[#958a83]">{isRecovery?'No completion count is required for a recovery day.':'Nothing has been marked complete yet.'}</p>}</div></section>
      <section className="rounded-[12px] border border-[#ece3df] bg-white p-4 shadow-[0_6px_20px_rgba(65,46,39,.03)]"><div className="flex items-center justify-between"><h2 className="glow-display text-[16px]">{mode.attention}</h2>{!isRecovery?<Link href="/tasks" className="text-[8px] text-[#b45d70]">View all</Link>:null}</div><div className="mt-3 space-y-2">{attention.length?attention.map(task=><div key={task.id} className="flex items-center gap-2"><Circle size={11} className="shrink-0 text-[#c46b7b]"/><Link href={`/tasks?taskId=${encodeURIComponent(task.id)}&view=all`} className="min-w-0 flex-1 truncate text-[9px]">{task.title}</Link><form action={moveTaskToTomorrowAction}><input type="hidden" name="taskId" value={task.id}/><button className="rounded-[5px] border border-[#efd9dd] px-2 py-1 text-[7.5px] text-[#b45d70]">Move</button></form></div>):<p className="py-5 text-[9px] leading-4 text-[#958a83]">{isRecovery?'Nothing urgent needs to be carried forward tonight.':'Nothing urgent needs attention.'}</p>}</div></section>
    </div>

    <div className="grid gap-3 lg:grid-cols-[.85fr_1.15fr_.9fr]">
      <section className="rounded-[12px] border border-[#ece3df] bg-white p-4"><h2 className="glow-display text-[15px]">Carry Forward to Tomorrow</h2><div className="mt-3 space-y-2">{carry.length?carry.map(task=><div key={task.id} className="flex items-center gap-2"><Circle size={10} className="text-[#c9bab4]"/><Link href={`/tasks?taskId=${encodeURIComponent(task.id)}&view=all`} className="min-w-0 flex-1 truncate text-[8.5px]">{task.title}</Link><form action={moveTaskToTomorrowAction}><input type="hidden" name="taskId" value={task.id}/><button className="text-[7.5px] text-[#b45d70]">Move</button></form></div>):<p className="text-[9px] text-[#958a83]">Your list is clear.</p>}</div><Link href="/tomorrow" className="mt-4 inline-block text-[8px] text-[#b45d70]">Review Tomorrow →</Link></section>

      <section className="rounded-[12px] border border-[#ece3df] bg-white p-4"><h2 className="glow-display text-[15px]">{isRecovery?'Recovery Reflection':'Day Reflection'}</h2>{latestReflection?<p className="mt-2 line-clamp-2 text-[8.5px] leading-4 text-[#8d827b]">{latestReflection.content}</p>:null}<form action={saveEveningReflectionAction} className="mt-3 grid gap-2 sm:grid-cols-2"><input name="wentWell" placeholder={mode.wentWell} className="rounded-[7px] border border-[#eee4e0] px-3 py-2 text-[8.5px] outline-none focus:border-[#c66c7b]"/><input name="feltDifficult" placeholder={mode.difficult} className="rounded-[7px] border border-[#eee4e0] px-3 py-2 text-[8.5px] outline-none focus:border-[#c66c7b]"/><input name="proudOf" placeholder={mode.proud} className="rounded-[7px] border border-[#eee4e0] px-3 py-2 text-[8.5px] outline-none focus:border-[#c66c7b]"/><input name="doDifferently" placeholder={mode.different} className="rounded-[7px] border border-[#eee4e0] px-3 py-2 text-[8.5px] outline-none focus:border-[#c66c7b]"/><button className="w-fit text-[8px] text-[#b45d70] sm:col-span-2">Save reflection →</button></form></section>

      <section className="overflow-hidden rounded-[12px] border border-[#ece3df] bg-white"><div className="relative h-[88px] bg-cover bg-center" style={{backgroundImage:`linear-gradient(180deg,rgba(255,255,255,.1),rgba(40,29,25,.15)),url(${PREVIEW})`}}/><div className="p-4"><p className="text-[8px] uppercase tracking-[.11em] text-[#9a8f88]">Tomorrow Preview</p>{tomorrowItems.length?<div className="mt-2 space-y-1.5">{tomorrowItems.map(item=><Link key={item.id} href={`/calendar?eventId=${encodeURIComponent(item.id)}&view=day`} className="flex justify-between gap-2 text-[8.5px]"><span className="truncate">{item.title}</span><span className="shrink-0 text-[#a49a94]">{item.allDay?'All day':item.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span></Link>)}</div>:<p className="mt-2 text-[9px] text-[#958a83]">Tomorrow is open.</p>}<Link href="/tomorrow" className="mt-3 inline-block text-[8px] text-[#b45d70]">View Tomorrow →</Link></div></section>
    </div>

    <div className="sr-only">Active medications and supplements: {props.medications.filter(x=>x.active).length + props.supplements.filter(x=>x.active).length}. Finance entries: {props.financeEntries.length}. Routines: {props.routines.length}. Sleep: {sleep}.</div>
  </div>;
}
