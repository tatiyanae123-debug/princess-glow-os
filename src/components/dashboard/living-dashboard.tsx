'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlarmClock, ArrowRight, Bell, CalendarDays, Check, ChevronRight, CirclePlus, Dumbbell,
  Droplets, Flag, Grid2X2, Heart, ListTodo, MessageCircle, Moon, NotebookPen, Plus,
  Search, Sparkles, Sun, Target, Utensils, type LucideIcon,
} from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';

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

function priorityCopy(priority: string) {
  if (priority === 'urgent' || priority === 'high') return { label: 'High Priority', tone: '#C45F76' };
  if (priority === 'medium') return { label: 'Medium Priority', tone: '#B28B51' };
  return { label: 'Low Priority', tone: '#708566' };
}

function DashboardCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-[14px] border border-[#EAE3E0] bg-white/95 shadow-[0_3px_18px_rgba(77,55,47,.035)] ${className}`}>{children}</section>;
}

function TopMetric({ icon: Icon, label, title, meta, href, tone = 'rose' }: { icon: LucideIcon; label: string; title: string; meta: React.ReactNode; href: string; tone?: 'rose' | 'gold' | 'green' }) {
  const palette = tone === 'green' ? ['#EEF3EC','#728669'] : tone === 'gold' ? ['#F7EFE4','#A9814D'] : ['#FAE6E7','#C45F76'];
  return (
    <Link href={href} className="group block min-w-0 border-r border-[#EEE7E4] px-[17px] py-[17px] last:border-r-0 hover:bg-[#FFF9F9]">
      <div className="flex items-center gap-2 text-[10px] font-medium text-[#4B4541]">
        <span className="flex h-[29px] w-[29px] items-center justify-center rounded-full" style={{ backgroundColor: palette[0], color: palette[1] }}><Icon size={14} strokeWidth={1.6} /></span>
        <span>{label}</span>
      </div>
      <p className="mt-[11px] line-clamp-2 min-h-[38px] font-serif text-[17px] leading-[1.18] text-[#1F1C1A]">{title}</p>
      <div className="mt-[9px] flex min-h-[18px] items-center justify-between text-[10px] text-[#8E8580]">{meta}<ChevronRight size={13} className="opacity-0 transition group-hover:opacity-100" /></div>
    </Link>
  );
}

function CircleHabit({ icon: Icon, label, value, sub, color }: { icon: LucideIcon; label: string; value: string; sub: string; color: string }) {
  return <div className="text-center"><p className="mb-2 text-[9px] text-[#77706A]">{label}</p><div className="mx-auto flex h-[39px] w-[39px] items-center justify-center rounded-full border-[2px]" style={{ borderColor: color, color }}><Icon size={14} strokeWidth={1.5}/></div><p className="mt-[6px] font-serif text-[11px] text-[#2A2623]">{value}</p><p className="text-[8px] text-[#8C837E]">{sub}</p></div>;
}

export function LivingDashboard({ data, error, insight, userName }: { data: LivingDashboardData; error?: string; insight?: string | null; userName?: string }) {
  const router = useRouter();
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const name = userName ?? 'Tatiyana';
  const topTask = data.dailyFocus ?? data.topPriorityTasks[0] ?? null;
  const scheduled = [...data.todaySchedule.events].sort((a,b) => a.startAt.getTime() - b.startAt.getTime());
  const nextEvent = scheduled.find((event) => event.startAt.getTime() >= now.getTime()) ?? scheduled[0] ?? null;
  const routine = data.routinesForNow[0] ?? null;
  const wellness = data.wellnessToday.entry;
  const tasks = data.topPriorityTasks.slice(0, 5);
  const dateLabel = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  const tomorrowLabel = tomorrow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  function quickAdd(module?: string) {
    document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: module ? { module } : {} }));
  }

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F7EEED] lg:bg-[#F9F5F3]">
      {error ? <div className="absolute left-1/2 top-3 z-[70] -translate-x-1/2 rounded-full border border-[#F7D1D8] bg-white px-4 py-2 text-[10px] text-[#9A6B71] shadow-sm">Live data is reconnecting. Showing confirmed information.</div> : null}

      <div className="relative min-h-[235px] overflow-hidden border-b border-[#E9E1DE] bg-white lg:min-h-[245px]">
        <div className="absolute inset-0 bg-cover bg-center opacity-[.82]" style={{ backgroundImage: `linear-gradient(90deg,rgba(255,255,255,.94) 0%,rgba(255,255,255,.72) 29%,rgba(255,255,255,.08) 58%,rgba(255,255,255,.12) 100%), url(${HERO_IMAGE})` }} />
        <div className="relative z-10 px-5 pb-[70px] pt-4 sm:px-8 lg:px-[50px] lg:pb-[70px] lg:pt-[14px]">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => router.push('/search')} className="mx-auto hidden h-[36px] w-full max-w-[275px] items-center gap-2 rounded-full border border-white/70 bg-white/88 px-4 text-left text-[10px] text-[#736B66] shadow-sm backdrop-blur md:flex">
              <Search size={13} /><span className="flex-1">Ask Glow anything...</span><span className="text-[9px] text-[#9D948F]">⌘K</span>
            </button>
            <div className="ml-auto flex items-center gap-[12px] text-[#38332F]">
              <Link href="/wellness" className="hidden items-center gap-2 border-r border-[#D7CFCA] pr-4 sm:flex"><Sun size={20} className="text-[#DBAF54]"/><span className="text-[11px] leading-tight"><b className="font-medium">Boston, MA</b><br/><span className="text-[9px] text-[#837A75]">Today</span></span></Link>
              <Link href="/calendar" className="hidden min-w-[91px] border-r border-[#D7CFCA] pr-4 text-[10px] leading-[1.35] sm:block">{dateLabel}</Link>
              <button onClick={() => quickAdd()} aria-label="Create" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#C45F76] text-white shadow-[0_7px_16px_rgba(196,95,118,.22)]"><Plus size={17}/></button>
              <Link href="/calendar" aria-label="Calendar" className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/75 bg-white/85"><CalendarDays size={15}/></Link>
              <Link href="/gmail" aria-label="Messages" className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/75 bg-white/85"><MessageCircle size={15}/></Link>
              <Link href="/settings?section=profile" aria-label="Profile" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F7D1D8] font-serif text-[12px] text-[#6D3B47]">T</Link>
            </div>
          </div>

          <div className="mt-[14px] max-w-[400px] lg:mt-[10px]">
            <h1 className="font-serif text-[39px] leading-[.98] tracking-[-.025em] text-[#201C1A] lg:text-[42px]">Good {greeting},<br/><span className="text-[#C45F76]">{name}</span></h1>
            <p className="mt-[10px] text-[11px] text-[#625B56]">You&apos;ve got a beautiful day ahead.</p>
            <Link href="/briefings" className="mt-[11px] inline-flex h-[31px] items-center rounded-[4px] bg-[#B94E69] px-[15px] text-[10px] font-medium text-white shadow-sm">Morning Brief</Link>
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-[18px] grid gap-[10px] px-4 pb-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_304px] lg:px-[18px]">
        <div className="min-w-0">
          <DashboardCard className="grid overflow-hidden p-0 sm:grid-cols-2 xl:grid-cols-4">
            <TopMetric icon={Target} label="Today&apos;s Focus" title={topTask?.title ?? 'Choose today’s focus'} href="/tasks?view=now" meta={<span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#C45F76]" />{topTask ? priorityCopy('priority' in topTask ? topTask.priority : 'medium').label : 'Set priority'}</span>} />
            <TopMetric icon={CalendarDays} label="Next Event" title={nextEvent?.title ?? 'Your schedule is clear'} href="/calendar" meta={<span>{nextEvent ? `${fmtTime(nextEvent.startAt)}${nextEvent.endAt ? ` – ${fmtTime(nextEvent.endAt)}` : ''}` : 'View calendar'}</span>} tone="gold" />
            <TopMetric icon={Sun} label="Morning Routine" title={routine?.name ?? 'Build your ritual'} href="/routines" meta={<span className="text-[#66805D]">{routine ? 'In progress' : `${data.todayOverview.activeRoutines} active`}</span>} tone="gold" />
            <TopMetric icon={Bell} label="Important Alert" title={data.gmailInbox.unreadCount > 0 ? `${data.gmailInbox.unreadCount} unread messages` : data.todayOverview.tasksDueToday > 0 ? `${data.todayOverview.tasksDueToday} tasks due today` : 'Nothing urgent right now'} href={data.gmailInbox.unreadCount > 0 ? '/gmail' : '/notices'} meta={<span className="text-[#B95A6F]">Review attention items</span>} />
          </DashboardCard>

          <div className="mt-[10px] grid gap-[10px] xl:grid-cols-[1.02fr_1.03fr_1.3fr]">
            <DashboardCard className="p-[16px]">
              <div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Today at a Glance</h2><Link href="/calendar" className="text-[9px] text-[#B85D72]">View full day</Link></div>
              <div className="mt-[11px] space-y-[3px]">
                {scheduled.slice(0,5).map((event, index) => <Link key={event.id} href="/calendar" className={`grid grid-cols-[66px_minmax(0,1fr)_auto] items-center gap-2 rounded-[5px] px-1.5 py-[7px] text-[9.5px] ${index===2 ? 'bg-[#FAE6E7]' : ''}`}><span className="flex items-center gap-2 text-[#5F5853]"><span className="h-1.5 w-1.5 rounded-full bg-[#C45F76]"/>{event.allDay ? 'All day' : fmtTime(event.startAt)}</span><span className="truncate text-[#332E2B]">{event.title}</span><span className="text-[8px] text-[#9D948F]">{fmtDuration(event.startAt,event.endAt)}</span></Link>)}
                {scheduled.length === 0 ? <p className="py-10 text-center text-[10px] text-[#918782]">Nothing scheduled yet today.</p> : null}
              </div>
              <Link href="/calendar" className="mt-2 inline-flex items-center gap-1 text-[9px] text-[#C05F74]">View full day <ChevronRight size={10}/></Link>
            </DashboardCard>

            <DashboardCard className="p-[16px]">
              <div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Top Tasks</h2><Link href="/tasks" className="text-[9px] text-[#B85D72]">View all</Link></div>
              <div className="mt-[10px] space-y-[1px]">
                {tasks.map((task, index) => <Link href="/tasks" key={task.id} className="flex min-h-[27px] items-center gap-2 text-[9.5px] text-[#38322F]"><span className={`flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full border ${index===2 ? 'border-[#C45F76] bg-[#C45F76] text-white' : 'border-[#B8AFAB]'}`}>{index===2 ? <Check size={9}/> : null}</span><span className="truncate">{task.title}</span></Link>)}
                {tasks.length === 0 ? <p className="py-10 text-center text-[10px] text-[#918782]">No priority tasks yet.</p> : null}
              </div>
            </DashboardCard>

            <DashboardCard className="p-[16px]">
              <div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Life Pulse</h2><Link href="/graph" className="text-[9px] text-[#B85D72]">View full pulse</Link></div>
              <div className="mt-[5px] grid grid-cols-[145px_minmax(0,1fr)] items-center gap-4">
                <div className="relative mx-auto h-[132px] w-[132px]">
                  <div className="absolute inset-1 rounded-full border-[5px] border-[#8DB27C] border-r-transparent" />
                  <div className="absolute left-[28px] top-[38px] h-[58px] w-[80px] rounded-[55%_45%_58%_42%] bg-[#F7D1D8]/75 blur-[1px]" />
                  <div className="absolute left-[37px] top-[51px] h-[43px] w-[63px] rounded-[45%_60%_44%_56%] bg-[#FAE6E7]" />
                  <div className="absolute left-[48px] top-[63px] h-[27px] w-[47px] rounded-[50%] bg-[#E9E0C3]/85" />
                </div>
                <div className="space-y-[7px] text-[9px]">
                  {[
                    ['Energy', wellness?.energy ?? '—', '#76A06B'], ['Schedule', scheduled.length > 5 ? 'Busy' : 'Balanced', '#C9A852'], ['Wellness', wellness ? 'Good' : 'Check in', '#72956B'], ['Focus', topTask ? 'High' : 'Open', '#72956B'], ['Finances', 'Open', '#72956B'], ['Mood', wellness?.mood ?? '—', '#72956B']
                  ].map(([label,value,color]) => <div key={label} className="grid grid-cols-[1fr_auto] items-center gap-4"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{backgroundColor: color}}/>{label}</span><span className="capitalize text-[#637C5B]">{value}</span></div>)}
                </div>
              </div>
            </DashboardCard>
          </div>

          <div className="mt-[10px] grid gap-[10px] md:grid-cols-2 xl:grid-cols-[1.25fr_1.05fr_.7fr_.7fr]">
            <DashboardCard className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Habit Tracker</h2><Link href="/habits" className="text-[8px] text-[#B85D72]">View all habits</Link></div><div className="mt-[11px] grid grid-cols-4 gap-2"><CircleHabit icon={Dumbbell} label="Move" value="6,842" sub="steps" color="#6F9A67"/><CircleHabit icon={Droplets} label="Hydrate" value={wellness?.waterGlasses != null ? `${wellness.waterGlasses}/8` : '—'} sub="glasses" color="#7A70A4"/><CircleHabit icon={Heart} label="Meditate" value="10" sub="min" color="#6E9C76"/><CircleHabit icon={NotebookPen} label="Read" value="20" sub="min" color="#BA914F"/></div></DashboardCard>
            <DashboardCard className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Nutrition</h2><Link href="/food" className="text-[8px] text-[#8C827D]">Today⌄</Link></div><p className="mt-3 font-serif text-[18px]">1,350 <span className="font-sans text-[9px] text-[#8D847E]">/ 2,000 cal</span></p><div className="mt-2 h-[4px] rounded-full bg-[#F1E9E5]"><div className="h-full w-[67%] rounded-full bg-[#B95B71]"/></div><div className="mt-4 grid grid-cols-3 gap-2 text-[8px]"><div>Protein<div className="mt-1 h-1 bg-[#E9E5DF]"><div className="h-1 w-[75%] bg-[#79A064]"/></div><span className="text-[#817872]">90 /120g</span></div><div>Carbs<div className="mt-1 h-1 bg-[#E9E5DF]"><div className="h-1 w-[67%] bg-[#A984A0]"/></div><span className="text-[#817872]">120 /180g</span></div><div>Fat<div className="mt-1 h-1 bg-[#E9E5DF]"><div className="h-1 w-[64%] bg-[#C9A350]"/></div><span className="text-[#817872]">45 /70g</span></div></div><Link href="/food" className="mt-3 inline-block text-[8px] text-[#B85D72]">View nutrition</Link></DashboardCard>
            <DashboardCard className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Sleep</h2><Link href="/wellness" className="text-[8px] text-[#8C827D]">Last night⌄</Link></div><p className="mt-2 font-serif text-[22px]">{wellness?.sleepHours != null ? `${wellness.sleepHours}h` : '—'}</p><p className="text-[9px] text-[#699066]">{wellness?.sleepHours != null && wellness.sleepHours >= 7 ? 'Good' : 'Not logged'}</p><div className="mt-3 flex h-[25px] items-end gap-[3px]">{[12,16,19,12,18,20,14,22,17,21].map((h,i)=><span key={i} className="w-[4px] rounded-full bg-[#8C7CB5]/80" style={{height:h}}/>)}</div><Link href="/wellness" className="mt-2 inline-block text-[8px] text-[#B85D72]">View sleep</Link></DashboardCard>
            <DashboardCard className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Mood</h2><Link href="/wellness" className="text-[8px] text-[#8C827D]">Today⌄</Link></div><div className="mx-auto mt-3 flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#E8E4F3] text-[#7A70A4]"><span className="text-[30px]">⌣</span></div><p className="mt-1 text-center text-[9px] capitalize">{wellness?.mood ?? 'Check in'}</p><Link href="/wellness" className="mt-2 block text-center text-[8px] text-[#B85D72]">Log your mood</Link></DashboardCard>
          </div>

          <div className="mt-[10px] grid gap-[10px] xl:grid-cols-[1.55fr_.85fr]">
            <DashboardCard className="p-[12px]"><h2 className="text-[10px] font-medium">Recently Opened</h2><div className="mt-[8px] grid grid-cols-5 gap-[10px]">{[
              ['/projects','Terrain Design','Project',HERO_IMAGE],['/finance/brain','Financial Brain','Spending',INSIGHT_IMAGE],['/beauty','Beauty Routine','Morning','https://images.squarespace-cdn.com/content/v1/64ecd100c89bcf472ac1dfeb/c4f451a0-7bc9-4fb6-a66e-771f6bc31153/Miami%2BLuxury%2BInterior%2BDesign%2BBy%2BEon%2BInterior%2BDesign.png'],['/fitness','Workout Plan','Glute Focus',INSIGHT_IMAGE],['/home','Saint’s Space','Today',HERO_IMAGE]
            ].map(([href,title,sub,img])=><Link href={href} key={title} className="min-w-0"><div className="h-[62px] rounded-[6px] bg-cover bg-center" style={{backgroundImage:`url(${img})`}}/><p className="mt-1 truncate text-[8px] font-medium">{title}</p><p className="truncate text-[7px] text-[#918782]">{sub}</p></Link>)}</div></DashboardCard>
            <DashboardCard className="p-[12px]"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Recent Activity</h2><Link href="/timeline" className="text-[8px] text-[#B85D72]">View all</Link></div><div className="mt-2 space-y-2">{data.notesSummary.recentNotes.slice(0,3).map((note)=><Link href={`/notes`} key={note.id} className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-2 text-[8px]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FAE6E7] text-[#B85D72]"><NotebookPen size={10}/></span><span className="truncate">{note.title || 'Note updated'}</span><span className="text-[#9C928C]">Recent</span></Link>)}{data.notesSummary.recentNotes.length===0?<p className="py-5 text-center text-[9px] text-[#918782]">Your recent activity will appear here.</p>:null}</div></DashboardCard>
          </div>
        </div>

        <aside className="grid min-w-0 gap-[10px] sm:grid-cols-2 lg:grid-cols-1">
          <DashboardCard className="p-[14px]"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Upcoming</h2><Link href="/calendar" className="text-[8px] text-[#B85D72]">View all</Link></div><div className="mt-[9px] space-y-[9px]">{scheduled.slice(0,3).map((event)=><Link href="/calendar" key={event.id} className="grid grid-cols-[56px_minmax(0,1fr)] gap-2 text-[8.5px]"><span className="text-[#5F5752]">{event.startAt.toLocaleDateString('en-US',{weekday:'short'})}<br/><span className="text-[#948A84]">{event.startAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></span><span className="truncate">{event.title}<br/><span className="text-[#948A84]">{event.allDay?'All day':fmtTime(event.startAt)}</span></span></Link>)}{scheduled.length===0?<p className="py-5 text-center text-[9px] text-[#918782]">No upcoming events today.</p>:null}</div></DashboardCard>

          <Link href="/brain" className="relative min-h-[176px] overflow-hidden rounded-[14px] border border-[#EAE3E0] bg-cover bg-center p-[14px] text-white shadow-[0_3px_18px_rgba(77,55,47,.04)]" style={{backgroundImage:`linear-gradient(90deg,rgba(73,55,49,.78),rgba(73,55,49,.22)),url(${INSIGHT_IMAGE})`}}><p className="text-[9px]">Glow Insight</p><p className="mt-3 max-w-[19ch] font-serif text-[15px] leading-[1.25]">{insight ?? 'Your schedule is busiest in the afternoon.'}</p><p className="mt-2 max-w-[24ch] text-[8.5px] leading-[1.4] text-white/85">Consider protecting focused time when your energy is strongest.</p><span className="mt-4 inline-flex rounded-[5px] border border-white/35 px-2 py-1.5 text-[8px]">See more insights ›</span></Link>

          <DashboardCard className="p-[14px]"><h2 className="text-[10px] font-medium">Quick Actions</h2><div className="mt-3 grid grid-cols-2 gap-2">{[
            ['New Task',ListTodo,'task'],['Add Event',CalendarDays,'event'],['Log Habit',Check,'habit'],['Add Note',NotebookPen,'note']
          ].map(([label,Icon,module])=><button key={label as string} onClick={()=>quickAdd(module as string)} className="flex h-[35px] items-center justify-center gap-2 rounded-[5px] border border-[#EDE5E1] bg-white text-[8.5px] hover:bg-[#FAE6E7]"><Icon size={11}/>{label as string}</button>)}</div></DashboardCard>

          <DashboardCard className="p-[14px]"><h2 className="text-[10px] font-medium">Tomorrow Preview</h2><p className="mt-1 text-[8px] text-[#918782]">{tomorrowLabel}</p><div className="mt-3 space-y-3 text-[8.5px]"><div className="grid grid-cols-[55px_1fr]"><span className="text-[#918782]">9:00 AM</span><span>Deep Work</span></div><div className="grid grid-cols-[55px_1fr]"><span className="text-[#918782]">12:00 PM</span><span>Lunch + reset</span></div><div className="grid grid-cols-[55px_1fr]"><span className="text-[#918782]">3:00 PM</span><span>Workout</span></div><div className="grid grid-cols-[55px_1fr]"><span className="text-[#918782]">6:00 PM</span><span>Dinner</span></div></div><Link href="/tomorrow" className="mt-4 inline-flex items-center gap-1 text-[8.5px] text-[#B85D72]">Plan tomorrow <ChevronRight size={10}/></Link></DashboardCard>
        </aside>
      </div>

      <button onClick={() => quickAdd()} className="fixed bottom-5 right-5 z-50 flex h-11 items-center gap-2 rounded-full bg-[#C45F76] px-5 text-[12px] font-medium text-white shadow-[0_10px_30px_rgba(196,95,118,.25)] lg:hidden"><CirclePlus size={16}/>Create</button>
    </div>
  );
}
