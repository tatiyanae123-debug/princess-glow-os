'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { markInboxProcessed } from '@/lib/intelligence/adaptive-os';
import { routeInboxItem } from '@/lib/intelligence/inbox-routing';
import { isInboxRouteDestination } from '@/lib/intelligence/inbox-routing-options';

async function requireUserId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}

export async function routeInboxItemAction(itemId:string,formData:FormData):Promise<void>{
  const userId=await requireUserId();
  const destination=formData.get('destination');
  if(!isInboxRouteDestination(destination))return;
  await routeInboxItem(userId,itemId,destination);
  for(const path of ['/inbox','/today','/tasks','/notes','/goals','/calendar','/finance','/projects'])revalidatePath(path);
}
export async function dismissInboxItemAction(itemId:string):Promise<void>{const userId=await requireUserId();await markInboxProcessed(userId,itemId);revalidatePath('/inbox');revalidatePath('/today');}
