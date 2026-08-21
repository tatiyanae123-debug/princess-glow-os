import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export const runtime='nodejs';

const OPENAI_VOICES=['coral','alloy','ash','ballad','echo','fable','nova','onyx','sage','shimmer','verse'];

export async function GET(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});
 const elevenKey=request.headers.get('x-glow-eleven-key')?.trim()||process.env.ELEVENLABS_API_KEY?.trim()||'';
 const openAiKey=request.headers.get('x-glow-openai-key')?.trim()||process.env.OPENAI_API_KEY?.trim()||'';
 let elevenVoices:Array<{id:string;name:string;category?:string;description?:string}>=[];
 if(elevenKey){
  try{
   const response=await fetch('https://api.elevenlabs.io/v1/voices',{headers:{'xi-api-key':elevenKey},cache:'no-store'});
   if(response.ok){const payload=await response.json() as {voices?:Array<{voice_id:string;name:string;category?:string;description?:string}>};elevenVoices=(payload.voices??[]).slice(0,120).map(voice=>({id:voice.voice_id,name:voice.name,category:voice.category,description:voice.description}))}
  }catch{/* provider availability is reported below */}
 }
 return NextResponse.json({data:{providers:{elevenlabs:Boolean(elevenKey),openai:Boolean(openAiKey),browser:true},elevenlabs:elevenVoices,openai:OPENAI_VOICES.map(name=>({id:name,name:name[0].toUpperCase()+name.slice(1)}))}});
}
