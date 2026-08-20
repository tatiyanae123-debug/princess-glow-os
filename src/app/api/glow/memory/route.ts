import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { lifeMemories } from '@/db/schema/intelligence-expansion';

export const runtime='nodejs';
export const dynamic='force-dynamic';

function cleanMemoryText(raw:string){return raw.replace(/^\s*(?:remember(?: that)?|save this(?: as a memory)?|keep this in memory|don['’]?t forget(?: that)?)\s*[:,-]?\s*/i,'').trim();}

export async function POST(request:Request){
  try{
    const session=await auth();if(!session?.user?.id)return NextResponse.json({ok:false,message:'Sign in again before saving memory.'},{status:401});
    const body=await request.json() as {text?:string};const raw=String(body.text??'').trim();const summary=cleanMemoryText(raw);
    if(!summary)return NextResponse.json({ok:false,message:'Tell Glow what you want remembered.'},{status:400});
    const title=summary.length>90?`${summary.slice(0,87)}…`:summary;
    const [memory]=await db.insert(lifeMemories).values({userId:session.user.id,title,category:'personal',source:'glow_voice',summary:summary.slice(0,2000),privacyLevel:'private',pinned:false}).returning({id:lifeMemories.id,title:lifeMemories.title});
    return NextResponse.json({ok:true,memory,message:`Saved to Memory: ${memory.title}`});
  }catch(error){const message=error instanceof Error?error.message:'Glow could not save that memory.';console.error('[api/glow/memory]',message);return NextResponse.json({ok:false,message},{status:500});}
}
