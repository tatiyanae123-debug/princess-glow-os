import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createMediaSource, getMediaSource, saveTranscriptChunk, setMediaStatus } from '@/lib/data/note-transcripts';
import { resolveAiKey, transcribeBlob } from '@/lib/notes/transcript-ai';

export const runtime='nodejs';
export const maxDuration=300;

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 let activeSourceId='';
 try{
  const form=await request.formData();
  const file=form.get('file');if(!(file instanceof Blob)||file.size===0)return NextResponse.json({error:'Missing media chunk.'},{status:400});
  if(file.size>24*1024*1024)return NextResponse.json({error:'This chunk is larger than 24 MB. Glow long-media mode should split it before upload.'},{status:413});
  const sourceId=String(form.get('sourceId')||'').trim();const rawChunk=Number(form.get('chunkIndex')||0);if(!Number.isInteger(rawChunk)||rawChunk<0)return NextResponse.json({error:'Invalid transcript chunk index.'},{status:400});
  const chunkIndex=rawChunk;const startSeconds=Number(form.get('startSeconds')||0);const endSeconds=Number(form.get('endSeconds')||0);if(Number.isFinite(startSeconds)&&Number.isFinite(endSeconds)&&endSeconds>0&&endSeconds<startSeconds)return NextResponse.json({error:'Transcript chunk end time cannot be before its start time.'},{status:400});
  let source=null;
  if(sourceId){source=await getMediaSource(session.user.id,sourceId);if(!source)return NextResponse.json({error:'That transcript source is unavailable for this account. Restart the import instead of attaching a chunk to another source.'},{status:404})}
  else source=await createMediaSource(session.user.id,{title:String(form.get('title')||'Imported media').trim().slice(0,255)||'Imported media',sourceType:'upload',mimeType:file.type||'application/octet-stream'});
  activeSourceId=source.id;
  const text=(await transcribeBlob(resolveAiKey(request),file,String(form.get('filename')||`chunk-${chunkIndex}.media`))).trim();if(!text)throw new Error('The transcription provider returned an empty transcript for this part.');
  await saveTranscriptChunk(session.user.id,source.id,{chunkIndex,text,startSeconds:Number.isFinite(startSeconds)?startSeconds:null,endSeconds:Number.isFinite(endSeconds)?endSeconds:null});
  await setMediaStatus(session.user.id,source.id,String(form.get('finalChunk'))==='true'?'transcribed':'transcribing');
  return NextResponse.json({data:{sourceId:source.id,chunkIndex,text}});
 }catch(error){if(activeSourceId)await setMediaStatus(session.user.id,activeSourceId,'error',error instanceof Error?error.message:'Transcription failed.').catch(()=>null);return NextResponse.json({error:error instanceof Error?error.message:'Transcription failed.'},{status:500})}
}
