'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ingestFile, ingestText } from '@/lib/intelligence/universal-intake';

async function userId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}

export async function universalIntakeAction(formData:FormData):Promise<void>{const id=await userId();const text=String(formData.get('text')??'').trim();const note=String(formData.get('note')??'').trim();const file=formData.get('file');if(file instanceof File&&file.size>0)await ingestFile(id,file,note||text);else if(text)await ingestText(id,text);else return;revalidatePath('/intake');revalidatePath('/inbox');revalidatePath('/today');}
