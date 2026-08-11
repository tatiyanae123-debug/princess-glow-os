'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ingestFile, ingestText } from '@/lib/intelligence/universal-intake';

export type UniversalIntakeState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  uploadedName?: string;
};

export const initialUniversalIntakeState: UniversalIntakeState = { status: 'idle', message: '' };

async function userId(){const session=await auth();if(!session?.user?.id)redirect('/sign-in');return session.user.id;}

async function processUniversalIntake(formData:FormData):Promise<UniversalIntakeState>{
  const id=await userId();
  const text=String(formData.get('text')??'').trim();
  const note=String(formData.get('note')??'').trim();
  const sourceRoute=String(formData.get('sourceRoute')??'').trim()||undefined;
  const file=formData.get('file');
  try {
    if(file instanceof File&&file.size>0){
      await ingestFile(id,file,note||text,{sourceRoute});
      ['/intake','/inbox','/today','/dashboard',sourceRoute].filter(Boolean).forEach(path=>revalidatePath(String(path)));
      return {status:'success',message:`${file.name} was uploaded, understood and added to Glow Inbox.`,uploadedName:file.name};
    }
    if(text){
      await ingestText(id,text,{sourceRoute});
      ['/intake','/inbox','/today','/dashboard',sourceRoute].filter(Boolean).forEach(path=>revalidatePath(String(path)));
      return {status:'success',message:'Glow understood your text and added it to Glow Inbox.'};
    }
    return {status:'error',message:'Choose a file or paste something before sending it to Glow.'};
  } catch(error){
    const message=error instanceof Error?error.message:'Glow could not upload that item. Please try again.';
    return {status:'error',message};
  }
}

export async function universalIntakeAction(formData:FormData):Promise<void>{ await processUniversalIntake(formData); }
export async function universalIntakeFormAction(_previousState:UniversalIntakeState,formData:FormData):Promise<UniversalIntakeState>{ return processUniversalIntake(formData); }
