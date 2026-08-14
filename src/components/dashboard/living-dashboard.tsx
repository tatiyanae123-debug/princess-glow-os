'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  Bell, CalendarDays, Check, ChevronRight, Dumbbell, Droplets, ListTodo,
  MessageCircle, NotebookPen, Plus, Search, Sparkles, Sun, Target, Utensils, type LucideIcon,
} from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { updateTaskAction } from '@/app/actions/tasks';
import { logHabitAction } from '@/app/actions/habits';

const HERO_IMAGE = 'https://media.licdn.com/dms/image/v2/C4E1BAQFxkCCuXBf1rw/company-background_10000/company-background_10000/0/1651792059318/fantastic_frank_lisbon_cover?e=2147483647&t=hrd5Ip8w0WIhE0spIuRyw1zfC7k4faJJF8OXpOD8dKA&v=beta';
const INSIGHT_IMAGE = 'https://comportahouse.pt/wp-content/uploads/2024/03/1825-2204J-SAMA-T4-LIVING-02.jpg';

function fmtTime(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function fmtDuration(start: Date, end?: Date | null) {
  if (!end) return '';
  const minutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
  if (minutes >= 60 && minutes % 60 === 0) return `${minutes / 60}h`;
  return `${minutes} min`;
}
function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`v3-surface overflow-hidden rounded-[13px] border border-[#e9e4e1] bg-white shadow-[0_2px_12px_rgba(57,40,31,.025)] ${className}`}>{children}</section>;
}
function Metric({ icon: Icon, label, title, meta, href, tone='rose' }: { icon: LucideIcon; label:string; title:string; meta:React.ReactNode; href:string; tone?:'rose'|'gold' }) {
  const bg = tone === 'gold' ? '#f8efe4' : '#fae7e9';
  const fg = tone === 'gold' ? '#a78050' : '#bf5a71';
  return <Link href={href} className="block h-[136px] min-w-0 border-r border-[#ece7e4] px-[16px] py-[14px] transition hover:bg-[#fffafa] active:scale-[.995] last:border-r-0">
    <div className="flex items-center gap-[9px] text-[10px] font-medium text-[#4d4743]"><span className="flex h-[28px] w-[28px] items-center justify-center rounded-full" style={{background:bg,color:fg}}><Icon size={14} strokeWidth={1.55}/></span>{label}</div>
    <p className="mt-[10px] min-h-[38px] line-clamp-2 text-[16px] font-medium leading-[1.18] text-[#24201e]">{title}</p>
    <div className="mt-[8px] flex min-h-[16px] items-center justify-between text-[9px] text-[#8d8580]">{meta}<ChevronRight size={11}/></div>
  </Link>;
}

export function LivingDashboard({ data, error, insight, userName }: { data: LivingDashboardData; error?: string; insight?: string | null; userName?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyTask, setBusyTask] = useState<string | null>(null);
  const [busyHabit, setBusyHabit] = useState<string | null>(null);
  const now = new Date();
  const name = userName ?? 'Tatiyana';
  const topTask = data.topPriorityTasks[0] ?? null;
  const scheduled = useMemo(() => [...data.todaySchedule.events].sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()), [data.todaySchedule.events]);
  const nextEvent = scheduled.find(e=>e.startAt.getTime()>=now.getTime()) ?? null;
  const routine = data.routinesForNow[0] ?? null;
  const wellness = data.wellnessToday.entry;
  const tasks = data.topPriorityTasks.slice(0,5);
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate()+1);
  const dateTop = now.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'});
  const tomorrowLabel = tomorrow.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  const alertTitle = data.todayOverview.tasksDueToday > 0
    ? `${data.todayOverview.tasksDueToday} task${data.todayOverview.tasksDueToday===1?'':'s'} due today`
    : data.gmailInbox.unreadCount > 0
      ? `${data.gmailInbox.unreadCount} unread Gmail message${data.gmailInbox.unreadCount===1?'':'s'}`
      : 'No urgent alerts';
  const alertMeta = data.todayOverview.tasksDueToday > 0 ? 'Needs attention' : data.gmailInbox.unreadCount > 0 ? 'Open inbox' : 'All clear';

  function openSearch(){ document.dispatchEvent(new CustomEvent('glow:search-open')); }
  function quickAdd(module?:string){ document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:module?{module}:{}})); }
  function completeTask(id:string){
    setBusyTask(id);
    startTransition(async()=>{
      await updateTaskAction(id,{status:'done'});
      setBusyTask(null);
      router.refresh();
    });
  }
  function logHabit(id:string){
    setBusyHabit(id);
    startTransition(async()=>{
      await logHabitAction({habitId:id,loggedDate:dateKey(),count:1});
      setBusyHabit(null);
      router.refresh();
    });
  }

  return <div className="min-h-[1024px] w-full bg-[#f8f4f2] text-[#2a2522]">
    {error ? <div className="fixed left-1/2 top-3 z-[80] -translate-x-1/2 rounded-full border border-[#f0d7da] bg-white px-3 py-1.5 text-[9px] text-[#9b7277] shadow-sm">Some live data could not load. Glow is showing only confirmed data.</div> : null}

    <header className="relative h-[229px] overflow-hidden border-b border-[#ebe5e2] bg-[#f6f2ef]">
      <div className="absolute inset-0 bg-cover bg-[center_58%]" style={{backgroundImage:`linear-gradient(90deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.68) 31%,rgba(255,255,255,.08) 57%,rgba(255,255,255,.13) 100%),url(${HERO_IMAGE})`}}/>
      <div className="relative h-full">
        <button type="button" onClick={openSearch} className="absolute left-[42%] top-[14px] flex h-[35px] w-[274px] items-center gap-2 rounded-full border border-white/85 bg-white/90 px-[14px] text-left text-[9px] text-[#776f6a] shadow-[0_2px_8px_rgba(50,40,35,.05)]"><Search size={12}/><span className="flex-1">Ask Glow anything...</span><span className="text-[8px] text-[#9c948e]">⌘K</span></button>
        <div className="absolute right-[18px] top-[14px] flex items-center gap-[11px]">
          <Link href="/wellness" className="flex items-center gap-[7px] border-r border-[#d6cfca] pr-[14px]"><Sun size={19} className="text-[#d9aa4b]"/><span className="text-[10px] leading-[1.2]"><b className="font-medium">Weather</b><br/><span className="text-[8px] text-[#77706a]">Open wellness</span></span></Link>
          <Link href="/calendar" className="w-[103px] border-r border-[#d6cfca] pr-[13px] text-[9px] leading-[1.25]">{dateTop}</Link>
          <button type="button" onClick={()=>quickAdd()} aria-label="Create" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#c1506d] text-white"><Plus size={16}/></button>
          <Link href="/calendar" aria-label="Calendar" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 text-[#423b37]"><CalendarDays size={14}/></Link>
          <Link href="/gmail" aria-label="Messages" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 text-[#423b37]"><MessageCircle size={14}/></Link>
          <Link href="/settings?section=profile" aria-label="Profile" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#f7d1d8] text-[11px] font-medium text-[#6f3d49]">T</Link>
        </div>
        <div className="absolute left-[50px] top-[49px]">
          <h1 className="font-serif text-[43px] leading-[.98] tracking-[-.025em] text-[#201d1b]">{data.greeting.label},<br/><span className="text-[#c45c74]">{name}</span></h1>
          <p className="mt-[10px] max-w-[360px] text-[11px] text-[#625b56]">{data.greeting.message}</p>
          <Link href="/briefings" className="mt-[11px] inline-flex h-[30px] items-center rounded-[4px] bg-[#b94f69] px-[14px] text-[10px] font-medium text-white">Open Briefing</Link>
        </div>
      </div>
    </header>

    <div className="grid gap-[10px] px-[9px] pb-[18px] pt-0 xl:grid-cols-[minmax(0,964px)_304px]">
      <main className="min-w-0 space-y-[10px]">
        <Card className="grid min-h-[154px] grid-cols-2 rounded-t-none p-0 md:grid-cols-4">
          <Metric icon={Target} label="Today's Focus" title={topTask?.title ?? 'No priority task selected'} href={topTask?`/tasks?selected=${encodeURIComponent(topTask.id)}`:'/tasks'} meta={<span>{topTask ? topTask.priority : 'Choose a focus'}</span>}/>
          <Metric icon={CalendarDays} tone="gold" label="Next Event" title={nextEvent?.title ?? 'No upcoming event'} href={nextEvent?`/calendar?event=${encodeURIComponent(nextEvent.id)}`:'/calendar'} meta={<span>{nextEvent?`${fmtTime(nextEvent.startAt)}${nextEvent.endAt?` – ${fmtTime(nextEvent.endAt)}`:''}`:'Calendar is clear'}</span>}/>
          <Metric icon={Sun} tone="gold" label="Current Routine" title={routine?.name ?? 'No routine active now'} href={routine?`/routines?selected=${encodeURIComponent(routine.id)}`:'/routines'} meta={<span>{routine ? routine.timeOfDay : 'Open routines'}</span>}/>
          <Metric icon={Bell} label="Important Alert" title={alertTitle} href={data.todayOverview.tasksDueToday>0?'/tasks':data.gmailInbox.unreadCount>0?'/gmail':'/notices'} meta={<span>{alertMeta}</span>}/>
        </Card>

        <div className="grid gap-[10px] lg:grid-cols-[280px_280px_minmax(0,1fr)]">
          <Card className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Today at a Glance</h2><Link href="/calendar" className="text-[8px] text-[#b85d72]">View all</Link></div><div className="mt-[10px] space-y-[3px]">{scheduled.slice(0,5).map((event)=><Link key={event.id} href={`/calendar?event=${encodeURIComponent(event.id)}`} className="grid min-h-[28px] grid-cols-[64px_1fr_auto] items-center gap-[6px] rounded-[5px] px-[5px] text-[8.5px] transition hover:bg-[#fae6e7]"><span>{event.allDay?'All day':fmtTime(event.startAt)}</span><span className="truncate">{event.title}</span><span className="text-[7px] text-[#9a918b]">{fmtDuration(event.startAt,event.endAt)}</span></Link>)}{scheduled.length===0?<p className="py-12 text-center text-[9px] text-[#918782]">Nothing scheduled today.</p>:null}</div></Card>

          <Card className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Top Tasks</h2><Link href="/tasks" className="text-[8px] text-[#b85d72]">View all</Link></div><div className="mt-[11px] space-y-[4px]">{tasks.map((task)=><div key={task.id} className="flex min-h-[30px] items-center gap-[8px] text-[9px]"><button type="button" disabled={pending&&busyTask===task.id} onClick={()=>completeTask(task.id)} aria-label={`Complete ${task.title}`} className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full border border-[#b9b0ab] transition hover:border-[#c45f76] hover:bg-[#fae6e7] disabled:opacity-40">{busyTask===task.id?<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c45f76]"/>:null}</button><Link href={`/tasks?selected=${encodeURIComponent(task.id)}`} className="min-w-0 flex-1 truncate hover:text-[#b85d72]">{task.title}</Link></div>)}{tasks.length===0?<p className="py-12 text-center text-[9px] text-[#918782]">No priority tasks yet.</p>:null}</div></Card>

          <Card className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Life Pulse</h2><Link href="/graph" className="text-[8px] text-[#b85d72]">View graph</Link></div><div className="mt-5 grid grid-cols-2 gap-3 text-[9px] sm:grid-cols-3">{[
            ['Energy', wellness?.energy != null ? `${wellness.energy}/10` : 'Not logged'],
            ['Schedule', scheduled.length ? `${scheduled.length} events` : 'Open'],
            ['Wellness', data.wellnessToday.loggedToday ? 'Logged' : 'Check in'],
            ['Focus', topTask ? topTask.priority : 'Not set'],
            ['Goals', `${data.projectStatus.goalsInProgress} active`],
            ['Mood', wellness?.mood ?? 'Not logged'],
          ].map(([label,value])=><div key={label} className="rounded-[10px] bg-[#fdf8f6] p-3"><p className="text-[8px] uppercase tracking-[.08em] text-[#928781]">{label}</p><p className="mt-1 font-medium capitalize text-[#3e3733]">{value}</p></div>)}</div></Card>
        </div>

        <div className="grid gap-[10px] md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_.8fr_.8fr]">
          <Card className="p-[14px]"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Habit Tracker</h2><Link href="/habits" className="text-[8px] text-[#b85d72]">View all</Link></div><div className="mt-3 space-y-2">{data.habitSummary.habits.slice(0,4).map(habit=><div key={habit.id} className="flex items-center gap-2"><button type="button" disabled={habit.completedToday || (pending&&busyHabit===habit.id)} onClick={()=>logHabit(habit.id)} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${habit.completedToday?'border-[#7e9f77] bg-[#7e9f77] text-white':'border-[#c9beb8] hover:border-[#c45f76]'}`}>{habit.completedToday?<Check size={11}/>:busyHabit===habit.id?<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c45f76]"/>:null}</button><span className="min-w-0 flex-1 truncate text-[9px]">{habit.name}</span></div>)}{data.habitSummary.habits.length===0?<p className="py-5 text-[9px] text-[#918782]">No habits configured.</p>:null}</div></Card>

          <Card className="p-[14px]"><div className="flex items-center gap-2"><Dumbbell size={14} className="text-[#9a7a3d]"/><h2 className="text-[10px] font-medium">Fitness</h2></div><p className="mt-3 text-[13px] font-medium">{data.workoutOfTheDay.label || 'No workout planned'}</p><p className="mt-1 text-[9px] text-[#8c827c]">{data.workoutOfTheDay.focus || 'Open Fitness to plan today.'}</p><Link href="/fitness" className="mt-4 inline-flex text-[8px] text-[#b85d72]">Open Fitness →</Link></Card>

          <Card className="p-[14px]"><div className="flex items-center gap-2"><Droplets size={14} className="text-[#758fa6]"/><h2 className="text-[10px] font-medium">Wellness</h2></div><p className="mt-3 text-[18px] font-medium">{wellness?.waterGlasses ?? 0}</p><p className="text-[8px] text-[#8c827c]">glasses logged</p><Link href="/wellness" className="mt-4 inline-flex text-[8px] text-[#b85d72]">Check in →</Link></Card>

          <Card className="p-[14px]"><div className="flex items-center gap-2"><Utensils size={14} className="text-[#a78050]"/><h2 className="text-[10px] font-medium">Food</h2></div><p className="mt-3 text-[10px] text-[#5f5752]">Open your meal plan, groceries, and nutrition logs.</p><Link href="/food" className="mt-4 inline-flex text-[8px] text-[#b85d72]">Open Food →</Link></Card>
        </div>

        <Card className="grid gap-3 p-[14px] sm:grid-cols-3">
          <Link href="/today" className="rounded-[10px] bg-[#fae6e7] p-3"><Sparkles size={13} className="text-[#b85d72]"/><p className="mt-2 text-[9px] font-medium">Day Mode</p><p className="mt-1 text-[8px] text-[#8d8580]">Choose Productive, Bare Minimum, Clear Everything, or Highly Productive.</p></Link>
          <Link href="/notes" className="rounded-[10px] bg-[#f8f4f2] p-3"><NotebookPen size={13}/><p className="mt-2 text-[9px] font-medium">Notes + Memory</p><p className="mt-1 text-[8px] text-[#8d8580]">Capture a thought or open your knowledge system.</p></Link>
          <button type="button" onClick={()=>quickAdd()} className="rounded-[10px] bg-[#f8f4f2] p-3 text-left"><Plus size={13}/><p className="mt-2 text-[9px] font-medium">Add Anything</p><p className="mt-1 text-[8px] text-[#8d8580]">Create or capture without leaving the dashboard.</p></button>
        </Card>
      </main>

      <aside className="space-y-[10px] pt-[10px] xl:pt-0">
        <Card className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Glow Insight</h2><Sparkles size={13} className="text-[#c45f76]"/></div><p className="mt-3 text-[12px] leading-5 text-[#4d4540]">{insight ?? data.greeting.title}</p><Link href="/brain" className="mt-4 inline-flex text-[8px] text-[#b85d72]">Ask Glow why →</Link></Card>
        <Link href="/briefings/evening" className="relative block min-h-[170px] overflow-hidden rounded-[13px] bg-cover bg-center p-[16px] text-white shadow-[0_10px_28px_rgba(56,39,33,.13)]" style={{backgroundImage:`linear-gradient(180deg,rgba(40,30,27,.10),rgba(40,30,27,.62)),url(${INSIGHT_IMAGE})`}}><p className="text-[9px] uppercase tracking-[.12em]">Evening Debrief</p><p className="mt-[70px] font-serif text-[20px] leading-[1.05]">Close the day with clarity.</p></Link>
        <Card className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Tomorrow Preview</h2><span className="text-[8px] text-[#8f8781]">{tomorrowLabel}</span></div><p className="mt-3 text-[9px] text-[#706863]">Glow will build tomorrow from your saved calendar, tasks, routines, and day review.</p><Link href="/tomorrow" className="mt-4 inline-flex text-[8px] text-[#b85d72]">Open tomorrow →</Link></Card>
        <Card className="p-[15px]"><div className="flex items-center gap-2"><ListTodo size={13}/><h2 className="text-[11px] font-medium">System Status</h2></div><div className="mt-3 space-y-2 text-[9px]"><div className="flex justify-between"><span>Google Calendar</span><span>{data.googleCalendar.status.replaceAll('_',' ')}</span></div><div className="flex justify-between"><span>Gmail</span><span>{data.gmailInbox.status.replaceAll('_',' ')}</span></div><div className="flex justify-between"><span>Imports</span><span>{data.importStatus.totalConfirmed}</span></div></div><Link href="/connections" className="mt-4 inline-flex text-[8px] text-[#b85d72]">Manage connections →</Link></Card>
      </aside>
    </div>
  </div>;
}
