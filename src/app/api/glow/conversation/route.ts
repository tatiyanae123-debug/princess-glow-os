import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { buildPersonalContext, type PersonalContext } from '@/lib/intelligence/context';
import { buildAdaptiveSurface, buildLifeIntelligence, type LifeIntelligenceState } from '@/lib/intelligence/life-intelligence';

type ChatMessage={role:'user'|'assistant';content:string};
type QuickAction={label:string;href:string};

export const dynamic='force-dynamic';
export const runtime='nodejs';
export const maxDuration=60;

function compactContext(context:PersonalContext,state:LifeIntelligenceState){
 return {
  now:context.generatedAt.toISOString(),dayPart:context.dayPart,today:context.todayLabel,focusScore:context.focusScore,
  lifeRead:state.read,availableMinutes:state.availableMinutes,pulse:state.pulse,predictions:state.predictions,
  executive:state.executive,
  nextEvent:context.nextEvent?{title:context.nextEvent.title,startAt:context.nextEvent.startAt.toISOString(),allDay:context.nextEvent.allDay}:null,
  todaysEvents:context.todaysEvents.slice(0,10).map(item=>({title:item.title,startAt:item.startAt.toISOString(),allDay:item.allDay})),
  unfinishedTasks:context.unfinishedTasks.slice(0,12).map(item=>({title:item.title,priority:item.priority,dueDate:item.dueDate?.toISOString()??null})),
  overdueTasks:context.overdueTasks.slice(0,8).map(item=>({title:item.title,dueDate:item.dueDate.toISOString()})),
  reminders:context.appleReminders.filter(item=>!item.completed).slice(0,15).map(item=>({title:item.title,dueAt:item.dueAt?.toISOString()??null,essential:item.essential,triggerType:item.triggerType,domain:item.domain})),
  habits:context.habits.map(item=>({name:item.name,completedToday:item.completedToday})),
  routines:context.routinesForToday.map(item=>({name:item.name,timeOfDay:item.timeOfDay})),
  goals:context.activeGoals.slice(0,8).map(item=>item.title),
  recommendations:context.recommendations.slice(0,6).map(item=>({title:item.title,reason:item.reason,priority:item.priority,href:item.href})),
  attention:context.attentionSignals.slice(0,6).map(item=>({label:item.label,detail:item.detail,level:item.level,href:item.href})),
  patterns:context.patterns.slice(0,6).map(item=>({title:item.title,detail:item.detail,href:item.href})),
 };
}

function actionsFor(text:string,context:PersonalContext):QuickAction[]{
 const q=text.toLowerCase();const actions:QuickAction[]=[];const add=(label:string,href:string)=>{if(!actions.some(item=>item.href===href))actions.push({label,href})};
 if(/calendar|event|appointment|schedule|time|free/.test(q))add('Open Calendar','/calendar');
 if(/task|to.?do|finish|priority|overdue/.test(q))add('Open Tasks','/tasks');
 if(/remind|reminder/.test(q))add('Open Reminders','/reminders');
 if(/workout|gym|exercise|fitness/.test(q))add('Open Fitness','/fitness');
 if(/routine|morning|night|reset/.test(q))add('Open Routines','/routines');
 if(/habit/.test(q))add('Open Habits','/habits');
 if(/goal/.test(q))add('Open Goals','/goals');
 if(/food|meal|grocery|eat|cook/.test(q))add('Open Food','/food');
 if(/beauty|skin|makeup|get ready/.test(q))add('Open Beauty','/beauty');
 if(/hair/.test(q))add('Open Hair','/hair');
 if(/money|finance|spend|budget/.test(q))add('Open Money','/finance');
 if(/note|remember|memory/.test(q))add('Open Memory','/memory');
 if(/add|create|capture|write down|log/.test(q))add('Add Anything','/intake');
 if(!actions.length&&context.recommendations[0])add('Do the next best thing',context.recommendations[0].href);
 if(actions.length<2)add('See Today','/today');return actions.slice(0,4);
}

function fallbackReply(text:string,context:PersonalContext,state:LifeIntelligenceState){
 const q=text.toLowerCase();const next=context.recommendations[0];const event=context.nextEvent;const pressure=context.attentionSignals[0];
 if(/^(hi|hey|hello|good morning|good afternoon|good evening)\b/.test(q)||/how are you/.test(q))return `I’m good. I’m here with you and I’ve got the current Glow state in view. What do you want to figure out?`;
 if(/that(?:'s| is) wrong|not right|you(?:'re| are) wrong|actually|i meant|no,? that/.test(q))return `Got it. I’m treating that as a correction, not as something to argue with. I’ll re-check what Glow can verify, keep your correction as the newest information, and avoid pretending I know anything that the system does not actually show.`;
 if(/what if|if i (?:don'?t|do not|skip|move)|what happens if/.test(q))return `${state.predictions[0]} I’d compare the immediate space you gain against the carryover it creates, rather than treating either choice as automatically better.`;
 if(/what should i do|what do i do|right now|next thing|next hour|what now/.test(q)){if(next)return `I’d do ${next.title} next. ${next.reason}${event&&!event.allDay?` You have about ${state.availableMinutes??0} minutes before ${event.title}, so I’m using that as the boundary.`:''}`;return state.read;}
 if(/ignore|what can wait|simplify|too much|overwhelm/.test(q))return pressure?.level==='high'?`Protect one thing first: ${pressure.label}. ${pressure.detail} Everything lower-risk can wait until that is handled.`:'Nothing is demanding emergency attention. Keep the next fixed commitment and one useful action; the rest can stay optional.';
 if(/life state|life pulse|how is my day|status of my day|how am i doing/.test(q))return `${state.read} ${state.predictions[0]}`;
 if(/why/.test(q)&&next)return `I’m choosing ${next.title} because ${next.reason.toLowerCase()} I’m comparing it against your available time, fixed events, overdue work, reminders, habits, routines, and current pressure signals rather than ranking it in isolation.`;
 return next?`The main thing I’d keep in view is ${next.title}. ${next.reason} Ask me for a decision, a plan, a simulation, or what can wait and I’ll narrow the whole system down.`:`I’m with you. Tell me what you’re deciding, doing, avoiding, or trying to fit in, and I’ll reason across the rest of Glow.`;
}

function extractOutputText(payload:unknown){const p=payload as {output_text?:string;output?:Array<{content?:Array<{type?:string;text?:string}>}>};if(typeof p?.output_text==='string'&&p.output_text.trim())return p.output_text.trim();for(const item of p?.output??[])for(const content of item.content??[])if(content.type==='output_text'&&content.text?.trim())return content.text.trim();return ''}

async function modelReply(messages:ChatMessage[],context:PersonalContext,state:LifeIntelligenceState,key:string){
 if(!key)return null;const life=compactContext(context,state);const transcript=messages.slice(-14).map(message=>`${message.role==='user'?'User':'Glow'}: ${message.content}`).join('\n');
 const instructions=`You are Glow, the unified Life Intelligence inside a personal operating system. Be natural enough that the conversation feels like talking to a highly capable, thoughtful assistant, not a database report.\n\nINTELLIGENCE RULES:\n1. Live Glow context is evidence, not a script. Reason over it before answering.\n2. Never blindly agree with the user. If a statement conflicts with live data, say what Glow can verify and what remains uncertain. A correction from the user becomes the newest conversational fact, but do not fabricate supporting evidence.\n3. If you may be wrong, say so briefly and re-check. Never defend a previous answer just because you said it.\n4. Distinguish FACT, INFERENCE, and ESTIMATE internally. Label predictions or simulations as estimates when surfaced.\n5. Do not dump counts or recite the dashboard unless the user asks for status. Casual conversation should sound casual.\n6. For decisions, prefer: best next move, why it fits now, what can wait, and the next boundary.\n7. Think across Calendar, Tasks, Reminders, Routines, Habits, Goals, attention signals, patterns, and available time as one system.\n8. Consider second-order effects: what gets easier or harder later if this choice changes.\n9. Protect attention. Fewer recommendations are better than a giant list.\n10. Never claim an action was completed, moved, deleted, sent, purchased, scheduled, or logged unless the app confirms it.\n11. Do not invent body state, location, spending, relationships, health information, or preferences that are not present in supplied context. Say unknown when needed.\n12. If the user asks a social question such as 'how are you?', answer socially first. Do not turn every message into productivity coaching.\n13. When the user asks 'what if', reason in scenarios. When they ask 'what can wait', triage. When they ask 'what should I do', give one strongest move unless a true tie exists.\n\nVOICE: warm, concise, intelligent, grounded, conversational. Avoid robotic headings in ordinary replies because the UI can render structured surfaces separately.`;
 const input=`LIVE LIFE STATE\n${JSON.stringify(life)}\n\nRECENT CONVERSATION\n${transcript}\n\nRespond to the latest user message.`;
 try{const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.GLOW_AI_MODEL||'gpt-5.6-luna',instructions,input,max_output_tokens:800})});if(!response.ok)return null;const payload=await response.json();return extractOutputText(payload)||null}catch{return null}
}

export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return NextResponse.json({error:'Unauthorized'},{status:401});let body:{messages?:ChatMessage[];page?:string};try{body=await request.json()}catch{return NextResponse.json({error:'Invalid request'},{status:400})}
 const messages=(body.messages??[]).filter(item=>(item.role==='user'||item.role==='assistant')&&typeof item.content==='string'&&item.content.trim()).slice(-18);const latest=[...messages].reverse().find(item=>item.role==='user')?.content.trim();if(!latest)return NextResponse.json({error:'Message required'},{status:400});
 const context=await buildPersonalContext(session.user.id);const state=buildLifeIntelligence(context);const surface=buildAdaptiveSurface(latest,context,state);
 const augmented=[...messages.slice(0,-1),{role:'user' as const,content:`${latest}${body.page?`\n(Current Glow page: ${body.page})`:''}`}];
 const key=request.headers.get('x-glow-openai-key')?.trim()||process.env.OPENAI_API_KEY?.trim()||'';
 const reply=await modelReply(augmented,context,state,key)??fallbackReply(latest,context,state);
 return NextResponse.json({reply,surface,actions:actionsFor(latest,context),lifeState:{read:state.read,availableMinutes:state.availableMinutes,pulse:state.pulse,predictions:state.predictions.slice(0,2)},meta:{focusScore:context.focusScore,dayPart:context.dayPart,generatedAt:context.generatedAt.toISOString(),model:key?(process.env.GLOW_AI_MODEL||'gpt-5.6-luna'):'glow-local-intelligence'}});
}
