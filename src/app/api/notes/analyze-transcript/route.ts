import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getMediaSource, getTranscript, saveAnalysis, saveTranscriptChunk } from '@/lib/data/note-transcripts';
import { askModel, parseJsonObject, resolveAiKey } from '@/lib/notes/transcript-ai';

export const runtime='nodejs';
export const maxDuration=300;

const list=(value:unknown)=>Array.isArray(value)?value.filter(x=>typeof x==='string').slice(0,40) as string[]:[];
function batches(items:string[],maxChars=42000){const groups:string[][]=[];let current:string[]=[];let size=0;for(const item of items){if(current.length&&size+item.length>maxChars){groups.push(current);current=[];size=0}current.push(item);size+=item.length}if(current.length)groups.push(current);return groups}

async function compressAll(key:string,items:string[]){
 let level=items;
 while(level.join('\n\n').length>85000){
  const groups=batches(level,42000);const next:string[]=[];
  for(let index=0;index<groups.length;index+=1){
   const summary=await askModel(key,`Compress this group of transcript section analyses into one dense factual summary. Preserve every important name, claim, instruction, decision, example, disagreement, number, date, and unresolved question. Preserve referenced chunk numbers when present. Do not invent anything.\n\n${groups[index].join('\n\n')}`,'gpt-5.6-luna');
   next.push(`[Summary group ${index+1}] ${summary}`);
  }
  level=next;
 }
 return level;
}

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const body=await request.json() as {sourceId?:string};const sourceId=body.sourceId?.trim();if(!sourceId)return NextResponse.json({error:'Choose a transcript.'},{status:400});const source=await getMediaSource(session.user.id,sourceId);if(!source)return NextResponse.json({error:'Transcript source not found.'},{status:404});const chunks=await getTranscript(session.user.id,sourceId);if(!chunks.length)return NextResponse.json({error:'This source has no transcript yet.'},{status:400});const key=resolveAiKey(request);if(!key)return NextResponse.json({error:'Connect an AI provider in Notes Transcription Settings to run deep analysis.'},{status:409});
  const chunkSummaries:string[]=[];
  for(const chunk of chunks){
   let summary=chunk.analysis;
   if(!summary){summary=await askModel(key,`Analyze this transcript section faithfully. Preserve names, claims, instructions, decisions, examples, disagreements, numbers, dates, and important details. Do not invent anything. Return a dense factual section summary and retain any useful wording distinctions.\n\nTRANSCRIPT CHUNK ${chunk.chunkIndex}:\n${chunk.text.slice(0,24000)}`,'gpt-5.6-luna');await saveTranscriptChunk(session.user.id,sourceId,{chunkIndex:chunk.chunkIndex,text:chunk.text,startSeconds:chunk.startSeconds,endSeconds:chunk.endSeconds,analysis:summary})}
   chunkSummaries.push(`[Chunk ${chunk.chunkIndex}] ${summary}`);
  }
  const compressed=await compressAll(key,chunkSummaries);
  const synthesis=await askModel(key,`Synthesize ALL transcript section analyses below into JSON only with keys: summary (string), keyPoints (string[]), decisions (string[]), actionItems (string[]), questions (string[]), themes (string[]). Cover the entire source from beginning to end. Distinguish explicitly stated facts from synthesis. Do not omit later sections.\n\n${compressed.join('\n\n')}`,'gpt-5.6-luna');const parsed=parseJsonObject(synthesis);const analysis=await saveAnalysis(session.user.id,sourceId,{summary:String(parsed.summary??''),keyPoints:list(parsed.keyPoints),decisions:list(parsed.decisions),actionItems:list(parsed.actionItems),questions:list(parsed.questions),themes:list(parsed.themes),model:'gpt-5.6-luna'});return NextResponse.json({data:analysis});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Transcript analysis failed.'},{status:500})}
}
