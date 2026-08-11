import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getHabitsByUser, getHabitLogsForUserByDate } from '@/lib/data/habits';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getGoalsByUser } from '@/lib/data/goals';
import { getNotesByUser } from '@/lib/data/notes';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getFitnessSessions, getHairLogs } from '@/lib/data/completion-v1';
import { CheckCircle2, ChevronRight, Coffee, MoonStar, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
type View = 'morning' | 'night';
const rank = { urgent: 4, high: 3, medium: 2, low: 1 } as const;

function dayBounds(offset = 0) {
  const start = new Date(); start.setDate(start.getDate() + offset); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setHours(23, 59, 59, 999);
  return { start, end, key: start.toISOString().slice(0, 10) };
}
function inDay(value: Date | null, bounds: ReturnType<typeof dayBounds>) { return !!value && value >= bounds.start && value <= bounds.end; }
function time(value: Date) { return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function BriefSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <details open className="rounded-[16px] border border-[#e8ddd5] bg-white/45"><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#6f5b54]">{title}<ChevronRight size={13}/></summary><div className="border-t border-[#eee4dd] p-4">{children}</div></details>;
}
function Empty({ children }: { children: React.ReactNode }) { return <p className="text-[9px] leading-5 text-[#8b7770]">{children}</p>; }
function Rows({ rows }: { rows: Array<{ title: string; meta: string }> }) {
  return rows.length ? <div className="space-y-3">{rows.map((row, index) => <div key={`${row.title}-${index}`} className="flex gap-3"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-[#b77a84]"/><div><p className="text-[10px] font-medium text-[#443733]">{row.title}</p><p className="mt-1 text-[8px] leading-4 text-[#8a7670]">{row.meta}</p></div></div>)}</div> : <Empty>No stored records are relevant here today.</Empty>;
}

export default async function BriefingsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const session = await auth(); if (!session?.user?.id) redirect('/sign-in');
  const view: View = (await searchParams).view === 'night' ? 'night' : 'morning';
  const today = dayBounds(), tomorrow = dayBounds(1), userId = session.user.id;
  const [tasks, events, habits, habitLogs, routines, wellness, beauty, finance, goals, notes, projects, fitness, hair] = await Promise.all([
    getTasksByUser(userId), getCalendarEventsByUser(userId), getHabitsByUser(userId), getHabitLogsForUserByDate(userId, today.key),
    getRoutinesByUser(userId), getWellnessEntriesByUser(userId), getBeautyRoutinesByUser(userId), getFinanceEntriesByUser(userId),
    getGoalsByUser(userId), getNotesByUser(userId), getProjectsByUser(userId), getFitnessSessions(userId), getHairLogs(userId),
  ]);
  const open = tasks.filter(task => task.status !== 'done' && task.status !== 'cancelled');
  const dueToday = open.filter(task => inDay(task.dueDate, today));
  const overdue = open.filter(task => task.dueDate && task.dueDate < today.start);
  const priorities = [...new Map([...overdue, ...dueToday].sort((a, b) => rank[b.priority] - rank[a.priority] || +(a.dueDate ?? 0) - +(b.dueDate ?? 0)).map(task => [task.id, task])).values()].slice(0, 3);
  const todayEvents = events.filter(event => inDay(event.startAt, today)).sort((a, b) => +a.startAt - +b.startAt);
  const tomorrowEvents = events.filter(event => inDay(event.startAt, tomorrow)).sort((a, b) => +a.startAt - +b.startAt);
  const completedToday = tasks.filter(task => task.status === 'done' && inDay(task.completedAt, today));
  const wellnessToday = wellness.find(entry => String(entry.entryDate) === today.key);
  const weekday = today.start.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const todayRoutines = routines.filter(routine => !routine.daysOfWeek?.length || routine.daysOfWeek.some(day => day.toLowerCase() === weekday));
  const morningRoutine = todayRoutines.find(routine => routine.timeOfDay === 'morning');
  const eveningRoutine = todayRoutines.find(routine => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night');
  const activeGoal = goals.filter(goal => goal.status === 'in_progress' || goal.status === 'not_started').sort((a, b) => +(a.targetDate ?? Infinity) - +(b.targetDate ?? Infinity))[0];
  const activeProject = projects.filter(project => project.status === 'active' && project.nextAction).sort((a, b) => +(a.deadline ?? Infinity) - +(b.deadline ?? Infinity))[0];
  const latestHair = hair[0], latestFitness = fitness[0];
  const lowEnergy = wellnessToday?.energy === 'low' || wellnessToday?.energy === 'exhausted';
  const overloaded = todayEvents.length >= 4 || dueToday.length + overdue.length > 5;
  const habitDone = new Set(habitLogs.map(log => log.habitId)).size;
  const monthKey = today.key.slice(0, 7);
  const monthSpend = finance.filter(entry => entry.type === 'expense' && String(entry.entryDate).startsWith(monthKey)).reduce((sum, entry) => sum + Number(entry.amount), 0);
  const greeting = session.user.name?.split(' ')[0] ? `Good ${view === 'morning' ? 'morning' : 'evening'}, ${session.user.name.split(' ')[0]}.` : view === 'morning' ? 'Good morning.' : 'Good evening.';
  const beautyRows = beauty.filter(item => view === 'morning' ? item.timeOfDay === 'morning' : item.timeOfDay === 'evening' || item.timeOfDay === 'night').slice(0, 3).map(item => ({ title: item.name, meta: `${item.products?.length ?? 0} stored product${item.products?.length === 1 ? '' : 's'} · open Beauty for the complete routine` }));
  const bestUse = view === 'morning'
    ? lowEnergy ? 'Keep the day deliberately lighter: protect fixed commitments and one essential priority.' : priorities[0] ? `Protect focused time for “${priorities[0].title}”${todayEvents[0] ? ` before or around ${time(todayEvents[0].startAt)}` : ''}.` : 'Your stored schedule is open; choose one active goal or project action to move forward.'
    : tomorrowEvents[0] ? `Prepare for “${tomorrowEvents[0].title}” at ${time(tomorrowEvents[0].startAt)}, then make individual decisions about unfinished work.` : 'Review unfinished decisions, prepare one useful thing for tomorrow, and let today be complete.';

  return <AppShell><div className={`mx-auto max-w-6xl space-y-4 ${view === 'night' ? 'text-[#514b61]' : ''}`}>
    <header className={`relative overflow-hidden rounded-[24px] border p-6 ${view === 'night' ? 'border-[#dcd7e7] bg-[linear-gradient(135deg,#e9e5f0,#f8f2ef)]' : 'border-[#eadac9] bg-[linear-gradient(135deg,#f6ead7,#fff8ef)]'}`}>
      {view === 'morning' ? <Coffee className="absolute right-6 top-5 text-[#b18b62]/20" size={72}/> : <MoonStar className="absolute right-6 top-5 text-[#746b91]/20" size={72}/>}<p className="text-[8px] font-bold uppercase tracking-[.2em]">The Glow Daily · {view} brief</p><h1 className="glow-display mt-2 text-3xl">{greeting}</h1><p className="mt-2 text-[10px]">{today.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p><p className="mt-4 max-w-3xl text-[11px] leading-5">{view === 'morning' ? 'What you need to know, do, and prioritize today—using only the records Glow OS can actually see.' : 'How today went, what still matters, and what your stored information says to prepare for tomorrow.'}</p>
      <nav className="mt-5 flex gap-2"><Link href="/briefings?view=morning" className="rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[9px]">Morning Brief</Link><Link href="/briefings?view=night" className="rounded-full border border-white/70 bg-white/55 px-4 py-2 text-[9px]">Night Brief</Link></nav>
    </header>

    {view === 'morning' ? <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-3"><BriefSection title="Top 3 priorities"><Rows rows={priorities.map((task, i) => ({ title: `${i + 1}. ${task.title}`, meta: `${task.priority} priority${task.dueDate ? ` · ${task.dueDate < today.start ? 'overdue' : `due ${time(task.dueDate!)}`}` : ''}` }))}/></BriefSection><BriefSection title="Schedule intelligence"><Rows rows={todayEvents.map(event => ({ title: event.title, meta: `${time(event.startAt)}–${time(event.endAt ?? event.startAt)}${event.location ? ` · ${event.location}` : ''}` }))}/><p className="mt-4 text-[9px] text-[#7d6962]">{overloaded ? 'The recorded workload may exceed a comfortable day. Review what can move rather than automatically rescheduling it.' : todayEvents.length ? 'No obvious overload is visible from the stored calendar and dated tasks.' : 'No appointments are stored today, leaving room for focused work.'}</p></BriefSection><BriefSection title="Goals, projects & career"><Rows rows={[...(activeGoal ? [{ title: activeGoal.title, meta: `${activeGoal.progress}% complete · choose one concrete goal-moving action` }] : []), ...(activeProject ? [{ title: activeProject.nextAction!, meta: `${activeProject.title}${activeProject.area ? ` · ${activeProject.area}` : ''}` }] : [])]}/></BriefSection><BriefSection title="Watch today"><Rows rows={[...overdue.slice(0, 2).map(task => ({ title: task.title, meta: 'Overdue and still unfinished' })), ...(todayEvents.length && priorities.length ? [{ title: 'Protect transitions', meta: 'Fixed calendar time and priority work both need space today.' }] : [])]}/></BriefSection></div>
      <aside className="space-y-3"><BriefSection title="Wellness & fitness"><Rows rows={[...(wellnessToday ? [{ title: `Energy: ${wellnessToday.energy ?? 'not recorded'}`, meta: [`Mood ${wellnessToday.mood ?? 'not recorded'}`, wellnessToday.sleepHours != null ? `${wellnessToday.sleepHours}h sleep` : null, wellnessToday.waterGlasses != null ? `${wellnessToday.waterGlasses} glasses water` : null].filter(Boolean).join(' · ') }] : []), ...(latestFitness ? [{ title: latestFitness.workoutType, meta: `Latest recorded workout${latestFitness.energy != null ? ` · energy ${latestFitness.energy}/10` : ''}${latestFitness.soreness != null ? ` · soreness ${latestFitness.soreness}/10` : ''}` }] : [])]}/></BriefSection><BriefSection title="Ritual, Beauty & Hair"><Rows rows={[...(morningRoutine ? [{ title: morningRoutine.name, meta: lowEnergy ? 'Recorded energy is low; choose the shortest existing version that preserves essentials.' : 'Morning routine available in Routines.' }] : []), ...beautyRows, ...(latestHair?.nextAction ? [{ title: latestHair.nextAction, meta: `From the latest ${latestHair.eventType} hair record` }] : [])]}/></BriefSection><BriefSection title="Food, finance & reminders"><Rows rows={[{ title: 'Meal plan', meta: 'No dedicated meal record is assumed here. Open Food to review the real planning workspace.' }, ...(monthSpend ? [{ title: `$${monthSpend.toFixed(2)} recorded expenses this month`, meta: 'Historical entries only; no unsupported budget threshold inferred.' }] : []), ...(notes[0] ? [{ title: notes[0].title, meta: 'Most recent stored note · review only if relevant today' }] : [])]}/></BriefSection></aside>
    </div> : <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
      <div className="space-y-3"><BriefSection title="Today in review"><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{[[completedToday.length,'tasks completed'],[dueToday.length,'tasks unfinished'],[todayEvents.length,'appointments'],[habitDone,`of ${habits.length} habits`]].map(([value,label]) => <div key={label} className="rounded-xl bg-white/55 p-3"><b className="glow-display text-xl">{value}</b><p className="text-[8px] text-[#7d727f]">{label}</p></div>)}</div></BriefSection><BriefSection title="Carry forward"><Rows rows={dueToday.map(task => ({ title: task.title, meta: 'Needs decision · no task was moved or deleted' }))}/></BriefSection><BriefSection title="Tomorrow preview"><Rows rows={tomorrowEvents.map(event => ({ title: event.title, meta: `${time(event.startAt)}${event.location ? ` · ${event.location}` : ''}` }))}/></BriefSection><BriefSection title="What Glow OS noticed"><Rows rows={[...(dueToday.length ? [{ title: `${dueToday.length} unfinished dated item${dueToday.length === 1 ? '' : 's'}`, meta: 'Review individually before carrying forward.' }] : []), ...(wellnessToday ? [{ title: 'A wellness check-in is available', meta: `Energy ${wellnessToday.energy ?? 'not recorded'} · mood ${wellnessToday.mood ?? 'not recorded'}` }] : []), ...(beautyRows.length ? [{ title: 'Evening beauty records are available', meta: 'Open Beauty to complete or review them; no completion is assumed.' }] : [])]}/></BriefSection></div>
      <aside className="space-y-3"><BriefSection title="Prepare tonight"><Rows rows={[...(tomorrowEvents[0] ? [{ title: `Prepare for ${tomorrowEvents[0].title}`, meta: `First stored appointment is ${time(tomorrowEvents[0].startAt)}` }] : []), ...(eveningRoutine ? [{ title: eveningRoutine.name, meta: 'Existing night ritual · completion not assumed' }] : []), ...beautyRows, ...(latestHair?.nextAction ? [{ title: latestHair.nextAction, meta: 'Latest stored hair next action' }] : [])]}/></BriefSection><BriefSection title="Personal reflection"><p className="text-[10px] leading-5">Win of the day · What felt hard? · What do you want tomorrow to feel like?</p><Link href="/notes" className="mt-3 inline-flex rounded-lg border border-[#ddd5e5] px-3 py-2 text-[9px]">Reflect in Notes</Link></BriefSection></aside>
    </div>}
    <Card className="bg-[linear-gradient(100deg,#f4e5e4,#fffaf6)] p-5"><div className="flex gap-3"><Sparkles size={16} className="text-[#b67680]"/><div><p className="text-[8px] font-bold uppercase tracking-[.15em]">{view === 'morning' ? 'Your best use of today' : 'Finish with intention'}</p><p className="glow-display mt-2 text-[18px] leading-6">{bestUse}</p></div></div><div className="mt-5 flex flex-wrap gap-2">{(view === 'morning' ? [['Build My Day','/today'],['Start Morning Routine','/routines'],['Adjust My Schedule','/calendar'],['Plan My Meals','/food'],['Show Top Priority','/tasks']] : [['Start Night Ritual','/routines'],['Prepare Tomorrow','/tomorrow'],['Review Unfinished Tasks','/tasks'],['Complete PM Skincare','/beauty']]).map(([label, href]) => <Link key={label} href={href} className="rounded-full border border-[#e1d1cc] bg-white/65 px-3 py-2 text-[8px] font-medium">{label}</Link>)}</div></Card>
  </div></AppShell>;
}
