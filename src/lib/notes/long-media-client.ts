'use client';

const DIRECT_LIMIT=23*1024*1024;
const TARGET_RATE=16000;
const CHUNK_SECONDS=8*60;

function writeAscii(view:DataView,offset:number,text:string){for(let i=0;i<text.length;i++)view.setUint8(offset+i,text.charCodeAt(i))}
function encodeWav(buffer:AudioBuffer,start:number,end:number){
 const sourceRate=buffer.sampleRate;const startFrame=Math.floor(start*sourceRate),endFrame=Math.min(buffer.length,Math.floor(end*sourceRate));const srcLength=Math.max(0,endFrame-startFrame);const outLength=Math.max(1,Math.floor(srcLength*TARGET_RATE/sourceRate));const bytes=new ArrayBuffer(44+outLength*2);const view=new DataView(bytes);writeAscii(view,0,'RIFF');view.setUint32(4,36+outLength*2,true);writeAscii(view,8,'WAVE');writeAscii(view,12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,TARGET_RATE,true);view.setUint32(28,TARGET_RATE*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);writeAscii(view,36,'data');view.setUint32(40,outLength*2,true);
 const channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));
 for(let i=0;i<outLength;i++){const src=startFrame+Math.min(srcLength-1,Math.floor(i*sourceRate/TARGET_RATE));let sample=0;for(const channel of channels)sample+=channel[src]??0;sample/=Math.max(1,channels.length);sample=Math.max(-1,Math.min(1,sample));view.setInt16(44+i*2,sample<0?sample*0x8000:sample*0x7fff,true)}
 return new Blob([bytes],{type:'audio/wav'});
}

async function apiUpload(input:{file:Blob;filename:string;title:string;sourceId?:string;chunkIndex:number;startSeconds:number;endSeconds:number;finalChunk:boolean;apiKey?:string}){
 const form=new FormData();form.append('file',input.file,input.filename);form.append('filename',input.filename);form.append('title',input.title);if(input.sourceId)form.append('sourceId',input.sourceId);form.append('chunkIndex',String(input.chunkIndex));form.append('startSeconds',String(Math.floor(input.startSeconds)));form.append('endSeconds',String(Math.floor(input.endSeconds)));form.append('finalChunk',String(input.finalChunk));
 const res=await fetch('/api/notes/transcribe',{method:'POST',headers:input.apiKey?{'x-glow-ai-key':input.apiKey}:{},body:form});const json=await res.json();if(!res.ok)throw new Error(json.error||'Transcription failed.');return json.data as {sourceId:string;chunkIndex:number;text:string};
}

export async function transcribeMediaFile(file:File,apiKey:string|undefined,onProgress:(message:string,ratio:number)=>void){
 if(file.size<=DIRECT_LIMIT){onProgress('Uploading media for transcription…',.15);const row=await apiUpload({file,filename:file.name,title:file.name.replace(/\.[^.]+$/,''),chunkIndex:0,startSeconds:0,endSeconds:0,finalChunk:true,apiKey});onProgress('Transcript complete.',1);return row.sourceId}
 onProgress('Preparing long media locally…',.03);
 const context=new AudioContext();
 try{
  const buffer=await context.decodeAudioData(await file.arrayBuffer());const total=buffer.duration;const count=Math.max(1,Math.ceil(total/CHUNK_SECONDS));let sourceId:string|undefined;
  for(let i=0;i<count;i++){const start=i*CHUNK_SECONDS,end=Math.min(total,(i+1)*CHUNK_SECONDS);onProgress(`Transcribing part ${i+1} of ${count}…`,.05+.9*(i/count));const wav=encodeWav(buffer,start,end);const row=await apiUpload({file:wav,filename:`${file.name.replace(/\.[^.]+$/,'')}-part-${i+1}.wav`,title:file.name.replace(/\.[^.]+$/,''),sourceId,chunkIndex:i,startSeconds:start,endSeconds:end,finalChunk:i===count-1,apiKey});sourceId=row.sourceId}
  onProgress('All parts transcribed and recombined.',1);return sourceId!;
 }catch(error){throw new Error(`Glow could not decode this large media file on this device. ${error instanceof Error?error.message:''} Try the original audio file, a smaller export, or the AccurateScribe fallback.`)}finally{void context.close()}
}
