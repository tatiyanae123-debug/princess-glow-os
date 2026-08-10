'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addInboxItem, finishFocusSession, markInboxProcessed, setActiveLifeMode, startFocusSession, upsertDayReview } from '@/lib/intelligence/adaptive-os';
import { routeInboxItem } from '@/lib/intelligence/inbox-routing';
import { captureDayMemory } from '@/lib/intelligence/memory-capture';

async function requireUserId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}
export async function setLifeModeAction(modeId:string):Promise<void>{const userId=await requireUserId();await setActiveLifeMode(userId,modeId);revalidatePath('/today');revalidatePath('/dashboard');}
export async function addInboxItemAction(rawText:string){const userId=await requireUserId();const trimmed=rawText.trim();if(!trimmed)return{error:'Add something before sending it to Glow Inbox.'};const item=await addInboxItem(userId,trimmed);revalidatePath('/inbox');revalidatePath('/today');return{data:item};}
export async function addInboxItemFormAction(formData:FormData):Promise<void>{await addInboxItemAction(String(formData.get('rawText')??''));}
export async function routeInboxItemAction(itemId:string):Promise<void>{const userId=await requireUserId();await routeInboxItem(userId,itemId);revalidatePath('/inbox');revalidatePath('/today');revalidatePath('/tasks');revalidatePath('/notes');revalidatePath('/goals');}
export async function markInboxProcessedAction(itemId:string):Promise<void>{const userId=await requireUserId();await markInboxProcessed(userId,itemId);revalidatePath('/inbox');revalidatePath('/today');}
export async function startFocusSessionAction(entityType:string,entityId:string,title:string,plannedMinutes=25):Promise<void>{const userId=await requireUserId();await startFocusSession(userId,entityType,entityId,title,plannedMinutes);revalidatePath('/today');}
export async function finishFocusSessionAction(sessionId:string,outcome?:string,notes?:string){const userId=await requireUserId();const session=await finishFocusSession(userId,sessionId,outcome,notes);revalidatePath('/today');return{data:session};}
export async function finishFocusSessionFormAction(sessionId:string,formData:FormData):Promise<void>{const outcome=String(formData.get('outcome')??'completed');const notes=String(formData.get('notes')??'');await finishFocusSessionAction(sessionId,outcome,notes||undefined);}
export async function finishDayAction(input:{energy?:number;mood?:string;completedSummary?:string;movedSummary?:string;memoryNote?:string;tomorrowTopThree?:string[]}){const userId=await requireUserId();const dateKey=new Date().toISOString().slice(0,10);const review=await upsertDayReview(userId,dateKey,input);await captureDayMemory(userId,{dateKey,memoryNote:input.memoryNote,completedSummary:input.completedSummary,mood:input.mood,energy:input.energy});revalidatePath('/today');revalidatePath('/timeline');revalidatePath('/memory');return{data:review};}
export async function finishDayFormAction(formData:FormData):Promise<void>{const energyRaw=Number(formData.get('energy')??0);const topThree=[1,2,3].map(i=>String(formData.get(`tomorrow${i}`)??'').trim()).filter(Boolean);await finishDayAction({energy:Number.isFinite(energyRaw)&&energyRaw>0?Math.min(10,Math.max(1,energyRaw)):undefined,mood:String(formData.get('mood')??'').trim()||undefined,completedSummary:String(formData.get('completedSummary')??'').trim()||undefined,movedSummary:String(formData.get('movedSummary')??'').trim()||undefined,memoryNote:String(formData.get('memoryNote')??'').trim()||undefined,tomorrowTopThree:topThree});}
