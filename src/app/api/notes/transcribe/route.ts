import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createMediaSource, getMediaSource, saveTranscriptChunk, setMediaStatus } from '@/lib/data/note-transcripts';
import { resolveAiKey, transcribeBlob } from '@/lib/notes/transcript-ai';

export const runtime='nodejs';
export const maxDuration=300;

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const form=await request.formData();
  const file=form.get('file');if(!(file instanceof Blob))return NextResponse.json({error:'Missing media chunk.'},{status:400});
  if(file.size>24*1024*1024)return NextResponse.json({error:'This chunk is larger than 24 MB. Glow long-media mode should split it before upload.'},{status:413});
  const sourceId=String(form.get('sourceId')||'');const chunkIndex=Math.max(0,Number(form.get('chunkIndex')||0));const startSeconds=Number(form.get('startSeconds')||0);const endSeconds=Number(form.get('endSeconds')||0);
  let source=sourceId?await getMediaSource(session.user.id,sourceId):null;
  if(!source)source=await createMediaSource(session.user.id,{title:String(form.get('title')||'Imported media'),sourceType:'upload',mimeType:file.type||'application/octet-stream'});
  const text=await transcribeBlob(resolveAiKey(request),file,String(form.get('filename')||`chunk-${chunkIndex}.media`));
  await saveTranscriptChunk(session.user.id,source.id,{chunkIndex,text,startSeconds:Number.isFinite(startSeconds)?startSeconds:null,endSeconds:Number.isFinite(endSeconds)?endSeconds:null});
  await setMediaStatus(session.user.id,source.id,String(form.get('finalChunk'))==='true'?'transcribed':'transcribing');
  return NextResponse.json({data:{sourceId:source.id,chunkIndex,text}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Transcription failed.'},{status:500})}
}
