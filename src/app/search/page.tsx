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
import {
  beautyProducts,
  closetItems,
  financeGoals,
  fitnessSessions,
  hairLogs,
  intelligentObservations,
  lifeTimelineEvents,
  planningPeriods,
} from '@/db/schema/completion-v1';
import { Search, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';
type Result = { id:string; type:string; title:string; subtitle?:string|null; href:string };

export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const {q=''}=await searchParams;
  const term=q.trim();
  let results:Result[]=[];

  if(term){
    const like=`%${term}%`;
    const userId=session.user.id;
    const [
      taskRows,
      noteRows,
      goalRows,
      projectRows,
      memoryRows,
      productRows,
      linkRows,
      calendarRows,
      habitRows,
      financeRows,
      planningRows,
      hairRows,
      fitnessRows,
      closetRows,
      financeGoalRows,
      timelineRows,
      observationRows,
      routineRows,
      routineStepRows,
      appointmentRows,
      beautyRoutineRows,
      medicationRows,
      supplementRows,
    ]=await Promise.all([
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

  return <AppShell><div className="mx-auto max-w-5xl space-y-5"><header className="rounded-[22px] border border-[#e5d8d0] bg-[linear-gradient(120deg,#f8ece8,#fffaf6_55%,#eee6d8)] p-6"><div className="flex items-center gap-2 text-[#9f6670]"><Sparkles size={17}/><p className="text-[9px] font-bold uppercase tracking-[.2em]">Universal Search</p></div><h1 className="glow-display mt-2 text-4xl tracking-[-.04em] text-[#382d29]">Find anything in your world.</h1><p className="mt-2 text-[10px] text-[#806d66]">Search tasks, calendar events, appointments, habits, routines, notes, goals, projects, memories, notices, beauty, hair, fitness, closet, finances, planning, medications, supplements and saved resources from one place.</p></header><form action="/search" className="flex gap-2 rounded-[18px] border border-[#e5d8d0] bg-[#fffaf6]/80 p-3 shadow-sm"><Search className="ml-2 mt-2.5 text-[#a58f86]" size={18}/><input name="q" defaultValue={term} autoFocus placeholder="Search a task, appointment, routine, product, project, memory, outfit…" className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none"/><button className="rounded-[10px] bg-[#352925] px-5 py-2 text-xs text-white">Search</button></form>{term?<section className="overflow-hidden rounded-[20px] border border-[#e5d8d0] bg-[#fffaf6]/75"><div className="border-b border-[#eadfd6] px-5 py-4 text-[9px] font-bold uppercase tracking-[.18em] text-[#8b766f]">{results.length} result{results.length===1?'':'s'} for “{term}”</div><div className="divide-y divide-[#eee4dd]">{results.length?results.map(result=><Link key={`${result.type}-${result.id}`} href={result.href} className="grid gap-2 px-5 py-4 transition hover:bg-[#faeeee] md:grid-cols-[100px_1fr_140px]"><span className="text-[8px] font-bold uppercase tracking-[.12em] text-[#aa6873]">{result.type}</span><div><p className="text-sm font-medium text-[#3e322e]">{result.title}</p>{result.subtitle?<p className="mt-1 line-clamp-1 text-[10px] text-[#89756e]">{result.subtitle}</p>:null}</div><span className="text-[10px] text-[#a18b83] md:text-right">Open system →</span></Link>):<div className="p-10 text-center"><p className="text-sm text-[#89756e]">Nothing matched yet.</p><Link href="/brain" className="mt-3 inline-flex rounded-lg border border-[#e4d5cc] px-3 py-2 text-[10px] text-[#8f5f67]">Ask Glow Brain for a broader interpretation →</Link></div>}</div></section>:null}</div></AppShell>;
}
