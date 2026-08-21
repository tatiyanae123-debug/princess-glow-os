import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime='nodejs';
export const maxDuration=60;

type Provider='auto'|'elevenlabs'|'openai'|'browser';

type Body={text?:string;provider?:Provider;voice?:string;quality?:'balanced'|'expressive'|'fast';speed?:number;style?:number};

function cleanText(value:string){return value.replace(/\s+/g,' ').trim().slice(0,5000)}
function clamp(value:number,min:number,max:number){return Math.min(max,Math.max(min,value))}

async function elevenLabsSpeech(key:string,input:{text:string;voice:string;quality:string;speed:number;style:number}){
 const model=input.quality==='expressive'?'eleven_v3':input.quality==='fast'?'eleven_flash_v2_5':'eleven_flash_v2_5';
 const response=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(input.voice)}/stream?output_format=mp3_44100_128`,{
  method:'POST',headers:{'xi-api-key':key,'Content-Type':'application/json','Accept':'audio/mpeg'},
  body:JSON.stringify({text:input.text,model_id:model,voice_settings:{stability:input.quality==='expressive'?0.38:0.5,similarity_boost:0.82,style:clamp(input.style,0,1),use_speaker_boost:true,speed:clamp(input.speed,.7,1.2)}}),
 });
 if(!response.ok)throw new Error(`ElevenLabs voice request failed (${response.status}).`);
 return new NextResponse(response.body,{status:200,headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store','X-Glow-Voice-Provider':'elevenlabs','X-Glow-Voice-Model':model}});
}

async function openAiSpeech(key:string,input:{text:string;voice:string;speed:number}){
 const response=await fetch('https://api.openai.com/v1/audio/speech',{
  method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},
  body:JSON.stringify({model:'gpt-4o-mini-tts',voice:input.voice||'coral',input:input.text,response_format:'mp3',speed:clamp(input.speed,.7,1.2),instructions:'Speak like a warm, emotionally intelligent human companion. Use natural phrasing, subtle pauses, varied emphasis, and calm conversational timing. Never sound like an announcer or robotic assistant.'}),
 });
 if(!response.ok)throw new Error(`OpenAI voice request failed (${response.status}).`);
 return new NextResponse(response.body,{status:200,headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store','X-Glow-Voice-Provider':'openai','X-Glow-Voice-Model':'gpt-4o-mini-tts'}});
}

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  const body=await request.json() as Body;const text=cleanText(body.text??'');if(!text)return NextResponse.json({error:'Nothing to speak.'},{status:400});
  if((body.provider??'auto')==='browser')return NextResponse.json({error:'Browser voice requested.'},{status:409});
  const elevenKey=request.headers.get('x-glow-eleven-key')?.trim()||process.env.ELEVENLABS_API_KEY?.trim()||'';
  const openAiKey=request.headers.get('x-glow-openai-key')?.trim()||process.env.OPENAI_API_KEY?.trim()||'';
  const requested=body.provider??'auto';const quality=body.quality??'balanced';const speed=Number.isFinite(body.speed)?Number(body.speed):1;const style=Number.isFinite(body.style)?Number(body.style):.35;
  if((requested==='elevenlabs'||requested==='auto')&&elevenKey){
   const voice=(body.voice||process.env.ELEVENLABS_VOICE_ID||'JBFqnCBsd6RMkjVDRZzb').trim();
   try{return await elevenLabsSpeech(elevenKey,{text,voice,quality,speed,style})}catch(error){if(requested==='elevenlabs')throw error}
  }
  if((requested==='openai'||requested==='auto')&&openAiKey)return openAiSpeech(openAiKey,{text,voice:body.voice||'coral',speed});
  return NextResponse.json({error:'No neural voice provider is configured. Glow will use the device voice instead.',code:'NO_VOICE_PROVIDER'},{status:503});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Voice generation failed.'},{status:500})}
}
