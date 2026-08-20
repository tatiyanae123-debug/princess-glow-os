import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';

export const dynamic = 'force-dynamic';

const beautyWords = ['beauty','facial','skin','skincare','brow','lash','nail','wax','laser','derm','spa','makeup','hair','salon','trim','color','braid','blowout'];
function isBeautyEvent(title:string, description:string|null){const h=`${title} ${description??''}`.toLowerCase();return beautyWords.some(w=>h.includes(w));}
function key(d:Date){return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;}
function fmt(d:Date){return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function monthHref(date:Date){return `/beauty/calendar?year=${date.getFullYear()}&month=${date.getMonth()+1}`;}

export default async function BeautyCalendarPage({searchParams}:{searchParams?:Promise<{year?:string;month?:string}>}){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const events=(await getCalendarEventsByUser(session.user.id)).filter(e=>isBeautyEvent(e.title,e.description)).sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  const params=await searchParams;
  const requestedYear=Number(params?.year);
  const requestedMonth=Number(params?.month);
  const fallback=events.find(e=>e.startAt.getTime()>=Date.now())?.startAt ?? new Date();
  const validRequested=Number.isInteger(requestedYear)&&requestedYear>=2000&&requestedYear<=2100&&Number.isInteger(requestedMonth)&&requestedMonth>=1&&requestedMonth<=12;
  const base=validRequested?new Date(requestedYear,requestedMonth-1,1):fallback;
  const year=base.getFullYear(), month=base.getMonth();
  const previous=new Date(year,month-1,1), next=new Date(year,month+1,1);
  const first=new Date(year,month,1), startWeekday=first.getDay(), daysInMonth=new Date(year,month+1,0).getDate();
  const cells=Array.from({length:42},(_,i)=>{const day=i-startWeekday+1;return day>=1&&day<=daysInMonth?new Date(year,month,day):null;});
  const monthEvents=events.filter(e=>e.startAt.getFullYear()===year&&e.startAt.getMonth()===month);
  const upcoming=events.filter(e=>e.startAt.getTime()>=Date.now()).slice(0,5);
  return <AppShell><div className="b4-beauty-calendar">
    <header className="b4-page-head"><div><p className="glow-eyebrow">6. Beauty Calendar</p><h1 className="glow-display">Beauty Calendar</h1><p>Appointments, treatments and key beauty dates.</p></div><div className="b4-calendar-actions"><Link href="/calendar">Open full calendar</Link></div></header>
    <div className="b4-calendar-shell">
      <section className="b4-calendar-main">
        <div className="b4-calendar-toolbar"><Link href={monthHref(new Date())}>Today</Link><Link aria-label="Previous month" href={monthHref(previous)}>‹</Link><Link aria-label="Next month" href={monthHref(next)}>›</Link><strong>{base.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong><div><span className="active">Month</span><Link href="/calendar?view=week">Week</Link><Link href="/calendar?view=list">List</Link></div></div>
        <div className="b4-weekdays">{'SUN MON TUE WED THU FRI SAT'.split(' ').map(d=><span key={d}>{d}</span>)}</div>
        <div className="b4-month-grid">{cells.map((d,i)=><div key={i} className={`b4-day-cell ${d&&key(d)===key(new Date())?'today':''}`}><span>{d?.getDate()??''}</span>{d?monthEvents.filter(e=>key(e.startAt)===key(d)).slice(0,2).map(e=><Link key={e.id} href={`/calendar?eventId=${e.id}`} className="b4-beauty-event"><b>{e.title}</b><small>{fmt(e.startAt)}</small></Link>):null}</div>)}</div>
      </section>
      <aside className="b4-calendar-rail"><article><h2>Upcoming</h2>{upcoming.length?upcoming.map(e=><Link key={e.id} href={`/calendar?eventId=${e.id}`}><b>{e.title}</b><small>{e.startAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})} · {fmt(e.startAt)}</small></Link>):<p className="empty">No upcoming beauty appointments.</p>}<Link className="rail-link" href="/calendar">View all →</Link></article><article><h2>Key Dates</h2>{monthEvents.slice(0,4).map(e=><div key={e.id}><b>{e.title}</b><small>{e.startAt.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</small></div>)}{!monthEvents.length?<p className="empty">Beauty dates will appear here as you schedule them.</p>:null}</article></aside>
    </div>
    <nav className="b4-subnav"><Link href="/beauty">Beauty OS</Link><Link href="/beauty/lab">Beauty Lab</Link><Link href="/beauty/progress">Progress</Link><Link className="active" href="/beauty/calendar">Calendar</Link></nav>
  </div></AppShell>;
}
