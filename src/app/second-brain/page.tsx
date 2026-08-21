import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SecondBrainStudio } from '@/components/brain/second-brain-studio';
import { SecondBrainConnectionsSynthesis } from '@/components/brain/second-brain-connections-synthesis';
import { getBrainState } from '@/lib/data/second-brain';

export const dynamic='force-dynamic';

export default async function SecondBrainPage(){
 const session=await auth();
 if(!session?.user?.id)redirect('/sign-in');
 const state=await getBrainState(session.user.id);
 const items=[
  ...state.thoughts.slice(0,30).map(x=>({id:x.id,title:x.title,type:x.kind==='idea'?'idea':'thought',updatedAt:x.updatedAt})),
  ...state.decisions.slice(0,25).map(x=>({id:x.id,title:x.question,type:'decision',updatedAt:x.updatedAt})),
  ...state.loops.slice(0,25).map(x=>({id:x.id,title:x.title,type:'loop',createdAt:x.createdAt})),
  ...state.tasks.slice(0,35).map(x=>({id:x.id,title:x.title,type:'task',updatedAt:x.updatedAt})),
  ...state.goals.slice(0,20).map(x=>({id:x.id,title:x.title,type:'goal',updatedAt:x.updatedAt})),
  ...state.notes.slice(0,30).map(x=>({id:x.id,title:x.title||'Untitled note',type:'note',updatedAt:x.updatedAt})),
 ];
 const recentTitles=[
  ...state.thoughts.map(x=>({title:x.title,at:x.updatedAt})),
  ...state.decisions.map(x=>({title:x.outcome??x.question,at:x.updatedAt})),
  ...state.loops.map(x=>({title:x.title,at:x.closedAt??x.createdAt})),
 ].sort((a,b)=>b.at.getTime()-a.at.getTime()).slice(0,8).map(x=>x.title);
 return <AppShell><SecondBrainStudio initialState={state}/><SecondBrainConnectionsSynthesis items={items} relationships={state.relationships} counts={{decisions:state.decisions.length,ideas:state.thoughts.filter(x=>x.kind==='idea'&&!x.archived).length,openLoops:state.loops.filter(x=>x.status==='open'||x.status==='waiting').length,closedLoops:state.loops.filter(x=>x.status==='closed').length,workspaces:state.workspaces.length}} recentTitles={recentTitles}/></AppShell>;
}
