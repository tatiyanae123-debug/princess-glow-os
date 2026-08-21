import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMediaSource, getTranscript, rankChunks, saveQuestion } from '@/lib/data/note-transcripts';
import { askModel, resolveAiKey } from '@/lib/notes/transcript-ai';

export const runtime='nodejs';
export const maxDuration=300;

function batches<T>(items:T[],size:number){const out:T[][]=[];for(let i=0;i<items.length;i+=size)out.push(items.slice(i,i+size));return out}
function parseIds(text:string,valid:Set<number>){const ids=[...text.matchAll(/\d+/g)].map(m=>Number(m[0])).filter(id=>valid.has(id));return [...new Set(ids)]}

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const body=await request.json() as {sourceId?:string;question?:string};const sourceId=body.sourceId?.trim(),question=body.question?.trim();if(!sourceId||!question)return NextResponse.json({error:'Choose a transcript and ask a question.'},{status:400});
  if(question.length>3000)return NextResponse.json({error:'Keep each transcript question under 3,000 characters.'},{status:400});
  const source=await getMediaSource(session.user.id,sourceId);if(!source)return NextResponse.json({error:'Transcript source not found.'},{status:404});
  const chunks=await getTranscript(session.user.id,sourceId);if(!chunks.length)return NextResponse.json({error:'This source has no transcript yet.'},{status:400});
  const key=resolveAiKey(request);const lexical=rankChunks(chunks,question,8);let selected=lexical;
  if(key&&chunks.length>8){
   const valid=new Set(chunks.map(c=>c.chunkIndex));const chosen=new Set<number>(lexical.map(c=>c.chunkIndex));
   for(const group of batches(chunks,30)){
    const index=group.map(c=>`[Chunk ${c.chunkIndex}] ${(c.analysis||c.text).slice(0,1200)}`).join('\n\n');
    const result=await askModel(key,`The user will ask a question about a long transcript. From ONLY this index group, return the chunk numbers that could contain evidence needed to answer the question. Return only chunk numbers separated by commas. If none are relevant, return NONE.\n\nQUESTION: ${question}\n\nINDEX:\n${index}`,'gpt-5.6-luna');
    parseIds(result,valid).slice(0,4).forEach(id=>chosen.add(id));
   }
   selected=chunks.filter(c=>chosen.has(c.chunkIndex)).slice(0,14);if(!selected.length)selected=lexical;
  }
  const evidence=selected.map(c=>`[Chunk ${c.chunkIndex}${c.startSeconds!=null?` · ${c.startSeconds}s`:''}]\n${c.text.slice(0,9000)}`).join('\n\n');
  let answer:string,model:string|undefined;
  if(key){model='gpt-5.6-luna';answer=await askModel(key,`Answer the user's question using ONLY the transcript evidence below. If the answer is not supported, say that clearly. Be complete enough to answer the actual question, and cite chunk numbers inline for important claims. Do not substitute general knowledge for missing transcript evidence.\n\nQUESTION:\n${question}\n\nTRANSCRIPT EVIDENCE:\n${evidence}`,model)}
  else answer=`Glow found relevant transcript passages, but AI answering is not connected yet. ${selected.slice(0,3).map(c=>`Chunk ${c.chunkIndex}: ${c.text.slice(0,280)}`).join(' | ')}`;
  const savedEvidence=selected.slice(0,8).map(c=>({chunkIndex:c.chunkIndex,quote:c.text.slice(0,700)}));await saveQuestion(session.user.id,sourceId,{question,answer,evidence:savedEvidence,model});
  return NextResponse.json({data:{answer,evidence:savedEvidence,providerConnected:Boolean(key)}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not answer from this transcript.'},{status:500})}
}
