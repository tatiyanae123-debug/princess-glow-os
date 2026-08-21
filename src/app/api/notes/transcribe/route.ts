import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createMediaSource, getMediaSource, saveTranscriptChunk, setMediaStatus } from '@/lib/data/note-transcripts';
import { resolveAiKey, transcribeBlob } from '@/lib/notes/transcript-ai';

export const runtime='nodejs';
export const maxDuration=300;

function extensionForMime(type:string){const t=(type||'').toLowerCase();if(t.includes('quicktime'))return'.mov';if(t==='video/mp4')return'.mp4';if(t.includes('webm'))return'.webm';if(t==='audio/mp4')return'.m4a';if(t.includes('mpeg'))return t.startsWith('audio/')?'.mp3':'.mpg';if(t.includes('wav'))return'.wav';if(t.includes('aac'))return'.aac';if(t.includes('ogg'))return'.ogg';return'.media'}
function safeFilename(value:string,type:string){const cleaned=(value||'media').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._ -]/g,'-').replace(/\s+/g,' ').trim().slice(0,160)||'media';return /\.[a-z0-9]{2,5}$/i.test(cleaned)?cleaned:`${cleaned}${extensionForMime(type)}`}

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 let activeSourceId='';
 try{
  const form=await request.formData();
  const file=form.get('file');if(!(file instanceof Blob)||file.size===0)return NextResponse.json({error:'Missing media chunk.'},{status:400});
  if(file.size>24*1024*1024)return NextResponse.json({error:'This media part is too large for the transcription provider. Glow should split long files before upload.'},{status:413});
  const sourceId=String(form.get('sourceId')||'').trim();const rawChunk=Number(form.get('chunkIndex')||0);if(!Number.isInteger(rawChunk)||rawChunk<0)return NextResponse.json({error:'Invalid transcript chunk index.'},{status:400});
  const chunkIndex=rawChunk;const startSeconds=Number(form.get('startSeconds')||0);const endSeconds=Number(form.get('endSeconds')||0);if(Number.isFinite(startSeconds)&&Number.isFinite(endSeconds)&&endSeconds>0&&endSeconds<startSeconds)return NextResponse.json({error:'Transcript chunk end time cannot be before its start time.'},{status:400});
  let source=null;
  if(sourceId){source=await getMediaSource(session.user.id,sourceId);if(!source)return NextResponse.json({error:'That transcript source is unavailable for this account. Restart the import instead of attaching a chunk to another source.'},{status:404})}
  else source=await createMediaSource(session.user.id,{title:String(form.get('title')||'Imported media').trim().slice(0,255)||'Imported media',sourceType:'upload',mimeType:file.type||'application/octet-stream'});
  activeSourceId=source.id;
  const filename=safeFilename(String(form.get('filename')||`chunk-${chunkIndex}`),file.type);
  const text=(await transcribeBlob(resolveAiKey(request),file,filename)).trim();if(!text)throw new Error('The transcription provider returned an empty transcript for this part.');
  await saveTranscriptChunk(session.user.id,source.id,{chunkIndex,text,startSeconds:Number.isFinite(startSeconds)?startSeconds:null,endSeconds:Number.isFinite(endSeconds)?endSeconds:null});
  await setMediaStatus(session.user.id,source.id,String(form.get('finalChunk'))==='true'?'transcribed':'transcribing');
  return NextResponse.json({data:{sourceId:source.id,chunkIndex,text}});
 }catch(error){if(activeSourceId)await setMediaStatus(session.user.id,activeSourceId,'error',error instanceof Error?error.message:'Transcription failed.').catch(()=>null);return NextResponse.json({error:error instanceof Error?error.message:'Transcription failed.'},{status:500})}
}
