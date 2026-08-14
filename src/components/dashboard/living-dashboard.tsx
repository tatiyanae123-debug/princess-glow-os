'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, CalendarDays, Check, ChevronRight, Dumbbell, Droplets, Heart, ListTodo,
  MessageCircle, NotebookPen, Plus, Search, Sun, Target, Utensils, type LucideIcon,
} from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';

const HERO_IMAGE = 'https://media.licdn.com/dms/image/v2/C4E1BAQFxkCCuXBf1rw/company-background_10000/company-background_10000/0/1651792059318/fantastic_frank_lisbon_cover?e=2147483647&t=hrd5Ip8w0WIhE0spIuRyw1zfC7k4faJJF8OXpOD8dKA&v=beta';
const INSIGHT_IMAGE = 'https://comportahouse.pt/wp-content/uploads/2024/03/1825-2204J-SAMA-T4-LIVING-02.jpg';
const BEAUTY_IMAGE = 'https://images.squarespace-cdn.com/content/v1/64ecd100c89bcf472ac1dfeb/c4f451a0-7bc9-4fb6-a66e-771f6bc31153/Miami%2BLuxury%2BInterior%2BDesign%2BBy%2BEon%2BInterior%2BDesign.png';

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
function priorityLabel(priority: string) {
  if (priority === 'urgent' || priority === 'high') return 'High Priority';
  if (priority === 'medium') return 'Medium Priority';
  return 'Low Priority';
}
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`overflow-hidden rounded-[13px] border border-[#e9e4e1] bg-white shadow-[0_2px_12px_rgba(57,40,31,.025)] ${className}`}>{children}</section>;
}
function Metric({ icon: Icon, label, title, meta, href, tone='rose' }: { icon: LucideIcon; label:string; title:string; meta:React.ReactNode; href:string; tone?:'rose'|'gold' }) {
  const bg = tone === 'gold' ? '#f8efe4' : '#fae7e9';
  const fg = tone === 'gold' ? '#a78050' : '#bf5a71';
  return <Link href={href} className="block h-[136px] min-w-0 border-r border-[#ece7e4] px-[16px] py-[14px] last:border-r-0 hover:bg-[#fffafa]">
    <div className="flex items-center gap-[9px] text-[10px] font-medium text-[#4d4743]"><span className="flex h-[28px] w-[28px] items-center justify-center rounded-full" style={{background:bg,color:fg}}><Icon size={14} strokeWidth={1.55}/></span>{label}</div>
    <p className="mt-[10px] min-h-[38px] line-clamp-2 text-[16px] font-medium leading-[1.18] text-[#24201e]">{title}</p>
    <div className="mt-[8px] flex min-h-[16px] items-center justify-between text-[9px] text-[#8d8580]">{meta}<ChevronRight size={11} className="text-[#8d8580]"/></div>
  </Link>;
}
function Habit({ icon:Icon,label,value,sub,color }:{icon:LucideIcon;label:string;value:string;sub:string;color:string}) {
  return <div className="text-center"><p className="mb-[7px] text-[8px] text-[#77706b]">{label}</p><div className="mx-auto flex h-[38px] w-[38px] items-center justify-center rounded-full border-[2px]" style={{borderColor:color,color}}><Icon size={13}/></div><p className="mt-[5px] text-[11px] font-medium text-[#292522]">{value}</p><p className="text-[7px] text-[#8f8781]">{sub}</p></div>;
}

export function LivingDashboard({ data, error, insight, userName }: { data: LivingDashboardData; error?: string; insight?: string | null; userName?: string }) {
  const router = useRouter();
  const now = new Date();
  const name = userName ?? 'Tatiyana';
  const topTask = data.dailyFocus ?? data.topPriorityTasks[0] ?? null;
  const scheduled = [...data.todaySchedule.events].sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  const nextEvent = scheduled.find(e=>e.startAt.getTime()>=now.getTime()) ?? scheduled[0] ?? null;
  const routine = data.routinesForNow[0] ?? null;
  const wellness = data.wellnessToday.entry;
  const tasks = data.topPriorityTasks.slice(0,5);
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate()+1);
  const dateTop = now.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'});
  const tomorrowLabel = tomorrow.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  function quickAdd(module?:string){document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:module?{module}:{}}));}

  return <div className="h-[1024px] w-[1298px] overflow-hidden bg-[#f8f4f2] text-[#2a2522]">
    {error ? <div className="absolute left-[600px] top-[10px] z-50 rounded-full border border-[#f0d7da] bg-white px-3 py-1.5 text-[9px] text-[#9b7277]">Live data is reconnecting.</div> : null}

    <header className="relative h-[229px] overflow-hidden border-b border-[#ebe5e2] bg-[#f6f2ef]">
      <div className="absolute inset-0 bg-cover bg-[center_58%]" style={{backgroundImage:`linear-gradient(90deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.68) 31%,rgba(255,255,255,.08) 57%,rgba(255,255,255,.13) 100%),url(${HERO_IMAGE})`}}/>
      <div className="relative h-full">
        <button onClick={()=>router.push('/search')} className="absolute left-[540px] top-[14px] flex h-[35px] w-[274px] items-center gap-2 rounded-full border border-white/85 bg-white/90 px-[14px] text-left text-[9px] text-[#776f6a] shadow-[0_2px_8px_rgba(50,40,35,.05)]"><Search size={12}/><span className="flex-1">Ask Glow anything...</span><span className="text-[8px] text-[#9c948e]">⌘K</span></button>
        <div className="absolute right-[18px] top-[14px] flex items-center gap-[11px]">
          <Link href="/wellness" className="flex items-center gap-[7px] border-r border-[#d6cfca] pr-[14px]"><Sun size={19} className="text-[#d9aa4b]"/><span className="text-[10px] leading-[1.2]"><b className="font-medium">72°F</b><br/><span className="text-[8px] text-[#77706a]">Boston, MA</span></span></Link>
          <Link href="/calendar" className="w-[103px] border-r border-[#d6cfca] pr-[13px] text-[9px] leading-[1.25]">{dateTop}</Link>
          <button onClick={()=>quickAdd()} aria-label="Create" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#c1506d] text-white"><Plus size={16}/></button>
          <Link href="/calendar" aria-label="Calendar" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 text-[#423b37]"><CalendarDays size={14}/></Link>
          <Link href="/gmail" aria-label="Messages" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 text-[#423b37]"><MessageCircle size={14}/></Link>
          <Link href="/settings?section=profile" aria-label="Profile" className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#f7d1d8] text-[11px] font-medium text-[#6f3d49]">T</Link>
        </div>
        <div className="absolute left-[50px] top-[49px]">
          <h1 className="font-serif text-[43px] leading-[.98] tracking-[-.025em] text-[#201d1b]">Good morning,<br/><span className="text-[#c45c74]">{name}</span></h1>
          <p className="mt-[10px] text-[11px] text-[#625b56]">You&apos;ve got a beautiful day ahead.</p>
          <Link href="/briefings" className="mt-[11px] inline-flex h-[30px] items-center rounded-[4px] bg-[#b94f69] px-[14px] text-[10px] font-medium text-white">Morning Brief</Link>
        </div>
      </div>
    </header>

    <div className="grid h-[795px] grid-cols-[964px_304px] gap-[10px] px-[9px] pb-[10px] pt-0">
      <main className="min-w-0">
        <Card className="grid h-[154px] grid-cols-4 rounded-t-none p-0">
          <Metric icon={Target} label="Today&apos;s Focus" title={topTask?.title ?? 'Finish Glow OS brand deck'} href="/tasks?view=now" meta={<span className="flex items-center gap-[6px]"><span className="h-1.5 w-1.5 rounded-full bg-[#c45f76]"/>{topTask?priorityLabel('priority' in topTask?topTask.priority:'medium'):'High Priority'}</span>}/>
          <Metric icon={CalendarDays} tone="gold" label="Next Event" title={nextEvent?.title ?? 'Hair Appointment'} href="/calendar" meta={<span>{nextEvent?`${fmtTime(nextEvent.startAt)}${nextEvent.endAt?` – ${fmtTime(nextEvent.endAt)}`:''}`:'2:30 – 3:30 PM'}</span>}/>
          <Metric icon={Sun} tone="gold" label="Morning Routine" title={routine?.name ?? 'Morning Glow Ritual'} href="/routines" meta={<span className="text-[#62805e]">{routine?'In progress':'8 steps'}</span>}/>
          <Metric icon={Bell} label="Important Alert" title={data.gmailInbox.unreadCount>0?`${data.gmailInbox.unreadCount} unread messages`:data.todayOverview.tasksDueToday>0?`${data.todayOverview.tasksDueToday} tasks due today`:'Bill due tomorrow'} href="/notices" meta={<span className="text-[#ba5a6f]">Due in 1 day</span>}/>
        </Card>

        <div className="mt-[10px] grid h-[250px] grid-cols-[280px_280px_384px] gap-[10px]">
          <Card className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Today at a Glance</h2></div><div className="mt-[10px] space-y-[3px]">{scheduled.slice(0,5).map((event,i)=><Link key={event.id} href="/calendar" className={`grid h-[28px] grid-cols-[64px_1fr_auto] items-center gap-[6px] rounded-[5px] px-[5px] text-[8.5px] ${i===2?'bg-[#fae6e7]':''}`}><span className="flex items-center gap-[7px]"><span className="h-1.5 w-1.5 rounded-full bg-[#c45f76]"/>{event.allDay?'All day':fmtTime(event.startAt)}</span><span className="truncate">{event.title}</span><span className="text-[7px] text-[#9a918b]">{fmtDuration(event.startAt,event.endAt)}</span></Link>)}{scheduled.length===0?<p className="py-12 text-center text-[9px] text-[#918782]">Nothing scheduled yet today.</p>:null}</div><Link href="/calendar" className="mt-[6px] inline-flex items-center text-[8px] text-[#be5e73]">View full day <ChevronRight size={9}/></Link></Card>
          <Card className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Top Tasks</h2><Link href="/tasks" className="text-[8px] text-[#b85d72]">View all</Link></div><div className="mt-[11px] space-y-[4px]">{tasks.map((task,i)=><Link href="/tasks" key={task.id} className="flex h-[28px] items-center gap-[8px] text-[9px]"><span className={`flex h-[14px] w-[14px] items-center justify-center rounded-full border ${i===2?'border-[#c45f76] bg-[#c45f76] text-white':'border-[#b9b0ab]'}`}>{i===2?<Check size={9}/>:null}</span><span className="truncate">{task.title}</span></Link>)}{tasks.length===0?<p className="py-12 text-center text-[9px] text-[#918782]">No priority tasks yet.</p>:null}</div></Card>
          <Card className="p-[15px]"><div className="flex items-center justify-between"><h2 className="text-[11px] font-medium">Life Pulse</h2><Link href="/graph" className="text-[8px] text-[#b85d72]">View full pulse</Link></div><div className="mt-[9px] grid grid-cols-[168px_1fr] items-center gap-[10px]"><div className="relative mx-auto h-[147px] w-[147px]"><div className="absolute inset-[2px] rounded-full border-[5px] border-[#83a978] border-r-transparent"/><div className="absolute left-[33px] top-[43px] h-[65px] w-[83px] rounded-[48%_52%_45%_55%] bg-[#f3cad2]"/><div className="absolute left-[42px] top-[58px] h-[48px] w-[67px] rounded-[55%] bg-[#f7dde2]"/><div className="absolute left-[52px] top-[72px] h-[30px] w-[48px] rounded-[50%] bg-[#e6dfc6]"/></div><div className="space-y-[8px] text-[8.5px]">{[['Energy',wellness?.energy??'72%','#73a168'],['Schedule',scheduled.length>5?'Busy':'Good','#c7a54b'],['Wellness',wellness?'Good':'Check in','#73a168'],['Focus',topTask?'High':'Open','#73a168'],['Finances','On Track','#73a168'],['Mood',wellness?.mood??'Good','#73a168']].map(([l,v,c])=><div key={l} className="grid grid-cols-[1fr_auto]"><span className="flex items-center gap-[7px]"><span className="h-1.5 w-1.5 rounded-full" style={{backgroundColor:c}}/>{l}</span><span className="capitalize text-[#66805e]">{v}</span></div>)}</div></div></Card>
        </div>

        <div className="mt-[10px] grid h-[170px] grid-cols-[300px_260px_187px_187px] gap-[10px]">
          <Card className="p-[14px]"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Habit Tracker</h2><Link href="/habits" className="text-[8px] text-[#b85d72]">View all habits</Link></div><div className="mt-[10px] grid grid-cols-4"><Habit icon={Dumbbell} label="Move" value="6,842" sub="steps" color="#6f9a67"/><Habit icon={Droplets} label="Hydrate" value={wellness?.waterGlasses!=null?`${wellness.waterGlasses}/8`:'6/8'} sub="glasses" color="#7a70a4"/><Habit icon={Heart} label="Meditate" value="10" sub="min" color="#6e9c76"/><Habit icon={NotebookPen} label="Read" value="20" sub="min" color="#ba914f"/></div></Card>
          <Card className="p-[14px]"><div className="flex items-center justify-between"><h2 className="text-[10px] font-medium">Nutrition</h2><Link href="/food" className="text-[8px] text-[#8c827d]">Today⌄</Link></div><p className="mt-[10px] text-[17px] font-medium">1,350 <span className="text-[8px] font-normal text-[#8d847e]">/ 2,000 cal</span></p><div className="mt-[7px] h-[4px] bg-[#f1e9e5]"><div className="h-full w-[67%] bg-[#b95b71]"/></div><div className="mt-[12px] grid grid-cols-3 gap-[8px] text-[7px]"><div>Protein<div className="mt-1 h-1 bg-[#e9e5df]"><div className="h-1 w-3/4 bg-[#79a064]"/></div><span className="text-[#817872]">90 /120g</span></div><div>Carbs<div className="mt-1 h-1 bg-[#e9e5df]"><div className="h-1 w-2/3 bg-[#a984a0]"/></div><span className="text-[#817872]">120 /180g</span></div><div>Fat<div className="mt-1 h-1 bg-[#e9e5df]"><div className="h-1 w-2/3 bg-[#c9a350]"/></div><span className="text-[#817872]">45 /70g</span></div></div><Link href="/food" className="mt-[8px] inline-block text-[8px] text-[#b85d72]">View nutrition</Link></Card>
          <Card className="p-[14px]"><div className="flex justify-between"><h2 className="text-[10px] font-medium">Sleep</h2><Link href="/wellness" className="text-[7px] text-[#8c827d]">Last night⌄</Link></div><p className="mt-[8px] text-[21px] font-medium">{wellness?.sleepHours!=null?`${wellness.sleepHours}h`:'7h 32m'}</p><p className="text-[8px] text-[#699066]">Good</p><div className="mt-[9px] flex h-[23px] items-end gap-[3px]">{[12,16,19,12,18,20,14,22,17,21].map((h,i)=><span key={i} className="w-[4px] rounded-full bg-[#8c7cb5]/80" style={{height:h}}/>)}</div><Link href="/wellness" className="mt-[6px] inline-block text-[7px] text-[#b85d72]">View sleep</Link></Card>
          <Card className="p-[14px]"><div className="flex justify-between"><h2 className="text-[10px] font-medium">Mood</h2><Link href="/wellness" className="text-[7px] text-[#8c827d]">Today⌄</Link></div><div className="mx-auto mt-[10px] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#e7e3f2] text-[28px] text-[#7a70a4]">⌣</div><p className="mt-[2px] text-center text-[8px]">Good</p><Link href="/wellness" className="mt-[5px] block text-center text-[7px] text-[#b85d72]">Log your mood</Link></Card>
        </div>

        <div className="mt-[10px] grid h-[151px] grid-cols-[603px_351px] gap-[10px]">
          <Card className="p-[12px]"><h2 className="text-[9px] font-medium">Recently Opened</h2><div className="mt-[8px] grid grid-cols-5 gap-[10px]">{[['/projects','Terrain Design','Project',HERO_IMAGE],['/finance/brain','Financial Brain','Spending',INSIGHT_IMAGE],['/beauty','Beauty Routine','Morning',BEAUTY_IMAGE],['/fitness','Workout Plan','Glute Focus',INSIGHT_IMAGE],['/home','Saint’s Space','Today',HERO_IMAGE]].map(([href,title,sub,img])=><Link href={href} key={title} className="min-w-0"><div className="h-[72px] rounded-[5px] bg-cover bg-center" style={{backgroundImage:`url(${img})`}}/><p className="mt-[4px] truncate text-[7.5px] font-medium">{title}</p><p className="truncate text-[7px] text-[#918782]">{sub}</p></Link>)}</div></Card>
          <Card className="p-[12px]"><div className="flex justify-between"><h2 className="text-[9px] font-medium">Recent Activity</h2><Link href="/timeline" className="text-[7px] text-[#b85d72]">View all</Link></div><div className="mt-[8px] space-y-[7px]">{data.notesSummary.recentNotes.slice(0,3).map(note=><Link href="/notes" key={note.id} className="grid grid-cols-[20px_1fr_auto] items-center gap-[6px] text-[7.5px]"><span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#fae6e7] text-[#b85d72]"><NotebookPen size={9}/></span><span className="truncate">{note.title||'Note updated'}</span><span className="text-[#9c928c]">Recent</span></Link>)}{data.notesSummary.recentNotes.length===0?<><div className="grid grid-cols-[20px_1fr_auto] items-center gap-[6px] text-[7.5px]"><span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#fae6e7] text-[#b85d72]"><NotebookPen size={9}/></span><span>Brand deck updated</span><span className="text-[#9c928c]">2h ago</span></div><div className="grid grid-cols-[20px_1fr_auto] items-center gap-[6px] text-[7.5px]"><span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#eee8f5] text-[#7a70a4]"><NotebookPen size={9}/></span><span>Mood board added</span><span className="text-[#9c928c]">Yesterday</span></div></>:null}</div></Card>
        </div>
      </main>

      <aside className="min-w-0 pt-0">
        <Card className="h-[208px] rounded-t-none p-[14px]"><div className="flex justify-between"><h2 className="text-[10px] font-medium">Upcoming</h2><Link href="/calendar" className="text-[8px] text-[#b85d72]">View all</Link></div><div className="mt-[12px] space-y-[11px]">{scheduled.slice(0,3).map(e=><Link href="/calendar" key={e.id} className="grid grid-cols-[54px_1fr] text-[8px]"><span>{e.startAt.toLocaleDateString('en-US',{weekday:'short'})}<br/><span className="text-[#918882]">{e.startAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></span><span className="truncate">{e.title}<br/><span className="text-[#918882]">{e.allDay?'All day':fmtTime(e.startAt)}</span></span></Link>)}{scheduled.length===0?<><div className="grid grid-cols-[54px_1fr] text-[8px]"><span>Fri<br/><span className="text-[#918882]">May 16</span></span><span>Client Presentation<br/><span className="text-[#918882]">10:00 AM</span></span></div><div className="grid grid-cols-[54px_1fr] text-[8px]"><span>Sat<br/><span className="text-[#918882]">May 17</span></span><span>Weekend Trip<br/><span className="text-[#918882]">All day</span></span></div><div className="grid grid-cols-[54px_1fr] text-[8px]"><span>Mon<br/><span className="text-[#918882]">May 19</span></span><span>Interview — Terrain Design<br/><span className="text-[#918882]">2:00 PM</span></span></div></>:null}</div></Card>
        <Link href="/brain" className="mt-[10px] block h-[181px] overflow-hidden rounded-[13px] border border-[#e8e2df] bg-cover bg-center p-[14px] text-white" style={{backgroundImage:`linear-gradient(90deg,rgba(71,53,47,.78),rgba(71,53,47,.24)),url(${INSIGHT_IMAGE})`}}><p className="text-[9px]">Glow Insight</p><p className="mt-[12px] max-w-[18ch] font-serif text-[15px] leading-[1.25]">{insight??'Your schedule is busiest between 2 PM and 5 PM.'}</p><p className="mt-[8px] max-w-[25ch] text-[8px] leading-[1.35] text-white/90">Consider protecting focus time in the morning.</p><span className="mt-[12px] inline-flex rounded-[4px] border border-white/35 px-[8px] py-[5px] text-[7px]">See more insights ›</span></Link>
        <Card className="mt-[10px] h-[142px] p-[14px]"><h2 className="text-[10px] font-medium">Quick Actions</h2><div className="mt-[12px] grid grid-cols-2 gap-[8px]">{[['New Task',ListTodo,'task'],['Add Event',CalendarDays,'event'],['Log Habit',Check,'habit'],['Add Note',NotebookPen,'note']].map(([label,Icon,module])=><button key={label as string} onClick={()=>quickAdd(module as string)} className="flex h-[35px] items-center justify-center gap-[7px] rounded-[5px] border border-[#ebe5e1] text-[8px] hover:bg-[#fae6e7]"><Icon size={10}/>{label as string}</button>)}</div></Card>
        <Card className="mt-[10px] h-[224px] bg-[#fffdfb] p-[14px]"><h2 className="text-[10px] font-medium">Tomorrow Preview</h2><p className="mt-[3px] text-[8px] text-[#918782]">{tomorrowLabel}</p><div className="mt-[14px] space-y-[13px] text-[8px]"><div className="grid grid-cols-[55px_1fr]"><span className="text-[#918782]">9:00 AM</span><span>Deep Work</span></div><div className="grid grid-cols-[55px_1fr]"><span className="text-[#918782]">12:00 PM</span><span>Lunch with Andrea</span></div><div className="grid grid-cols-[55px_1fr]"><span className="text-[#918782]">3:00 PM</span><span>Workout</span></div><div className="grid grid-cols-[55px_1fr]"><span className="text-[#918782]">6:00 PM</span><span>Dinner</span></div></div><Link href="/tomorrow" className="mt-[15px] inline-flex items-center text-[8px] text-[#b85d72]">Plan tomorrow <ChevronRight size={9}/></Link></Card>
      </aside>
    </div>
  </div>;
}
