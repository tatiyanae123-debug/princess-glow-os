'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Plus, Sparkles } from 'lucide-react';
import { GoalsRouteExperience } from '@/components/goals/goals-route-experience';
import type { Goal } from '@/lib/types';

type Tab='active'|'completed'|'all';
const photos=['linear-gradient(135deg,#d9c1a7,#8f7d6b)','linear-gradient(135deg,#ded8cf,#b7ae9d)','linear-gradient(135deg,#c9d0bd,#8b9b7f)','linear-gradient(135deg,#c9b8aa,#7b7068)'];
function dateLabel(goal:Goal){if(!goal.targetDate)return 'No target date';const d=goal.targetDate instanceof Date?goal.targetDate:new Date(goal.targetDate);return d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}

export function Batch5GoalsView({goals}:{goals:Goal[]}){
 const [tab,setTab]=useState<Tab>('active');
 const list=useMemo(()=>goals.filter(g=>tab==='all'?true:tab==='completed'?(g.status==='achieved'||g.progress>=100):!(g.status==='achieved'||g.status==='abandoned'||g.progress>=100)),[goals,tab]);
 return <div className="batch5-goals-root">
  <div className="batch5-page-header"><div><p className="batch5-eyebrow">Goals</p><h1 className="glow-display">Goals</h1><p>Your future, designed by you.</p></div><Link href="/goals?new=1" className="batch5-add"><Plus size={12}/> New Goal</Link></div>
  <div className="batch5-goal-tabs"><button onClick={()=>setTab('active')} className={tab==='active'?'active':''}>Active Goals</button><button onClick={()=>setTab('completed')} className={tab==='completed'?'active':''}>Completed</button><button onClick={()=>setTab('all')} className={tab==='all'?'active':''}>All Goals</button></div>
  <div className="batch5-goal-list">{list.length?list.map((goal,index)=><Link key={goal.id} href={`/goals?goalId=${goal.id}`} className="batch5-goal-row"><div className="batch5-goal-photo" style={{background:photos[index%photos.length]}}/><div className="batch5-goal-copy"><h2>{goal.title}</h2><p>{goal.description || `${goal.category} goal`}</p><div className="batch5-goal-progress"><div><i style={{width:`${Math.min(100,Math.max(0,goal.progress))}%`}}/></div><span>{goal.progress}%</span></div></div><div className="batch5-goal-meta"><span><small>Target Date</small>{dateLabel(goal)}</span><span><small>Next Step</small>{goal.progress>=100?'Celebrate & reflect':'Continue progress'}</span></div><ArrowRight size={14}/></Link>):<div className="batch5-card batch5-empty">No goals in this view yet.</div>}</div>
  <div className="batch5-goal-insight"><Sparkles size={16}/><div><strong>Glow Insight</strong><p>{goals.length?'You make more progress when goals stay visible and connected to small weekly actions.':'Create your first goal and Glow will keep the destination visible.'}</p></div><Link href="/brain">View insights</Link></div>
  <GoalsRouteExperience initialGoals={goals} showManager={false}/>
 </div>
}
