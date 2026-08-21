import 'server-only';
import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/db';
import { wellnessCheckIns, wellnessHydrationLogs, wellnessObservations, wellnessProtocolRuns } from '@/db/schema/advanced-wellness';

export type WellnessMode='full'|'standard'|'quick'|'minimum';
export type ProtocolStep={id:string;title:string;seconds:number;detail?:string};

export async function getWellnessIntelligenceState(userId:string){
  const weekAgo=new Date(Date.now()-7*86400000);const monthAgo=new Date(Date.now()-30*86400000);
  const [checkIns,runs,hydration,observations]=await Promise.all([
    db.select().from(wellnessCheckIns).where(and(eq(wellnessCheckIns.userId,userId),gte(wellnessCheckIns.createdAt,monthAgo))).orderBy(desc(wellnessCheckIns.createdAt)).limit(120),
    db.select().from(wellnessProtocolRuns).where(and(eq(wellnessProtocolRuns.userId,userId),gte(wellnessProtocolRuns.startedAt,monthAgo))).orderBy(desc(wellnessProtocolRuns.startedAt)).limit(120),
    db.select().from(wellnessHydrationLogs).where(and(eq(wellnessHydrationLogs.userId,userId),gte(wellnessHydrationLogs.occurredAt,weekAgo))).orderBy(desc(wellnessHydrationLogs.occurredAt)).limit(250),
    db.select().from(wellnessObservations).where(and(eq(wellnessObservations.userId,userId),eq(wellnessObservations.dismissed,false))).orderBy(desc(wellnessObservations.createdAt)).limit(40),
  ]);
  return {checkIns,runs,hydration,observations};
}

export async function saveWellnessCheckIn(userId:string,input:{state:string;need:string;activation?:string|null;energy?:string|null;bodySignals?:string[];notes?:string}){
  const [row]=await db.insert(wellnessCheckIns).values({userId,state:input.state.trim(),need:input.need.trim(),activation:input.activation?.trim()||null,energy:input.energy?.trim()||null,bodySignals:Array.from(new Set(input.bodySignals??[])).slice(0,12),notes:input.notes?.trim()||null}).returning();return row??null;
}
export async function startWellnessProtocol(userId:string,input:{protocolKey:string;title:string;mode:WellnessMode;queue:ProtocolStep[];beforeActivation?:string|null;context?:Record<string,unknown>}){
  const queue=input.queue.filter(s=>s.id&&s.title&&Number.isFinite(s.seconds)).map(s=>({...s,seconds:Math.max(0,Math.min(3600,Math.round(s.seconds)))})).slice(0,30);if(!queue.length)return null;
  const [existing]=await db.select().from(wellnessProtocolRuns).where(and(eq(wellnessProtocolRuns.userId,userId),eq(wellnessProtocolRuns.protocolKey,input.protocolKey),eq(wellnessProtocolRuns.status,'active'))).orderBy(desc(wellnessProtocolRuns.lastActivityAt)).limit(1);if(existing)return existing;
  try{const [run]=await db.insert(wellnessProtocolRuns).values({userId,protocolKey:input.protocolKey,title:input.title,mode:input.mode,queue,beforeActivation:input.beforeActivation?.trim()||null,context:input.context??{}}).returning();return run??null}catch{const [winner]=await db.select().from(wellnessProtocolRuns).where(and(eq(wellnessProtocolRuns.userId,userId),eq(wellnessProtocolRuns.protocolKey,input.protocolKey),eq(wellnessProtocolRuns.status,'active'))).orderBy(desc(wellnessProtocolRuns.lastActivityAt)).limit(1);return winner??null}
}
export async function recordWellnessProtocolStep(userId:string,input:{runId:string;stepId:string;status:'completed'|'skipped';actualSeconds:number}){
  const [run]=await db.select().from(wellnessProtocolRuns).where(and(eq(wellnessProtocolRuns.id,input.runId),eq(wellnessProtocolRuns.userId,userId),eq(wellnessProtocolRuns.status,'active'))).limit(1);if(!run||!run.queue.some(s=>s.id===input.stepId))return null;
  const completed=input.status==='completed'?Array.from(new Set([...run.completedStepIds,input.stepId])):run.completedStepIds.filter(id=>id!==input.stepId);const skipped=input.status==='skipped'?Array.from(new Set([...run.skippedStepIds,input.stepId])):run.skippedStepIds.filter(id=>id!==input.stepId);const handled=new Set([...completed,...skipped]);const next=run.queue.findIndex(s=>!handled.has(s.id));const seconds=Math.max(0,Math.min(3600,Math.round(input.actualSeconds)));
  const [updated]=await db.update(wellnessProtocolRuns).set({completedStepIds:completed,skippedStepIds:skipped,currentIndex:next<0?run.queue.length:next,actualSeconds:Math.min(86400,run.actualSeconds+seconds),lastActivityAt:new Date()}).where(and(eq(wellnessProtocolRuns.id,run.id),eq(wellnessProtocolRuns.userId,userId))).returning();return updated??null;
}
export async function completeWellnessProtocol(userId:string,runId:string,afterEffect?:string|null){const [run]=await db.select().from(wellnessProtocolRuns).where(and(eq(wellnessProtocolRuns.id,runId),eq(wellnessProtocolRuns.userId,userId))).limit(1);if(!run)return null;if(run.status==='completed')return run;const handled=new Set([...run.completedStepIds,...run.skippedStepIds]);if(run.queue.some(s=>!handled.has(s.id)))return null;const now=new Date();const [updated]=await db.update(wellnessProtocolRuns).set({status:'completed',afterEffect:afterEffect?.trim()||null,currentIndex:run.queue.length,completedAt:now,lastActivityAt:now}).where(and(eq(wellnessProtocolRuns.id,run.id),eq(wellnessProtocolRuns.userId,userId))).returning();return updated??null}
export async function abandonWellnessProtocol(userId:string,runId:string){const [row]=await db.update(wellnessProtocolRuns).set({status:'abandoned',lastActivityAt:new Date()}).where(and(eq(wellnessProtocolRuns.id,runId),eq(wellnessProtocolRuns.userId,userId),eq(wellnessProtocolRuns.status,'active'))).returning();return row??null}
export async function logHydration(userId:string,kind:'water'|'electrolytes',amountMl?:number|null){const amount=amountMl==null?null:Math.max(1,Math.min(3000,Math.round(amountMl)));const [row]=await db.insert(wellnessHydrationLogs).values({userId,kind,amountMl:amount,source:'wellness'}).returning();return row??null}
export async function saveWellnessObservation(userId:string,input:{kind:string;title:string;body:string;evidence?:Record<string,unknown>;confidence?:string}){const [row]=await db.insert(wellnessObservations).values({userId,kind:input.kind.trim(),title:input.title.trim(),body:input.body.trim(),evidence:input.evidence??{},confidence:input.confidence??'user_reported'}).returning();return row??null}
export async function dismissWellnessObservation(userId:string,id:string){const [row]=await db.update(wellnessObservations).set({dismissed:true}).where(and(eq(wellnessObservations.id,id),eq(wellnessObservations.userId,userId))).returning();return row??null}
