'use server';

import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { personalRules } from '@/db/schema/adaptive-os';
import { systemPreferences } from '@/db/schema/interconnected-os';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function userId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}

export async function createPersonalRuleAction(formData:FormData){const id=await userId();const title=String(formData.get('title')??'').trim();const ruleType=String(formData.get('ruleType')??'general').trim();const conditionText=String(formData.get('condition')??'').trim();const effectText=String(formData.get('effect')??'').trim();const priority=Number(formData.get('priority')??50);if(!title)return;await db.insert(personalRules).values({userId:id,title,ruleType,condition:{description:conditionText},effect:{description:effectText},priority:Number.isFinite(priority)?Math.max(0,Math.min(100,Math.round(priority))):50,enabled:true,source:'user'});revalidatePath('/settings');revalidatePath('/today');}

export async function togglePersonalRuleAction(ruleId:string,enabled:boolean){const id=await userId();await db.update(personalRules).set({enabled,updatedAt:new Date()}).where(and(eq(personalRules.id,ruleId),eq(personalRules.userId,id)));revalidatePath('/settings');revalidatePath('/today');}

export async function deletePersonalRuleAction(ruleId:string){const id=await userId();await db.delete(personalRules).where(and(eq(personalRules.id,ruleId),eq(personalRules.userId,id)));revalidatePath('/settings');revalidatePath('/today');}

export async function updateSystemPreferenceAction(systemKey:string,formData:FormData){const id=await userId();const pinned=formData.get('pinned')==='on';const hidden=formData.get('hidden')==='on';const label=String(formData.get('label')??'').trim()||null;const cardSize=String(formData.get('cardSize')??'').trim()||null;await db.insert(systemPreferences).values({userId:id,systemKey,pinned,hidden,label,cardSize}).onConflictDoUpdate({target:[systemPreferences.userId,systemPreferences.systemKey],set:{pinned,hidden,label,cardSize,updatedAt:new Date()}});revalidatePath('/settings');revalidatePath('/dashboard');revalidatePath('/world');}
