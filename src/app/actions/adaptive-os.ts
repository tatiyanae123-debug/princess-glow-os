'use server';

import { auth } from '@/auth';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { addInboxItem, finishFocusSession, getLifeModes, setActiveLifeMode, startFocusSession, upsertDayReview } from '@/lib/intelligence/adaptive-os';
import { captureDayMemory, captureTomorrowBrief } from '@/lib/intelligence/memory-capture';
import { buildTomorrowBrief } from '@/lib/intelligence/tomorrow';

async function requireUserId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}

const LIFE_MODE_DEPENDENT_PATHS=['/today','/dashboard','/plan','/planning','/tasks','/calendar','/habits','/routines','/fitness','/wellness','/life','/brain','/briefings','/world','/create'] as const;
const LIFE_MODE_COOKIE='glow-os-productivity-mode';
const SLUG_TO_PRODUCTIVITY:Record<string,string>={'deep-work':'very-productive','normal':'normal','low-energy':'low','sick':'cancel-everything'};
const PRODUCTIVITY_TO_SLUG:Record<string,string>={'very-productive':'deep-work','normal':'normal','low':'low-energy','cancel-everything':'sick'};

function revalidateLifeModeViews(){for(const path of LIFE_MODE_DEPENDENT_PATHS)revalidatePath(path);}
async function persistModeCookie(slug:string){const store=await cookies();store.set(LIFE_MODE_COOKIE,SLUG_TO_PRODUCTIVITY[slug]??'normal',{path:'/',sameSite:'lax',maxAge:60*60*24*365});}

export async function setLifeModeAction(modeId:string):Promise<void>{const userId=await requireUserId();const modes=await getLifeModes(userId);const selected=modes.find(mode=>mode.id===modeId);if(!selected)throw new Error('Life Mode not found for this user.');await setActiveLifeMode(userId,modeId);await persistModeCookie(selected.slug);revalidateLifeModeViews();}
export async function setLifeModeByProductivityModeAction(productivityMode:string):Promise<void>{const userId=await requireUserId();const slug=PRODUCTIVITY_TO_SLUG[productivityMode]??'normal';const modes=await getLifeModes(userId);const selected=modes.find(mode=>mode.slug===slug);if(!selected)throw new Error(`Glow Mode ${slug} is not available for this user.`);await setActiveLifeMode(userId,selected.id);await persistModeCookie(slug);revalidateLifeModeViews();}
export async function addInboxItemFormAction(formData:FormData):Promise<void>{const userId=await requireUserId();const rawText=String(formData.get('rawText')??'').trim();if(!rawText)return;await addInboxItem(userId,rawText);revalidatePath('/inbox');revalidatePath('/today');}
export async function startFocusSessionAction(entityType:string,entityId:string,title:string,plannedMinutes=25):Promise<void>{const userId=await requireUserId();await startFocusSession(userId,entityType,entityId,title,plannedMinutes);revalidatePath('/today');}
export async function finishFocusSessionFormAction(sessionId:string,formData:FormData):Promise<void>{const userId=await requireUserId();const outcome=String(formData.get('outcome')??'completed');const notes=String(formData.get('notes')??'');await finishFocusSession(userId,sessionId,outcome,notes||undefined);revalidatePath('/today');}
export async function finishDayFormAction(formData:FormData):Promise<void>{const userId=await requireUserId();const dateKey=new Date().toISOString().slice(0,10);const energyRaw=Number(formData.get('energy')??0);const input={energy:Number.isFinite(energyRaw)&&energyRaw>0?Math.min(10,Math.max(1,energyRaw)):undefined,mood:String(formData.get('mood')??'').trim()||undefined,completedSummary:String(formData.get('completedSummary')??'').trim()||undefined,movedSummary:String(formData.get('movedSummary')??'').trim()||undefined,memoryNote:String(formData.get('memoryNote')??'').trim()||undefined,tomorrowTopThree:[1,2,3].map(i=>String(formData.get(`tomorrow${i}`)??'').trim()).filter(Boolean)};await upsertDayReview(userId,dateKey,input);await captureDayMemory(userId,{dateKey,memoryNote:input.memoryNote,completedSummary:input.completedSummary,movedSummary:input.movedSummary,mood:input.mood,energy:input.energy,tomorrowTopThree:input.tomorrowTopThree});revalidatePath('/today');revalidatePath('/timeline');revalidatePath('/memory');}
export async function prepareTomorrowFormAction():Promise<void>{const userId=await requireUserId();const now=new Date();const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);const dateKey=tomorrow.toISOString().slice(0,10);const brief=await buildTomorrowBrief(userId,now);await captureTomorrowBrief(userId,{dateKey,summary:brief.summary,topThree:brief.topThree,events:brief.events,work:brief.work,routines:brief.routines,wakeTarget:brief.wakeTarget,prepTonight:brief.prepTonight});revalidatePath('/tomorrow');revalidatePath('/timeline');revalidatePath('/memory');}
