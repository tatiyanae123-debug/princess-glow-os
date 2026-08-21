import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { db } from '@/db';
import { beautyMaintenanceItems, beautyTreatmentSchedules } from '@/db/schema/advanced-beauty';

export const dynamic='force-dynamic';
const beautyWords=['beauty','facial','skin','skincare','brow','lash','nail','wax','laser','derm','spa','makeup','hair','salon','trim','color','braid','blowout','shower','gua sha'];
function isBeautyEvent(title:string,description:string|null){const h=`${title} ${description??''}`.toLowerCase();return beautyWords.some(w=>h.includes(w))}
function dayKey(d:Date){return d.toLocaleDateString('en-CA')}
function monthHref(date:Date){return `/beauty/calendar?year=${date.getFullYear()}&month=${date.getMonth()+1}`}
function dueScheduleOn(schedule:{weekdays:number[];nextDueAt:Date|null},date:Date){return schedule.weekdays.includes(date.getDay())||Boolean(schedule.nextDueAt&&dayKey(schedule.nextDueAt)===dayKey(date))}

export default async function BeautyCalendarPage({searchParams}:{searchParams?:Promise<{year?:string;month?:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');const userId=session.user.id;
  const [allEvents,schedules,maintenance]=await Promise.all([
    getCalendarEventsByUser(userId),
    db.select().from(beautyTreatmentSchedules).where(and(eq(beautyTreatmentSchedules.userId,userId),eq(beautyTreatmentSchedules.enabled,true))),
    db.select().from(beautyMaintenanceItems).where(and(eq(beautyMaintenanceItems.userId,userId),eq(beautyMaintenanceItems.archived,false))),
  ]);
  const events=allEvents.filter(e=>isBeautyEvent(e.title,e.description)).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  const params=await searchParams;const requestedYear=Number(params?.year),requestedMonth=Number(params?.month);const today=new Date();
  const valid=Number.isInteger(requestedYear)&&requestedYear>=2000&&requestedYear<=2100&&Number.isInteger(requestedMonth)&&requestedMonth>=1&&requestedMonth<=12;
  const base=valid?new Date(requestedYear,requestedMonth-1,1):new Date(today.getFullYear(),today.getMonth(),1);const year=base.getFullYear(),month=base.getMonth();
  const prev=new Date(year,month-1,1),next=new Date(year,month+1,1);const start=new Date(year,month,1);const days=new Date(year,month+1,0).getDate();const cells=Array.from({length:42},(_,i)=>{const n=i-start.getDay()+1;return n>=1&&n<=days?new Date(year,month,n):null});
  const monthEvents=events.filter(e=>e.startAt.getFullYear()===year&&e.startAt.getMonth()===month);const upcomingEvents=events.filter(e=>e.startAt>=today).slice(0,5);
  const dueSoon=maintenance.filter(m=>m.nextDueAt&&m.nextDueAt>=today).sort((a,b)=>a.nextDueAt!.getTime()-b.nextDueAt!.getTime()).slice(0,6);

  return <AppShell><div className="mx-auto max-w-7xl space-y-6 pb-24 text-[#493e45]">
    <header className="rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,#fffaf5,#f0e7eb)] p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a47f91]">Beauty Calendar</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Appointments + treatment rhythm + maintenance.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[#7f7178]">External Calendar events stay in Calendar. Beauty treatment schedules and maintenance due dates stay in Beauty. This view brings them together without duplicating the source records.</p><div className="mt-5 flex flex-wrap gap-2"><Link href={monthHref(today)} className="rounded-full bg-[#4b3d46] px-4 py-2 text-xs text-white">Today</Link><Link href={monthHref(prev)} aria-label="Previous month" className="rounded-full bg-white px-4 py-2 text-xs">‹</Link><Link href={monthHref(next)} aria-label="Next month" className="rounded-full bg-white px-4 py-2 text-xs">›</Link><strong className="self-center px-2 font-serif text-lg">{base.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong></div></header>

    <section className="grid gap-4 lg:grid-cols-[1fr_300px]"><div className="rounded-[28px] border border-[#eee2e6] bg-white p-3 sm:p-5"><div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold uppercase tracking-[.1em] text-[#9b8c94]">{'SUN MON TUE WED THU FRI SAT'.split(' ').map(d=><span key={d} className="py-2">{d}</span>)}</div><div className="grid grid-cols-7 gap-1">{cells.map((date,i)=>{if(!date)return <div key={i} className="min-h-24 rounded-xl bg-[#fbf8f6]/60"/>;const dayEvents=monthEvents.filter(e=>dayKey(e.startAt)===dayKey(date));const dayTreatments=schedules.filter(s=>dueScheduleOn(s,date));const dayMaintenance=maintenance.filter(m=>m.nextDueAt&&dayKey(m.nextDueAt)===dayKey(date));const current=dayKey(date)===dayKey(today);return <div key={dayKey(date)} className={`min-h-28 rounded-xl border p-1.5 sm:p-2 ${current?'border-[#c69bac] bg-[#fff5f7]':'border-[#f1e7ea] bg-[#fdfaf9]'}`}><p className="text-[10px] font-semibold">{date.getDate()}</p><div className="mt-1 space-y-1">{dayTreatments.slice(0,2).map(t=><div key={`t-${t.id}`} className={`truncate rounded px-1.5 py-1 text-[8px] ${t.strongTreatment?'bg-[#eee6f3] text-[#725e7a]':'bg-[#eef3e9] text-[#66735f]'}`} title={t.treatmentName}>Treat · {t.treatmentName}</div>)}{dayMaintenance.slice(0,1).map(m=><div key={`m-${m.id}`} className="truncate rounded bg-[#f6ece3] px-1.5 py-1 text-[8px] text-[#846b5d]" title={m.title}>Due · {m.title}</div>)}{dayEvents.slice(0,1).map(e=><Link key={e.id} href={`/calendar?eventId=${e.id}`} className="block truncate rounded bg-[#f5e7eb] px-1.5 py-1 text-[8px] text-[#865d70]" title={e.title}>{e.title}</Link>)}</div></div>})}</div></div>
      <aside className="space-y-4"><article className="rounded-[24px] border border-[#eee2e6] bg-white p-5"><h2 className="font-serif text-2xl">Treatment schedules</h2><p className="mt-2 text-[10px] leading-4 text-[#91848b]">Only schedules you explicitly saved appear here.</p><div className="mt-4 space-y-2">{schedules.length?schedules.slice(0,8).map(s=><div key={s.id} className="rounded-2xl bg-[#faf6f4] p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold">{s.treatmentName}</p>{s.strongTreatment?<span className="rounded-full bg-[#eee6f3] px-2 py-1 text-[8px]">strong</span>:null}</div><p className="mt-1 text-[9px] text-[#92858c]">{s.weekdays.length?`Days: ${s.weekdays.map(d=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ')}`:s.nextDueAt?`Next: ${s.nextDueAt.toLocaleDateString()}`:'No recurrence set'}</p></div>):<p className="text-xs text-[#91848b]">No treatment schedules saved yet. Add them from Beauty Studio.</p>}</div></article>
        <article className="rounded-[24px] border border-[#eee2e6] bg-white p-5"><h2 className="font-serif text-2xl">Coming up</h2><div className="mt-4 space-y-2">{upcomingEvents.map(e=><Link key={e.id} href={`/calendar?eventId=${e.id}`} className="block rounded-2xl bg-[#faf6f4] p-3"><p className="text-xs font-semibold">{e.title}</p><p className="mt-1 text-[9px] text-[#92858c]">{e.startAt.toLocaleString()}</p></Link>)}{dueSoon.map(m=><div key={m.id} className="rounded-2xl bg-[#f8f3ee] p-3"><p className="text-xs font-semibold">{m.title}</p><p className="mt-1 text-[9px] text-[#92858c]">Maintenance · {m.nextDueAt?.toLocaleDateString()}</p></div>)}{!upcomingEvents.length&&!dueSoon.length?<p className="text-xs text-[#91848b]">Nothing Beauty-related is scheduled soon.</p>:null}</div></article></aside></section>

    <nav className="flex flex-wrap gap-2"><Link className="rounded-full border px-4 py-2 text-xs" href="/beauty">Beauty OS</Link><Link className="rounded-full border px-4 py-2 text-xs" href="/beauty/lab">Beauty Lab</Link><Link className="rounded-full border px-4 py-2 text-xs" href="/beauty/progress">Progress</Link><span className="rounded-full bg-[#4b3d46] px-4 py-2 text-xs text-white">Calendar</span></nav>
  </div></AppShell>;
}
