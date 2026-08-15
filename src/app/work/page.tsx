import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { WorkScheduleManager } from '@/components/work/work-schedule-manager';
import { getWorkSchedulesByUser } from '@/lib/data/work-schedules';
import { getTasksByUser } from '@/lib/data/tasks';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { ArrowRight, Briefcase, CalendarDays, Clock3, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function WorkPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const userId=session.user.id;
  const [schedules,tasks,events,projects]=await Promise.all([getWorkSchedulesByUser(userId),getTasksByUser(userId),getCalendarEventsByUser(userId),getProjectsByUser(userId)]);
  const open=tasks.filter(t=>t.status!=='done'&&t.status!=='cancelled');
  const priorityRank={urgent:0,high:1,medium:2,low:3} as const;
  const priorities=[...open].sort((a,b)=>priorityRank[a.priority]-priorityRank[b.priority]).slice(0,5);
  const upcomingEvents=events.filter(e=>e.startAt.getTime()>=Date.now()).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,5);
  const deadlines=open.filter(t=>t.dueDate).sort((a,b)=>(a.dueDate?.getTime()??0)-(b.dueDate?.getTime()??0)).slice(0,5);
  const activeProjects=projects.filter(p=>p.status==='active').slice(0,5);

  return <AppShell><SectionPage eyebrow="Work" title="Work" description="Your work life, lighter, focused, and deliberate.">
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_.75fr]">
        <Card><div className="flex items-center gap-2"><Briefcase size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Today’s Priorities</h2></div><div className="mt-4 space-y-1">{priorities.length?priorities.map(t=><Link key={t.id} href={`/tasks?taskId=${encodeURIComponent(t.id)}&view=all`} className="flex items-start gap-2 rounded-[10px] px-1 py-2 transition hover:bg-[#FDF8F6]"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9727E]"/><div><p className="text-[11.5px] font-medium text-[#3A332E]">{t.title}</p><p className="text-[9.5px] capitalize text-[#9A9088]">{t.priority} priority</p></div></Link>):<p className="text-[11px] text-[#9A9088]">No open priorities.</p>}</div><Link href="/tasks" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">View all tasks <ArrowRight size={11}/></Link></Card>
        <Card><div className="flex items-center gap-2"><CalendarDays size={14} className="text-[#9A7A3D]"/><h2 className="glow-display text-[18px]">Upcoming Calendar</h2></div><div className="mt-4 space-y-1">{upcomingEvents.length?upcomingEvents.map(e=><Link key={e.id} href={`/calendar?eventId=${encodeURIComponent(e.id)}&view=day`} className="grid grid-cols-[72px_1fr] gap-2 rounded-[10px] px-1 py-2 text-[11px] transition hover:bg-[#FDF8F6]"><span className="text-[#9A9088]">{e.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span><span className="text-[#3A332E]">{e.title}</span></Link>):<p className="text-[11px] text-[#9A9088]">No upcoming calendar events.</p>}</div><Link href="/calendar" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">View calendar <ArrowRight size={11}/></Link></Card>
        <Card><div className="flex items-center gap-2"><Clock3 size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Focus Blocks</h2></div><div className="mt-4 space-y-3">{schedules.length?schedules.slice(0,5).map(s=><div key={s.id}><p className="text-[11.5px] font-medium text-[#3A332E]">{s.title}</p><p className="mt-0.5 text-[9.5px] capitalize text-[#9A9088]">{s.dayOfWeek} · {s.startTime.slice(0,5)}–{s.endTime.slice(0,5)}</p></div>):<p className="text-[11px] text-[#9A9088]">No recurring work blocks.</p>}</div></Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.65fr_.85fr]">
        <Card><h2 className="glow-display text-[18px]">Active Projects</h2><div className="mt-4 space-y-2">{activeProjects.length?activeProjects.map(p=><Link key={p.id} href={`/projects?projectId=${encodeURIComponent(p.id)}#all-projects`} className="block rounded-[10px] p-1 transition hover:bg-[#FDF8F6]"><div className="flex items-center justify-between text-[11px]"><span>{p.title}</span><span className="text-[#9A9088]">{p.progress}%</span></div><div className="mt-1.5 h-1.5 rounded-full bg-[#F1E7E3]"><div className="h-full rounded-full bg-[#C9727E]" style={{width:`${Math.max(0,Math.min(100,p.progress))}%`}}/></div><p className="mt-1 text-[9.5px] capitalize text-[#9A9088]">{p.area} · {p.priority}</p></Link>):<p className="text-[11px] text-[#9A9088]">No active projects yet.</p>}</div><Link href="/projects" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">View all projects <ArrowRight size={11}/></Link></Card>
        <Card><h2 className="glow-display text-[18px]">Deadlines</h2><div className="mt-4 space-y-1">{deadlines.length?deadlines.map(t=><Link key={t.id} href={`/tasks?taskId=${encodeURIComponent(t.id)}&view=all`} className="flex justify-between gap-2 rounded-[10px] px-1 py-2 text-[10.5px] transition hover:bg-[#FDF8F6]"><span className="line-clamp-1">{t.title}</span><span className="shrink-0 text-[#C9727E]">{t.dueDate?.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></Link>):<p className="text-[11px] text-[#9A9088]">No dated deadlines.</p>}</div></Card>
        <Card><h2 className="glow-display text-[18px]">Notes & Ideas</h2><p className="mt-4 text-[11px] leading-5 text-[#8A8078]">Capture campaign thoughts, follow-ups, creative direction, and meeting notes in the same system that feeds Brain and Projects.</p><Link href="/notes" className="mt-5 inline-flex items-center gap-1 text-[11px] text-[#C9727E]">Open notes <ArrowRight size={11}/></Link></Card>
      </section>

      <Card className="bg-[linear-gradient(90deg,#FFF,#FFF7F5)]"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#C9727E]"/><h2 className="glow-display text-[18px]">Glow Work Insight</h2></div><p className="glow-display mt-3 text-[17px] italic leading-6 text-[#4A4440]">You have {priorities.length} visible priorities, {upcomingEvents.length} upcoming calendar items, and {schedules.length} recurring work block{schedules.length===1?'':'s'} in Glow.</p></Card>

      <details className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><summary className="cursor-pointer glow-display text-[17px]">Manage Work Schedule</summary><div className="mt-4"><WorkScheduleManager initialSchedules={schedules.map(s=>({id:s.id,title:s.title,dayOfWeek:s.dayOfWeek,startTime:s.startTime,endTime:s.endTime,notes:s.notes}))}/></div></details>
    </div>
  </SectionPage></AppShell>;
}
