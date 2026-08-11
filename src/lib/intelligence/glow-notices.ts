import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { glowNotices } from '@/db/schema/interconnected-os';
import { buildCrossSystemSnapshot } from '@/lib/intelligence/cross-system';

export type GlowNoticeFeedback = 'helpful' | 'not_helpful';

export async function ensureGlowNotices(userId:string){
  const snapshot=await buildCrossSystemSnapshot(userId,'observations');
  const existing=await db.select().from(glowNotices).where(and(eq(glowNotices.userId,userId),eq(glowNotices.status,'active')));
  const titles=new Set(existing.map(x=>x.title));
  const proposals:Array<{domain:string;title:string;evidence:string;recommendation:string;confidence:number;actionType:string}> = [];
  if(snapshot.overdueTasks>=2)proposals.push({domain:'planning',title:'Overdue work is creating planning pressure',evidence:`${snapshot.overdueTasks} tasks are currently overdue.`,recommendation:'Run Catch-Up mode and surface only the next unblocked actions.',confidence:.9,actionType:'switch_mode'});
  if(snapshot.habitsTotal>0&&snapshot.habitPercent<40&&new Date().getHours()>=16)proposals.push({domain:'habits',title:'Habit completion is low for this point in the day',evidence:`${snapshot.habitsCompleted} of ${snapshot.habitsTotal} habits are complete.`,recommendation:'Protect essential habits and hide optional ones for the rest of today.',confidence:.78,actionType:'lighter_day'});
  if(snapshot.eventsToday>=5)proposals.push({domain:'calendar',title:'Today is commitment-heavy',evidence:`There are ${snapshot.eventsToday} events on today’s calendar.`,recommendation:'Avoid adding long focus blocks and protect transition time.',confidence:.88,actionType:'protect_time'});
  if(snapshot.beautySpend>=200)proposals.push({domain:'finance',title:'Beauty spending is elevated this month',evidence:`$${snapshot.beautySpend.toFixed(0)} of logged expenses are in Beauty this month.`,recommendation:'Review upcoming repurchases before adding nonessential Beauty purchases.',confidence:.82,actionType:'review_finance'});
  if(snapshot.activeProjects>=5)proposals.push({domain:'projects',title:'Project load is high',evidence:`${snapshot.activeProjects} projects are active at once.`,recommendation:'Choose one primary project and pause anything without a next action.',confidence:.8,actionType:'project_triage'});
  const fresh=proposals.filter(p=>!titles.has(p.title));
  if(fresh.length)await db.insert(glowNotices).values(fresh.map(p=>({...p,userId,status:'active',actionPayload:{}})));
  return db.select().from(glowNotices).where(eq(glowNotices.userId,userId)).orderBy(desc(glowNotices.createdAt));
}

export async function setGlowNoticeStatus(userId:string,id:string,status:string,snoozedUntil?:Date){
  const[updated]=await db.update(glowNotices).set({status,snoozedUntil:snoozedUntil??null}).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId))).returning();
  return updated??null;
}

export async function setGlowNoticeFeedback(userId:string,id:string,feedback:GlowNoticeFeedback){
  const [notice]=await db.select().from(glowNotices).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId))).limit(1);
  if(!notice)return null;
  const actionPayload={...(notice.actionPayload??{}),feedback,feedbackAt:new Date().toISOString()};
  const [updated]=await db.update(glowNotices).set({actionPayload}).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId))).returning();
  return updated??null;
}

export async function applyGlowNotice(userId:string,id:string){
  const [notice]=await db.select().from(glowNotices).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId))).limit(1);
  if(!notice||notice.status!=='active')return null;
  const actionPayload={...(notice.actionPayload??{}),appliedAt:new Date().toISOString()};
  const [updated]=await db.update(glowNotices).set({status:'applied',actionPayload,snoozedUntil:null}).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId),eq(glowNotices.status,'active'))).returning();
  return updated??null;
}
