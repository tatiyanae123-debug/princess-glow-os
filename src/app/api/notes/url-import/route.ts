import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createMediaSource, saveTranscriptChunk, setMediaStatus } from '@/lib/data/note-transcripts';
import { resolveAiKey, transcribeBlob } from '@/lib/notes/transcript-ai';
import { resolvePublicVideo } from '@/lib/notes/url-media';

export const runtime='nodejs';
export const maxDuration=300;

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 let sourceId='';
 try{
  const body=await request.json() as {url?:string};const raw=body.url?.trim();if(!raw)return NextResponse.json({error:'Paste a video link first.'},{status:400});
  let parsed:URL;try{parsed=new URL(raw)}catch{return NextResponse.json({error:'That is not a valid URL.'},{status:400})}
  if(parsed.protocol!=='https:')return NextResponse.json({error:'Use a public HTTPS YouTube, TikTok, or Instagram video link.'},{status:400});
  const resolved=await resolvePublicVideo(parsed.toString());
  const source=await createMediaSource(session.user.id,{title:resolved.title,sourceType:'url',sourceUrl:parsed.toString(),platform:resolved.platform,mimeType:resolved.kind==='transcript'?'text/vtt':undefined});sourceId=source.id;
  if(resolved.kind==='transcript'){
   if(!resolved.text.trim())throw new Error('The public caption track was empty.');await saveTranscriptChunk(session.user.id,source.id,{chunkIndex:0,text:resolved.text.trim(),startSeconds:0});await setMediaStatus(session.user.id,source.id,'transcribed');return NextResponse.json({data:{sourceId:source.id,title:source.title,platform:source.platform,status:'transcribed'}});
  }
  const media=await fetch(resolved.mediaUrl,{redirect:'follow',headers:{'User-Agent':'Mozilla/5.0 GlowOS/1.0'},signal:AbortSignal.timeout(30000)});if(!media.ok)throw new Error(`Public media stream returned ${media.status}.`);
  const length=Number(media.headers.get('content-length')||0);if(length>24*1024*1024)throw new Error('This public media file is larger than Glow can safely proxy through one server request. Save/upload the video in Notes so long-media chunking can process it.');
  const contentType=media.headers.get('content-type')??'';if(contentType&&!/^audio\//i.test(contentType)&&!/^video\//i.test(contentType)&&!contentType.includes('octet-stream'))throw new Error('The public link exposed something other than playable audio/video media.');
  const blob=await media.blob();if(blob.size===0)throw new Error('The public media stream was empty.');if(blob.size>24*1024*1024)throw new Error('This public media file is larger than Glow can safely proxy through one server request. Save/upload the video in Notes so long-media chunking can process it.');
  const text=(await transcribeBlob(resolveAiKey(request),blob,`${resolved.platform}-video.${blob.type.includes('mp4')?'mp4':'media'}`)).trim();if(!text)throw new Error('The transcription provider returned an empty transcript.');await saveTranscriptChunk(session.user.id,source.id,{chunkIndex:0,text,startSeconds:0});await setMediaStatus(session.user.id,source.id,'transcribed');
  return NextResponse.json({data:{sourceId:source.id,title:source.title,platform:source.platform,status:'transcribed'}});
 }catch(error){const message=error instanceof Error?error.message:'Link import failed.';if(sourceId)await setMediaStatus(session.user.id,sourceId,'error',message).catch(()=>null);return NextResponse.json({error:message},{status:500})}
}
