import Link from 'next/link';
import { redirect } from 'next/navigation';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { UtilityFrame, styles as shell } from '@/components/system-reference/utility-frame';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { aiProposals, intelligentObservations } from '@/db/schema/completion-v1';
import { AlertTriangle, Bell, Clock3, Eye, Filter, Leaf, Search, Settings, Sparkles, UsersRound } from 'lucide-react';
import styles from './attention.module.css';

export const dynamic='force-dynamic';
type Task=typeof tasks.$inferSelect;
type Observation=typeof intelligentObservations.$inferSelect;
function dayEnd(date:Date){return new Date(date.getFullYear(),date.getMonth(),date.getDate(),23,59,59,999)}
function withinDays(date:Date,days:number){const end=new Date();end.setDate(end.getDate()+days);return date<=dayEnd(end)}
function dueLabel(date:Date|null){if(!date)return'No due time';const now=new Date();const today=dayEnd(now);if(date<now)return'Overdue';if(date<=today)return'Today';if(withinDays(date,1))return'Tomorrow';return date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function taskHref(task:Task){return `/tasks?highlight=${encodeURIComponent(task.id)}`}
function observationHref(){return'/observations'}
function confidencePct(value:number){return `${Math.round(value*100)}% confidence`}

export default async function AttentionPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [taskRows,observations,proposals]=await Promise.all([
    db.select().from(tasks).where(eq(tasks.userId,session.user.id)).orderBy(desc(tasks.updatedAt)).limit(100),
    db.select().from(intelligentObservations).where(eq(intelligentObservations.userId,session.user.id)).orderBy(desc(intelligentObservations.createdAt)).limit(60),
    db.select().from(aiProposals).where(eq(aiProposals.userId,session.user.id)).orderBy(desc(aiProposals.createdAt)).limit(30),
  ]);
  const now=new Date();
  const activeTasks=taskRows.filter(t=>!t.archived&&t.status!=='done'&&t.status!=='cancelled');
  const needsNow=activeTasks.filter(t=>t.status==='in_progress'||t.priority==='urgent'||Boolean(t.dueDate&&t.dueDate<=dayEnd(now))).slice(0,5);
  const soon=activeTasks.filter(t=>!needsNow.some(n=>n.id===t.id)&&Boolean(t.dueDate&&t.dueDate>dayEnd(now)&&withinDays(t.dueDate,7))).slice(0,5);
  const activeObservations=observations.filter(o=>o.status==='active'&&(!o.snoozedUntil||o.snoozedUntil<=now));
  const concerns=activeObservations.filter(o=>o.confidence>=.75||/risk|concern|warning|over|late|miss|block/i.test(`${o.category} ${o.title}`)).slice(0,4);
  const suggestions=activeObservations.filter(o=>!concerns.some(c=>c.id===o.id)).slice(0,4);
  const pending=proposals.filter(p=>p.status==='pending').slice(0,4);
  const ignored=taskRows.filter(t=>t.archived||t.status==='cancelled');
  const identified=needsNow.length+soon.length+concerns.length+suggestions.length+pending.length;
  const scanned=taskRows.length+observations.length+proposals.length;
  const rail=[
    {label:'Attention',href:'/attention',active:true,icon:<span className={shell.railDot}><Bell size={15}/></span>},
    {label:'Search',href:'/search',icon:<span className={shell.railDot}><Search size={15}/></span>},
    {label:'History',href:'/history',icon:<span className={shell.railDot}><Clock3 size={15}/></span>},
    {label:'Settings',href:'/settings',icon:<span className={shell.railDot}><Settings size={15}/></span>},
  ];
  const taskItem=(task:Task)=><Link key={task.id} href={taskHref(task)} className={`${shell.well} ${styles.item}`} style={{textDecoration:'none',color:'inherit'}}><span className={styles.itemIcon}><Bell size={13}/></span><div><strong>{task.title}</strong><p>{task.description||`${task.priority} priority · ${task.status.replace('_',' ')}`}</p><div className={styles.tags}><span className={styles.tag}>{task.priority}</span>{task.status==='in_progress'?<span className={styles.tag}>in progress</span>:null}</div></div><span className={styles.itemTime}>{dueLabel(task.dueDate)}</span></Link>;
  const observationItem=(item:Observation)=><Link key={item.id} href={observationHref()} className={`${shell.well} ${styles.item}`} style={{textDecoration:'none',color:'inherit'}}><span className={styles.itemIcon}><Sparkles size={13}/></span><div><strong>{item.title}</strong><p>{item.evidence}</p><div className={styles.tags}><span className={styles.tag}>{item.category}</span></div></div><span className={styles.itemTime}>{confidencePct(item.confidence)}</span></Link>;
  return <AppShell><UtilityFrame title="Attention Center" rail={rail}>
    <header className={styles.header}><div><h1>ATTENTION CENTER</h1><p>What matters now, what can wait, and what Glow can support without adding noise.</p></div><div className={shell.segmented}><span data-active="true">For me</span><span aria-disabled="true" style={{opacity:.42}}>Team unavailable</span></div></header>
    <section className={`${shell.glass} ${styles.hero}`}><div className={styles.heroCopy}><h2>Less noise.<br/>More you.</h2><p>Only verified signals rise into this field. Unknown dependencies stay unknown.</p></div><div className={styles.heroRibbon} aria-hidden="true"/><div className={styles.heroMeta}><div className={`${shell.well} ${styles.modeCard}`}><div className={styles.modeRow}><div><strong>Focus mode</strong><p className={shell.sectionNote}>Filter to what matters</p></div><span className={styles.toggle}/></div><div className={styles.modeRow} style={{marginTop:10}}><div><strong>Intelligence level</strong><p className={shell.sectionNote}>Balanced · evidence-aware</p></div><Sparkles size={14}/></div></div><div className={styles.metrics}><div className={styles.metric}><span>Scanned</span><strong>{scanned}</strong></div><div className={styles.metric}><span>Identified</span><strong>{identified}</strong></div><div className={styles.metric}><span>Saved you</span><strong>Not measured</strong></div></div></div></section>
    <div className={styles.grid}>
      <section className={`${shell.glass} ${styles.panel} ${styles.panelWide}`}><div className={styles.panelHead}><div><span className={`${styles.tone} ${styles.urgent}`}><AlertTriangle size={16}/></span><div><h2 className={shell.sectionTitle}>Needs attention now</h2><p className={shell.sectionNote}>Time-sensitive, in progress, overdue, or urgent.</p></div></div><strong>{needsNow.length}</strong></div><div className={styles.items}>{needsNow.length?needsNow.map(taskItem):<div className={shell.empty}>Nothing verified as urgent right now.</div>}</div></section>
      <section className={`${shell.glass} ${styles.panel}`}><div className={styles.panelHead}><div><span className={`${styles.tone} ${styles.soon}`}><Clock3 size={16}/></span><div><h2 className={shell.sectionTitle}>Soon</h2><p className={shell.sectionNote}>Due within the next seven days.</p></div></div><strong>{soon.length}</strong></div><div className={styles.items}>{soon.length?soon.map(taskItem):<div className={shell.empty}>No dated tasks are approaching.</div>}</div></section>
      <section className={`${shell.glass} ${styles.panel}`}><div className={styles.panelHead}><div><span className={`${styles.tone} ${styles.wait}`}><UsersRound size={16}/></span><div><h2 className={shell.sectionTitle}>Waiting for someone</h2><p className={shell.sectionNote}>Only explicit dependencies belong here.</p></div></div><strong>0</strong></div><div className={shell.empty}>No verified person dependency is modeled yet. Glow is not guessing from task wording.</div></section>
      <section className={`${shell.glass} ${styles.panel}`}><div className={styles.panelHead}><div><span className={`${styles.tone} ${styles.concern}`}><AlertTriangle size={16}/></span><div><h2 className={shell.sectionTitle}>Possible concern</h2><p className={shell.sectionNote}>Evidence-backed observations worth reviewing.</p></div></div><strong>{concerns.length}</strong></div><div className={styles.items}>{concerns.length?concerns.map(observationItem):<div className={shell.empty}>No active concern meets the evidence threshold.</div>}</div></section>
      <section className={`${shell.glass} ${styles.panel}`}><div className={styles.panelHead}><div><span className={`${styles.tone} ${styles.suggest}`}><Leaf size={16}/></span><div><h2 className={shell.sectionTitle}>Quiet suggestion</h2><p className={shell.sectionNote}>Optional observations, never disguised as obligations.</p></div></div><strong>{suggestions.length}</strong></div><div className={styles.items}>{suggestions.length?suggestions.map(observationItem):<div className={shell.empty}>Glow has nothing useful to suggest right now.</div>}</div></section>
      <section className={`${shell.glass} ${styles.panel}`}><div className={styles.panelHead}><div><span className={`${styles.tone} ${styles.wait}`}><Eye size={16}/></span><div><h2 className={shell.sectionTitle}>Awaiting your approval</h2><p className={shell.sectionNote}>Prepared actions remain proposals until you approve.</p></div></div><strong>{pending.length}</strong></div><div className={styles.items}>{pending.length?pending.map(p=><Link key={p.id} href="/concierge/approvals" className={`${shell.well} ${styles.item}`} style={{textDecoration:'none',color:'inherit'}}><span className={styles.itemIcon}><Sparkles size={13}/></span><div><strong>{p.summary}</strong><p>{p.reason}</p></div><span className={styles.itemTime}>Review</span></Link>):<div className={shell.empty}>No proposals are waiting for approval.</div>}</div></section>
    </div>
    <section className={`${shell.glass} ${styles.safeRow}`}><span className={`${styles.tone} ${styles.safe}`}><Eye size={16}/></span><div><h2 className={shell.sectionTitle}>Safe to ignore</h2><p className={shell.sectionNote}>Kept visible for transparency. These are already archived or cancelled, not silently hidden.</p></div><div className={styles.safeItems}><span className={styles.safeChip}>{ignored.length} archived or cancelled task{ignored.length===1?'':'s'}</span></div></section>
    <footer className={styles.bottom}><div className={styles.filters}><span className={shell.capsule}><Filter size={12}/>All {identified}</span><Link className={shell.capsule} href="/tasks">Action {needsNow.length+soon.length}</Link><Link className={shell.capsule} href="/observations">FYI {concerns.length+suggestions.length}</Link></div><Link href="/search" className={shell.btn}>Search everything →</Link></footer>
  </UtilityFrame></AppShell>;
}
