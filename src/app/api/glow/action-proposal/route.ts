import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { aiProposals } from '@/db/schema/completion-v1';

export const runtime='nodejs';
export const dynamic='force-dynamic';

type Scope='calendar'|'reminders'|'external'|'general';

function scopeFor(text:string):Scope{
  const value=text.toLowerCase();
  if(/calendar|event|appointment|schedule|reschedule|move my workout|move .* to (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/.test(value))return'calendar';
  if(/remind|reminder|apple reminders/.test(value))return'reminders';
  if(/email|purchase|pay|transfer|account/.test(value))return'external';
  return'general';
}

export async function POST(request:Request){
  try{
    const session=await auth();if(!session?.user?.id)return NextResponse.json({ok:false,message:'Sign in again before Glow prepares an action.'},{status:401});
    const body=await request.json() as {text?:string;risk?:'low'|'medium'|'high';sourceRoute?:string};
    const text=String(body.text??'').trim();if(!text)return NextResponse.json({ok:false,message:'Tell Glow what you want changed.'},{status:400});
    const scope=scopeFor(text);const risk=body.risk==='high'?'high':'medium';
    const [proposal]=await db.insert(aiProposals).values({
      userId:session.user.id,
      intent:`glow_${scope}_action`,
      summary:text.slice(0,1000),
      reason:scope==='calendar'?'Calendar changes can affect the rest of the day, so Glow saved this as a reviewable action before changing time.':scope==='reminders'?'Reminder changes may cross into an Apple-connected system, so Glow saved a reviewable action instead of silently changing it.':'Glow requires review before destructive or external changes.',
      confidence:0.9,
      reversible:true,
      payload:{actionType:'advisory',scope,rawCommand:text,risk,sourceRoute:body.sourceRoute??null,requestedAt:new Date().toISOString()},
    }).returning({id:aiProposals.id});
    return NextResponse.json({ok:true,proposalId:proposal.id,href:'/concierge',message:`Glow prepared this ${scope} change for review in Concierge.`});
  }catch(error){const message=error instanceof Error?error.message:'Glow could not prepare that action.';console.error('[api/glow/action-proposal]',message);return NextResponse.json({ok:false,message},{status:500});}
}
