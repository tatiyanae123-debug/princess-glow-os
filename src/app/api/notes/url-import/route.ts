import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createMediaSource, saveTranscriptChunk, setMediaStatus } from '@/lib/data/note-transcripts';
import { resolveAiKey, transcribeBlob } from '@/lib/notes/transcript-ai';
import { resolvePublicVideo } from '@/lib/notes/url-media';

export const runtime='nodejs';
export const maxDuration=300;

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const body=await request.json() as {url?:string};const raw=body.url?.trim();if(!raw)return NextResponse.json({error:'Paste a video link first.'},{status:400});
  let parsed:URL;try{parsed=new URL(raw)}catch{return NextResponse.json({error:'That is not a valid URL.'},{status:400})}
  if(!['http:','https:'].includes(parsed.protocol))return NextResponse.json({error:'Only http/https video links are supported.'},{status:400});
  const resolved=await resolvePublicVideo(parsed.toString());
  const source=await createMediaSource(session.user.id,{title:resolved.title,sourceType:'url',sourceUrl:parsed.toString(),platform:resolved.platform,mimeType:resolved.kind==='transcript'?'text/vtt':undefined});
  if(resolved.kind==='transcript'){
   await saveTranscriptChunk(session.user.id,source.id,{chunkIndex:0,text:resolved.text,startSeconds:0});await setMediaStatus(session.user.id,source.id,'transcribed');return NextResponse.json({data:{sourceId:source.id,title:source.title,platform:source.platform,status:'transcribed'}});
  }
  const media=await fetch(resolved.mediaUrl,{redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 GlowOS/1.0'}});if(!media.ok)throw new Error(`Public media stream returned ${media.status}.`);
  const length=Number(media.headers.get('content-length')||0);if(length>24*1024*1024)throw new Error('This public media file is larger than Glow can safely proxy through one server request. Save/upload the video in Notes so long-media chunking can process it.');
  const blob=await media.blob();if(blob.size>24*1024*1024)throw new Error('This public media file is larger than Glow can safely proxy through one server request. Save/upload the video in Notes so long-media chunking can process it.');
  const text=await transcribeBlob(resolveAiKey(request),blob,`${resolved.platform}-video.${blob.type.includes('mp4')?'mp4':'media'}`);await saveTranscriptChunk(session.user.id,source.id,{chunkIndex:0,text,startSeconds:0});await setMediaStatus(session.user.id,source.id,'transcribed');
  return NextResponse.json({data:{sourceId:source.id,title:source.title,platform:source.platform,status:'transcribed'}});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Link import failed.'},{status:500})}
}
