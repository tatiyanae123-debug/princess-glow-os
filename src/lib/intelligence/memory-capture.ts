import 'server-only';

import { db } from '@/db';
import { lifeMemories } from '@/db/schema/intelligence-expansion';
import { lifeTimelineEvents } from '@/db/schema/completion-v1';

export async function captureDayMemory(userId:string,input:{dateKey:string;memoryNote?:string|null;completedSummary?:string|null;mood?:string|null;energy?:number|null}){const text=input.memoryNote?.trim();if(!text)return null;const date=new Date(`${input.dateKey}T12:00:00`);const title=`Daily memory · ${date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;const [memory]=await db.insert(lifeMemories).values({userId,category:'daily_reflection',source:'finish_my_day',title,summary:text,sourceDate:date,relatedArea:'Today',confidence:1,privacyLevel:'private'}).returning();await db.insert(lifeTimelineEvents).values({userId,category:'memory',title,occurredAt:date,summary:[text,input.completedSummary?`Completed: ${input.completedSummary}`:null,input.mood?`Mood: ${input.mood}`:null,input.energy?`Energy: ${input.energy}/10`:null].filter(Boolean).join('\n'),relatedEntityType:'life_memory',relatedEntityId:memory.id});return memory;}
