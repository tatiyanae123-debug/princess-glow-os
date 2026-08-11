'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { applyGlowNotice, setGlowNoticeFeedback, setGlowNoticeStatus, type GlowNoticeFeedback } from '@/lib/intelligence/glow-notices';

async function userId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}
function revalidateNoticeSurfaces(){revalidatePath('/notices');revalidatePath('/observations');revalidatePath('/dashboard');revalidatePath('/today');}
function destinationForNotice(actionType:string|null,domain:string){
  if(actionType==='switch_mode')return '/today';
  if(actionType==='lighter_day')return '/habits';
  if(actionType==='protect_time')return '/calendar';
  if(actionType==='review_finance')return '/finance/brain';
  if(actionType==='project_triage')return '/projects';
  const domainRoutes:Record<string,string>={planning:'/planning',habits:'/habits',calendar:'/calendar',finance:'/finance/brain',projects:'/projects'};
  return domainRoutes[domain]??'/observations';
}
export async function dismissGlowNoticeAction(id:string):Promise<void>{await setGlowNoticeStatus(await userId(),id,'dismissed');revalidateNoticeSurfaces();}
export async function snoozeGlowNoticeAction(id:string):Promise<void>{const until=new Date(Date.now()+24*60*60*1000);await setGlowNoticeStatus(await userId(),id,'snoozed',until);revalidateNoticeSurfaces();}
export async function markGlowNoticeUsefulAction(id:string):Promise<void>{await setGlowNoticeStatus(await userId(),id,'useful');revalidateNoticeSurfaces();}
export async function setGlowNoticeFeedbackAction(id:string,feedback:GlowNoticeFeedback):Promise<void>{await setGlowNoticeFeedback(await userId(),id,feedback);revalidateNoticeSurfaces();}
export async function applyGlowNoticeAction(id:string):Promise<void>{
  const notice=await applyGlowNotice(await userId(),id);
  revalidateNoticeSurfaces();
  if(notice)redirect(destinationForNotice(notice.actionType,notice.domain));
}
