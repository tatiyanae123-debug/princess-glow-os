'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronRight, Lightbulb, Plus, Sparkles } from 'lucide-react';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import styles from './plan-reference-rooms.module.css';

export type PlanStudioEvent = { id:string; title:string; startAt:string; endAt:string|null; allDay:boolean };
export type PlanPlanningItem = { id:string; title:string; level:string; focus:string|null; progress:number; startsAt:string|null; endsAt:string|null };
type StudioMode = 'Day'|'Week'|'Month'|'Scenarios'|'Guided'|'Auto Draft'|'Manual';

const DAY = 86_400_000;
function startOfWeek(date=new Date()){const start=new Date(date);const offset=(start.getDay()+6)%7;start.setHours(0,0,0,0);start.setDate(start.getDate()-offset);return start}
function dayIndexFor(date:Date,weekStart:Date){return Math.floor((new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime()-weekStart.getTime())/DAY)}
function fmt(value:Date){return value.toLocaleDateString('en-US',{month:'short',day:'numeric'})}

export function PlanPlanningStudioReferenceV4({events,planning}:{events:PlanStudioEvent[];planning:PlanPlanningItem[]}){
  const [horizon,setHorizon]=useState<PlanHorizon>('week');
  const [mode,setMode]=useState<StudioMode>('Week');
  const [toast,setToast]=useState<string|null>(null);
  const weekStart=useMemo(()=>startOfWeek(),[]);
  const weekEnd=new Date(weekStart.getTime()+6*DAY);
  const days=Array.from({length:7},(_,index)=>new Date(weekStart.getTime()+index*DAY));
  const weekEvents=events.filter((event)=>{const date=new Date(event.startAt);return date>=weekStart&&date<new Date(weekStart.getTime()+7*DAY)});
  const scenarios=[['Scenario A','Productive Week','Focus on deep work'],['Scenario B','Balanced Week','Work + wellbeing'],['Scenario C','Creative Push','Explore new ideas']];
  const askGlow=(intent:string)=>document.dispatchEvent(new CustomEvent('glow:open',{detail:{context:{room:'Plan · Planning Studio',intent}}}));
  return <PlanInstrumentChrome title="PLAN · PLANNING STUDIO" subtitle="Explore possibilities. Arrange. Refine. Nothing becomes real until you approve." activeInstrument="Calendar" horizon={horizon} onHorizonChange={setHorizon} centerLabel={`${fmt(weekStart)} – ${fmt(weekEnd)}`}>
    <section className={`${styles.stage} studio-reference-v4`} aria-label="Planning Studio simulation">
      <div className="studio-modes-v4">{(['Day','Week','Month','Scenarios','Guided','Auto Draft','Manual'] as StudioMode[]).map(item=><button key={item} className={mode===item?'active':''} onClick={()=>{setMode(item);if(item==='Auto Draft')askGlow('Draft a plan from verified commitments')}}><span>{item==='Scenarios'?<Sparkles size={14}/>:item==='Guided'?<Lightbulb size={14}/>:<CalendarDays size={14}/>}</span><b>{item}</b><small>{item==='Day'?'Plan today':item==='Week'?'Map the week':item==='Month'?'See the big picture':item==='Scenarios'?'Compare paths':item==='Guided'?'Get suggestions':item==='Auto Draft'?'Let Glow propose':'Arrange freely'}</small></button>)}</div>
      <div className="studio-board-v4">
        <div className="studio-board-head-v4"><strong>‹ &nbsp; {fmt(weekStart)} – {fmt(weekEnd)}, {weekEnd.getFullYear()} &nbsp; ›</strong><span>This Week</span></div>
        <div className="studio-time-axis-v4">{['6AM','9AM','12PM','3PM','6PM','9PM'].map(t=><span key={t}>{t}</span>)}</div>
        <div className="studio-week-grid-v4">{days.map((day,index)=><div className="studio-day-v4" key={day.toISOString()}><strong>{day.toLocaleDateString('en-US',{weekday:'short'})}<small>{fmt(day)}</small></strong>{weekEvents.filter(event=>dayIndexFor(new Date(event.startAt),weekStart)===index).slice(0,6).map((event,eventIndex)=>{const start=new Date(event.startAt);const end=event.endAt?new Date(event.endAt):new Date(start.getTime()+60*60_000);const top=event.allDay?8:Math.max(10,Math.min(84,((start.getHours()-6)+start.getMinutes()/60)/15*100));const height=event.allDay?9:Math.max(8,Math.min(25,(end.getTime()-start.getTime())/3600000/15*100));const state=eventIndex%3===0?'tentative':eventIndex%3===1?'committed':'draft';return <button key={event.id} className={`studio-event-v4 ${state}`} style={{top:`${top}%`,height:`${height}%`}} onClick={()=>setToast(`${event.title} selected for simulation`)}><b>{event.title}</b><small>{event.allDay?'All day':start.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</small></button>})}</div>)}</div>
        <span className="studio-orbit-v4 orbit-1"/><span className="studio-orbit-v4 orbit-2"/><span className="studio-bead-v4 b1"/><span className="studio-bead-v4 b2"/><span className="studio-bead-v4 b3"/>
      </div>
      <div className="ideas-pool-v4"><div className="ideas-title-v4">Ideas Pool <span>{planning.length}</span></div>{planning.slice(0,4).map(item=><div key={item.id}><i/><span>{item.title}<small>{item.level}</small></span></div>)}<button onClick={()=>askGlow('Capture a new planning idea')}>+ Add idea</button></div>
      <div className="scenario-row-v4">{scenarios.map(([label,title,subtitle],index)=><article key={label}><small>{label}</small><strong>{title}</strong><span>{subtitle}</span><div className={`scenario-wave-v4 wave-${index+1}`}/><p>{weekEvents.length} events · {planning.length} goals</p><button onClick={()=>askGlow(`Simulate ${title}`)}>View</button></article>)}<button className="create-scenario-v4" onClick={()=>askGlow('Create a new planning scenario')}><Plus/><span>Create scenario</span></button></div>
      <aside className="studio-side-v4"><div className="studio-question-v4">What if I moved<br/>this to Friday?</div><span className="studio-big-pearl-v4"/><button onClick={()=>askGlow('Simulate moving an event to Friday')}>Ask Glow to simulate</button>{toast?<div className="studio-toast-v4"><Check size={13}/><span><b>Event ready</b><small>{toast}</small></span></div>:null}<div className="studio-legend-v4"><span><i className="committed"/>Committed<small>Will happen</small></span><span><i className="draft"/>Draft<small>Needs review</small></span><span><i className="tentative"/>Tentative<small>Possible</small></span></div></aside>
      <div className="studio-bottom-v4"><article><h3><Lightbulb size={13}/> Guided Planning <span>3/5</span></h3><p>What would make this week feel successful?</p><button onClick={()=>askGlow('Guide my weekly planning')}>Share your thoughts… <ChevronRight size={13}/></button></article><article><h3><Sparkles size={13}/> Auto Draft</h3><p>Glow can create a draft based on your goals, verified commitments, and preferences.</p><button onClick={()=>askGlow('Generate a draft week')}>✦ Generate draft</button></article><article><h3>◉ Comparison</h3><p>Compare scenarios side by side.</p><div className="comparison-lines-v4"/><button onClick={()=>setMode('Scenarios')}>Open comparison</button></article><button className="studio-approve-v4" onClick={()=>setToast('No calendar changes are applied until you approve a concrete proposal.')}><Check size={13}/> Approve & Add to Calendar</button></div>
    </section>
  </PlanInstrumentChrome>
}
