import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildPersonalContext } from '@/lib/intelligence/context';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;

type VisualSize='1024x1024'|'1024x1536'|'1536x1024';

type Body={request?:string;page?:string;size?:VisualSize;style?:'glow'|'minimal'|'bold'|'photo'};

type ImagePayload={data?:Array<{b64_json?:string;url?:string;revised_prompt?:string}>;error?:{message?:string}};

type ResponsePayload={output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};

function extractText(payload:ResponsePayload){
 if(typeof payload.output_text==='string'&&payload.output_text.trim())return payload.output_text.trim();
 for(const item of payload.output??[])for(const content of item.content??[])if(content.type==='output_text'&&content.text?.trim())return content.text.trim();
 return '';
}

function compactContext(context:Awaited<ReturnType<typeof buildPersonalContext>>){
 return {
  now:context.generatedAt.toISOString(),
  today:context.todayLabel,
  dayPart:context.dayPart,
  nextEvent:context.nextEvent?{title:context.nextEvent.title,startAt:context.nextEvent.startAt.toISOString(),allDay:context.nextEvent.allDay}:null,
  events:context.todaysEvents.slice(0,14).map(item=>({title:item.title,startAt:item.startAt.toISOString(),allDay:item.allDay})),
  tasks:context.unfinishedTasks.slice(0,18).map(item=>({title:item.title,priority:item.priority,dueDate:item.dueDate?.toISOString()??null})),
  overdue:context.overdueTasks.slice(0,10).map(item=>({title:item.title,dueDate:item.dueDate.toISOString()})),
  reminders:context.appleReminders.filter(item=>!item.completed).slice(0,20).map(item=>({title:item.title,dueAt:item.dueAt?.toISOString()??null,essential:item.essential,domain:item.domain})),
  habits:context.habits.map(item=>({name:item.name,completedToday:item.completedToday})),
  routines:context.routinesForToday.map(item=>({name:item.name,timeOfDay:item.timeOfDay})),
  goals:context.activeGoals.slice(0,10).map(item=>item.title),
  recommendations:context.recommendations.slice(0,8).map(item=>({title:item.title,reason:item.reason,priority:item.priority})),
 };
}

async function buildBrief(request:string,page:string|undefined,context:Awaited<ReturnType<typeof buildPersonalContext>>,key:string){
 const evidence=compactContext(context);
 const instructions=`You are the visual-planning director for Glow OS. Turn the user's request and verified Glow data into a precise image-generation brief for a genuinely useful visual artifact. The artifact may be a schedule, routine card, workout card, grocery list, checklist, step-by-step instruction card, habit board, meal plan, beauty sequence, cleaning plan, study guide, next-action card, infographic, or a normal creative image.\n\nRules:\n- Never invent personal facts, appointments, tasks, ingredients, workout steps, or instructions that are not present in the user's request or verified context.\n- If the user requests a practical list/card/schedule, prioritize readable typography, exact ordering, strong hierarchy, large text, generous spacing, and practical usability over decorative art.\n- Preserve important wording and times exactly.\n- If there is not enough verified data for a requested list, use only what is available rather than filling gaps.\n- For Glow-style productivity visuals use an ethereal pearlescent, translucent, romantic, calm interface aesthetic with soft light and subtle botanical/prismatic details, but keep text high contrast.\n- For an ordinary creative-picture request, follow the user's requested visual style instead.\n- Return only the final image-generation brief, no preamble.`;
 const input=`CURRENT PAGE: ${page??'unknown'}\nUSER REQUEST: ${request}\n\nVERIFIED GLOW CONTEXT:\n${JSON.stringify(evidence)}`;
 try{
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.GLOW_VISUAL_PLANNER_MODEL||'gpt-5.6-luna',instructions,input,max_output_tokens:1000})});
  if(!response.ok)return request;
  return extractText(await response.json() as ResponsePayload)||request;
 }catch{return request}
}

export async function POST(request:Request){
 const session=await auth();
 if(!session?.user?.id)return NextResponse.json({ok:false,error:'Unauthorized'},{status:401});
 let body:Body;
 try{body=await request.json() as Body}catch{return NextResponse.json({ok:false,error:'Invalid request'},{status:400})}
 const userRequest=String(body.request??'').trim();
 if(!userRequest)return NextResponse.json({ok:false,error:'Tell Glow what you want visualized.'},{status:400});
 const key=request.headers.get('x-glow-openai-key')?.trim()||process.env.OPENAI_API_KEY?.trim()||'';
 if(!key)return NextResponse.json({ok:false,error:'Glow needs an OpenAI API key before it can generate visuals.'},{status:503});
 const size:VisualSize=['1024x1024','1024x1536','1536x1024'].includes(String(body.size))?body.size as VisualSize:'1024x1536';
 const context=await buildPersonalContext(session.user.id);
 const brief=await buildBrief(userRequest,body.page,context,key);
 const styleNote=body.style==='minimal'?'Clean editorial minimalism, extremely readable, almost no decoration.':body.style==='bold'?'Bold modern poster design, clear blocks, high legibility, energetic hierarchy.':body.style==='photo'?'Photorealistic where appropriate; if the request is informational, still preserve exact readable text and layout.':'Glow OS visual language: pearlescent ivory, misty blush, translucent glass, soft prismatic light, elegant serif accents, calm feminine futurism, restrained botanical details, high readability.';
 const prompt=`${brief}\n\nVISUAL DIRECTION: ${styleNote}\n\nCRITICAL: If this is a schedule, routine, workout, checklist, grocery list, habit board, or instruction card, all visible text must be large, clean, correctly spelled, and easy to follow on an iPad or phone. Do not add fake items, fake times, fake steps, or decorative filler that changes the meaning.`;
 try{
  const response=await fetch('https://api.openai.com/v1/images/generations',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.GLOW_IMAGE_MODEL||'gpt-image-2',prompt,size,quality:'medium',output_format:'jpeg',output_compression:85})});
  const payload=await response.json() as ImagePayload;
  if(!response.ok){console.error('[api/glow/visualize]',payload?.error?.message??response.statusText);return NextResponse.json({ok:false,error:payload?.error?.message??'Glow could not generate that visual.'},{status:response.status})}
  const item=payload.data?.[0];
  const image=item?.b64_json?`data:image/jpeg;base64,${item.b64_json}`:item?.url??null;
  if(!image)return NextResponse.json({ok:false,error:'The image model finished without returning an image.'},{status:502});
  return NextResponse.json({ok:true,image,brief,revisedPrompt:item?.revised_prompt??null,size,model:process.env.GLOW_IMAGE_MODEL||'gpt-image-2'});
 }catch(error){const message=error instanceof Error?error.message:'Glow could not generate that visual.';console.error('[api/glow/visualize]',message);return NextResponse.json({ok:false,error:message},{status:500})}
}
