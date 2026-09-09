import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, desc, eq, ilike, or } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { tasks } from '@/db/schema/tasks';
import { notes } from '@/db/schema/notes';
import { goals } from '@/db/schema/goals';
import { calendarEvents } from '@/db/schema/calendar-events';
import { habits } from '@/db/schema/habits';
import { routines } from '@/db/schema/routines';
import { projects, lifeMemories } from '@/db/schema/intelligence-expansion';
import { beautyProducts, closetItems, lifeTimelineEvents } from '@/db/schema/completion-v1';
import { getGoogleContacts } from '@/lib/google/contacts-client';
import { ArrowRight, CalendarDays, FileImage, FileText, Folder, Globe2, Image as ImageIcon, Mic, NotebookText, Search, Sparkles, UserRound, X } from 'lucide-react';
import styles from './search-reference.module.css';

export const dynamic='force-dynamic';
type World='Today'|'Plan'|'Life'|'Beauty'|'Brain'|'Create';
type Scope='all'|'calendar'|'notes'|'people'|'images'|'routines';
type Result={id:string;group:string;world:World;scope:Scope;title:string;subtitle?:string|null;href:string;imageUrl?:string|null;icon?:'calendar'|'note'|'project'|'person'|'image'|'routine'|'life'};

function queryHref(q:string,extra:{scope?:string;world?:string}){const p=new URLSearchParams();if(q)p.set('q',q);if(extra.scope)p.set('scope',extra.scope);if(extra.world)p.set('world',extra.world);return `/search${p.toString()?`?${p}`:''}`}
function stringValue(value:string|null|undefined){return value?.trim()||null}
function icon(result:Result){if(result.icon==='calendar')return <CalendarDays size={16}/>;if(result.icon==='person')return <UserRound size={16}/>;if(result.icon==='image')return <FileImage size={16}/>;if(result.icon==='routine')return <Sparkles size={16}/>;if(result.icon==='project')return <Folder size={16}/>;return <FileText size={16}/>}
const groupInfo:Record<string,{description:string}>={Today:{description:'What is happening now or is tied to time.'},Projects:{description:'Projects and goals related to your search.'},Notes:{description:'Notes and thinking that match.'},People:{description:'Real connected contacts that match.'},Memories:{description:'Moments and timeline records from your life.'},Images:{description:'Visual records already stored in Glow.'},Routines:{description:'Routines and habits that match.'},Life:{description:'Beauty, closet, and lived-system records.'}};

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string;scope?:string;world?:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const params=await searchParams;
  const term=(params.q??'').trim();
  const selectedScope=(['calendar','notes','people','images','routines'].includes(params.scope??'')?params.scope:'all') as Scope;
  const selectedWorld=(['Today','Plan','Life','Beauty','Brain','Create'].includes(params.world??'')?params.world:undefined) as World|undefined;
  const userId=session.user.id;

  const [recentTasks,recentProjects,recentNotes]=await Promise.all([
    db.select({title:tasks.title}).from(tasks).where(and(eq(tasks.userId,userId),eq(tasks.archived,false))).orderBy(desc(tasks.updatedAt)).limit(2),
    db.select({title:projects.title}).from(projects).where(eq(projects.userId,userId)).orderBy(desc(projects.updatedAt)).limit(2),
    db.select({title:notes.title}).from(notes).where(eq(notes.userId,userId)).orderBy(desc(notes.updatedAt)).limit(2),
  ]);
  const liveSuggestions=[...recentTasks,...recentProjects,...recentNotes].map(x=>x.title).filter(Boolean).slice(0,6);
  const suggestions=liveSuggestions.length?liveSuggestions:['this week','planning','beauty','home'];

  let results:Result[]=[];
  if(term){
    const like=`%${term}%`;
    const [taskRows,calendarRows,projectRows,goalRows,noteRows,memoryRows,timelineRows,routineRows,habitRows,productRows,closetRows]=await Promise.all([
      db.select().from(tasks).where(and(eq(tasks.userId,userId),or(ilike(tasks.title,like),ilike(tasks.description,like)))).limit(12),
      db.select().from(calendarEvents).where(and(eq(calendarEvents.userId,userId),or(ilike(calendarEvents.title,like),ilike(calendarEvents.description,like),ilike(calendarEvents.location,like)))).limit(12),
      db.select().from(projects).where(and(eq(projects.userId,userId),or(ilike(projects.title,like),ilike(projects.nextAction,like),ilike(projects.notes,like)))).limit(12),
      db.select().from(goals).where(and(eq(goals.userId,userId),or(ilike(goals.title,like),ilike(goals.description,like)))).limit(12),
      db.select().from(notes).where(and(eq(notes.userId,userId),or(ilike(notes.title,like),ilike(notes.content,like)))).limit(12),
      db.select().from(lifeMemories).where(and(eq(lifeMemories.userId,userId),or(ilike(lifeMemories.title,like),ilike(lifeMemories.summary,like)))).limit(12),
      db.select().from(lifeTimelineEvents).where(and(eq(lifeTimelineEvents.userId,userId),or(ilike(lifeTimelineEvents.title,like),ilike(lifeTimelineEvents.summary,like),ilike(lifeTimelineEvents.category,like)))).limit(12),
      db.select().from(routines).where(and(eq(routines.userId,userId),or(ilike(routines.name,like),ilike(routines.description,like)))).limit(12),
      db.select().from(habits).where(and(eq(habits.userId,userId),or(ilike(habits.name,like),ilike(habits.description,like)))).limit(12),
      db.select().from(beautyProducts).where(and(eq(beautyProducts.userId,userId),or(ilike(beautyProducts.name,like),ilike(beautyProducts.category,like),ilike(beautyProducts.ingredients,like)))).limit(12),
      db.select().from(closetItems).where(and(eq(closetItems.userId,userId),or(ilike(closetItems.name,like),ilike(closetItems.category,like),ilike(closetItems.season,like)))).limit(12),
    ]);
    const contactsResult=await getGoogleContacts(userId);
    const contactRows=contactsResult.ok?contactsResult.contacts.filter(c=>`${c.name} ${c.email??''} ${c.organization??''}`.toLowerCase().includes(term.toLowerCase())).slice(0,12):[];
    results=[
      ...taskRows.map(x=>({id:x.id,group:'Today',world:'Today' as const,scope:'all' as const,title:x.title,subtitle:x.description,href:'/tasks',icon:'calendar' as const})),
      ...calendarRows.map(x=>({id:x.id,group:'Today',world:'Today' as const,scope:'calendar' as const,title:x.title,subtitle:x.location??x.description,href:'/calendar',icon:'calendar' as const})),
      ...projectRows.map(x=>({id:x.id,group:'Projects',world:'Plan' as const,scope:'all' as const,title:x.title,subtitle:x.nextAction??x.notes,href:'/projects',icon:'project' as const})),
      ...goalRows.map(x=>({id:x.id,group:'Projects',world:'Plan' as const,scope:'all' as const,title:x.title,subtitle:x.description,href:'/goals',icon:'project' as const})),
      ...noteRows.map(x=>({id:x.id,group:'Notes',world:'Brain' as const,scope:'notes' as const,title:x.title,subtitle:x.content,href:'/notes',icon:'note' as const})),
      ...contactRows.map(x=>({id:x.id,group:'People',world:'Life' as const,scope:'people' as const,title:x.name,subtitle:x.organization??x.email,href:'/today?room=people',imageUrl:x.photoUrl,icon:'person' as const})),
      ...memoryRows.map(x=>({id:x.id,group:'Memories',world:'Brain' as const,scope:'all' as const,title:x.title,subtitle:x.summary,href:'/memory',icon:'life' as const})),
      ...timelineRows.map(x=>({id:x.id,group:'Memories',world:'Brain' as const,scope:'all' as const,title:x.title,subtitle:x.summary??x.category,href:'/timeline',imageUrl:x.imageUrl,icon:'life' as const})),
      ...timelineRows.filter(x=>x.imageUrl).map(x=>({id:`timeline-${x.id}`,group:'Images',world:'Brain' as const,scope:'images' as const,title:x.title,subtitle:x.category,href:'/timeline',imageUrl:x.imageUrl,icon:'image' as const})),
      ...routineRows.map(x=>({id:x.id,group:'Routines',world:'Plan' as const,scope:'routines' as const,title:x.name,subtitle:x.description,href:'/routines',icon:'routine' as const})),
      ...habitRows.map(x=>({id:x.id,group:'Routines',world:'Plan' as const,scope:'routines' as const,title:x.name,subtitle:x.description,href:'/habits',icon:'routine' as const})),
      ...productRows.map(x=>({id:x.id,group:'Life',world:'Beauty' as const,scope:'all' as const,title:x.name,subtitle:x.category,href:'/beauty/inventory',imageUrl:x.photoUrl,icon:'life' as const})),
      ...productRows.filter(x=>x.photoUrl).map(x=>({id:`beauty-${x.id}`,group:'Images',world:'Beauty' as const,scope:'images' as const,title:x.name,subtitle:x.category,href:'/beauty/inventory',imageUrl:x.photoUrl,icon:'image' as const})),
      ...closetRows.map(x=>({id:x.id,group:'Life',world:'Life' as const,scope:'all' as const,title:x.name,subtitle:x.category,href:'/closet',imageUrl:x.imageUrl,icon:'life' as const})),
      ...closetRows.filter(x=>x.imageUrl).map(x=>({id:`closet-${x.id}`,group:'Images',world:'Life' as const,scope:'images' as const,title:x.name,subtitle:x.category,href:'/closet',imageUrl:x.imageUrl,icon:'image' as const})),
    ];
  }
  const filtered=results.filter(r=>(!selectedWorld||r.world===selectedWorld)&&(selectedScope==='all'||r.scope===selectedScope));
  const groups=Object.keys(groupInfo).map(name=>({name,items:filtered.filter(r=>r.group===name)})).filter(group=>group.items.length);
  const worlds:[World,string,string][]=[['Today',"What's happening now?",'/today?room=what-now'],['Plan','Turn intentions into action.','/planning'],['Life','People, places, wellbeing.','/life'],['Beauty','Care, appearance, preparation.','/beauty'],['Brain','Ideas, knowledge, insights.','/brain'],['Create','Make, design, express.','/create']];
  const scopeLinks:[Scope,string,React.ReactNode][]=[['all','Best match',<Sparkles size={13} key="all"/>],['calendar','Today',<CalendarDays size={13} key="cal"/>],['notes','Notes',<NotebookText size={13} key="notes"/>],['people','People',<UserRound size={13} key="people"/>],['images','Images',<ImageIcon size={13} key="images"/>],['routines','Routines',<Sparkles size={13} key="routines"/>]];

  if(term)return <AppShell><main className={`${styles.world} ${styles.resultsWorld}`} aria-label="Universal Search results"><div className={styles.ambientBlob} aria-hidden="true"/><div className={styles.ambientPearls} aria-hidden="true"><i/><i/><i/><i/><i/></div><section className={styles.resultsTop}><form action="/search" className={styles.queryBar}><Search size={27}/><input name="q" defaultValue={term} aria-label="Search Glow OS"/>{selectedScope!=='all'?<input type="hidden" name="scope" value={selectedScope}/>:null}{selectedWorld?<input type="hidden" name="world" value={selectedWorld}/>:null}<Link href="/search" className={styles.iconButton} aria-label="Clear search"><X size={18}/></Link><button className={styles.submit} aria-label="Search"><ArrowRight size={17}/></button></form><div className={styles.resultFilters}>{scopeLinks.map(([scope,label,iconNode])=><Link key={scope} href={queryHref(term,{scope:scope==='all'?undefined:scope,world:selectedWorld})} data-active={selectedScope===scope}>{iconNode}{label}</Link>)}<span className={styles.resultCount}>{filtered.length} result{filtered.length===1?'':'s'}</span></div><div className={styles.resultRibbon}><p>“Here’s what I found<br/>across your worlds.”</p></div></section><section className={styles.shelves}>{groups.length?groups.map((group,index)=><article key={group.name} className={styles.shelf}><div className={styles.shelfLead}><span className={`${styles.groupPearl} ${styles[`group${index%7}`]}`}/><div><h2>{group.name}</h2><p>{groupInfo[group.name].description}</p></div></div><div className={styles.cards}>{group.items.slice(0,3).map(item=><Link key={`${item.group}-${item.id}`} href={item.href} className={styles.resultCard}><span className={styles.resultThumb}>{item.imageUrl?/* eslint-disable-next-line @next/next/no-img-element */<img src={item.imageUrl} alt=""/>:icon(item)}</span><div style={{minWidth:0}}><strong>{item.title}</strong>{stringValue(item.subtitle)?<p>{item.subtitle}</p>:null}</div></Link>)}</div><Link href={queryHref(term,{scope:selectedScope==='all'?undefined:selectedScope,world:selectedWorld})} className={styles.viewAll}>{group.items.length} result{group.items.length===1?'':'s'} →</Link></article>):<div className={styles.suggestions}><p className={styles.hint}>Nothing in the selected Glow lens matches yet. Change the scope or ask Glow for a broader interpretation.</p><Link href="/ask-glow" className={styles.suggestionRow}>Ask Glow →</Link></div>}</section><p className={styles.sameCuriosity}>SAME CURIOSITY. A BRIGHTER YOU.</p></main></AppShell>;

  return <AppShell><main className={styles.world} aria-label="Universal Search"><div className={styles.ambientBlob} aria-hidden="true"/><div className={styles.ambientPearls} aria-hidden="true"><i/><i/><i/><i/><i/></div><header className={styles.hero}><p className={styles.eyebrow}>UNIVERSAL SEARCH</p><h1>Find what moves you forward.</h1><p>Everything in one place — your work, life, ideas, and beyond.</p></header><p className={styles.mantra}>A MORE<br/>HUMAN<br/>TOMORROW.</p><section className={styles.searchLens}><form action="/search" className={styles.searchForm}><Search size={29} strokeWidth={1.35}/><input name="q" autoFocus placeholder="Search anything…" aria-label="Search Glow OS"/><Link href="/ask-glow" className={styles.iconButton} title="Use voice in Ask Glow" aria-label="Open Ask Glow voice"><Mic size={18}/></Link><Link href="/ask-glow" className={styles.iconButton} title="Attach an image in Ask Glow" aria-label="Open Ask Glow attachments"><ImageIcon size={18}/></Link><button className={styles.submit} aria-label="Search"><ArrowRight size={17}/></button></form></section><nav className={styles.scopeRow} aria-label="Search scopes"><Link href="/search" data-active="true"><Search size={14}/>Everything</Link><span title="Message indexing is not connected to Universal Search yet">Messages</span><span title="File indexing is not connected to Universal Search yet">Files</span><Link href="/search?scope=people"><UserRound size={14}/>People</Link><Link href="/search?scope=calendar"><CalendarDays size={14}/>Calendar</Link><Link href="/search?scope=notes"><FileText size={14}/>Notes</Link><span title="Live web search remains available through Ask Glow"><Globe2 size={14}/>Web</span></nav><section className={styles.worldCards} aria-label="Search by Glow world">{worlds.map(([world,description,path])=><Link key={world} href={queryHref('',{world})} className={styles.worldCard}><span className={styles.worldPearl}/><strong>{world}</strong><p>{description}</p><ArrowRight size={15}/><span className="sr-only">World home: {path}</span></Link>)}</section><section className={styles.suggestions}><div className={styles.suggestionsHead}><h2>Try searching for…</h2><Link href="/search">Browse all</Link></div><div className={styles.suggestionRow}>{suggestions.map(s=><Link key={s} href={queryHref(s,{})}><Search size={13}/>{s}</Link>)}</div><p className={styles.hint}>Searches your private Glow records and connected Contacts where permission exists. Ask Glow remains the broader conversational and web-aware intelligence layer.</p></section><p className={styles.sameCuriosity}>SAME CURIOSITY. A BRIGHTER YOU.</p></main></AppShell>;
}
