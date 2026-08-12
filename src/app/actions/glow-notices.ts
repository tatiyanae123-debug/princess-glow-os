'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { setGlowNoticeStatus } from '@/lib/intelligence/glow-notices';

async function userId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}
export async function dismissGlowNoticeAction(id:string):Promise<void>{await setGlowNoticeStatus(await userId(),id,'dismissed');revalidatePath('/notices');revalidatePath('/observations');}
export async function snoozeGlowNoticeAction(id:string):Promise<void>{const until=new Date(Date.now()+24*60*60*1000);await setGlowNoticeStatus(await userId(),id,'snoozed',until);revalidatePath('/notices');revalidatePath('/observations');}
export async function markGlowNoticeUsefulAction(id:string):Promise<void>{await setGlowNoticeStatus(await userId(),id,'useful');revalidatePath('/notices');}
