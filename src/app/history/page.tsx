import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { UtilityFrame, styles as shell } from '@/components/system-reference/utility-frame';
import { db } from '@/db';
import { auditEvents } from '@/db/schema/completion-v1';
import { calendarSyncHistory } from '@/db/schema/calendar-events';
import { reverseConciergeProposalAction } from '@/app/actions/concierge';
import { Clock3, Cloud, History, RotateCcw, Search, Settings, Sparkles } from 'lucide-react';
import styles from './history.module.css';

export const dynamic='force-dynamic';

type Details=Record<string,unknown>;
function details(value:unknown):Details{return value&&typeof value==='object'?value as Details:{}}
function text(value:unknown){return typeof value==='string'?value:''}
function friendly(value:string){return value.replace(/^ai_proposal_/,'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}
function eventCopy(action:string,d:Details){
  const summary=text(d.summary)||text(d.intent);
  if(summary)return summary;
  return friendly(action);
}
function groupLabel(date:Date){const now=new Date();const today=new Date(now.getFullYear(),now.getMonth(),now.getDate());const day=new Date(date.getFullYear(),date.getMonth(),date.getDate());const diff=Math.round((today.getTime()-day.getTime())/86400000);if(diff===0)return'Today';if(diff===1)return'Yesterday';return'Earlier'}
function timeLabel(date:Date){return date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}

export default async function HistoryPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const {q=''}=await searchParams;
  const term=q.trim();
  const where=term?and(eq(auditEvents.userId,session.user.id),or(ilike(auditEvents.action,`%${term}%`),ilike(auditEvents.entityType,`%${term}%`))):eq(auditEvents.userId,session.user.id);
  const [events,syncRows]=await Promise.all([
    db.select().from(auditEvents).where(where).orderBy(desc(auditEvents.createdAt)).limit(40),
    db.select().from(calendarSyncHistory).where(eq(calendarSyncHistory.userId,session.user.id)).orderBy(desc(calendarSyncHistory.startedAt)).limit(1),
  ]);
  const groups=new Map<string,typeof events>();
  for(const event of events){const key=groupLabel(event.createdAt);groups.set(key,[...(groups.get(key)??[]),event]);}
  const latest=events[0];
  const latestDetails=latest?details(latest.details):{};
  const latestCanUndo=latest?.action==='ai_proposal_approved'&&latest.entityId&&Boolean((latestDetails.executedEntity as {entityId?:string}|undefined)?.entityId);
  const sync=syncRows[0];
  const rail=[
    {label:'History',href:'/history',active:true,icon:<span className={shell.railDot}><History size={15}/></span>},
    {label:'Sync',href:'/history#sync',icon:<span className={shell.railDot}><Cloud size={15}/></span>},
    {label:'Settings',href:'/settings',icon:<span className={shell.railDot}><Settings size={15}/></span>},
  ];
  return <AppShell><UtilityFrame title="History · Undo · Sync" rail={rail}>
    <div className={styles.heroWrap}>
      <div className={`${shell.ribbon} ${styles.heroRibbon}`} aria-hidden="true"/>
      <div className={shell.hero}><p className={shell.eyebrow}>Your progress lives here</p><h1>Undo. Restore. Keep Moving.</h1><p>Every recorded Glow change stays visible. Explore what happened, return to a reversible state when the source supports it, and keep moving with confidence.</p></div>
    </div>
    <div className={`${shell.glass} ${styles.modeBar}`}>
      <div className={shell.segmented}><span data-active="true"><History size={13}/> History</span><span><RotateCcw size={13}/> Undo</span><span><Cloud size={13}/> Sync</span></div>
      <form action="/history"><Search size={14}/><input className={shell.searchInput} name="q" defaultValue={term} placeholder="Search your history…"/><button className={shell.btn}>Search</button></form>
    </div>
    <div className={styles.layout}>
      <section className={`${shell.glass} ${styles.timelinePanel}`}>
        {events.length?Array.from(groups.entries()).map(([label,items])=><div key={label} className={styles.timelineGroup}><h2 className={styles.groupTitle}>{label}</h2><div className={styles.timeline}>{items.map(event=>{const d=details(event.details);return <article key={event.id} className={`${shell.well} ${styles.event}`}><span className={styles.time}>{timeLabel(event.createdAt)}</span><div className={styles.eventTitle}><span className={styles.eventIcon}><Sparkles size={15}/></span><div><strong>{friendly(event.entityType)}</strong><p>{eventCopy(event.action,d)}</p><p className={shell.tiny}>{friendly(event.action)} · {event.createdAt.toLocaleString()}</p></div></div><div className={styles.actions}>{event.action==='ai_proposal_approved'&&event.entityId&&Boolean((d.executedEntity as {entityId?:string}|undefined)?.entityId)?<form action={reverseConciergeProposalAction.bind(null,event.entityId)}><button className={shell.btn}><RotateCcw size={12}/>Undo</button></form>:<Link className={shell.btn} href={`/action-receipt?id=${event.id}`}>View</Link>}</div></article>})}</div></div>):<div className={styles.nothing}>{term?'No recorded Glow changes match that search yet.':'No Glow state-change history has been recorded yet.'}</div>}
      </section>
      <aside className={styles.right}>
        <section id="sync" className={`${shell.glass} ${styles.sync}`}><div className={styles.syncHead}><div><h2 className={shell.sectionTitle}>Sync</h2>{sync?.status==='success'?<><span className={shell.statusDot}/><span className={shell.tiny}>Calendar cloud up to date</span></>:<span className={shell.tiny}>{sync?'Last sync did not complete successfully':'No sync record yet'}</span>}</div>{sync?.completedAt?<span className={shell.tiny}>Last synced<br/>{sync.completedAt.toLocaleString()}</span>:null}</div><div className={styles.devices}><div className={styles.device}><div className={styles.deviceScreen}/><div className={styles.pedestal}/><strong>Current device</strong><p>This browser · active</p></div><div className={styles.device}><div className={`${styles.deviceScreen} ${styles.deviceWide}`}/><div className={styles.pedestal}/><strong>Calendar cloud</strong><p>{sync?`${sync.eventsRead} events read`:'Not reported yet'}</p></div></div><Link href="/connections" className={shell.row} style={{textDecoration:'none',color:'inherit'}}><span className={shell.pearlSm}/><div><strong>Your world, in sync.</strong><p>Review connected services, permissions, and source sync health.</p></div></Link></section>
        <section className={`${shell.glass} ${styles.quick}`}><h2 className={shell.sectionTitle}>Quick Actions</h2><div className={styles.quickGrid}>{latestCanUndo&&latest?.entityId?<form action={reverseConciergeProposalAction.bind(null,latest.entityId)}><button className={shell.btn} style={{width:'100%'}}><RotateCcw size={12}/>Undo last change</button></form>:<span className={shell.btn} aria-disabled="true" style={{opacity:.48}}>Undo unavailable</span>}<Link href="/history" className={shell.btn}><Clock3 size={12}/>Browse history</Link><Link href="/search?q=history" className={shell.btn}>Restore from…</Link><Link href="/connections" className={shell.btn}><Cloud size={12}/>Manage sync</Link></div></section>
        <section className={`${shell.glass} ${styles.philosophy}`}><p>Progress is a practice.<br/>You can always return.</p></section>
      </aside>
    </div>
  </UtilityFrame></AppShell>;
}
