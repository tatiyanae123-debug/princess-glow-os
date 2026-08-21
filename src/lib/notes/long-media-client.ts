'use client';

const DIRECT_LIMIT=23*1024*1024;
const TARGET_RATE=16000;
const CHUNK_SECONDS=8*60;

function writeAscii(view:DataView,offset:number,text:string){for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i))}
function safeBaseName(name:string){const raw=(name||'media').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._ -]/g,'-').replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g,'-').replace(/\s+/g,' ').trim();return raw.slice(0,160)||'media'}
function titleFromName(name:string){return safeBaseName(name).replace(/\.[^.]+$/,'').trim()||'Imported media'}
function safeApiKey(value:string|undefined){const key=(value??'').trim();if(!key)return undefined;if(!/^[\x21-\x7E]+$/.test(key))throw new Error('Your saved transcription key contains unsupported characters. Clear it in Transcription Settings and paste it again.');return key}
function friendlyClientError(error:unknown){const message=error instanceof Error?error.message:String(error??'');if(/string did not match the expected pattern/i.test(message))return 'Glow could not prepare that video in Safari. I blocked the raw browser error; choose the video again and Glow will retry with a cleaned filename and request.';if(/load failed|failed to fetch|network/i.test(message))return 'The upload connection was interrupted. Keep this page open and try the same file again.';if(/notallowed|permission/i.test(message))return 'Safari blocked access to that media file. Choose it again from Photos or Files and allow access when asked.';return message||'Glow could not prepare this media file.'}
function encodeWav(buffer:AudioBuffer,start:number,end:number){
 const sourceRate=buffer.sampleRate;const startFrame=Math.floor(start*sourceRate),endFrame=Math.min(buffer.length,Math.floor(end*sourceRate));const srcLength=Math.max(0,endFrame-startFrame);if(srcLength<=0)throw new Error('This media file did not expose a usable audio track.');const outLength=Math.max(1,Math.floor(srcLength*TARGET_RATE/sourceRate));const bytes=new ArrayBuffer(44+outLength*2);const view=new DataView(bytes);writeAscii(view,0,'RIFF');view.setUint32(4,36+outLength*2,true);writeAscii(view,8,'WAVE');writeAscii(view,12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,TARGET_RATE,true);view.setUint32(28,TARGET_RATE*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);writeAscii(view,36,'data');view.setUint32(40,outLength*2,true);
 const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));
 for(let i=0;i<outLength;i++){const src=startFrame+Math.min(srcLength-1,Math.floor(i*sourceRate/TARGET_RATE));let sample=0;for(const channel of channels)sample+=channel[src]??0;sample/=Math.max(1,channels.length);sample=Math.max(-1,Math.min(1,sample));view.setInt16(44+i*2,sample<0?sample*0x8000:sample*0x7fff,true)}
 return new Blob([bytes],{type:'audio/wav'});
}

async function apiUpload(input:{file:Blob;filename:string;title:string;sourceId?:string;chunkIndex:number;startSeconds:number;endSeconds:number;finalChunk:boolean;apiKey?:string}){
 try{
  const filename=safeBaseName(input.filename);const title=titleFromName(input.title);const key=safeApiKey(input.apiKey);const form=new FormData();form.append('file',input.file,filename);form.append('filename',filename);form.append('title',title);if(input.sourceId)form.append('sourceId',input.sourceId);form.append('chunkIndex',String(input.chunkIndex));form.append('startSeconds',String(Math.floor(input.startSeconds)));form.append('endSeconds',String(Math.floor(input.endSeconds)));form.append('finalChunk',String(input.finalChunk));
  const headers:Record<string,string>={};if(key)headers['x-glow-ai-key']=key;
  const res=await fetch('/api/notes/transcribe',{method:'POST',headers,body:form});const raw=await res.text();let json:{error?:string;data?:{sourceId:string;chunkIndex:number;text:string}}={};try{json=raw?JSON.parse(raw) as typeof json:{}}catch{if(!res.ok)throw new Error('Glow received an unreadable upload response. Please retry the same file.');}
  if(!res.ok)throw new Error(json.error||`Transcription upload failed (${res.status}).`);if(!json.data?.sourceId)throw new Error('Glow did not receive a transcript source from the upload. Please retry.');return json.data;
 }catch(error){throw new Error(friendlyClientError(error))}
}

async function transcribeDecodedBuffer(buffer:AudioBuffer,file:File,apiKey:string|undefined,onProgress:(message:string,ratio:number)=>void){
 const total=buffer.duration;if(!Number.isFinite(total)||total<=0)throw new Error('Glow could not find a playable audio track in this file.');const count=Math.max(1,Math.ceil(total/CHUNK_SECONDS));let sourceId:string|undefined;const base=titleFromName(file.name);
 for(let i=0;i<count;i++){const start=i*CHUNK_SECONDS,end=Math.min(total,(i+1)*CHUNK_SECONDS);onProgress(`Transcribing part ${i+1} of ${count}…`,.05+.9*(i/count));const wav=encodeWav(buffer,start,end);const row=await apiUpload({file:wav,filename:`${base}-part-${i+1}.wav`,title:base,sourceId,chunkIndex:i,startSeconds:start,endSeconds:end,finalChunk:i===count-1,apiKey});sourceId=row.sourceId}
 if(!sourceId)throw new Error('Glow could not create the transcript source.');return sourceId;
}

export async function transcribeMediaFile(file:File,apiKey:string|undefined,onProgress:(message:string,ratio:number)=>void){
 try{
  if(!(file instanceof File)||file.size<=0)throw new Error('That media file is empty or no longer available. Choose it again.');
  const cleanedName=safeBaseName(file.name);const cleanedTitle=titleFromName(cleanedName);
  if(file.size<=DIRECT_LIMIT){onProgress('Uploading media for transcription…',.15);const row=await apiUpload({file,filename:cleanedName,title:cleanedTitle,chunkIndex:0,startSeconds:0,endSeconds:0,finalChunk:true,apiKey});onProgress('Transcript complete.',1);return row.sourceId}
  onProgress('Preparing long media locally…',.03);
  const BrowserAudioContext=window.AudioContext||((window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext);if(!BrowserAudioContext)throw new Error('This browser cannot prepare long media locally. Try the same file in Safari after updating iOS, or export the video audio as M4A.');
  const context=new BrowserAudioContext();
  try{if(context.state==='suspended')await context.resume().catch(()=>undefined);const buffer=await context.decodeAudioData(await file.arrayBuffer());const sourceId=await transcribeDecodedBuffer(buffer,file,apiKey,onProgress);onProgress('All parts transcribed and recombined.',1);return sourceId}
  catch(error){const raw=error instanceof Error?error.message:'';if(file.type.startsWith('video/'))throw new Error('Safari could not extract the audio track from this large video locally. Try the same video again after it finishes downloading from iCloud, or export/share it as a smaller MP4/MOV or M4A. Glow will never show the raw Safari pattern error again.');throw new Error(friendlyClientError(raw))}
  finally{void context.close().catch(()=>undefined)}
 }catch(error){throw new Error(friendlyClientError(error))}
}
