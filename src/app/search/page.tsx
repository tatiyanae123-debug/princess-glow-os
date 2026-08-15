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
import { ArrowRight, Command, Search, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
type Result = { id: string; type: string; title: string; subtitle?: string | null; href: string; external?: boolean };
const SUGGESTED = ['What needs my attention this week?','Show my upcoming appointments','Find my recent Terrain Design notes','What have I been putting off lately?'];

function exactHref(type:string,id:string,extra?:string|null){
  switch(type){
    case 'Task':return `/tasks?taskId=${encodeURIComponent(id)}&view=all`;
    case 'Calendar':return `/calendar?eventId=${encodeURIComponent(id)}&view=day`;
    case 'Appointment':return `/home?appointmentId=${encodeURIComponent(id)}`;
    case 'Habit':return `/habits?habitId=${encodeURIComponent(id)}`;
    case 'Routine':return `/routines?routineId=${encodeURIComponent(id)}`;
    case 'Routine Step':return extra?`/routines?routineId=${encodeURIComponent(extra)}`:'/routines';
    case 'Note':return `/notes?noteId=${encodeURIComponent(id)}`;
    case 'Goal':return `/goals?goalId=${encodeURIComponent(id)}`;
    case 'Project':return `/projects?projectId=${encodeURIComponent(id)}#all-projects`;
    case 'Memory':return `/memory?memoryId=${encodeURIComponent(id)}`;
    case 'Timeline':return `/timeline?eventId=${encodeURIComponent(id)}`;
    case 'Glow Notice':return `/observations?observationId=${encodeURIComponent(id)}`;
    case 'Beauty Product':return `/beauty/lab?productId=${encodeURIComponent(id)}`;
    case 'Beauty Routine':return `/beauty?routineId=${encodeURIComponent(id)}`;
    case 'Hair':return `/hair?logId=${encodeURIComponent(id)}`;
    case 'Fitness':return `/fitness?sessionId=${encodeURIComponent(id)}`;
    case 'Closet':return `/closet?itemId=${encodeURIComponent(id)}`;
    case 'Finance':return `/finance?entryId=${encodeURIComponent(id)}`;
    case 'Finance Goal':return `/finance/brain?goalId=${encodeURIComponent(id)}`;
    case 'Planning':return `/planning?periodId=${encodeURIComponent(id)}`;
    case 'Medication':return `/wellness?medicationId=${encodeURIComponent(id)}#medications-supplements`;
    case 'Supplement':return `/wellness?supplementId=${encodeURIComponent(id)}#medications-supplements`;
    default:return '/dashboard';
  }
}

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const {q=''}=await searchParams;const term=q.trim();let results:Result[]=[];
  if(term){
    const like=`%${term}%`,userId=session.user.id;
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
      ...taskRows.map(x=>({id:x.id,type:'Task',title:x.title,subtitle:x.description,href:exactHref('Task',x.id)})),
      ...calendarRows.map(x=>({id:x.id,type:'Calendar',title:x.title,subtitle:x.location??x.description,href:exactHref('Calendar',x.id)})),
      ...appointmentRows.map(x=>({id:x.id,type:'Appointment',title:x.title,subtitle:x.provider??x.location??x.notes,href:exactHref('Appointment',x.id)})),
      ...habitRows.map(x=>({id:x.id,type:'Habit',title:x.name,subtitle:x.description,href:exactHref('Habit',x.id)})),
      ...routineRows.map(x=>({id:x.id,type:'Routine',title:x.name,subtitle:x.description,href:exactHref('Routine',x.id)})),
      ...routineStepRows.map(x=>({id:x.id,type:'Routine Step',title:x.title,subtitle:x.notes,href:exactHref('Routine Step',x.id,x.routineId)})),
      ...noteRows.map(x=>({id:x.id,type:'Note',title:x.title,subtitle:x.content,href:exactHref('Note',x.id)})),
      ...goalRows.map(x=>({id:x.id,type:'Goal',title:x.title,subtitle:x.description,href:exactHref('Goal',x.id)})),
      ...projectRows.map(x=>({id:x.id,type:'Project',title:x.title,subtitle:x.nextAction??x.notes,href:exactHref('Project',x.id)})),
      ...memoryRows.map(x=>({id:x.id,type:'Memory',title:x.title,subtitle:x.summary,href:exactHref('Memory',x.id)})),
      ...timelineRows.map(x=>({id:x.id,type:'Timeline',title:x.title,subtitle:x.summary,href:exactHref('Timeline',x.id)})),
      ...observationRows.map(x=>({id:x.id,type:'Glow Notice',title:x.title,subtitle:x.evidence,href:exactHref('Glow Notice',x.id)})),
      ...productRows.map(x=>({id:x.id,type:'Beauty Product',title:x.name,subtitle:x.category,href:exactHref('Beauty Product',x.id)})),
      ...beautyRoutineRows.map(x=>({id:x.id,type:'Beauty Routine',title:x.name,subtitle:x.notes,href:exactHref('Beauty Routine',x.id)})),
      ...hairRows.map(x=>({id:x.id,type:'Hair',title:x.style??x.eventType,subtitle:x.nextAction??x.notes,href:exactHref('Hair',x.id)})),
      ...fitnessRows.map(x=>({id:x.id,type:'Fitness',title:x.workoutType,subtitle:x.notes,href:exactHref('Fitness',x.id)})),
      ...closetRows.map(x=>({id:x.id,type:'Closet',title:x.name,subtitle:x.category,href:exactHref('Closet',x.id)})),
      ...financeRows.map(x=>({id:x.id,type:'Finance',title:x.title,subtitle:x.notes??x.category,href:exactHref('Finance',x.id)})),
      ...financeGoalRows.map(x=>({id:x.id,type:'Finance Goal',title:x.name,subtitle:x.notes,href:exactHref('Finance Goal',x.id)})),
      ...planningRows.map(x=>({id:x.id,type:'Planning',title:x.title,subtitle:x.focus,href:exactHref('Planning',x.id)})),
      ...medicationRows.map(x=>({id:x.id,type:'Medication',title:x.name,subtitle:x.dosage??x.instructions??x.notes,href:exactHref('Medication',x.id)})),
      ...supplementRows.map(x=>({id:x.id,type:'Supplement',title:x.name,subtitle:x.dosage??x.instructions??x.notes,href:exactHref('Supplement',x.id)})),
      ...linkRows.map(x=>({id:x.id,type:'Link',title:x.title,subtitle:x.category,href:x.url,external:true})),
    ];
  }
  return <AppShell><div className="mx-auto w-full max-w-[1180px] pb-12 pt-2">
    <section className="relative overflow-hidden rounded-[28px] border border-[#EEE7E4] bg-white px-6 py-9 shadow-[0_18px_60px_rgba(63,45,38,.055)] sm:px-9 lg:px-12 lg:py-12"><div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#FAE6E7]/70 blur-3xl"/><div aria-hidden="true" className="pointer-events-none absolute bottom-[-120px] left-[18%] h-64 w-64 rounded-full bg-[#F7EEED] blur-3xl"/><div className="relative max-w-[760px]"><div className="flex items-center gap-2 text-[#BD6075]"><Sparkles size={16}/><p className="text-[10px] font-semibold uppercase tracking-[.18em]">Glow Search</p></div><h1 className="glow-display mt-3 text-[42px] leading-[.98] tracking-[-.025em] text-[#292421] sm:text-[54px]">Ask your life anything.</h1><p className="mt-4 max-w-[660px] text-[13px] leading-6 text-[#817771]">Search the same Glow OS you are already in. Every supported result opens the exact saved record instead of dropping you into a generic room.</p></div><form action="/search" className="relative mt-7 flex min-h-[54px] items-center gap-2 rounded-full border border-[#E9E1DE] bg-white/95 p-1.5 pl-4 shadow-[0_10px_32px_rgba(56,38,31,.06)] backdrop-blur-xl"><Search className="shrink-0 text-[#948A84]" size={18}/><input name="q" defaultValue={term} autoFocus placeholder="Search tasks, events, notes, memories, projects, products…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[13px] text-[#292421] outline-none placeholder:text-[#AAA09A]"/><div className="hidden items-center gap-1 rounded-full bg-[#F7EEED] px-2.5 py-1.5 text-[10px] text-[#8D827C] sm:flex"><Command size={11}/>K</div><button type="submit" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#C65F76] px-5 text-[12px] font-medium text-white">Search<ArrowRight size={13}/></button></form></section>
    {!term?<section className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]"><div className="rounded-[22px] border border-[#EEE7E4] bg-white p-5"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#8C837D]">Suggested questions</p><div className="mt-3 divide-y divide-[#F1EBE8]">{SUGGESTED.map(item=><Link key={item} href={`/search?q=${encodeURIComponent(item)}`} className="flex items-center justify-between gap-4 py-3 text-[12.5px] text-[#38322E]"><span>{item}</span><ArrowRight size={13}/></Link>)}</div></div><div className="rounded-[22px] border border-[#F0E4E3] bg-[#F7EEED]/55 p-5"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#B55D70]">Ask Glow</p><p className="glow-display mt-3 text-[24px] leading-[1.15] text-[#302925]">Exact matches when you know what you want. Connected intelligence when you do not.</p><Link href="/brain" className="mt-5 inline-flex items-center gap-2 text-[11.5px] font-medium text-[#B9586E]">Open Brain <ArrowRight size={13}/></Link></div></section>:<section className="mt-5 overflow-hidden rounded-[22px] border border-[#EEE7E4] bg-white"><div className="flex items-center justify-between gap-3 border-b border-[#F1EBE8] px-5 py-4"><p className="text-[10.5px] font-semibold uppercase tracking-[.12em] text-[#817771]">{results.length} result{results.length===1?'':'s'} for &ldquo;{term}&rdquo;</p><Link href="/search" className="text-[11px] font-medium text-[#BF6074]">Clear</Link></div><div className="divide-y divide-[#F1EBE8]">{results.length?results.map(result=><Link key={`${result.type}-${result.id}`} href={result.href} target={result.external?'_blank':undefined} rel={result.external?'noreferrer':undefined} className="grid gap-2 px-5 py-4 transition hover:bg-[#F7EEED]/45 md:grid-cols-[120px_minmax(0,1fr)_110px]"><span className="text-[9.5px] font-semibold uppercase tracking-[.12em] text-[#C36A7C]">{result.type}</span><div className="min-w-0"><p className="truncate text-[12.5px] font-medium text-[#342E2A]">{result.title}</p>{result.subtitle?<p className="mt-1 line-clamp-2 text-[10.5px] leading-5 text-[#918781]">{result.subtitle}</p>:null}</div><span className="flex items-center justify-end gap-1 text-[10.5px] font-medium text-[#B95B70]">{result.external?'Open saved link':'Open exact record'} <ArrowRight size={12}/></span></Link>):<div className="px-5 py-12 text-center"><p className="glow-display text-[23px] text-[#3B342F]">Nothing matched that search yet.</p><p className="mx-auto mt-2 max-w-[520px] text-[11px] leading-5 text-[#8B817B]">Try a different phrase, or ask Brain to interpret the question across your connected Glow rooms.</p><Link href={`/brain?q=${encodeURIComponent(term)}`} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#C45F76] px-4 py-2.5 text-[11px] font-medium text-white">Ask Brain <ArrowRight size={12}/></Link></div>}</div></section>}
  </div></AppShell>;
}
