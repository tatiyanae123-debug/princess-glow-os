import 'server-only';

import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { lifeMemories } from '@/db/schema/intelligence-expansion';
import { lifeTimelineEvents } from '@/db/schema/completion-v1';

async function upsertMemoryTimeline(input:{
  userId:string;
  source:string;
  category:string;
  title:string;
  date:Date;
  summary:string;
  relatedArea:string;
  timelineCategory:string;
}){
  const existing=await db.select().from(lifeMemories).where(and(
    eq(lifeMemories.userId,input.userId),
    eq(lifeMemories.source,input.source),
    eq(lifeMemories.sourceDate,input.date),
  )).limit(1);

  const memory=existing[0]
    ? (await db.update(lifeMemories).set({
        title:input.title,
        category:input.category,
        summary:input.summary,
        relatedArea:input.relatedArea,
        confidence:1,
        privacyLevel:'private',
        archived:false,
      }).where(and(eq(lifeMemories.id,existing[0].id),eq(lifeMemories.userId,input.userId))).returning())[0]
    : (await db.insert(lifeMemories).values({
        userId:input.userId,
        category:input.category,
        source:input.source,
        title:input.title,
        summary:input.summary,
        sourceDate:input.date,
        relatedArea:input.relatedArea,
        confidence:1,
        privacyLevel:'private',
      }).returning())[0];

  if(!memory)return null;

  const timeline=await db.select().from(lifeTimelineEvents).where(and(
    eq(lifeTimelineEvents.userId,input.userId),
    eq(lifeTimelineEvents.relatedEntityType,'life_memory'),
    eq(lifeTimelineEvents.relatedEntityId,memory.id),
  )).limit(1);

  if(timeline[0]){
    await db.update(lifeTimelineEvents).set({
      category:input.timelineCategory,
      title:input.title,
      occurredAt:input.date,
      summary:input.summary,
    }).where(and(eq(lifeTimelineEvents.id,timeline[0].id),eq(lifeTimelineEvents.userId,input.userId)));
  }else{
    await db.insert(lifeTimelineEvents).values({
      userId:input.userId,
      category:input.timelineCategory,
      title:input.title,
      occurredAt:input.date,
      summary:input.summary,
      relatedEntityType:'life_memory',
      relatedEntityId:memory.id,
    });
  }

  return memory;
}

export async function captureDayMemory(userId:string,input:{
  dateKey:string;
  memoryNote?:string|null;
  completedSummary?:string|null;
  movedSummary?:string|null;
  mood?:string|null;
  energy?:number|null;
  tomorrowTopThree?:string[]|null;
}){
  const lines=[
    input.memoryNote?.trim()||null,
    input.completedSummary?.trim()?`Completed: ${input.completedSummary.trim()}`:null,
    input.movedSummary?.trim()?`Moved forward: ${input.movedSummary.trim()}`:null,
    input.mood?.trim()?`Mood: ${input.mood.trim()}`:null,
    input.energy?`Energy: ${input.energy}/10`:null,
    input.tomorrowTopThree?.length?`Tomorrow: ${input.tomorrowTopThree.join(' · ')}`:null,
  ].filter((line):line is string=>Boolean(line));
  if(!lines.length)return null;

  const date=new Date(`${input.dateKey}T12:00:00`);
  const title=`Daily review · ${date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
  return upsertMemoryTimeline({
    userId,
    source:'finish_my_day',
    category:'daily_reflection',
    title,
    date,
    summary:lines.join('\n'),
    relatedArea:'Today',
    timelineCategory:'memory',
  });
}

export async function captureTomorrowBrief(userId:string,input:{
  dateKey:string;
  summary:string;
  topThree:string[];
  events:{title:string;time:string;location:string|null}[];
  work:{title:string;time:string}[];
  routines:string[];
  wakeTarget:string;
  prepTonight:string[];
}){
  const date=new Date(`${input.dateKey}T12:00:00`);
  const lines=[
    input.summary,
    input.topThree.length?`Top three: ${input.topThree.join(' · ')}`:null,
    input.events.length?`Calendar: ${input.events.map(event=>`${event.title} (${event.time})`).join(' · ')}`:null,
    input.work.length?`Work: ${input.work.map(block=>`${block.title} (${block.time})`).join(' · ')}`:null,
    input.routines.length?`Routines: ${input.routines.join(' · ')}`:null,
    `Wake target: ${input.wakeTarget}`,
    input.prepTonight.length?`Prep tonight: ${input.prepTonight.join(' · ')}`:null,
  ].filter((line):line is string=>Boolean(line));
  const title=`Tomorrow plan · ${date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;
  return upsertMemoryTimeline({
    userId,
    source:'prepare_tomorrow',
    category:'tomorrow_plan',
    title,
    date,
    summary:lines.join('\n'),
    relatedArea:'Planning',
    timelineCategory:'planning',
  });
}
