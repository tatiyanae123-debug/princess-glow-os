import { and, desc, eq, inArray, ne } from 'drizzle-orm';
import { db } from '@/db';
import { notes } from '@/db/schema/notes';
import { tasks } from '@/db/schema/tasks';
import { goals } from '@/db/schema/goals';
import { calendarEvents } from '@/db/schema/calendar-events';
import {
  brainCaptures, brainDecisions, brainMemories, brainOpenLoops, brainPeople,
  brainRelationships, brainThoughts, brainThreads, brainWorkspaces,
} from '@/db/schema/second-brain';

export function slugify(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).slice(0,6).join('-')||'thread'}
export function titleFromText(value:string){const clean=value.replace(/\s+/g,' ').trim();return clean.length>72?`${clean.slice(0,69)}…`:clean||'Untitled thought'}

const STOP=new Set(['about','after','again','also','because','been','before','could','from','have','into','just','like','maybe','more','need','really','should','that','their','then','there','these','they','thing','this','want','what','when','where','which','with','would','your']);
export function keywords(text:string){return [...new Set((text.toLowerCase().match(/[a-z][a-z'-]{3,}/g)??[]).filter(w=>!STOP.has(w)))].slice(0,12)}

export function triageText(text:string){
 const parts=text.split(/(?:\n+|[.!?]+\s+)/).map(s=>s.trim()).filter(Boolean);
 return parts.slice(0,30).map(part=>{
  const low=part.toLowerCase();
  let kind='note',confidence=.62;
  if(/\b(i need to|need to|have to|remember to|buy |email |call |send |book |schedule |finish |do )\b/.test(low)){kind='task';confidence=.86}
  else if(/\b(should i|decide|decision|whether|not sure if|which .* should)\b/.test(low)){kind='decision';confidence=.82}
  else if(/\b(maybe|idea|what if|could create|thinking about|i want to try)\b/.test(low)){kind='idea';confidence=.78}
  else if(/\b(waiting|waiting on|hear back|reply|response|follow up)\b/.test(low)){kind='loop';confidence=.8}
  else if(/\b(remember that|important to remember|i prefer|i always|long-term)\b/.test(low)){kind='memory';confidence=.74}
  return {kind,text:titleFromText(part),confidence};
 });
}

export async function getBrainState(userId:string){
 const [captures,threads,thoughts,decisions,loops,people,memories,relationships,workspaces,userNotes,userTasks,userGoals,userEvents]=await Promise.all([
  db.select().from(brainCaptures).where(eq(brainCaptures.userId,userId)).orderBy(desc(brainCaptures.createdAt)).limit(100),
  db.select().from(brainThreads).where(eq(brainThreads.userId,userId)).orderBy(desc(brainThreads.lastSeenAt)).limit(100),
  db.select().from(brainThoughts).where(and(eq(brainThoughts.userId,userId),eq(brainThoughts.archived,false))).orderBy(desc(brainThoughts.updatedAt)).limit(150),
  db.select().from(brainDecisions).where(eq(brainDecisions.userId,userId)).orderBy(desc(brainDecisions.updatedAt)).limit(100),
  db.select().from(brainOpenLoops).where(eq(brainOpenLoops.userId,userId)).orderBy(desc(brainOpenLoops.createdAt)).limit(100),
  db.select().from(brainPeople).where(eq(brainPeople.userId,userId)).orderBy(desc(brainPeople.updatedAt)).limit(80),
  db.select().from(brainMemories).where(eq(brainMemories.userId,userId)).orderBy(desc(brainMemories.updatedAt)).limit(100),
  db.select().from(brainRelationships).where(eq(brainRelationships.userId,userId)).orderBy(desc(brainRelationships.createdAt)).limit(300),
  db.select().from(brainWorkspaces).where(eq(brainWorkspaces.userId,userId)).orderBy(desc(brainWorkspaces.updatedAt)).limit(50),
  db.select().from(notes).where(and(eq(notes.userId,userId),eq(notes.archived,false))).orderBy(desc(notes.updatedAt)).limit(120),
  db.select().from(tasks).where(and(eq(tasks.userId,userId),eq(tasks.archived,false))).orderBy(desc(tasks.updatedAt)).limit(160),
  db.select().from(goals).where(and(eq(goals.userId,userId),eq(goals.archived,false))).orderBy(desc(goals.updatedAt)).limit(80),
  db.select().from(calendarEvents).where(and(eq(calendarEvents.userId,userId),eq(calendarEvents.archived,false))).orderBy(desc(calendarEvents.startAt)).limit(120),
 ]);
 return {captures,threads,thoughts,decisions,loops,people,memories,relationships,workspaces,notes:userNotes,tasks:userTasks,goals:userGoals,calendarEvents:userEvents};
}

export async function createCapture(userId:string,rawText:string,source='second-brain'){
 const detected=triageText(rawText);
 const [row]=await db.insert(brainCaptures).values({userId,rawText,source,status:'inbox',detected}).returning();
 return row;
}

export async function upsertThread(userId:string,title:string){
 const slug=slugify(title);
 const [existing]=await db.select().from(brainThreads).where(and(eq(brainThreads.userId,userId),eq(brainThreads.slug,slug))).limit(1);
 if(existing){const [row]=await db.update(brainThreads).set({mentionCount:existing.mentionCount+1,lastSeenAt:new Date(),updatedAt:new Date()}).where(eq(brainThreads.id,existing.id)).returning();return row}
 const [row]=await db.insert(brainThreads).values({userId,title:titleFromText(title),slug,summary:titleFromText(title)}).returning();return row;
}

export async function addThought(userId:string,input:{title:string;body?:string;kind?:string;captureId?:string|null;threadTitle?:string}){
 const thread=input.threadTitle?await upsertThread(userId,input.threadTitle):null;
 const [row]=await db.insert(brainThoughts).values({userId,threadId:thread?.id??null,title:titleFromText(input.title),body:input.body,kind:input.kind??'thought',sourceCaptureId:input.captureId??null,lifecycle:input.kind==='idea'?'exploring':'captured',maturity:input.kind==='idea'?'seed':'seed'}).returning();return row;
}

export async function addDecision(userId:string,input:{question:string;threadTitle?:string;decisionType?:string}){
 const thread=input.threadTitle?await upsertThread(userId,input.threadTitle):null;
 const [row]=await db.insert(brainDecisions).values({userId,threadId:thread?.id??null,question:titleFromText(input.question),decisionType:input.decisionType??'permanent'}).returning();return row;
}

export async function decide(userId:string,id:string,input:{outcome:string;rationale?:string;decisionType?:string;reviewAt?:Date|null}){
 const [row]=await db.update(brainDecisions).set({outcome:input.outcome,rationale:input.rationale??null,decisionType:input.decisionType??'permanent',reviewAt:input.reviewAt??null,status:'decided',decidedAt:new Date(),updatedAt:new Date()}).where(and(eq(brainDecisions.id,id),eq(brainDecisions.userId,userId))).returning();return row??null;
}

export async function addLoop(userId:string,input:{title:string;loopType?:string;waitingOn?:string;followUpAt?:Date|null;sourceType?:string;sourceId?:string}){
 const [row]=await db.insert(brainOpenLoops).values({userId,title:titleFromText(input.title),loopType:input.loopType??(input.waitingOn?'waiting':'action'),waitingOn:input.waitingOn,followUpAt:input.followUpAt??null,sourceType:input.sourceType,sourceId:input.sourceId}).returning();return row;
}
export async function updateLoop(userId:string,id:string,status:'open'|'waiting'|'closed'|'dropped',waitingOn?:string){const [row]=await db.update(brainOpenLoops).set({status,waitingOn:waitingOn??null,closedAt:status==='closed'||status==='dropped'?new Date():null}).where(and(eq(brainOpenLoops.id,id),eq(brainOpenLoops.userId,userId))).returning();return row??null}

export async function addPerson(userId:string,name:string,context?:string){const normalized=name.toLowerCase().replace(/\s+/g,' ').trim();const [existing]=await db.select().from(brainPeople).where(and(eq(brainPeople.userId,userId),eq(brainPeople.normalizedName,normalized))).limit(1);if(existing){const [row]=await db.update(brainPeople).set({context:context??existing.context,updatedAt:new Date()}).where(eq(brainPeople.id,existing.id)).returning();return row}const [row]=await db.insert(brainPeople).values({userId,name:name.trim(),normalizedName:normalized,context}).returning();return row}
export async function addMemory(userId:string,input:{title:string;content:string;memoryType?:string;sourceType?:string;sourceId?:string;reason?:string}){const [row]=await db.insert(brainMemories).values({userId,title:titleFromText(input.title),content:input.content,memoryType:input.memoryType??'important_fact',sourceType:input.sourceType,sourceId:input.sourceId,reason:input.reason}).returning();return row}
export async function forgetMemory(userId:string,id:string){const [row]=await db.update(brainMemories).set({status:'forgotten',updatedAt:new Date()}).where(and(eq(brainMemories.id,id),eq(brainMemories.userId,userId))).returning();return row??null}

export async function connect(userId:string,input:{fromType:string;fromId:string;toType:string;toId:string;relation:string;reason?:string}){const [row]=await db.insert(brainRelationships).values({userId,...input,confidence:1}).onConflictDoNothing().returning();return row??null}
export async function archiveThought(userId:string,id:string){const [row]=await db.update(brainThoughts).set({archived:true,lifecycle:'archived',updatedAt:new Date()}).where(and(eq(brainThoughts.id,id),eq(brainThoughts.userId,userId))).returning();return row??null}
export async function updateThoughtLifecycle(userId:string,id:string,lifecycle:string){const [row]=await db.update(brainThoughts).set({lifecycle,updatedAt:new Date()}).where(and(eq(brainThoughts.id,id),eq(brainThoughts.userId,userId))).returning();return row??null}
export async function updateIdeaMaturity(userId:string,id:string,maturity:string){const [row]=await db.update(brainThoughts).set({maturity,lifecycle:maturity==='project'?'actioned':'exploring',updatedAt:new Date()}).where(and(eq(brainThoughts.id,id),eq(brainThoughts.userId,userId))).returning();return row??null}

export async function createThinkingWorkspace(userId:string,input:{question:string;criteria?:string[]}){
 const q=titleFromText(input.question);const [row]=await db.insert(brainWorkspaces).values({userId,title:q,question:input.question,criteria:input.criteria??['Impact','Time','Energy','Cost','Fit'],unknowns:['What information would change the decision?']}).returning();return row;
}
export async function updateWorkspace(userId:string,id:string,input:{outcome?:string;status?:string}){const [row]=await db.update(brainWorkspaces).set({...input,updatedAt:new Date()}).where(and(eq(brainWorkspaces.id,id),eq(brainWorkspaces.userId,userId))).returning();return row??null}

export async function acceptCaptureItems(userId:string,captureId:string,kinds:string[]){
 const [capture]=await db.select().from(brainCaptures).where(and(eq(brainCaptures.id,captureId),eq(brainCaptures.userId,userId))).limit(1);if(!capture)return null;
 const detected=(capture.detected??[]).filter(x=>kinds.includes(x.kind));
 for(const item of detected){
  if(item.kind==='task') await db.insert(tasks).values({userId,title:item.text,source:'second-brain'});
  else if(item.kind==='decision') await addDecision(userId,{question:item.text,threadTitle:item.text});
  else if(item.kind==='idea') await addThought(userId,{title:item.text,kind:'idea',captureId,threadTitle:item.text});
  else if(item.kind==='loop') await addLoop(userId,{title:item.text});
  else if(item.kind==='memory') await addMemory(userId,{title:item.text,content:item.text,sourceType:'capture',sourceId:captureId,reason:'Explicitly approved from Clear My Head'});
  else await addThought(userId,{title:item.text,kind:'thought',captureId});
 }
 const [updated]=await db.update(brainCaptures).set({status:'processed',processedAt:new Date()}).where(eq(brainCaptures.id,captureId)).returning();return updated;
}

export async function deriveBrainAnswer(state:Awaited<ReturnType<typeof getBrainState>>,query:string){
 const q=query.toLowerCase();
 const sourceHits:Array<{type:string;id:string;title:string;detail:string}>=[];
 const terms=keywords(query);
 const score=(text:string)=>terms.reduce((s,t)=>s+(text.toLowerCase().includes(t)?1:0),0);
 const push=(type:string,id:string,title:string,detail:string)=>{if(score(`${title} ${detail}`)>0)sourceHits.push({type,id,title,detail})};
 state.notes.forEach(x=>push('Note',x.id,x.title,x.content??''));
 state.tasks.forEach(x=>push('Task',x.id,x.title,x.description??x.status));
 state.goals.forEach(x=>push('Goal',x.id,x.title,x.description??x.status));
 state.decisions.forEach(x=>push('Decision',x.id,x.question,`${x.outcome??''} ${x.rationale??''}`));
 state.thoughts.forEach(x=>push(x.kind==='idea'?'Idea':'Thought',x.id,x.title,x.body??''));
 state.loops.forEach(x=>push('Open loop',x.id,x.title,`${x.status} ${x.waitingOn??''}`));
 if(/waiting|waiting on/.test(q)){state.loops.filter(x=>x.status==='waiting'||Boolean(x.waitingOn)).forEach(x=>sourceHits.unshift({type:'Open loop',id:x.id,title:x.title,detail:x.waitingOn?`Waiting on ${x.waitingOn}`:'Waiting'}))}
 if(/decid|why did i/.test(q)){state.decisions.filter(x=>x.status==='decided').forEach(x=>sourceHits.unshift({type:'Decision',id:x.id,title:x.question,detail:`${x.outcome??''}${x.rationale?` — ${x.rationale}`:''}`}))}
 if(/idea/.test(q)){state.thoughts.filter(x=>x.kind==='idea').forEach(x=>sourceHits.unshift({type:'Idea',id:x.id,title:x.title,detail:x.maturity}))}
 const unique=[...new Map(sourceHits.map(x=>[`${x.type}:${x.id}`,x])).values()].slice(0,8);
 if(!unique.length)return{answer:'I could not find a confident match in your stored Second Brain data yet.',sources:[]};
 return{answer:unique.slice(0,3).map(x=>x.title).join(' · '),sources:unique};
}
