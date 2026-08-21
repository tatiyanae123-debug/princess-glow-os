import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildPersonalContext, type PersonalContext } from '@/lib/intelligence/context';

type ChatMessage={role:'user'|'assistant';content:string};
type QuickAction={label:string;href:string};

export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=60;

function compactContext(context:PersonalContext){
 return {
  now:context.generatedAt.toISOString(),dayPart:context.dayPart,today:context.todayLabel,focusScore:context.focusScore,dailyBrief:context.dailyBrief,
  nextEvent:context.nextEvent?{title:context.nextEvent.title,startAt:context.nextEvent.startAt.toISOString(),allDay:context.nextEvent.allDay}:null,
  todaysEvents:context.todaysEvents.slice(0,8).map(item=>({title:item.title,startAt:item.startAt.toISOString(),allDay:item.allDay})),
  unfinishedTasks:context.unfinishedTasks.slice(0,10).map(item=>({title:item.title,priority:item.priority,dueDate:item.dueDate?.toISOString()??null})),
  overdueTasks:context.overdueTasks.slice(0,6).map(item=>({title:item.title,dueDate:item.dueDate.toISOString()})),
  reminders:context.appleReminders.filter(item=>!item.completed).slice(0,12).map(item=>({title:item.title,dueAt:item.dueAt?.toISOString()??null,essential:item.essential,triggerType:item.triggerType,domain:item.domain})),
  habits:context.habits.map(item=>({name:item.name,completedToday:item.completedToday})),routines:context.routinesForToday.map(item=>({name:item.name,timeOfDay:item.timeOfDay})),goals:context.activeGoals.slice(0,6).map(item=>item.title),
  recommendations:context.recommendations.slice(0,5).map(item=>({title:item.title,reason:item.reason,priority:item.priority,href:item.href})),attention:context.attentionSignals.slice(0,5).map(item=>({label:item.label,detail:item.detail,level:item.level,href:item.href})),patterns:context.patterns.slice(0,5).map(item=>({title:item.title,detail:item.detail,href:item.href})),
 };
}

function actionsFor(text:string,context:PersonalContext):QuickAction[]{
 const q=text.toLowerCase();const actions:QuickAction[]=[];const add=(label:string,href:string)=>{if(!actions.some(item=>item.href===href))actions.push({label,href})};
 if(/calendar|event|appointment|schedule|time|free/.test(q))add('Open Calendar','/calendar');if(/task|to.?do|finish|priority|overdue/.test(q))add('Open Tasks','/tasks');if(/remind|reminder/.test(q))add('Open Reminders','/reminders');if(/workout|gym|exercise|fitness/.test(q))add('Open Fitness','/fitness');if(/routine|morning|night|reset/.test(q))add('Open Routines','/routines');if(/habit/.test(q))add('Open Habits','/habits');if(/goal/.test(q))add('Open Goals','/goals');if(/food|meal|grocery|eat/.test(q))add('Open Food','/food');if(/beauty|skin|makeup/.test(q))add('Open Beauty','/beauty');if(/hair/.test(q))add('Open Hair','/hair');if(/money|finance|spend|budget/.test(q))add('Open Money','/finance');if(/note|remember|memory/.test(q))add('Open Memory','/memory');if(/add|create|capture|write down|log/.test(q))add('Add Anything','/intake');if(!actions.length&&context.recommendations[0])add('Do the next best thing',context.recommendations[0].href);if(actions.length<2)add('See Today','/today');return actions.slice(0,4);
}

function fallbackReply(text:string,context:PersonalContext){
 const q=text.toLowerCase();const next=context.recommendations[0];const event=context.nextEvent;const pressure=context.attentionSignals[0];
 if(/what should i do|what do i do|right now|next thing|next hour/.test(q)){if(next)return `Right now, I’d do “${next.title}.” ${next.reason} ${event?`Your next calendar item is “${event.title}” at ${event.startAt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}, so I’m protecting the time around it.`:'You do not have an upcoming calendar conflict showing right now.'}`;return 'Your system looks fairly clear right now. I’d use the next block for one small task that reduces friction later, then stop instead of filling the time just because it is open.'}
 if(/ignore|skip|not do|cancel/.test(q))return pressure?.level==='high'?`Do not ignore “${pressure.label}.” ${pressure.detail} Everything below that can be treated as flexible until this pressure is handled.`:'There is no major pressure signal right now. Keep the day light: protect the next commitment and your highest-value task, and let lower-value extras stay optional.';
 if(/plan.*day|today|how.*day/.test(q))return `${context.dailyBrief} ${next?`The best first move is “${next.title}” because ${next.reason.toLowerCase()}`:''}${pressure?` The main thing I’m watching is ${pressure.label.toLowerCase()}.`:''}`;
 if(/overwhelm|too much|simplify/.test(q))return `I’m simplifying this to three layers: protect the next fixed commitment, handle one genuinely important item, and let the rest become optional. ${pressure?`The strongest pressure signal is ${pressure.label.toLowerCase()}.`:''}`;
 if(/why/.test(q)&&next)return `I’m prioritizing “${next.title}” because ${next.reason.toLowerCase()} I’m also comparing it against your calendar, reminders, routines, habits, and overdue work instead of looking at one page alone.`;
 return `${context.dailyBrief} ${next?`If you want one decision from me, I’d choose “${next.title}.” ${next.reason}`:'Tell me what you are deciding between and I’ll narrow it down using the rest of your Glow data.'}`;
}

function extractOutputText(payload:unknown){const p=payload as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};if(typeof p?.output_text==='string'&&p.output_text.trim())return p.output_text.trim();for(const item of p?.output??[])for(const content of item.content??[])if(content.type==='output_text'&&content.text?.trim())return content.text.trim();return ''}

async function modelReply(messages:ChatMessage[],context:PersonalContext,key:string){
 if(!key)return null;const life=compactContext(context);const transcript=messages.slice(-12).map(message=>`${message.role==='user'?'User':'Glow'}: ${message.content}`).join('\n');
 const instructions=`You are Glow, the conversational intelligence layer inside a personal life operating system. Speak naturally, warmly, and directly. Sound like a highly capable human assistant, not a dashboard, robot, therapist, or motivational coach. Keep most answers to 2-5 short paragraphs unless the user asks for detail. Use the supplied live life context as the source of truth. Connect Calendar, Tasks, Reminders, Routines, Habits, Goals, and other signals instead of treating them separately. The core question is: what matters now, what realistically fits, and what can be ignored? Explain why when useful. Label predictions as estimates. Never say you completed, moved, deleted, sent, or scheduled something unless the app actually confirms that action. Never invent personal facts outside the supplied context. If the user is overwhelmed, simplify choices rather than adding more.`;
 const input=`LIVE GLOW CONTEXT\n${JSON.stringify(life)}\n\nRECENT CONVERSATION\n${transcript}\n\nRespond to the user's latest message as Glow.`;
 try{const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.GLOW_AI_MODEL||'gpt-5.6-luna',instructions,input,max_output_tokens:700})});if(!response.ok)return null;const payload=await response.json();return extractOutputText(payload)||null}catch{return null}
}

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});let body:{messages?:ChatMessage[];page?:string};try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 const messages=(body.messages??[]).filter(item=>(item.role==='user'||item.role==='assistant')&&typeof item.content==='string'&&item.content.trim()).slice(-16);const latest=[...messages].reverse().find(item=>item.role==='user')?.content.trim();if(!latest)return NextResponse.json({error:'Message required'},{status:400});
 const context=await buildPersonalContext(session.user.id);const augmented=[...messages.slice(0,-1),{role:'user' as const,content:`${latest}${body.page?`\n(Current Glow page: ${body.page})`:''}`}];const key=request.headers.get('x-glow-openai-key')?.trim()||process.env.OPENAI_API_KEY?.trim()||'';const reply=await modelReply(augmented,context,key)??fallbackReply(latest,context);
 return NextResponse.json({reply,actions:actionsFor(latest,context),meta:{focusScore:context.focusScore,dayPart:context.dayPart,generatedAt:context.generatedAt.toISOString(),model:key?(process.env.GLOW_AI_MODEL||'gpt-5.6-luna'):'glow-local-intelligence'}});
}
