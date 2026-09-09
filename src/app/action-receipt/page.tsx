import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, asc, desc, eq, gte } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { UtilityFrame, styles as shell } from '@/components/system-reference/utility-frame';
import { db } from '@/db';
import { auditEvents } from '@/db/schema/completion-v1';
import { calendarEvents } from '@/db/schema/calendar-events';
import { reverseConciergeProposalAction } from '@/app/actions/concierge';
import { CalendarDays, Check, Eye, RotateCcw, Sparkles } from 'lucide-react';
import styles from './action-receipt.module.css';

export const dynamic='force-dynamic';
type Details=Record<string,unknown>;
function details(value:unknown):Details{return value&&typeof value==='object'?value as Details:{}}
function str(value:unknown){return typeof value==='string'?value:''}
function friendly(value:string){return value.replace(/^ai_proposal_/,'').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}
function summaryFor(action:string,d:Details){return str(d.summary)||str(d.intent)||friendly(action)}
function reasonFor(d:Details){return str(d.reason)||str(d.intent)||'This receipt records the change Glow actually wrote to your system.'}
function timeLabel(date:Date){return date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}

export default async function ActionReceiptPage({searchParams}:{searchParams:Promise<{id?:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const {id}=await searchParams;
  const eventRows=id?await db.select().from(auditEvents).where(and(eq(auditEvents.userId,session.user.id),eq(auditEvents.id,id))).limit(1):await db.select().from(auditEvents).where(eq(auditEvents.userId,session.user.id)).orderBy(desc(auditEvents.createdAt)).limit(1);
  const event=eventRows[0];
  const upcoming=await db.select().from(calendarEvents).where(and(eq(calendarEvents.userId,session.user.id),eq(calendarEvents.archived,false),gte(calendarEvents.startAt,new Date()))).orderBy(asc(calendarEvents.startAt)).limit(5);
  const d=event?details(event.details):{};
  const executed=d.executedEntity&&typeof d.executedEntity==='object'?d.executedEntity as {entityType?:string;entityId?:string}:undefined;
  const reversible=event?.action==='ai_proposal_approved'&&event.entityId&&executed?.entityId;
  const changes:{title:string;note:string}[]=[];
  if(event){
    changes.push({title:friendly(event.action),note:summaryFor(event.action,d)});
    if(executed?.entityType)changes.push({title:`${friendly(executed.entityType)} affected`,note:executed.entityId?`Object ${executed.entityId.slice(0,8)}…`:'Recorded in Glow'});
  }
  return <AppShell><UtilityFrame title="Action Receipt" backHref="/history" backLabel="History">
    <div className={styles.body}>
      <div className={styles.layout}>
        <section className={styles.lead}>
          <h1>{event?'All set':'Nothing to review'}</h1>
          <h2>{event?'Glow recorded the change.':'No action receipt exists yet.'}</h2>
          <p>{event?'The result is visible, its source is preserved, and reversible actions remain under your control.':'When Glow completes a meaningful state change, its receipt will appear here and in History.'}</p>
          <div className={`${shell.glass} ${styles.receiptCard}`}>
            {event?<><div className={styles.receiptHeader}><div><span className={styles.check}><Check size={22}/></span><div><strong className={shell.sectionTitle}>Action completed</strong><p className={shell.sectionNote}>{event.createdAt.toLocaleString()}</p></div></div><span className={shell.tiny}>Recorded by Glow</span></div><div className={styles.changeList}>{changes.map((change,index)=><div key={`${change.title}-${index}`} className={styles.change}><span className={shell.railDot}>{index===0?<Sparkles size={14}/>:<CalendarDays size={14}/>}</span><div><strong>{change.title}</strong><p className={shell.sectionNote}>{change.note}</p></div><Link href="/history" className={shell.btn}><Eye size={12}/>View</Link></div>)}</div><div className={styles.reason}><span className={shell.railDot}><Sparkles size={13}/></span><div><strong>Reason</strong><p className={shell.sectionNote}>{reasonFor(d)}</p></div></div></>:<div className={shell.empty}>Complete an approved Glow action to create a real receipt. The reference examples are not being inserted as sample data.</div>}
          </div>
          <div className={styles.ctaRow}>{reversible&&event?.entityId?<form action={reverseConciergeProposalAction.bind(null,event.entityId)}><button className={shell.btn} style={{width:'100%'}}><RotateCcw size={15}/>Undo changes</button></form>:<span className={shell.btn} aria-disabled="true" style={{opacity:.5}}>Undo unavailable for this record</span>}<Link href="/today?room=what-now" className={`${shell.btn} ${shell.btnPrimary}`}><Check size={15}/>Keep moving</Link></div>
        </section>
        <section className={`${shell.glass} ${styles.schedule}`}><div className={styles.scheduleHead}><div><span className={styles.scheduleIcon}><CalendarDays size={20}/></span><div><h2 className={shell.sectionTitle}>Your schedule</h2><p className={shell.sectionNote}>Live upcoming calendar state</p></div></div><Link href="/calendar" className={shell.btn}>Open ↗</Link></div><div className={styles.timeGrid}>{upcoming.length?upcoming.map(item=><article key={item.id} className={styles.event}><span className={styles.eventTime}>{timeLabel(item.startAt)}</span><strong>{item.title}</strong><p>{timeLabel(item.startAt)}{item.endAt?` – ${timeLabel(item.endAt)}`:''}{item.location?` · ${item.location}`:''}</p></article>):<div className={shell.empty}>No upcoming calendar events are available to preview.</div>}</div></section>
      </div>
      <div className={`${shell.glass} ${styles.quote}`}><span className={shell.pearl}/><span>{event?'“It’s done. Space to think again.”':'Receipts appear only when something actually changes.'}</span></div>
      <footer className={styles.footer}><span>More flow ahead. Small changes create a kinder, clearer day.</span><Link href="/history" style={{color:'inherit'}}>Open History →</Link></footer>
    </div>
  </UtilityFrame></AppShell>;
}
