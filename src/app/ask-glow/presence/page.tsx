import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, asc, desc, eq, gte } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { calendarEvents } from '@/db/schema/calendar-events';
import { notes } from '@/db/schema/notes';
import { projects } from '@/db/schema/intelligence-expansion';
import { ArrowRight, CalendarDays, FileText, Folder, Home, Mic, Search, Sparkles } from 'lucide-react';
import styles from './presence.module.css';

export const dynamic='force-dynamic';

export default async function GlowPresencePage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');const userId=session.user.id;const now=new Date();
  const [projectRows,noteRows,eventRows]=await Promise.all([
    db.select().from(projects).where(eq(projects.userId,userId)).orderBy(desc(projects.updatedAt)).limit(2),
    db.select().from(notes).where(and(eq(notes.userId,userId),eq(notes.archived,false))).orderBy(desc(notes.updatedAt)).limit(2),
    db.select().from(calendarEvents).where(and(eq(calendarEvents.userId,userId),eq(calendarEvents.archived,false),gte(calendarEvents.startAt,now))).orderBy(asc(calendarEvents.startAt)).limit(2),
  ]);
  const currentProject=projectRows[0];const nextEvent=eventRows[0];const currentNote=noteRows[0];
  const contextCount=[currentProject,currentNote,nextEvent].filter(Boolean).length;
  const stateRows=[['Understanding',contextCount?`${contextCount} live context signal${contextCount===1?'':'s'} ready`:'No current context object'],['Listening','Voice is available when you open the conversation'],['Thinking','Works on the request after you send it'],['Acting','Carries out approved actions only']];
  return <main className={styles.surface} aria-label="Ask Glow Ambient Presence">
    <header className={styles.top}><strong className={styles.brand}>Glow OS</strong><div className={styles.topActions}><Link href="/search" className={styles.circle} aria-label="Search"><Search size={16}/></Link><Link href="/home" className={styles.circle} aria-label="Home"><Home size={16}/></Link></div></header>
    <div className={styles.layout}>
      <section className={styles.hero}><p style={{margin:'0 0 9px',fontSize:9,letterSpacing:'.24em',textTransform:'uppercase',color:'#7b716d'}}>Glow</p><h1>Ask Glow <span>Ambient Presence</span></h1><p>Aware. Attuned. In your flow. Glow quietly connects the context you actually have and helps you move forward without inventing what it cannot see.</p><div className={styles.states}>{stateRows.map(([name,note],index)=><div key={name} className={styles.state} data-active={index===0&&contextCount?'true':'false'}><span className={styles.stateDot}>{index===0?'•':'○'}</span><div><strong>{name}</strong><p>{note}</p></div></div>)}</div><div className={styles.platform}><div className={styles.orb}/><p className={styles.orbLabel}>{contextCount?`Context ready from ${contextCount} connected object${contextCount===1?'':'s'}.`:'No project, note, or upcoming calendar context is currently in view.'}</p></div></section>
      <aside className={styles.side}><div className={`${styles.composer} ${styles.contextCard}`} style={{minHeight:74}}><span style={{width:45,height:45,borderRadius:'50%',background:'radial-gradient(circle at 30% 24%,#fff,rgba(207,220,255,.58),rgba(233,192,240,.48),rgba(255,226,197,.5))',boxShadow:'inset 4px 4px 8px white,0 7px 15px rgba(78,64,68,.1)'}}/><div className={styles.composerText}><strong>Ask Glow</strong><p>Talk, type, attach, or create anything.</p></div><Link href="/ask-glow" className={styles.circle} aria-label="Open Ask Glow"><Mic size={17}/></Link></div><div className={styles.quick}><Link href="/ask-glow"><FileText size={14}/>Summarize this</Link><Link href="/ask-glow"><ArrowRight size={14}/>Find next steps</Link><Link href="/ask-glow"><Sparkles size={14}/>Turn into plan</Link><Link href="/ask-glow"><FileText size={14}/>Draft for me</Link></div><Link href="/ask-glow" className={`${styles.more} ${styles.quick} ${styles.contextCard}`} style={{display:'flex',textDecoration:'none',color:'inherit',minHeight:48,alignItems:'center',padding:'0 14px'}}><span>More suggestions</span><ArrowRight size={14}/></Link><section className={styles.context}><h2>Live context</h2><div className={styles.contextRows}>{currentProject?<Link href="/projects" className={styles.contextRow}><span className={styles.contextIcon}><Folder size={15}/></span><div><strong>{currentProject.title}</strong><p>{currentProject.nextAction??'Project in view'}</p></div><ArrowRight size={12}/></Link>:null}{nextEvent?<Link href="/calendar" className={styles.contextRow}><span className={styles.contextIcon}><CalendarDays size={15}/></span><div><strong>{nextEvent.title}</strong><p>{nextEvent.startAt.toLocaleString()}</p></div><ArrowRight size={12}/></Link>:null}{currentNote?<Link href="/notes" className={styles.contextRow}><span className={styles.contextIcon}><FileText size={15}/></span><div><strong>{currentNote.title}</strong><p>Recently updated note</p></div><ArrowRight size={12}/></Link>:null}{contextCount===0?<div className={styles.contextRow}><span className={styles.contextIcon}><Sparkles size={15}/></span><div><strong>Context is quiet</strong><p>Open a Glow object or start a conversation.</p></div></div>:null}</div></section></aside>
    </div>
    <section className={styles.inView}><div className={styles.inViewLead}><span>In view</span><h2>{currentProject?.title??'Your current context'}</h2><p>{currentProject?.nextAction??(contextCount?'Related objects are ready below.':'Nothing specific is selected yet.')}</p></div>{currentProject?<article className={styles.contextCard}><Folder size={16}/><strong>Project</strong><p>{currentProject.title}<br/>{currentProject.status} · {currentProject.progress}% recorded progress</p></article>:null}{nextEvent?<article className={styles.contextCard}><CalendarDays size={16}/><strong>Next on Calendar</strong><p>{nextEvent.title}<br/>{nextEvent.startAt.toLocaleString()}</p></article>:null}{currentNote?<article className={styles.contextCard}><FileText size={16}/><strong>Recent note</strong><p>{currentNote.title}<br/>{currentNote.content?.slice(0,100)??'No note preview'}</p></article>:null}</section>
    <div className={styles.bottomComposer}><span style={{width:32,height:32,borderRadius:'50%',background:'radial-gradient(circle,#fff,rgba(194,214,255,.7),rgba(228,190,242,.55))'}}/><span>Ask Glow something…</span><Link href="/ask-glow" aria-label="Open Ask Glow"><ArrowRight size={15}/></Link></div>
  </main>;
}
