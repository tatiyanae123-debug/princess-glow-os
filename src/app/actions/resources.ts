'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { resourceLibraryItems } from '@/db/schema/interconnected-os';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createResourceAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const title=String(formData.get('title')??'').trim();
  const category=String(formData.get('category')??'').trim();
  const content=String(formData.get('content')??'').trim();
  const duration=Number(formData.get('durationMinutes')??0);
  const tags=String(formData.get('tags')??'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!title||!category)return;
  await db.insert(resourceLibraryItems).values({userId:session.user.id,title,category,content:content||null,durationMinutes:Number.isFinite(duration)&&duration>0?Math.round(duration):null,tags});
  revalidatePath('/resources');
  revalidatePath('/resources/manage');
}
