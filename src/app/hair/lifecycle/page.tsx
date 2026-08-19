import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getHairLogs } from '@/lib/data/completion-v1';

export const dynamic='force-dynamic';
const D=86400000;
const wash=(s:string)=>/wash|shampoo|clarif|cleanse/i.test(s);
const fmt=(d:Date)=>d.toLocaleDateString('en-US',{month:'short',day:'numeric'});

export default async function HairLifecyclePage(){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const logs=(await getHairLogs(session.user.id)).sort((a,b)=>b.occurredAt.getTime()-a.occurredAt.getTime());
  const washes=logs.filter(x=>wash(x.eventType));
  const lastWash=washes[0]?.occurredAt??null;
  const interval=washes.length>1?Math.max(1,Math.round((washes[0].occurredAt.getTime()-washes[1].occurredAt.getTime())/D)):7;
  const daysSince=lastWash?Math.max(1,Math.floor((Date.now()-lastWash.getTime())/D)+1):1;
  const day=Math.min(interval,daysSince);
  const cycle=['Wash','Condition','Treat','Style','Refresh','Rest',interval>=7?'Wash':'Reset'];
  const cycleStart=lastWash??new Date();
  const nextWash=new Date(cycleStart.getTime()+interval*D);
  const recent=logs.slice(0,6);
  const productNames=recent.flatMap(x=>x.products?.split(/[,;+]/).map(v=>v.trim()).filter(Boolean)??[]).slice(0,3);
  const heatRecent=logs.filter(x=>x.heatUsed&&Date.now()-x.occurredAt.getTime()<30*D).length;
  const health=Math.max(45,Math.min(96,86-heatRecent*4+(washes.length>=2?4:0)));
  return <AppShell><div className="b4-hair-lifecycle">
    <header className="b4-page-head"><div><p className="glow-eyebrow">5. Hair Lifecycle</p><h1 className="glow-display">Hair Lifecycle</h1><p>Plan, track and perfect your hair journey.</p></div><div className="b4-lifecycle-tabs"><span className="active">Overview</span><span>Growth</span><span>Treatments</span><span>History</span></div></header>
    <section className="b4-cycle-rail">{cycle.map((label,i)=><div key={`${label}-${i}`} className={i+1===day?'active':i+1<day?'done':''}><b>{label}</b><small>Day {i+1}</small><i/></div>)}</section>
    <section className="b4-lifecycle-grid">
      <article><h2>This Cycle</h2><dl><div><dt>Started</dt><dd>{lastWash?fmt(lastWash):'Not logged'}</dd></div><div><dt>Wash Day</dt><dd>{lastWash?fmt(lastWash):'—'}</dd></div><div><dt>Next Wash</dt><dd>{fmt(nextWash)}</dd></div><div><dt>Length Goal</dt><dd>Track in Goals</dd></div><div><dt>Target Style</dt><dd>{recent.find(x=>x.style)?.style??'Add a style log'}</dd></div></dl></article>
      <article><h2>Cycle Notes</h2>{recent[0]?.notes?<><p>{recent[0].notes}</p><small>{fmt(recent[0].occurredAt)}</small></>:<p className="empty">Add notes to a hair log and Glow will carry them into the current cycle.</p>}<Link href="/hair">Edit →</Link></article>
      <article><h2>Cycle Health</h2>{[['Strength',health],['Shine',Math.max(40,health-5)],['Hydration',Math.max(45,health-2)],['Manageability',Math.max(42,health-7)]].map(([label,value])=><div className="b4-health-row" key={label as string}><span>{label}</span><b>{value}%</b><i><em style={{width:`${value}%`}}/></i></div>)}</article>
    </section>
    <section className="b4-recommendations"><h2>Recommended for Day {day}</h2><div>{productNames.length?productNames.map((p,i)=><article key={`${p}-${i}`}><div className="b4-product-bottle"/><b>{p}</b><small>{i===0?'Use lightly':'Based on recent logs'}</small></article>):<p className="empty">Log products on Hair Studio to build cycle recommendations.</p>}</div><Link href="/hair">View Full Plan</Link></section>
    <nav className="b4-subnav"><Link href="/hair">Hair Studio</Link><Link className="active" href="/hair/lifecycle">Lifecycle</Link></nav>
  </div></AppShell>;
}
