'use client';

const DIRECT_LIMIT=22*1024*1024;
const TARGET_RATE=16000;
const CHUNK_SECONDS=8*60;
const PARALLEL_TRANSCRIPTIONS=2;
const DECODE_TIMEOUT_MS=120000;
const UPLOAD_TIMEOUT_MS=285000;

function writeAscii(view:DataView,offset:number,text:string){for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i))}
function safeBaseName(name:string){const raw=(name||'media').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._ -]/g,'-').replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g,'-').replace(/\s+/g,' ').trim();return raw.slice(0,140)||'media'}
function extensionForMime(type:string){const t=(type||'').toLowerCase();if(t.includes('quicktime'))return'.mov';if(t==='video/mp4')return'.mp4';if(t.includes('webm'))return'.webm';if(t.includes('mpeg'))return t.startsWith('audio/')?'.mp3':'.mpg';if(t.includes('wav'))return'.wav';if(t.includes('aac'))return'.aac';if(t.includes('m4a'))return'.m4a';if(t==='audio/mp4')return'.m4a';if(t.includes('ogg'))return'.ogg';return''}
function normalizedFilename(name:string,type:string){const base=safeBaseName(name);if(/\.[a-z0-9]{2,5}$/i.test(base))return base;return `${base}${extensionForMime(type)||'.media'}`}
function titleFromName(name:string){return safeBaseName(name).replace(/\.[^.]+$/,'').trim()||'Imported media'}
function safeApiKey(value:string|undefined){const key=(value??'').trim();if(!key)return undefined;if(!/^[\x21-\x7E]+$/.test(key))throw new Error('Your saved transcription key contains unsupported characters. Clear it in Transcription Settings and paste it again.');return key}
function friendlyClientError(error:unknown){const message=error instanceof Error?error.message:String(error??'');if(/abort|timed out|timeout/i.test(message))return 'Glow stopped a stalled transcription instead of leaving it frozen. Choose the video again and Glow will retry from a clean request.';if(/string did not match the expected pattern/i.test(message))return 'Glow corrected a Safari media-format problem. Choose the video again and it will retry with a safe filename.';if(/load failed|failed to fetch|network/i.test(message))return 'The upload connection was interrupted. Glow stopped the spinner safely; choose the same file again to retry.';if(/notallowed|permission/i.test(message))return 'Safari blocked access to that media file. Choose it again from Photos or Files and allow access when asked.';return message||'Glow could not prepare this media file.'}
function sleep(ms:number){return new Promise(resolve=>window.setTimeout(resolve,ms))}
async function withTimeout<T>(promise:Promise<T>,ms:number,label:string){return await Promise.race([promise,(async()=>{await sleep(ms);throw new Error(`${label} timed out.`)})()])}

function encodeWav(buffer:AudioBuffer,start:number,end:number){
 const sourceRate=buffer.sampleRate;const startFrame=Math.floor(start*sourceRate),endFrame=Math.min(buffer.length,Math.floor(end*sourceRate));const srcLength=Math.max(0,endFrame-startFrame);if(srcLength<=0)throw new Error('This media file did not expose a usable audio track.');const outLength=Math.max(1,Math.floor(srcLength*TARGET_RATE/sourceRate));const bytes=new ArrayBuffer(44+outLength*2);const view=new DataView(bytes);writeAscii(view,0,'RIFF');view.setUint32(4,36+outLength*2,true);writeAscii(view,8,'WAVE');writeAscii(view,12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,TARGET_RATE,true);view.setUint32(28,TARGET_RATE*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);writeAscii(view,36,'data');view.setUint32(40,outLength*2,true);const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));for(let i=0;i<outLength;i++){const src=startFrame+Math.min(srcLength-1,Math.floor(i*sourceRate/TARGET_RATE));let sample=0;for(const channel of channels)sample+=channel[src]??0;sample/=Math.max(1,channels.length);sample=Math.max(-1,Math.min(1,sample));view.setInt16(44+i*2,sample<0?sample*0x8000:sample*0x7fff,true)}return new Blob([bytes],{type:'audio/wav'})
}

async function apiUpload(input:{file:Blob;filename:string;title:string;sourceId?:string;chunkIndex:number;startSeconds:number;endSeconds:number;finalChunk:boolean;apiKey?:string}){
 const filename=normalizedFilename(input.filename,input.file.type);const title=titleFromName(input.title);const key=safeApiKey(input.apiKey);const form=new FormData();form.append('file',input.file,filename);form.append('filename',filename);form.append('title',title);if(input.sourceId)form.append('sourceId',input.sourceId);form.append('chunkIndex',String(input.chunkIndex));form.append('startSeconds',String(Math.floor(input.startSeconds)));form.append('endSeconds',String(Math.floor(input.endSeconds)));form.append('finalChunk',String(input.finalChunk));const headers:Record<string,string>={};if(key)headers['x-glow-ai-key']=key;
 const controller=new AbortController();const timer=window.setTimeout(()=>controller.abort(),UPLOAD_TIMEOUT_MS);
 try{const res=await fetch('/api/notes/transcribe',{method:'POST',headers,body:form,signal:controller.signal});const raw=await res.text();let json:{error?:string;data?:{sourceId:string;chunkIndex:number;text:string}}={};try{json=raw?JSON.parse(raw) as typeof json:{}}catch{if(!res.ok)throw new Error('Glow received an unreadable upload response. Please retry the same file.')}if(!res.ok)throw new Error(json.error||`Transcription upload failed (${res.status}).`);if(!json.data?.sourceId)throw new Error('Glow did not receive a transcript source from the upload. Please retry.');return json.data}catch(error){throw new Error(friendlyClientError(error))}finally{window.clearTimeout(timer)}
}

async function transcribeDecodedBuffer(buffer:AudioBuffer,file:File,apiKey:string|undefined,onProgress:(message:string,ratio:number)=>void){
 const total=buffer.duration;if(!Number.isFinite(total)||total<=0)throw new Error('Glow could not find a playable audio track in this file.');const count=Math.max(1,Math.ceil(total/CHUNK_SECONDS));const base=titleFromName(file.name);const firstEnd=Math.min(total,CHUNK_SECONDS);onProgress(`Transcribing part 1 of ${count}…`,.12);const firstWav=encodeWav(buffer,0,firstEnd);const first=await apiUpload({file:firstWav,filename:`${base}-part-1.wav`,title:base,chunkIndex:0,startSeconds:0,endSeconds:firstEnd,finalChunk:count===1,apiKey});const sourceId=first.sourceId;if(count===1)return sourceId;
 let next=1,completed=1;const worker=async()=>{while(true){const i=next++;if(i>=count)return;const start=i*CHUNK_SECONDS,end=Math.min(total,(i+1)*CHUNK_SECONDS);onProgress(`Transcribing · ${completed} of ${count} parts complete…`,.12+.82*(completed/count));const wav=encodeWav(buffer,start,end);await apiUpload({file:wav,filename:`${base}-part-${i+1}.wav`,title:base,sourceId,chunkIndex:i,startSeconds:start,endSeconds:end,finalChunk:i===count-1,apiKey});completed++;onProgress(`Transcribing · ${completed} of ${count} parts complete…`,.12+.82*(completed/count))}};await Promise.all(Array.from({length:Math.min(PARALLEL_TRANSCRIPTIONS,count-1)},()=>worker()));return sourceId
}

export async function transcribeMediaFile(file:File,apiKey:string|undefined,onProgress:(message:string,ratio:number)=>void){
 try{
  if(!(file instanceof File)||file.size<=0)throw new Error('That media file is empty or no longer available. Choose it again.');
  const cleanedName=normalizedFilename(file.name,file.type);const cleanedTitle=titleFromName(cleanedName);
  if(file.size<=DIRECT_LIMIT){onProgress('Uploading video…',.08);const row=await apiUpload({file,filename:cleanedName,title:cleanedTitle,chunkIndex:0,startSeconds:0,endSeconds:0,finalChunk:true,apiKey});onProgress('Transcript complete.',1);return row.sourceId}
  onProgress('Reading the video from your device…',.03);
  const BrowserAudioContext=window.AudioContext||((window as Window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext);if(!BrowserAudioContext)throw new Error('This browser cannot prepare long media locally.');
  const context=new BrowserAudioContext();let heartbeat:number|undefined;
  try{
   if(context.state==='suspended')await context.resume().catch(()=>undefined);
   let tick=0;heartbeat=window.setInterval(()=>{tick++;onProgress(tick%2?'Preparing audio from the video…':'Still preparing audio — Glow has not frozen.',Math.min(.09,.035+tick*.003))},3500);
   const bytes=await withTimeout(file.arrayBuffer(),DECODE_TIMEOUT_MS,'Reading this video');
   const buffer=await withTimeout(context.decodeAudioData(bytes.slice(0)),DECODE_TIMEOUT_MS,'Decoding this video audio');
   if(heartbeat)window.clearInterval(heartbeat);heartbeat=undefined;
   onProgress('Audio ready. Starting transcription…',.1);
   const sourceId=await transcribeDecodedBuffer(buffer,file,apiKey,onProgress);onProgress('All parts transcribed and recombined.',1);return sourceId
  }catch(error){const raw=error instanceof Error?error.message:'';if(file.type.startsWith('video/'))throw new Error(/timed out|abort/i.test(raw)?'This video stalled while Safari was decoding it. Glow stopped the stuck job automatically. Make sure the video is fully downloaded from iCloud, then choose it again.':'Safari could not extract the audio track from this video. Glow stopped safely instead of hanging. Make sure the video is fully downloaded from iCloud, then choose it again.');throw new Error(friendlyClientError(raw))}finally{if(heartbeat)window.clearInterval(heartbeat);void context.close().catch(()=>undefined)}
 }catch(error){throw new Error(friendlyClientError(error))}
}
