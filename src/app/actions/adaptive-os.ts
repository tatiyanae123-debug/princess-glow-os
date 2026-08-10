'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addInboxItem, finishFocusSession, setActiveLifeMode, startFocusSession, upsertDayReview } from '@/lib/intelligence/adaptive-os';
import { captureDayMemory } from '@/lib/intelligence/memory-capture';

async function requireUserId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}
export async function setLifeModeAction(modeId:string):Promise<void>{const userId=await requireUserId();await setActiveLifeMode(userId,modeId);revalidatePath('/today');revalidatePath('/dashboard');}
export async function addInboxItemFormAction(formData:FormData):Promise<void>{const userId=await requireUserId();const rawText=String(formData.get('rawText')??'').trim();if(!rawText)return;await addInboxItem(userId,rawText);revalidatePath('/inbox');revalidatePath('/today');}
export async function startFocusSessionAction(entityType:string,entityId:string,title:string,plannedMinutes=25):Promise<void>{const userId=await requireUserId();await startFocusSession(userId,entityType,entityId,title,plannedMinutes);revalidatePath('/today');}
export async function finishFocusSessionFormAction(sessionId:string,formData:FormData):Promise<void>{const userId=await requireUserId();const outcome=String(formData.get('outcome')??'completed');const notes=String(formData.get('notes')??'');await finishFocusSession(userId,sessionId,outcome,notes||undefined);revalidatePath('/today');}
export async function finishDayFormAction(formData:FormData):Promise<void>{const userId=await requireUserId();const dateKey=new Date().toISOString().slice(0,10);const energyRaw=Number(formData.get('energy')??0);const input={energy:Number.isFinite(energyRaw)&&energyRaw>0?Math.min(10,Math.max(1,energyRaw)):undefined,mood:String(formData.get('mood')??'').trim()||undefined,completedSummary:String(formData.get('completedSummary')??'').trim()||undefined,movedSummary:String(formData.get('movedSummary')??'').trim()||undefined,memoryNote:String(formData.get('memoryNote')??'').trim()||undefined,tomorrowTopThree:[1,2,3].map(i=>String(formData.get(`tomorrow${i}`)??'').trim()).filter(Boolean)};await upsertDayReview(userId,dateKey,input);await captureDayMemory(userId,{dateKey,memoryNote:input.memoryNote,completedSummary:input.completedSummary,mood:input.mood,energy:input.energy});revalidatePath('/today');revalidatePath('/timeline');revalidatePath('/memory');}
