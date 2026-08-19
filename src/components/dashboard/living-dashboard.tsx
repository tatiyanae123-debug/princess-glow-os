'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  Bell, CalendarDays, Check, ChevronRight, Droplets, MessageCircle, Plus,
  Search, Sparkles, Sun, Target, Utensils, type LucideIcon,
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
  return <section className={`v3-surface overflow-hidden rounded-[10px] border border-[#ebe5e1] bg-white shadow-[0_5px_20px_rgba(62,43,36,.035)] ${className}`}>{children}</section>;
}
function Metric({ icon: Icon, label, title, meta, href, tone='rose' }: { icon: LucideIcon; label:string; title:string; meta:React.ReactNode; href:string; tone?:'rose'|'gold' }) {
  const bg = tone === 'gold' ? '#f7eee3' : '#f9e6e8';
  const fg = tone === 'gold' ? '#9e7a4a' : '#bd5d72';
  return <Link href={href} className="block h-[112px] min-w-0 border-r border-[#ece6e2] px-[13px] py-[11px] transition hover:bg-[#fffafa] active:scale-[.995] last:border-r-0">
    <div className="flex items-center gap-[7px] text-[8.5px] font-medium text-[#514945]"><span className="flex h-[24px] w-[24px] items-center justify-center rounded-full" style={{background:bg,color:fg}}><Icon size={12} strokeWidth={1.5}/></span>{label}</div>
    <p className="mt-[8px] line-clamp-2 text-[13.5px] font-medium leading-[1.16] text-[#27221f]">{title}</p>
    <div className="mt-[7px] flex min-h-[13px] items-center justify-between text-[7.5px] text-[#8f8680]">{meta}<ChevronRight size={10}/></div>
  </Link>;
}

function PulseVisual() {
  return <div className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center rounded-full p-[7px]" style={{background:'conic-gradient(#719c66 0 28%,#dce6d7 28% 35%,#719c66 35% 61%,#dce6d7 61% 68%,#719c66 68% 92%,#dce6d7 92% 100%)'}}>
    <div className="relative h-full w-full overflow-hidden rounded-full border-[6px] border-white bg-[#fffaf8] shadow-[inset_0_0_0_1px_#eee5e1]">
      <span className="absolute left-[20%] top-[53%] h-[34%] w-[62%] rounded-[48%_52%_44%_56%] bg-[#dce7d7] opacity-90 blur-[1px]"/>
      <span className="absolute left-[17%] top-[39%] h-[37%] w-[66%] rounded-[54%_46%_60%_40%] bg-[#efe3c7] opacity-88"/>
      <span className="absolute left-[22%] top-[29%] h-[39%] w-[61%] rounded-[43%_57%_48%_52%] bg-[#edcbd5] opacity-88 shadow-[0_5px_12px_rgba(181,107,126,.18)]"/>
      <span className="absolute left-[30%] top-[22%] h-[30%] w-[49%] rounded-[55%_45%_58%_42%] bg-[#e5d8ee] opacity-78"/>
      <span className="absolute left-[31%] top-[37%] h-[26%] w-[43%] rounded-[46%_54%_45%_55%] bg-[#f3d9df] opacity-95"/>
    </div>
  </div>;
}

const WORLD_LINKS = [
  ['Mind','Brain, Memory + more','/brain','linear-gradient(135deg,#e7ded7,#b6a99e)'],
  ['Wellness','Health, Fitness, Food','/wellness','linear-gradient(135deg,#dce8dc,#809b82)'],
  ['Beauty','Skin, Hair, Lab','/beauty','linear-gradient(135deg,#f7e7e7,#d3b7a6)'],
  ['Finance','Financial Brain','/finance','linear-gradient(135deg,#dfdfd8,#8c817b)'],
  ['Creative Studio','Projects, Ideas','/creative-studio','linear-gradient(135deg,#eee5df,#ba9c8a)'],
  ['Home','Home, Tasks','/home','linear-gradient(135deg,#f4e9e2,#c6ad98)'],
  ['Travel','Trips, Destinations','/timeline','linear-gradient(135deg,#bcd4de,#b99c7f)'],
  ['Saint','His space','/home','linear-gradient(135deg,#d8c6b1,#9f7e62)'],
] as const;

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
  const dateLine1 = now.toLocaleDateString('en-US',{weekday:'long'});
  const dateLine2 = now.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
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

  return <div className="h-[1024px] w-[1298px] overflow-hidden bg-[#f9f5f3] text-[#2a2522]">
    {error ? <div className="fixed left-1/2 top-3 z-[80] -translate-x-1/2 rounded-full border border-[#f0d7da] bg-white px-3 py-1.5 text-[9px] text-[#9b7277] shadow-sm">Some live data could not load. Glow is showing only confirmed data.</div> : null}

    <header className="relative h-[202px] overflow-hidden border-b border-[#ebe5e2] bg-[#f6f2ef]">
      <div className="absolute inset-0 bg-cover bg-[center_54%]" style={{backgroundImage:`linear-gradient(90deg,rgba(255,255,255,.95) 0%,rgba(255,255,255,.86) 27%,rgba(255,255,255,.18) 48%,rgba(255,255,255,.02) 78%,rgba(255,255,255,.13) 100%),url(${HERO_IMAGE})`}}/>
      <div className="absolute inset-0 shadow-[inset_0_-18px_30px_rgba(72,52,42,.035)]"/>
      <button type="button" onClick={openSearch} className="absolute left-[46%] top-[14px] flex h-[30px] w-[266px] items-center gap-2 rounded-full border border-white/90 bg-white/88 px-[13px] text-left text-[8px] text-[#756d67] shadow-[0_4px_18px_rgba(50,40,35,.05)] backdrop-blur-sm"><Search size={11}/><span className="flex-1">Ask Glow anything...</span><span className="text-[7px] text-[#9c948e]">⌘K</span></button>
      <div className="absolute right-[17px] top-[13px] flex items-center gap-[9px]">
        <Link href="/wellness" className="flex items-center gap-[6px] border-r border-[#d4ccc7] pr-[12px]"><Sun size={17} className="text-[#d9aa4b]"/><span className="text-[8px] leading-[1.18]"><b className="font-medium">Weather</b><br/><span className="text-[7px] text-[#77706a]">Wellness</span></span></Link>
        <Link href="/calendar" className="w-[94px] border-r border-[#d4ccc7] pr-[11px] text-[8px] leading-[1.2]"><span className="block font-medium">{dateLine1}</span><span className="text-[#77706a]">{dateLine2}</span></Link>
        <button type="button" onClick={()=>quickAdd()} aria-label="Create" className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#c0506c] text-white"><Plus size={15}/></button>
        <Link href="/calendar" aria-label="Calendar" className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-white/92 text-[#423b37] shadow-sm"><CalendarDays size={13}/></Link>
        <Link href="/gmail" aria-label="Messages" className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-white/92 text-[#423b37] shadow-sm"><MessageCircle size={13}/></Link>
        <Link href="/settings?section=profile" aria-label="Profile" className="flex h-[31px] w-[31px] items-center justify-center rounded-full bg-[#f7d1d8] text-[10px] font-medium text-[#6f3d49]">{name.charAt(0).toUpperCase()}</Link>
      </div>
      <div className="absolute left-[48px] top-[48px]">
        <h1 className="font-serif text-[38px] leading-[.94] tracking-[-.03em] text-[#211d1b]">Good morning,<br/><span className="text-[#c45c74]">{name}</span></h1>
        <p className="mt-[10px] max-w-[310px] text-[9.5px] text-[#625b56]">{data.greeting.message}</p>
        <Link href="/briefings" className="mt-[10px] inline-flex h-[28px] items-center rounded-[4px] bg-[#b94f69] px-[14px] text-[8.5px] font-medium text-white shadow-[0_4px_12px_rgba(174,72,97,.14)]">Morning Brief</Link>
      </div>
    </header>

    <div className="grid h-[822px] grid-cols-[944px_332px] gap-[10px] px-[10px] pb-[10px]">
      <main className="min-w-0 space-y-[10px]">
        <Card className="grid h-[119px] grid-cols-4 rounded-t-none p-0 shadow-[0_10px_28px_rgba(65,46,37,.055)]">
          <Metric icon={Target} label="Today's Focus" title={topTask?.title ?? 'No priority task selected'} href={topTask?`/tasks?taskId=${encodeURIComponent(topTask.id)}&view=all`:'/tasks'} meta={<span>{topTask ? `${topTask.priority} priority` : 'Choose a focus'}</span>}/>
          <Metric icon={CalendarDays} tone="gold" label="Next Event" title={nextEvent?.title ?? 'No upcoming event'} href={nextEvent?`/calendar?eventId=${encodeURIComponent(nextEvent.id)}&view=day`:'/calendar?view=day'} meta={<span>{nextEvent?`${fmtTime(nextEvent.startAt)}${nextEvent.endAt?` – ${fmtTime(nextEvent.endAt)}`:''}`:'Calendar is clear'}</span>}/>
          <Metric icon={Sun} tone="gold" label="Morning Routine" title={routine?.name ?? 'No routine active now'} href={routine?`/routines?routineId=${encodeURIComponent(routine.id)}`:'/routines'} meta={<span>{routine ? routine.timeOfDay : 'Open routines'}</span>}/>
          <Metric icon={Bell} label="Important Alert" title={alertTitle} href={data.todayOverview.tasksDueToday>0?'/tasks':data.gmailInbox.unreadCount>0?'/gmail':'/notices'} meta={<span>{alertMeta}</span>}/>
        </Card>

        <div className="grid h-[214px] grid-cols-[278px_278px_minmax(0,1fr)] gap-[10px]">
          <Card className="p-[13px]"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Today at a Glance</h2><Link href="/calendar?view=day" className="text-[7px] text-[#b85d72]">View full day →</Link></div><div className="mt-[8px] space-y-[2px]">{scheduled.slice(0,5).map((event)=><Link key={event.id} href={`/calendar?eventId=${encodeURIComponent(event.id)}&view=day`} className="grid min-h-[26px] grid-cols-[58px_1fr_auto] items-center gap-[5px] rounded-[5px] px-[4px] text-[7.8px] transition hover:bg-[#fae6e7]"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#c9687c]"/>{event.allDay?'All day':fmtTime(event.startAt)}</span><span className="truncate">{event.title}</span><span className="text-[6.7px] text-[#9a918b]">{fmtDuration(event.startAt,event.endAt)}</span></Link>)}{scheduled.length===0?<p className="py-12 text-center text-[8px] text-[#918782]">Nothing scheduled today.</p>:null}</div></Card>

          <Card className="p-[13px]"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Top Tasks</h2><Link href="/tasks" className="text-[7px] text-[#b85d72]">View all</Link></div><div className="mt-[8px] space-y-[3px]">{tasks.map((task)=><div key={task.id} className="flex min-h-[25px] items-center gap-[7px] text-[8px]"><button type="button" disabled={pending&&busyTask===task.id} onClick={()=>completeTask(task.id)} aria-label={`Complete ${task.title}`} className="flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border border-[#b9b0ab] transition hover:border-[#c45f76] hover:bg-[#fae6e7] disabled:opacity-40">{busyTask===task.id?<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#c45f76]"/>:null}</button><Link href={`/tasks?taskId=${encodeURIComponent(task.id)}&view=all`} className="min-w-0 flex-1 truncate hover:text-[#b85d72]">{task.title}</Link></div>)}{tasks.length===0?<p className="py-12 text-center text-[8px] text-[#918782]">No priority tasks yet.</p>:null}</div></Card>

          <Card className="p-[13px]"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Life Pulse</h2><Link href="/graph" className="text-[7px] text-[#b85d72]">View full pulse →</Link></div><div className="mt-[8px] flex items-center gap-[18px]"><PulseVisual/><div className="min-w-0 flex-1 space-y-[5px] text-[7.5px]">{[
            ['Energy', wellness?.energy != null ? `${wellness.energy}/10` : '—'],
            ['Schedule', scheduled.length ? `${scheduled.length} events` : 'Open'],
            ['Wellness', data.wellnessToday.loggedToday ? 'Good' : 'Check in'],
            ['Focus', topTask ? topTask.priority : '—'],
            ['Finances', data.projectStatus.activeTaskCount ? 'Active' : 'Open'],
            ['Mood', wellness?.mood ?? '—'],
          ].map(([label,value])=><div key={label} className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#789d6d]"/>{label}</span><span className="capitalize text-[#63845d]">{value}</span></div>)}</div></div></Card>
        </div>

        <div className="grid h-[150px] grid-cols-[1.2fr_1fr_.76fr_.76fr] gap-[10px]">
          <Card className="p-[12px]"><div className="flex items-center justify-between"><h2 className="text-[9px] font-medium">Habit Tracker</h2><Link href="/habits" className="text-[6.8px] text-[#b85d72]">View all habits →</Link></div><div className="mt-[10px] grid grid-cols-4 gap-2 text-center">{data.habitSummary.habits.slice(0,4).map((habit,index)=><div key={habit.id} className="min-w-0"><button type="button" disabled={habit.completedToday || (pending&&busyHabit===habit.id)} onClick={()=>logHabit(habit.id)} className={`mx-auto flex h-[32px] w-[32px] items-center justify-center rounded-full border ${habit.completedToday?'border-[#7e9f77] bg-[#eff6ed] text-[#6f9468]':'border-[#d9d0ca] bg-white text-[#8f8179]'}`}>{habit.completedToday?<Check size={12}/>:index===0?'↟':index===1?'◔':index===2?'♧':'□'}</button><Link href={`/habits?habitId=${encodeURIComponent(habit.id)}`} className="mt-1.5 block truncate text-[6.8px] text-[#726964] hover:text-[#b85d72]">{habit.name}</Link></div>)}{data.habitSummary.habits.length===0?<p className="col-span-4 py-6 text-[8px] text-[#918782]">No habits configured.</p>:null}</div></Card>

          <Card className="p-[12px]"><div className="flex items-center justify-between"><h2 className="text-[9px] font-medium">Nutrition</h2><span className="text-[6.5px] text-[#9b918a]">Today</span></div><div className="mt-[12px]"><div className="flex items-baseline gap-1"><Utensils size={13} className="text-[#a77f4e]"/><p className="text-[12px] font-medium">Meal plan</p></div><p className="mt-2 text-[7px] text-[#8c827c]">Open your real meals, groceries, and nutrition.</p><div className="mt-3 h-[3px] rounded-full bg-[#efe7e3]"><div className="h-full w-[58%] rounded-full bg-[#b84f6a]"/></div><Link href="/food" className="mt-3 inline-flex text-[6.8px] text-[#b85d72]">View nutrition →</Link></div></Card>

          <Card className="p-[12px]"><div className="flex items-center justify-between"><h2 className="text-[9px] font-medium">Sleep</h2><span className="text-[6.5px] text-[#9b918a]">Last night</span></div><p className="mt-[12px] text-[20px] font-medium leading-none">—</p><p className="mt-1 text-[7px] text-[#73936d]">Not logged</p><div className="mt-4 flex h-[28px] items-end gap-[3px]">{[12,18,15,23,19,26,17,22].map((height,index)=><span key={index} className="w-[4px] rounded-t bg-[#9a83c2]" style={{height}}/>)}</div><Link href="/wellness" className="mt-2 inline-flex text-[6.8px] text-[#b85d72]">View sleep →</Link></Card>

          <Card className="p-[12px]"><div className="flex items-center justify-between"><h2 className="text-[9px] font-medium">Mood</h2><span className="text-[6.5px] text-[#9b918a]">Today</span></div><Link href="/wellness" className="mt-[10px] flex flex-col items-center"><span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#e7e2f1] text-[26px] text-[#7e6da4]">⌣</span><span className="mt-2 text-[7.5px] capitalize">{wellness?.mood??'Check in'}</span><span className="mt-1 text-[6.5px] text-[#b85d72]">Log your mood →</span></Link></Card>
        </div>

        <Card className="h-[177px] p-[12px]"><div className="flex items-center justify-between"><h2 className="text-[9px] font-medium">Explore Your World</h2><Link href="/all-rooms" className="text-[6.8px] text-[#b85d72]">All rooms →</Link></div><div className="mt-[10px] grid grid-cols-8 gap-[7px]">{WORLD_LINKS.map(([title,subtitle,href,bg])=><Link href={href} key={title} className="group min-w-0"><div className="h-[81px] rounded-[7px] border border-[#eee6e2] transition group-hover:-translate-y-px group-hover:shadow-sm" style={{background:bg}}/><p className="mt-1.5 truncate text-[7.3px] font-medium">{title}</p><p className="truncate text-[6px] text-[#9b918a]">{subtitle}</p></Link>)}</div></Card>
      </main>

      <aside className="space-y-[10px] pt-[119px]">
        <Card className="h-[178px] p-[13px]"><div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Upcoming</h2><Link href="/calendar" className="text-[6.8px] text-[#b85d72]">View all</Link></div><div className="mt-[9px] space-y-[7px]">{scheduled.slice(0,4).map(event=><Link key={event.id} href={`/calendar?eventId=${encodeURIComponent(event.id)}&view=day`} className="grid grid-cols-[44px_1fr] gap-2 text-[7.2px]"><span className="text-[#7f756f]">{event.allDay?'Today':fmtTime(event.startAt)}</span><span className="truncate"><span className="block font-medium text-[#403936]">{event.title}</span><span className="text-[6.4px] text-[#9c928c]">{event.allDay?'All day':fmtTime(event.startAt)}</span></span></Link>)}{scheduled.length===0?<p className="py-8 text-center text-[8px] text-[#918782]">Nothing upcoming today.</p>:null}</div></Card>

        <Link href="/brain" className="relative block h-[184px] overflow-hidden rounded-[10px] bg-cover bg-center p-[14px] text-white shadow-[0_8px_22px_rgba(56,39,33,.12)]" style={{backgroundImage:`linear-gradient(90deg,rgba(58,46,42,.74),rgba(58,46,42,.30)),url(${INSIGHT_IMAGE})`}}><p className="text-[8px]">Glow Insight</p><p className="mt-[16px] font-serif text-[17px] leading-[1.08]">{insight ?? data.greeting.title}</p><p className="mt-3 max-w-[220px] text-[7px] leading-[1.4] text-white/85">See why Glow surfaced this for your day.</p><span className="mt-4 inline-flex rounded-[5px] border border-white/55 px-2 py-1.5 text-[6.8px]">See more insights →</span></Link>

        <Card className="h-[134px] p-[13px]"><h2 className="text-[9.5px] font-medium">Quick Actions</h2><div className="mt-[10px] grid grid-cols-2 gap-[7px]">{[['New Task','tasks'],['Add Event','calendar'],['Log Habit','habits'],['Add Note','notes']].map(([label,module])=><button key={label} type="button" onClick={()=>quickAdd(module)} className="h-[38px] rounded-[6px] border border-[#eee5e1] bg-white text-[7px] transition hover:bg-[#fff8f7]">{label}</button>)}</div></Card>

        <Card className="h-[160px] p-[13px]"><div className="flex items-center justify-between"><h2 className="text-[9.5px] font-medium">Tomorrow Preview</h2><span className="text-[6.5px] text-[#8f8781]">{tomorrowLabel}</span></div><p className="mt-4 text-[8px] leading-[1.5] text-[#706863]">Glow will build tomorrow from your real calendar, tasks, routines, and day review.</p><Link href="/tomorrow" className="mt-6 inline-flex text-[7px] text-[#b85d72]">Plan tomorrow →</Link></Card>
      </aside>
    </div>
  </div>;
}
