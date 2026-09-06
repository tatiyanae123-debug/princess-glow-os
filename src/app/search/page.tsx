import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, eq, ilike, or } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { notes } from '@/db/schema/notes';
import { goals } from '@/db/schema/goals';
import { habits } from '@/db/schema/habits';
import { calendarEvents } from '@/db/schema/calendar-events';
import { financeEntries } from '@/db/schema/finance-entries';
import { importantLinks } from '@/db/schema/important-links';
import { appointments } from '@/db/schema/appointments';
import { beautyRoutines } from '@/db/schema/beauty-routines';
import { medications, supplements } from '@/db/schema/health-intelligence';
import { routines, routineSteps } from '@/db/schema/routines';
import { projects, lifeMemories } from '@/db/schema/intelligence-expansion';
import { beautyProducts, closetItems, financeGoals, fitnessSessions, hairLogs, intelligentObservations, lifeTimelineEvents, planningPeriods } from '@/db/schema/completion-v1';
import { ArrowRight, CalendarDays, FileText, Globe2, MessageCircle, Search, UserRound } from 'lucide-react';
import styles from './search-reference.module.css';

export const dynamic = 'force-dynamic';
type Result = { id:string; type:string; title:string; subtitle?:string|null; href:string };
type WorldFilter = 'Today'|'Plan'|'Life'|'Brain'|'Create';

function worldForType(type:string):WorldFilter{
  if(['Task','Calendar','Appointment'].includes(type)) return 'Today';
  if(['Habit','Routine','Routine Step','Goal','Planning','Project'].includes(type)) return 'Plan';
  if(['Beauty Product','Beauty Routine','Hair','Fitness','Closet','Finance','Finance Goal','Medication','Supplement'].includes(type)) return 'Life';
  if(['Note','Memory','Timeline','Glow Notice','Link'].includes(type)) return 'Brain';
  return 'Create';
}
function scopeForType(type:string){
  if(['Calendar','Appointment'].includes(type)) return 'calendar';
  if(type==='Note') return 'notes';
  return 'all';
}
function queryHref(q:string, extra:Record<string,string|undefined>){
  const params=new URLSearchParams();
  if(q) params.set('q',q);
  Object.entries(extra).forEach(([key,value])=>{if(value)params.set(key,value)});
  return `/search${params.toString()?`?${params.toString()}`:''}`;
}

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string;scope?:string;world?:string}>}){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const params=await searchParams;
  const term=(params.q??'').trim();
  const selectedScope=params.scope??'all';
  const selectedWorld=(['Today','Plan','Life','Brain','Create'].includes(params.world??'')?params.world:undefined) as WorldFilter|undefined;
  let results:Result[]=[];

  if(term){
    const like=`%${term}%`;
    const userId=session.user.id;
    const [taskRows,noteRows,goalRows,projectRows,memoryRows,productRows,linkRows,calendarRows,habitRows,financeRows,planningRows,hairRows,fitnessRows,closetRows,financeGoalRows,timelineRows,observationRows,routineRows,routineStepRows,appointmentRows,beautyRoutineRows,medicationRows,supplementRows]=await Promise.all([
      db.select().from(tasks).where(and(eq(tasks.userId,userId),or(ilike(tasks.title,like),ilike(tasks.description,like)))).limit(8),
      db.select().from(notes).where(and(eq(notes.userId,userId),or(ilike(notes.title,like),ilike(notes.content,like)))).limit(8),
      db.select().from(goals).where(and(eq(goals.userId,userId),or(ilike(goals.title,like),ilike(goals.description,like)))).limit(8),
      db.select().from(projects).where(and(eq(projects.userId,userId),or(ilike(projects.title,like),ilike(projects.nextAction,like),ilike(projects.notes,like)))).limit(8),
      db.select().from(lifeMemories).where(and(eq(lifeMemories.userId,userId),or(ilike(lifeMemories.title,like),ilike(lifeMemories.summary,like)))).limit(8),
      db.select().from(beautyProducts).where(and(eq(beautyProducts.userId,userId),or(ilike(beautyProducts.name,like),ilike(beautyProducts.category,like),ilike(beautyProducts.ingredients,like)))).limit(8),
      db.select().from(importantLinks).where(and(eq(importantLinks.userId,userId),or(ilike(importantLinks.title,like),ilike(importantLinks.category,like)))).limit(8),
      db.select().from(calendarEvents).where(and(eq(calendarEvents.userId,userId),or(ilike(calendarEvents.title,like),ilike(calendarEvents.description,like),ilike(calendarEvents.location,like)))).limit(8),
      db.select().from(habits).where(and(eq(habits.userId,userId),or(ilike(habits.name,like),ilike(habits.description,like)))).limit(8),
      db.select().from(financeEntries).where(and(eq(financeEntries.userId,userId),or(ilike(financeEntries.title,like),ilike(financeEntries.notes,like)))).limit(8),
      db.select().from(planningPeriods).where(and(eq(planningPeriods.userId,userId),or(ilike(planningPeriods.title,like),ilike(planningPeriods.focus,like),ilike(planningPeriods.reflection,like)))).limit(8),
      db.select().from(hairLogs).where(and(eq(hairLogs.userId,userId),or(ilike(hairLogs.eventType,like),ilike(hairLogs.style,like),ilike(hairLogs.products,like),ilike(hairLogs.notes,like)))).limit(8),
      db.select().from(fitnessSessions).where(and(eq(fitnessSessions.userId,userId),or(ilike(fitnessSessions.workoutType,like),ilike(fitnessSessions.equipment,like),ilike(fitnessSessions.notes,like)))).limit(8),
      db.select().from(closetItems).where(and(eq(closetItems.userId,userId),or(ilike(closetItems.name,like),ilike(closetItems.category,like),ilike(closetItems.season,like)))).limit(8),
      db.select().from(financeGoals).where(and(eq(financeGoals.userId,userId),or(ilike(financeGoals.name,like),ilike(financeGoals.notes,like)))).limit(8),
      db.select().from(lifeTimelineEvents).where(and(eq(lifeTimelineEvents.userId,userId),or(ilike(lifeTimelineEvents.title,like),ilike(lifeTimelineEvents.summary,like),ilike(lifeTimelineEvents.category,like)))).limit(8),
      db.select().from(intelligentObservations).where(and(eq(intelligentObservations.userId,userId),or(ilike(intelligentObservations.title,like),ilike(intelligentObservations.evidence,like),ilike(intelligentObservations.category,like)))).limit(8),
      db.select().from(routines).where(and(eq(routines.userId,userId),or(ilike(routines.name,like),ilike(routines.description,like)))).limit(8),
      db.select().from(routineSteps).where(and(eq(routineSteps.userId,userId),or(ilike(routineSteps.title,like),ilike(routineSteps.notes,like)))).limit(8),
      db.select().from(appointments).where(and(eq(appointments.userId,userId),or(ilike(appointments.title,like),ilike(appointments.provider,like),ilike(appointments.location,like),ilike(appointments.notes,like)))).limit(8),
      db.select().from(beautyRoutines).where(and(eq(beautyRoutines.userId,userId),or(ilike(beautyRoutines.name,like),ilike(beautyRoutines.notes,like)))).limit(8),
      db.select().from(medications).where(and(eq(medications.userId,userId),or(ilike(medications.name,like),ilike(medications.dosage,like),ilike(medications.instructions,like),ilike(medications.prescriber,like),ilike(medications.notes,like)))).limit(8),
      db.select().from(supplements).where(and(eq(supplements.userId,userId),or(ilike(supplements.name,like),ilike(supplements.dosage,like),ilike(supplements.instructions,like),ilike(supplements.notes,like)))).limit(8),
    ]);
    results=[
      ...taskRows.map(x=>({id:x.id,type:'Task',title:x.title,subtitle:x.description,href:'/tasks'})),
      ...calendarRows.map(x=>({id:x.id,type:'Calendar',title:x.title,subtitle:x.location??x.description,href:'/calendar'})),
      ...appointmentRows.map(x=>({id:x.id,type:'Appointment',title:x.title,subtitle:x.provider??x.location??x.notes,href:'/appointments'})),
      ...habitRows.map(x=>({id:x.id,type:'Habit',title:x.name,subtitle:x.description,href:'/habits'})),
      ...routineRows.map(x=>({id:x.id,type:'Routine',title:x.name,subtitle:x.description,href:'/routines'})),
      ...routineStepRows.map(x=>({id:x.id,type:'Routine Step',title:x.title,subtitle:x.notes,href:'/routines'})),
      ...noteRows.map(x=>({id:x.id,type:'Note',title:x.title,subtitle:x.content,href:'/notes'})),
      ...goalRows.map(x=>({id:x.id,type:'Goal',title:x.title,subtitle:x.description,href:'/goals'})),
      ...projectRows.map(x=>({id:x.id,type:'Project',title:x.title,subtitle:x.nextAction??x.notes,href:'/projects'})),
      ...memoryRows.map(x=>({id:x.id,type:'Memory',title:x.title,subtitle:x.summary,href:'/memory'})),
      ...timelineRows.map(x=>({id:x.id,type:'Timeline',title:x.title,subtitle:x.summary,href:'/timeline'})),
      ...observationRows.map(x=>({id:x.id,type:'Glow Notice',title:x.title,subtitle:x.evidence,href:'/observations'})),
      ...productRows.map(x=>({id:x.id,type:'Beauty Product',title:x.name,subtitle:x.category,href:'/beauty-lab'})),
      ...beautyRoutineRows.map(x=>({id:x.id,type:'Beauty Routine',title:x.name,subtitle:x.notes,href:'/beauty'})),
      ...hairRows.map(x=>({id:x.id,type:'Hair',title:x.style??x.eventType,subtitle:x.nextAction??x.notes,href:'/hair'})),
      ...fitnessRows.map(x=>({id:x.id,type:'Fitness',title:x.workoutType,subtitle:x.notes,href:'/fitness'})),
      ...closetRows.map(x=>({id:x.id,type:'Closet',title:x.name,subtitle:x.category,href:'/closet'})),
      ...financeRows.map(x=>({id:x.id,type:'Finance',title:x.title,subtitle:x.notes??x.category,href:'/finance'})),
      ...financeGoalRows.map(x=>({id:x.id,type:'Finance Goal',title:x.name,subtitle:x.notes,href:'/finance/brain'})),
      ...planningRows.map(x=>({id:x.id,type:'Planning',title:x.title,subtitle:x.focus,href:'/planning'})),
      ...medicationRows.map(x=>({id:x.id,type:'Medication',title:x.name,subtitle:x.dosage??x.instructions??x.notes,href:'/wellness'})),
      ...supplementRows.map(x=>({id:x.id,type:'Supplement',title:x.name,subtitle:x.dosage??x.instructions??x.notes,href:'/wellness'})),
      ...linkRows.map(x=>({id:x.id,type:'Link',title:x.title,subtitle:x.category,href:'/resources'})),
    ];
  }

  const filtered=results.filter((result)=>(!selectedWorld||worldForType(result.type)===selectedWorld)&&(selectedScope==='all'||scopeForType(result.type)===selectedScope));
  const worlds:[WorldFilter,string,string][]=[['Today',"What's happening now?",'/today'],['Plan','Turn intentions into action.','/planning'],['Life','People, places, wellbeing.','/life'],['Brain','Ideas, knowledge, insights.','/brain'],['Create','Make, design, express.','/inbox']];
  const suggestions=['skincare','this week','workout','planning','home','beauty'];

  return <AppShell><main className={styles.world} aria-label="Universal Search">
    <div className={styles.ambientBlob} aria-hidden="true"/><div className={styles.ambientPearls} aria-hidden="true"><i/><i/><i/><i/><i/></div>
    <header className={styles.hero}><p className={styles.eyebrow}>UNIVERSAL SEARCH</p><h1>Find what moves you forward.</h1><p>Everything in one place — your work, life, ideas, and beyond.</p></header>
    <p className={styles.mantra}>A MORE<br/>HUMAN<br/>TOMORROW.</p>

    <section className={styles.searchLens}>
      <form action="/search" className={styles.searchForm}>
        <Search size={28} strokeWidth={1.35}/><input name="q" defaultValue={term} autoFocus placeholder="Search anything…" aria-label="Search Glow OS"/>
        {selectedScope!=='all'?<input type="hidden" name="scope" value={selectedScope}/>:null}{selectedWorld?<input type="hidden" name="world" value={selectedWorld}/>:null}
        <button type="submit">Search</button>
      </form>
    </section>

    <nav className={styles.scopeRow} aria-label="Search scopes">
      <Link href={queryHref(term,{world:selectedWorld})} data-active={selectedScope==='all'}><Search size={14}/>Everything</Link>
      <span aria-disabled="true" title="Message indexing is not connected to Universal Search yet"><MessageCircle size={14}/>Messages</span>
      <span aria-disabled="true" title="File indexing is not connected to Universal Search yet"><FileText size={14}/>Files</span>
      <span aria-disabled="true" title="People indexing is not connected to Universal Search yet"><UserRound size={14}/>People</span>
      <Link href={queryHref(term,{scope:'calendar',world:selectedWorld})} data-active={selectedScope==='calendar'}><CalendarDays size={14}/>Calendar</Link>
      <Link href={queryHref(term,{scope:'notes',world:selectedWorld})} data-active={selectedScope==='notes'}><FileText size={14}/>Notes</Link>
      <span aria-disabled="true" title="Live web search remains available through Ask Glow, not this private-data index"><Globe2 size={14}/>Web</span>
    </nav>

    <section className={styles.worldCards} aria-label="Filter search by Glow world">{worlds.map(([world,description,path])=><Link key={world} href={queryHref(term,{scope:selectedScope==='all'?undefined:selectedScope,world:selectedWorld===world?undefined:world})} className={styles.worldCard} data-active={selectedWorld===world}><span className={styles.worldPearl}/><strong>{world}</strong><p>{description}</p><ArrowRight size={15}/></Link>)}</section>

    <section className={styles.suggestions}><div className={styles.suggestionsHead}><h2>Try searching for…</h2>{selectedWorld||selectedScope!=='all'?<Link href={queryHref(term,{})}>Clear filters</Link>:null}</div><div className={styles.suggestionRow}>{suggestions.map((suggestion)=><Link key={suggestion} href={queryHref(suggestion,{scope:selectedScope==='all'?undefined:selectedScope,world:selectedWorld})}><Search size={13}/>{suggestion}</Link>)}</div><p className={styles.hint}>Searches your connected Glow records. Ask Glow remains the broader conversational and web-aware intelligence layer.</p></section>

    {term?<section className={styles.results}><div className={styles.resultHeader}>{filtered.length} result{filtered.length===1?'':'s'} for “{term}”{selectedWorld?` in ${selectedWorld}`:''}</div><div className={styles.resultList}>{filtered.length?filtered.map((result)=><Link key={`${result.type}-${result.id}`} href={result.href} className={styles.result}><span className={styles.resultType}>{result.type}</span><div><strong>{result.title}</strong>{result.subtitle?<p>{result.subtitle}</p>:null}</div><ArrowRight size={15}/></Link>):<div className={styles.empty}>Nothing in the selected Glow space matches yet. Change the lens or ask Glow for a broader interpretation.</div>}</div></section>:null}
    <p className={styles.sameCuriosity}>SAME CURIOSITY. A BRIGHTER YOU.</p>
  </main></AppShell>;
}
