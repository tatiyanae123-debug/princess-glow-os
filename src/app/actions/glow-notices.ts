'use server';

import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { glowNotices } from '@/db/schema/interconnected-os';
import { aiProposals } from '@/db/schema/completion-v1';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function uid(){const s=await auth();if(!s?.user?.id)redirect('/sign-in');return s.user.id;}
export async function dismissGlowNoticeAction(id:string){const userId=await uid();await db.update(glowNotices).set({status:'dismissed'}).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId)));revalidatePath('/observations');}
export async function snoozeGlowNoticeAction(id:string){const userId=await uid();const until=new Date(Date.now()+24*60*60*1000);await db.update(glowNotices).set({status:'snoozed',snoozedUntil:until}).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId)));revalidatePath('/observations');}
export async function applyGlowNoticeAction(id:string){const userId=await uid();const [notice]=await db.select().from(glowNotices).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId))).limit(1);if(!notice)return;await db.insert(aiProposals).values({userId,intent:notice.actionType||'glow_notice',summary:notice.recommendation||notice.title,reason:`${notice.evidence} Confidence ${Math.round(notice.confidence*100)}%.`,confidence:notice.confidence,reversible:true,payload:notice.actionPayload});await db.update(glowNotices).set({status:'proposed'}).where(and(eq(glowNotices.id,id),eq(glowNotices.userId,userId)));revalidatePath('/observations');revalidatePath('/concierge');}
