import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMediaSource, getTranscript, rankChunks, saveQuestion } from '@/lib/data/note-transcripts';
import { askModel, resolveAiKey } from '@/lib/notes/transcript-ai';

export const runtime='nodejs';
export const maxDuration=120;

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const body=await request.json() as {sourceId?:string;question?:string};const sourceId=body.sourceId?.trim(),question=body.question?.trim();if(!sourceId||!question)return NextResponse.json({error:'Choose a transcript and ask a question.'},{status:400});
  const source=await getMediaSource(session.user.id,sourceId);if(!source)return NextResponse.json({error:'Transcript source not found.'},{status:404});
  const chunks=await getTranscript(session.user.id,sourceId);if(!chunks.length)return NextResponse.json({error:'This source has no transcript yet.'},{status:400});
  const selected=rankChunks(chunks,question,10);const evidence=selected.map(c=>`[Chunk ${c.chunkIndex}${c.startSeconds!=null?` · ${c.startSeconds}s`:''}]\n${c.text.slice(0,7000)}`).join('\n\n');
  const key=resolveAiKey(request);let answer:string,model:string|undefined;
  if(key){model='gpt-5.6-luna';answer=await askModel(key,`Answer the user's question using ONLY the transcript evidence below. If the answer is not supported, say that clearly. Be concise but complete. Mention chunk numbers for important claims.\n\nQUESTION:\n${question}\n\nTRANSCRIPT EVIDENCE:\n${evidence}`,model)}
  else answer=`Glow found these relevant transcript passages, but AI answering is not connected yet. ${selected.slice(0,3).map(c=>`Chunk ${c.chunkIndex}: ${c.text.slice(0,280)}`).join(' | ')}`;
  const savedEvidence=selected.slice(0,6).map(c=>({chunkIndex:c.chunkIndex,quote:c.text.slice(0,500)}));await saveQuestion(session.user.id,sourceId,{question,answer,evidence:savedEvidence,model});
  return NextResponse.json({data:{answer,evidence:savedEvidence,providerConnected:Boolean(key)}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not answer from this transcript.'},{status:500})}
}
