import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { ensurePersonalOsInstalled } from '@/lib/personal-os/install';
import { orchestrateNow } from '@/lib/personal-os/orchestrator';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(){
  try{
    const session=await auth();
    if(!session?.user?.id)return NextResponse.json({ok:false,message:'Sign in again to let Glow read your current day.'},{status:401});
    await ensurePersonalOsInstalled(session.user.id);
    const result=await orchestrateNow(session.user.id,new Date());
    return NextResponse.json({ok:true,...result});
  }catch(error){
    const message=error instanceof Error?error.message:'Glow could not orchestrate the current moment.';
    console.error('[api/glow/orchestrate]',message);
    return NextResponse.json({ok:false,message},{status:500});
  }
}
