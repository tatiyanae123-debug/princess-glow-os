import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SecondBrainStudio } from '@/components/brain/second-brain-studio';
import { SecondBrainConnectionsSynthesis } from '@/components/brain/second-brain-connections-synthesis';
import { getBrainState } from '@/lib/data/second-brain';

export const dynamic='force-dynamic';

function atOrAfter(value:Date,start:Date){return value.getTime()>=start.getTime()}

export default async function SecondBrainPage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 const state=await getBrainState(session.user.id);
 const now=new Date();
 const weekStart=new Date(now);weekStart.setHours(0,0,0,0);weekStart.setDate(weekStart.getDate()-weekStart.getDay());
 const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
 const replayStart=new Date(now);replayStart.setDate(replayStart.getDate()-30);replayStart.setHours(0,0,0,0);
 const items=[
  ...state.thoughts.slice(0,30).map(x=>({id:x.id,title:x.title,type:x.kind==='idea'?'idea':'thought',updatedAt:x.updatedAt})),
  ...state.decisions.slice(0,25).map(x=>({id:x.id,title:x.question,type:'decision',updatedAt:x.updatedAt})),
  ...state.loops.slice(0,25).map(x=>({id:x.id,title:x.title,type:'loop',createdAt:x.createdAt})),
  ...state.tasks.slice(0,35).map(x=>({id:x.id,title:x.title,type:'task',updatedAt:x.updatedAt})),
  ...state.goals.slice(0,20).map(x=>({id:x.id,title:x.title,type:'goal',updatedAt:x.updatedAt})),
  ...state.notes.slice(0,30).map(x=>({id:x.id,title:x.title||'Untitled note',type:'note',updatedAt:x.updatedAt})),
  ...state.people.slice(0,20).map(x=>({id:x.id,title:x.name,type:'person',updatedAt:x.updatedAt})),
  ...state.memories.filter(x=>x.status==='active').slice(0,20).map(x=>({id:x.id,title:x.title,type:'memory',createdAt:x.createdAt})),
  ...state.workspaces.slice(0,15).map(x=>({id:x.id,title:x.question,type:'workspace',createdAt:x.createdAt})),
 ];
 const replayTitles=[
  ...state.thoughts.filter(x=>atOrAfter(x.updatedAt,replayStart)).map(x=>({title:x.title,at:x.updatedAt})),
  ...state.decisions.filter(x=>atOrAfter(x.updatedAt,replayStart)).map(x=>({title:x.outcome??x.question,at:x.updatedAt})),
  ...state.loops.filter(x=>atOrAfter(x.closedAt??x.createdAt,replayStart)).map(x=>({title:x.title,at:x.closedAt??x.createdAt})),
 ].sort((a,b)=>b.at.getTime()-a.at.getTime()).slice(0,8).map(x=>x.title);
 const monthTitles=[
  ...state.thoughts.filter(x=>atOrAfter(x.updatedAt,monthStart)).map(x=>({title:x.title,at:x.updatedAt})),
  ...state.decisions.filter(x=>atOrAfter(x.updatedAt,monthStart)).map(x=>({title:x.outcome??x.question,at:x.updatedAt})),
  ...state.loops.filter(x=>atOrAfter(x.closedAt??x.createdAt,monthStart)).map(x=>({title:x.title,at:x.closedAt??x.createdAt})),
 ].sort((a,b)=>b.at.getTime()-a.at.getTime()).slice(0,8).map(x=>x.title);
 const weeklyCounts={
  decisions:state.decisions.filter(x=>atOrAfter(x.createdAt,weekStart)).length,
  ideas:state.thoughts.filter(x=>x.kind==='idea'&&atOrAfter(x.createdAt,weekStart)).length,
  openLoops:state.loops.filter(x=>x.status==='open'||x.status==='waiting').length,
  closedLoops:state.loops.filter(x=>x.status==='closed'&&Boolean(x.closedAt)&&atOrAfter(x.closedAt as Date,weekStart)).length,
  workspaces:state.workspaces.filter(x=>atOrAfter(x.createdAt,weekStart)).length,
 };
 return <AppShell><SecondBrainStudio initialState={state}/><SecondBrainConnectionsSynthesis items={items} relationships={state.relationships} weeklyCounts={weeklyCounts} monthTitles={monthTitles} replayTitles={replayTitles}/></AppShell>;
}
